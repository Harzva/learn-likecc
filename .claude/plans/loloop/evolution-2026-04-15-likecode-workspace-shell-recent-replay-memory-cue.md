# evolution-2026-04-15-likecode-workspace-shell-recent-replay-memory-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: clean up the default no-shell replay cue so it uses UI-facing wording instead of the more awkward `shared replay only`

## Completed

- changed the default no-shell `Recent Commands` cue to `current seat: no shell yet · replay memory only`
- kept the surrounding empty-shell and create-a-shell branches unchanged for this pass
- left replay behavior and button logic untouched
- synced the app note and active Task 13 plan with the replay-memory cue cleanup

## Failed or Deferred

- no replay behavior or button logic changed in this pass
- no browser render pass was run in this iteration

## Decisions

- keep the pass bounded to default copy cleanup because the replay lane behavior and empty-state routing were already aligned in prior rounds
- prefer UI-facing wording in the passive browser-memory state instead of surfacing a more implementation-flavored phrase like `shared replay only`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md and pick one more bounded shell-surface polish pass after the replay-memory cue cleanup.
```
