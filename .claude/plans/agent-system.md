# Agent 子进程管理系统分析

## 概述

Agent 系统允许 Claude Code 生成子 agent 来并行处理任务。

## 核心文件

| 文件 | 大小 | 功能 |
|------|------|------|
| AgentTool.tsx | 234KB | 主工具实现 |
| UI.tsx | 125KB | UI 组件 |
| runAgent.ts | 36KB | Agent 运行逻辑 |
| loadAgentsDir.ts | 26KB | Agent 定义加载 |
| forkSubagent.ts | 9KB | Fork 子 agent |
| agentToolUtils.ts | 23KB | 工具函数 |

## Agent 输入 Schema

```typescript
type AgentToolInput = {
  description: string        // 任务描述 (3-5 词)
  prompt: string            // 详细任务内容
  subagent_type?: string    // Agent 类型
  model?: 'sonnet' | 'opus' | 'haiku'  // 模型选择
  run_in_background?: boolean  // 后台运行
  name?: string             // Agent 名称 (用于消息)
  team_name?: string        // 团队名称
  mode?: PermissionMode     // 权限模式
  isolation?: 'worktree' | 'remote'  // 隔离模式
  cwd?: string              // 工作目录
}
```

## Agent 定义

```typescript
type AgentDefinition = {
  agentType: string         // 类型标识
  whenToUse: string         // 使用场景
  tools: string[]           // 可用工具
  maxTurns: number          // 最大轮次
  model: string | 'inherit' // 模型
  permissionMode: PermissionMode
  source: 'built-in' | 'custom'
  getSystemPrompt: () => string
}
```

### 内置 Agent

```typescript
const GENERAL_PURPOSE_AGENT = {
  agentType: 'general-purpose',
  tools: ['*'],           // 所有工具
  maxTurns: 200,
  model: 'inherit',
  permissionMode: 'bubble'
}
```

## Fork 子 Agent 机制

```typescript
// Fork 实验门控
function isForkSubagentEnabled(): boolean {
  if (feature('FORK_SUBAGENT')) {
    if (isCoordinatorMode()) return false
    if (getIsNonInteractiveSession()) return false
    return true
  }
  return false
}

// Fork Agent 定义
const FORK_AGENT = {
  agentType: 'fork',
  tools: ['*'],
  maxTurns: 200,
  model: 'inherit',
  permissionMode: 'bubble'
}
```

### Fork 特点

- 继承父进程完整上下文
- 继承父进程系统提示
- 自动后台运行
- 权限冒泡到父进程

## Agent 生命周期

```
1. 调用 Agent Tool
   └── 解析输入参数

2. 选择 Agent 类型
   ├── 内置 agent
   └── 自定义 agent

3. 准备环境
   ├── 创建 worktree (可选)
   ├── 初始化 MCP 客户端
   └── 克隆文件状态缓存

4. 执行 Agent
   ├── 同步模式: 阻塞等待
   └── 异步模式: 后台运行

5. 监控进度
   └── LocalAgentTask 管理

6. 完成清理
   ├── 移除 worktree
   ├── 断开 MCP 连接
   └── 更新 transcript
```

## 隔离模式

### Worktree 隔离
```typescript
// 创建临时 git worktree
createAgentWorktree()
// Agent 在隔离仓库中工作
// 完成后自动清理
removeAgentWorktree()
```

### Remote 隔离
- 在远程 CCR 环境运行
- 适合长时间任务

## MCP 服务器初始化

```typescript
async function initializeAgentMcpServers(
  agentDefinition: AgentDefinition,
  parentClients: MCPServerConnection[],
): Promise<{
  clients: MCPServerConnection[]
  tools: Tools
}>
```

Agent 可定义自己的 MCP 服务器，与父进程的合并。

## 后台任务管理

```typescript
// 注册后台任务
registerAsyncAgent(agentId, description)

// 进度更新
updateAsyncAgentProgress(agentId, progress)

// 完成通知
completeAsyncAgent(agentId, result)

// 杀死任务
killAsyncAgent(agentId)
```

## 设计亮点

### 1. 模型继承
```typescript
model: 'inherit'  // 使用父进程模型
```
保持上下文长度一致性

### 2. 权限冒泡
```typescript
permissionMode: 'bubble'
```
子 agent 权限请求冒泡到父进程

### 3. Worktree 隔离
避免并发修改冲突

### 4. 自动后台化
```typescript
const AUTO_BACKGROUND_MS = 120_000
// 2 分钟后自动转入后台
```

### 5. 缓存一致性
```typescript
cloneFileStateCache()
// 继承父进程文件缓存
```