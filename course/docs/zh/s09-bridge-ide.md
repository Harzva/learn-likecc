# c09: Bridge & IDE (桥接与IDE集成)

`c01 > c02 > c03 > c04 | c05 > c06 > c07 > c08 | [ c09 ] > c10 > c11 > c12`

> *"Bridge connects CLI to IDE"* -- 无缝集成，极致体验。
>
> **Harness 层**: Bridge -- IDE 扩展通信桥梁。

## 问题

CLI 工具局限:
- 无法直接编辑文件
- 无法显示富文本
- 无法访问 IDE 功能
- 无法与编辑器状态同步

IDE 扩展需要:
- 调用 Claude 能力
- 显示 AI 输出
- 处理权限请求
- 同步文件状态

## 解决方案

Bridge 是 CLI 与 IDE 之间的通信层:

```
+-------------+     WebSocket     +-------------+
| VS Code     | <----------------> | Bridge      |
| Extension   |                    | Server      |
+-------------+                    +------+------+
                                          |
                                    +-----+-----+
                                    | Claude    |
                                    | Code CLI  |
                                    +-----------+
```

## 源码分析

### Bridge 配置

```typescript
// 源码位置: src/bridge/bridgeMain.ts

type BridgeConfig = {
  dir: string              // 工作目录
  machineName: string      // 机器标识
  branch: string           // Git 分支
  gitRepoUrl: string | null
  maxSessions: number      // 最大会话数
  spawnMode: SpawnMode     // 启动模式
  verbose: boolean
  sandbox: boolean
  bridgeId: string         // 桥接ID
}

type SpawnMode = 'worktree' | 'same-dir' | 'capacity'
```

### 会话管理

```typescript
type SessionSpawnOpts = {
  sessionId: string
  sdkUrl: string
  accessToken: string
  useCcrV2: boolean
  workerEpoch?: number
}

type SessionHandle = {
  pid: number
  stdin: Writable
  stdout: Readable
  stderr: Readable
}
```

### 主循环

```typescript
// 源码位置: src/bridge/bridgeMain.ts

async function runBridgeLoop(
  config: BridgeConfig,
  environmentId: string,
  environmentSecret: string,
  api: BridgeApiClient,
  spawner: SessionSpawner,
  logger: BridgeLogger,
  signal: AbortSignal,
  backoffConfig: BackoffConfig,
): Promise<void> {
  
  while (!signal.aborted) {
    try {
      // 1. 连接到 IDE
      const connection = await connectToIDE(config, api)
      
      // 2. 等待会话请求
      for await (const request of connection.requests) {
        // 3. 启动会话
        const session = await spawner.spawn(request)
        
        // 4. 流式转发输出
        streamOutput(session, connection)
      }
    } catch (error) {
      // 退避重试
      await backoff(backoffConfig)
    }
  }
}
```

### 消息协议

```typescript
// 源码位置: src/bridge/bridgeMessaging.ts

// 入站消息 (IDE → Bridge)
type InboundMessage =
  | { type: 'request'; payload: SessionRequest }
  | { type: 'response'; payload: UserResponse }

// 出站消息 (Bridge → IDE)
type OutboundMessage =
  | { type: 'event'; payload: SessionEvent }
  | { type: 'result'; payload: SessionResult }

type SessionEvent =
  | { kind: 'output'; text: string }
  | { kind: 'permission'; request: PermissionRequest }
  | { kind: 'status'; status: string }
```

### JWT 认证

```typescript
// 源码位置: src/bridge/jwtUtils.ts

async function getAccessToken(
  environmentId: string,
  environmentSecret: string
): Promise<string> {
  // 使用环境凭证获取 JWT
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: {
      'X-Environment-Id': environmentId,
      'X-Environment-Secret': environmentSecret,
    },
  })
  
  return response.json().access_token
}
```

## 退避策略

```typescript
const DEFAULT_BACKOFF: BackoffConfig = {
  connInitialMs: 2_000,      // 初始等待 2 秒
  connCapMs: 120_000,        // 最大等待 2 分钟
  connGiveUpMs: 600_000,     // 放弃等待 10 分钟
  generalInitialMs: 500,
  generalCapMs: 30_000,
  generalGiveUpMs: 600_000,
}
```

## 多会话支持

```typescript
// GrowthBook 功能门控
async function isMultiSessionSpawnEnabled(): Promise<boolean> {
  return checkGate('tengu_ccr_bridge_multi_session')
}

const SPAWN_SESSIONS_DEFAULT = 32
```

## VS Code 扩展集成

```
用户在 VS Code 中操作
        ↓
扩展发送请求到 Bridge
        ↓
Bridge 启动 CLI 会话
        ↓
输出流式返回扩展
        ↓
扩展渲染到编辑器
```

## JetBrains 插件支持

同样的 Bridge 架构支持 JetBrains IDE:
- IntelliJ IDEA
- PyCharm
- WebStorm
- GoLand

## 设计模式

### 1. 代理模式

Bridge 作为 CLI 的代理:

```typescript
class BridgeProxy {
  async forward(request: SessionRequest): Promise<SessionResult>
}
```

### 2. 观察者模式

事件流订阅:

```typescript
connection.on('output', (text) => {
  // 处理输出
})
```

### 3. 工厂模式

会话工厂:

```typescript
class SessionFactory {
  create(options: SessionSpawnOpts): SessionHandle
}
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| IDE 集成 | 无 | Bridge 通信层 |
| 会话管理 | 单进程 | 多会话隔离 |
| 认证 | 无 | JWT + 设备信任 |
| 退避 | 无 | 智能重连 |

## 实践练习

### 练习 1: 实现简单 Bridge 服务器

```typescript
class SimpleBridge {
  async start(port: number): Promise<void>
  async handleConnection(ws: WebSocket): Promise<void>
  async spawnSession(request: SessionRequest): Promise<SessionHandle>
}
```

### 练习 2: 实现消息协议

```typescript
function encodeMessage(msg: OutboundMessage): string
function decodeMessage(data: string): InboundMessage
```

### 练习 3: 实现退避策略

```typescript
class BackoffStrategy {
  nextDelay(): number
  reset(): void
  shouldGiveUp(): boolean
}
```

## 思考题

1. Bridge 如何处理多个并发会话？
2. 为什么使用 WebSocket 而不是 HTTP？
3. 如何保证 Bridge 的可靠性？

## 延伸阅读

- [c10: Hooks Extension](c10-hooks-extension.md) - Bridge 与 Hooks 集成
- [c06: Subagent](c06-subagent-fork.md) - 会话隔离
- 源码: `src/bridge/`

---

**下一章**: [c10: Hooks Extension](c10-hooks-extension.md) →