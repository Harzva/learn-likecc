# evolution-2026-04-14-likecode-workspace-shell-send-button-enter-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: LikeCode workspace app shell-lane usability
- bounded target: add the `Enter` shortcut cue to the send button itself so the shortcut is visible on the primary action surface

## Completed

- changed the primary shell send button label from `发送命令` to `发送命令 · Enter`
- synced the app markdown note and active Task 13 plan with the new button-level shortcut cue

## Failed or Deferred

- no browser render pass was run in this iteration
- the preset row still does not declare itself as a quick-probe surface on its own; this pass only teaches the keyboard shortcut at the action button

## Decisions

- prefer a visible button-label cue over another hidden tooltip, because this microthread is about first-scan discoverability
- keep the cue short so the primary action still reads like a button, not a help paragraph

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by adding one tiny shell-lane convenience pass so the preset row also declares its role as quick probes instead of leaving that meaning inside the helper sentence only.
```
