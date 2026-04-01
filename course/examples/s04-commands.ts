/**
 * c04: Command Interface 示例代码
 *
 * 最小化的命令系统实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

type CommandAction =
  | { type: 'prompt'; template: string }
  | { type: 'skill'; skillName: string }
  | { type: 'function'; handler: CommandHandler }

interface Command {
  name: string
  description: string
  aliases?: string[]
  action: CommandAction
}

interface CommandContext {
  cwd: string
  sendMessage: (msg: string) => void
}

type CommandHandler = (args: string, context: CommandContext) => Promise<void>

interface ParsedCommand {
  name: string
  args: string
}

interface CommandResult {
  type: 'inject' | 'handled' | 'error'
  prompt?: string
  error?: string
}

// ============================================
// 2. 命令注册表
// ============================================

class CommandRegistry {
  private commands: Map<string, Command> = new Map()
  private aliases: Map<string, string> = new Map()

  register(command: Command): void {
    this.commands.set(command.name, command)

    // 注册别名
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name)
      }
    }
  }

  find(name: string): Command | undefined {
    // 先查原名
    const command = this.commands.get(name)
    if (command) return command

    // 再查别名
    const realName = this.aliases.get(name)
    if (realName) {
      return this.commands.get(realName)
    }

    return undefined
  }

  list(): Command[] {
    return Array.from(this.commands.values())
  }

  // 获取自动补全建议
  getCompletions(partial: string): string[] {
    const allNames = new Set([
      ...this.commands.keys(),
      ...this.aliases.keys(),
    ])

    return Array.from(allNames)
      .filter(name => name.startsWith(partial))
      .sort()
  }
}

// ============================================
// 3. 命令解析器
// ============================================

function parseCommand(input: string): ParsedCommand | null {
  // 检查是否以 / 开头
  if (!input.startsWith('/')) {
    return null
  }

  // 提取命令名和参数
  // 支持带引号的参数: /search "some query here"
  const match = input.match(/^\/(\S+)\s*(.*)/)
  if (!match) {
    return null
  }

  const [, name, args] = match
  return { name, args: args.trim() }
}

// ============================================
// 4. 命令执行器
// ============================================

class CommandExecutor {
  constructor(
    private registry: CommandRegistry,
    private skillLoader: SkillLoader
  ) {}

  async execute(
    parsed: ParsedCommand,
    context: CommandContext
  ): Promise<CommandResult> {
    const command = this.registry.find(parsed.name)

    if (!command) {
      return {
        type: 'error',
        error: `Unknown command: ${parsed.name}`,
      }
    }

    switch (command.action.type) {
      case 'prompt':
        return this.executePrompt(command.action, parsed.args)

      case 'skill':
        return this.executeSkill(command.action, parsed.args, context)

      case 'function':
        return this.executeFunction(command.action, parsed.args, context)
    }
  }

  private executePrompt(
    action: { type: 'prompt'; template: string },
    args: string
  ): CommandResult {
    // 替换模板中的占位符
    const prompt = action.template
      .replace(/{args}/g, args)
      .replace(/{cwd}/g, process.cwd())

    return { type: 'inject', prompt }
  }

  private async executeSkill(
    action: { type: 'skill'; skillName: string },
    args: string,
    context: CommandContext
  ): Promise<CommandResult> {
    const skill = await this.skillLoader.load(action.skillName)
    if (!skill) {
      return {
        type: 'error',
        error: `Skill not found: ${action.skillName}`,
      }
    }

    const prompt = skill.getPrompt(args)
    return { type: 'inject', prompt }
  }

  private async executeFunction(
    action: { type: 'function'; handler: CommandHandler },
    args: string,
    context: CommandContext
  ): Promise<CommandResult> {
    await action.handler(args, context)
    return { type: 'handled' }
  }
}

// ============================================
// 5. 技能加载器 (简化版)
// ============================================

interface Skill {
  name: string
  getPrompt(args: string): string
}

class SkillLoader {
  private skills: Map<string, Skill> = new Map()

  register(skill: Skill): void {
    this.skills.set(skill.name, skill)
  }

  async load(name: string): Promise<Skill | undefined> {
    return this.skills.get(name)
  }
}

// ============================================
// 6. 内置命令
// ============================================

function createBuiltinCommands(): Command[] {
  return [
    // 提示词注入命令
    {
      name: 'explain',
      description: 'Explain the code',
      action: {
        type: 'prompt',
        template: 'Explain this code: {args}',
      },
    },
    {
      name: 'refactor',
      description: 'Refactor the code',
      action: {
        type: 'prompt',
        template: 'Refactor this code: {args}',
      },
    },

    // 函数执行命令
    {
      name: 'clear',
      description: 'Clear the conversation',
      action: {
        type: 'function',
        handler: async (_, context) => {
          context.sendMessage('Conversation cleared')
        },
      },
    },
    {
      name: 'help',
      description: 'Show available commands',
      action: {
        type: 'function',
        handler: async (_, context) => {
          context.sendMessage('Available commands: /explain, /refactor, /clear, /help')
        },
      },
    },

    // 带别名的命令
    {
      name: 'commit',
      description: 'Create a git commit',
      aliases: ['ci'],
      action: {
        type: 'skill',
        skillName: 'commit',
      },
    },
  ]
}

// ============================================
// 7. 自定义命令加载
// ============================================

async function loadCommandsFromDir(dir: string): Promise<Command[]> {
  const fs = require('fs')
  const path = require('path')
  const commands: Command[] = []

  try {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      const filePath = path.join(dir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const name = path.basename(file, '.md')

      commands.push({
        name,
        description: `Custom command: ${name}`,
        action: {
          type: 'prompt',
          template: content,
        },
      })
    }
  } catch {
    // 目录不存在或无法读取
  }

  return commands
}

// ============================================
// 8. 演示
// ============================================

async function main() {
  // 创建组件
  const registry = new CommandRegistry()
  const skillLoader = new SkillLoader()
  const executor = new CommandExecutor(registry, skillLoader)

  // 注册内置命令
  for (const cmd of createBuiltinCommands()) {
    registry.register(cmd)
  }

  // 注册一个技能
  skillLoader.register({
    name: 'commit',
    getPrompt: (args) => `Create a git commit with message based on current changes. Args: ${args}`,
  })

  // 上下文
  const context: CommandContext = {
    cwd: process.cwd(),
    sendMessage: (msg) => console.log(`[System] ${msg}`),
  }

  console.log('=== Command System Demo ===\n')

  // 测试解析
  const testInputs = [
    '/explain this function',
    '/refactor',
    '/clear',
    '/help',
    '/commit',
    '/ci added new feature',  // 使用别名
    '/unknown',
    'not a command',
  ]

  for (const input of testInputs) {
    console.log(`Input: "${input}"`)

    const parsed = parseCommand(input)
    if (!parsed) {
      console.log('  → Not a command\n')
      continue
    }

    const result = await executor.execute(parsed, context)

    switch (result.type) {
      case 'inject':
        console.log(`  → Inject prompt: "${result.prompt?.substring(0, 50)}..."`)
        break
      case 'handled':
        console.log('  → Command handled')
        break
      case 'error':
        console.log(`  → Error: ${result.error}`)
        break
    }
    console.log()
  }

  // 测试自动补全
  console.log('=== Autocomplete Demo ===')
  const completions = registry.getCompletions('com')
  console.log(`Completions for "com": ${completions.join(', ')}`)

  const allCompletions = registry.getCompletions('')
  console.log(`All commands: ${allCompletions.join(', ')}`)
}

main().catch(console.error)