# evolution-2026-04-11-site-codex-loop-terminal-workspace-presets.md

## Plan

- path: `.claude/plans/loloop/active-codex-loop-ai-terminal-plan-v1.md`
- milestone: codex-loop AI Terminal 继续补 layout recovery，把 tab 切换升级成可恢复的 workspace presets
- bounded target: 新增 `Overview / Thread Desk / Shell Lab / Debug` presets，本地恢复一套已知 pane 排布，不改 relay 协议

## Completed

- added a `Debug` workspace tab and a dedicated preset row to `site/topic-codex-loop-console.html`
- updated panel workspace groups so `Overview` is less crowded while `Debug` can host the combined inspection surface
- updated `site/js/codex-loop-console.js` with built-in preset layouts, preset badge state, and `custom` fallback after manual layout mutations
- bumped layout storage to `codex-loop-console-layout-v4` so old saved geometry does not override the new workspace split
- synced the Markdown mirror note in `site/md/topic-codex-loop-console.md`
- checked off the workspace-preset current-focus item in `.claude/plans/loloop/active-codex-loop-ai-terminal-plan-v1.md`
- updated the umbrella site loop plan to record this Task 7 layout-recovery pass

## Failed or Deferred

- no live relay browser pass was run in this iteration
- no backend relay change was needed in this bounded pass
- clearer relay success / error feedback was left for a later Task 7 pass

## Decisions

- keep presets fully client-side and deterministic so the operator can recover a known work surface without introducing relay-side session state
- treat `custom` as a lightweight truth signal once panes are dragged, resized, or duplicated, instead of pretending the last preset still matches reality
- use a dedicated `Debug` workspace as the combined inspection view so `Overview` can stay calmer without removing access to thread and shell surfaces

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-codex-loop-terminal-workspace-presets.md first, then continue Task 7 by reading .claude/plans/loloop/active-codex-loop-ai-terminal-plan-v1.md and choosing the next unchecked item from that dedicated plan. The most likely next move is clearer conflict-state and recovery messaging between daemon, thread, and shell operations, or clearer relay success/error feedback, whichever is the highest-value bounded pass that can still be verified locally. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit so GitHub Pages redeploys when site-facing files changed.
```
