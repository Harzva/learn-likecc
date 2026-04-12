# evolution-2026-04-12-s01-code-language-hidden-state.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one bounded lesson-page polish pass to replace the remaining functional inline code-language hiding on `s01.html` with semantic hidden state

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- chose the `s01.html` code-language toggle as the next bounded slice because the last active-page `style=` usage was functional `display:none`, not layout debt
- replaced the five Python code-block `style="display:none"` markers in `site/s01.html` with `hidden aria-hidden="true"`
- updated `site/js/app.js` so `switchCodeLanguage()` now toggles `hidden` plus `aria-hidden` instead of writing inline `display` styles
- verified the code-language state update with `node --check site/js/app.js`
- verified that `site/s01.html` no longer contains the old inline `display:none` language toggles or any other `style=` attributes
- re-ran `python3 tools/check_site_md_parity.py` to confirm the site/md mirror still stays clean after the mixed HTML/JS pass

## Failed or Deferred

- did not reopen any queued Zhihu draft or publish work because the current pass remained outside the daytime publish window
- did not touch legacy-only `index-old.html` because it is a weaker overnight target than a live lesson page with active language-switch behavior
- did not generalize this pattern to other pages because `s01.html` was the only active lesson page still using inline code-language hiding

## Decisions

- treat semantic hidden-state cleanup as a worthwhile continuation of the site-shell/accessibility wave once static inline layout debt is largely exhausted
- prefer active lesson pages over legacy pages when the remaining debt is small but still user-visible
- keep relying on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-s01-code-language-hidden-state.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and choose exactly one new bounded non-media slice from the remaining pool; another high-value but still locally verifiable site-polish or site-shell accessibility candidate is preferable to reopening deferred media work. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes site/**.
```
