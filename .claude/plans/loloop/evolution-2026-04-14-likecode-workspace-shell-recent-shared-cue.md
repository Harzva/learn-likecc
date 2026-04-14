# evolution-2026-04-14-likecode-workspace-shell-recent-shared-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny stale/global cue for non-active `Recent Commands` buttons so reusable replay memory reads less like current-seat context

## Completed

- updated `site/js/likecode-workspace.js` so non-current replay buttons now render as `shared · <command>` while the active seat's latest local command remains the primary button
- kept the distinction purely in the existing replay strip instead of introducing another panel or storage layer for cross-seat history
- synced the workspace app Markdown note and Task 13 plan notes with the new shared-replay cue

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- when there is no active seat, recent buttons still fall back to plain command labels; this pass only clarified the active-seat case

## Decisions

- use explicit `shared` wording on secondary buttons because color alone was too implicit for a row that mixes current-seat and reusable global replay memory
- avoid pretending to know which other seat a shared replay item came from; the UI only claims that it is reusable browser-local history, not seat-authenticated provenance

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny no-seat wording cleanup in Recent Commands so shared replay reads cleanly even before any shell seat is selected.
```
