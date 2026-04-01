# c03: Permission Model (权限模型)

`c01 > c02 > [ c03 ] > c04 | c05 > c06 > c07 > c08 | c09 > c10 > c11 > c12`

> *"Trust but verify"* -- 权限系统保护用户免受意外操作。
>
> **Harness 层**: Permissions -- 安全边界与用户控制。

## 问题

Agent 可以执行任意工具，但:
- 用户可能不希望删除某些文件
- 某些命令需要确认
- 组织可能有安全策略
- 不同项目有不同的信任级别

## 解决方案

Claude Code 实现了多层权限系统:

```
+------------------+
| Permission Rule  |
| (user/project/)  |
+--------+---------+
         |
         v
+------------------+     +----------------+
| Rule Matching    | --> | Behavior       |
| (tool + content) |     | allow/deny/ask |
+------------------+     +----------------+
                                |
                                v
                         +-------------+
                         | User Action |
                         +-------------+
```

## 源码分析

### 权限模式

```typescript
// 源码位置: src/hooks/toolPermission/permissionMode.ts

type ExternalPermissionMode =
  | 'default'           // 默认: 按规则检查
  | 'acceptEdits'       // 自动接受编辑
  | 'bypassPermissions' // 跳过所有检查
  | 'dontAsk'           // 不询问用户
  | 'plan'              // 计划模式

type InternalPermissionMode = ExternalPermissionMode | 'auto' | 'bubble'
```

### 权限行为

```typescript
type PermissionBehavior = 'allow' | 'deny' | 'ask'
```

| 行为 | 含义 |
|------|------|
| `allow` | 自动执行，无需确认 |
| `deny` | 自动拒绝，不执行 |
| `ask` | 询问用户，等待决定 |

### 权限规则来源

```typescript
// 源码位置: src/hooks/toolPermission/types.ts

type PermissionRuleSource =
  | 'userSettings'    // ~/.claude/settings.json
  | 'projectSettings' // .claude/settings.json
  | 'localSettings'   // .claude/settings.local.json
  | 'policySettings'  // 组织策略
  | 'cliArg'          // 命令行参数
  | 'session'         // 会话临时规则
```

**优先级**: session > cliArg > policySettings > localSettings > projectSettings > userSettings

### 规则结构

```typescript
type PermissionRule = {
  source: PermissionRuleSource
  ruleBehavior: PermissionBehavior
  ruleValue: {
    toolName: string        // 工具名称
    ruleContent?: string    // 内容匹配模式
  }
}
```

**示例规则**:

```json
{
  "source": "projectSettings",
  "ruleBehavior": "allow",
  "ruleValue": {
    "toolName": "Bash",
    "ruleContent": "npm run *"
  }
}
```

### 权限上下文

```typescript
// 源码位置: src/hooks/toolPermission/createPermissionContext.ts

type ToolPermissionContext = {
  mode: PermissionMode
  alwaysAllowRules: ToolPermissionRulesBySource
  alwaysDenyRules: ToolPermissionRulesBySource
  alwaysAskRules: ToolPermissionRulesBySource
  
  // 特殊标志
  isBypassPermissionsModeAvailable: boolean
  isAutoModeAvailable?: boolean
  shouldAvoidPermissionPrompts?: boolean
}
```

### 权限检查流程

```typescript
// 源码位置: src/hooks/toolPermission/checkPermission.ts

async function checkPermission(
  toolName: string,
  params: any,
  context: ToolPermissionContext
): Promise<PermissionDecision> {
  
  // 1. 检查 alwaysAllow 规则
  if (matchesRules(toolName, params, context.alwaysAllowRules)) {
    return { behavior: 'allow', source: 'rule' }
  }
  
  // 2. 检查 alwaysDeny 规则
  if (matchesRules(toolName, params, context.alwaysDenyRules)) {
    return { behavior: 'deny', source: 'rule' }
  }
  
  // 3. 检查 alwaysAsk 规则
  if (matchesRules(toolName, params, context.alwaysAskRules)) {
    return { behavior: 'ask', source: 'rule' }
  }
  
  // 4. 根据 mode 处理
  switch (context.mode) {
    case 'bypassPermissions':
      return { behavior: 'allow', source: 'mode' }
    case 'auto':
      return await classifierDecision(toolName, params)
    default:
      return { behavior: 'ask', source: 'default' }
  }
}
```

### 用户交互

```typescript
// 源码位置: src/hooks/toolPermission/interactiveHandler.ts

async function askUserPermission(
  toolName: string,
  params: any
): Promise<UserDecision> {
  const choice = await showPermissionDialog({
    message: `Allow ${toolName}?`,
    options: [
      { label: 'Yes', value: 'allow' },
      { label: 'Yes, always for this', value: 'allow-permanent' },
      { label: 'No', value: 'deny' },
      { label: 'No, always for this', value: 'deny-permanent' },
    ],
  })
  
  if (choice.includes('permanent')) {
    await saveRule(toolName, params, choice)
  }
  
  return choice
}
```

## 分类器自动审批

当启用 `TRANSCRIPT_CLASSIFIER` feature flag:

```typescript
// AI 辅助权限判断
async function classifierDecision(
  toolName: string,
  params: any
): Promise<PermissionDecision> {
  const safety = await classifySafety(toolName, params)
  
  if (safety === 'safe') {
    return { behavior: 'allow', source: 'classifier' }
  }
  
  return { behavior: 'ask', source: 'classifier' }
}
```

## 设计模式

### 1. 责任链模式

多层规则检查，按优先级依次匹配:

```
session → cliArg → policy → local → project → user
```

### 2. 策略模式

不同权限模式使用不同策略:

```typescript
const strategies = {
  'bypassPermissions': () => 'allow',
  'acceptEdits': (tool) => tool === 'Edit' ? 'allow' : 'ask',
  'default': () => 'ask',
}
```

### 3. 观察者模式

权限决策可以被 hook 观察:

```typescript
// 权限 hook
hooks.on('permission:check', (tool, params) => {
  console.log(`Checking permission for ${tool}`)
})

hooks.on('permission:granted', (tool, params) => {
  console.log(`Permission granted for ${tool}`)
})
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Permission | 无 | 多层规则系统 |
| Mode | 无 | 5+ 权限模式 |
| Storage | 无 | 持久化用户选择 |
| Classifier | 无 | AI 辅助判断 |

## 实践练习

### 练习 1: 实现权限检查器

```typescript
interface Rule {
  toolName: string
  pattern?: string
  behavior: 'allow' | 'deny' | 'ask'
}

class PermissionChecker {
  rules: Rule[]
  
  check(toolName: string, params: any): 'allow' | 'deny' | 'ask' {
    // TODO: 实现规则匹配
  }
}
```

### 练习 2: 添加规则持久化

将用户选择保存到文件:

```typescript
async function saveRule(rule: Rule, destination: 'user' | 'project') {
  // TODO: 写入 settings.json
}
```

### 练习 3: 实现模式切换

```typescript
// 临时切换权限模式
async function withMode<T>(
  mode: PermissionMode,
  fn: () => Promise<T>
): Promise<T> {
  // TODO: 保存当前模式，执行 fn，恢复模式
}
```

## 思考题

1. 为什么需要多层级规则？单一配置文件不够吗？
2. 分类器如何判断操作是否安全？
3. 如何处理规则冲突？

## 延伸阅读

- [c04: Command Interface](c04-command-interface.md) - 命令系统
- [c10: Hooks Extension](c10-hooks-extension.md) - Hook 机制
- 源码: `src/hooks/toolPermission/`

---

**下一章**: [c04: Command Interface](c04-command-interface.md) →