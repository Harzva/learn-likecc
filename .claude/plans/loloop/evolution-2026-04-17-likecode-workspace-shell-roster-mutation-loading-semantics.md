# evolution-2026-04-17-likecode-workspace-shell-roster-mutation-loading-semantics.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: keep shell roster busy semantics active during create / close mutations

## Completed

- set the roster list busy before the `createShellSeat()` POST starts
- clear the roster busy state if shell creation fails before the follow-up roster sync can run
- set the roster list busy before the `closeShellSeat()` POST starts
- clear the roster busy state if shell close fails before the follow-up roster sync can run
- updated `site/md/app-likecode-workspace.md` and the Task 13 plan handoff with the mutation-loading semantics

## Verification

- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-roster-mutation-loading-semantics.md`

## Next Handoff

```text
Use codex-loop to continue Task 13 from `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`. Continue from the current unchecked / active item; after the shell-roster mutation loading semantics pass, pick one more bounded structural shell-surface improvement that keeps `site/app-likecode-workspace.html`, `site/js/likecode-workspace.js`, `site/md/app-likecode-workspace.md`, and `tools/codex_loop_web_relay.py` aligned.
```
