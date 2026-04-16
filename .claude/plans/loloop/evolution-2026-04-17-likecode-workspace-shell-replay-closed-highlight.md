# evolution-2026-04-17-likecode-workspace-shell-replay-closed-highlight.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: keep closed-shell `Recent Commands` rows from retaining current-command replay highlight

## Completed

- kept continuity on Task 13 after the closed-shell badge pass
- updated `currentSeatRecentCommand()` so closed active shells no longer provide a current-seat replay command
- updated the `try replay below` badge suffix so it only applies to live active seats
- updated the workspace Markdown note and Task 13 plan trail with this closed-shell replay-highlight cleanup

## Validation

- passed: `python3 -m py_compile tools/codex_loop_web_relay.py`
- passed: `node --check site/js/likecode-workspace.js`
- passed: `python3 tools/check_site_md_parity.py`
- passed: `python3 tools/refresh_site_topic_metadata.py`
- passed: `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-replay-closed-highlight.md`

## Failed or Deferred

- did not change shell relay behavior or the broader shell roster controls
- did not reconcile unrelated dirty worktree changes

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. The latest pass removed closed-shell current replay highlighting; next pick one small shell-surface operator-control or explanation improvement, update the plan/evolution trail, validate locally, commit exact target files, and push.
```
