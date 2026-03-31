# MCP 协议集成分析

## 概述

MCP (Model Context Protocol) 是 Claude Code 与外部工具/服务集成的核心协议。

## 传输类型

```typescript
type Transport =
  | 'stdio'      // 标准输入输出
  | 'sse'        // Server-Sent Events
  | 'sse-ide'    // IDE SSE 连接
  | 'http'       // HTTP 传输
  | 'ws'         // WebSocket
  | 'sdk'        // 内置 SDK
```

## 服务器配置类型

### Stdio 配置
```typescript
type McpStdioServerConfig = {
  type?: 'stdio'
  command: string
  args?: string[]
  env?: Record<string, string>
}
```

### SSE 配置
```typescript
type McpSSEServerConfig = {
  type: 'sse'
  url: string
  headers?: Record<string, string>
  oauth?: {
    clientId?: string
    callbackPort?: number
    authServerMetadataUrl?: string
  }
}
```

### WebSocket 配置
```typescript
type McpWebSocketServerConfig = {
  type: 'ws'
  url: string
  headers?: Record<string, string>
}
```

## 服务器连接状态

```typescript
type MCPServerConnection =
  | ConnectedMCPServer    // 已连接
  | FailedMCPServer       // 连接失败
  | NeedsAuthMCPServer    // 需要认证
  | PendingMCPServer      // 等待中
  | DisabledMCPServer     // 已禁用
```

### ConnectedMCPServer
```typescript
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

## 核心文件

| 文件 | 大小 | 功能 |
|------|------|------|
| client.ts | 119KB | MCP 客户端主逻辑 |
| auth.ts | 89KB | OAuth 认证 |
| config.ts | 51KB | 配置管理 |
| useManageMCPConnections.ts | 45KB | 连接管理 Hook |

## 连接流程

```
1. 配置加载 (config.ts)
   └── 从 settings.json 读取 mcpServers

2. 连接建立 (client.ts)
   ├── Stdio: 启动子进程
   ├── SSE: 建立 HTTP 连接
   └── WS: 建立 WebSocket

3. 能力协商
   └── 获取 tools, resources, prompts

4. 工具注册
   └── 转换为 MCPTool

5. 调用执行
   └── 通过 client.callTool()
```

## 工具调用机制

```typescript
// MCPTool 包装 MCP 服务器工具
const MCPTool = {
  name: 'mcp__<server>__<tool>',
  inputSchema: toolSchema,
  execute: async (input) => {
    return client.callTool({
      name: toolName,
      arguments: input
    })
  }
}
```

## 配置作用域

```typescript
type ConfigScope =
  | 'local'      // 本地
  | 'user'       // 用户级
  | 'project'    // 项目级
  | 'dynamic'    // 动态
  | 'enterprise' // 企业
  | 'claudeai'   // Claude.ai
  | 'managed'    // 托管
```

## OAuth 集成

支持 OAuth 2.0 认证流程：

1. 检测 401 错误
2. 启动本地回调服务器
3. 打开浏览器授权
4. 获取 access_token
5. 添加到请求头

## 错误处理

- **连接失败**: 自动重试，指数退避
- **认证过期**: 自动刷新 token
- **工具调用失败**: 返回错误信息

## 设计亮点

1. **多传输支持**: stdio/SSE/WS/HTTP
2. **OAuth 集成**: 完整认证流程
3. **能力协商**: 动态发现工具
4. **错误恢复**: 自动重连机制