# evolution-2026-04-14-likecode-workspace-shell-output-gap-route-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: LikeCode workspace app shell-lane usability
- bounded target: make the selected-seat output gap hint point back to the nearby `Enter` send and quick-probe routes when no local provenance exists yet

## Completed

- updated the selected-seat output gap hint so it now says to send a fresh command with `Enter` or use the quick probes above
- kept the seat-local gap behavior unchanged while making the recovery path explicit at the hint layer
- synced the app markdown note and active Task 13 plan with the new output-gap route cue

## Failed or Deferred

- no browser render pass was run in this iteration
- the no-seat output hint still reads as a generic inspection prompt and does not yet point to the nearby shell create/send path

## Decisions

- prefer making the recovery action explicit at the output hint itself instead of leaving the operator to infer it from the surrounding shell lane
- keep the hint short enough to remain scannable while still naming both `Enter` send and quick probes

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by adding one tiny shell-lane convenience pass so the no-seat output hint also references the nearby shell create/send path instead of staying as a generic inspection prompt.
```
