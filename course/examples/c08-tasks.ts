/**
 * c08: Task Management 示例代码
 *
 * 最小化的任务管理系统实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deleted'

interface Task {
  id: string
  subject: string
  description: string
  status: TaskStatus
  owner?: string
  activeForm?: string
  blockedBy?: string[]
  blocks?: string[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// ============================================
// 2. 任务存储
// ============================================

class TaskStore {
  private tasks: Map<string, Task> = new Map()
  private idCounter = 0

  add(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const id = `task-${++this.idCounter}`
    const now = new Date()

    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    }

    this.tasks.set(id, newTask)
    return newTask
  }

  get(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  update(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id)
    if (!task) return undefined

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    }

    this.tasks.set(id, updatedTask)
    return updatedTask
  }

  delete(id: string): boolean {
    return this.tasks.delete(id)
  }

  list(filter?: { status?: TaskStatus; owner?: string }): Task[] {
    let tasks = Array.from(this.tasks.values())

    if (filter?.status) {
      tasks = tasks.filter(t => t.status === filter.status)
    }
    if (filter?.owner) {
      tasks = tasks.filter(t => t.owner === filter.owner)
    }

    return tasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }
}

// ============================================
// 3. 依赖管理
// ============================================

class DependencyManager {
  constructor(private store: TaskStore) {}

  // 检查是否可开始
  canStart(taskId: string): boolean {
    const task = this.store.get(taskId)
    if (!task) return false

    if (!task.blockedBy || task.blockedBy.length === 0) {
      return true
    }

    return task.blockedBy.every(blockerId => {
      const blocker = this.store.get(blockerId)
      return blocker?.status === 'completed'
    })
  }

  // 获取被阻塞的任务
  getBlockedTasks(taskId: string): Task[] {
    return this.store.list().filter(t =>
      t.blockedBy?.includes(taskId)
    )
  }

  // 获取可解锁的任务
  getUnlockedTasks(completedTaskId: string): Task[] {
    return this.getBlockedTasks(completedTaskId).filter(t =>
      this.canStart(t.id)
    )
  }

  // 检测循环依赖
  detectCycle(): string[] | null {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycle: string[] = []

    const dfs = (taskId: string): boolean => {
      visited.add(taskId)
      recursionStack.add(taskId)

      const task = this.store.get(taskId)
      if (task?.blockedBy) {
        for (const depId of task.blockedBy) {
          if (!visited.has(depId)) {
            if (dfs(depId)) {
              cycle.push(taskId)
              return true
            }
          } else if (recursionStack.has(depId)) {
            cycle.push(taskId)
            return true
          }
        }
      }

      recursionStack.delete(taskId)
      return false
    }

    for (const task of this.store.list()) {
      if (!visited.has(task.id)) {
        if (dfs(task.id)) {
          return cycle.reverse()
        }
      }
    }

    return null
  }

  // 拓扑排序
  getExecutionOrder(): string[] {
    const result: string[] = []
    const visited = new Set<string>()

    const dfs = (taskId: string) => {
      if (visited.has(taskId)) return
      visited.add(taskId)

      const task = this.store.get(taskId)
      if (task?.blockedBy) {
        for (const depId of task.blockedBy) {
          dfs(depId)
        }
      }

      result.push(taskId)
    }

    for (const task of this.store.list()) {
      dfs(task.id)
    }

    return result
  }
}

// ============================================
// 4. 任务管理器
// ============================================

interface TaskManagerEvents {
  onTaskCreated: (task: Task) => void
  onTaskUpdated: (task: Task, oldStatus: TaskStatus) => void
  onTaskUnblocked: (task: Task) => void
}

class TaskManager {
  private store: TaskStore
  private dependencyManager: DependencyManager
  private events: Partial<TaskManagerEvents> = {}

  constructor() {
    this.store = new TaskStore()
    this.dependencyManager = new DependencyManager(this.store)
  }

  on<K extends keyof TaskManagerEvents>(
    event: K,
    handler: TaskManagerEvents[K]
  ): void {
    this.events[event] = handler
  }

  // 创建任务
  create(params: {
    subject: string
    description: string
    activeForm?: string
    owner?: string
    blockedBy?: string[]
    metadata?: Record<string, any>
  }): Task {
    const task = this.store.add({
      subject: params.subject,
      description: params.description,
      status: 'pending',
      activeForm: params.activeForm,
      owner: params.owner,
      blockedBy: params.blockedBy,
      metadata: params.metadata,
    })

    // 检查循环依赖
    const cycle = this.dependencyManager.detectCycle()
    if (cycle) {
      this.store.delete(task.id)
      throw new Error(`Circular dependency detected: ${cycle.join(' -> ')}`)
    }

    this.events.onTaskCreated?.(task)
    console.log(`[TaskManager] Created task ${task.id}: ${task.subject}`)

    return task
  }

  // 开始任务
  start(taskId: string, owner?: string): Task {
    const task = this.store.get(taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)

    if (task.status !== 'pending') {
      throw new Error(`Task ${taskId} is not pending`)
    }

    if (!this.dependencyManager.canStart(taskId)) {
      throw new Error(`Task ${taskId} is blocked`)
    }

    const oldStatus = task.status
    const updated = this.store.update(taskId, {
      status: 'in_progress',
      owner,
    })!

    this.events.onTaskUpdated?.(updated, oldStatus)
    console.log(`[TaskManager] Started task ${taskId}`)

    return updated
  }

  // 完成任务
  complete(taskId: string): Task {
    const task = this.store.get(taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)

    const oldStatus = task.status
    const updated = this.store.update(taskId, {
      status: 'completed',
    })!

    this.events.onTaskUpdated?.(updated, oldStatus)

    // 通知被解锁的任务
    const unblocked = this.dependencyManager.getUnlockedTasks(taskId)
    for (const unblockedTask of unblocked) {
      this.events.onTaskUnblocked?.(unblockedTask)
      console.log(`[TaskManager] Task ${unblockedTask.id} is now unblocked`)
    }

    console.log(`[TaskManager] Completed task ${taskId}`)
    return updated
  }

  // 删除任务
  delete(taskId: string): void {
    this.store.update(taskId, { status: 'deleted' })
    console.log(`[TaskManager] Deleted task ${taskId}`)
  }

  // 获取任务
  get(taskId: string): Task | undefined {
    return this.store.get(taskId)
  }

  // 列出任务
  list(filter?: { status?: TaskStatus; owner?: string }): Task[] {
    return this.store.list(filter)
  }

  // 获取执行顺序
  getExecutionOrder(): string[] {
    return this.dependencyManager.getExecutionOrder()
  }

  // 获取依赖管理器
  getDependencyManager(): DependencyManager {
    return this.dependencyManager
  }
}

// ============================================
// 5. 任务 UI 表示
// ============================================

function renderTaskList(tasks: Task[]): string {
  const lines: string[] = ['Tasks:', '']

  const statusIcon: Record<TaskStatus, string> = {
    pending: '○',
    in_progress: '◐',
    completed: '●',
    deleted: '✕',
  }

  for (const task of tasks) {
    const icon = statusIcon[task.status]
    const owner = task.owner ? ` (${task.owner})` : ''
    const active = task.activeForm && task.status === 'in_progress'
      ? ` - ${task.activeForm}`
      : ''

    lines.push(`  ${icon} ${task.id}: ${task.subject}${owner}${active}`)

    if (task.blockedBy?.length) {
      const blockers = task.blockedBy.map(id => {
        const t = task // 需要外部引用
        return id
      })
      lines.push(`    Blocked by: ${task.blockedBy.join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ============================================
// 6. 演示
// ============================================

async function main() {
  console.log('=== Task Management Demo ===\n')

  const manager = new TaskManager()

  // 设置事件处理
  manager.on('onTaskCreated', (task) => {
    console.log(`  [Event] Task created: ${task.subject}`)
  })

  manager.on('onTaskUnblocked', (task) => {
    console.log(`  [Event] Task unblocked: ${task.subject}`)
  })

  // 创建任务
  console.log('--- Creating tasks ---')
  const task1 = manager.create({
    subject: 'Setup project structure',
    description: 'Create initial project directories and files',
    activeForm: 'Setting up project structure',
  })

  const task2 = manager.create({
    subject: 'Implement core features',
    description: 'Build the main functionality',
    activeForm: 'Implementing core features',
    blockedBy: [task1.id],
  })

  const task3 = manager.create({
    subject: 'Write tests',
    description: 'Add unit tests',
    activeForm: 'Writing tests',
    blockedBy: [task2.id],
  })

  const task4 = manager.create({
    subject: 'Update documentation',
    description: 'Write README and API docs',
    activeForm: 'Updating documentation',
    // 这个任务没有依赖，可以并行
  })

  // 显示任务列表
  console.log('\n' + renderTaskList(manager.list()))

  // 执行顺序
  console.log('\n--- Execution Order ---')
  const order = manager.getExecutionOrder()
  console.log('  ' + order.join(' -> '))

  // 尝试开始被阻塞的任务
  console.log('\n--- Attempting to start blocked task ---')
  try {
    manager.start(task2.id)
  } catch (error: any) {
    console.log(`  Error: ${error.message}`)
  }

  // 完成第一个任务
  console.log('\n--- Completing task 1 ---')
  manager.start(task1.id, 'agent-1')
  manager.complete(task1.id)

  // 现在任务2可以开始了
  console.log('\n--- Starting task 2 (now unblocked) ---')
  manager.start(task2.id, 'agent-2')

  // 显示当前状态
  console.log('\n--- Current Status ---')
  console.log(renderTaskList(manager.list()))

  // 按状态筛选
  console.log('\n--- Pending Tasks ---')
  const pending = manager.list({ status: 'pending' })
  console.log(`  Count: ${pending.length}`)

  console.log('\n--- In Progress Tasks ---')
  const inProgress = manager.list({ status: 'in_progress' })
  console.log(`  Count: ${inProgress.length}`)

  console.log('\n=== Demo Complete ===')
}

main().catch(console.error)