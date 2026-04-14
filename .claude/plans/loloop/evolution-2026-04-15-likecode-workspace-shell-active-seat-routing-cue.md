# evolution-2026-04-15-likecode-workspace-shell-active-seat-routing-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 在 shell runtime 区补一个 active-seat routing cue，直接说明当前选中的 shell 正在驱动哪些下游动作和输出区域

## Completed

- added one small active-seat routing helper row under the shell runtime cards in `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the helper row becomes dynamic: with an active shell it names the session and states that it drives output preview, refresh-output, and close actions; without an active shell it explains why those downstream actions are not yet switching
- synced the same rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no roster regrouping, multi-pane terminal work, or relay API change was attempted in this pass
- the shell list item layout itself remains unchanged; this iteration focused only on making active-seat routing legible across the existing sections

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the active-seat routing cue, preferably a compact readability or control cue inside the existing `Shell Seats` surface without widening backend scope
