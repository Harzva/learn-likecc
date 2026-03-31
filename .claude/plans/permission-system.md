# 权限系统分析

## 概述

Claude Code 的权限系统控制工具的执行权限，支持多种权限模式和规则配置。

## 权限模式 (PermissionMode)

### 外部可配置模式

```typescript
type ExternalPermissionMode =
  | 'acceptEdits'      // 自动接受编辑操作
  | 'bypassPermissions' // 跳过所有权限检查
  | 'default'          // 默认模式，按规则检查
  | 'dontAsk'          // 不询问，按默认行为
  | 'plan'             // 计划模式
```

### 内部模式

```typescript
type InternalPermissionMode = ExternalPermissionMode | 'auto' | 'bubble'
```

- `auto`: 自动模式 (需 feature flag)
- `bubble`: 冒泡模式 (用于子 agent)

## 权限行为 (PermissionBehavior)

```typescript
type PermissionBehavior = 'allow' | 'deny' | 'ask'
```

- `allow`: 自动允许
- `deny`: 自动拒绝
- `ask`: 询问用户

## 权限规则 (PermissionRule)

### 规则来源

```typescript
type PermissionRuleSource =
  | 'userSettings'    // 用户全局设置
  | 'projectSettings' // 项目设置
  | 'localSettings'   // 本地设置
  | 'flagSettings'    // Feature flag
  | 'policySettings'  // 组织策略
  | 'cliArg'          // 命令行参数
  | 'command'         // 命令触发
  | 'session'         // 会话临时
```

### 规则结构

```typescript
type PermissionRule = {
  source: PermissionRuleSource
  ruleBehavior: PermissionBehavior
  ruleValue: {
    toolName: string
    ruleContent?: string  // 如文件路径模式
  }
}
```

## 权限检查流程

```
工具调用请求
    ↓
createPermissionContext()
    ↓
检查规则匹配
    ├── alwaysAllowRules → 自动允许
    ├── alwaysDenyRules → 自动拒绝
    └── alwaysAskRules → 询问用户
    ↓
无匹配规则
    ↓
根据 PermissionMode 处理
    ├── default → 询问用户
    ├── bypassPermissions → 允许
    ├── plan → 特殊处理
    └── auto → 分类器判断
```

## 核心组件

### PermissionContext

```typescript
type ToolPermissionContext = {
  mode: PermissionMode
  additionalWorkingDirectories: Map<string, AdditionalWorkingDirectory>
  alwaysAllowRules: ToolPermissionRulesBySource
  alwaysDenyRules: ToolPermissionRulesBySource
  alwaysAskRules: ToolPermissionRulesBySource
  isBypassPermissionsModeAvailable: boolean
  isAutoModeAvailable?: boolean
  strippedDangerousRules?: ToolPermissionRulesBySource
  shouldAvoidPermissionPrompts?: boolean
  awaitAutomatedChecksBeforeDialog?: boolean
  prePlanMode?: PermissionMode
}
```

### Permission Handlers

| Handler | 文件 | 用途 |
|---------|------|------|
| interactiveHandler | interactiveHandler.ts | 交互式权限请求 |
| coordinatorHandler | coordinatorHandler.ts | 协调器权限 |
| swarmWorkerHandler | swarmWorkerHandler.ts | Swarm worker 权限 |

### 审批来源

```typescript
type PermissionApprovalSource =
  | { type: 'hook'; permanent?: boolean }
  | { type: 'user'; permanent: boolean }
  | { type: 'classifier' }

type PermissionRejectionSource =
  | { type: 'hook' }
  | { type: 'user_abort' }
  | { type: 'user_reject'; hasFeedback: boolean }
```

## 权限持久化

```typescript
type PermissionUpdateDestination =
  | 'userSettings'
  | 'projectSettings'
  | 'localSettings'
  | 'session'
  | 'cliArg'
```

## 分类器自动审批

当启用 `TRANSCRIPT_CLASSIFIER` feature flag 时：

```typescript
// 分类器自动审批流程
awaitClassifierAutoApproval()
  → 分类器判断是否安全
  → 安全则自动允许
  → 不安全则询问用户
```

## 设计亮点

1. **多层规则来源**: 用户/项目/组织/会话多级配置
2. **灵活的行为控制**: allow/deny/ask 三种行为
3. **分类器集成**: AI 辅助权限判断
4. **持久化支持**: 记忆用户选择
5. **模式切换**: 支持临时切换权限模式
