# Claude Code 架构学习笔记

## 核心架构概览

Claude Code 是一个基于 **React + Ink** 的终端 CLI 应用，使用 **Bun** 作为运行时。

### 技术栈总结

```
┌─────────────────────────────────────┐
│         Terminal UI Layer           │
│    (React + Ink Components)         │
├─────────────────────────────────────┤
│         Business Logic              │
│  (Commands + Tools + QueryEngine)   │
├─────────────────────────────────────┤
│         Service Layer               │
│ (API/MCP/LSP/Auth/Analytics/etc.)   │
├─────────────────────────────────────┤
│         Runtime Layer               │
│           (Bun)                     │
└─────────────────────────────────────┘
```

## 核心模块详解

### 1. 入口点 (`main.tsx`)

- 800KB 的巨型入口文件
- Commander.js CLI 解析
- 并行启动优化：
  - `startMdmRawRead()` - MDM 设置预读
  - `startKeychainPrefetch()` - 密钥预取
  - `profileCheckpoint()` - 启动性能分析

### 2. 查询引擎 (`QueryEngine.ts`)

- 46KB，核心 API 调用逻辑
- 流式响应处理
- 工具调用循环
- Thinking 模式支持
- Token 计数和成本追踪

### 3. 工具系统 (`tools/`)

每个工具独立模块化：

| 工具 | 文件 | 功能 |
|------|------|------|
| Bash | BashTool.ts | Shell 命令执行 |
| Read | FileReadTool.ts | 文件读取 |
| Write | FileWriteTool.ts | 文件创建 |
| Edit | FileEditTool.ts | 文件编辑 |
| Glob | GlobTool.ts | 文件搜索 |
| Grep | GrepTool.ts | 内容搜索 |
| Agent | AgentTool.ts | 子 Agent |

### 4. 命令系统 (`commands/`)

斜杠命令实现：

- `/commit` - Git 提交
- `/review` - 代码审查
- `/compact` - 上下文压缩
- `/mcp` - MCP 管理
- `/doctor` - 环境诊断

### 5. 桥接系统 (`bridge/`)

IDE 集成通信层：

- `replBridge.ts` (100KB) - REPL 桥接
- `bridgeMain.ts` (115KB) - 桥接主逻辑
- `bridgeMessaging.ts` - 消息协议
- JWT 认证、会话管理

## 设计模式学习

### 1. 并行预取

```typescript
// 启动时并行执行
startMdmRawRead();   // MDM 设置
startKeychainPrefetch(); // 密钥预取
// 这些 side-effects 在 import 之前执行
```

### 2. Feature Flags (Dead Code Elimination)

```typescript
import { feature } from 'bun:bundle'

// 编译时消除未使用代码
const coordinatorMode = feature('COORDINATOR_MODE')
  ? require('./coordinator/coordinatorMode.js')
  : null;
```

### 3. 惰性加载

```typescript
// 避免循环依赖的惰性 require
const getTeammateUtils = () => require('./utils/teammate.js')
```

### 4. React 状态管理

使用 Ink 的 React 上下文：

```typescript
// AppState 组件管理全局状态
<AppState>
  <QueryEngine />
  <ToolExecutor />
</AppState>
```

## 待深入研究方向

1. QueryEngine 的流式处理机制
2. Tool 权限系统 (`hooks/toolPermission/`)
3. MCP 协议集成 (`services/mcp/`)
4. Agent 子进程管理 (`tools/AgentTool/`)
5. Bridge IDE 集成协议