# evolution-2026-04-12-site-map-sleep-branch.md

## Plan

- path: `.claude/plans/loloop/active-site-map-plan-v1.md`
- milestone: keep the site-wide map aligned with recently matured topic lines
- bounded target: make `codex-loop in sleep` visible from the main site map as an explicit `VibePaper -> AI Scientist-v2` subchain instead of leaving it discoverable only from the topic page and generated index

## Completed

- extended the `site-topic-map` Mermaid graph in `site/js/app.js` so `AI Scientist-v2` now points to `codex-loop in sleep`
- updated `site/topic-site-map.html` so the map caption and explanatory copy explicitly teach the new `VibePaper -> AI Scientist-v2 -> codex-loop in sleep` branch
- updated `site/md/topic-site-map.md` with the same structural note so the Markdown mirror stays aligned with the HTML page
- recorded the new bounded Task 11 pass in `.claude/plans/loloop/active-site-map-plan-v1.md`

## Failed or Deferred

- did not expand the site map with a second new branch in the same pass because one newly mature topic family was enough for a bounded sync round
- did not touch homepage or other hub entry points because the map page itself was the missing synchronization surface this iteration

## Decisions

- treat `codex-loop in sleep` as mature enough to live on the main site map, not just as an internal subtopic hidden behind the AI-Scientist line
- keep Task 11 active after this pass, but only reopen it for another map change when a recently matured topic family is still missing from the main guide

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then choose exactly one next bounded move from the recurring pool. The site map now explicitly teaches `VibePaper -> AI Scientist-v2 -> codex-loop in sleep`, so only stay on Task 11 if another recently matured topic family is still missing from `site/topic-site-map.html`; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
