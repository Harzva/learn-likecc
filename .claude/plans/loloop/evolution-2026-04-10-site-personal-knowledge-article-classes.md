# evolution-2026-04-10-site-personal-knowledge-article-classes.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 站点细节持续打磨
- bounded target: 清理 `topic-personal-knowledge.html` 的内联文章布局样式，并把文中卡片区、表格间距和源链接样式收进页面级类名

## Completed

- added `personal-knowledge-page` scoped classes in `site/topic-personal-knowledge.html` for the quickstart grids, table-wrap spacing, inline paragraph spacing, and source link reset
- replaced the remaining inline `style=` layout declarations in the article body with page-scoped hooks
- added page-scoped spacing and mobile gap rules in `site/css/style.css`
- verified the page no longer contains inline `style=` attributes with `rg -n 'style="' site/topic-personal-knowledge.html`

## Failed or Deferred

- no browser render pass was run in this iteration
- no copy changes were made; this pass stayed article-layout scoped

## Decisions

- continue normalizing article pages with small clusters of inline spacing rules before switching to broader content tasks
- defer Zhihu publishing work once local time leaves the allowed 08:00 to 23:00 window

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-personal-knowledge-article-classes.md first, then choose exactly one best-next task from the pool by prioritizing main site work, complete one bounded polish pass, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If the next chosen task needs Zhihu publication, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
