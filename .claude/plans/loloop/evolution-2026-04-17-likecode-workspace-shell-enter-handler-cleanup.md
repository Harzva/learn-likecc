# evolution-2026-04-17-likecode-workspace-shell-enter-handler-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: remove the duplicate Enter-to-send listener on the workspace shell command input

## Completed

- removed the second `shellCommandInput` keydown listener in `site/js/likecode-workspace.js`
- kept the earlier guarded Enter listener that ignores `Shift+Enter` and IME composition
- updated `site/md/app-likecode-workspace.md` with the operator-facing impact note
- updated the active Task 13 plan with the completed pass and next handoff

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-enter-handler-cleanup.md`

## Failed or Deferred

- no browser render pass was run in this iteration
- deeper shell-send debounce or request-in-flight locking remains deferred until there is evidence of relay-side duplicate writes after this listener cleanup

## Next Handoff

```text
Use codex-loop to continue Task 13 via .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read the latest evolution note, keep the LikeCode workspace shell surface as the active thread, and choose exactly one small operator-control or explanation pass after the duplicate Enter-handler cleanup.
```
