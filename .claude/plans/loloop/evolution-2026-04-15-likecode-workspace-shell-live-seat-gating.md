# evolution-2026-04-15-likecode-workspace-shell-live-seat-gating.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 把 shell 控制的 gating 条件从“有 active shell”收紧成“active shell 仍然存活”，避免 closed seat 继续让发送、刷新和关闭动作看起来可运行

## Completed

- updated `site/js/likecode-workspace.js` so shell action availability now depends on `active && active.alive` instead of only the existence of an active session
- added a closed-seat placeholder fallback for the command input, making the recovery path explicit when the selected session is already dead
- updated the active-seat routing cue so a closed selected session now reports that output refresh, send, and close actions are currently paused
- synced the same rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no new seat-recovery action or auto-switch-to-live-seat behavior was added in this pass
- this iteration only hardened the control boundary around closed sessions instead of changing session-selection policy

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the live-seat gating hardening, preferably a compact readability or recovery cue inside the current `Shell Seats` surface
