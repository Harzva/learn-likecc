# Evolution 2026-04-17 - LikeCode Workspace Roster Refresh Label

## Plan
- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one shell-control labeling cleanup.
- Clarify the `刷新 shell · 仅同步` action because it syncs the shell roster only and should not read like a command-send or output-refresh action.

## Completed
- Added static `title` and `aria-label` copy to `workspace-shell-refresh` in `site/app-likecode-workspace.html`.
- The label now says the action only syncs the shell roster and does not send commands or refresh current output.
- Updated `site/md/app-likecode-workspace.md` with the behavior note.
- Updated `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation
- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/app-likecode-workspace.html site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-roster-refresh-label.md`

## Failed / Deferred
- None.

## Next Handoff
- Continue Task 13.
- Stay on structural shell-surface improvements and pick one more small operator-control or explanation pass after the roster-refresh label pass.
