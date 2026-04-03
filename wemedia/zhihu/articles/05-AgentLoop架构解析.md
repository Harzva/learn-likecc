# 51万行代码揭秘：Claude Code 的 Agent Loop 如何工作？

> 一个循环 + 工具集 = AI 代理的核心引擎

---

## Agent Loop：AI 代理的心脏

Claude Code 的核心是什么？不是复杂的算法，不是神秘的技术，而是一个简单却强大的循环：

```typescript
while (!finished) {
  const response = await callClaude(userMessage)
  if (response.toolCalls) {
    const results = await executeTools(response.toolCalls)
    userMessage = results
  } else {
    finished = true
  }
}
```

这就是 Agent Loop，AI 代理的心脏。

---

## 完整架构解析

泄露源码显示，Agent Loop 的完整架构是这样的：

```
┌─────────────────────────────────────────────────────┐
│                   Agent Loop                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│   │ Context │───▶│   LLM   │───▶│ Parser  │       │
│   │ Manager │    │  Call   │    │         │       │
│   └─────────┘    └────┬────┘    └────┬────┘       │
│        │              │              │             │
│        │         ┌────┴────┐        │             │
│        │         │         │        │             │
│        │    ┌────┴────┐    │   ┌────┴────┐       │
│        │    │ Tool    │    │   │ Message │       │
│        │    │ Execute │◀───┼───│ Output  │       │
│        │    └────┬────┘    │   └─────────┘       │
│        │         │         │                      │
│        └─────────┴─────────┘                      │
│                  │                                 │
│                  ▼                                 │
│            [Next Iteration]                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 核心组件

```typescript
// QueryEngine 核心结构
class QueryEngine {
  private context: ContextManager
  private tools: ToolRegistry
  private permissions: PermissionSystem

  async run(initialMessage: Message): Promise<void> {
    let currentMessage = initialMessage

    while (true) {
      // 1. 构建 API 请求
      const request = this.buildRequest(currentMessage)

      // 2. 调用 Claude API
      const response = await this.callAPI(request)

      // 3. 处理响应
      if (response.stop_reason === 'tool_use') {
        // 执行工具
        const toolResults = await this.executeTools(response.tool_calls)
        currentMessage = this.appendResults(toolResults)
      } else {
        // 结束循环
        break
      }
    }
  }
}
```

---

## 与 CodeX/OpenCode 架构对比

### CodeX 架构

```typescript
// OpenAI CodeX 风格
class CodeXAgent {
  async run(message: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
      tools: this.tools,
    })

    if (response.choices[0].message.tool_calls) {
      // 执行工具...
    }
  }
}
```

### OpenCode 架构

```typescript
// OpenCode 风格
class OpenCodeAgent {
  async run(message: string) {
    while (!this.finished) {
      const response = await this.llm.chat(this.messages)
      await this.handleResponse(response)
    }
  }
}
```

### 关键差异

| 特性 | Claude Code | CodeX | OpenCode |
|------|-------------|-------|----------|
| 循环控制 | 智能停止 | 单轮为主 | 配置化 |
| 上下文管理 | 自动压缩 | 固定窗口 | 手动管理 |
| 工具执行 | 并行+串行 | 串行 | 并行 |
| 权限控制 | 多层沙箱 | 无 | 可选 |

---

## Claude Code 的独特创新

### 1. 智能上下文压缩

```typescript
// 自动压缩机制
const CONTEXT_LIMIT = 200000  // 200K tokens

function manageContext(messages: Message[]): Message[] {
  const currentTokens = countTokens(messages)

  if (currentTokens > CONTEXT_LIMIT * 0.8) {
    // 触发压缩
    return compressMessages(messages)
  }

  return messages
}
```

### 2. 工具调用优化

```typescript
// 并行工具执行
async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
  const independent = toolCalls.filter(t => !t.dependsOn)
  const dependent = toolCalls.filter(t => t.dependsOn)

  // 并行执行独立工具
  const results1 = await Promise.all(
    independent.map(t => this.executeTool(t))
  )

  // 串行执行依赖工具
  const results2 = []
  for (const t of dependent) {
    results2.push(await this.executeTool(t))
  }

  return [...results1, ...results2]
}
```

### 3. 优雅的错误处理

```typescript
// 错误恢复机制
async handleToolError(error: Error, tool: Tool): Promise<ToolResult> {
  if (error instanceof PermissionDenied) {
    // 请求权限
    const granted = await this.requestPermission(tool)
    if (granted) {
      return this.executeTool(tool)
    }
  }

  if (error instanceof TimeoutError) {
    // 重试
    return this.executeTool(tool, { retry: true })
  }

  // 返回错误信息让 LLM 决定
  return {
    type: 'error',
    content: error.message,
  }
}
```

---

## 性能优化技巧

源码中发现了多个性能优化：

### 1. 流式响应处理

```typescript
// 边接收边处理
async *streamResponse(request: Request): AsyncGenerator<Chunk> {
  const stream = await anthropic.messages.stream(request)

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      yield event.delta
    }
  }
}
```

### 2. 工具预加载

```typescript
// 预加载常用工具
const TOOL_CACHE = new Map<string, Tool>()

function preloadTools() {
  const commonTools = ['read', 'write', 'bash', 'search']
  commonTools.forEach(name => {
    TOOL_CACHE.set(name, loadTool(name))
  })
}
```

### 3. 上下文缓存

```typescript
// 缓存常用上下文
const contextCache = new LRUCache<string, Context>({
  max: 100,
  ttl: 1000 * 60 * 30,  // 30 分钟
})
```

---

## 实战：手写一个简化版 Agent Loop

```typescript
class SimpleAgentLoop {
  private messages: Message[] = []

  constructor(private tools: Map<string, Tool>) {}

  async run(userInput: string): Promise<string> {
    this.messages.push({ role: 'user', content: userInput })

    while (true) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: this.messages,
        tools: Array.from(this.tools.values()),
      })

      // 添加助手消息
      this.messages.push({
        role: 'assistant',
        content: response.content,
      })

      // 检查是否需要工具调用
      if (response.stop_reason === 'tool_use') {
        const toolResults = await this.executeTools(response.content)
        this.messages.push({
          role: 'user',
          content: toolResults,
        })
      } else {
        // 提取文本响应
        return this.extractText(response.content)
      }
    }
  }

  private async executeTools(content: Content[]): Promise<Content[]> {
    const results: Content[] = []

    for (const block of content) {
      if (block.type === 'tool_use') {
        const tool = this.tools.get(block.name)
        if (tool) {
          const result = await tool.execute(block.input)
          results.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
          })
        }
      }
    }

    return results
  }
}
```

---

## 结语

Agent Loop 看起来简单，但 Claude Code 在细节上做了大量优化：

1. **智能上下文管理** - 自动压缩，永不超过限制
2. **高效工具执行** - 并行+串行混合策略
3. **优雅错误处理** - 让 LLM 参与决策

这就是为什么 Claude Code 能成为最好的 AI 编程助手之一。

> 一个循环 + 工具集 + 无数细节优化 = 优秀的 AI 代理

---

**作者**: Claude Code Course 团队
**日期**: 2026-04-03
**标签**: #ClaudeCode #AgentLoop #AI架构 #源码分析

---

> 本文基于 Claude Code 源码泄露事件分析，仅供技术学习研究。Claude Code 是 Anthropic 的产品。
