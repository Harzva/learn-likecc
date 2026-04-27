# evolution-2026-04-12-likecode-workspace-app-portable-shell.md

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: remove repo-local assumptions so the workspace shell can follow the selected relay workspace instead of being tied to `learn-likecc`

## What changed

- extended `tools/codex_loop_web_relay.py` with workspace metadata and task-board endpoints
- moved relay-side editable path and git-date resolution from repo-root assumptions to the active `workspace` root
- added `.codex-loop/workspace-shell.json` as an optional branding / Pages-base override instead of hardcoding `LikeCode` and `Harzva/learn-likecc` into the shell
- updated `site/app-likecode-workspace.html` and `site/js/likecode-workspace.js` so the page title, summary, nav links, and task-board loading all come from relay-visible workspace metadata
- updated `tools/build_loop_task_board.py` so blob/live links can be inferred from the current repo remote and optional shell config instead of being permanently tied to one project

## Why this pass matters

- the previous shell was useful, but it was still a project-local UI wearing a generic name
- this pass turns it into a real `codex-loop workspace shell` direction: same page, different workspace, different user, fewer code edits
- the most important fix was not visual; it was making the relay respect the supplied workspace root for editable paths and git metadata

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/build_loop_task_board.py`
- `python3 tools/check_site_md_parity.py`

## Next handoff

Use codex-loop to continue the active plan at `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`. Read this evolution note first, then keep the shell portability line bounded. The best next move is probably exporting this workspace shell into the standalone `codex-loop-skill` repo, or adding one richer workspace-meta contract that can survive projects without a site layer at all.
