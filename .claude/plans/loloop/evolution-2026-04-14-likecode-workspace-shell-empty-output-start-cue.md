# evolution-2026-04-14-likecode-workspace-shell-empty-output-start-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: LikeCode workspace app shell-lane usability
- bounded target: make the no-seat output body text itself reference the nearby shell create/send path instead of leaving that startup guidance only in the hint row

## Completed

- updated the no-seat output body text to say: create or select a shell first, then send with `Enter` or the quick probes to populate output here
- kept the output status and hint behavior unchanged while making the startup path visible in the main output body itself
- synced the app markdown note and active Task 13 plan with the new empty-output start cue

## Failed or Deferred

- no browser render pass was run in this iteration
- the shell status preview still does not teach the same startup path when no seat is active

## Decisions

- prefer putting the startup instruction into the empty output body because that is the largest visual surface in the shell lane when no seat is selected
- keep the wording action-first so the operator sees how to populate the pane, not just what the pane will eventually show

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by adding one tiny shell-lane convenience pass so the shell status preview also teaches the same startup path when no seat is active instead of leaving startup guidance split across multiple rows.
```
