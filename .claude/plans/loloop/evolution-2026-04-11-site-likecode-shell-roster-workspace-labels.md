# evolution-2026-04-11-site-likecode-shell-roster-workspace-labels.md

## Plan

- path: `.claude/plans/loloop/active-likecode-web-ui-plan-v1.md`
- milestone: 在 `Session Stack` 的 headline / summary / queue / identity / ledger 结构已经成形之后，再补一个更贴近多 shell 管理的小识别层
- bounded target: 给 `Shell Roster` 每张卡片增加一个由 `cwd` 派生的 workspace label，让多 session 扫读不必依赖完整路径

## Completed

- updated `site/js/codex-loop-console.js` so shell roster cards now derive a short workspace label from `cwd`
- updated the shell roster markup so each card exposes that workspace label both beside the session id and inside the control badge row
- updated `site/css/style.css` so the shell-card title area supports the new short workspace meta and still wraps cleanly on narrow screens
- synced the Markdown mirror in `site/md/topic-codex-loop-console.md`
- updated the dedicated LikeCode Web UI plan and the umbrella site plan so Task 9 stays active after this shell-roster identity pass

## Failed or Deferred

- no live browser render pass was run in this iteration
- no new backend fields or provider-specific metadata were introduced; the label stays a frontend derivation from existing `cwd`
- no standalone LikeCode topic page landed yet; this pass remains inside the current codex-loop console page

## Decisions

- keep borrowing the same session-visibility direction from `reference/reference_cc_ui/hermes-webui/README.md` and `reference/reference_cc_ui/claudecodeui/README.md`: both prioritize making many sessions distinguishable at a glance, so the next useful local step was to make shell cards legible before reading full path text
- use the `cwd` basename as the label source instead of inventing a new session name field, because it is cheap, already available, and locally verifiable
- keep Task 9 active for the next tick; the LikeCode shell roster is more glanceable now, but one more bounded multi-session / agent-management refinement is still available

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-likecode-shell-roster-workspace-labels.md first, then continue Task 9 by reading .claude/plans/loloop/active-likecode-web-ui-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the LikeCode Web UI line because it remains the active loop task. The most likely next move is one more bounded agent-management pass such as a compact runtime-identity layer for the shell roster header, a lightweight non-shell session summary above the current desks, or another reference-backed control improvement that keeps the current UI frontend-only and locally verifiable. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check deployment state because this pass changes site-facing files.
```
