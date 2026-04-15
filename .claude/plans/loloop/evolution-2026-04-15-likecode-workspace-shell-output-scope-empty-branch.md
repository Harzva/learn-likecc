# evolution-2026-04-15-likecode-workspace-shell-output-scope-empty-branch.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: branch the output-panel scope badge so empty shell state stops reusing the generic seat-local hint label

## Completed

- changed the output header scope badge so empty roster now says `empty shell hint`
- kept the existing `seat-local hint` label for states where shells exist but the operator still needs to select a seat first
- left the output body, label, time, and hint text behavior unchanged apart from this badge-level routing cue
- synced the app note and active Task 13 plan with the new output-header badge branch

## Failed or Deferred

- no HTML structure changes were needed for this pass
- no browser render pass was run in this iteration

## Decisions

- keep the pass bounded to one badge-level cue because the surrounding output-header fields were already split in the previous rounds
- prefer carrying the same empty-roster semantics across body, header text, and header badges instead of mixing explicit copy with generic labels

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md and pick one more bounded shell-surface polish pass after the output-header scope badge branch.
```
