# evolution-2026-04-15-likecode-workspace-shell-output-waiting-badge-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: replace the waiting-state `seat-local hint` badge with an explicit select-seat cue

## Completed

- changed the output-header scope badge so waiting state now says `select seat hint`
- kept the existing `empty shell hint` branch for the empty-roster state
- left the active-seat and gap-state badge labels unchanged for this pass
- synced the app note and active Task 13 plan with the new waiting-badge cue

## Failed or Deferred

- no HTML structure changes were needed for this pass
- no browser render pass was run in this iteration

## Decisions

- keep the pass bounded to the waiting-state scope badge because the adjacent source and time cues were already converted to next-step guidance
- prefer making all three waiting-state header chips converge on the same operator action instead of leaving one residual generic label in place

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md and pick one more bounded shell-surface polish pass after the output-header waiting-badge cue.
```
