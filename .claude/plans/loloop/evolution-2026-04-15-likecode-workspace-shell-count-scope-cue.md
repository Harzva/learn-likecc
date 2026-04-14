# evolution-2026-04-15-likecode-workspace-shell-count-scope-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the shell-count runtime card explicitly teach that it reports roster-total scope rather than the currently selected shell

## Completed

- updated `site/app-likecode-workspace.html` so the count card now reads `sessions · roster scope`
- updated `site/js/likecode-workspace.js` so the count value now reads `N total` instead of a bare number
- synced the markdown note trail and active Task 13 plan with the new shell-count scope cue

## Failed or Deferred

- did not change shell roster behavior or add additional runtime cards in this pass
- did not branch into queued media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass on the summary row because count was the last runtime card still relying on implicit scope beside the more explicit active-seat card
- prefer compact roster wording on the card itself instead of another explanatory sentence under the runtime row

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny active-seat dependency cue around the cwd runtime card, update the evolution trail, validate the touched files, and push the bounded pass.
```
