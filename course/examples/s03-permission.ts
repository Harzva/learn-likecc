/**
 * c03: Permission Model 示例代码
 *
 * 最小化的权限系统实现
 * 基于 Claude Code 源码分析
 */

import { z } from 'zod'

// ============================================
// 1. 类型定义
// ============================================

type PermissionBehavior = 'allow' | 'deny' | 'ask'

type PermissionRuleSource =
  | 'userSettings'
  | 'projectSettings'
  | 'session'

type PermissionMode =
  | 'default'
  | 'bypassPermissions'
  | 'acceptEdits'

interface PermissionRule {
  source: PermissionRuleSource
  behavior: PermissionBehavior
  toolName: string
  pattern?: string  // glob 模式匹配参数
}

interface PermissionDecision {
  behavior: PermissionBehavior
  source: 'rule' | 'mode' | 'default'
  matchedRule?: PermissionRule
}

// ============================================
// 2. 权限检查器
// ============================================

class PermissionChecker {
  private rules: PermissionRule[] = []
  private mode: PermissionMode = 'default'

  // 设置权限模式
  setMode(mode: PermissionMode) {
    this.mode = mode
  }

  // 添加规则
  addRule(rule: PermissionRule) {
    this.rules.push(rule)
  }

  // 检查权限
  check(
    toolName: string,
    params: Record<string, any>,
    paramKey: string = 'command' // 用于模式匹配的参数键
  ): PermissionDecision {
    // 1. 检查 bypass 模式
    if (this.mode === 'bypassPermissions') {
      return { behavior: 'allow', source: 'mode' }
    }

    // 2. 检查 acceptEdits 模式
    if (this.mode === 'acceptEdits' && toolName === 'Edit') {
      return { behavior: 'allow', source: 'mode' }
    }

    // 3. 按优先级检查规则 (session > project > user)
    const priorityOrder: PermissionRuleSource[] = [
      'session',
      'projectSettings',
      'userSettings',
    ]

    for (const source of priorityOrder) {
      const rule = this.findMatchingRule(toolName, params[paramKey], source)
      if (rule) {
        return { behavior: rule.behavior, source: 'rule', matchedRule: rule }
      }
    }

    // 4. 默认询问
    return { behavior: 'ask', source: 'default' }
  }

  // 查找匹配的规则
  private findMatchingRule(
    toolName: string,
    paramValue: string | undefined,
    source: PermissionRuleSource
  ): PermissionRule | undefined {
    return this.rules.find(rule => {
      if (rule.source !== source || rule.toolName !== toolName) {
        return false
      }
      // 无 pattern 则匹配所有
      if (!rule.pattern) {
        return true
      }
      // glob 模式匹配
      if (paramValue) {
        return this.matchPattern(rule.pattern, paramValue)
      }
      return false
    })
  }

  // 简化的 glob 匹配
  private matchPattern(pattern: string, value: string): boolean {
    // 将 glob 转换为正则
    const regex = new RegExp(
      '^' + pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
        + '$'
    )
    return regex.test(value)
  }

  // 清除会话规则
  clearSessionRules() {
    this.rules = this.rules.filter(r => r.source !== 'session')
  }
}

// ============================================
// 3. 权限持久化
// ============================================

interface Settings {
  alwaysAllow?: Array<{ tool: string; pattern?: string }>
  alwaysDeny?: Array<{ tool: string; pattern?: string }>
}

class PermissionPersistence {
  private settingsPath: string

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath
  }

  async loadSettings(): Promise<Settings> {
    try {
      const fs = require('fs')
      const content = fs.readFileSync(this.settingsPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return {}
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    const fs = require('fs')
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2))
  }

  async addAllowRule(tool: string, pattern?: string): Promise<void> {
    const settings = await this.loadSettings()
    if (!settings.alwaysAllow) {
      settings.alwaysAllow = []
    }
    settings.alwaysAllow.push({ tool, pattern })
    await this.saveSettings(settings)
  }

  async addDenyRule(tool: string, pattern?: string): Promise<void> {
    const settings = await this.loadSettings()
    if (!settings.alwaysDeny) {
      settings.alwaysDeny = []
    }
    settings.alwaysDeny.push({ tool, pattern })
    await this.saveSettings(settings)
  }
}

// ============================================
// 4. 交互式权限请求
// ============================================

interface UserChoice {
  action: 'allow' | 'deny'
  permanent: boolean
}

async function askUserPermission(
  toolName: string,
  params: Record<string, any>
): Promise<UserChoice> {
  console.log(`\n[Permission Required]`)
  console.log(`  Tool: ${toolName}`)
  console.log(`  Params: ${JSON.stringify(params, null, 2)}`)
  console.log('\nOptions:')
  console.log('  1. Allow once')
  console.log('  2. Allow always for this')
  console.log('  3. Deny once')
  console.log('  4. Deny always for this')

  // 模拟用户输入 (实际会读取用户选择)
  const choice = '1' // 简化处理

  const actions: Record<string, UserChoice> = {
    '1': { action: 'allow', permanent: false },
    '2': { action: 'allow', permanent: true },
    '3': { action: 'deny', permanent: false },
    '4': { action: 'deny', permanent: true },
  }

  return actions[choice]
}

// ============================================
// 5. 权限感知的工具执行
// ============================================

interface Tool {
  name: string
  execute: (params: any) => Promise<string>
}

async function executeWithPermission(
  tool: Tool,
  params: Record<string, any>,
  checker: PermissionChecker,
  persistence: PermissionPersistence
): Promise<string> {
  // 检查权限
  const decision = checker.check(tool.name, params)

  switch (decision.behavior) {
    case 'allow':
      return tool.execute(params)

    case 'deny':
      return `Permission denied: ${tool.name}`

    case 'ask':
      const userChoice = await askUserPermission(tool.name, params)

      if (userChoice.action === 'allow') {
        // 如果用户选择永久允许
        if (userChoice.permanent) {
          await persistence.addAllowRule(tool.name, params.command || params.file_path)
          checker.addRule({
            source: 'userSettings',
            behavior: 'allow',
            toolName: tool.name,
            pattern: params.command || params.file_path,
          })
        }
        return tool.execute(params)
      } else {
        // 如果用户选择永久拒绝
        if (userChoice.permanent) {
          await persistence.addDenyRule(tool.name, params.command || params.file_path)
          checker.addRule({
            source: 'userSettings',
            behavior: 'deny',
            toolName: tool.name,
            pattern: params.command || params.file_path,
          })
        }
        return `Permission denied by user: ${tool.name}`
      }
  }
}

// ============================================
// 6. 模式切换
// ============================================

async function withMode<T>(
  checker: PermissionChecker,
  mode: PermissionMode,
  fn: () => Promise<T>
): Promise<T> {
  const previousMode = checker['mode']
  try {
    checker.setMode(mode)
    return await fn()
  } finally {
    checker.setMode(previousMode)
  }
}

// ============================================
// 7. 演示
// ============================================

async function main() {
  const checker = new PermissionChecker()
  const persistence = new PermissionPersistence('/tmp/claude-settings.json')

  // 添加一些初始规则
  checker.addRule({
    source: 'projectSettings',
    behavior: 'allow',
    toolName: 'Bash',
    pattern: 'npm run *',
  })

  checker.addRule({
    source: 'projectSettings',
    behavior: 'allow',
    toolName: 'Bash',
    pattern: 'git status',
  })

  checker.addRule({
    source: 'userSettings',
    behavior: 'deny',
    toolName: 'Bash',
    pattern: 'rm -rf /*',
  })

  // 定义一个模拟工具
  const bashTool: Tool = {
    name: 'Bash',
    execute: async (params) => `Executed: ${params.command}`,
  }

  // 测试场景
  console.log('=== Permission System Demo ===\n')

  // 场景 1: 匹配允许规则
  console.log('Scenario 1: npm run test')
  let result = checker.check('Bash', { command: 'npm run test' })
  console.log(`  Decision: ${result.behavior} (from ${result.source})`)
  console.log()

  // 场景 2: 匹配拒绝规则
  console.log('Scenario 2: rm -rf /*')
  result = checker.check('Bash', { command: 'rm -rf /*' })
  console.log(`  Decision: ${result.behavior} (from ${result.source})`)
  console.log()

  // 场景 3: 无匹配规则
  console.log('Scenario 3: ls -la')
  result = checker.check('Bash', { command: 'ls -la' })
  console.log(`  Decision: ${result.behavior} (from ${result.source})`)
  console.log()

  // 场景 4: bypass 模式
  console.log('Scenario 4: bypassPermissions mode')
  checker.setMode('bypassPermissions')
  result = checker.check('Bash', { command: 'rm -rf /*' })
  console.log(`  Decision: ${result.behavior} (from ${result.source})`)
  console.log()

  // 场景 5: 模式切换
  console.log('Scenario 5: Temporary mode switch')
  checker.setMode('default')
  await withMode(checker, 'bypassPermissions', async () => {
    const r = checker.check('Bash', { command: 'dangerous-command' })
    console.log(`  Inside withMode: ${r.behavior} (from ${r.source})`)
  })
  result = checker.check('Bash', { command: 'dangerous-command' })
  console.log(`  After withMode: ${result.behavior} (from ${result.source})`)
}

main().catch(console.error)