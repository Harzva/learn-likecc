# c02: Tool System (工具系统)

`c01 > [ c02 ] > c03 > c04 | c05 > c06 > c07 > c08 | c09 > c10 > c11 > c12`

> *"Tools are the hands of the Agent"* -- 工具是 Agent 与真实世界交互的接口。
>
> **Harness 层**: Tools -- 将模型能力转化为真实世界操作。

## 问题

Agent Loop 提供了循环框架，但没有工具，Agent 只能"思考"不能"行动"。需要定义:
- 工具如何描述自己 (让模型理解)
- 工具如何验证输入 (防止错误)
- 工具如何执行操作 (产生结果)
- 工具如何报告状态 (给用户反馈)

## 解决方案

Claude Code 使用统一的工具构建系统:

```
+------------+     +-------------+     +----------+
| Tool Def   | --> | Permission  | --> | Execute  |
| (schema)   |     | (check)     |     | (action) |
+------------+     +-------------+     +----------+
      |                   |                 |
      v                   v                 v
   Model knows        User confirms      Result back
   how to call        if needed          to loop
```

## 源码分析

### Tool.ts 核心结构

```typescript
// 源码位置: src/Tool.ts

import { z } from 'zod'

export type ToolDef<TInput, TContext> = {
  name: string                          // 工具名称
  inputSchema: z.ZodSchema<TInput>      // 输入验证
  description: string                   // 工具描述
  
  // 权限检查
  hasPermission?: (
    params: TInput,
    context: TContext
  ) => Promise<PermissionResult>
  
  // 执行逻辑
  execute: (
    params: TInput,
    context: TContext
  ) => Promise<ToolResult>
  
  // UI 渲染
  renderToolUseMessage?: (params: TInput) => React.ReactNode
  renderToolResultMessage?: (result: ToolResult) => React.ReactNode
}

export function buildTool<TInput, TContext>(
  def: ToolDef<TInput, TContext>
): Tool<TInput, TContext> {
  return {
    name: def.name,
    description: def.description,
    input_schema: zodToAnthropicSchema(def.inputSchema),
    // 内部方法
    _execute: def.execute,
    _hasPermission: def.hasPermission,
  }
}
```

### Anthropic Tool Schema 转换

```typescript
// Zod Schema → Anthropic JSON Schema
function zodToAnthropicSchema(schema: z.ZodSchema): Anthropic.Tool.InputSchema {
  // Claude API 使用 JSON Schema 格式
  return {
    type: 'object',
    properties: extractProperties(schema),
    required: extractRequired(schema),
  }
}
```

### 工具注册

```typescript
// 源码位置: src/tools.ts

export async function getTools(config: QueryEngineConfig): Promise<Tool[]> {
  const tools: Tool[] = []
  
  // 基础工具
  tools.push(BashTool)
  tools.push(ReadTool)
  tools.push(WriteTool)
  tools.push(EditTool)
  tools.push(GlobTool)
  tools.push(GrepTool)
  
  // Agent 工具
  if (feature('SUBAGENT')) {
    tools.push(AgentTool)
  }
  
  // MCP 工具 (动态加载)
  for (const mcpClient of config.mcpClients) {
    const mcpTools = await mcpClient.listTools()
    tools.push(...mcpTools)
  }
  
  return tools
}
```

### 工具生命周期

```typescript
// 源码位置: src/query.ts

async function handleToolUse(block: ToolUseBlock, config: QueryEngineConfig) {
  const tool = findTool(block.name, config.tools)
  
  // 1. 解析输入
  const params = tool.inputSchema.parse(block.input)
  
  // 2. 权限检查
  const permission = await tool.hasPermission?.(params, config)
  if (permission === 'denied') {
    return { error: 'Permission denied' }
  }
  if (permission === 'ask') {
    const userChoice = await askUserPermission(block.name, params)
    if (userChoice === 'deny') {
      return { error: 'User denied' }
    }
  }
  
  // 3. 执行
  const result = await tool.execute(params, config)
  
  // 4. 返回结果
  return {
    type: 'tool_result',
    tool_use_id: block.id,
    content: result.output,
    is_error: result.isError,
  }
}
```

## 核心工具详解

### BashTool (160KB)

**功能**: 执行 Shell 命令

```typescript
const BashTool = buildTool({
  name: 'Bash',
  description: 'Execute a bash command in the terminal',
  inputSchema: z.object({
    command: z.string().describe('The command to execute'),
    timeout: z.number().optional().default(120000),
    description: z.string().optional(),
  }),
  
  // 安全检查
  hasPermission: async (params, context) => {
    const risk = analyzeCommandRisk(params.command)
    if (risk === 'high') return 'ask'
    if (risk === 'medium') return context.permissionMode === 'auto' ? 'allow' : 'ask'
    return 'allow'
  },
  
  // 执行逻辑
  execute: async (params, context) => {
    // 沙箱检测
    if (needsSandbox(params.command)) {
      return executeInSandbox(params.command, context)
    }
    return executeDirectly(params.command, context)
  },
})
```

**命令分类**:

| 类型 | 命令 | 显示方式 |
|------|------|----------|
| Search | find, grep, rg | 可折叠 |
| Read | cat, head, tail | 可折叠 |
| List | ls, tree, du | 可折叠 |
| Silent | mv, cp, rm | "Done" |

### ReadTool

**功能**: 读取文件内容

```typescript
const ReadTool = buildTool({
  name: 'Read',
  description: 'Read a file from the filesystem',
  inputSchema: z.object({
    file_path: z.string().describe('The absolute path to read'),
    offset: z.number().optional(),
    limit: z.number().optional(),
  }),
  
  execute: async (params) => {
    const content = await readFile(params.file_path)
    return { output: content }
  },
})
```

### WriteTool

**功能**: 创建或覆写文件

```typescript
const WriteTool = buildTool({
  name: 'Write',
  description: 'Write content to a file',
  inputSchema: z.object({
    file_path: z.string(),
    content: z.string(),
  }),
  
  hasPermission: async (params) => {
    // 新文件: 自动允许
    // 已有文件: 需确认
    const exists = await fileExists(params.file_path)
    return exists ? 'ask' : 'allow'
  },
  
  execute: async (params) => {
    await writeFile(params.file_path, params.content)
    return { output: 'File written successfully' }
  },
})
```

### EditTool

**功能**: 精确替换文件内容

```typescript
const EditTool = buildTool({
  name: 'Edit',
  description: 'Edit a file with exact string replacement',
  inputSchema: z.object({
    file_path: z.string(),
    old_string: z.string(),
    new_string: z.string(),
    replace_all: z.boolean().optional().default(false),
  }),
  
  execute: async (params) => {
    const content = await readFile(params.file_path)
    
    // 检查唯一性
    const matches = countMatches(content, params.old_string)
    if (matches === 0) {
      return { error: 'old_string not found' }
    }
    if (matches > 1 && !params.replace_all) {
      return { error: 'old_string is not unique' }
    }
    
    // 替换
    const newContent = replace(content, params.old_string, params.new_string)
    await writeFile(params.file_path, newContent)
    
    return { output: 'Edit applied successfully' }
  },
})
```

## 设计模式

### 1. 构建器模式

统一工具定义接口，降低实现复杂度:

```typescript
buildTool({ name, inputSchema, execute, ... })
```

### 2. 验证分层

```typescript
// Zod Schema 验证 (结构)
inputSchema.parse(input)

// 权限验证 (策略)
hasPermission(params, context)

// 业务验证 (内容)
execute() 内部检查
```

### 3. 沙箱隔离

```typescript
// 安全命令: 直接执行
ls, cat, grep → directExecute()

// 危险命令: 沙箱执行  
rm -rf, curl → sandboxExecute()
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Tool API | 无 | `buildTool()` 统一接口 |
| Validation | 无 | Zod Schema + 权限检查 |
| Execution | 无 | 直接 + 沙箱双模式 |
| UI | 无 | React 组件渲染 |

## 实践练习

### 练习 1: 实现最小工具系统

```typescript
// TODO: 实现以下函数
function buildMinimalTool(name: string, schema: any, execute: Function) {
  // 返回 Anthropic API 格式的工具定义
}

const tools = [
  buildMinimalTool('echo', { text: 'string' }, (input) => input.text),
  buildMinimalTool('add', { a: 'number', b: 'number' }, (input) => input.a + input.b),
]
```

### 练习 2: 添加权限检查

为上述工具添加 `hasPermission` 方法:
- `echo`: 无限制
- `add`: 需要 `math` 权限

### 练习 3: 实现工具注册系统

```typescript
class ToolRegistry {
  register(tool: Tool)
  find(name: string): Tool | undefined
  list(): Tool[]
}
```

## 思考题

1. 为什么使用 Zod 而不是直接用 JSON Schema？
2. 工具的权限检查应该在哪个层级？为什么？
3. 如何处理工具执行的超时情况？

## 延伸阅读

- [c03: Permission Model](c03-permission-model.md) - 权限系统的详细设计
- [c06: Subagent & Fork](c06-subagent-fork.md) - Agent 工具的特殊处理
- 源码: `src/Tool.ts`, `src/tools/BashTool/`, `src/tools.ts`

---

**下一章**: [c03: Permission Model](c03-permission-model.md) →