# Loop Lab 仿真大专题

> **更新时间**: 2026-05-13
> **在线页面**: <https://harzva.github.io/learn-likecc/topic-cc-loop-lab.html>
> **HTML**: [`site/topic-cc-loop-lab.html`](../topic-cc-loop-lab.html)
> **说明**: HTML 为权威阅读面；本文件用于 PR、离线阅读和 diff 审阅。

## 概要

Loop Lab 是 Learn LikeCode 的仿真教程总入口。新版页面不再只是三个仿真器链接，而是按生产级教程组织：先给出学习路径选择，再展示 Claude Pet SVG 角色墙，然后进入三类仿真器、配套机制页和本地 SSE 联调。

## 目录（对照 HTML）

- **首屏工作台**
  - 定位：把 Agent Loop 从黑箱变成可训练的工作台
  - 覆盖：3 个在线仿真器、4 个机制页、27 个 SVG 角色、本地 SSE
- **先按问题选入口**
  - 我还不理解循环：Agent Loop 动态模拟器
  - 我想练命令和配置：脚本启示仿真器
  - 我想拆请求体：Trace Prompt 仿真器
  - 我想接真实事件：本地 SSE 联调
- **Claude Pet SVG Wall**
  - 来自本地 `claude-pets-svg` 素材
  - 可作为章节角色、状态徽章或教程视觉资产
- **三种在线仿真器**
  - [Agent Loop 动态模拟器](../agent-loop-simulator/)
  - [脚本启示仿真器](../agent-script-insight/)
  - [Trace Prompt 仿真器](../agent-trace-simulator/)
- **建议学习路线**
  - 看循环
  - 做练习
  - 拆请求
  - 接事件
- **配套机制页**
  - [Codex Loop Console](../topic-codex-loop-console.html)
  - [任务驱动舱](../topic-loop-task-board.html)
  - [Loop 机制](../topic-loop-mechanisms.html)
  - [Connector Runtime / Daemon](../topic-connector-runtime-daemon.html)
- **本地 SSE 联调**
  - relay 命令
  - 本地静态服务器命令
  - 浏览器 URL
  - 事件日志与示例日志

## 三种仿真方式怎么分工

| 仿真器 | 适合解决的问题 | 输出 |
| --- | --- | --- |
| Agent Loop 动态模拟器 | 一次 Agent 循环怎么跑 | 运行链路心智图 |
| 脚本启示仿真器 | 命令与配置怎么练 | 可重复的命令套路 |
| Trace Prompt 仿真器 | Claude Code 请求如何长出来 | prompt 结构阅读能力 |

## 本地 SSE 联调

浏览器订阅 `http://127.0.0.1:8769/events` 的 SSE 演示流。页面默认提供三段可复制命令：

```bash
python tools/cc_loop_sse_relay.py --fast
cd site && python -m http.server 8080
```

然后打开：

```text
http://127.0.0.1:8080/topic-cc-loop-lab.html
```

## 说明

- GitHub Pages 上只能展示静态页面；真实事件流必须在本机启动 relay。
- 默认 relay 地址绑定 `127.0.0.1`，不向公网暴露。
- 真实 Claude Code 运行时须自行埋点并替换演示数据。
