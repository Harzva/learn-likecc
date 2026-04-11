# evolution-2026-04-12-topic-websites-inline-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one more low-risk site-polish pass to remove the remaining inline layout styling on `topic-websites.html`

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- chose the websites topic page as the next bounded slice because its remaining inline styles were all repeated grid and spacing hooks rather than content logic
- replaced the remaining inline layout styling in `site/topic-websites.html` with scoped topic-websites classes in `site/css/style.css`
- extracted the repeated 220/240 quickstart grid widths, block-top spacing, table-wrap spacing, note spacing, and subsection spacing into reusable classes
- verified that `site/topic-websites.html` no longer contains any `style=` attributes
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen any queued Zhihu draft or publish work because the current pass remained outside the daytime publish window
- did not rewrite topic-websites copy or structure because this iteration only removed inline layout debt
- did not run a separate browser preview pass because this was a bounded HTML/CSS cleanup and the repo already auto-deploys `site/**` pushes to GitHub Pages

## Decisions

- treat this as another high-value but still low-risk overnight move because it cleans a site-facing topic page without starting a new content branch
- keep preferring low-risk site polish while the publish window is closed, unless a clearly stronger recurring-task slice appears
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-topic-websites-inline-cleanup.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another high-value but still locally verifiable site-polish candidate is preferable to reopening deferred media work. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes site/**.
```
