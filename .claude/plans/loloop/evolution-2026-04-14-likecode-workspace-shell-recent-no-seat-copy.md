# evolution-2026-04-14-likecode-workspace-shell-recent-no-seat-copy.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny no-seat wording cleanup in `Recent Commands` so shared replay reads cleanly even before any shell seat is selected

## Completed

- updated `site/js/likecode-workspace.js` so the no-seat badge now says `shared replay only` instead of falling back to a bare `current seat: --`
- changed replay-button labels so non-current items always render as `shared · <command>`, including the no-seat case
- synced the workspace app Markdown note and Task 13 plan notes with the no-seat shared-replay wording cleanup

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- the `shared` cue is still inline copy only; this pass did not add any extra tooltip or browser-local provenance legend to the buttons themselves

## Decisions

- keep no-seat wording explicit because a plain command list can be misread as current shell output context
- reuse the same `shared` language across active-seat and no-seat cases so the replay strip has one consistent mental model

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny browser-local replay hint on hover or inline microcopy so shared replay buttons read clearly as local memory rather than relay-backed shell history.
```
