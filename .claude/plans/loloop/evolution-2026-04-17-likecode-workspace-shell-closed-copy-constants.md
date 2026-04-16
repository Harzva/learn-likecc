# evolution-2026-04-17-likecode-workspace-shell-closed-copy-constants.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: centralize the repeated closed-shell recovery copy used by replay buttons and the shell dispatch hard guard

## Completed

- added named closed-shell recovery copy constants in `site/js/likecode-workspace.js`
- changed the disabled replay-button closed-shell tooltip to reuse `CLOSED_SHELL_BUTTON_HINT`
- changed the `dispatchShellCommand()` closed-shell status and preview messages to reuse `CLOSED_SHELL_STATUS` and `CLOSED_SHELL_PREVIEW`
- updated `site/md/app-likecode-workspace.md` with the operator-facing note for this pass
- updated the active Task 13 plan with the completed pass and next handoff

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 tools/refresh_site_topic_metadata.py`
- `git diff --check -- site/js/likecode-workspace.js site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-17-likecode-workspace-shell-closed-copy-constants.md`

## Failed or Deferred

- no browser render pass was run in this iteration
- broader shell-surface wording and real connector delivery behavior remain deferred to later bounded passes

## Next Handoff

```text
Use codex-loop to continue Task 13 via .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read the latest evolution note, keep the LikeCode workspace shell surface as the active thread, and choose exactly one small operator-control or explanation pass after the closed-shell recovery-copy centralization.
```
