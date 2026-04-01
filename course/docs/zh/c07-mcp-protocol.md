# c07: MCP Protocol (MCP 协议)

`c01 > c02 > c03 > c04 | c05 > c06 > [ c07 ] > c08 | c09 > c10 > c11 > c12`

> *"MCP is the USB of AI tools"* -- 统一协议连接无限可能。
>
> **Harness 层**: MCP -- 外部工具集成的标准接口。

## 问题

AI 工具需要:
- 访问外部数据源 (数据库、API)
- 调用专业服务 (搜索、分析)
- 扩展功能 (自定义工具)
- 标准化集成方式

每个工具单独集成效率低下，需要统一协议。

## 解决方案

MCP (Model Context Protocol) 提供标准化集成:

```
+-------------+     +-------------+     +-------------+
| Claude Code | --> | MCP Client  | --> | MCP Server  |
|   (Host)    |     | (Protocol)  |     |   (Tool)    |
+-------------+     +-------------+     +-------------+
                           |
                    +------+------+
                    |             |
               +----+----+   +----+----+
               | Server  |   | Server  |
               |   A     |   |   B     |
               +---------+   +---------+
```

## 源码分析

### 传输类型

```typescript
// 源码位置: src/services/mcp/types.ts

type Transport =
  | 'stdio'      // 标准输入输出
  | 'sse'        // Server-Sent Events
  | 'sse-ide'    // IDE SSE 连接
  | 'http'       // HTTP 传输
  | 'ws'         // WebSocket
  | 'sdk'        // 内置 SDK
```

### 服务器配置

```typescript
// Stdio 配置 (启动本地进程)
type McpStdioServerConfig = {
  type?: 'stdio'
  command: string
  args?: string[]
  env?: Record<string, string>
}

// SSE 配置 (HTTP 流)
type McpSSEServerConfig = {
  type: 'sse'
  url: string
  headers?: Record<string, string>
  oauth?: OAuthConfig
}

// WebSocket 配置
type McpWebSocketServerConfig = {
  type: 'ws'
  url: string
  headers?: Record<string, string>
}
```

### 连接状态

```typescript
type MCPServerConnection =
  | ConnectedMCPServer    // 已连接
  | FailedMCPServer       // 连接失败
  | NeedsAuthMCPServer    // 需要认证
  | PendingMCPServer      // 等待中
  | DisabledMCPServer     // 已禁用

type ConnectedMCPServer = {
  client: Client
  name: string
  type: 'connected'
  capabilities: ServerCapabilities
  serverInfo?: { name: string; version: string }
  instructions?: string
  config: ScopedMcpServerConfig
  cleanup: () => Promise<void>
}
```

### 连接流程

```typescript
// 源码位置: src/services/mcp/client.ts

async function connectToServer(
  config: McpServerConfig
): Promise<MCPServerConnection> {
  
  // 1. 根据类型创建传输
  let transport: Transport
  switch (config.type) {
    case 'stdio':
      transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: config.env,
      })
      break
    case 'sse':
      transport = new SSEClientTransport({
        url: config.url,
        headers: config.headers,
      })
      break
    case 'ws':
      transport = new WebSocketClientTransport({
        url: config.url,
      })
      break
  }
  
  // 2. 创建客户端
  const client = new Client({
    name: 'claude-code',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  })
  
  // 3. 连接服务器
  await client.connect(transport)
  
  // 4. 获取能力
  const capabilities = await client.listTools()
  
  return {
    client,
    name: config.name,
    type: 'connected',
    capabilities,
  }
}
```

### 工具调用

```typescript
// MCP 工具转换为 Claude Code 工具
function createMCPTool(
  serverName: string,
  tool: MCPToolDefinition
): Tool {
  return {
    name: `mcp__${serverName}__${tool.name}`,
    description: tool.description,
    input_schema: tool.inputSchema,
    
    execute: async (params) => {
      const result = await client.callTool({
        name: tool.name,
        arguments: params,
      })
      return formatResult(result)
    },
  }
}
```

### OAuth 认证

```typescript
// 源码位置: src/services/mcp/auth.ts

async function handleOAuth(
  config: McpSSEServerConfig
): Promise<string> {
  // 1. 启动本地回调服务器
  const callbackServer = await startCallbackServer()
  
  // 2. 构建授权 URL
  const authUrl = buildAuthUrl({
    clientId: config.oauth.clientId,
    redirectUri: `http://localhost:${callbackServer.port}`,
    scope: config.oauth.scope,
  })
  
  // 3. 打开浏览器
  await openBrowser(authUrl)
  
  // 4. 等待回调
  const { code } = await waitForCallback(callbackServer)
  
  // 5. 交换 token
  const token = await exchangeCodeForToken(code)
  
  return token
}
```

## 配置作用域

```typescript
type ConfigScope =
  | 'local'      // .claude/settings.local.json
  | 'user'       // ~/.claude/settings.json
  | 'project'    // .claude/settings.json
  | 'enterprise' // 企业策略
```

**配置示例**:

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "mcp-server-github",
      "args": ["--repo", "owner/repo"]
    },
    "postgres": {
      "type": "stdio",
      "command": "mcp-server-postgres",
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    },
    "api": {
      "type": "sse",
      "url": "https://api.example.com/mcp",
      "oauth": {
        "clientId": "xxx"
      }
    }
  }
}
```

## 设计模式

### 1. 适配器模式

将 MCP 工具适配为 Claude Code 工具:

```typescript
createMCPTool(serverName, mcpTool)
```

### 2. 工厂模式

根据配置类型创建传输:

```typescript
createTransport(config)
```

### 3. 代理模式

客户端代理服务器操作:

```typescript
client.callTool()
client.listResources()
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Tools | 内置 | 可扩展 (MCP) |
| Transport | 无 | stdio/SSE/WS |
| Auth | 无 | OAuth 集成 |
| Config | 无 | 多作用域配置 |

## 实践练习

### 练习 1: 实现简单 MCP 客户端

```typescript
class SimpleMCPClient {
  async connect(transport: Transport): Promise<void>
  async listTools(): Promise<Tool[]>
  async callTool(name: string, args: any): Promise<any>
}
```

### 练习 2: 实现 Stdio 传输

```typescript
class StdioTransport {
  constructor(config: McpStdioServerConfig)
  send(message: JSONRPCMessage): void
  onMessage(handler: (msg: JSONRPCMessage) => void): void
}
```

### 练习 3: 实现工具发现

```typescript
async function discoverTools(
  connections: MCPServerConnection[]
): Promise<Tool[]> {
  // TODO: 遍历连接，收集所有工具
}
```

## 思考题

1. 为什么选择 JSON-RPC 作为协议基础？
2. Stdio 和 SSE 各有什么适用场景？
3. 如何处理 MCP 服务器崩溃的情况？

## 延伸阅读

- [c02: Tool System](c02-tool-system.md) - MCP 工具的集成
- [c10: Hooks Extension](c10-hooks-extension.md) - MCP 与 Hooks
- 源码: `src/services/mcp/`

---

**下一章**: [c08: Task Management](c08-task-management.md) →