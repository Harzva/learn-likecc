# evolution-2026-04-14-likecode-workspace-shell-memory-scope-note.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny scope note so the UI teaches that replay and provenance are browser-local memory rather than relay-backed session history

## Completed

- added a small scope note in `site/app-likecode-workspace.html` directly under the shell-memory clear action
- clarified in-page that `Recent Commands`, `output from`, and `updated` are browser-local operator memory rather than relay-persisted shell history
- synced the workspace app Markdown note and Task 13 plan notes with the new scope explanation

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- no seat-scoped reset affordance was added yet; the scope note clarifies memory ownership but does not refine reset granularity

## Decisions

- place the note inside the shell panel instead of only in Markdown so the operator sees the scope boundary at the point of use
- clarify memory ownership in UI copy rather than overloading status labels with more technical wording

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny current-seat reset affordance or hint so operators can distinguish global local-memory reset from seat-specific provenance gaps.
```
