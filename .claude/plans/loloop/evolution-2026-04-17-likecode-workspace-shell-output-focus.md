# Evolution 2026-04-17 - LikeCode Workspace Shell Output Focus

## Plan
- Continue Task 13 from the active LikeCode workspace app plan.
- Keep the pass bounded to one shell output accessibility improvement.
- Make the shell output preview reachable and named for keyboard and assistive-technology users without auto-announcing large buffers.

## Completed
- Added `tabindex="0"` and `aria-label="当前 shell 输出预览，可滚动查看"` to `workspace-shell-output` in `site/app-likecode-workspace.html`.
- This makes the scrollable shell output block keyboard-focusable and identifiable without turning it into a noisy live log.
- Updated `site/md/app-likecode-workspace.md` with the behavior note.
- Updated `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md` with the completed pass and next handoff.

## Validation
- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/app-likecode-workspace.html site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-output-focus.md`

## Failed / Deferred
- None.

## Next Handoff
- Continue Task 13.
- Stay on structural shell-surface improvements and pick one more small operator-control or explanation pass after the shell-output focus pass.
