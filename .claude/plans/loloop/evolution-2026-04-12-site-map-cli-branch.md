# evolution-2026-04-12-site-map-cli-branch.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-site-map-plan-v1.md`
- bounded target: make the `CLI Agent -> everything-agent-cli` branch explicit in the site map so the umbrella repo line is visible from the main site guide, not only the topic page and generated index

## Completed

- updated the `site-topic-map` Mermaid graph in `site/js/app.js` so `CLI Agent 专页` now has an explicit child branch for `everything-agent-cli umbrella 实验线`
- updated `site/topic-site-map.html` caption and body copy so the new CLI branch is explained in the page itself
- updated `site/md/topic-site-map.md` with the same new branch and explanatory note
- ran `python3 tools/refresh_site_topic_metadata.py`
- ran `python3 tools/check_site_md_parity.py`
- ran `node --check site/js/app.js`

## Failed or Deferred

- `site/data/site-topic-index.json` did not need a structural change in this pass; the generated index already knew about `topic-everything-agent-cli`
- no homepage or other hub entry was changed in this round because the site-map page itself was the smallest useful Task 11 slice

## Decisions

- switch away from Task 10 because its current explanation wave was locally mature, while Task 11 had a more direct main-site synchronization gap
- keep the Task 11 pass bounded to one new visible branch plus one metadata refresh, instead of trying to redesign the full map
- treat further Task 11 work as optional; only continue if another similarly clear site-map / metadata mismatch appears

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-site-map-cli-branch.md first. Task 10's current explanation wave is locally mature, and Task 11 now has one completed bounded pass making the `CLI Agent -> everything-agent-cli` branch explicit in the site map. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 11 only if there is another clear site-map / metadata synchronization gap with similar main-site leverage; otherwise switch to the next higher-value recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
