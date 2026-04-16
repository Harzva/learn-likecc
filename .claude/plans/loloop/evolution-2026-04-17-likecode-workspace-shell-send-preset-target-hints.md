# Evolution 2026-04-17 - LikeCode Workspace Shell Send / Preset Target Hints

## Plan

- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one shell-control explanation improvement.
- Make live send and preset actions state their current session target, matching the refresh / close target-hint pass.

## Completed

- Added `SEND_ACTIVE_SHELL_HINT` and `PRESET_ACTIVE_SHELL_HINT` in `site/js/likecode-workspace.js`.
- Changed the preset control list inside `syncShellActionState()` from plain button nodes to `{ button, command }` entries.
- When enabled, manual send now exposes the active `session_id` through title and aria-label.
- When enabled, preset probes now expose both the command and active `session_id` through title and aria-label.
- Disabled no-active / closed-shell reasons are preserved for send and preset controls.
- Updated `site/md/app-likecode-workspace.md` with the operator-facing note for this bounded pass.
- Updated `active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-send-preset-target-hints.md`

## Failed / Deferred

- None.

## Next Handoff

- Continue Task 13.
- Stay on structural shell-surface improvements.
- Pick one more small operator-control or explanation pass after the send / preset live-target hint pass.
