# evolution-2026-04-12-connector-conversation-bridge-contract.md

## Plan

- path: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- bounded target: 在 workspace shell 和 relay 中补齐 conversation bridge contract，而不是直接承诺真实微信 runtime 已可用

## Completed

- 在 `site/app-likecode-workspace.html` 的 connector shell 里增加了 `bridge mode / target / policy / status`
- 在 `site/js/likecode-workspace.js` 中落了三类 bridge 动作：
  - `queue-ticket`
  - `thread-inject`
  - `task-handoff`
- 在 `tools/codex_loop_web_relay.py` 中把 connector state 扩成 bridge-aware 合同
- 在设计说明中明确了 `daemon-safe / ticket-first / single-thread-bind / runtime-locked` 的推荐边界

## Failed or Deferred

- 还没有真实 queue worker
- 还没有 delivery / watchdog 层
- 还没有 connector conversation 到 thread/task 的自动映射器

## Decisions

- 当前版本先把 “如何桥接” 说清楚，再决定是否真的需要独立 queue/delivery 子系统
- 默认推荐 `queue-ticket / daemon-safe`，不让外部入口直接写 daemon 正在推进的 thread

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md.
Read .claude/plans/loloop/evolution-2026-04-12-connector-conversation-bridge-contract.md first, then choose one bounded slice:
1. add lock-state aware bridge warnings in the workspace shell,
2. design a lightweight queue / inbox pane for connector tickets,
3. map one connector dialog to one task/workspace binding record.
```
