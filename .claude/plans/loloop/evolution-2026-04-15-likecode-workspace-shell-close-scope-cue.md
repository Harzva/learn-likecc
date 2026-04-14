# evolution-2026-04-15-likecode-workspace-shell-close-scope-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the shell close action explicitly teach that it applies to the current selected shell instead of reading like a generic panel-wide stop action

## Completed

- updated `site/app-likecode-workspace.html` so the close action now reads `关闭选中 · 当前会话`
- updated `site/js/likecode-workspace.js` so the transient close status now says `closing selected shell` instead of a generic `closing`
- synced the markdown note trail and active Task 13 plan with the new close-action scope cue

## Failed or Deferred

- did not change shell close behavior or add a separate confirmation flow in this pass
- did not branch into queued media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass on action-scope clarity because create and select were already teaching their roles, while close was still the vaguest shell-lane control
- prefer compact scope wording on the button itself instead of another helper sentence that would compete with the startup teaching line

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny shell-control role cue around the refresh action, update the evolution trail, validate the touched files, and push the bounded pass.
```
