# evolution-2026-04-15-likecode-workspace-shell-preview-no-active-branching.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, bounded follow-up after the branched no-session output cue
- bounded target: branch the runtime preview empty copy so it points to create vs select instead of showing `--`

## Completed

- updated `site/js/likecode-workspace.js` so `workspace-shell-preview` no longer falls back to a generic `--` when no active seat is present
- when shell seats exist but none is selected, the preview field now says `预览: 先选中一个 shell`
- when the roster is empty, the preview field now says `预览: 先新建一个 shell`
- synced the shell-surface copy note in `site/md/app-likecode-workspace.md`
- recorded the new bounded-pass state in `active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- no HTML structure changes were needed in this iteration
- no browser render pass was run in this iteration

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on small shell-surface improvements, pick one more bounded operator-control or explanation pass after the branched no-active preview cue, update the plan and evolution trail, verify locally, and keep unrelated dirty worktree changes out of the commit.
```
