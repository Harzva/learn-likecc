# Evolution Note - Codex Loop In Sleep Seed

- Date: 2026-04-12
- Active plan: `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`
- Bounded target: 把 `ARIS vs codex-loop` 的分析从临时对话收成站内子专题，并接入长期循环任务池。

## Completed

- 新建了 `codex-loop in sleep` 子专题页：
  - `site/topic-codex-loop-in-sleep.html`
  - `site/md/topic-codex-loop-in-sleep.md`
- 把 `ARIS` 对 `codex-loop` 最值得借的五层收成统一口径：
  - workflow family
  - persistent wiki
  - meta optimize
  - watchdog health layer
  - cross-model review
- 明确了站内主结论：
  - `ARIS` 更像研究专用的 in-sleep system
  - `codex-loop` 更像通用型 in-sleep shell
- 准备把这条线作为新的长期任务接入 `prompt.md`

## What stayed intentionally small

- 这轮没有直接实现 `meta-optimize`、`watchdog` 或 `wiki` 新能力
- 先把比较口径、站内落点和循环计划固定下来，避免一边分析一边无序扩 scope

## Risks / constraints

- `codex-loop` 当前还没有真正的 persistent wiki 和 health watchdog
- 如果后续直接把三条借鉴线同时开做，容易让 loop 壳复杂度上升过快

## Next handoff

继续使用 `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`。
优先从三条借鉴线里选一条最小可验证推进：

1. `meta-optimize` 路线草案
2. `persistent wiki` 最小目录结构
3. `watchdog health layer` 的边界与最小计划

每轮只推进一条，并把结果回写到站内子专题或 `codex-loop` 计划体系里。
