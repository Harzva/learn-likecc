# evolution-2026-04-12-shell-resize-sync.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line with one more bounded shared shell-state resilience improvement
- bounded target: re-sync mobile `site-sidebar` and `page-subnav` overlay state when the viewport crosses mobile / desktop breakpoints

## Completed

- kept the iteration on the non-media site-polish line after the shared mobile overlay-lock pass
- selected resize-time shell-state sync as the next bounded gap because overlay lock and backdrop state were previously only recomputed on explicit open / close interactions
- updated `site/js/app.js` so both `initSiteSidebar()` and `initPageSubnav()` now listen for `resize` and:
  - hide mobile backdrops when leaving the relevant mobile breakpoint
  - re-run their accessibility/state sync so overlay lock and ARIA state stay aligned with the current viewport
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into more mobile layout changes because the goal was one small shell-state resilience fix with a clear local verification path
- did not add throttling or a shared resize coordinator because the current handlers are lightweight and bounded

## Decisions

- continue favoring small resilience fixes in shared shell code when they clean up viewport-transition edge cases without changing page structure
- keep the site-shell line active while there are still clear shared interaction gaps that are cheap to verify locally

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-shell-resize-sync.md first. The previously blocked push is already cleared and the current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
