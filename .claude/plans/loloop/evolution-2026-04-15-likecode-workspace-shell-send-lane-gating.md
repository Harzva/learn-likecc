# evolution-2026-04-15-likecode-workspace-shell-send-lane-gating.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 把 active-seat gating 从 `刷新输出 / 关闭选中` 扩到整条 shell 发送链，让输入框、发送按钮和常用探针也与当前会话依赖保持一致

## Completed

- updated `site/js/likecode-workspace.js` so `syncShellActionState()` now disables the command input, send button, and all preset probe buttons when there is no active shell
- kept the existing refresh/close gating in the same helper so active-seat dependency is now enforced from one place
- added a disabled-state placeholder fallback for the command input so the no-seat reason stays legible even when the input itself is disabled
- synced the same rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no new shell actions or backend checks were added in this pass
- this iteration only aligned visible control availability with the existing no-seat dependency instead of changing send semantics or replay behavior

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the full send-lane gating cleanup, preferably a compact readability or control-boundary improvement inside the current `Shell Seats` surface
