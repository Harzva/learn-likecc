# c04: Command Interface (命令接口)

`c01 > c02 > c03 > [ c04 ] | c05 > c06 > c07 > c08 | c09 > c10 > c11 > c12`

> *"/slash-commands are shortcuts to complex workflows"*
>
> **Harness 层**: Commands -- 用户交互的快捷入口。

## 问题

用户需要:
- 快速触发常见操作 (`/commit`, `/review`)
- 加载预定义的技能模块
- 配置工具行为
- 切换模式或状态

直接调用工具太繁琐，需要更高级的抽象。

## 解决方案

Claude Code 实现了斜杠命令系统:

```
User Input: "/commit"
     ↓
+------------------+
| Command Parser   |
+--------+---------+
         |
         v
+------------------+     +----------------+
| Command Match    | --> | Command Action |
+------------------+     +----------------+
                                |
                                v
                         Execute / Prompt
```

## 源码分析

### 命令定义

```typescript
// 源码位置: src/commands/types.ts

type Command = {
  name: string              // 命令名 (不含 /)
  description: string       // 描述
  aliases?: string[]        // 别名
  
  // 执行逻辑
  action: CommandAction
}

type CommandAction =
  | { type: 'prompt'; template: string }          // 注入提示词
  | { type: 'skill'; skillName: string }          // 加载技能
  | { type: 'function'; handler: CommandHandler } // 执行函数

type CommandHandler = (
  args: string,
  context: CommandContext
) => Promise<void>
```

### 命令注册

```typescript
// 源码位置: src/commands/index.ts

const commands: Command[] = [
  // 提示词注入
  { name: 'commit', action: { type: 'skill', skillName: 'commit' } },
  { name: 'review-pr', action: { type: 'skill', skillName: 'review-pr' } },
  
  // 函数执行
  { name: 'clear', action: { type: 'function', handler: clearHandler } },
  { name: 'help', action: { type: 'function', handler: helpHandler } },
  
  // 别名
  { name: 'pr', aliases: ['review-pr'], action: { type: 'skill', skillName: 'review-pr' } },
]
```

### 命令解析

```typescript
// 源码位置: src/commands/parser.ts

function parseCommand(input: string): ParsedCommand | null {
  // 检查是否以 / 开头
  if (!input.startsWith('/')) {
    return null
  }
  
  // 提取命令名和参数
  const match = input.match(/^\/(\S+)\s*(.*)/)
  if (!match) {
    return null
  }
  
  const [, name, args] = match
  
  // 查找命令
  const command = findCommand(name)
  if (!command) {
    return { error: `Unknown command: ${name}` }
  }
  
  return { command, args }
}
```

### 命令执行

```typescript
// 源码位置: src/commands/executor.ts

async function executeCommand(
  parsed: ParsedCommand,
  context: CommandContext
): Promise<CommandResult> {
  const { command, args } = parsed
  
  switch (command.action.type) {
    case 'prompt':
      // 注入提示词到对话
      return {
        type: 'inject',
        prompt: command.action.template.replace('{args}', args),
      }
      
    case 'skill':
      // 加载技能
      const skill = await loadSkill(command.action.skillName)
      return {
        type: 'inject',
        prompt: skill.getPrompt(args),
      }
      
    case 'function':
      // 执行函数
      await command.action.handler(args, context)
      return { type: 'handled' }
  }
}
```

## 内置命令

### 工作流命令

| 命令 | 功能 | 类型 |
|------|------|------|
| `/commit` | 创建 Git 提交 | Skill |
| `/review-pr` | Review Pull Request | Skill |
| `/init` | 初始化项目 | Skill |
| `/test` | 运行测试 | Skill |

### 配置命令

| 命令 | 功能 | 类型 |
|------|------|------|
| `/config` | 打开配置 | Function |
| `/permissions` | 管理权限 | Function |
| `/model` | 切换模型 | Function |

### 工具命令

| 命令 | 功能 | 类型 |
|------|------|------|
| `/clear` | 清除对话 | Function |
| `/compact` | 压缩上下文 | Function |
| `/cost` | 显示成本 | Function |
| `/help` | 显示帮助 | Function |

### 模式命令

| 命令 | 功能 | 类型 |
|------|------|------|
| `/plan` | 进入计划模式 | Function |
| `/fast` | 切换快速模式 | Function |
| `/vim` | 切换 Vim 模式 | Function |

## 命令自动完成

```typescript
// 源码位置: src/commands/autocomplete.ts

function getCompletions(input: string): string[] {
  if (!input.startsWith('/')) {
    return []
  }
  
  const partial = input.slice(1).toLowerCase()
  
  return commands
    .filter(cmd => cmd.name.startsWith(partial))
    .map(cmd => `/${cmd.name}`)
}
```

## 自定义命令

用户可以在 `.claude/commands/` 目录定义自定义命令:

```markdown
<!-- .claude/commands/review.md -->
Review the current changes:
1. Run tests
2. Check for issues
3. Suggest improvements
```

```typescript
// 加载自定义命令
async function loadCustomCommands(cwd: string): Promise<Command[]> {
  const commandsDir = path.join(cwd, '.claude', 'commands')
  const files = await fs.readdir(commandsDir)
  
  return files.map(file => ({
    name: path.basename(file, '.md'),
    action: {
      type: 'prompt',
      template: fs.readFileSync(path.join(commandsDir, file), 'utf-8'),
    },
  }))
}
```

## 设计模式

### 1. 命令模式

将操作封装为对象:

```typescript
interface Command {
  execute(): void
}
```

### 2. 模板方法

不同命令类型使用不同模板:

```typescript
if (action.type === 'prompt') return injectPrompt()
if (action.type === 'skill') return loadSkill()
if (action.type === 'function') return callHandler()
```

### 3. 注册表模式

集中管理所有命令:

```typescript
commandRegistry.register(command)
commandRegistry.find(name)
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Commands | 无 | 斜杠命令系统 |
| Shortcuts | 无 | 快速触发工作流 |
| Custom | 无 | 用户自定义命令 |
| Autocomplete | 无 | 命令补全 |

## 实践练习

### 练习 1: 实现命令解析器

```typescript
function parseCommand(input: string): { name: string; args: string } | null {
  // TODO: 解析 "/command args"
}
```

### 练习 2: 实现命令注册

```typescript
class CommandRegistry {
  register(command: Command): void
  find(name: string): Command | undefined
  list(): Command[]
}
```

### 练习 3: 添加自定义命令加载

```typescript
async function loadCommandsFromDir(dir: string): Promise<Command[]> {
  // TODO: 从目录加载 .md 文件作为命令
}
```

## 思考题

1. 为什么有些命令用 Skill 而不是 Function？
2. 命令参数如何处理复杂情况 (如带空格的字符串)？
3. 如何实现命令的历史记录？

## 延伸阅读

- [c05: Context Compression](c05-context-compression.md) - `/compact` 的实现
- [c10: Hooks Extension](c10-hooks-extension.md) - 命令 hook
- 源码: `src/commands/`

---

**下一章**: [c05: Context Compression](c05-context-compression.md) →