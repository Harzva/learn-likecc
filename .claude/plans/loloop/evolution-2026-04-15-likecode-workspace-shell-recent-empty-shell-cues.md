# evolution-2026-04-15-likecode-workspace-shell-recent-empty-shell-cues.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: clean up the `Recent Commands` empty-shell cues so they stop referring to seat selection when no shell exists

## Completed

- changed the `Recent Commands` default cue to `current seat: no shell yet · shared replay only`
- changed the empty recent-state cue to `current seat: no shell yet · no shared replay yet`
- changed the shared-replay cue to `current seat: no shell yet · create a shell to replay`
- synced the app note and active Task 13 plan with the new empty-shell replay wording

## Failed or Deferred

- no replay behavior or button logic changed in this pass
- no browser render pass was run in this iteration

## Decisions

- keep the pass bounded to copy cleanup because the replay lane behavior itself was already aligned earlier
- prefer telling the operator to create a shell when none exists instead of suggesting seat selection that is impossible in the current state

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md and pick one more bounded shell-surface polish pass after the Recent Commands empty-shell cue cleanup.
```
