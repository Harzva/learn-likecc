# evolution-2026-04-17-likecode-workspace-shell-output-loading-semantics.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: expose shell output refresh loading state on the output log itself

## Completed

- added `aria-busy="false"` to the static `workspace-shell-output` log in `site/app-likecode-workspace.html`
- added `setShellOutputBusy()` in `site/js/likecode-workspace.js`
- toggled the shell output busy state around `refreshShellOutput()` relay reads, including no-active and error exits
- updated `site/md/app-likecode-workspace.md` and the Task 13 plan handoff with the new loading semantics

## Verification

- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `git diff --check -- site/app-likecode-workspace.html site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-output-loading-semantics.md`

## Next Handoff

```text
Use codex-loop to continue Task 13 from `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`. Continue from the current unchecked / active item; after the shell-output loading semantics pass, pick one more bounded structural shell-surface improvement that keeps `site/app-likecode-workspace.html`, `site/js/likecode-workspace.js`, `site/md/app-likecode-workspace.md`, and `tools/codex_loop_web_relay.py` aligned.
```
