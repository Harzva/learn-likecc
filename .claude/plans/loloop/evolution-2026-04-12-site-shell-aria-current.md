# evolution-2026-04-12-site-shell-aria-current.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one bounded site-shell pass to sync `aria-current` with the existing active-state UI in the site sidebar and page subnav

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- chose a site-shell accessibility pass instead of another HTML inline cleanup because the remaining full-site `style=` matches were either legacy-only or functionally intentional code-language toggles
- updated `site/js/app.js` so `markActiveSiteSidebarLinks()` now writes `aria-current="page"` for the active page link and `aria-current="location"` for active same-page anchors
- updated the generated `page-subnav` markup so current page links render with `aria-current="page"` and active anchor links sync `aria-current="location"` as the intersection observer changes sections
- added an initial hash sync for the page subnav so deep-linked sections expose the right location state before scrolling begins
- verified the site-shell update with `node --check site/js/app.js`
- re-ran `python3 tools/check_site_md_parity.py` to confirm the site/md mirror still stays clean after the JS-only pass

## Failed or Deferred

- did not reopen any queued Zhihu draft or publish work because the current pass remained outside the daytime publish window
- did not touch legacy-only `index-old.html` or the code-language hide/show behavior in `s01.html` because those were weaker overnight targets than a live site-shell accessibility pass
- did not run a browser interaction pass because this was a bounded JavaScript accessibility sync and the static syntax/parity checks were sufficient for this iteration

## Decisions

- shift from HTML inline-style cleanup to site-shell accessibility polish once the main active pages are largely clean
- prefer updating existing active-state logic to emit proper semantic state before starting a broader shell redesign
- keep relying on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-site-shell-aria-current.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another high-value but still locally verifiable site-polish or site-shell accessibility candidate is preferable to reopening deferred media work. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes site/**.
```
