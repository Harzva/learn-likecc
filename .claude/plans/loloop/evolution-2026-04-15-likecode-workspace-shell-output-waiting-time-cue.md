# evolution-2026-04-15-likecode-workspace-shell-output-waiting-time-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: replace the waiting-state `updated: --` placeholder with an explicit select-seat cue

## Completed

- changed the output-header time field so waiting state now says `updated: select a seat first`
- kept the existing `updated: no shell yet` branch for the empty-roster state
- left the active-seat provenance time behavior unchanged for this pass
- synced the app note and active Task 13 plan with the new waiting-time cue

## Failed or Deferred

- no HTML structure changes were needed for this pass
- no browser render pass was run in this iteration

## Decisions

- keep the pass bounded to the waiting-state time field because the surrounding output-header labels and tones were already tightened in recent rounds
- prefer turning leftover `--` placeholders into next-step guidance whenever the UI already knows the exact operator action required

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md and pick one more bounded shell-surface polish pass after the output-header waiting-time cue.
```
