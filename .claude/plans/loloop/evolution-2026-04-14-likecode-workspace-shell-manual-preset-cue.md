# evolution-2026-04-14-likecode-workspace-shell-manual-preset-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: LikeCode workspace app shell-lane usability
- bounded target: add one glanceable shell-lane teaching cue so manual send and preset probes are explained together instead of leaving shortcut knowledge inside the input placeholder only

## Completed

- added a short visible helper row under the shell command input
- the new helper teaches both paths together: manual commands can be sent with `Enter`, and common probes can be launched from the preset row below
- synced the app markdown note and active Task 13 plan with the new shell-lane teaching cue

## Failed or Deferred

- no browser render pass was run in this iteration
- the send button itself still does not expose the `Enter` shortcut; this pass teaches it through the shared helper row instead

## Decisions

- prefer one shared helper row over adding separate hints to every preset button
- keep the cue close to the command field so the send path and preset path are taught from the same visual cluster

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by adding one tiny shell-lane convenience pass so the send button itself also hints at the `Enter` shortcut instead of leaving that cue in the field and helper row only.
```
