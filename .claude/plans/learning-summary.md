# Claude Code 源码学习总结

## 项目概览

| 指标 | 数值 |
|------|------|
| TypeScript 文件 | 1,884 个 |
| 代码行数 | ~147,000 行 |
| 命令数量 | 101 个 |
| 工具数量 | ~44 个 |
| UI 组件 | 144 个 |
| 服务模块 | 22 个 |

## 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI Entry (main.tsx)                     │
│                    Commander.js CLI Parser                   │
├─────────────────────────────────────────────────────────────┤
│                      Terminal UI Layer                       │
│              React + Ink (144 Components)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Dialogs │ │ Progress │ │  Visual  │ │   Auth       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Commands │ │  Tools   │ │ QueryEng │ │  Permission  │   │
│  │  (101)   │ │   (44)   │ │  (46KB)  │ │    System    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │   API    │ │   MCP    │ │   LSP    │ │   Compact    │   │
│  │ (126KB)  │ │ (119KB)  │ │          │ │   (61KB)     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │Analytics │ │   OAuth  │ │ Plugins  │ │    Agent     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Bridge/IDE Integration                     │
│              VS Code │ JetBrains │ Remote CCR               │
├─────────────────────────────────────────────────────────────┤
│                      Runtime Layer                           │
│                   Bun (JavaScript Runtime)                   │
└─────────────────────────────────────────────────────────────┘
```

## 核心系统分析

### 1. Tool 系统
- **文件**: Tool.ts (29KB) + tools.ts (17KB)
- **工具数**: ~44 个
- **关键工具**: Bash(160KB), Agent(234KB), MCP(119KB)
- **设计模式**: 构建器模式、策略模式

### 2. QueryEngine
- **文件**: QueryEngine.ts (46KB)
- **功能**: API 调用、流式处理、工具循环
- **优化**: 并行预取、惰性加载

### 3. 权限系统
- **模式**: default/bypassPermissions/plan/auto
- **规则来源**: 8 种 (user/project/policy/session...)
- **集成**: 分类器自动审批

### 4. MCP 协议
- **传输**: stdio/SSE/WS/HTTP
- **功能**: 动态工具发现、OAuth 集成
- **客户端**: client.ts (119KB)

### 5. Compact 压缩
- **触发**: 阈值自动 + 手动
- **策略**: LLM 摘要 + 边界标记
- **保护**: 多层阈值 + 失败计数

### 6. Agent 子进程
- **模式**: 同步/后台/Fork
- **隔离**: Worktree/Remote
- **通信**: 消息队列 + 进度追踪

### 7. Commands 系统
- **数量**: 101 个命令
- **条件加载**: Feature Flags
- **结构**: 模块化目录

### 8. UI 组件
- **框架**: React + Ink
- **主题**: ThemeProvider
- **组件数**: 144 个

## 技术栈总结

| 层级 | 技术 |
|------|------|
| Runtime | Bun |
| Language | TypeScript (strict) |
| Terminal UI | React 19 + Ink |
| CLI Parsing | Commander.js |
| Schema | Zod v4 |
| API | Anthropic SDK |
| Protocol | MCP SDK |
| Auth | OAuth 2.0 + JWT |
| Analytics | GrowthBook + OpenTelemetry |

## 设计模式总结

1. **并行预取**: 启动时并行加载 MDM/Keychain
2. **Feature Flags**: 编译时消除未使用代码
3. **惰性加载**: 重量级模块按需导入
4. **沙箱隔离**: Bash/Agent 沙箱执行
5. **多层缓存**: 文件状态/Token 估算
6. **Hook 系统**: 预/后处理扩展点

## 学习成果

### 已完成文档

| 文档 | 内容 |
|------|------|
| main.md | 主计划与进度 |
| architecture.md | 架构概览 |
| tool-system.md | Tool 系统分析 |
| query-engine.md | QueryEngine 分析 |
| bridge-system.md | Bridge IDE 集成 |
| permission-system.md | 权限系统分析 |
| mcp-system.md | MCP 协议分析 |
| compact-system.md | Compact 压缩分析 |
| agent-system.md | Agent 子进程分析 |
| commands-system.md | Commands 命令系统 |
| services-layer.md | Services 服务层 |
| components-ui.md | UI 组件系统 |

### 类型重建

- message.ts - 消息类型定义
- tools.ts - 工具进度类型
- utils.ts - 工具类型

### Polyfill 创建

- bundle.ts - bun:bundle polyfill
- bun.ts - Bun 全局对象 polyfill

## 下一步建议

1. 深入阅读 QueryEngine 流式处理逻辑
2. 分析 Coordinator 多 Agent 协调
3. 研究 Voice 模式实现
4. 学习 proactive 主动模式
