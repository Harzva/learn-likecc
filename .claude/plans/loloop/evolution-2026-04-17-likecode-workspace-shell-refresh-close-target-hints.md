# Evolution 2026-04-17 - LikeCode Workspace Shell Refresh / Close Target Hints

## Plan

- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one shell-control explanation improvement.
- Make live refresh / close actions state their current session target, not only their disabled reasons.

## Completed

- Added `REFRESH_ACTIVE_SHELL_HINT` and `CLOSE_ACTIVE_SHELL_HINT` in `site/js/likecode-workspace.js`.
- Split refresh-output and close controls out of the shared disabled-only hint loop.
- When enabled, refresh and close now expose the active `session_id` through title and aria-label.
- Disabled no-active / closed-shell reasons are preserved for the same controls.
- Updated `site/md/app-likecode-workspace.md` with the operator-facing note for this bounded pass.
- Updated `active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-refresh-close-target-hints.md`

## Failed / Deferred

- None.

## Next Handoff

- Continue Task 13.
- Stay on structural shell-surface improvements.
- Pick one more small operator-control or explanation pass after the refresh / close live-target hint pass.
