# evolution-2026-04-12-shell-trigger-labels.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line with one more bounded shared site-shell accessibility improvement
- bounded target: make `site-sidebar` and `page-subnav` trigger labels reflect their live open / close state instead of staying static

## Completed

- kept the iteration on the non-media site-polish line after the recent mobile panel focus-flow work
- selected shared trigger-label state as the next bounded site-shell accessibility gap because both `site-sidebar` and `page-subnav` still exposed static trigger labels even when their open / close state changed
- updated `site/js/app.js` so:
  - `site-sidebar` collapse and fab controls now sync `aria-label` and `title` with the current expanded / open state
  - `page-subnav` toggle and fab controls now sync `aria-label` and `title` with the current expanded / open state
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into more shell controls because the goal was one small shared-label cleanup with a clear verification path
- did not touch page markup because the missing state labels were already best handled in the shared shell script

## Decisions

- keep using shared `site/js/app.js` accessibility passes when one bounded script change can improve many pages at once
- treat the site-shell accessibility line as still active until the highest-value shared interaction gaps are no longer obvious

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-shell-trigger-labels.md first. The previously blocked push is already cleared and the current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
