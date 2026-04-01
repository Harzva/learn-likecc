# c10: Hooks Extension (Hooks扩展机制)

`c01 > c02 > c03 > c04 | c05 > c06 > c07 > c08 | c09 > [ c10 ] > c11 > c12`

> *"Hooks are the plugin system"* -- 扩展点让系统可定制。
>
> **Harness 层**: Hooks -- 事件驱动的扩展机制。

## 问题

系统需要:
- 在特定事件触发自定义逻辑
- 支持用户扩展行为
- 集成外部系统
- 记录和审计

硬编码无法满足所有需求。

## 解决方案

Hooks 系统提供可扩展的事件处理:

```
事件触发
    ↓
+-------------+
| Hook Engine |
+------+------+
       |
  +----+----+-----+
  |    |    |     |
  v    v    v     v
Hook1 Hook2 Hook3 Hook4
```

## 源码分析

### Hook 事件类型

```typescript
// 源码位置: src/utils/hooks/types.ts

type HookEvent =
  | 'PreToolUse'     // 工具调用前
  | 'PostToolUse'    // 工具调用后
  | 'Notification'   // 通知事件
  | 'Stop'           // 会话停止
  | 'PreCompact'     // 压缩前
  | 'PostCompact'    // 压缩后
```

### Hook 配置

```typescript
type HookConfig = {
  event: HookEvent
  type: 'command' | 'http' | 'prompt'
  
  // Command Hook
  command?: string
  
  // HTTP Hook
  url?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  
  // 通用
  timeout?: number
}
```

### Hook 类型

#### 1. Command Hook

```typescript
// 执行 shell 命令
type CommandHook = {
  event: 'PreToolUse'
  type: 'command'
  command: 'echo "Tool called: {tool_name}"'
}
```

#### 2. HTTP Hook

```typescript
// 发送 HTTP 请求
type HttpHook = {
  event: 'PostToolUse'
  type: 'http'
  url: 'https://api.example.com/log'
  method: 'POST'
  headers: { 'Content-Type': 'application/json' }
}
```

#### 3. Prompt Hook

```typescript
// 修改提示词
type PromptHook = {
  event: 'PreToolUse'
  type: 'prompt'
  // 返回修改后的提示词
}
```

### 异步 Hook 注册表

```typescript
// 源码位置: src/utils/hooks/AsyncHookRegistry.ts

class AsyncHookRegistry {
  private hooks: Map<HookEvent, Set<Hook>> = new Map()

  register(event: HookEvent, hook: Hook): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, new Set())
    }
    this.hooks.get(event)!.add(hook)
  }

  async execute(event: HookEvent, context: HookContext): Promise<void> {
    const hooks = this.hooks.get(event)
    if (!hooks) return

    for (const hook of hooks) {
      await this.executeHook(hook, context)
    }
  }

  private async executeHook(hook: Hook, context: HookContext): Promise<void> {
    switch (hook.type) {
      case 'command':
        await execAgentHook(hook, context)
        break
      case 'http':
        await execHttpHook(hook, context)
        break
      case 'prompt':
        await execPromptHook(hook, context)
        break
    }
  }
}
```

### 生命周期 Hooks

```typescript
// 源码位置: src/utils/hooks/sessionHooks.ts

// 会话开始
async function executeSessionStartHooks(context: SessionContext) {
  await registry.execute('SessionStart', context)
}

// 压缩前
async function executePreCompactHooks(messages: Message[]) {
  await registry.execute('PreCompact', { messages })
}

// 压缩后
async function executePostCompactHooks(result: CompactResult) {
  await registry.execute('PostCompact', { result })
}

// 会话结束
async function executeSessionEndHooks(context: SessionContext) {
  await registry.execute('SessionEnd', context)
}
```

### Hook 执行器

```typescript
// 源码位置: src/utils/hooks/execAgentHook.ts

async function execAgentHook(
  config: HookConfig,
  context: HookContext
): Promise<void> {
  const command = interpolateCommand(config.command!, context)
  
  const result = await exec(command, {
    timeout: config.timeout || 30_000,
    env: {
      HOOK_EVENT: context.event,
      HOOK_DATA: JSON.stringify(context.data),
    },
  })
  
  if (result.code !== 0) {
    throw new Error(`Hook failed: ${result.stderr}`)
  }
}

// 源码位置: src/utils/hooks/execHttpHook.ts

async function execHttpHook(
  config: HookConfig,
  context: HookContext
): Promise<void> {
  const response = await fetch(config.url!, {
    method: config.method || 'POST',
    headers: config.headers,
    body: JSON.stringify(context),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP Hook failed: ${response.status}`)
  }
}
```

### SSRF 防护

```typescript
// 源码位置: src/utils/hooks/ssrfGuard.ts

function ssrfGuard(url: string): boolean {
  const parsed = new URL(url)
  
  // 阻止私有 IP
  const blockedRanges = [
    '127.0.0.0/8',    // localhost
    '10.0.0.0/8',     // 私有网络 A
    '172.16.0.0/12',  // 私有网络 B
    '192.168.0.0/16', // 私有网络 C
  ]
  
  const ip = resolve(parsed.hostname)
  return !isInAnyRange(ip, blockedRanges)
}
```

## 配置示例

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "logger 'Tool: {tool_name}'"
      }
    ],
    "PostToolUse": [
      {
        "type": "http",
        "url": "https://api.example.com/log",
        "method": "POST"
      }
    ],
    "PreCompact": [
      {
        "type": "command",
        "command": "echo 'Compacting...'"
      }
    ]
  }
}
```

## 设计模式

### 1. 观察者模式

Hook 是事件的观察者:

```typescript
registry.on('PreToolUse', handler)
```

### 2. 策略模式

不同 Hook 类型使用不同执行策略:

```typescript
strategies[hook.type](hook, context)
```

### 3. 责任链模式

多个 Hook 按顺序执行:

```typescript
for (const hook of hooks) {
  await execute(hook)
}
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Extension | 无 | Hook 系统 |
| Events | 硬编码 | 可配置 |
| Integration | 无 | Command/HTTP/Prompt |
| Security | 无 | SSRF 防护 |

## 实践练习

### 练习 1: 实现 Hook 注册表

```typescript
class HookRegistry {
  register(event: HookEvent, hook: HookConfig): void
  async execute(event: HookEvent, context: any): Promise<void>
}
```

### 练习 2: 实现 Command Hook 执行器

```typescript
async function execCommandHook(
  command: string,
  context: any
): Promise<void>
```

### 练习 3: 实现 SSRF 防护

```typescript
function isPrivateIP(ip: string): boolean
function ssrfGuard(url: string): boolean
```

## 思考题

1. Hook 执行失败应该如何处理？
2. 如何防止 Hook 无限循环？
3. HTTP Hook 和 Command Hook 各有什么优缺点？

## 延伸阅读

- [c03: Permission Model](c03-permission-model.md) - Hook 与权限
- [c09: Bridge & IDE](c09-bridge-ide.md) - Bridge 使用 Hooks
- 源码: `src/utils/hooks/`

---

**下一章**: [c11: Vim Mode](c11-vim-mode.md) →