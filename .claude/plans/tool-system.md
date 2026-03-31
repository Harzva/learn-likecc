# Tool 系统分析

## 工具定义结构

每个工具使用 `buildTool()` 函数创建：

```typescript
import { buildTool, type ToolDef } from '../../Tool.js'

const BashTool = buildTool({
  name: 'Bash',
  inputSchema: z.object({
    command: z.string(),
    timeout: z.number().optional(),
    // ...
  }),
  // 权限检查
  hasPermission: async (params, context) => {
    // 返回 PermissionResult
  },
  // 执行逻辑
  execute: async (params, context) => {
    // 返回 ToolResult
  },
  // UI 渲染
  renderToolUseMessage: (params) => <BashToolMessage ... />,
})
```

## 工具生命周期

```
1. 注册 (tools.ts)
   └── getTools() 返回所有可用工具

2. 权限检查 (hooks/toolPermission/)
   └── hasPermission() 或用户确认

3. 执行 (execute)
   └── 返回结果或错误

4. 结果渲染 (UI.tsx)
   └── renderToolResultMessage()
```

## BashTool 详细分析

### 文件结构

| 文件 | 大小 | 功能 |
|------|------|------|
| BashTool.tsx | 160KB | 主工具实现 |
| bashSecurity.ts | 102KB | 安全检查 |
| bashPermissions.ts | 98KB | 权限逻辑 |
| readOnlyValidation.ts | 68KB | 只读验证 |
| pathValidation.ts | 43KB | 路径验证 |
| UI.tsx | 25KB | UI 组件 |
| prompt.ts | 21KB | 提示生成 |

### 核心功能

1. **命令分类**
   ```typescript
   BASH_SEARCH_COMMANDS = ['find', 'grep', 'rg', 'ag', 'ack']
   BASH_READ_COMMANDS = ['cat', 'head', 'tail', 'jq', 'awk']
   BASH_LIST_COMMANDS = ['ls', 'tree', 'du']
   BASH_SILENT_COMMANDS = ['mv', 'cp', 'rm', 'mkdir']
   ```

2. **沙箱模式**
   - 自动检测是否需要沙箱
   - 通过 `SandboxManager` 隔离执行

3. **安全解析**
   - 使用 AST 解析命令
   - 检测危险操作
   - 路径验证

## 工具列表 (已识别)

| 工具名 | 目录 | 功能 |
|--------|------|------|
| Bash | BashTool/ | Shell 命令 |
| Read | FileReadTool/ | 文件读取 |
| Write | FileWriteTool/ | 文件写入 |
| Edit | FileEditTool/ | 文件编辑 |
| Glob | GlobTool/ | 文件搜索 |
| Grep | GrepTool/ | 内容搜索 |
| Agent | AgentTool/ | 子 Agent |
| Skill | SkillTool/ | 技能执行 |
| WebFetch | WebFetchTool/ | URL 获取 |
| WebSearch | WebSearchTool/ | Web 搜索 |
| LSP | LSPTool/ | 语言服务 |
| MCP | MCPTool/ | MCP 工具 |
| TaskCreate | TaskCreateTool/ | 任务创建 |
| TaskUpdate | TaskUpdateTool/ | 任务更新 |
| TaskOutput | TaskOutputTool/ | 任务输出 |
| EnterPlanMode | EnterPlanModeTool/ | 进入计划 |
| ExitPlanMode | ExitPlanModeTool/ | 退出计划 |

## 设计模式

### 1. 构建器模式
```typescript
buildTool({
  name, inputSchema, hasPermission, execute, render*
})
```

### 2. 策略模式
不同命令类型使用不同的处理策略：
- Search 命令 → 可折叠显示
- Read 命令 → 可折叠显示
- Silent 命令 → 显示 "Done"

### 3. 沙箱隔离
危险命令在沙箱中执行，保护系统安全。
