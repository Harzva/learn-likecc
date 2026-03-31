# Claude Code 源码学习计划

## 项目背景
2026-03-31，Anthropic 的 Claude Code CLI 源码通过 npm registry 中的 source map 文件泄露。本项目用于学习和分析其架构设计。

## 技术栈
- Runtime: Bun
- Language: TypeScript (strict)
- Terminal UI: React + Ink
- CLI Parsing: Commander.js
- Schema: Zod v4
- API: Anthropic SDK

## 阶段任务

### 阶段 1: 源码结构分析 ✅
- [x] 解压 claude-code-main.zip
- [x] 分析目录结构
- [x] 统计文件数量 (1884 个 TS 文件)
- [x] 统计代码行数 (~147,000 行)

### 阶段 2: 编译问题诊断 ✅
- [x] 创建 package.json
- [x] 创建 tsconfig.json
- [x] 安装依赖 (349 packages)
- [x] 尝试编译，记录错误 (5237+ 错误)

### 阶段 3: 问题分析 ✅
- [x] 分析缺失的模块文件
- [x] 记录 Bun 特有 API 问题
- [x] 创建 polyfill 框架

### 阶段 4: 学习与文档 ✅
- [x] 核心架构文档
- [x] Tool 系统分析
- [x] QueryEngine 分析
- [x] Bridge 系统分析

## 关键文件
| 文件 | 大小 | 说明 |
|------|------|------|
| main.tsx | 800KB | 入口文件 |
| QueryEngine.ts | 46KB | LLM 查询引擎 |
| bridgeMain.ts | 115KB | IDE 桥接主逻辑 |
| replBridge.ts | 100KB | REPL 桥接 |
| BashTool.tsx | 160KB | Shell 工具实现 |
| bashSecurity.ts | 102KB | Bash 安全检查 |
| Tool.ts | 29KB | 工具类型定义 |
| commands.ts | 25KB | 命令注册 |
| tools.ts | 17KB | 工具注册 |

## 完成的文档

| 文档 | 路径 | 内容 |
|------|------|------|
| 主计划 | plans/main.md | 项目规划 |
| 编译问题 | plans/compilation-issues.md | 错误分析 |
| 架构笔记 | plans/architecture.md | 架构概览 |
| Tool 系统 | plans/tool-system.md | 工具实现 |
| QueryEngine | plans/query-engine.md | API 核心 |
| Bridge 系统 | plans/bridge-system.md | IDE 集成 |

## 下一步方向

1. 深入分析权限系统 (`hooks/toolPermission/`)
2. 研究 MCP 协议集成 (`services/mcp/`)
3. 分析 Agent 子进程管理 (`tools/AgentTool/`)
4. 学习 compact 上下文压缩 (`services/compact/`)