/**
 * c10: Hooks Extension 示例代码
 *
 * 最小化的 Hook 系统实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

type HookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Notification'
  | 'Stop'
  | 'PreCompact'
  | 'PostCompact'

type HookType = 'command' | 'http' | 'prompt'

interface HookConfig {
  event: HookEvent
  type: HookType
  command?: string
  url?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  timeout?: number
}

interface HookContext {
  event: HookEvent
  timestamp: Date
  data: Record<string, any>
}

interface HookResult {
  success: boolean
  output?: string
  error?: string
}

// ============================================
// 2. Hook 注册表
// ============================================

class HookRegistry {
  private hooks: Map<HookEvent, Set<HookConfig>> = new Map()

  register(event: HookEvent, hook: HookConfig): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, new Set())
    }
    this.hooks.get(event)!.add(hook)
    console.log(`[HookRegistry] Registered ${hook.type} hook for ${event}`)
  }

  unregister(event: HookEvent, hook: HookConfig): boolean {
    const hooks = this.hooks.get(event)
    if (hooks) {
      return hooks.delete(hook)
    }
    return false
  }

  getHooks(event: HookEvent): HookConfig[] {
    return Array.from(this.hooks.get(event) || [])
  }

  clear(event?: HookEvent): void {
    if (event) {
      this.hooks.delete(event)
    } else {
      this.hooks.clear()
    }
  }
}

// ============================================
// 3. Hook 执行器
// ============================================

interface HookExecutor {
  execute(hook: HookConfig, context: HookContext): Promise<HookResult>
}

class CommandHookExecutor implements HookExecutor {
  async execute(hook: HookConfig, context: HookContext): Promise<HookResult> {
    if (!hook.command) {
      return { success: false, error: 'No command specified' }
    }

    // 插值变量
    const command = this.interpolate(hook.command, context)

    console.log(`[CommandHook] Executing: ${command}`)

    try {
      // 实际实现会使用 child_process.exec
      // const { stdout, stderr } = await exec(command, { timeout: hook.timeout })
      return { success: true, output: `Executed: ${command}` }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private interpolate(template: string, context: HookContext): string {
    return template
      .replace(/{(\w+)}/g, (_, key) => {
        return String(context.data[key] ?? '')
      })
  }
}

class HttpHookExecutor implements HookExecutor {
  async execute(hook: HookConfig, context: HookContext): Promise<HookResult> {
    if (!hook.url) {
      return { success: false, error: 'No URL specified' }
    }

    // SSRF 防护
    if (!this.isUrlAllowed(hook.url)) {
      return { success: false, error: 'URL not allowed (SSRF protection)' }
    }

    console.log(`[HttpHook] ${hook.method || 'POST'} ${hook.url}`)

    try {
      // 实际实现:
      // const response = await fetch(hook.url, {
      //   method: hook.method || 'POST',
      //   headers: hook.headers,
      //   body: JSON.stringify(context),
      // })
      return { success: true, output: `HTTP request sent to ${hook.url}` }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private isUrlAllowed(url: string): boolean {
    try {
      const parsed = new URL(url)

      // 阻止私有 IP
      const blockedHosts = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
      ]

      if (blockedHosts.includes(parsed.hostname)) {
        return false
      }

      // 阻止私有 IP 段
      const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
      ]

      if (privateRanges.some(range => range.test(parsed.hostname))) {
        return false
      }

      return true
    } catch {
      return false
    }
  }
}

class PromptHookExecutor implements HookExecutor {
  async execute(hook: HookConfig, context: HookContext): Promise<HookResult> {
    // Prompt hook 修改提示词而不是执行操作
    console.log(`[PromptHook] Processing prompt`)

    // 实际实现会返回修改后的提示词
    return {
      success: true,
      output: JSON.stringify({
        modified: true,
        prompt: context.data.prompt + '\n\n[Hook: Additional context]',
      }),
    }
  }
}

// ============================================
// 4. Hook 引擎
// ============================================

class HookEngine {
  private registry: HookRegistry
  private executors: Record<HookType, HookExecutor>

  constructor() {
    this.registry = new HookRegistry()
    this.executors = {
      command: new CommandHookExecutor(),
      http: new HttpHookExecutor(),
      prompt: new PromptHookExecutor(),
    }
  }

  register(event: HookEvent, hook: HookConfig): void {
    this.registry.register(event, hook)
  }

  async execute(event: HookEvent, data: Record<string, any>): Promise<HookResult[]> {
    const hooks = this.registry.getHooks(event)
    const results: HookResult[] = []

    const context: HookContext = {
      event,
      timestamp: new Date(),
      data,
    }

    for (const hook of hooks) {
      console.log(`\n[HookEngine] Executing ${hook.type} hook for ${event}`)

      const executor = this.executors[hook.type]
      const result = await executor.execute(hook, context)

      results.push(result)

      if (!result.success) {
        console.error(`[HookEngine] Hook failed: ${result.error}`)
        // 继续执行其他 hooks
      }
    }

    return results
  }
}

// ============================================
// 5. 预定义 Hooks
// ============================================

const BUILTIN_HOOKS: HookConfig[] = [
  {
    event: 'PreToolUse',
    type: 'command',
    command: 'echo "Tool: {tool_name}"',
    timeout: 5000,
  },
  {
    event: 'PostToolUse',
    type: 'http',
    url: 'https://api.example.com/log',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  },
]

// ============================================
// 6. 生命周期 Hooks
// ============================================

class LifecycleHooks {
  private engine: HookEngine

  constructor(engine: HookEngine) {
    this.engine = engine
  }

  async onToolUse(toolName: string, params: any): Promise<void> {
    // PreToolUse
    await this.engine.execute('PreToolUse', { tool_name: toolName, params })

    // 执行工具...

    // PostToolUse
    await this.engine.execute('PostToolUse', { tool_name: toolName, params, result: 'success' })
  }

  async onCompact(messages: any[]): Promise<void> {
    // PreCompact
    await this.engine.execute('PreCompact', { message_count: messages.length })

    // 执行压缩...

    // PostCompact
    await this.engine.execute('PostCompact', { saved_tokens: 1000 })
  }

  async onNotification(message: string): Promise<void> {
    await this.engine.execute('Notification', { message })
  }

  async onStop(reason: string): Promise<void> {
    await this.engine.execute('Stop', { reason })
  }
}

// ============================================
// 7. 演示
// ============================================

async function main() {
  console.log('=== Hooks Extension Demo ===\n')

  const engine = new HookEngine()
  const lifecycle = new LifecycleHooks(engine)

  // 注册 hooks
  console.log('--- Registering Hooks ---')

  engine.register('PreToolUse', {
    event: 'PreToolUse',
    type: 'command',
    command: 'logger "Tool {tool_name} called at {timestamp}"',
    timeout: 5000,
  })

  engine.register('PostToolUse', {
    event: 'PostToolUse',
    type: 'http',
    url: 'https://api.example.com/log',
    method: 'POST',
  })

  engine.register('Notification', {
    event: 'Notification',
    type: 'prompt',
  })

  // 测试 SSRF 防护
  console.log('\n--- SSRF Protection Demo ---')

  const httpExecutor = new HttpHookExecutor()

  const testUrls = [
    'https://api.example.com/webhook',  // 允许
    'http://localhost:8080/hook',       // 阻止
    'http://127.0.0.1/hook',            // 阻止
    'http://192.168.1.1/hook',          // 阻止
    'http://10.0.0.1/hook',             // 阻止
  ]

  for (const url of testUrls) {
    const result = await httpExecutor.execute({
      event: 'PostToolUse',
      type: 'http',
      url,
    }, { event: 'PostToolUse', timestamp: new Date(), data: {} })

    console.log(`  ${url}: ${result.success ? 'Allowed' : 'Blocked'}`)
  }

  // 执行生命周期 hooks
  console.log('\n--- Lifecycle Hooks Demo ---')

  await lifecycle.onToolUse('Bash', { command: 'ls -la' })
  await lifecycle.onNotification('Task completed')
  await lifecycle.onStop('user_request')

  console.log('\n=== Demo Complete ===')
}

main().catch(console.error)