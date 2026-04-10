# evolution-2026-04-11-site-hermes-stack-synthesis.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Hermes Agent 庖丁解牛子专题成形
- bounded target: 在 Hermes draft 上补最后一段对照分析，把 Hermes 的控制面拆法和我们自己的 Claude Code / Like Code / codex-loop 栈放到同一张结构表里

## Completed

- added a new final `08 · 放回我们自己的栈` section to the Hermes unpacked page
- compared Hermes against our Claude Code / Like Code / codex-loop split across control plane, ingress, recurring orchestration, memory/skills, and execution surface
- mirrored the same synthesis into `site/md/topic-hermes-unpacked.md`
- verified the draft now contains the new compare-stack anchor terms and nav hook

## Failed or Deferred

- no browser render pass was run in this iteration
- no Mermaid or PNG visual was added yet; the page is now structurally ready for a future visual pass
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- finish the Hermes page with a synthesis pass before drawing diagrams, because the most valuable takeaway for our repo is the control-plane comparison, not just another isolated subsystem note
- Hermes is now strong enough to pause as a draft-complete unpacked topic; the next best move can either be one visual pass on Hermes or a shift to another main-site recurring task

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-hermes-stack-synthesis.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The most likely next move is either one Hermes visual pass that turns an existing [插图提示词] block into a concrete Mermaid artifact, or a controlled shift to another recurring site task such as Task 4 or Task 6 if Hermes is stable enough. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
