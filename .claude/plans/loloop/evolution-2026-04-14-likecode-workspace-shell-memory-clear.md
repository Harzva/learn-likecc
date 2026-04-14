# evolution-2026-04-14-likecode-workspace-shell-memory-clear.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny clear-history affordance so local replay memory can be reset intentionally without wiping all browser storage

## Completed

- added a `清空本地记忆` control to the shell panel in `site/app-likecode-workspace.html`
- implemented `clearShellMemory()` in `site/js/likecode-workspace.js` to reset recent replay commands and seat-scoped output provenance together
- kept the reset local to the workspace app by clearing only the shell-specific browser storage keys instead of touching unrelated local state
- synced the workspace app Markdown note and Task 13 plan notes with the new reset affordance

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- no scoped sub-reset was added yet; the control clears all local shell replay/provenance state rather than only the current seat

## Decisions

- reset replay history and output provenance together because they are two views over the same local shell-memory concept
- keep the reset strictly frontend-local instead of adding relay endpoints for a browser-only convenience feature

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny scope note so the UI teaches that replay and provenance are browser-local memory rather than relay-backed session history.
```
