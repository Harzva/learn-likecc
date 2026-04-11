# evolution-2026-04-12-agent-comparison-inline-cleanup.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one bounded low-risk site-polish pass to remove the remaining inline layout styling from `topic-agent-comparison`

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- switched from the now-complete Task 8 CLI approval-propagation thread back to a plain site-polish slice because `site/topic-agent-comparison.html` still carried a dense cluster of inline layout styles
- replaced the remaining inline layout rules on `site/topic-agent-comparison.html` with scoped classes such as:
  - `agent-comparison-section--muted`
  - `agent-comparison-lead`
  - `agent-comparison-source-grid`
  - `agent-comparison-table-wrap`
  - `agent-comparison-note`
- added the matching scoped styles to `site/css/style.css`
- verified that `site/topic-agent-comparison.html` no longer contains any `style=` attributes
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen any Task 8 content-writing thread because the previous CLI taxonomy propagation wave was already locally complete
- did not update the Markdown article body for `topic-agent-comparison` because this iteration was a layout cleanup on the HTML page rather than a content change
- did not run a separate browser preview pass because this iteration was a bounded HTML/CSS cleanup and the repo already has automatic GitHub Pages deployment for `site/**` pushes

## Decisions

- treat this as the strongest next move after the Task 8 close-out because it is low-risk, locally verifiable, and improves maintainability without opening another content branch
- keep the current overnight loop on small site-polish or clearly stronger recurring-task slices; do not reopen the deferred media wave before the daytime publish window
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-agent-comparison-inline-cleanup.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; a good default is another low-risk site-polish candidate with a clear local verification path rather than reopening a locally deferred content thread. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes `site/**`.
```
