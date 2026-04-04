---
name: Claude Code 源码学习
description: 项目背景和当前状态
type: project
---

## 项目背景

2026-03-31，Anthropic 的 Claude Code CLI 源码通过 npm registry 中的 source map 文件泄露。

**Why**: 学习官方 CLI 工具的架构设计和实现模式

**How to apply**: 分析源码结构、设计模式、技术选型

## 仓库定位（演进）

在源码学习之外，本仓库已承载**个人阅历随笔、工具链感想、对外 Markdown 稿件**（`site/column-agent-journey.*`、`wemedia/zhihu/articles/`），并计划纳入**项目经历与作品集**。整体视为**个人知识库 / 赛博档案**（可检索、可 diff、不依赖单一云平台），见 `.claude/skills/赛博永生.md`。

## 项目完成状态

| 阶段 | 状态 | 完成度 |
|------|------|--------|
| 源码解压分析 | ✅ 完成 | 100% |
| 核心架构理解 | ✅ 完成 | 95% |
| 系统详细分析 | ✅ 完成 | 90% |
| 文档整理 | ✅ 完成 | 100% |

## 学习成果

- **文档**: 17 个分析文档
- **代码**: 5 个 polyfill/类型文件
- **Git Commits**: 15+ 次

## 核心系统覆盖

1. ✅ Tool 系统
2. ✅ QueryEngine
3. ✅ Bridge 系统
4. ✅ 权限系统
5. ✅ MCP 协议
6. ✅ Compact 压缩
7. ✅ Agent 子进程
8. ✅ Commands 命令
9. ✅ Services 服务层
10. ✅ Components UI
11. ✅ Vim 模式
12. ✅ Voice 模式
13. ✅ Hooks 扩展
14. ✅ Git 集成
