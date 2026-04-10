# evolution-2026-04-10-site-subnav-mobile-a11y.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Superset 解构页细节打磨
- bounded target: 补齐移动端页内目录的可达性状态与关闭行为，让 site shell 更专业

## Completed

- read `.claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md` first, then re-anchored on the latest site-polish notes before choosing the next pass
- chose the mobile `page-subnav` shell as the next high-value candidate because it lacked explicit expanded state, keyboard dismissal, and visible focus treatment
- updated `site/js/app.js` so the page subnav now syncs `aria-expanded` / `aria-hidden` across the toggle button, FAB, panel, and backdrop
- added `Escape`-to-close behavior on mobile and return-focus to the FAB after dismissal
- added `:focus-visible` styling for the page subnav toggle, FAB, and links in `site/css/style.css`
- verified the site-shell script with `node --check site/js/app.js`
- confirmed the repo's GitHub Pages workflow deploys on pushes to `main` that touch `site/**`, so this iteration can be published by pushing the relevant site commit

## Failed or Deferred

- no browser render pass was run in this iteration
- there are unrelated dirty files in the worktree, so the Git update must stay scoped to the site-loop files only

## Decisions

- prioritize shell interaction quality once the page-level Superset widgets had become visually coherent
- keep the accessibility pass narrowly focused on mobile subnav state and dismissal instead of widening into a broader sidebar refactor

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-subnav-mobile-a11y.md first, then inspect one more high-value site-shell or page-layout detail by prioritizing visual maturity, professional clarity, or layout rationality, complete one bounded polish pass, update the evolution note trail, prepare the next handoff, and publish the relevant site commit to GitHub so GitHub Pages redeploys.
```
