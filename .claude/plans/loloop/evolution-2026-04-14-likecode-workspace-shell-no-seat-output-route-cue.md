# evolution-2026-04-14-likecode-workspace-shell-no-seat-output-route-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: LikeCode workspace app shell-lane usability
- bounded target: make the no-seat output hint point back to the nearby shell create/select and send paths instead of staying as a generic inspection prompt

## Completed

- updated the no-seat output hint so it now says to create or select a seat first, then send a command with `Enter` or the quick probes above
- kept the no-seat output body and status behavior unchanged while making the startup path explicit in the hint row
- synced the app markdown note and active Task 13 plan with the new no-seat output route cue

## Failed or Deferred

- no browser render pass was run in this iteration
- the empty output body text still just says `选中 shell 后，这里会显示最近输出。` and does not yet point back to create/send actions

## Decisions

- prefer teaching the start path directly in the no-seat hint before changing the empty output body itself
- keep the hint tied to the existing `seat-local hint` badge rather than adding another extra helper line

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by adding one tiny shell-lane convenience pass so the empty output body text also references the nearby shell create/send path instead of leaving that guidance only in the hint row.
```
