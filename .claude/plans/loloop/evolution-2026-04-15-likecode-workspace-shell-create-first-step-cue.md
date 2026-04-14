# evolution-2026-04-15-likecode-workspace-shell-create-first-step-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the shell creation action itself explicitly teach that it is the first step for the nearby `Enter` / quick-probe / output flow

## Completed

- updated `site/app-likecode-workspace.html` so the create action now reads `新建 shell · 第一步`
- updated the empty shell-roster copy in `site/js/likecode-workspace.js` so it no longer stops at “可以直接新建”，and instead explains that creating a shell enables the nearby `Enter` send and quick-probe path
- synced the markdown note trail and active Task 13 plan with the new create-action startup cue

## Failed or Deferred

- did not change shell creation behavior or add new shell lifecycle controls in this pass
- did not branch into queued media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass on the visible creation affordance because the remaining gap was startup sequencing, not missing capability
- prefer a compact `第一步` marker on the button instead of adding another helper row that would repeat the same teaching copy

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny shell-seat startup cue around the post-create selection step, update the evolution trail, validate the touched files, and push the bounded pass.
```
