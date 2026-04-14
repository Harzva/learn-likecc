# evolution-2026-04-14-likecode-workspace-shell-output-provenance-hint.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny seat-scoped provenance explanation near the `unknown on this seat` cue so operators can connect that empty state back to the current global-only reset model

## Completed

- added a small dynamic hint line under the shell output context in `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the hint now explains three cases: no seat selected, provenance unknown on this seat, and normal local provenance available
- connected the `unknown on this seat` case to the actual operator model by explaining that output may predate current browser memory or follow a global local-memory clear
- synced the workspace app Markdown note and Task 13 plan notes with the new provenance hint

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- no seat-scoped reset behavior was added; this pass only clarifies the relationship between seat output and the current global local-memory model

## Decisions

- keep the provenance explanation dynamic so the hint can stay short and state-specific instead of becoming a permanent dense paragraph
- explain the likely cause of missing provenance in operator language rather than exposing storage-key or implementation detail

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: tighten the success-state provenance hint so the known-provenance path reads like a normal operator cue instead of a defensive implementation note.
```
