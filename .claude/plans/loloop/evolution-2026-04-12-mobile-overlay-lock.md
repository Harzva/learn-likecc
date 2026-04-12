# evolution-2026-04-12-mobile-overlay-lock.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line with one more bounded shared mobile shell-behavior improvement
- bounded target: prevent background page scrolling while mobile `site-sidebar` or `page-subnav` overlays are open

## Completed

- kept the iteration on the non-media site-polish line after the recent shared trigger-label update
- selected shared mobile overlay scroll locking as the next bounded shell-behavior gap because both `site-sidebar` and `page-subnav` can sit above a still-scrollable document on narrow viewports
- added `syncSiteShellOverlayLock()` in `site/js/app.js` and called it from both shell panels' accessibility sync paths so body scroll lock tracks whether either mobile overlay is open
- added `body.site-shell-overlay-open { overflow: hidden; }` to `site/css/style.css`
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into broader mobile layout changes because the goal was to keep the iteration bounded to one shared shell-behavior fix
- did not add viewport-specific JS listeners beyond the existing sync paths because the open-state hooks already provide a stable place to manage the scroll lock

## Decisions

- continue preferring small shared shell fixes when one bounded JS/CSS change improves multiple pages at once
- treat the site-shell accessibility / interaction line as still active while similarly clear, low-risk shared gaps remain

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-mobile-overlay-lock.md first. The previously blocked push is already cleared and the current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
