# evolution-2026-04-17-likecode-workspace-shell-refresh-closed-guard.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: add a closed-shell hard guard to the manual shell-output refresh path

## Completed

- added refresh-specific closed-shell status and preview constants in `site/js/likecode-workspace.js`
- changed `refreshShellOutputWithFeedback()` to stop before reading output when the active shell is closed
- kept no-active, refresh-start, refresh-success, and refresh-error behavior unchanged
- updated `site/md/app-likecode-workspace.md` with the operator-facing impact note
- updated the active Task 13 plan with the completed pass and next handoff

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-refresh-closed-guard.md`

## Failed or Deferred

- no browser render pass was run in this iteration
- automatic post-send output refresh remains governed by the send path; this pass only hardens the explicit manual refresh entry

## Next Handoff

```text
Use codex-loop to continue Task 13 via .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read the latest evolution note, keep the LikeCode workspace shell surface as the active thread, and choose exactly one small operator-control or explanation pass after the manual-output-refresh closed-shell guard.
```
