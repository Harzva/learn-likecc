# Claude Code MCP 协议：Anthropic 的工具生态野心

> 一个协议，连接无限可能

---

## 什么是 MCP？

MCP（Model Context Protocol）是 Anthropic 推出的工具连接协议。它让 Claude 能与外部工具无缝交互。

但源码泄露揭示了一个更大的野心：

> **Anthropic 想要定义 AI 工具的标准协议**

---

## MCP 协议深度解析

### 核心概念

```typescript
// MCP 协议核心类型
interface MCPProtocol {
  // 工具定义
  tools: ToolDefinition[],

  // 资源定义
  resources: ResourceDefinition[],

  // 提示词模板
  prompts: PromptDefinition[],
}

interface ToolDefinition {
  name: string,
  description: string,
  inputSchema: JSONSchema,  // 参数 schema
  handler: (params: any) => Promise<any>,
}
```

### 工作流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Claude Code │────▶│ MCP Server  │────▶│   Tool      │
│   Client    │◀────│  (Bridge)   │◀────│  Handler    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │
      │  JSON-RPC 2.0     │
      └───────────────────┘
```

---

## Claude Code 的 MCP 实现

### 内置工具注册

源码显示了 Claude Code 如何注册工具：

```typescript
// 内置工具注册
const BUILTIN_TOOLS: ToolDefinition[] = [
  {
    name: 'read',
    description: 'Read file contents',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string' },
        offset: { type: 'number' },
        limit: { type: 'number' },
      },
      required: ['file_path'],
    },
    handler: readFileHandler,
  },
  {
    name: 'write',
    description: 'Write content to file',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['file_path', 'content'],
    },
    handler: writeFileHandler,
  },
  // ... 更多工具
]
```

### 工具发现机制

```typescript
// MCP Server 发现
async function discoverMCPServers(): Promise<MCPServer[]> {
  const servers: MCPServer[] = []

  // 1. 检查项目配置
  const projectConfig = await loadProjectMCPConfig()
  servers.push(...projectConfig.servers)

  // 2. 检查用户配置
  const userConfig = await loadUserMCPConfig()
  servers.push(...userConfig.servers)

  // 3. 检查内置服务器
  servers.push(...BUILTIN_SERVERS)

  return servers
}
```

---

## MCP vs 其他协议

### 与 LangChain Tools 对比

| 特性 | MCP | LangChain Tools |
|------|-----|-----------------|
| 标准化 | 协议级 | 框架级 |
| 跨平台 | 是 | 否（Python/JS） |
| 动态发现 | 支持 | 不支持 |
| 资源管理 | 内置 | 手动 |
| 提示词模板 | 内置 | 分离 |

### 与 OpenAI Functions 对比

```typescript
// OpenAI Functions
{
  "name": "get_weather",
  "description": "Get weather info",
  "parameters": {
    "type": "object",
    "properties": {
      "location": { "type": "string" }
    }
  }
}

// MCP Tool
{
  "name": "get_weather",
  "description": "Get weather info",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": { "type": "string" }
    }
  },
  // MCP 独有：资源关联
  "resources": ["weather_data"],
  // MCP 独有：提示词模板
  "prompts": ["weather_query"]
}
```

---

## 创建自定义 MCP 工具

### 示例：天气查询工具

```typescript
import { MCPServer, ToolDefinition } from '@anthropic/mcp'

const weatherTool: ToolDefinition = {
  name: 'get_weather',
  description: '获取指定城市的天气信息',
  inputSchema: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: '城市名称',
      },
      unit: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius',
      },
    },
    required: ['city'],
  },
  handler: async (params) => {
    const { city, unit } = params
    const response = await fetch(`/api/weather?city=${city}&unit=${unit}`)
    return response.json()
  },
}

// 注册到 MCP Server
const server = new MCPServer({
  name: 'weather-mcp',
  version: '1.0.0',
  tools: [weatherTool],
})

server.start()
```

### 配置到 Claude Code

```json
// .claude/mcp_config.json
{
  "servers": {
    "weather": {
      "command": "node",
      "args": ["./weather-mcp-server.js"],
      "env": {
        "WEATHER_API_KEY": "your-key"
      }
    }
  }
}
```

---

## MCP 的生态野心

### 源码中发现的 MCP Server 列表

```typescript
const ANTHROPIC_MCP_SERVERS = [
  // 官方服务器
  'github',           // GitHub 操作
  'gitlab',          // GitLab 操作
  'jira',            // Jira 集成
  'linear',          // Linear 集成
  'notion',          // Notion 集成
  'slack',           // Slack 集成

  // 开发工具
  'postgres',        // 数据库
  'redis',           // 缓存
  'docker',          // 容器
  'kubernetes',      // K8s

  // 第三方集成
  'browser',         // 浏览器控制
  'filesystem',      // 文件系统
  'terminal',        // 终端
]
```

### 未来规划

源码中的 feature flag 显示：

```typescript
const MCP_FEATURES = {
  // 市场化
  mcp_marketplace: '即将推出',

  // 云端托管
  mcp_cloud_hosting: '内测中',

  // AI 生成工具
  mcp_auto_generate: '实验性',

  // 工具链组合
  mcp_workflows: '规划中',
}
```

---

## MCP 的商业价值

### 对开发者

- **一次开发，多处使用**：同一工具可用于所有支持 MCP 的 AI
- **标准化接口**：不需要为每个 AI 单独适配
- **自动发现**：配置即可使用，无需额外代码

### 对 Anthropic

- **生态锁定**：MCP 成为标准后，竞争者难以迁移
- **数据收集**：工具使用数据是宝贵资源
- **增值服务**：可推出 MCP 云托管、市场等付费服务

---

## 如何参与 MCP 生态

### 1. 创建并发布工具

```bash
# 初始化 MCP 项目
npx create-mcp-tool my-tool

# 发布到 npm
npm publish @yourname/mcp-my-tool
```

### 2. 贡献官方工具

Anthropic 在 GitHub 上有官方 MCP 工具仓库：
- github.com/anthropics/mcp-tools
- 可提交 PR 贡献新工具

### 3. 企业内部部署

```typescript
// 企业内部 MCP 服务器
const enterpriseMCP = new MCPServer({
  name: 'company-internal',
  tools: [
    companyDatabase,
    companyAPI,
    companyKnowledgeBase,
  ],
  // 仅内网访问
  host: '0.0.0.0',
  port: 8080,
})
```

---

## 结语

MCP 不只是一个协议，它是 Anthropic 构建 AI 工具生态的核心战略。

> 谁定义了标准，谁就掌握了未来。

如果你是开发者，现在就是参与 MCP 生态的最佳时机。

---

**作者**: Claude Code Course 团队
**日期**: 2026-04-03
**标签**: #ClaudeCode #MCP #AI工具 #协议标准

---

> 本文基于 Claude Code 源码泄露事件分析，仅供技术学习研究。Claude Code 是 Anthropic 的产品。
