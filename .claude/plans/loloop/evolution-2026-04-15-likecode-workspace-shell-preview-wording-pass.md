# evolution-2026-04-15-likecode-workspace-shell-preview-wording-pass.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the shell preview label match the now-more-Chinese operator tone used by the surrounding shell summary row

## Completed

- updated `site/app-likecode-workspace.html` so the shell preview line now starts with `预览: --`
- updated `site/js/likecode-workspace.js` so normal, guidance, and error preview states now all use the `预览:` prefix instead of `preview:`
- synced the markdown note trail and active Task 13 plan with the new shell-preview wording pass

## Failed or Deferred

- did not change shell preview behavior or add a new preview lane in this pass
- did not branch into queued media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass to the label prefix because the remaining gap was wording consistency, not missing shell visibility
- translate the prefix first before touching the longer no-seat guidance sentence, so the next pass can decide whether the guidance body should also switch tone

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny wording-consistency pass around the no-seat shell preview guidance sentence, update the evolution trail, validate the touched files, and push the bounded pass.
```
