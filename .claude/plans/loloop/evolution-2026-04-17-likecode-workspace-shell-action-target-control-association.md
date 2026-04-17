# evolution-2026-04-17-likecode-workspace-shell-action-target-control-association.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: link the top shell action controls to the roster and output regions they affect

## Completed

- added `aria-controls="workspace-shell-list"` to the shell roster refresh button
- added `aria-controls="workspace-shell-output"` to the current-session output refresh button
- added `aria-controls="workspace-shell-list"` to the new-shell button
- added `aria-controls="workspace-shell-list workspace-shell-output"` to the focus-live and close-selected buttons because those actions can change both current selection and output context
- updated `site/md/app-likecode-workspace.md` and the Task 13 plan handoff with the new target-control association

## Verification

- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `git diff --check -- site/app-likecode-workspace.html site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-action-target-control-association.md`

## Next Handoff

```text
Use codex-loop to continue Task 13 from `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`. Continue from the current unchecked / active item; after the shell-action target-control association pass, pick one more bounded structural shell-surface improvement that keeps `site/app-likecode-workspace.html`, `site/js/likecode-workspace.js`, `site/md/app-likecode-workspace.md`, and `tools/codex_loop_web_relay.py` aligned.
```
