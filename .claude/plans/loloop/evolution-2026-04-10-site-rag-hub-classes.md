# evolution-2026-04-10-site-rag-hub-classes.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 站点细节持续打磨
- bounded target: 清理 `topic-rag.html` 的内联布局样式，并给 RAG 专题入口卡片与参考区补一层更稳定的页面级视觉规范

## Completed

- added `rag-topic-page` scoped classes in `site/topic-rag.html` for the All-in-RAG intro block, the hub entry grid, centered supporting copy, and Awesome CTA row
- replaced repeated inline `style=` layout declarations with page-scoped hooks and `section--soft`
- added page-scoped card, list, note, spacing, and mobile rules in `site/css/style.css`
- verified the page no longer contains inline `style=` attributes with `rg -n 'style="' site/topic-rag.html`

## Failed or Deferred

- no browser render pass was run in this iteration
- no copy changes were made; this pass stayed visual/layout scoped

## Decisions

- keep selecting hub pages with repeated inline spacing and link-reset rules because they produce high-value consistency gains with low risk
- prefer page-scoped classes over broad shared-component edits until the hub pages are normalized

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-rag-hub-classes.md first, then choose one more high-value site detail candidate by prioritizing visual maturity, professional clarity, or layout rationality, complete one bounded polish pass, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys.
```
