# c06: Subagent & Fork (子智能体与分支)

`c01 > c02 > c03 > c04 | c05 > [ c06 ] > c07 > c08 | c09 > c10 > c11 > c12`

> *"Divide and conquer"* -- 子 Agent 是并行处理的关键。
>
> **Harness 层**: Subagent -- 任务分解与并行执行。

## 问题

复杂任务需要:
- 并行处理多个独立子任务
- 隔离执行环境避免冲突
- 分配不同模型节省成本
- 长时间任务后台运行

单个 Agent Loop 无法满足这些需求。

## 解决方案

Claude Code 实现了 Agent Tool，允许创建子 Agent:

```
+------------------+
|   Parent Agent   |
+--------+---------+
         |
    +----+----+----+
    |    |    |    |
    v    v    v    v
  Agent Agent Agent Agent
   (1)   (2)   (3)   (4)
    |    |    |    |
    +----+----+----+
         |
         v
    合并结果
```

## 源码分析

### Agent 工具输入

```typescript
// 源码位置: src/tools/AgentTool/AgentTool.tsx

type AgentToolInput = {
  description: string        // 任务描述 (3-5 词)
  prompt: string             // 详细任务内容
  subagent_type?: string     // Agent 类型
  model?: 'sonnet' | 'opus' | 'haiku'
  run_in_background?: boolean
  isolation?: 'worktree' | 'remote'
}
```

### Agent 定义

```typescript
type AgentDefinition = {
  agentType: string          // 类型标识
  whenToUse: string          // 使用场景描述
  tools: string[]            // 可用工具列表
  maxTurns: number           // 最大轮次
  model: string | 'inherit'  // 模型选择
  permissionMode: PermissionMode
  getSystemPrompt: () => string
}
```

### 内置 Agent 类型

```typescript
// 通用 Agent
const GENERAL_PURPOSE_AGENT: AgentDefinition = {
  agentType: 'general-purpose',
  whenToUse: 'General tasks requiring full tool access',
  tools: ['*'],
  maxTurns: 200,
  model: 'inherit',
  permissionMode: 'bubble',
}

// 探索 Agent (快速搜索)
const EXPLORE_AGENT: AgentDefinition = {
  agentType: 'Explore',
  whenToUse: 'Fast agent for codebase exploration',
  tools: ['Glob', 'Grep', 'Read'],
  maxTurns: 50,
  model: 'haiku',
  permissionMode: 'bubble',
}

// 规划 Agent
const PLAN_AGENT: AgentDefinition = {
  agentType: 'Plan',
  whenToUse: 'Software architect agent for planning',
  tools: ['Glob', 'Grep', 'Read', 'WebFetch', 'WebSearch'],
  maxTurns: 100,
  model: 'sonnet',
  permissionMode: 'bubble',
}
```

### Fork 子 Agent

```typescript
// 源码位置: src/tools/AgentTool/forkSubagent.ts

function isForkSubagentEnabled(): boolean {
  return feature('FORK_SUBAGENT')
    && !isCoordinatorMode()
    && !getIsNonInteractiveSession()
}

const FORK_AGENT: AgentDefinition = {
  agentType: 'fork',
  tools: ['*'],
  maxTurns: 200,
  model: 'inherit',
  permissionMode: 'bubble',
}
```

**Fork 特点**:
- 继承父进程完整上下文
- 继承父进程系统提示
- 自动后台运行
- 权限冒泡到父进程

### Agent 执行流程

```typescript
async function executeAgent(
  input: AgentToolInput,
  context: AgentContext
): Promise<AgentResult> {
  
  // 1. 选择 Agent 类型
  const definition = selectAgentType(input.subagent_type)
  
  // 2. 准备隔离环境
  if (input.isolation === 'worktree') {
    const worktree = await createAgentWorktree()
    context.cwd = worktree.path
  }
  
  // 3. 初始化 MCP 客户端
  const mcpClients = await initializeAgentMcpServers(
    definition,
    context.parentMcpClients
  )
  
  // 4. 克隆文件状态缓存
  const fileCache = cloneFileStateCache(context.parentFileCache)
  
  // 5. 执行 Agent
  if (input.run_in_background) {
    return runBackgroundAgent(definition, input, context)
  } else {
    return runForegroundAgent(definition, input, context)
  }
}
```

## 隔离模式

### Worktree 隔离

```typescript
// 创建临时 git worktree
async function createAgentWorktree(): Promise<{ path: string }> {
  const branch = `agent-${Date.now()}`
  const path = `.claude/worktrees/${branch}`
  
  await exec(`git worktree add ${path} -b ${branch}`)
  
  return { path }
}

// 清理 worktree
async function removeAgentWorktree(path: string) {
  await exec(`git worktree remove ${path} --force`)
  await exec(`git branch -D ${branch}`)
}
```

**优点**:
- 文件系统隔离
- Git 操作独立
- 可并行开发

### Remote 隔离

```typescript
// 在远程 CCR 环境运行
async function runRemoteAgent(
  definition: AgentDefinition,
  input: AgentToolInput
): Promise<AgentResult> {
  const response = await fetch('/api/agents/run', {
    method: 'POST',
    body: JSON.stringify({ definition, input }),
  })
  return response.json()
}
```

## 后台任务管理

```typescript
// 注册后台 Agent
function registerBackgroundAgent(
  agentId: string,
  description: string
) {
  backgroundAgents.set(agentId, {
    id: agentId,
    description,
    status: 'running',
    startTime: Date.now(),
  })
}

// 自动后台化
const AUTO_BACKGROUND_MS = 120_000 // 2 分钟

async function autoBackground(
  agentId: string,
  promise: Promise<AgentResult>
): Promise<AgentResult> {
  const timeout = setTimeout(() => {
    moveToBackground(agentId)
  }, AUTO_BACKGROUND_MS)
  
  const result = await promise
  clearTimeout(timeout)
  return result
}
```

## 设计模式

### 1. 工厂模式

创建不同类型的 Agent:

```typescript
function createAgent(type: string): Agent {
  return agentFactories[type]()
}
```

### 2. 代理模式

子 Agent 权限冒泡:

```typescript
// 权限请求冒泡到父进程
async function requestPermission(params) {
  if (permissionMode === 'bubble') {
    return parentContext.requestPermission(params)
  }
}
```

### 3. 观察者模式

监控 Agent 进度:

```typescript
agent.on('progress', (update) => {
  notifyParent(update)
})
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Tasks | 单进程 | 多进程并行 |
| Isolation | 无 | Worktree/Remote |
| Model | 固定 | 可选择/继承 |
| Permissions | 独立 | 冒泡机制 |

## 实践练习

### 练习 1: 实现简单 Agent 调度器

```typescript
class AgentScheduler {
  async spawnAgent(prompt: string): Promise<string> {
    // TODO: 创建并运行子 Agent
  }
}
```

### 练习 2: 实现 Worktree 隔离

```typescript
async function withWorktree<T>(
  fn: (path: string) => Promise<T>
): Promise<T> {
  // TODO: 创建 worktree，执行 fn，清理
}
```

### 练习 3: 实现后台任务

```typescript
class BackgroundTaskManager {
  start(task: () => Promise<void>): string
  getStatus(id: string): TaskStatus
  cancel(id: string): void
}
```

## 思考题

1. 什么情况下应该使用子 Agent 而不是主 Agent 直接处理？
2. Worktree 隔离有什么开销？何时值得使用？
3. 权限冒泡机制如何保证安全性？

## 延伸阅读

- [c05: Context Compression](c05-context-compression.md) - 子 Agent 的独立上下文
- [c08: Task Management](c08-task-management.md) - 任务跟踪
- 源码: `src/tools/AgentTool/`

---

**下一章**: [c07: MCP Protocol](c07-mcp-protocol.md) →