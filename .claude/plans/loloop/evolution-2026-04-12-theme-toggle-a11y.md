# evolution-2026-04-12-theme-toggle-a11y.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line after the ready daytime Zhihu publish wave was completed
- bounded target: improve the global `theme-toggle` control so its accessible label tracks the current and next theme state

## Completed

- kept the iteration on the non-media site-polish line instead of reopening a new media subthread after the ready daytime publication queue was exhausted
- reviewed the site shell script and selected the global `theme-toggle` as the next bounded accessibility target because it still only exposed visible text without a synchronized semantic label
- updated `site/js/app.js` so `updateThemeIcon()` now:
  - rebuilds the button label with DOM nodes instead of `innerHTML`
  - writes an `aria-label` describing the current theme and the next theme in the cycle
  - syncs the button `title` with the same current/next theme description
  - records the current theme on `data-theme`
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into a broader theme-system redesign because the current goal was one small accessibility improvement with a clear local verification path
- did not edit every HTML button instance directly because the shared JS update already covers the global `theme-toggle` behavior across the site shell

## Decisions

- prefer shared site-shell accessibility fixes in `site/js/app.js` when one bounded script change improves many pages at once
- keep future post-publish passes focused on similarly small, high-confidence site-shell or page-detail improvements unless a stronger recurring-task move clearly outranks them

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-theme-toggle-a11y.md first. The current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
