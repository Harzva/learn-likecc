# 仿真大专题 / Loop Lab
> **更新时间**: 2026-05-04

> **在线页面**: <https://harzva.github.io/learn-likecc/topic-cc-loop-lab.html>
> **HTML**：[`site/topic-cc-loop-lab.html`](../topic-cc-loop-lab.html)  
> **说明**：三种在线仿真器可直接在 GitHub Pages 打开；本地 SSE 联调仍需本机运行 [`tools/cc_loop_sse_relay.py`](../../tools/cc_loop_sse_relay.py)。

## 概要

这个专题是 Learn LikeCode 的仿真总入口：把 **Agent Loop 动态回放**、**脚本启示练习**、**Trace Prompt 拆解** 三种在线仿真方式收在一起，再用 Loop 控制台、任务板、机制页和本地 SSE 事件流解释它们背后的运行结构。HTML 页面现在按专题控制台展示：首屏是 Loop Lab 总览，三条仿真路径是主入口，配套机制页作为下游解释层。

## 目录（对照 HTML）

- **在线仿真器**
  - [Agent Loop 动态模拟器](../agent-loop-simulator/)
  - [脚本启示仿真器](../agent-script-insight/)
  - [Trace Prompt 仿真器](../agent-trace-simulator/)
- **配套机制页**
  - [Codex Loop Console](../topic-codex-loop-console.html)
  - [任务驱动舱](../topic-loop-task-board.html)
  - [Loop 机制](../topic-loop-mechanisms.html)
  - [Connector Runtime / Daemon](../topic-connector-runtime-daemon.html)
- **本地 SSE 步骤**：双终端（relay + `http.server`）+ 打开本页 + 连接。
- **连接**：URL 输入、连接/断开、日志 `pre`。

## 三种仿真方式怎么分工

- **Agent Loop 动态模拟器**：回答“一次 Agent 循环怎么跑”，重点是用户输入、模型响应、工具调用、结果回灌与最终回答。
- **脚本启示仿真器**：回答“脚本与配置怎么练”，重点是命令脚本、终端练习、配置生成和测验。
- **Trace Prompt 仿真器**：回答“Claude Code 请求如何长出来”，重点是 system、runtime reminder、tool catalog、user message 的累计关系。

## 本地 SSE 联调

浏览器订阅 `http://127.0.0.1:8769/events` 的 **SSE** 演示流，事件体为 JSON（`stage`、`title`、`ts` 等），与 [projects/cc-loop-live/README.md](../../projects/cc-loop-live/README.md) 中的 **LoopEvent** 概念对齐。

## 说明

- 本地 SSE 不向公网暴露；默认绑定 **127.0.0.1**。
- 真实 Claude Code 运行时须自行埋点并替换演示数据。
