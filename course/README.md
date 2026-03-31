# learn-claude-code-source

> 基于 Claude Code 源码逆向分析的深度学习课程

[English](docs/en/README.md) | [中文](docs/zh/README.md)

## 课程简介

Claude Code 是 Anthropic 官方的 AI 编程助手 CLI 工具。本课程通过逆向分析其泄露源码，深入理解 Agent Harness 的设计与实现。

### 核心理念

```
Agent = 模型 (训练出来的神经网络)
Harness = Tools + Knowledge + Observation + Action + Permissions

Claude Code = Agent Loop + Tools + Skills + Compact + Subagent + Tasks + ...
```

### 课程特点

| 特点 | 说明 |
|------|------|
| 源码级深度 | 基于真实 TypeScript 源码分析 |
| 设计模式 | 提取可复用的架构模式 |
| 实现细节 | 展示具体代码实现 |
| 逆向思维 | 从代码反推设计意图 |

## 目标受众

- 高级前端/全栈工程师
- CLI 工具开发者
- Agent 系统架构师
- 对 AI 工具感兴趣的开发者

## 前置知识

- TypeScript/JavaScript (熟练)
- React 基础
- Node.js 或 Bun 运行时
- 基本的 CLI 使用经验

## 课程大纲

### Part 1: 基础架构

| 章节 | 主题 | 源码文件 |
|------|------|----------|
| [c01](docs/zh/c01-agent-loop.md) | The Agent Loop | QueryEngine.ts |
| [c02](docs/zh/c02-tool-system.md) | Tool System | Tool.ts, tools/ |
| [c03](docs/zh/c03-permission-model.md) | Permission Model | hooks/toolPermission/ |
| [c04](docs/zh/c04-command-interface.md) | Command Interface | commands/ |

### Part 2: 核心机制

| 章节 | 主题 | 源码文件 |
|------|------|----------|
| [c05](docs/zh/c05-context-compression.md) | Context Compression | services/compact/ |
| [c06](docs/zh/c06-subagent-fork.md) | Subagent & Fork | tools/AgentTool/ |
| [c07](docs/zh/c07-mcp-protocol.md) | MCP Protocol | services/mcp/ |
| [c08](docs/zh/c08-task-management.md) | Task Management | tasks/ |

### Part 3: 高级特性

| 章节 | 主题 | 源码文件 |
|------|------|----------|
| [c09](docs/zh/c09-bridge-ide.md) | Bridge & IDE | bridge/ |
| [c10](docs/zh/c10-hooks-extension.md) | Hooks Extension | utils/hooks/ |
| [c11](docs/zh/c11-vim-mode.md) | Vim Mode | vim/ |
| [c12](docs/zh/c12-git-integration.md) | Git Integration | utils/git/ |

## 学习路径

```
c01 Agent Loop
    ↓
c02 Tool System → c03 Permission → c04 Command
    ↓
c05 Compact → c06 Subagent → c07 MCP → c08 Tasks
    ↓
c09 Bridge → c10 Hooks → c11 Vim → c12 Git
```

## 项目结构

```
learn-claude-code-source/
├── course/                    # 课程内容
│   ├── docs/                 # 课程文档
│   │   ├── zh/              # 中文
│   │   └── en/              # 英文
│   ├── examples/            # 代码示例
│   └── skills/              # 技能模块
├── ccsource/                 # 源码分析
│   └── claude-code-main/    # 解压的源码
└── .claude/                  # 项目管理
    ├── plans/               # 计划文档
    ├── rules/               # 项目规则
    └── memory/              # 持久记忆
```

## 如何使用

### 本地学习

1. 克隆仓库
2. 阅读 `course/docs/zh/` 下的课程文档
3. 查看 `examples/` 下的代码示例
4. 参考 `ccsource/` 下的源码

### 源码参考

- 源码位置: `ccsource/claude-code-main/src/`
- 分析文档: `.claude/plans/`

## 贡献指南

欢迎贡献：
- 翻译课程内容
- 添加代码示例
- 完善文档

## 许可证

MIT License

---

**源码说明**: 本课程基于 2026-03-31 泄露的 Claude Code 源码进行分析学习。所有源码版权归 Anthropic 所有。