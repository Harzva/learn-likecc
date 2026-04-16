# evolution-2026-04-16-likecode-workspace-shell-replay-shell-count-reuse

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: `Task 13 - LikeCode workspace app`
- bounded target: keep the replay-button no-active route branch consistent by computing the shell roster count once per render instead of once per button

## Completed

- moved `shellCount = (shellState.sessions || []).length` out of the replay-button `recent.map()` loop in `site/js/likecode-workspace.js`
- synced the small consistency cleanup into `site/md/app-likecode-workspace.md`
- recorded the bounded-pass result and next handoff in the active Task 13 plan

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-16-likecode-workspace-shell-replay-shell-count-reuse.md`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on one more bounded shell-surface polish pass, prefer a small consistency check around Recent Commands or shell action cues, then update the plan, add a new evolution note, validate, and commit only the Task 13 target files.
```
