# evolution-2026-04-15-likecode-workspace-shell-action-target-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 在 `Shell Seats` 按钮行直接显示当前控制对象，让刷新输出和关闭动作不再只靠下方 runtime/roster 语境去推断目标会话

## Completed

- added one `当前会话: --` pill beside the shell action buttons in `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the pill tracks the active shell and switches between `当前会话: <session id>` and `当前会话: 未选择`
- kept the change inside the existing shell surface without touching relay APIs or adding new actions
- synced the same operator-facing rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no button regrouping, toolbar compression, or new seat actions were added in this pass
- this iteration focused only on making the existing refresh/close controls declare their current target more explicitly

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the shell-action target cue, preferably another compact scanability or control-boundary improvement within the current `Shell Seats` surface
