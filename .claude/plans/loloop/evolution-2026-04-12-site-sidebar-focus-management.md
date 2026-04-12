# evolution-2026-04-12-site-sidebar-focus-management.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line with one more bounded mobile site-shell accessibility improvement
- bounded target: improve mobile `site-sidebar` focus management so opening the panel moves focus inside and closing returns focus to the trigger

## Completed

- kept the iteration on the non-media site-polish line instead of reopening a new media subthread
- reviewed the shared site-shell script and selected mobile `site-sidebar` focus handling as the next bounded accessibility target
- updated `site/js/app.js` so mobile `site-sidebar` open/close behavior now:
  - tracks the last sidebar trigger
  - moves focus into the first reachable sidebar control when the mobile panel opens
  - returns focus to the trigger when the panel closes via toggle, backdrop, or `Escape`
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into `page-subnav` focus handling because the goal was to keep the iteration bounded to one mobile site-shell panel
- did not change sidebar structure or styling because the missing piece was interaction accessibility, not layout

## Decisions

- prefer focused site-shell accessibility passes that improve one shared control surface at a time when they have a clear local verification path
- keep the next pass free to choose either another bounded site-shell polish slice or a stronger remaining recurring-task move from the pool

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-site-sidebar-focus-management.md first. The current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
