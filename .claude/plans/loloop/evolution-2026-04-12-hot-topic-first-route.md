# evolution-2026-04-12-hot-topic-first-route.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-hot-topic-watch-plan-v1.md`
- bounded target: take one fresh item from the local hot-topic snapshot and actually route it into a downstream hotspot page, so the intake layer proves it can feed editorial destinations instead of only collecting entries

## Completed

- added a new curated row to `site/topic-agent-hot.html` for `Build Agents That Don't Fail in Production`, sourced from the local `site/data/hot-topic-snapshot.json`
- updated `site/md/topic-agent-hot.md` so the Markdown summary now records that this was the first real downstream route from the hot-topic intake layer
- refreshed topic metadata with `python3 tools/refresh_site_topic_metadata.py`
- rebuilt the loop task board with `python3 tools/build_loop_task_board.py`
- verified site/html parity with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- no new source was added to `site/data/hot-topic-sources.json` in this round
- no second downstream route was attempted; this pass stayed intentionally bounded to one routed item

## Decisions

- switch away from Task 11 because the CLI-branch site-map mismatch was already resolved
- prefer the first downstream-route follow-up over adding a third source immediately, because routing a real item proves the intake layer is operational instead of only collecting feeds
- keep the route conservative: use an item already present in the local snapshot instead of doing a fresh live-source expansion in the same pass

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-hot-topic-first-route.md first. Task 12 now has its first real downstream routing pass: one item from the local snapshot has been turned into a curated `topic-agent-hot` entry. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 12 only if there is another equally clear, low-risk source-roster or downstream-route follow-up; otherwise switch to the next higher-value recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
