/**
 * c07: MCP Protocol 示例代码
 *
 * 最小化的 MCP 客户端实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

interface JSONRPCMessage {
  jsonrpc: '2.0'
  id?: string | number
  method?: string
  params?: any
  result?: any
  error?: { code: number; message: string; data?: any }
}

interface MCPToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

interface ServerCapabilities {
  tools?: { listChanged?: boolean }
  resources?: { subscribe?: boolean; listChanged?: boolean }
  prompts?: { listChanged?: boolean }
}

// ============================================
// 2. 传输层接口
// ============================================

interface Transport {
  send(message: JSONRPCMessage): void
  onMessage(handler: (message: JSONRPCMessage) => void): void
  close(): void
}

// ============================================
// 3. Stdio 传输实现
// ============================================

class StdioTransport implements Transport {
  private messageHandler?: (message: JSONRPCMessage) => void
  private messageId = 0

  constructor(config: { command: string; args?: string[] }) {
    console.log(`[StdioTransport] Would start: ${config.command} ${(config.args || []).join(' ')}`)
    // 实际实现会使用 child_process.spawn
  }

  send(message: JSONRPCMessage): void {
    const id = message.id ?? ++this.messageId
    console.log(`[StdioTransport] Sending message ${id}`)
    // 实际实现会写入子进程 stdin
  }

  onMessage(handler: (message: JSONRPCMessage) => void): void {
    this.messageHandler = handler
    // 实际实现会监听子进程 stdout
  }

  close(): void {
    console.log(`[StdioTransport] Closing connection`)
    // 实际实现会终止子进程
  }
}

// ============================================
// 4. SSE 传输实现
// ============================================

class SSETransport implements Transport {
  private messageHandler?: (message: JSONRPCMessage) => void
  private messageId = 0

  constructor(config: { url: string; headers?: Record<string, string> }) {
    console.log(`[SSETransport] Connecting to: ${config.url}`)
    // 实际实现会创建 EventSource 或 fetch
  }

  send(message: JSONRPCMessage): void {
    const id = message.id ?? ++this.messageId
    console.log(`[SSETransport] Sending POST request ${id}`)
    // 实际实现会 fetch POST
  }

  onMessage(handler: (message: JSONRPCMessage) => void): void {
    this.messageHandler = handler
    // 实际实现会监听 SSE 事件
  }

  close(): void {
    console.log(`[SSETransport] Closing connection`)
  }
}

// ============================================
// 5. MCP 客户端
// ============================================

interface MCPClientConfig {
  name: string
  version: string
}

class MCPClient {
  private transport: Transport
  private pendingRequests: Map<string | number, {
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = new Map()
  private messageId = 0
  private serverCapabilities?: ServerCapabilities
  private tools: MCPToolDefinition[] = []
  private resources: MCPResource[] = []

  constructor(private config: MCPClientConfig) {}

  async connect(transport: Transport): Promise<void> {
    this.transport = transport

    // 设置消息处理
    transport.onMessage(this.handleMessage.bind(this))

    // 发送初始化请求
    const result = await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      clientInfo: {
        name: this.config.name,
        version: this.config.version,
      },
    })

    this.serverCapabilities = result.capabilities

    // 发送 initialized 通知
    transport.send({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    })

    console.log(`[MCPClient] Connected to server: ${result.serverInfo?.name}`)
  }

  private handleMessage(message: JSONRPCMessage): void {
    // 处理响应
    if (message.id !== undefined && message.result !== undefined) {
      const pending = this.pendingRequests.get(message.id)
      if (pending) {
        pending.resolve(message.result)
        this.pendingRequests.delete(message.id)
      }
    }

    // 处理错误
    if (message.id !== undefined && message.error) {
      const pending = this.pendingRequests.get(message.id)
      if (pending) {
        pending.reject(message.error)
        this.pendingRequests.delete(message.id)
      }
    }
  }

  private async request(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId
      this.pendingRequests.set(id, { resolve, reject })

      this.transport.send({
        jsonrpc: '2.0',
        id,
        method,
        params,
      })

      // 超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Request timeout'))
        }
      }, 30000)
    })
  }

  async listTools(): Promise<MCPToolDefinition[]> {
    const result = await this.request('tools/list')
    this.tools = result.tools || []
    return this.tools
  }

  async callTool(name: string, args: Record<string, any>): Promise<any> {
    return this.request('tools/call', {
      name,
      arguments: args,
    })
  }

  async listResources(): Promise<MCPResource[]> {
    const result = await this.request('resources/list')
    this.resources = result.resources || []
    return this.resources
  }

  async readResource(uri: string): Promise<any> {
    return this.request('resources/read', { uri })
  }

  getCapabilities(): ServerCapabilities | undefined {
    return this.serverCapabilities
  }

  getTools(): MCPToolDefinition[] {
    return this.tools
  }

  close(): void {
    this.transport.close()
  }
}

// ============================================
// 6. 工具转换器 (MCP → Claude Code)
// ============================================

interface ClaudeTool {
  name: string
  description: string
  input_schema: MCPToolDefinition['inputSchema']
  execute: (params: any) => Promise<{ output: string; isError?: boolean }>
}

function createClaudeTool(
  serverName: string,
  mcpTool: MCPToolDefinition,
  client: MCPClient
): ClaudeTool {
  return {
    name: `mcp__${serverName}__${mcpTool.name}`,
    description: mcpTool.description,
    input_schema: mcpTool.inputSchema,
    execute: async (params) => {
      try {
        const result = await client.callTool(mcpTool.name, params)
        return { output: JSON.stringify(result) }
      } catch (error: any) {
        return { output: error.message, isError: true }
      }
    },
  }
}

// ============================================
// 7. MCP 连接管理器
// ============================================

type ServerConfig =
  | { type: 'stdio'; command: string; args?: string[]; env?: Record<string, string> }
  | { type: 'sse'; url: string; headers?: Record<string, string> }
  | { type: 'ws'; url: string }

interface ConnectedServer {
  name: string
  client: MCPClient
  tools: ClaudeTool[]
}

class MCPConnectionManager {
  private servers: Map<string, ConnectedServer> = new Map()

  async connect(name: string, config: ServerConfig): Promise<ConnectedServer> {
    // 检查是否已连接
    const existing = this.servers.get(name)
    if (existing) {
      return existing
    }

    // 创建传输
    let transport: Transport
    switch (config.type) {
      case 'stdio':
        transport = new StdioTransport(config)
        break
      case 'sse':
        transport = new SSETransport(config)
        break
      default:
        throw new Error(`Unsupported transport type`)
    }

    // 创建并连接客户端
    const client = new MCPClient({ name: 'claude-code', version: '1.0.0' })
    await client.connect(transport)

    // 获取工具
    const mcpTools = await client.listTools()

    // 转换为 Claude 工具
    const tools = mcpTools.map(tool =>
      createClaudeTool(name, tool, client)
    )

    const server: ConnectedServer = {
      name,
      client,
      tools,
    }

    this.servers.set(name, server)
    console.log(`[MCPManager] Connected to ${name}, ${tools.length} tools available`)

    return server
  }

  disconnect(name: string): void {
    const server = this.servers.get(name)
    if (server) {
      server.client.close()
      this.servers.delete(name)
      console.log(`[MCPManager] Disconnected from ${name}`)
    }
  }

  getAllTools(): ClaudeTool[] {
    return Array.from(this.servers.values()).flatMap(s => s.tools)
  }

  getServer(name: string): ConnectedServer | undefined {
    return this.servers.get(name)
  }
}

// ============================================
// 8. 演示
// ============================================

async function main() {
  console.log('=== MCP Protocol Demo ===\n')

  const manager = new MCPConnectionManager()

  // 连接到模拟服务器
  console.log('--- Connecting to MCP servers ---\n')

  // 模拟连接 (实际会连接到真实服务器)
  // const github = await manager.connect('github', {
  //   type: 'stdio',
  //   command: 'mcp-server-github',
  // })

  // const postgres = await manager.connect('postgres', {
  //   type: 'stdio',
  //   command: 'mcp-server-postgres',
  // })

  console.log('[Demo] In production, would connect to:')
  console.log('  - github (stdio): mcp-server-github')
  console.log('  - postgres (stdio): mcp-server-postgres')
  console.log('  - api (sse): https://api.example.com/mcp')

  // 模拟工具列表
  const mockTools: ClaudeTool[] = [
    {
      name: 'mcp__github__search_repositories',
      description: 'Search GitHub repositories',
      input_schema: { type: 'object', properties: { query: { type: 'string' } } },
      execute: async (params) => ({ output: `Found repos for: ${params.query}` }),
    },
    {
      name: 'mcp__postgres__query',
      description: 'Execute SQL query',
      input_schema: { type: 'object', properties: { sql: { type: 'string' } } },
      execute: async (params) => ({ output: `Query result for: ${params.sql}` }),
    },
  ]

  console.log('\n--- Available MCP Tools ---')
  for (const tool of mockTools) {
    console.log(`  ${tool.name}: ${tool.description}`)
  }

  // 演示工具调用
  console.log('\n--- Tool Call Demo ---')
  const result = await mockTools[0].execute({ query: 'mcp server' })
  console.log(`Result: ${result.output}`)

  console.log('\n=== Demo Complete ===')
}

main().catch(console.error)