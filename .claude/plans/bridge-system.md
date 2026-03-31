# Bridge 系统分析

## 概述

Bridge 是 IDE 集成的通信层，连接 VS Code/JetBrains 扩展与 Claude Code CLI。

## 文件结构

| 文件 | 大小 | 功能 |
|------|------|------|
| bridgeMain.ts | 115KB | 主循环逻辑 |
| replBridge.ts | 100KB | REPL 会话桥接 |
| remoteBridgeCore.ts | 39KB | 远程桥接核心 |
| bridgeMessaging.ts | 15KB | 消息协议 |
| sessionRunner.ts | 18KB | 会话运行管理 |
| bridgeUI.ts | 16KB | UI 日志 |
| jwtUtils.ts | 9KB | JWT 认证 |
| bridgeApi.ts | 18KB | API 客户端 |

## 核心组件

### 1. BridgeConfig

```typescript
type BridgeConfig = {
  dir: string
  machineName: string
  branch: string
  gitRepoUrl: string | null
  maxSessions: number
  spawnMode: SpawnMode
  verbose: boolean
  sandbox: boolean
  bridgeId: string
}
```

### 2. 会话管理

```typescript
// 会话生成
type SessionSpawnOpts = {
  sessionId: string
  sdkUrl: string
  accessToken: string
  useCcrV2: boolean
  workerEpoch?: number
}

// 会话句柄
type SessionHandle = {
  pid: number
  // ...
}
```

### 3. 主循环 (runBridgeLoop)

```typescript
async function runBridgeLoop(
  config: BridgeConfig,
  environmentId: string,
  environmentSecret: string,
  api: BridgeApiClient,
  spawner: SessionSpawner,
  logger: BridgeLogger,
  signal: AbortSignal,
  backoffConfig: BackoffConfig,
  initialSessionId?: string,
)
```

## 通信协议

### 消息格式

```typescript
// inbound - 来自 IDE
type InboundMessage = {
  type: 'request' | 'response'
  payload: unknown
}

// outbound - 发往 IDE
type OutboundMessage = {
  type: 'event' | 'result'
  payload: unknown
}
```

### 认证流程

1. **JWT Token 获取**
   - 通过 `jwtUtils.ts` 管理
   - 自动刷新调度

2. **受信任设备**
   - `trustedDevice.ts` 处理设备信任
   - 获取设备令牌

## 关键特性

### 1. 多会话支持

```typescript
// GrowthBook 门控
async function isMultiSessionSpawnEnabled(): Promise<boolean> {
  return checkGate_CACHED_OR_BLOCKING('tengu_ccr_bridge_multi_session')
}

const SPAWN_SESSIONS_DEFAULT = 32
```

### 2. 退避策略

```typescript
const DEFAULT_BACKOFF: BackoffConfig = {
  connInitialMs: 2_000,
  connCapMs: 120_000,     // 2 分钟
  connGiveUpMs: 600_000,  // 10 分钟
  generalInitialMs: 500,
  generalCapMs: 30_000,
  generalGiveUpMs: 600_000,
}
```

### 3. 睡眠检测

```typescript
function pollSleepDetectionThresholdMs(backoff: BackoffConfig): number {
  return backoff.connCapMs * 2
}
```

## 会话启动模式

```typescript
// SpawnMode 类型
type SpawnMode = 'worktree' | 'same-dir' | 'capacity'

// 脚本参数处理
function spawnScriptArgs(): string[] {
  if (isInBundledMode() || !process.argv[1]) {
    return []
  }
  return [process.argv[1]]
}
```

## 与 IDE 交互

1. VS Code 扩展通过 WebSocket 连接
2. Bridge 接收请求，启动 CLI 会话
3. 会话输出流式返回 IDE
4. 权限请求通过 Bridge 转发

## 工作树隔离

```typescript
import { createAgentWorktree, removeAgentWorktree } from '../utils/worktree.js'
```

每个会话可在独立的 git worktree 中运行，避免冲突。
