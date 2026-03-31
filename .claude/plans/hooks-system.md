# Hooks 扩展系统分析

## 概述

Hooks 系统提供扩展点，允许在特定事件触发自定义逻辑。

## 目录结构

| 文件 | 大小 | 功能 |
|------|------|------|
| AsyncHookRegistry.ts | 9KB | 异步 Hook 注册表 |
| hooksConfigManager.ts | 17KB | Hook 配置管理 |
| sessionHooks.ts | 12KB | 会话 Hooks |
| execAgentHook.ts | 12KB | Agent Hook 执行 |
| execHttpHook.ts | 9KB | HTTP Hook 执行 |
| execPromptHook.ts | 7KB | Prompt Hook 执行 |
| hooksSettings.ts | 9KB | Hook 设置 |
| ssrfGuard.ts | 9KB | SSRF 防护 |

## Hook 类型

### 1. Agent Hooks
```typescript
// 执行 Agent 前后触发
execAgentHook(config, context)
```

### 2. HTTP Hooks
```typescript
// HTTP 请求前后触发
execHttpHook(config, request)
```

### 3. Prompt Hooks
```typescript
// Prompt 处理前后触发
execPromptHook(config, prompt)
```

## Hook 生命周期

```typescript
// 会话开始
executeSessionStartHooks()

// 预压缩
executePreCompactHooks()

// 后压缩
executePostCompactHooks()

// 会话结束
executeSessionEndHooks()
```

## Hook 注册

```typescript
// 注册 Frontmatter Hooks
registerFrontmatterHooks(agentDefinition)

// 注册 Skill Hooks
registerSkillHooks(skillDefinition)
```

## Hook 事件

```typescript
type HookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Notification'
  | 'Stop'
  | 'PreCompact'
  | 'PostCompact'
```

## 配置管理

```typescript
// Hook 配置结构
type HookConfig = {
  event: HookEvent
  type: 'command' | 'http' | 'prompt'
  command?: string
  url?: string
  timeout?: number
}
```

## 异步注册表

```typescript
// AsyncHookRegistry 管理异步 Hook
class AsyncHookRegistry {
  register(event: HookEvent, hook: Hook)
  async execute(event: HookEvent, context: Context)
}
```

## SSRF 防护

```typescript
// 防止通过 Hooks 访问内部网络
ssrfGuard(url: string): boolean
```

## 设计亮点

### 1. 多触发点
覆盖工具使用、压缩、通知等场景

### 2. 异步支持
AsyncHookRegistry 处理异步 Hook

### 3. 安全防护
SSRF Guard 防止内部网络访问

### 4. 灵活配置
支持命令、HTTP、Prompt 三种类型