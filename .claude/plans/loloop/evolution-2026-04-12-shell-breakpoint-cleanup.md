# evolution-2026-04-12-shell-breakpoint-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line with one more bounded shell breakpoint-transition resilience improvement
- bounded target: clear stale mobile overlay open state when `site-sidebar` or `page-subnav` crosses back to desktop

## Completed

- kept the iteration on the non-media site-polish line after the shared resize-sync pass
- selected stale mobile open-state cleanup as the next bounded gap because the previous resize sync hid backdrops and recomputed ARIA state, but still allowed old `--open` classes to survive into later narrow viewports
- updated `site/js/app.js` so:
  - `site-sidebar` removes `site-sidebar--open` and clears `mobileOpenStorageKey` when leaving the mobile breakpoint
  - `page-subnav` removes `page-subnav--open` when leaving the mobile breakpoint
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into more shell controls because the goal was one small breakpoint-transition cleanup
- did not add a broader viewport-state manager because the current fix is still cheap and localized

## Decisions

- keep addressing shell-resilience gaps in small slices while the fixes remain shared, low-risk, and easy to verify locally
- treat “no stale mobile state after breakpoint changes” as part of the same quality bar as focus flow, label sync, and overlay lock

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-shell-breakpoint-cleanup.md first. The previously blocked push is already cleared and the current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
