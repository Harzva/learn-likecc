# 短期计划 - v2.0.x 系列

## 当前状态

| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| 编译错误 | 6087 | < 1000 |
| Stub 包 | 9 | 9 (已完成) |
| SDK 类型文件 | 6 | 6 (已完成) |
| 可运行 | ❌ | ❌ |

---

## v2.0.1 - 修复基础编译错误

**目标**: 将编译错误从 6087 降至 < 3000

### 任务 1: 修复消息类型定义

**问题**: 消息类型缺少 `type`, `isMeta`, `toolUseResult` 字段

**文件**: `src/types/message.ts`

**方案**:
```typescript
// 扩展 BaseMessage 接口
export interface BaseMessage {
  id: UUID
  role: MessageRole
  timestamp: number
  type?: MessageType           // 新增
  isMeta?: boolean             // 新增
  toolUseResult?: unknown      // 新增
  isVisibleInTranscriptOnly?: boolean  // 新增
  message?: {                  // 新增
    role?: string
    content?: MessageContent
    usage?: MessageUsage
  }
}
```

### 任务 2: 创建缺失模块 stub

**问题**: 缺少 `snipCompact.js`, `snipProjection.js`

**文件**: 
- `src/services/compact/snipCompact.ts`
- `src/services/compact/snipProjection.ts`

**方案**:
```typescript
// snipCompact.ts - stub 实现
export async function snipCompact(...args: unknown[]): Promise<unknown> {
  throw new Error('snipCompact not implemented')
}
```

### 任务 3: 修复 color-diff-napi

**问题**: `emitter` 属性不存在

**文件**: `packages/color-diff-napi/src/index.ts`

**方案**: 将 `emitter` 改为 `_emitter`

---

## v2.0.2 - SDK 类型完善

**目标**: 将编译错误从 < 3000 降至 < 1000

### 任务 1: 补全 SDK 类型导出

**文件**: `src/entrypoints/sdk/coreTypes.generated.ts`

检查并补全以下类型:
- `PermissionMode`
- `SDKCompactBoundaryMessage`
- `SDKPermissionDenial`
- `SDKStatus`
- `SDKUserMessageReplay`

### 任务 2: 修复类型冲突

**问题**: 参考项目的类型与源码类型不兼容

**方案**: 逐文件分析，选择性合并类型定义

---

## v2.0.3 - 运行时配置

**目标**: 准备运行环境

### 任务 1: 创建 bunfig.toml

```toml
# bunfig.toml
[install]
peer = true

[run]
# Bun 运行时配置
```

### 任务 2: 完善 feature flag 配置

**文件**: `src/bun-polyfill/bundle.ts`

添加可配置的 feature flags:
```typescript
const ENABLED_FEATURES = new Set([
  // 可在此启用 feature flags
])
```

### 任务 3: 创建入口点 polyfill

**文件**: `src/entrypoints/cli.tsx`

确保入口点正确注入所有 polyfill

---

## v2.0.4 - 首次运行尝试

**目标**: `bun run dev` 可启动

### 任务 1: 修复运行时错误

根据运行日志逐个修复错误

### 任务 2: 验证核心功能

- [ ] REPL 可启动
- [ ] 可接收用户输入
- [ ] 可调用 API
- [ ] 可执行工具

---

## 执行命令

完成当前短期计划后，执行：

```
/loop 20min 完成所有的v2.0.1_plan.md
```