/**
 * c06: Subagent & Fork 示例代码
 *
 * 最小化的子 Agent 系统实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

type PermissionMode = 'default' | 'bubble' | 'bypassPermissions'

interface AgentDefinition {
  agentType: string
  whenToUse: string
  tools: string[]          // ['*'] 表示所有工具
  maxTurns: number
  model: string | 'inherit'
  permissionMode: PermissionMode
}

interface AgentToolInput {
  description: string
  prompt: string
  subagent_type?: string
  model?: 'sonnet' | 'opus' | 'haiku'
  run_in_background?: boolean
  isolation?: 'worktree' | 'none'
}

interface AgentResult {
  success: boolean
  output: string
  agentId: string
  turnsUsed: number
}

// ============================================
// 2. Agent 类型注册表
// ============================================

const AGENT_TYPES: Record<string, AgentDefinition> = {
  'general-purpose': {
    agentType: 'general-purpose',
    whenToUse: 'General tasks requiring full tool access',
    tools: ['*'],
    maxTurns: 200,
    model: 'inherit',
    permissionMode: 'bubble',
  },

  'Explore': {
    agentType: 'Explore',
    whenToUse: 'Fast agent for codebase exploration',
    tools: ['Glob', 'Grep', 'Read'],
    maxTurns: 50,
    model: 'haiku',
    permissionMode: 'bubble',
  },

  'Plan': {
    agentType: 'Plan',
    whenToUse: 'Software architect agent for planning',
    tools: ['Glob', 'Grep', 'Read', 'WebFetch', 'WebSearch'],
    maxTurns: 100,
    model: 'sonnet',
    permissionMode: 'bubble',
  },

  'fork': {
    agentType: 'fork',
    whenToUse: 'Fork subagent with inherited context',
    tools: ['*'],
    maxTurns: 200,
    model: 'inherit',
    permissionMode: 'bubble',
  },
}

// ============================================
// 3. Agent 调度器
// ============================================

interface SchedulerContext {
  parentModel: string
  parentTools: string[]
  permissionHandler: (params: any) => Promise<boolean>
}

class AgentScheduler {
  private context: SchedulerContext
  private activeAgents: Map<string, { definition: AgentDefinition; status: string }> = new Map()

  constructor(context: SchedulerContext) {
    this.context = context
  }

  // 创建子 Agent
  async spawn(input: AgentToolInput): Promise<AgentResult> {
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    // 选择 Agent 类型
    const definition = this.selectAgentType(input.subagent_type)

    // 确定模型
    const model = input.model ||
      (definition.model === 'inherit' ? this.context.parentModel : definition.model)

    // 确定工具
    const tools = definition.tools[0] === '*'
      ? this.context.parentTools
      : definition.tools

    console.log(`[AgentScheduler] Spawning ${definition.agentType} agent`)
    console.log(`  Model: ${model}`)
    console.log(`  Tools: ${tools.length} available`)
    console.log(`  Max turns: ${definition.maxTurns}`)

    // 注册活跃 Agent
    this.activeAgents.set(agentId, {
      definition,
      status: 'running',
    })

    // 执行 Agent (模拟)
    const result = await this.executeAgent(agentId, definition, input, model, tools)

    // 更新状态
    this.activeAgents.set(agentId, {
      definition,
      status: 'completed',
    })

    return result
  }

  private selectAgentType(type?: string): AgentDefinition {
    if (type && AGENT_TYPES[type]) {
      return AGENT_TYPES[type]
    }
    return AGENT_TYPES['general-purpose']
  }

  private async executeAgent(
    agentId: string,
    definition: AgentDefinition,
    input: AgentToolInput,
    model: string,
    tools: string[]
  ): Promise<AgentResult> {
    // 模拟 Agent 执行
    // 实际实现会创建新的 Agent Loop

    console.log(`\n[Agent ${agentId}] Starting execution...`)
    console.log(`  Prompt: ${input.prompt.substring(0, 50)}...`)

    // 模拟多轮对话
    const turns = Math.min(
      Math.floor(Math.random() * 10) + 1,
      definition.maxTurns
    )

    // 模拟权限冒泡
    if (definition.permissionMode === 'bubble') {
      console.log(`  [Permission] Bubbling to parent...`)
    }

    // 模拟结果
    return {
      success: true,
      output: `Agent completed the task: ${input.description}`,
      agentId,
      turnsUsed: turns,
    }
  }

  // 获取活跃 Agent
  getActiveAgents(): Array<{ id: string; definition: AgentDefinition; status: string }> {
    return Array.from(this.activeAgents.entries()).map(([id, data]) => ({
      id,
      ...data,
    }))
  }
}

// ============================================
// 4. Worktree 隔离
// ============================================

interface WorktreeInfo {
  path: string
  branch: string
  createdAt: Date
}

class WorktreeManager {
  private worktrees: Map<string, WorktreeInfo> = new Map()

  async create(name: string): Promise<WorktreeInfo> {
    const branch = `agent/${name}-${Date.now()}`
    const path = `.claude/worktrees/${name}`

    console.log(`[Worktree] Creating isolated environment...`)
    console.log(`  Branch: ${branch}`)
    console.log(`  Path: ${path}`)

    // 模拟 git worktree add
    // 实际实现: await exec(`git worktree add ${path} -b ${branch}`)

    const info: WorktreeInfo = {
      path,
      branch,
      createdAt: new Date(),
    }

    this.worktrees.set(name, info)
    return info
  }

  async remove(name: string): Promise<void> {
    const info = this.worktrees.get(name)
    if (!info) return

    console.log(`[Worktree] Removing ${name}...`)

    // 模拟 git worktree remove
    // 实际实现:
    // await exec(`git worktree remove ${info.path} --force`)
    // await exec(`git branch -D ${info.branch}`)

    this.worktrees.delete(name)
  }

  list(): WorktreeInfo[] {
    return Array.from(this.worktrees.values())
  }
}

// ============================================
// 5. 后台任务管理
// ============================================

interface BackgroundTask {
  id: string
  description: string
  status: 'running' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  result?: AgentResult
}

class BackgroundTaskManager {
  private tasks: Map<string, BackgroundTask> = new Map()
  private autoBackgroundMs: number = 120_000 // 2 分钟

  start(description: string, agentPromise: Promise<AgentResult>): string {
    const taskId = `task-${Date.now()}`
    const task: BackgroundTask = {
      id: taskId,
      description,
      status: 'running',
      startTime: new Date(),
    }

    this.tasks.set(taskId, task)

    // 自动后台化
    const timeout = setTimeout(() => {
      this.moveToBackground(taskId)
    }, this.autoBackgroundMs)

    // 异步处理结果
    agentPromise
      .then(result => {
        clearTimeout(timeout)
        task.status = 'completed'
        task.endTime = new Date()
        task.result = result
      })
      .catch(error => {
        clearTimeout(timeout)
        task.status = 'failed'
        task.endTime = new Date()
      })

    return taskId
  }

  private moveToBackground(taskId: string): void {
    console.log(`[BackgroundTask] Task ${taskId} moved to background`)
    // 通知用户任务已转入后台
  }

  getStatus(taskId: string): BackgroundTask | undefined {
    return this.tasks.get(taskId)
  }

  list(): BackgroundTask[] {
    return Array.from(this.tasks.values())
  }
}

// ============================================
// 6. 权限冒泡
// ============================================

class PermissionBubbler {
  private parentHandler: (params: any) => Promise<boolean>

  constructor(parentHandler: (params: any) => Promise<boolean>) {
    this.parentHandler = parentHandler
  }

  async requestPermission(params: {
    toolName: string
    input: any
    agentId: string
  }): Promise<boolean> {
    console.log(`[PermissionBubbler] Agent ${params.agentId} requests ${params.toolName}`)

    // 冒泡到父进程
    const allowed = await this.parentHandler(params)

    console.log(`  Result: ${allowed ? 'allowed' : 'denied'}`)
    return allowed
  }
}

// ============================================
// 7. 完整 Agent 系统
// ============================================

class AgentSystem {
  private scheduler: AgentScheduler
  private worktreeManager: WorktreeManager
  private backgroundManager: BackgroundTaskManager
  private permissionBubbler: PermissionBubbler

  constructor(parentModel: string, parentTools: string[]) {
    const permissionHandler = async (params: any) => {
      // 模拟父进程权限处理
      console.log(`  Asking parent for permission...`)
      return true // 简化为总是允许
    }

    this.scheduler = new AgentScheduler({
      parentModel,
      parentTools,
      permissionHandler,
    })

    this.worktreeManager = new WorktreeManager()
    this.backgroundManager = new BackgroundTaskManager()
    this.permissionBubbler = new PermissionBubbler(permissionHandler)
  }

  async runAgent(input: AgentToolInput): Promise<AgentResult> {
    // 检查是否需要隔离
    let worktree: WorktreeInfo | null = null
    if (input.isolation === 'worktree') {
      worktree = await this.worktreeManager.create(input.description.replace(/\s+/g, '-'))
    }

    try {
      // 执行 Agent
      if (input.run_in_background) {
        const taskId = this.backgroundManager.start(
          input.description,
          this.scheduler.spawn(input)
        )
        console.log(`\n[AgentSystem] Background task started: ${taskId}`)
        return {
          success: true,
          output: `Task started in background: ${taskId}`,
          agentId: taskId,
          turnsUsed: 0,
        }
      } else {
        const result = await this.scheduler.spawn(input)
        return result
      }
    } finally {
      // 清理 worktree
      if (worktree) {
        await this.worktreeManager.remove(input.description.replace(/\s+/g, '-'))
      }
    }
  }
}

// ============================================
// 8. 演示
// ============================================

async function main() {
  console.log('=== Subagent System Demo ===\n')

  const system = new AgentSystem('claude-sonnet-4-20250514', [
    'Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'
  ])

  // 场景 1: 通用 Agent
  console.log('--- Scenario 1: General-purpose agent ---')
  await system.runAgent({
    description: 'Analyze codebase',
    prompt: 'Find all TypeScript files and list their exports',
    subagent_type: 'general-purpose',
  })

  // 场景 2: 探索 Agent (快速)
  console.log('\n--- Scenario 2: Explore agent (fast) ---')
  await system.runAgent({
    description: 'Find config files',
    prompt: 'Find all configuration files in the project',
    subagent_type: 'Explore',
  })

  // 场景 3: 后台 Agent
  console.log('\n--- Scenario 3: Background agent ---')
  await system.runAgent({
    description: 'Long running task',
    prompt: 'Perform a comprehensive analysis',
    run_in_background: true,
  })

  // 场景 4: Worktree 隔离
  console.log('\n--- Scenario 4: Worktree isolation ---')
  await system.runAgent({
    description: 'Isolated changes',
    prompt: 'Make changes in isolated environment',
    isolation: 'worktree',
  })

  console.log('\n=== Demo Complete ===')
}

main().catch(console.error)