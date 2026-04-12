# evolution-2026-04-12-site-map-hot-route-branch.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-site-map-plan-v1.md`
- bounded target: make the new hot-topic intake chain visible from the site map so `topic-hot-watch` is taught as an upstream router into `topic-agent-hot` and `topic-rag-hot`, not just another standalone hub page

## Completed

- updated the `site-topic-map` Mermaid graph in `site/js/app.js` so `热门话题专项` now expands into `热点 intake / 路由页`, then into `Agent 技术热点` and `RAG 技术热点`
- updated `site/topic-site-map.html` caption and body copy so the same hot-topic routing chain is explained directly on the guide page
- updated `site/md/topic-site-map.md` with the same new branch and explanatory note
- refreshed topic metadata with `python3 tools/refresh_site_topic_metadata.py`
- verified site/html parity with `python3 tools/check_site_md_parity.py`
- verified the Mermaid host script with `node --check site/js/app.js`

## Failed or Deferred

- `site/data/site-topic-index.json` did not need a structural change in this pass because the generated topic index already included `topic-hot-watch`, `topic-agent-hot`, and `topic-rag-hot`
- no homepage or hot-topic leaf page was changed in this round because the site-map page itself was the smallest useful Task 11 slice

## Decisions

- switch back from Task 12 because its intake/source-policy wave is locally healthy, while the main guide still hid the new route chain from first-time readers
- keep the pass bounded to one navigation-chain sync instead of redesigning the whole site map or reopening hotspot content writing
- treat Task 11 as locally healthy again after this pass unless another similarly clear site-map or metadata mismatch appears

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-site-map-hot-route-branch.md first. Task 12's intake layer is locally healthy, and Task 11 now also makes the `热门话题专项 -> 热点 intake / 路由页 -> Agent 技术热点 / RAG 技术热点` chain visible from the main site map. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 11 unless there is another equally clear site-map / metadata synchronization gap; otherwise choose the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
