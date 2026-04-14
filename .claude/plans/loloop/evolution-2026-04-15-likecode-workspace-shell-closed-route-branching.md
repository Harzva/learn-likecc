# evolution-2026-04-15-likecode-workspace-shell-closed-route-branching.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, bounded follow-up after the create-button recovery cue
- bounded target: branch the `closed active seat` helper copy so it points either to `切到存活会话` or to `新建 shell · 恢复会话`

## Completed

- updated `site/js/likecode-workspace.js` so the `closed active seat` helper text now checks whether a fallback live session exists
- when another live seat exists, the helper text names that recovery path directly instead of only saying actions are disabled
- when no live seat exists, the helper text now points back to `新建 shell · 恢复会话` so the operator sees the exact next step in the same shell surface
- synced the shell-surface copy note in `site/md/app-likecode-workspace.md`
- recorded the new bounded-pass state in `active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- no HTML structure changes were needed in this iteration
- no browser render pass was run in this iteration

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on small shell-surface improvements, pick one more bounded operator-control or explanation pass after the branched closed-seat route cue, update the plan and evolution trail, verify locally, and keep unrelated dirty worktree changes out of the commit.
```
