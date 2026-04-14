# evolution-2026-04-15-likecode-workspace-shell-pid-selected-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the `pid` runtime card explicitly teach that it belongs to the currently selected shell instead of leaving the last active-seat dependency implicit in the summary row

## Completed

- updated `site/app-likecode-workspace.html` so the `pid` card now reads `pid · selected shell`
- updated `site/js/likecode-workspace.js` so the empty `pid` value now says `先选中后查看 pid` instead of a bare dash
- synced the markdown note trail and active Task 13 plan with the new pid selected-shell cue

## Failed or Deferred

- did not change shell pid behavior or add new process controls in this pass
- did not branch into queued media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass on the summary row because `pid` was the last runtime card still relying on implicit active-seat scope
- prefer matching the `cwd` card shape so the runtime row reads as one consistent set instead of mixed conventions

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny wording-consistency pass across the shell summary cards, update the evolution trail, validate the touched files, and push the bounded pass.
```
