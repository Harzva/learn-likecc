# evolution-2026-04-11-site-likecode-session-stack-panel.md

## Plan

- path: `.claude/plans/loloop/active-likecode-web-ui-plan-v1.md`
- milestone: 在 LikeCode Web UI / agent-management 线里先落一个真正可见的 operator-control 改进，而不是继续停留在参考仓库收集阶段
- bounded target: 借 `hermes-webui` 和 `claudecodeui` 的 session/sidebar 思路，在本地 AI Terminal 上加一个 `Session Stack` 总览 pane，集中展示 relay、workspace、thread 和 shell roster

## Completed

- used `reference/reference_cc_ui/hermes-webui/README.md` as evidence for a dedicated sessions/tools sidebar with session projects, tags, and tool-call cards
- used `reference/reference_cc_ui/claudecodeui/README.md` as evidence for active projects and sessions as a first-class web UI surface
- added a new `Session Stack` panel to `site/topic-codex-loop-console.html` so the operator can see relay, workspace, preset, thread lock, last action, and shell roster in one place
- updated `site/js/codex-loop-console.js` to render the new consolidated overview from existing relay, thread, shell, and layout state without changing the relay protocol
- moved the generic monitor pane out of the `Overview` workspace so the first screen reads more like an operator desk and less like a pile of unrelated panes
- synced the Markdown mirror in `site/md/topic-codex-loop-console.md`
- updated the dedicated LikeCode Web UI plan and the umbrella site plan to mark Task 9 as the current active line

## Failed or Deferred

- no live browser render pass was run in this iteration
- no agent-list or multi-agent management panel was added yet; this pass stayed at the session-stack/operator-overview layer
- no backend relay change was needed in this bounded pass

## Decisions

- treat session visibility as the first concrete LikeCode Web UI borrowing target because it is high-value, low-risk, and already supported by local data
- prefer one explicit `Session Stack` overview over adding yet another raw log or monitor pane
- keep Task 9 active for the next tick; this pass opens the LikeCode Web UI line but does not finish it

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-likecode-session-stack-panel.md first, then continue Task 9 by reading .claude/plans/loloop/active-likecode-web-ui-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the LikeCode Web UI line because it is now the active loop task. The most likely next move is one more bounded operator-control pass such as clearer thread/session roster actions, a lightweight agent-management summary, or stronger mobile treatment for the new session-stack panel, whichever is highest-value and easiest to verify locally. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check deployment state because this pass changes site-facing files.
```
