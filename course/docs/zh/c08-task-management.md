# c08: Task Management (任务管理)

`c01 > c02 > c03 > c04 | c05 > c06 > c07 > [ c08 ] | c09 > c10 > c11 > c12`

> *"Track progress, manage complexity"* -- 任务系统让 Agent 工作透明可控。
>
> **Harness 层**: Tasks -- 任务跟踪与状态管理。

## 问题

复杂任务执行时:
- 用户不知道进度如何
- Agent 可能忘记子任务
- 难以追踪并行工作
- 无法管理依赖关系

需要结构化的任务管理系统。

## 解决方案

Claude Code 实现了完整的任务系统:

```
+----------------+
|   Task List    |
+-------+--------+
        |
   +----+----+-----+
   |    |    |     |
   v    v    v     v
 Task  Task Task  Task
 (1)   (2)  (3)   (4)
   |    |
   +----+  <-- dependencies
```

## 源码分析

### Task 数据结构

```typescript
// 源码位置: src/tasks/types.ts

type Task = {
  id: string                    // 唯一标识
  subject: string               // 任务标题
  description: string           // 详细描述
  status: TaskStatus            // 状态
  owner?: string                // 负责人 (agent id)
  activeForm?: string           // 进行中时的显示文本
  blockedBy?: string[]          // 被哪些任务阻塞
  blocks?: string[]             // 阻塞哪些任务
  metadata?: Record<string, any> // 附加信息
}

type TaskStatus =
  | 'pending'     // 待处理
  | 'in_progress' // 进行中
  | 'completed'   // 已完成
  | 'deleted'     // 已删除
```

### TaskCreate 工具

```typescript
// 源码位置: src/tools/TaskCreateTool/

const TaskCreateTool = buildTool({
  name: 'TaskCreate',
  description: 'Create a structured task for tracking progress',
  inputSchema: z.object({
    subject: z.string().describe('Brief title in imperative form'),
    description: z.string().describe('Detailed requirements'),
    activeForm: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  
  execute: async (params, context) => {
    const task: Task = {
      id: generateTaskId(),
      subject: params.subject,
      description: params.description,
      status: 'pending',
      activeForm: params.activeForm,
      metadata: params.metadata,
    }
    
    context.taskStore.add(task)
    
    return { output: `Task created: ${task.id}` }
  },
})
```

### TaskUpdate 工具

```typescript
const TaskUpdateTool = buildTool({
  name: 'TaskUpdate',
  description: 'Update a task in the task list',
  inputSchema: z.object({
    taskId: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'deleted']).optional(),
    description: z.string().optional(),
    activeForm: z.string().optional(),
    addBlockedBy: z.array(z.string()).optional(),
    addBlocks: z.array(z.string()).optional(),
  }),
  
  execute: async (params, context) => {
    const task = context.taskStore.get(params.taskId)
    if (!task) {
      return { error: `Task not found: ${params.taskId}` }
    }
    
    // 更新字段
    if (params.status) task.status = params.status
    if (params.description) task.description = params.description
    if (params.activeForm) task.activeForm = params.activeForm
    
    // 添加依赖
    if (params.addBlockedBy) {
      task.blockedBy = [...(task.blockedBy || []), ...params.addBlockedBy]
    }
    if (params.addBlocks) {
      task.blocks = [...(task.blocks || []), ...params.addBlocks]
    }
    
    context.taskStore.update(task)
    
    return { output: `Task updated: ${task.id}` }
  },
})
```

### TaskList 工具

```typescript
const TaskListTool = buildTool({
  name: 'TaskList',
  description: 'List all tasks in the task list',
  inputSchema: z.object({}),
  
  execute: async (_, context) => {
    const tasks = context.taskStore.list()
    
    const summary = tasks.map(t =>
      `[${t.status}] ${t.id}: ${t.subject}`
    ).join('\n')
    
    return { output: summary }
  },
})
```

### TaskGet 工具

```typescript
const TaskGetTool = buildTool({
  name: 'TaskGet',
  description: 'Get full details of a specific task',
  inputSchema: z.object({
    taskId: z.string(),
  }),
  
  execute: async (params, context) => {
    const task = context.taskStore.get(params.taskId)
    if (!task) {
      return { error: `Task not found: ${params.taskId}` }
    }
    
    return { output: JSON.stringify(task, null, 2) }
  },
})
```

## 任务状态流转

```
pending → in_progress → completed
   ↓          ↓
deleted ← ─── ─
```

## 依赖管理

```typescript
// 检查任务是否可执行
function canStartTask(task: Task, store: TaskStore): boolean {
  if (!task.blockedBy || task.blockedBy.length === 0) {
    return true
  }
  
  return task.blockedBy.every(blockerId => {
    const blocker = store.get(blockerId)
    return blocker?.status === 'completed'
  })
}

// 获取被阻塞的任务
function getBlockedTasks(taskId: string, store: TaskStore): Task[] {
  return store.list().filter(t =>
    t.blockedBy?.includes(taskId)
  )
}
```

## 任务与 Agent 集成

```typescript
// Agent 开始工作时
async function startTask(taskId: string, agentId: string) {
  await TaskUpdateTool.execute({
    taskId,
    status: 'in_progress',
    owner: agentId,
  })
}

// Agent 完成工作时
async function completeTask(taskId: string) {
  await TaskUpdateTool.execute({
    taskId,
    status: 'completed',
  })
  
  // 通知被阻塞的任务
  const blocked = getBlockedTasks(taskId)
  for (const task of blocked) {
    if (canStartTask(task)) {
      notify(`Task ${task.id} is now unblocked`)
    }
  }
}
```

## 设计模式

### 1. 状态模式

任务状态决定行为:

```typescript
switch (task.status) {
  case 'pending': // 可开始
  case 'in_progress': // 可完成/删除
  case 'completed': // 不可修改
  case 'deleted': // 已归档
}
```

### 2. 观察者模式

状态变化通知:

```typescript
taskStore.on('statusChange', (task, oldStatus, newStatus) => {
  if (newStatus === 'completed') {
    updateDependentTasks(task)
  }
})
```

### 3. 依赖图

任务依赖形成有向图:

```typescript
class TaskGraph {
  addDependency(taskId: string, dependsOn: string)
  getExecutionOrder(): string[]
  getCycle(): string[] | null
}
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Progress | 无可视化 | 任务列表 |
| Dependencies | 无 | 显式依赖图 |
| Status | 无 | 4 状态流转 |
| Ownership | 无 | Agent 绑定 |

## 实践练习

### 练习 1: 实现任务存储

```typescript
class TaskStore {
  add(task: Task): void
  get(id: string): Task | undefined
  update(task: Task): void
  list(): Task[]
  delete(id: string): void
}
```

### 练习 2: 实现依赖检查

```typescript
function validateDependencies(
  tasks: Task[]
): { valid: boolean; cycles?: string[] } {
  // TODO: 检测循环依赖
}
```

### 练习 3: 实现执行顺序

```typescript
function getExecutionOrder(tasks: Task[]): string[] {
  // TODO: 拓扑排序返回执行顺序
}
```

## 思考题

1. 任务状态应该由谁控制：模型还是用户？
2. 如何处理循环依赖？
3. 任务系统与权限系统如何集成？

## 延伸阅读

- [c06: Subagent](c06-subagent-fork.md) - 子 Agent 的任务分配
- [c03: Permission Model](c03-permission-model.md) - 权限与任务
- 源码: `src/tasks/`, `src/tools/TaskCreateTool/`

---

**下一章**: [c09: Bridge & IDE](c09-bridge-ide.md) →