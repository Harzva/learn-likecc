# Components UI 组件系统分析

## 概述

Claude Code 使用 **React + Ink** 构建终端 UI，共 **144 个组件**。

## 技术栈

- **UI 框架**: React 19
- **终端渲染**: Ink (React for CLI)
- **主题系统**: ThemeProvider + ThemedBox/ThemedText

## 核心 ink.ts 导出

```typescript
// 主题包装
import { ThemeProvider } from './components/design-system/ThemeProvider.js'

// 渲染函数
export async function render(node: ReactNode, options?): Promise<Instance>

// 基础组件
export { Box } from './components/design-system/ThemedBox.js'
export { Text } from './components/design-system/ThemedText.js'
export { Button } from './ink/components/Button.js'
export { Link } from './ink/components/Link.js'
export { Newline } from './ink/components/Newline.js'
export { Spacer } from './ink/components/Spacer.js'

// Hooks
export { useInput } from './ink/hooks/use-input.js'
export { useApp } from './ink/hooks/use-app.js'
export { useInterval } from './ink/hooks/use-interval.js'
```

## 主要组件分类

### 1. 对话框组件

| 组件 | 文件大小 | 功能 |
|------|----------|------|
| BridgeDialog | 34KB | IDE 桥接对话框 |
| AutoModeOptInDialog | 13KB | 自动模式确认 |
| BypassPermissionsModeDialog | 9KB | 跳过权限对话框 |
| CostThresholdDialog | 4KB | 成本阈值警告 |

### 2. 认证组件

| 组件 | 文件大小 | 功能 |
|------|----------|------|
| ConsoleOAuthFlow | 80KB | OAuth 控制台流程 |
| ApproveApiKey | 11KB | API Key 确认 |
| AwsAuthStatusBox | 10KB | AWS 认证状态 |

### 3. 进度/状态组件

| 组件 | 文件大小 | 功能 |
|------|----------|------|
| AgentProgressLine | 14KB | Agent 进度条 |
| BashModeProgress | 6KB | Bash 模式进度 |
| AutoUpdater | 31KB | 自动更新 |
| CoordinatorAgentStatus | 36KB | 协调器状态 |

### 4. 可视化组件

| 组件 | 文件大小 | 功能 |
|------|----------|------|
| ContextVisualization | 76KB | 上下文可视化 |
| CompactSummary | 14KB | 压缩摘要 |

## 设计系统

### ThemedBox/ThemedText

```typescript
// 主题感知组件
<Text color="primary">主题色文本</Text>
<Box borderColor="accent">主题边框</Box>
```

### ThemeProvider

```typescript
// 全局主题包装
function withTheme(node: ReactNode): ReactNode {
  return createElement(ThemeProvider, null, node)
}
```

## Ink Hooks

### useInput
```typescript
useInput((input, key) => {
  if (key.escape) handleEscape()
  if (key.return) handleEnter()
})
```

### useApp
```typescript
const { exit, stdout, stdin } = useApp()
```

### useInterval
```typescript
useInterval(() => {
  updateProgress()
}, 1000)
```

## 组件设计模式

### 1. 受控组件
```typescript
<BaseTextInput
  value={value}
  onChange={setValue}
  onSubmit={handleSubmit}
/>
```

### 2. 复合组件
```typescript
<CustomSelect>
  <CustomSelect.Item value="a">Option A</CustomSelect.Item>
  <CustomSelect.Item value="b">Option B</CustomSelect.Item>
</CustomSelect>
```

### 3. 渲染 Props
```typescript
<ContextVisualization>
  {(context) => <ContextList context={context} />}
</ContextVisualization>
```

## 设计亮点

### 1. 主题系统
统一主题管理，支持颜色切换

### 2. 响应式布局
根据终端尺寸自动调整

### 3. 无障碍支持
键盘导航、焦点管理

### 4. 性能优化
- 虚拟滚动
- 惰性渲染
- 动画帧控制