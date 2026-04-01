# c05: Context Compression (上下文压缩)

`c01 > c02 > c03 > c04 | [ c05 ] > c06 > c07 > c08 | c09 > c10 > c11 > c12`

> *"Context is finite, but conversation is infinite"* -- 压缩是长对话的生存之道。
>
> **Harness 层**: Compact -- 让对话突破上下文限制。

## 问题

Agent Loop 持续累积消息:
- 模型有上下文窗口限制 (200K tokens)
- 消息累积会超出限制
- 重要信息可能被截断
- API 成本随 token 增长

## 解决方案

Claude Code 实现了多层压缩策略:

```
Token Usage
    │
    ├── < Warning ──────── 提醒用户
    │
    ├── < AutoCompact ──── 自动压缩
    │
    └── < Error ────────── 强制压缩
```

## 源码分析

### 阈值计算

```typescript
// 源码位置: src/services/compact/autoCompact.ts

const MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20_000
const AUTOCOMPACT_BUFFER_TOKENS = 13_000

function getAutoCompactThreshold(model: string): number {
  const contextWindow = getContextWindowForModel(model)
  const effectiveWindow = contextWindow - MAX_OUTPUT_TOKENS_FOR_SUMMARY
  return effectiveWindow - AUTOCOMPACT_BUFFER_TOKENS
}
```

### Token 警告状态

```typescript
type TokenWarningState = {
  percentLeft: number              // 剩余百分比
  isAboveWarningThreshold: boolean // 是否超过警告
  isAboveErrorThreshold: boolean   // 是否超过错误
  isAboveAutoCompactThreshold: boolean // 是否触发自动压缩
}
```

### 压缩流程

```typescript
// 源码位置: src/services/compact/compact.ts

async function compact(
  messages: Message[],
  config: CompactConfig
): Promise<CompactResult> {
  
  // 1. 执行预压缩 hooks
  await executePreCompactHooks(messages)
  
  // 2. 分析上下文
  const analysis = analyzeContext(messages)
  
  // 3. 生成摘要
  const summary = await generateSummary(messages, analysis)
  
  // 4. 创建压缩边界消息
  const boundaryMessage: SystemCompactBoundaryMessage = {
    role: 'system',
    type: 'compact_boundary',
    content: summary,
    originalMessages: messages,
    tokenStats: {
      before: analysis.totalTokens,
      after: estimateTokens(summary),
      saved: analysis.totalTokens - estimateTokens(summary),
    },
  }
  
  // 5. 替换历史
  const newMessages = [boundaryMessage, ...messages.slice(-keepRecent)]
  
  // 6. 执行后压缩 hooks
  await executePostCompactHooks(newMessages)
  
  return { messages: newMessages, stats: boundaryMessage.tokenStats }
}
```

### 压缩边界消息

```typescript
type SystemCompactBoundaryMessage = {
  role: 'system'
  type: 'compact_boundary'
  content: string             // 摘要内容
  originalMessages: Message[] // 原始消息 (可恢复)
  tokenStats: {
    before: number
    after: number
    saved: number
  }
}
```

## 压缩类型

### 1. 自动压缩 (Auto Compact)

```typescript
// 触发条件: token > threshold
if (tokenUsage > autoCompactThreshold) {
  await compact(messages)
}
```

**特点**:
- 无用户干预
- 智能保留关键信息
- 失败保护机制

### 2. 手动压缩 (/compact)

```typescript
// 用户触发
commands.register({
  name: 'compact',
  action: async () => {
    await compact(messages, { mode: 'manual' })
  },
})
```

**特点**:
- 用户主动触发
- 保留更多上下文
- 显示压缩统计

### 3. 微型压缩 (Micro Compact)

```typescript
// 针对特定消息
async function microCompact(
  messages: Message[],
  target: MessageSelector
) {
  // 只压缩选中的消息
}
```

### 4. 会话记忆压缩

```typescript
// 压缩 memory 内容
async function sessionMemoryCompact(
  memory: SessionMemory
) {
  // 保留关键记忆，压缩冗余
}
```

## 失败保护

```typescript
const MAX_CONSECUTIVE_FAILURES = 3

let consecutiveFailures = 0

async function safeCompact() {
  try {
    await compact()
    consecutiveFailures = 0
  } catch (error) {
    consecutiveFailures++
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      // 停止自动压缩，提醒用户
      notifyUser('Auto-compact failed repeatedly')
    }
  }
}
```

## 设计模式

### 1. 策略模式

不同压缩策略可互换:

```typescript
const strategies = {
  auto: autoCompactStrategy,
  manual: manualCompactStrategy,
  micro: microCompactStrategy,
}
```

### 2. 模板方法

压缩流程模板:

```typescript
async function compact() {
  await preCompact()      // 钩子
  const result = await doCompact()  // 核心
  await postCompact()     // 钩子
  return result
}
```

### 3. 装饰器模式

压缩边界消息装饰原始消息:

```typescript
const boundary = createBoundary(summary, originalMessages)
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Context | 无限累积 | 智能压缩 |
| Threshold | 无 | 多级阈值 |
| Recovery | 无 | 原始消息保留 |
| Hooks | 无 | 预/后压缩钩子 |

## 实践练习

### 练习 1: 实现 Token 计数器

```typescript
function countTokens(messages: Message[]): number {
  // TODO: 估算 token 数量
}
```

### 练习 2: 实现简单压缩器

```typescript
async function simpleCompact(
  messages: Message[],
  keepRecent: number = 5
): Promise<Message[]> {
  // TODO: 保留最近的 N 条消息，其余用摘要替换
}
```

### 练习 3: 添加压缩阈值检测

```typescript
function checkThreshold(
  currentTokens: number,
  maxTokens: number
): TokenWarningState {
  // TODO: 计算并返回警告状态
}
```

## 思考题

1. 摘要应该保留哪些信息？如何判断"重要"？
2. 为什么需要保留原始消息？这会带来什么问题？
3. 如何在压缩率和信息完整性之间取得平衡？

## 延伸阅读

- [c01: Agent Loop](c01-agent-loop.md) - 消息累积的来源
- [c06: Subagent](c06-subagent-fork.md) - 子 Agent 的独立上下文
- 源码: `src/services/compact/`

---

**下一章**: [c06: Subagent & Fork](c06-subagent-fork.md) →