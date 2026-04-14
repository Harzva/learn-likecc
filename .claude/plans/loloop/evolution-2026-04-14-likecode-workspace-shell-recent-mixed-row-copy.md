# evolution-2026-04-14-likecode-workspace-shell-recent-mixed-row-copy.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny mixed-row wording cleanup so `Recent Commands` reads more cleanly when one current-seat replay button appears beside several shared replay buttons

## Completed

- updated `site/js/likecode-workspace.js` so the row badge now appends `+ shared replay below` whenever the current seat has one highlighted replay button plus additional shared replay entries
- kept the clarification inside the existing badge instead of adding another foot row or help sentence to the shell panel
- synced the workspace app Markdown note and Task 13 plan notes with the mixed-row wording cleanup

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- when a seat is selected but has no current local replay match, the row still leans on `no local match` plus shared button labels; this pass only clarified the mixed current+shared case

## Decisions

- prefer one short badge suffix over more inline copy because the mixed row already has color, labels, and hover hints
- only show the suffix when there is an actual mixed row, so the no-seat and all-shared cases stay shorter

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny no-match row cleanup so Recent Commands reads more naturally when a seat is selected but every replay button is still shared history.
```
