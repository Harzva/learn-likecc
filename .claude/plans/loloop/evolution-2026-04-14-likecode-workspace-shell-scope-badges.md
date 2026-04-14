# evolution-2026-04-14-likecode-workspace-shell-scope-badges.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add one tiny visual distinction between the shell panel's global browser-memory note and the seat-scoped output-provenance hint

## Completed

- added a dedicated `seat-local hint` badge beside the shell output hint in `site/app-likecode-workspace.html` so the seat-scoped provenance line has its own visible layer
- updated `site/js/likecode-workspace.js` so the new badge switches between `seat-local hint / gap / cue` across no-seat, unknown-provenance, and known-provenance states by reusing the page's existing badge tones
- synced the workspace app Markdown note and Task 13 plan notes with the new split between panel-level memory scope and current-seat provenance scope

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- `Recent Commands` is still visually global; this pass only separated the global memory note from the seat-scoped output hint

## Decisions

- use a tiny badge split instead of a larger layout change so the shell panel stays dense but easier to scan
- keep the panel-level memory contract and the current-seat provenance cue in separate rows with separate labels, because they answer different operator questions

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny current-seat cue inside Recent Commands so replay history reads less like a fully global strip when switching between shell seats.
```
