# evolution-2026-04-12-cc-unpacked-inline-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one more low-risk site-polish pass to remove the remaining inline layout styling on `topic-cc-unpacked-zh`

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- stayed on the low-risk site-polish line because `site/topic-cc-unpacked-zh.html` still had nine inline layout styles around the hero stats, loop notes, architecture note, action row, knowledge-map note, and overview footnote
- replaced those inline styles with scoped `cc-unpacked-*` classes in `site/css/style.css`
- updated the hero stats row, hero subtitle note, loop explanation notes, architecture note, source-map action row, knowledge-map note, and commands footnote in `site/topic-cc-unpacked-zh.html` to use the new classes
- verified that `site/topic-cc-unpacked-zh.html` no longer contains any `style=` attributes
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen any queued Zhihu draft or publish work because the current pass remained outside the daytime publish window
- did not change the `topic-cc-unpacked-zh` teaching content because this iteration only removed inline layout debt
- did not run a separate browser preview pass because this was a bounded HTML/CSS cleanup and the repo already auto-deploys `site/**` pushes to GitHub Pages

## Decisions

- treat this as another valid overnight default move because it is easy to verify locally and removes page-maintenance debt without starting a new content branch
- keep preferring low-risk site polish while the publish window is closed, unless a clearly stronger recurring-task slice appears
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-cc-unpacked-inline-cleanup.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another low-risk site-polish candidate with a clear local verification path is still a good default if no stronger recurring-task move emerges. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes site/**.
```
