# evolution-2026-04-11-site-agent-comparison-runtime-shells.md

## Plan

- path: `.claude/plans/loloop/active-reference-mining-topics-plan-v1.md`
- milestone: 给 Task 8 找到第二个明确站点落点，并把多代理 runtime 参考从抽象概念页推进成 repo-backed 对照
- bounded target: 用 `feynman`、`ChatDev 2.0`、`Multica` 为 `topic-agent-comparison` 补一节“Repo-backed 补充：三种团队运行时壳”

## Completed

- updated `site/topic-agent-comparison.html` with one repo-backed runtime-shell section under the Subagents / Agent Teams chapter
- updated `site/md/topic-agent-comparison.md` with the matching summary so the reference-mining output is mirrored into Markdown
- updated the dedicated Task 8 plan so the second explicit destination is now recorded as `topic-agent-comparison`

## Failed or Deferred

- no browser render pass was run in this iteration
- no new major topic was opened; this pass stayed bounded to strengthening an existing Agent comparison page
- no Zhihu task was attempted in this iteration

## Decisions

- choose `topic-agent-comparison` as the next destination because it already hosts the “Subagents vs Agent Teams” frame, so the new repo evidence lands as a clarification rather than a tangent
- use `feynman` as the research-agent CLI shell, `ChatDev 2.0` as the workflow-orchestration shell, and `Multica` as the managed-agent platform shell so the runtime spectrum has three clearly different shapes
- keep Task 8 active because the reference-mining line now has a second concrete site destination and can either deepen this runtime line or move to another explicit pattern next

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-agent-comparison-runtime-shells.md first, then continue Task 8 by reading .claude/plans/loloop/active-reference-mining-topics-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the reference-mining line because it remains the active loop task. The most likely next move is one more bounded reference-backed pass such as deciding whether the current `topic-agent-comparison` subthread needs one adjacent repo-backed clarification, or selecting the next explicit destination from the remaining UI / CLI / multi-agent patterns without opening a new major topic too early. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check GitHub Pages because this pass changes site-facing files.
```
