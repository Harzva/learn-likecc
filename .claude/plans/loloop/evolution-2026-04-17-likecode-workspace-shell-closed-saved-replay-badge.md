# evolution-2026-04-17-likecode-workspace-shell-closed-saved-replay-badge.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: make the non-empty closed-shell `Recent Commands` badge show the recovery route

## Completed

- kept continuity on Task 13 after the closed-shell empty-replay route cue
- updated the non-empty closed-shell recent-command badge to append `switch or create first`
- updated the workspace Markdown note and Task 13 plan trail with the saved-replay badge route cue

## Validation

- passed: `python3 -m py_compile tools/codex_loop_web_relay.py`
- passed: `node --check site/js/likecode-workspace.js`
- passed: `python3 tools/check_site_md_parity.py`
- passed: `python3 tools/refresh_site_topic_metadata.py`
- passed: `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-closed-saved-replay-badge.md`

## Failed or Deferred

- did not change replay storage, shell relay behavior, or broader shell roster controls
- did not reconcile unrelated dirty worktree changes

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. The latest pass made the closed-shell saved-replay badge show `switch or create first`; next pick one small shell-surface operator-control or explanation improvement, update the plan/evolution trail, validate locally, commit exact target files, and push.
```
