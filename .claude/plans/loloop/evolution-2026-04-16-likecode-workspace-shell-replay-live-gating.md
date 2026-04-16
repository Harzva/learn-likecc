# evolution-2026-04-16-likecode-workspace-shell-replay-live-gating

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: `Task 13 - LikeCode workspace app`
- bounded target: align `Recent Commands` replay with the same live-shell dependency already used by the send lane and preset probes

## Completed

- disabled `Recent Commands` replay buttons when the active shell is closed, not only when no shell exists
- added a closed-shell replay button hint: `current shell is closed; switch or create a shell first`
- added a matching `dispatchShellCommand()` hard guard so replay cannot bypass button disabled state and send into a closed shell
- synced the live-gating update into `site/md/app-likecode-workspace.md`
- recorded the bounded-pass result and next handoff in the active Task 13 plan

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-16-likecode-workspace-shell-replay-live-gating.md`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Stay on one more bounded shell-surface polish pass, prefer a small consistency check around Recent Commands or shell action cues, then update the plan, add a new evolution note, validate, and commit only the Task 13 target files.
```
