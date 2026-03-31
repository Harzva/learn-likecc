# Compact 上下文压缩系统分析

## 概述

Compact 系统负责压缩对话上下文，避免超出模型上下文窗口限制。

## 核心文件

| 文件 | 大小 | 功能 |
|------|------|------|
| compact.ts | 61KB | 主压缩逻辑 |
| autoCompact.ts | 13KB | 自动压缩触发 |
| microCompact.ts | 20KB | 微型压缩 |
| sessionMemoryCompact.ts | 21KB | 会话记忆压缩 |
| prompt.ts | 16KB | 压缩提示生成 |
| postCompactCleanup.ts | 4KB | 压缩后清理 |

## 触发机制

### 阈值计算

```typescript
// 上下文窗口计算
const MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20_000
const AUTOCOMPACT_BUFFER_TOKENS = 13_000

function getAutoCompactThreshold(model: string): number {
  const effectiveContextWindow =
    getContextWindowForModel(model) - MAX_OUTPUT_TOKENS_FOR_SUMMARY
  return effectiveContextWindow - AUTOCOMPACT_BUFFER_TOKENS
}
```

### 警告状态

```typescript
type TokenWarningState = {
  percentLeft: number
  isAboveWarningThreshold: boolean
  isAboveErrorThreshold: boolean
  isAboveAutoCompactThreshold: boolean
}
```

### 连续失败保护

```typescript
const MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3
// 避免无限重试浪费 API 调用
```

## 自动压缩追踪状态

```typescript
type AutoCompactTrackingState = {
  compacted: boolean
  turnCounter: number
  turnId: string
  consecutiveFailures?: number
}
```

## 压缩流程

```
1. 检测触发条件
   └── tokenUsage > autoCompactThreshold

2. 执行前置 hooks
   └── executePreCompactHooks()

3. 分析上下文
   └── analyzeContext(messages)

4. 生成摘要
   ├── 创建摘要请求
   ├── 调用 API 生成摘要
   └── 处理结果

5. 创建压缩边界消息
   └── createCompactBoundaryMessage()

6. 替换历史消息
   └── 旧消息 → 摘要消息

7. 执行后置 hooks
   └── executePostCompactHooks()

8. 清理工作
   └── runPostCompactCleanup()
```

## 压缩类型

### 1. 自动压缩 (Auto Compact)
- 触发: token 超过阈值
- 自动执行，用户无感知

### 2. 手动压缩 (/compact)
- 用户触发
- 保留更多上下文

### 3. 微型压缩 (Micro Compact)
- 针对特定消息
- 更精细的控制

### 4. 会话记忆压缩
- 压缩记忆内容
- 保留关键信息

## 压缩边界消息

```typescript
type SystemCompactBoundaryMessage = {
  role: 'system'
  type: 'compact_boundary'
  content: string  // 摘要内容
  originalMessages: Message[]  // 被压缩的原始消息
  tokenStats: {
    before: number
    after: number
    saved: number
  }
}
```

## 设计亮点

### 1. 多层保护
- Warning threshold → 提醒用户
- Error threshold → 强制压缩
- Auto threshold → 自动触发

### 2. 智能摘要
- 使用 LLM 生成摘要
- 保留关键信息
- 记录被压缩内容

### 3. Hook 集成
- 预压缩 hook
- 后压缩 hook
- 支持自定义处理

### 4. 失败保护
- 连续失败计数
- 最大重试限制
- 优雅降级

### 5. 上下文分析
```typescript
analyzeContext(messages)
  → 统计 token 使用
  → 识别重要消息
  → 生成压缩策略
```
