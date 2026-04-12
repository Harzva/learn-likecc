# evolution-2026-04-12-page-subnav-focus-management.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: continue the non-media site-polish line with one more bounded mobile site-shell accessibility improvement after the previously blocked push succeeds
- bounded target: improve mobile `page-subnav` focus management so opening the panel moves focus inside and closing returns focus to the trigger

## Completed

- retried the previously blocked `git push` for local commit `5c4e62e` and confirmed it succeeded, so the already-finished `site-sidebar` focus-flow fix is now on GitHub and can trigger Pages redeploy
- kept the iteration on the non-media site-polish line after the push recovery instead of switching tasks
- reviewed the shared site-shell script and selected mobile `page-subnav` focus handling as the next bounded accessibility target so it matches the recently improved `site-sidebar`
- updated `site/js/app.js` so mobile `page-subnav` open/close behavior now:
  - tracks the last subnav trigger
  - moves focus into the first reachable subnav control when the mobile panel opens
  - returns focus to the trigger when the panel closes via toggle, backdrop, `Escape`, or link click
- verified the updated script with `node --check site/js/app.js`
- verified the site source mapping still passes with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not widen this pass into more shell controls because the goal was to keep the iteration bounded to one mobile panel after the push recovery
- did not edit page markup because the missing behavior lived in the shared subnav script

## Decisions

- treat the push recovery and one immediately adjacent site-shell polish slice as acceptable in the same pass because the first action only cleared a prior blocked completion state
- keep following the pattern of small shared accessibility improvements in `site/js/app.js` while they remain high-value and easy to verify locally

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-page-subnav-focus-management.md first. The previously blocked push is now cleared and the current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
