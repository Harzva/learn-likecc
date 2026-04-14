# evolution-2026-04-14-likecode-workspace-shell-recent-seat-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny current-seat cue inside `Recent Commands` so the replay strip stops reading like a fully global command lane

## Completed

- updated `site/js/likecode-workspace.js` so `Recent Commands` now renders a seat-aware badge at row start, showing `current seat: --`, `no local match`, or the current seat's latest local command summary
- made the replay strip refresh when the active shell seat changes, so the current-seat cue tracks seat switches instead of only updating on new sends
- synced the workspace app Markdown note and Task 13 plan notes with the new recent-command seat cue

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- the replay buttons themselves are still visually uniform; this pass only added a row-level current-seat cue

## Decisions

- keep recent-command storage global and browser-local for now; a row-level seat cue is enough to reduce operator ambiguity without migrating the local schema
- refresh the replay strip on seat switches so the cue behaves like current context, not stale send history

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny highlight for the current seat's last local command inside Recent Commands so the replay buttons visually echo the output-provenance cue.
```
