# evolution-2026-04-12-sidebar-link-close.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line with one more bounded mobile navigation-flow improvement
- bounded target: close the mobile `site-sidebar` when a sidebar link is activated

## Completed

- kept the iteration on the non-media site-polish line after the breakpoint-transition cleanup pass
- selected mobile sidebar link-close behavior as the next bounded gap because the overlay could still remain covering the page after a same-page anchor jump, cross-page navigation start, or external open
- updated `site/js/app.js` so mobile `site-sidebar` now closes when any `a.site-sidebar__link` is activated
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into more shell controls because the goal was one small mobile navigation-flow cleanup
- did not special-case only hash links or only external links because the general mobile close-on-activation behavior is simpler and safer for the overlay

## Decisions

- keep preferring shared mobile interaction fixes in `site/js/app.js` when they improve real navigation flow without touching page structure
- treat overlay dismissal behavior as part of the same site-shell quality line as focus flow, trigger labels, scroll lock, and breakpoint cleanup

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-sidebar-link-close.md first. The previously blocked push is already cleared and the current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
