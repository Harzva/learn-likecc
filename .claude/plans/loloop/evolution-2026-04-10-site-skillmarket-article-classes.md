# evolution-2026-04-10-site-skillmarket-article-classes.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 站点细节持续打磨
- bounded target: 清理 `topic-skillmarket.html` 的内联文章布局样式，并把文中卡片区和表格间距收进页面级类名

## Completed

- added `skillmarket-page` scoped classes in `site/topic-skillmarket.html` for the compact quickstart grids, table-wrap spacing, and one inline paragraph spacing hook
- replaced the remaining inline `style=` layout declarations in the article body with page-scoped hooks
- added page-scoped spacing and mobile gap rules in `site/css/style.css`
- verified the page no longer contains inline `style=` attributes with `rg -n 'style="' site/topic-skillmarket.html`

## Failed or Deferred

- no browser render pass was run in this iteration
- no copy changes were made; this pass stayed article-layout scoped

## Decisions

- article pages with a small set of repeated inline spacing rules are good bounded cleanup targets after the larger hub pages
- keep using page-scoped classes instead of broad prose-layout changes until more article pages are normalized

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-skillmarket-article-classes.md first, then choose exactly one best-next task from the pool by prioritizing main site work, complete one bounded polish pass, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys.
```
