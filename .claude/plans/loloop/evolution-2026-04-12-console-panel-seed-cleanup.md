# evolution-2026-04-12-console-panel-seed-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one more low-risk site-polish pass to remove the remaining inline panel seed styling on `topic-codex-loop-console`

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- chose the AI Terminal topic page as a stronger site-facing slice than another side-page cleanup because it directly strengthens a main topic while staying bounded to layout-only work
- replaced the remaining inline panel seed styling in `site/topic-codex-loop-console.html` with scoped `codex-console-panel--seed-*` classes in `site/css/style.css`
- moved the initial position and size seeds for daemon, preview, logs, thread compose, session stack, monitor, timeline, shell, and monitor-template panels into reusable CSS classes
- verified that `site/topic-codex-loop-console.html` no longer contains any `style=` attributes
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen any queued Zhihu draft or publish work because the current pass remained outside the daytime publish window
- did not change the AI Terminal teaching content or JS behavior because this iteration only removed inline layout debt
- did not run a separate browser preview pass because this was a bounded HTML/CSS cleanup and the repo already auto-deploys `site/**` pushes to GitHub Pages

## Decisions

- treat this as a better-than-default overnight move because it improves a high-value topic page while staying narrow and easy to verify
- keep preferring low-risk site polish while the publish window is closed, unless a clearly stronger recurring-task slice appears
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-console-panel-seed-cleanup.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another high-value but still locally verifiable site-polish candidate is now preferable to reopening deferred media work. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes site/**.
```
