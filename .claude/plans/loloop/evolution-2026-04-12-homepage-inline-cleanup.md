# evolution-2026-04-12-homepage-inline-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one more low-risk site-polish pass to remove the remaining inline styling on `index.html`

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- picked the homepage as the stronger next site-facing slice because it is a higher-value page than another side page while still staying bounded to inline-style extraction only
- replaced the remaining inline homepage styling in `site/index.html` with scoped classes in `site/css/style.css`
- moved the four hero particle position/delay hooks into dedicated particle classes instead of inline CSS variables
- moved the LikeCode model-routing preview figure and image styling into dedicated homepage classes
- moved the OpenHarness inline link and feature-arrow anchor styling into reusable scoped classes
- verified that `site/index.html` no longer contains any `style=` attributes
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen any queued Zhihu draft or publish work because the current pass remained outside the daytime publish window
- did not rewrite homepage copy or section structure because this iteration only removed inline styling debt
- did not run a separate browser preview pass because this was a bounded HTML/CSS cleanup and the repo already auto-deploys `site/**` pushes to GitHub Pages

## Decisions

- treat this as a better-than-default overnight move because it improves the homepage directly while still keeping the pass narrow and easy to verify
- keep preferring low-risk site polish while the publish window is closed, unless a clearly stronger recurring-task slice appears
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-homepage-inline-cleanup.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another high-value but still locally verifiable site-polish candidate is now preferable to reopening deferred media work. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes site/**.
```
