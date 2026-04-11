# evolution-2026-04-12-zahuopu-entry-link-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one more low-risk site-polish pass to remove the repeated inline entry-link spacing on `topic-ai-zahuopu`

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- stayed on the low-risk site-polish line after the `topic-agent-comparison` cleanup because `site/topic-ai-zahuopu.html` still had five repeated `style="margin-top: 1rem;"` entry-link paragraphs
- replaced those repeated inline styles with one shared `.zahuopu-entry-link` class in `site/css/style.css`
- updated all five root-shelf entry links on `site/topic-ai-zahuopu.html` to use the shared class
- verified that `site/topic-ai-zahuopu.html` no longer contains any `style=` attributes
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen any Task 8 taxonomy-writing thread because the recent CLI propagation line is already locally complete
- did not touch the Markdown article body for `topic-ai-zahuopu` because this iteration only cleaned repeated HTML spacing hooks
- did not run a separate browser preview pass because this iteration was a bounded HTML/CSS cleanup and the repo already has automatic GitHub Pages deployment for `site/**` pushes

## Decisions

- treat this as another valid overnight default move because it is trivial to verify locally and removes small maintenance debt without starting a new content branch
- keep preferring low-risk page polish while the publish window is closed, unless a clearly stronger recurring-task slice appears
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-zahuopu-entry-link-cleanup.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another low-risk site-polish candidate with a clear local verification path is still a good default if no stronger recurring-task move emerges. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes `site/**`.
```
