# evolution-2026-04-15-likecode-workspace-shell-no-active-runtime-meta-branching.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, bounded follow-up after the branched no-active runtime-card cue
- bounded target: branch the no-active `cwd / pid` runtime-card copy so empty rosters point to create rather than select

## Completed

- updated `site/js/likecode-workspace.js` so `workspace-shell-cwd` and `workspace-shell-pid` no longer share one generic no-active sentence
- when shell seats exist but none is selected, the runtime cards still say `先选中后查看`
- when the roster is empty, the runtime cards now say `先新建后查看`
- synced the shell-surface copy note in `site/md/app-likecode-workspace.md`
- recorded the new bounded-pass state in `active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- no HTML structure changes were needed in this iteration
- no browser render pass was run in this iteration

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on small shell-surface improvements, pick one more bounded operator-control or explanation pass after the branched no-active runtime meta cues, update the plan and evolution trail, verify locally, and keep unrelated dirty worktree changes out of the commit.
```
