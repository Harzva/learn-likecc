# evolution-2026-04-12-topic-sourcemap-inline-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one more high-value site-polish pass to remove the remaining inline layout styling on `topic-sourcemap.html`

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- chose the Source Map hub page as the next bounded slice because it is a high-traffic main entry page and its remaining inline styles were all static layout hooks
- replaced the remaining inline layout styling in `site/topic-sourcemap.html` with scoped `topic-sourcemap-*` classes in `site/css/style.css`
- extracted the muted section shells, top/bottom spacing, 260px and 200px grids, chapter-card padding, centered description widths, centered action row, and one inline accent link into reusable page-scoped classes
- verified that `site/topic-sourcemap.html` no longer contains any `style=` attributes
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen any queued Zhihu draft or publish work because the current pass remained outside the daytime publish window
- did not rewrite Source Map hub copy or reorder the learning path because this iteration only removed inline layout debt
- did not run a separate browser preview pass because this was a bounded HTML/CSS cleanup and the repo already auto-deploys `site/**` pushes to GitHub Pages

## Decisions

- prefer higher-value hub pages over smaller leaf pages when the cleanup remains low-risk and locally verifiable
- keep treating the overnight window as a bounded site-polish lane until the local time enters the allowed Zhihu publish range
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-topic-sourcemap-inline-cleanup.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another high-value but still locally verifiable site-polish candidate is preferable to reopening deferred media work. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes site/**.
```
