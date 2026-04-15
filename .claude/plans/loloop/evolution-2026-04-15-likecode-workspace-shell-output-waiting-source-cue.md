# evolution-2026-04-15-likecode-workspace-shell-output-waiting-source-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: replace the waiting-state `output from: --` placeholder with an explicit select-seat cue

## Completed

- changed the output-header source label so waiting state now says `output from: select a seat first`
- kept the existing `output from: no shell yet` branch for the empty-roster state
- left the active-seat provenance source behavior unchanged for this pass
- synced the app note and active Task 13 plan with the new waiting-source cue

## Failed or Deferred

- no HTML structure changes were needed for this pass
- no browser render pass was run in this iteration

## Decisions

- keep the pass bounded to the waiting-state source label because the adjacent time field was already tightened in the previous round
- prefer making the whole waiting-state header converge on one explicit next step instead of leaving the first chip as the last remaining `--` placeholder

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md and pick one more bounded shell-surface polish pass after the output-header waiting-source cue.
```
