# Loop 事件流实验室（本地）
> **更新时间**: 2026-04-12

> **在线页**（需本机 HTTP）：<http://127.0.0.1:8080/topic-cc-loop-lab.html>（示例端口）  
> **HTML**：[`site/topic-cc-loop-lab.html`](../topic-cc-loop-lab.html)  
> **GitHub Pages**：仅作静态备份；**EventSource 联调必须在本地**跑 [`tools/cc_loop_sse_relay.py`](../../tools/cc_loop_sse_relay.py)。

## 概要

浏览器订阅 `http://127.0.0.1:8769/events` 的 **SSE** 演示流，事件体为 JSON（`stage`、`title`、`ts` 等），与 [projects/cc-loop-live/README.md](../../projects/cc-loop-live/README.md) 中的 **LoopEvent** 概念对齐。

## 目录（对照 HTML）

- **步骤**：双终端（relay + `http.server`）+ 打开本页 + 连接。
- **连接**：URL 输入、连接/断开、日志 `pre`。

## 说明

- 不向公网暴露；默认绑定 **127.0.0.1**。
- 真实 Claude Code 运行时须自行埋点并替换演示数据。
