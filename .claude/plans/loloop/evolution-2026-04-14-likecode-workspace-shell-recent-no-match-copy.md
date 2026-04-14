# evolution-2026-04-14-likecode-workspace-shell-recent-no-match-copy.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny no-match row cleanup so `Recent Commands` reads more naturally when a seat is selected but every replay button is still shared history

## Completed

- updated `site/js/likecode-workspace.js` so the row badge now appends `shared replay below` when the active seat has no local replay match but shared replay buttons are available
- kept the mixed-row `+ shared replay below` wording for the distinct case where one current-seat replay button appears beside additional shared replay buttons
- synced the workspace app Markdown note and Task 13 plan notes with the new no-match row copy cleanup

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- the empty-recent case still falls back to the generic placeholder copy; this pass only clarified the selected-seat no-match path with shared replay present

## Decisions

- keep the no-match wording explicit because it answers a different operator question from the mixed current+shared case
- reuse the same `shared replay below` phrase so the row keeps one consistent mental model for non-current replay buttons

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny empty-row wording cleanup so Recent Commands reads more naturally when a seat is selected, has no local match, and there are still no recent commands at all.
```
