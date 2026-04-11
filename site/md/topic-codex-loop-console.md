# codex-loop AI Terminal（本地 MVP+）

> **在线页**（需本机 HTTP）：<http://127.0.0.1:8080/topic-codex-loop-console.html>（示例端口）  
> **HTML**：[`site/topic-codex-loop-console.html`](../topic-codex-loop-console.html)  
> **GitHub Pages**：仅作静态备份；真实能力依赖本机 relay：[`tools/codex_loop_web_relay.py`](../../tools/codex_loop_web_relay.py)

## 概要

这是一个本地版 `codex-loop` 网页控制台最小实现：

- 看 daemon 状态
- 看 daemon log / latest tick log
- 看最近一轮 thread 输出
- 以受保护模式向当前 thread 发消息
- 多面板拖拽与缩放
- 可新增 monitor pane
- 布局持久化
- 可选 daemon 启停按钮
- 当前 thread 的只读 / 可写锁状态
- tabbed workspace 与本地 shell pane

## 启动

1. 运行 relay：
   - `python3 tools/codex_loop_web_relay.py --workspace /home/clashuser/hzh/item_bo/learn-likecc`
2. 运行静态站：
   - `cd site && python3 -m http.server 8080`
3. 打开：
   - `http://127.0.0.1:8080/topic-codex-loop-console.html`

## 设计边界

- 这是 **本地工具页**，不是线上 GitHub Pages 可用能力
- 默认 **安全优先**
- 当 daemon 正在运行时，网页端默认不直接往同一 thread 写消息
- 如要强制发送，需要显式勾选风险开关
- monitor pane 现在是“日志/输出观察窗”，还不是完整 PTY 终端模拟器
- shell pane 是本地 PTY relay，不是远程主机管理器
- 当 daemon 正在运行时，thread 写入仍默认受保护

## 目标

这个 MVP 先证明三件事：

- `.codex-loop` 的后台状态可以被网页端观察
- `thread_id` 可以被网页端当成桥接目标
- “多终端 / 多 pane / 可拖拽”的控制面可以先从本地最小实现开始

## 本轮增强

- 在 Relay 区补了 daemon 启停按钮
- 布局会落到浏览器 `localStorage`
- 可以复制出多个 monitor pane，同时盯 daemon log、latest tick、last message
- 新增 thread lock 控制，能把当前 thread 标成只读或恢复可写
- 新增 shell workspace：可创建多个本地 shell session，并在 tab 间切换
- shell pane 现在带 terminal frame、session cwd 与输出行数，不再只是裸 PTY 日志框
