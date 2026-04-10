# evolution-2026-04-10-site-rag-hot-classes.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 站点细节持续打磨
- bounded target: 清理 `topic-rag-hot.html` 的内联布局样式，并把热点页的表格包装与单列卡片布局收进页面级类名

## Completed

- added `rag-hot-page` scoped classes in `site/topic-rag-hot.html` for the soft-background intro section, leading copy spacing, table overflow wrapper, and single-column quickstart grid
- replaced the remaining inline `style=` layout declarations with page-scoped hooks
- added page-scoped wrapper and mobile gap rules in `site/css/style.css`
- verified the page no longer contains inline `style=` attributes with `rg -n 'style="' site/topic-rag-hot.html`

## Failed or Deferred

- no browser render pass was run in this iteration
- no content refresh was made; this pass stayed layout scoped

## Decisions

- hot pages with only a few inline wrapper rules are good low-risk cleanup targets late in the loop
- keep deferring Zhihu publication work once local time is outside the allowed 08:00 to 23:00 window

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-rag-hot-classes.md first, then choose exactly one best-next task from the pool by prioritizing main site work, complete one bounded polish pass, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If the next chosen task reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
