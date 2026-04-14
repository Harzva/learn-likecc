# evolution-2026-04-15-likecode-workspace-shell-action-state-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 在 shell 按钮行补一个当前会话状态 cue，让刷新/关闭动作在触发前就能看到目标会话是就绪、已关闭还是未选择

## Completed

- added one `会话状态: 未选择` pill beside the existing shell action-target pill in `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the new pill tracks the active shell and switches between `会话状态: 就绪 / 已关闭 / 未选择`
- kept the change inside the existing action row without adding backend data, new buttons, or relay mutations
- synced the same operator-facing rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no new health checks or seat recovery actions were added in this pass
- this iteration stayed on control-boundary visibility rather than changing the action semantics themselves

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the shell-action state cue, preferably a compact scanability or control-hardening improvement that still fits inside the current `Shell Seats` surface
