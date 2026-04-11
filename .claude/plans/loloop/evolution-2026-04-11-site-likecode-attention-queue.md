# evolution-2026-04-11-site-likecode-attention-queue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-web-ui-plan-v1.md`
- milestone: 在 `Session Stack` 已经具备 headline、summary、pulse、ledger 和 roster 之后，再补一层真正面向 operator 下一步决策的 action-oriented 入口
- bounded target: 为 relay / thread / shell 增加一个前端派生的 `Attention Queue`，把“下一步该处理什么”压成一排小卡片，不新增协议和 backend 控制路径

## Completed

- updated `site/topic-codex-loop-console.html` so `Session Stack` now includes an `Attention Queue` section between the cross-session snapshot and the desk-assignment ledger
- updated `site/js/codex-loop-console.js` so relay / thread / shell each derive an action-oriented next-step summary from the existing guard and shell state instead of adding new API fields
- updated `site/css/style.css` with dedicated queue-card layout and narrow-screen fallback so the new action row stays readable during local mobile debugging
- synced the Markdown mirror in `site/md/topic-codex-loop-console.md`
- updated the dedicated LikeCode Web UI plan and the umbrella site plan so Task 9 stays active after this action-oriented summary pass

## Failed or Deferred

- no live browser render pass was run in this iteration
- no new backend route, approval protocol, or interaction path was added; this pass stayed frontend-only and state-derived
- no separate LikeCode article landed yet; the work remains inside the current codex-loop console topic

## Decisions

- borrow the reference direction from `reference/reference_cc_ui/hermes-webui/README.md` and `reference/reference_cc_ui/claudecodeui/README.md`: both emphasize sessions/sidebar scanability and multi-session management, so the next useful local step was to turn raw state into an operator-facing “what needs attention now” layer
- keep the new row action-oriented rather than adding yet another passive status block, because the existing `Session Stack` already had enough summary layers but still did not answer the next-move question directly
- keep Task 9 active for the next tick; the LikeCode surface now has stronger next-step guidance, but one more bounded multi-session / agent-management refinement is still available

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-likecode-attention-queue.md first, then continue Task 9 by reading .claude/plans/loloop/active-likecode-web-ui-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the LikeCode Web UI line because it remains the active loop task. The most likely next move is one more bounded agent-management pass such as a lightweight non-shell session overview above the current desks, a compact session/provider identity layer for the current surfaces, or another reference-backed control improvement that keeps the current UI frontend-only and locally verifiable. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check deployment state because this pass changes site-facing files.
```
