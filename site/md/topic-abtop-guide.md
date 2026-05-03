# abtop — AI Coding Agent 监控仪表盘
> **更新时间**: 2026-04-29

## 概述

abtop 是一个用 Rust 编写的 TUI 仪表盘，用于监控多个 AI coding agent 的实时运行状态。

支持 Claude Code、Codex CLI 等终端 agent。在一屏内展示：

- 每个会话的 token 用量与上下文窗口占比
- Rate limit 配额状态与倒计时
- 当前执行任务描述
- Git 状态：分支、变更数
- 子进程与开放端口
- tmux 集成：选中会话按 Enter 直接跳转到对应 pane

## 核心痛点

1. **上下文吃满而不自知**：Claude Code 变慢、变飘、忘前文，通常是上下文快塞爆了
2. **Rate limit 突然打断**：abtop 提前显示配额状态
3. **窗口太多，不知道谁在跑**：多项目并行时状态汇总到一屏
4. **服务端口被遗忘**：列出开放端口，避免"僵尸服务"

## 功能特性

- Token 用量监控（进度条直观展示）
- Rate Limit 状态
- tmux 深度集成
- 进程与端口监控
- 隐私克制（无需 API Key）
- 轻量快速（Rust 编写）

## 安装

```bash
# Cargo
cargo install abtop

# 脚本安装（macOS / Linux）
curl -sSL https://raw.githubusercontent.com/graykode/abtop/main/install.sh | bash
```

Windows 原生暂不支持，需要走 WSL。

## 隐私设计

- 无需 API Key
- 无需登录认证
- 只读本地元数据
- 不展示文件内容
- 不展示 prompt 文本

## GitHub

https://github.com/graykode/abtop
