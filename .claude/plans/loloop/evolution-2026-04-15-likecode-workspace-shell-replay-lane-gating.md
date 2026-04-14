# evolution-2026-04-15-likecode-workspace-shell-replay-lane-gating.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 把 `Recent Commands` replay 行接回 active-seat gating，让 shared replay 不再成为最后一条还能误点的 shell 发送路径

## Completed

- updated `site/js/likecode-workspace.js` so replay-row cue text switches to a select-seat warning when recent commands exist but no active shell is selected
- disabled `Recent Commands` replay buttons when there is no active shell, while preserving their labels and hover/assistive hints
- kept the change inside the existing replay rendering logic without adding new relay state or changing replay semantics after a seat is selected
- synced the same rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no new replay grouping, seat-specific replay partitions, or relay-backed history work was added in this pass
- this iteration stayed focused on control-availability consistency with the existing active-seat contract

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the replay-lane gating cleanup, preferably a compact scanability or control-hardening improvement inside the current `Shell Seats` surface
