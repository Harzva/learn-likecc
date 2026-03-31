---
name: Claude Code 源码学习
description: 项目背景和当前状态
type: project
---

## 项目背景

2026-03-31，Anthropic 的 Claude Code CLI 源码通过 npm registry 中的 source map 文件泄露。

**Why**: 学习官方 CLI 工具的架构设计和实现模式

**How to apply**: 分析源码结构、设计模式、技术选型

## 当前状态

| 指标 | 状态 |
|------|------|
| 源码解压 | ✅ 完成 |
| 依赖安装 | ✅ 完成 |
| 编译测试 | ❌ 失败 (5237+ 错误) |
| 架构分析 | 🔄 进行中 |

## 下一步

1. 深入分析 Tool 系统实现
2. 研究 QueryEngine 流式处理
3. 学习 Bridge IDE 集成协议
