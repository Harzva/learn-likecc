# evolution-2026-04-11-site-likecode-session-stack-actions.md

## Plan

- path: `.claude/plans/loloop/active-likecode-web-ui-plan-v1.md`
- milestone: 把刚落下来的 `Session Stack` 从被动总览推进成一个能直接切换工位、创建 shell、聚焦 session 的小型 operator surface
- bounded target: 不改 relay 协议，只在现有本地状态上加 `Thread Desk` / `Shell Lab` / `New Shell` 快捷动作和 per-session `Focus`

## Completed

- added `Thread Desk` / `Shell Lab` / `New Shell` shortcuts to the `Session Stack` panel in `site/topic-codex-loop-console.html`
- updated `site/js/codex-loop-console.js` so each shell roster item now exposes a `Focus` action that switches the active shell session and moves the workspace to the shell view
- kept the implementation frontend-only by reusing existing preset restore, shell creation, and shell-state rendering paths
- synced the Markdown mirror in `site/md/topic-codex-loop-console.md`
- updated the dedicated LikeCode Web UI plan and the umbrella site plan so Task 9 remains the current active loop line

## Failed or Deferred

- no live browser render pass was run in this iteration
- no broader agent list or multi-agent management panel was added yet; this pass only made the session roster actionable
- no relay/backend change was needed in this bounded pass

## Decisions

- keep the second Task 9 pass attached to the same `Session Stack` surface instead of opening a different panel, because the shortest path to operator value was making the new roster actionable
- prefer shortcut actions that reuse existing UI/preset flows over inventing another parallel control path
- keep Task 9 active for the next tick; the LikeCode Web UI line now has a concrete session-control base but not yet a fuller agent-management surface

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-likecode-session-stack-actions.md first, then continue Task 9 by reading .claude/plans/loloop/active-likecode-web-ui-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the LikeCode Web UI line because it remains the active loop task. The most likely next move is one more bounded operator-control pass such as a lightweight agent-management summary, clearer thread lock/action shortcuts inside the new session stack, or stronger mobile treatment for the added action row and focus controls, whichever is highest-value and easiest to verify locally. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check deployment state because this pass changes site-facing files.
```
