# Evolution 2026-04-17 - LikeCode Workspace Shell Preset Group

## Plan
- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one quick-probe semantic grouping cleanup.
- Avoid touching `site/css/style.css` because it already has unrelated uncommitted changes in this worktree.

## Completed
- Added `role="group"` and `aria-labelledby="workspace-shell-presets-label"` to the quick-probe button row in `site/app-likecode-workspace.html`.
- Added `id="workspace-shell-presets-label"` to the existing `常用探针` label.
- The four preset command buttons are now exposed as a named quick-probe group without changing JS behavior.
- Updated `site/md/app-likecode-workspace.md` with the behavior note.
- Updated `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation
- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/app-likecode-workspace.html site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-preset-group.md`

## Failed / Deferred
- Deferred CSS focus-ring work because `site/css/style.css` already had unrelated uncommitted changes before this pass.

## Next Handoff
- Continue Task 13.
- Stay on structural shell-surface improvements and pick one more small operator-control or explanation pass after the preset-group semantics pass.
