# evolution-2026-04-15-likecode-workspace-shell-live-seat-recovery.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 在 closed active seat 的场景下补一个前端内的恢复入口，让操作者可以直接切到首个存活会话，而不必先手动重新扫 roster

## Completed

- added one `切到首个存活会话` button to the shell action row in `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the button only enables when there is another alive session available, then switches `activeId`, rerenders the shell surface, and refreshes output for the new live seat
- kept the recovery path frontend-local with no relay API change or new backend mutation
- synced the same operator-facing rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no auto-switch policy was introduced; recovery still remains operator-triggered
- this iteration did not regroup or reorder roster items after the recovery shortcut landed

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the live-seat recovery shortcut, preferably a compact readability or recovery cue inside the current `Shell Seats` surface
