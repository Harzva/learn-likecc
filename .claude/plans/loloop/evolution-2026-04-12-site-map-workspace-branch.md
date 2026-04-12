# evolution-2026-04-12-site-map-workspace-branch.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-site-map-plan-v1.md`
- bounded target: make the new local workspace-app line visible from the site map so `app-likecode-workspace.html` is discoverable as part of a `Loop Lab / 本地工作台` branch rather than only from local article pages

## Completed

- updated the `site-topic-map` Mermaid graph in `site/js/app.js` so the homepage now exposes a `本地工作台 / Loop Lab` branch with explicit children for `codex-loop AI Terminal` and `LikeCode Workspace App`
- updated `site/topic-site-map.html` caption and body copy so the new local-workspace branch is explained directly on the guide page
- updated `site/md/topic-site-map.md` with the same new branch and explanatory note
- refreshed topic metadata with `python3 tools/refresh_site_topic_metadata.py`
- verified site/html parity with `python3 tools/check_site_md_parity.py`
- verified the Mermaid host script with `node --check site/js/app.js`

## Failed or Deferred

- `site/data/site-topic-index.json` did not need a structural change in this pass because the generated topic index still focuses on `topic-*` pages, not the new app shell
- no homepage or AI Terminal article copy was changed in this round because the site-map page itself was the smallest useful Task 11 slice

## Decisions

- switch away from Task 13 because its current foundational app wave is locally healthy, while the main site guide still hid the newly landed workspace surface
- keep the Task 11 pass bounded to one new branch plus one metadata refresh instead of redesigning the full map or broadening the index schema to app pages
- treat Task 11 as locally healthy again after this pass unless another similarly clear map or metadata mismatch appears

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-site-map-workspace-branch.md first. Task 13's foundational app wave is locally healthy, and Task 11 now also makes the `本地工作台 / Loop Lab -> codex-loop AI Terminal / LikeCode Workspace App` chain visible from the main site map. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 11 unless there is another equally clear site-map / metadata synchronization gap; otherwise choose the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
