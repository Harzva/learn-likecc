# evolution-2026-04-12-hot-topic-source-policy-lanes.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-hot-topic-watch-plan-v1.md`
- bounded target: turn the hot-topic source policy from generic “RSS vs digest” guidance into a concrete three-lane editorial rule grounded in the first real route and the first official-blog source expansion

## Completed

- updated `.claude/skills/hot-topic-curation/references/source-policy.md` to distinguish three source lanes:
  - public digest
  - independent RSS blog
  - official product / ecosystem blog RSS
- added lane-specific best uses, default route targets, and editorial cautions to the source policy
- updated `site/topic-hot-watch.html` so the hub page now explains the same three-lane intake model directly on the page
- updated `site/md/topic-hot-watch.md` with the same lane explanation and maintenance rule
- refreshed topic metadata with `python3 tools/refresh_site_topic_metadata.py`
- rebuilt the loop task board with `python3 tools/build_loop_task_board.py`
- verified site/html parity with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- no new source was added in this pass
- no new downstream hotspot route was added in this pass

## Decisions

- stay on Task 12 for one more pass because the plan still had a single unchecked output that could now be resolved using real local evidence instead of abstract policy writing
- keep the refinement narrowly focused on lane separation instead of redesigning the whole hot-topic workflow
- treat the hot-topic intake layer as locally healthy after this pass unless a new route or source-class gap appears

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-hot-topic-source-policy-lanes.md first. Task 12 now has a first downstream route, a third trusted RSS source, and an explicit three-lane source policy. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 12 unless there is a clearly new low-risk route target, source-class expansion, or source-policy gap; the current intake layer is now locally healthy. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
