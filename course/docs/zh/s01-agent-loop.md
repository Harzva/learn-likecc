# c01: The Agent Loop (智能体循环)

`[ c01 ] c02 > c03 > c04 | c05 > c06 > c07 > c08 | c09 > c10 > c11 > c12`

> *"One loop & Bash is all you need"* -- 一个工具 + 一个循环 = 一个智能体。
>
> **Harness 层**: 循环 -- 模型与真实世界的第一道连接。

## 问题

语言模型能推理代码，但碰不到真实世界 -- 不能读文件、跑测试、看报错。没有循环，每次工具调用你都得手动把结果粘回去。你自己就是那个循环。

## 解决方案

Claude Code 的核心是一个无限循环，持续运行直到模型不再调用工具：

```
+--------+      +-------+      +---------+
|  User  | ---> |  LLM  | ---> |  Tool   |
| prompt |      |       |      | execute |
+--------+      +---+---+      +----+----+
                    ^                |
                    |   tool_result  |
                    +----------------+
                    (loop until stop_reason != "tool_use")
```

## 源码分析

### QueryEngine.ts 核心结构

```typescript
// 源码位置: src/QueryEngine.ts

export type QueryEngineConfig = {
  cwd: string                    // 工作目录
  tools: Tools                   // 可用工具
  commands: Command[]            // 斜杠命令
  mcpClients: MCPServerConnection[]  // MCP 客户端
  agents: AgentDefinition[]      // Agent 定义
  canUseTool: CanUseToolFn       // 工具可用性检查
  getAppState: () => AppState    // 状态获取
  setAppState: (f) => void       // 状态更新
  // ...
}
```

### Agent Loop 伪代码

```typescript
async function agentLoop(query: string, config: QueryEngineConfig) {
  const messages: Message[] = [
    { role: 'user', content: query }
  ]

  while (true) {
    // 1. 调用 LLM
    const response = await anthropic.messages.create({
      model: config.mainLoopModel,
      system: systemPrompt,
      messages: messages,
      tools: config.tools,
      max_tokens: 8000,
    })

    // 2. 追加助手响应
    messages.push({ role: 'assistant', content: response.content })

    // 3. 检查退出条件
    if (response.stop_reason !== 'tool_use') {
      return messages
    }

    // 4. 执行工具调用
    const toolResults = []
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const output = await executeTool(block.name, block.input, config)
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: output,
        })
      }
    }

    // 5. 追加工具结果
    messages.push({ role: 'user', content: toolResults })
  }
}
```

### 关键设计点

#### 1. 消息累积

```typescript
// 消息持续累积，形成完整对话历史
messages: Message[]

// 每次循环追加两条消息
messages.push(assistantMessage)  // 助手响应
messages.push(userMessage)       // 工具结果
```

#### 2. 退出条件

```typescript
// 只有 stop_reason 不是 "tool_use" 才退出
if (response.stop_reason !== 'tool_use') {
  return  // 可能是 "end_turn", "max_tokens", "stop_sequence"
}
```

#### 3. 工具执行隔离

```typescript
// 每个工具独立执行，结果收集后一起返回
for (const block of response.content) {
  if (block.type === 'tool_use') {
    const output = await executeTool(block.name, block.input)
    results.push(output)
  }
}
```

## 设计模式

### 1. 懒加载优化

```typescript
// 启动时预取，减少首次调用延迟
startMdmRawRead()      // MDM 设置预读
startKeychainPrefetch() // 密钥预取
```

### 2. Feature Flags

```typescript
import { feature } from 'bun:bundle'

// 编译时消除未使用代码
const proactiveModule = feature('PROACTIVE')
  ? require('./proactive/index.js')
  : null
```

### 3. 错误重试

```typescript
// withRetry.ts 中的重试逻辑
async function withRetry(fn, options) {
  let lastError
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (!isRetryable(error)) throw error
      lastError = error
      await sleep(backoff(attempt))
    }
  }
  throw lastError
}
```

## 变更内容

| 组件          | 之前       | 之后                           |
|---------------|------------|--------------------------------|
| Agent loop    | (无)       | `while (true)` + stop_reason   |
| Tools         | (无)       | 完整工具集                     |
| Messages      | (无)       | 累积式消息列表                 |
| Control flow  | (无)       | `stop_reason !== "tool_use"`   |

## 实践练习

### 练习 1: 最小 Agent Loop

实现一个最小化的 Agent Loop，只支持 Bash 工具：

```typescript
// TODO: 实现以下函数
async function minimalAgentLoop(prompt: string) {
  // 1. 初始化消息
  // 2. 循环调用 API
  // 3. 执行 Bash 命令
  // 4. 返回结果
}
```

### 练习 2: 添加工具支持

扩展上述实现，支持 Read/Write/Edit 工具。

### 思考题

1. 为什么使用 `stop_reason` 而不是检查 `content` 中是否有工具调用？
2. 消息累积会导致什么问题？如何解决？
3. 如何处理工具执行失败的情况？

## 延伸阅读

- [c02: Tool System](c02-tool-system.md) - 工具系统的实现
- [c05: Context Compression](c05-context-compression.md) - 消息累积的解决方案
- 源码: `src/QueryEngine.ts`, `src/query.ts`

---

**下一章**: [c02: Tool System](c02-tool-system.md) →