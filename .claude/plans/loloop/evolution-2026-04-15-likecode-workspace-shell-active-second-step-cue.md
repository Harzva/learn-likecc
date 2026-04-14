# evolution-2026-04-15-likecode-workspace-shell-active-second-step-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the active-seat runtime card explicitly teach that selecting a shell is the second step after creation for the nearby send/output flow

## Completed

- updated `site/app-likecode-workspace.html` so the runtime card label now reads `active seat · 第二步`
- updated `site/js/likecode-workspace.js` so the empty active-seat value now says `先选中一个 shell` instead of a bare dash
- synced the markdown note trail and active Task 13 plan with the new second-step runtime cue

## Failed or Deferred

- did not change shell selection behavior or add new seat navigation controls in this pass
- did not branch into queued media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass on the runtime summary because that card sits directly beside the create action and can teach the next step without adding another helper line
- prefer a compact `第二步` marker plus a plain empty-value cue so the sequence stays visible even before any seat is active

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny shell-seat boundary cue around the close-selected action, update the evolution trail, validate the touched files, and push the bounded pass.
```
