# Evolution 2026-04-17 - LikeCode Workspace Shell No-Active Copy Constants

## Plan

- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one shell-surface maintenance cleanup.
- Centralize the no-active shell recovery copy shared by command dispatch and manual output refresh.

## Completed

- Added `NO_ACTIVE_SHELL_STATUS` and `NO_ACTIVE_SHELL_PREVIEW` constants in `site/js/likecode-workspace.js`.
- Reused those constants in both `refreshShellOutputWithFeedback()` and `dispatchShellCommand()`.
- Updated `site/md/app-likecode-workspace.md` with the operator-facing note for this bounded pass.
- Updated `active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-no-active-copy-constants.md`

## Failed / Deferred

- None.

## Next Handoff

- Continue Task 13.
- Stay on structural shell-surface improvements.
- Pick one more small operator-control or explanation pass after the no-active recovery-copy centralization.
