# evolution-2026-04-15-likecode-workspace-shell-cwd-selected-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the `cwd` runtime card explicitly teach that it belongs to the currently selected shell instead of relying on an implicit active-seat dependency

## Completed

- updated `site/app-likecode-workspace.html` so the `cwd` card now reads `cwd · selected shell`
- updated `site/js/likecode-workspace.js` so the empty `cwd` value now says `先选中后查看目录` instead of a bare dash
- synced the markdown note trail and active Task 13 plan with the new cwd selected-shell cue

## Failed or Deferred

- did not change shell cwd behavior or add any extra directory navigation controls in this pass
- did not branch into queued media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass on the summary row because `cwd` was the next runtime card still assuming the operator would infer its active-seat dependency
- prefer a compact `selected shell` marker on the card itself over adding another explanatory sentence below the runtime row

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny active-seat dependency cue around the pid runtime card, update the evolution trail, validate the touched files, and push the bounded pass.
```
