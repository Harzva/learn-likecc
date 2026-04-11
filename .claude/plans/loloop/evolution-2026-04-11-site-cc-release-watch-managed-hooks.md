# evolution-2026-04-11-site-cc-release-watch-managed-hooks.md

## Plan

- path: `.claude/plans/loloop/active-claude-changelog-watch-plan-v1.md`
- milestone: Claude Code release-watch 继续补 `2.1.101` 的治理 / 控制面关键词
- bounded target: 把 managed hooks / settings fault-tolerance 变成一条站内可教学的 release-watch note

## Completed

- updated `site/topic-cc-release-watch.html` with one new `2.1.101` managed-hooks section about settings fault-tolerance and `allowManagedHooksOnly`
- updated `site/md/topic-cc-release-watch.md` with the same managed-hooks note and visual prompt block
- updated the dedicated Claude changelog watch plan and the umbrella site plan so Task 4 stays active for one more bounded keyword slice

## Failed or Deferred

- no browser render pass was run in this iteration
- no Mermaid or bitmap visual was added in this pass; it stayed bounded to a text-level keyword note
- no Zhihu task was attempted in this iteration

## Decisions

- choose the managed-hooks slice because it extends the existing control-surface / governance line more usefully than another narrow bugfix
- keep the destination on the existing release-watch page because this is still a changelog-derived keyword, not a standalone topic
- keep Task 4 active because `2.1.101` still has adjacent official deltas that can be turned into one more bounded teaching slice

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-managed-hooks.md first, then continue Task 4 by reading .claude/plans/loloop/active-claude-changelog-watch-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the Claude changelog watch line because it remains the active loop task. The most likely next move is one more bounded `2.1.101` keyword slice with clear teaching value, such as another governance / control-surface note that still fits `site/topic-cc-release-watch.html`. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check GitHub Pages because this pass changes site-facing files.
```
