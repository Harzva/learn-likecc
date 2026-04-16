# Evolution 2026-04-17 - LikeCode Workspace Shell Disabled Control Hints

## Plan

- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one shell-surface operator-control improvement.
- Add explicit disabled-state reasons for shell controls that depend on an active live shell.

## Completed

- Added `NO_ACTIVE_SHELL_CONTROL_HINT` and `CLOSED_SHELL_CONTROL_HINT` in `site/js/likecode-workspace.js`.
- Updated `syncShellActionState()` so refresh-output, close, send, and preset buttons expose a title and aria-label while disabled.
- Kept disabled hints scoped to no-active and closed-shell states; live controls remove those labels again.
- Updated `site/md/app-likecode-workspace.md` with the operator-facing note for this bounded pass.
- Updated `active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-disabled-control-hints.md`

## Failed / Deferred

- None.

## Next Handoff

- Continue Task 13.
- Stay on structural shell-surface improvements.
- Pick one more small operator-control or explanation pass after the disabled-control hint pass.
