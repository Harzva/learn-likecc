# evolution-2026-04-12-coding-tools-approval-sync.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one bounded Task 8 hub-sync pass so the higher-level AI coding-tools map also reflects the new CLI approval-surface distinction

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- reopened `site/topic-ai-coding-tools.html` and `site/md/topic-ai-coding-tools.md` for one bounded sync pass after the new `topic-ai-cli-agent` approval-surface note landed
- updated the top-level `CLI Agent` map copy so it now points readers toward both shell categories and approval surfaces
- added one small hub section explaining that the `CLI Agent` bucket now needs a two-layer reading route:
  - shell type
  - approval surface
- updated the `怎么逛这面墙更有效` guidance so the CLI route now explicitly sends readers back to `topic-ai-cli-agent` for both shell-type and approval-surface distinctions
- recorded the Task 8 continuity in `active-reference-mining-topics-plan-v1.md` and the main site loop plan
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen the leaf `topic-ai-cli-agent` page because the current pass was a higher-level taxonomy sync, not another leaf-page wording wave
- did not reopen Task 9 because the console page already has an explicit defer condition unless a stronger backend/operator signal appears
- did not run a separate browser preview pass because this iteration was a bounded content-only site change and the repo already has automatic GitHub Pages deployment for `site/**` pushes

## Decisions

- treat this as the right next move after the CLI approval-surface pass because top-level maps should inherit stable leaf taxonomy changes instead of leaving them hidden one click below
- defer `topic-ai-coding-tools` again after this pass unless a stronger tooling-map gap, new tool family, or stronger reference-backed sync requirement appears
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-coding-tools-approval-sync.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and do not reopen the current Task 8 tooling-hub pages unless a stronger tooling-map gap, new tool family, or new primary-source taxonomy signal appears; choose exactly one new bounded non-media slice from the remaining pool. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes `site/**`.
```
