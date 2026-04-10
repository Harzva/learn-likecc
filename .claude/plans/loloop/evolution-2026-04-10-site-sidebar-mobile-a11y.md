# evolution-2026-04-10-site-sidebar-mobile-a11y.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Superset 解构页细节打磨
- bounded target: 补齐移动端站点侧栏的可达性状态与关闭行为，让 site shell 与页内目录一致

## Completed

- read `.claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md` first, then re-anchored on the active plan and latest shell-focused evolution note
- chose the mobile `site-sidebar` shell as the next high-value candidate because it still lacked explicit expanded state, keyboard dismissal, and visible focus treatment
- updated `site/js/app.js` so the site sidebar now syncs `aria-expanded` / `aria-hidden` across the collapse button, FAB, panel, and backdrop
- added `Escape`-to-close behavior on mobile and return-focus to the sidebar FAB after dismissal
- added `:focus-visible` styling for sidebar controls, links, and section summaries in `site/css/style.css`
- verified the sidebar update with `node --check site/js/app.js`

## Failed or Deferred

- no browser render pass was run in this iteration
- queued Zhihu media tasks remain deferred until this site-shell commit is pushed cleanly

## Decisions

- keep the shell polish symmetrical: once mobile page-subnav was fixed, the mobile site-sidebar needed the same interaction contract
- keep the pass limited to accessibility state and dismissal instead of revisiting sidebar information architecture

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-sidebar-mobile-a11y.md first, then treat the current site shell as stable enough to branch into the queued Zhihu media work: run the Zhihu prerequisite checks and attempt the safest viable publish path for the Superset article, then continue topic selection and draft generation for follow-on Zhihu pieces.
```
