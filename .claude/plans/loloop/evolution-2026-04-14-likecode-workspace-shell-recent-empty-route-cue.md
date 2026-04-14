# evolution-2026-04-14-likecode-workspace-shell-recent-empty-route-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: LikeCode workspace app shell-lane usability
- bounded target: make the `Recent Commands` empty state point back to the nearby `Enter` send and `常用探针` routes instead of teaching replay in isolation

## Completed

- updated the default `Recent Commands` empty copy to mention `Enter` send and `常用探针` before explaining replay
- updated the no-seat and no-local-replay empty variants with the same nearby-route cue
- synced the app markdown note and active Task 13 plan with the new replay-empty-state teaching cue

## Failed or Deferred

- no browser render pass was run in this iteration
- the selected-seat output hint still does not reference the nearby send/probe routes when local provenance is empty

## Decisions

- prefer teaching the generation path for replay at the exact empty state instead of relying on the surrounding helper lines alone
- keep the replay wording intact while adding just enough action guidance to unblock first use

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by adding one tiny shell-lane convenience pass so the selected-seat output hint also references the nearby send/probe routes when no local provenance exists yet.
```
