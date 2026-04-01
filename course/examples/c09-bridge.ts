/**
 * c09: Bridge & IDE 示例代码
 *
 * 最小化的 Bridge 通信实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

type SpawnMode = 'worktree' | 'same-dir' | 'capacity'

interface BridgeConfig {
  dir: string
  machineName: string
  branch: string
  gitRepoUrl: string | null
  maxSessions: number
  spawnMode: SpawnMode
  verbose: boolean
  bridgeId: string
}

interface SessionRequest {
  sessionId: string
  prompt: string
  workingDirectory: string
  model?: string
}

interface SessionHandle {
  id: string
  pid?: number
  status: 'starting' | 'running' | 'completed' | 'failed'
  output: string[]
}

// ============================================
// 2. 消息协议
// ============================================

type InboundMessage =
  | { type: 'request'; payload: SessionRequest }
  | { type: 'response'; payload: { sessionId: string; response: string } }

type OutboundMessage =
  | { type: 'event'; payload: { sessionId: string; kind: 'output' | 'status'; data: string } }
  | { type: 'result'; payload: { sessionId: string; output: string } }
  | { type: 'permission'; payload: { sessionId: string; request: PermissionRequest } }

interface PermissionRequest {
  toolName: string
  params: any
  options: string[]
}

function encodeMessage(msg: OutboundMessage): string {
  return JSON.stringify(msg)
}

function decodeMessage(data: string): InboundMessage | null {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

// ============================================
// 3. 退避策略
// ============================================

interface BackoffConfig {
  initialMs: number
  maxMs: number
  multiplier: number
  giveUpMs: number
}

const DEFAULT_BACKOFF: BackoffConfig = {
  initialMs: 2_000,
  maxMs: 120_000,
  multiplier: 2,
  giveUpMs: 600_000,
}

class BackoffStrategy {
  private config: BackoffConfig
  private currentDelay: number
  private totalWaited: number = 0

  constructor(config: BackoffConfig = DEFAULT_BACKOFF) {
    this.config = config
    this.currentDelay = config.initialMs
  }

  nextDelay(): number {
    const delay = this.currentDelay
    this.currentDelay = Math.min(
      this.currentDelay * this.config.multiplier,
      this.config.maxMs
    )
    this.totalWaited += delay
    return delay
  }

  shouldGiveUp(): boolean {
    return this.totalWaited >= this.config.giveUpMs
  }

  reset(): void {
    this.currentDelay = this.config.initialMs
    this.totalWaited = 0
  }
}

// ============================================
// 4. 会话管理器
// ============================================

class SessionManager {
  private sessions: Map<string, SessionHandle> = new Map()
  private maxSessions: number

  constructor(maxSessions: number = 32) {
    this.maxSessions = maxSessions
  }

  canSpawn(): boolean {
    return this.sessions.size < this.maxSessions
  }

  create(request: SessionRequest): SessionHandle {
    const handle: SessionHandle = {
      id: request.sessionId,
      status: 'starting',
      output: [],
    }

    this.sessions.set(handle.id, handle)
    return handle
  }

  get(sessionId: string): SessionHandle | undefined {
    return this.sessions.get(sessionId)
  }

  update(sessionId: string, updates: Partial<SessionHandle>): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      Object.assign(session, updates)
    }
  }

  complete(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.status = 'completed'
    }
  }

  list(): SessionHandle[] {
    return Array.from(this.sessions.values())
  }
}

// ============================================
// 5. Bridge 服务器 (模拟)
// ============================================

type MessageHandler = (msg: InboundMessage) => Promise<OutboundMessage | null>

class BridgeServer {
  private config: BridgeConfig
  private sessionManager: SessionManager
  private backoff: BackoffStrategy
  private messageHandler?: MessageHandler
  private running: boolean = false

  constructor(config: BridgeConfig) {
    this.config = config
    this.sessionManager = new SessionManager(config.maxSessions)
    this.backoff = new BackoffStrategy()
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler
  }

  async start(): Promise<void> {
    console.log(`[Bridge] Starting server...`)
    console.log(`  Bridge ID: ${this.config.bridgeId}`)
    console.log(`  Working Dir: ${this.config.dir}`)
    console.log(`  Max Sessions: ${this.config.maxSessions}`)
    console.log(`  Spawn Mode: ${this.config.spawnMode}`)

    this.running = true

    // 模拟主循环
    while (this.running) {
      try {
        await this.runLoop()
        this.backoff.reset()
      } catch (error) {
        console.error(`[Bridge] Error: ${error}`)

        if (this.backoff.shouldGiveUp()) {
          console.error(`[Bridge] Giving up after ${this.backoff['totalWaited']}ms`)
          break
        }

        const delay = this.backoff.nextDelay()
        console.log(`[Bridge] Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }

  private async runLoop(): Promise<void> {
    // 模拟接收连接
    console.log(`[Bridge] Waiting for connections...`)

    // 在实际实现中，这里会:
    // 1. 接受 WebSocket 连接
    // 2. 处理消息
    // 3. 启动会话
    // 4. 流式输出

    // 模拟一次会话
    if (this.messageHandler) {
      const request: SessionRequest = {
        sessionId: 'session-1',
        prompt: 'Hello, Claude!',
        workingDirectory: this.config.dir,
      }

      const result = await this.messageHandler({ type: 'request', payload: request })
      if (result) {
        console.log(`[Bridge] Message result:`, result.type)
      }
    }

    // 保持运行
    await sleep(5000)
  }

  stop(): void {
    this.running = false
    console.log(`[Bridge] Server stopped`)
  }
}

// ============================================
// 6. JWT 认证 (模拟)
// ============================================

interface TokenInfo {
  accessToken: string
  expiresAt: number
  refreshToken?: string
}

class AuthManager {
  private token?: TokenInfo

  async getAccessToken(): Promise<string> {
    // 检查缓存
    if (this.token && Date.now() < this.token.expiresAt) {
      return this.token.accessToken
    }

    // 获取新 token
    return this.refreshToken()
  }

  private async refreshToken(): Promise<string> {
    console.log(`[Auth] Refreshing access token...`)

    // 模拟获取 token
    const token: TokenInfo = {
      accessToken: `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      expiresAt: Date.now() + 3600 * 1000, // 1 小时
    }

    this.token = token
    return token.accessToken
  }

  async withAuth<T>(fn: (token: string) => Promise<T>): Promise<T> {
    const token = await this.getAccessToken()
    return fn(token)
  }
}

// ============================================
// 7. Worktree 管理
// ============================================

class BridgeWorktreeManager {
  private worktrees: Map<string, { path: string; branch: string }> = new Map()

  async create(sessionId: string, baseBranch: string): Promise<string> {
    const branch = `bridge/${sessionId}`
    const path = `.claude/worktrees/${sessionId}`

    console.log(`[Worktree] Creating worktree for ${sessionId}`)
    console.log(`  Branch: ${branch}`)
    console.log(`  Path: ${path}`)

    // 实际实现:
    // await exec(`git worktree add -b ${branch} ${path} ${baseBranch}`)

    this.worktrees.set(sessionId, { path, branch })
    return path
  }

  async remove(sessionId: string): Promise<void> {
    const worktree = this.worktrees.get(sessionId)
    if (!worktree) return

    console.log(`[Worktree] Removing worktree for ${sessionId}`)

    // 实际实现:
    // await exec(`git worktree remove ${worktree.path} --force`)
    // await exec(`git branch -D ${worktree.branch}`)

    this.worktrees.delete(sessionId)
  }
}

// ============================================
// 8. 演示
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('=== Bridge System Demo ===\n')

  // 配置
  const config: BridgeConfig = {
    dir: '/home/user/project',
    machineName: 'dev-machine',
    branch: 'main',
    gitRepoUrl: 'https://github.com/user/repo.git',
    maxSessions: 32,
    spawnMode: 'worktree',
    verbose: true,
    bridgeId: `bridge-${Date.now()}`,
  }

  // 创建服务器
  const server = new BridgeServer(config)
  const auth = new AuthManager()

  // 设置消息处理
  server.onMessage(async (msg) => {
    console.log(`\n[Bridge] Received message: ${msg.type}`)

    if (msg.type === 'request') {
      const { sessionId, prompt } = msg.payload

      // 获取认证 token
      const token = await auth.getAccessToken()
      console.log(`  Using token: ${token.substring(0, 20)}...`)

      // 返回事件
      return {
        type: 'event',
        payload: {
          sessionId,
          kind: 'status',
          data: 'processing',
        },
      }
    }

    return null
  })

  // 演示退避策略
  console.log('--- Backoff Strategy Demo ---')
  const backoff = new BackoffStrategy()
  for (let i = 0; i < 5; i++) {
    const delay = backoff.nextDelay()
    console.log(`  Attempt ${i + 1}: wait ${delay}ms`)
  }

  // 演示会话管理
  console.log('\n--- Session Manager Demo ---')
  const sessionManager = new SessionManager(32)

  const session1 = sessionManager.create({
    sessionId: 'session-1',
    prompt: 'Test session',
    workingDirectory: '/tmp',
  })

  console.log(`  Created session: ${session1.id}`)
  sessionManager.update(session1.id, { status: 'running', output: ['Starting...'] })
  console.log(`  Status: ${sessionManager.get(session1.id)?.status}`)

  // 演示 Worktree
  console.log('\n--- Worktree Manager Demo ---')
  const worktreeManager = new BridgeWorktreeManager()

  await worktreeManager.create('session-1', 'main')
  await worktreeManager.remove('session-1')

  console.log('\n=== Demo Complete ===')
}

main().catch(console.error)