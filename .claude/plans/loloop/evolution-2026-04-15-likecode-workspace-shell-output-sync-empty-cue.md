# evolution-2026-04-15-likecode-workspace-shell-output-sync-empty-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, bounded follow-up after the shell-count empty cue
- bounded target: change the `output sync` empty-state copy from `--` to a clearer no-shell result

## Completed

- updated `site/js/likecode-workspace.js` so `workspace-shell-sync-time` no longer falls back to `output sync: --` when no shell exists yet
- when a sync timestamp exists, the field still renders the real time
- when shells exist but no sync time is available yet, the field still renders `output sync: --`
- when no shell exists yet, the field now renders `output sync: no shell yet`
- synced the shell-surface copy note in `site/md/app-likecode-workspace.md`
- recorded the new bounded-pass state in `active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- no HTML structure changes were needed in this iteration
- no browser render pass was run in this iteration

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on small shell-surface improvements, pick one more bounded operator-control or explanation pass after the output-sync empty cue, update the plan and evolution trail, verify locally, and keep unrelated dirty worktree changes out of the commit.
```
