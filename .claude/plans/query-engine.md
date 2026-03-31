# QueryEngine 分析

## 概述

QueryEngine 是 Claude Code 的核心组件，负责：
- 与 Anthropic API 通信
- 流式响应处理
- 工具调用循环
- 上下文管理

## 配置结构

```typescript
type QueryEngineConfig = {
  cwd: string                    // 工作目录
  tools: Tools                   // 可用工具
  commands: Command[]            // 斜杠命令
  mcpClients: MCPServerConnection[]  // MCP 客户端
  agents: AgentDefinition[]      // Agent 定义
  canUseTool: CanUseToolFn       // 工具可用性检查
  getAppState: () => AppState    // 状态获取
  setAppState: (f) => void       // 状态更新
  initialMessages?: Message[]    // 初始消息
  readFileCache: FileStateCache  // 文件缓存
  customSystemPrompt?: string    // 自定义系统提示
  thinkingConfig?: ThinkingConfig // 思考模式配置
  maxTurns?: number              // 最大轮次
  maxBudgetUsd?: number          // 预算限制
  taskBudget?: { total: number } // 任务预算
}
```

## 核心流程

```
用户输入
    ↓
processUserInput()     // 处理用户输入
    ↓
query()               // 调用 API
    ↓
流式响应
    ↓
工具调用? ──是──→ 执行工具 → 继续查询
    │
    否
    ↓
返回响应
```

## 关键导入

### API 层
```typescript
import { accumulateUsage, updateUsage } from 'src/services/api/claude.js'
import { query } from './query.js'
```

### 消息处理
```typescript
import { processUserInput } from './utils/processUserInput/processUserInput.js'
import { countToolCalls } from './utils/messages.js'
```

### 状态管理
```typescript
import { getSessionId } from 'src/bootstrap/state.js'
import { getModelUsage, getTotalCost } from './cost-tracker.js'
```

## Feature Flags 使用

```typescript
// 条件导入 - 编译时消除
const getCoordinatorUserContext = feature('COORDINATOR_MODE')
  ? require('./coordinator/coordinatorMode.js').getCoordinatorUserContext
  : () => ({})

const snipModule = feature('HISTORY_SNIP')
  ? require('./services/compact/snipCompact.js')
  : null
```

## 设计亮点

### 1. 惰性加载
```typescript
// 避免加载重量级 React 组件
const messageSelector = () =>
  require('src/components/MessageSelector.js')
```

### 2. 内存管理
- 文件状态缓存
- 会话持久化控制
- 历史快照

### 3. 成本追踪
- Token 计数
- API 调用时长
- 预算限制检查
