# evolution-2026-04-11-site-vibepaper-shell-mermaid.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 持续推进 VibePaper recurring task
- bounded target: 把刚做好的 shell-summary table 变成一个真实 Mermaid 图，让 protocol shell / studio shell / paper pipeline shell 的对照不只停留在文字表格

## Completed

- added a new `vibepaper-shells` Mermaid definition in `site/js/app.js`
- embedded that diagram into the VibePaper control-plane-thickness section
- mirrored the diagram source into the Markdown page so the page and source draft stay aligned
- kept the pass scoped to one page plus one shared diagram registry change

## Failed or Deferred

- no browser render pass was run in this iteration
- no new candidate repo was cloned in this iteration
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- the best next move was a concrete diagram, because the shell comparison had already reached a stable teaching abstraction and now benefited more from a visual than from another paragraph
- adding the Mermaid to the shared registry was preferable to a one-off inline graphic because the repo already has an established pattern for reusable rendered diagrams

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-vibepaper-shell-mermaid.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The most likely next move is either a controlled intake of one more VibePaper candidate with equally strong primary sources, or a small cleanup pass on the VibePaper page if the new shell comparison reveals another local clarity gap. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
