# Evolution 2026-04-17 - LikeCode Workspace Shell Create Action Hints

## Plan

- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one shell-control explanation improvement.
- Extend the title / aria-label hint path to the always-available create-shell action.

## Completed

- Added `CREATE_SHELL_FIRST_STEP_HINT` and `CREATE_SHELL_RECOVERY_HINT` in `site/js/likecode-workspace.js`.
- Applied those hints to `workspace-shell-create` through the existing `applyButtonHint()` path inside `syncShellActionState()`.
- Kept the create action's visible text unchanged while exposing whether it is the first setup step or a closed-shell recovery route.
- Updated `site/md/app-likecode-workspace.md` with the operator-facing note for this bounded pass.
- Updated `active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-create-action-hints.md`

## Failed / Deferred

- None.

## Next Handoff

- Continue Task 13.
- Stay on structural shell-surface improvements.
- Pick one more small operator-control or explanation pass after the create-shell action-hint pass.
