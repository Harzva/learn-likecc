# evolution-2026-04-11-site-cc-release-watch-tracing-optin.md

## Plan

- path: `.claude/plans/loloop/active-claude-changelog-watch-plan-v1.md`
- milestone: Claude Code release-watch 继续补 `2.1.101` 的高教学价值关键词
- bounded target: 把 beta tracing opt-in / sensitive span gating 变成一条站内可教学的 release-watch note

## Completed

- updated `site/topic-cc-release-watch.html` with one new `2.1.101` tracing-opt-in section about `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, and `OTEL_LOG_TOOL_CONTENT`
- updated `site/md/topic-cc-release-watch.md` with the same tracing-opt-in note and visual prompt block
- updated the dedicated Claude changelog watch plan and the umbrella site plan so Task 4 stays active for one more bounded keyword slice

## Failed or Deferred

- no browser render pass was run in this iteration
- no Mermaid or bitmap visual was added in this pass; it stayed bounded to a text-level keyword note
- no Zhihu task was attempted in this iteration

## Decisions

- choose the tracing opt-in slice because it extends the existing observability / control-plane line more usefully than another generic bugfix note
- keep the destination on the existing release-watch page instead of creating a fresh topic, because the theme is a changelog keyword rather than a standalone hub
- keep Task 4 active because `2.1.101` still contains adjacent official deltas that can be turned into one more bounded teaching slice

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-tracing-optin.md first, then continue Task 4 by reading .claude/plans/loloop/active-claude-changelog-watch-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the Claude changelog watch line because it is now the active loop task. The most likely next move is one more bounded `2.1.101` keyword slice with clear teaching value, such as managed plugin hooks / settings resilience or another official control-surface note that still fits `site/topic-cc-release-watch.html`. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check GitHub Pages because this pass changes site-facing files.
```
