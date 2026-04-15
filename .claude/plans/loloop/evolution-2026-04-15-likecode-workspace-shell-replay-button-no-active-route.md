# evolution-2026-04-15-likecode-workspace-shell-replay-button-no-active-route

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: `Task 13 - LikeCode workspace app`
- bounded target: branch the disabled replay-button tooltip so it distinguishes between empty-roster and unselected-seat no-active routes

## Completed

- changed the disabled replay-button tooltip in `site/js/likecode-workspace.js` so it now says `create a shell first` when no shell exists, and `select an active shell first` only when shells exist but none is selected
- synced the route-branch wording change into `site/md/app-likecode-workspace.md`
- recorded the bounded-pass result and next handoff in the active Task 13 plan

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-15-likecode-workspace-shell-replay-button-no-active-route.md`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on one more bounded shell-surface polish pass, prefer another small operator-facing cue cleanup in the Recent Commands lane, then update the plan, add a new evolution note, validate, and commit only the Task 13 target files.
```
