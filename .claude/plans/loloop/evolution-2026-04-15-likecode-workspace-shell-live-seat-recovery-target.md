# evolution-2026-04-15-likecode-workspace-shell-live-seat-recovery-target.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 把 `切到首个存活会话` 的具体目标写回按钮本身，让恢复动作在存在多个 live seat 时不再是黑盒跳转

## Completed

- updated `site/js/likecode-workspace.js` so the live-seat recovery button now rewrites its own label to `切到存活会话 · <session id>` when a concrete fallback live session exists
- kept the button on the generic label when no fallback live seat is available, so the control still reads cleanly in empty or single-live-seat states
- synced the same operator-facing rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no new recovery heuristics or live-seat ranking policy was added in this pass
- this iteration only clarified the existing recovery target instead of changing which session counts as the preferred fallback

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the recovery-target cue, preferably a compact readability or recovery cue inside the current `Shell Seats` surface
