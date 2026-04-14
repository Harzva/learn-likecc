# evolution-2026-04-15-likecode-workspace-shell-no-active-runtime-card-branching.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, bounded follow-up after the branched no-active route cue
- bounded target: branch the `active seat` runtime-card empty copy so it matches the new no-active route logic

## Completed

- updated `site/js/likecode-workspace.js` so the `workspace-shell-active` runtime card no longer uses one generic no-active sentence
- when shell seats exist but none is selected, the runtime card still says `先选中一个 shell`
- when the roster is empty, the runtime card now says `先新建一个 shell`
- synced the shell-surface copy note in `site/md/app-likecode-workspace.md`
- recorded the new bounded-pass state in `active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- no HTML structure changes were needed in this iteration
- no browser render pass was run in this iteration

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on small shell-surface improvements, pick one more bounded operator-control or explanation pass after the branched no-active runtime-card cue, update the plan and evolution trail, verify locally, and keep unrelated dirty worktree changes out of the commit.
```
