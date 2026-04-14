# evolution-2026-04-15-likecode-workspace-shell-roster-readability.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- active task: Task 13 — LikeCode workspace app
- bounded target: 提升 `Shell Seats` roster 项的扫读性，让当前会话、cwd/pid 和状态不再挤在同一行密集文本里

## Completed

- added page-local shell roster item styles in `site/app-likecode-workspace.html` so the selected row has explicit visual emphasis without touching global CSS
- updated `site/js/likecode-workspace.js` to render each shell row as a small two-layer summary: title row for `session id / 当前会话`, meta rows for `cwd + pid` and `状态: 就绪/已关闭`
- fixed the roster row state class usage so closed sessions now actually inherit the existing `is-done` treatment instead of computing that class and dropping it
- synced the same readability rationale into `site/md/app-likecode-workspace.md`
- recorded the bounded pass in the active Task 13 plan

## Failed or Deferred

- no new shell grouping, filtering, or backend session metadata was added in this pass
- this iteration stayed inside the existing roster list instead of opening a broader multi-pane or shell-lab branch

## Next Handoff

- keep Task 13 active
- choose one more small structural shell-surface pass after the roster readability cleanup, preferably a compact cue that improves operator scanning or seat control without widening backend scope
