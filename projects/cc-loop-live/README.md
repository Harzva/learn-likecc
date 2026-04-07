# CC Loop 实时事件流（实验架）

本站静态页 [`topic-cc-unpacked-zh.html`](../../site/topic-cc-unpacked-zh.html) 上的步进播放器是 **JSON 预设讲解**，不连接真实 Claude Code 进程。若要做 **运行时过程可视化**，需要单独一条 **事件管道**：宿主在 Agent Loop 各阶段打点 → 中继 → 前端订阅。

## 事件模型（建议）

与讲解 JSON 里的 `id` 可对齐，便于复用同一套 UI：

```typescript
type LoopStage =
  | "input"
  | "message"
  | "history"
  | "system"
  | "api"
  | "tokens"
  | "tools_decide"
  | "tools_run"
  | "tool_result"
  | "loop_exit"
  | "render";

type LoopEvent = {
  stage: LoopStage;
  ts: number; // ms epoch
  title?: string;
  detail?: string;
  payload?: Record<string, unknown>;
};
```

传输可选：**NDJSON**（每行一条 JSON，易管道与调试）、**SSE**（`text/event-stream`）、**WebSocket**（双向）。静态 GitHub Pages **不能**直连用户本机 `localhost`，典型做法是：

- **本地**：浏览器打开 `http://127.0.0.1:…` 的专用调试页 + 本机 relay；或
- **自建后端**：relay 在公网/内网，宿主把事件 POST 上去，页面用 `EventSource` 订阅。

## 仓库内演示（无依赖）

[`tools/cc_loop_relay_demo.py`](../../tools/cc_loop_relay_demo.py) 向 **stdout** 打印若干行 **NDJSON**，模拟一轮 loop 阶段推进。可用于：

- 人工检查事件形状；
- 管道接入你自写的 SSE/WS 服务；
- 未来在 **instrumented** 的 `ccsource` 或官方 CLI 包装层替换为真实事件源。

```bash
python3 tools/cc_loop_relay_demo.py
python3 tools/cc_loop_relay_demo.py --fast
```

## 与课程站的关系

- **权威教学**：仍以 S01/D01 与静态导览为主。
- **本目录**：只放 **协议说明 + 演示脚本**；不把未审计的网络服务默认写进 CI。
- **安全**：真实 relay 必须处理鉴权、速率限制与敏感字段脱敏（提示词、API key、用户路径等）。

## 下一步（若正式做 Live）

1. 在选定宿主（fork 的 CLI 或 wrapper）里 **最小埋点**，先只发 `stage` + `ts`。  
2. 本机 **TCP/stdio relay** 验证 UI。  
3. 再考虑 SSE 与部署位置。
