# Services 服务层分析

## 概述

Services 层提供核心功能服务，包括 API 调用、分析、MCP 等。

## 目录结构

| 目录/文件 | 大小 | 功能 |
|-----------|------|------|
| api/ | - | API 客户端层 |
| api/claude.ts | 126KB | Claude API 核心 |
| api/client.ts | 16KB | API 客户端配置 |
| api/errors.ts | 42KB | 错误处理 |
| api/withRetry.ts | 28KB | 重试逻辑 |
| analytics/ | - | 分析服务 |
| mcp/ | - | MCP 协议 |
| compact/ | - | 上下文压缩 |
| lsp/ | - | 语言服务器 |
| oauth/ | - | OAuth 认证 |
| plugins/ | - | 插件系统 |

## API 服务层 (api/)

### claude.ts - 核心 API 调用

```typescript
// 主要导入
import type {
  BetaMessage,
  BetaMessageStreamParams,
  BetaToolUnion,
  BetaUsage,
  MessageParam
} from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'

// 核心功能
- 流式消息处理
- 工具调用管理
- Token 统计
- 错误处理
```

### client.ts - 客户端配置

```typescript
import Anthropic, { type ClientOptions } from '@anthropic-ai/sdk'

// 客户端创建
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // ...
})
```

### withRetry.ts - 重试机制

- 指数退避重试
- 错误分类处理
- 最大重试次数

## Analytics 服务

### GrowthBook 集成

```typescript
import { GrowthBook } from '@growthbook/growthbook'

// Feature flags
const isEnabled = checkGate('feature_name')

// A/B 测试
const value = getFeatureValue('experiment_name', defaultValue)
```

### 事件追踪

```typescript
logEvent('event_name', {
  property: 'value',
  // ...
})
```

## 服务层架构

```
┌─────────────────────────────────────┐
│          Business Logic             │
│   (Tools, Commands, QueryEngine)    │
├─────────────────────────────────────┤
│          Service Layer              │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │   API   │ │  MCP    │ │  LSP   ││
│  └─────────┘ └─────────┘ └────────┘│
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │Analytics│ │  OAuth  │ │Plugins ││
│  └─────────┘ └─────────┘ └────────┘│
├─────────────────────────────────────┤
│         External Services           │
│  Anthropic API │ MCP Servers │ IDEs │
└─────────────────────────────────────┘
```

## 关键服务

### 1. Token 估算服务
```typescript
// services/tokenEstimation.ts
function estimateTokens(content: string): number
```

### 2. 提示缓存检测
```typescript
// services/api/promptCacheBreakDetection.ts
function detectCacheBreak(messages: Message[]): boolean
```

### 3. 会话存储
```typescript
// services/SessionMemory/
function persistSession(session: Session): void
function loadSession(id: string): Session
```

## 设计亮点

### 1. 模块化
每个服务独立目录，职责清晰

### 2. 错误隔离
服务层错误不影响上层逻辑

### 3. 可测试性
服务接口清晰，易于 mock

### 4. 惰性加载
重量级服务按需初始化