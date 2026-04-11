# evolution-2026-04-11-site-likecode-session-stack-headnote-standby.md

## Plan

- path: `.claude/plans/loloop/active-likecode-web-ui-plan-v1.md`
- milestone: 在 `Session Stack` 标题区已经能显示 hottest lane 之后，再补一个最小的 standby-pressure cue，让顶层就能看出 shell live seat 后面还有没有 parked 压力
- bounded target: 扩展 headnote 逻辑，在 live shell 或 standby-only shell 情况下同时露出 standby 数量，而不把信息重新塞回 body

## Completed

- updated `site/js/codex-loop-console.js` so the `Session Stack` headnote now appends `+N standby` when a live shell seat exists and falls back to `Shell Lab · standby N @ workspace` when only parked shells remain
- synced the Markdown mirror in `site/md/topic-codex-loop-console.md`
- updated the dedicated LikeCode Web UI plan and the umbrella site plan so Task 9 stays active after this headnote follow-up

## Failed or Deferred

- no live browser render pass was run in this iteration
- no new backend fields, interaction paths, or CSS structure were needed; this was a pure state-logic follow-up on the existing headnote
- no standalone LikeCode topic page landed yet; the work remains inside the current codex-loop console page

## Decisions

- keep following the same session-visibility direction from `reference/reference_cc_ui/hermes-webui/README.md` and `reference/reference_cc_ui/claudecodeui/README.md`: once the hottest lane is visible in the header, the next useful signal is whether additional shell sessions are parked behind it
- expose standby pressure in the existing headnote instead of adding another separate badge or row, because the title area already had the right affordance for one-line operator context
- keep Task 9 active for the next tick; the title layer is now richer, but one more bounded agent-management refinement is still available if the line is worth continuing

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-likecode-session-stack-headnote-standby.md first, then continue Task 9 by reading .claude/plans/loloop/active-likecode-web-ui-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the LikeCode Web UI line because it remains the active loop task. The most likely next move is one more bounded agent-management pass such as a lightweight non-shell session summary above the current desks, a final compact control cue inside the session-stack header/body boundary, or a written defer/done decision if the current LikeCode micro-wave is now saturated. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check deployment state because this pass changes site-facing files.
```
