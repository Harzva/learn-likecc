# Hook Runtime 专题：Claude Code 钩子全景
> **更新时间**: 2026-04-22

> **在线页面**: https://harzva.github.io/learn-likecc/topic-hook-runtime.html  
> **本文件**: `site/md/topic-hook-runtime.md`  
> **说明**: 本页汇总 `claude-code-rebuild` 中的 Claude Code runtime hook，重点解释数量、分类、作用、关系，以及 Ralph Loop 如何使用 `Stop` hook。

## 一句话结论

Hook 是 runtime/harness 的生命周期事件回调，不是模型本体的能力。`claude-code-rebuild` 里能被 hook 系统识别的事件共有 27 个，覆盖工具权限、会话生命周期、上下文工作区、子代理任务和交互询问。

## 统计

- Hook event 总数：27。
- 可配置 hook 类型：`command`、`prompt`、`http`、`agent`。
- 内部实现还存在 callback hook，但它不是 settings/plugin 里持久化的普通配置类型。
- Ralph Loop 主要使用的 hook：`Stop`。

## 分组

### 工具与权限：5

- `PermissionRequest`
- `PreToolUse`
- `PostToolUse`
- `PostToolUseFailure`
- `PermissionDenied`

### 会话生命周期：7

- `Setup`
- `SessionStart`
- `UserPromptSubmit`
- `Notification`
- `Stop`
- `StopFailure`
- `SessionEnd`

### 上下文与工作区：7

- `PreCompact`
- `PostCompact`
- `InstructionsLoaded`
- `CwdChanged`
- `FileChanged`
- `WorktreeCreate`
- `WorktreeRemove`

### 子代理与任务：6

- `SubagentStart`
- `SubagentStop`
- `TaskCreated`
- `TaskCompleted`
- `TeammateIdle`
- `ConfigChange`

### 交互询问：2

- `Elicitation`
- `ElicitationResult`

## 关系

一次典型 session 可理解为：

`Setup -> SessionStart -> UserPromptSubmit -> PermissionRequest/PreToolUse -> Tool runs -> PostToolUse/PostToolUseFailure -> Stop -> SessionEnd`

旁路事件包括：

- compact：`PreCompact -> PostCompact`
- workspace：`CwdChanged`、`FileChanged`、`WorktreeCreate`、`WorktreeRemove`
- subagent/task：`SubagentStart`、`SubagentStop`、`TaskCreated`、`TaskCompleted`
- interaction：`Elicitation`、`ElicitationResult`

## Ralph Loop

Ralph Loop 使用 Claude Code 的 `Stop` hook。当 Claude 准备停止时，hook 脚本检查循环状态、completion promise 和 iteration。如果任务未完成，就返回 `decision:"block"` 与 `reason`。runtime 因此阻止结束，并把 `reason` 重新喂给模型，形成循环。
