# evolution-2026-04-15-likecode-workspace-shell-count-empty-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, bounded follow-up after the branched no-active route badge cue
- bounded target: change the shell-count empty copy from a bare zero to a clearer operator-facing empty-state cue

## Completed

- updated `site/js/likecode-workspace.js` so `workspace-shell-count` no longer renders `共 0 个` when no shell seats exist
- when shell seats exist, the counter still renders `共 N 个`
- when the roster is empty, the counter now says `还没有 shell`
- synced the shell-surface copy note in `site/md/app-likecode-workspace.md`
- recorded the new bounded-pass state in `active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- no HTML structure changes were needed in this iteration
- no browser render pass was run in this iteration

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on small shell-surface improvements, pick one more bounded operator-control or explanation pass after the shell-count empty cue, update the plan and evolution trail, verify locally, and keep unrelated dirty worktree changes out of the commit.
```
