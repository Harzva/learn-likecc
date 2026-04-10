# evolution-2026-04-11-site-vibepaper-role-mermaid.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 持续推进 VibePaper recurring task
- bounded target: 把“主样本 vs 候选底座”的层级说明从文字和表格提升为一个可复用 Mermaid 结构图

## Completed

- added a new `vibepaper-roles` Mermaid diagram key to `site/js/app.js`
- embedded a new role-clarity Mermaid figure into the VibePaper HTML page beside the role table
- mirrored the same structure graph into the Markdown source so the page and source stay aligned
- updated the active loop plan to record this micro-visual pass

## Failed or Deferred

- no browser render pass was run in this iteration
- no new candidate repo was cloned in this iteration
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- the next VibePaper visual passes should only add diagrams that reduce hierarchy ambiguity; the page already has enough comparison content and should not become diagram-heavy without a new teaching need
- `AIDE ML` should remain explicitly downstream of the candidate lane until it proves a distinct shell shape instead of only serving as AI Scientist-style substrate

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-vibepaper-role-mermaid.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The most likely next move is either one small VibePaper cleanup pass if the new role diagram reveals another local clarity gap, or another controlled intake only if the next system adds a clearly new shell shape and has equally strong primary sources. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
