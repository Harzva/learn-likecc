# evolution-2026-04-12-index-old-inline-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: return to one bounded non-media site-polish slice after the current ready daytime Zhihu publish wave is complete
- bounded target: remove the remaining inline hero-particle seed styling from `site/index-old.html`

## Completed

- treated the current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` as locally complete instead of forcing another weaker media move
- scanned `site/*.html` for remaining inline `style=` attributes and found only the legacy `site/index-old.html` page still carried inline hero-particle seed styling
- replaced the five inline hero-particle seed styles on `site/index-old.html` with scoped classes: `index-old-hero-particle--1` through `index-old-hero-particle--5`
- added the matching scoped particle-position classes to `site/css/style.css`
- verified that `rg -n 'style=' site/index-old.html` now returns no matches
- verified the site content mapping remains healthy with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen a new media subthread because the previously prepared ready daytime queue had already been exhausted
- did not widen this pass into a broader legacy-homepage redesign because the goal was to keep the iteration bounded to one cleanup slice

## Decisions

- keep the loop on small, locally verifiable site-polish slices now that the current ready publication wave has been cleared
- treat remaining inline-style cleanup on legacy or low-traffic pages as acceptable bounded work when it is the clearest low-risk next move

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-index-old-inline-cleanup.md first. The current ready daytime Zhihu publish wave for `24-*`, `36-*`, `37-*`, `38-*`, and `39-*` is already complete, so choose exactly one new bounded best-next move from the remaining task pool instead of forcing another publish. Prefer a high-value, low-risk, locally verifiable non-media slice; another site-shell/accessibility/detail-polish pass or a similarly bounded recurring-task move is a good default. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
