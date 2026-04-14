# evolution-2026-04-14-likecode-workspace-shell-output-empty-state.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny seat-sensitive empty-state cue so shell output context explains when no local command provenance is known

## Completed

- updated `site/js/likecode-workspace.js` so shell output context no longer renders a bare `--` when the visible seat has no local command history
- added an explicit `unknown on this seat / no local send yet` cue for seats whose output did not come from the current workspace shell session
- kept the known-command path unchanged so locally replayed probes still show both command and timestamp context
- synced the workspace app Markdown note and Task 13 plan notes with the new empty-state wording

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- no seat-level clear/reset control was added yet; the unknown-state cue only explains provenance gaps and does not manage stored history

## Decisions

- prefer explicit provenance wording over a generic placeholder because `--` does not tell the operator whether data is missing, stale, or simply not locally known
- keep the cue seat-sensitive so one shell's missing provenance does not affect another shell with valid local history

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny clear-history affordance so local replay memory can be reset intentionally without wiping all browser storage.
```
