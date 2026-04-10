# evolution-2026-04-10-site-agent-hot-classes.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 站点细节持续打磨
- bounded target: 清理 `topic-agent-hot.html` 的内联布局样式，并把热点页的表格包装、单列卡片布局和列表间距收进页面级类名

## Completed

- added `agent-hot-page` scoped classes in `site/topic-agent-hot.html` for the soft-background intro section, leading copy spacing, table overflow wrapper, single-column quickstart grid, ordered-list spacing, and trailing note spacing
- replaced the remaining inline `style=` layout declarations with page-scoped hooks
- added page-scoped wrapper, list, and mobile gap rules in `site/css/style.css`
- verified the page no longer contains inline `style=` attributes with `rg -n 'style="' site/topic-agent-hot.html`

## Failed or Deferred

- no browser render pass was run in this iteration
- no content refresh was made; this pass stayed layout scoped

## Decisions

- sister hot pages benefit from being normalized with the same scoped-wrapper pattern once one of them is cleaned up
- keep deferring Zhihu publication work while local time remains outside the allowed 08:00 to 23:00 window

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-agent-hot-classes.md first, then choose exactly one best-next task from the pool by prioritizing main site work, complete one bounded polish pass, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If the next chosen task reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
