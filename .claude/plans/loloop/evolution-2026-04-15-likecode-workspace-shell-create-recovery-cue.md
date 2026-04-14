# evolution-2026-04-15-likecode-workspace-shell-create-recovery-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 在没有其它 live seat 可切时，把 closed-seat 的恢复路径直接写回 `新建 shell` 按钮本身

## Completed

- updated `site/js/likecode-workspace.js` so the create-shell button now relabels itself as `新建 shell · 恢复会话` when the selected session is closed and there is no fallback live seat
- kept the existing `新建 shell · 第一步` label for ordinary first-step and normal multi-seat states
- reused the same action-row control surface instead of adding another dedicated recovery button
- synced the same operator-facing rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no extra recovery dialog or auto-create behavior was added in this pass
- this iteration only clarified the next recovery action instead of changing session lifecycle behavior

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the create-button recovery cue, preferably a compact readability or recovery cue inside the current `Shell Seats` surface
