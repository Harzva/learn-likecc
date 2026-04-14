# evolution-2026-04-14-likecode-workspace-shell-recent-no-seat-empty-copy.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add a tiny no-seat empty-row wording cleanup so `Recent Commands` reads more intentionally before any shell seat has been selected and there is still no recent local history at all

## Completed

- updated `site/js/likecode-workspace.js` so the empty no-seat row now says `current seat: -- · no seat selected` instead of reusing the broader `shared replay only` badge copy
- updated the empty placeholder so the no-seat path explicitly says there is no shared replay yet and that successful commands will appear here for one-click replay
- synced the workspace app Markdown note and Task 13 plan notes with the new no-seat empty-row wording cleanup

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- the no-seat empty row still shares the same neutral badge tone as the broader no-seat shared-history state; this pass only clarified wording

## Decisions

- keep the no-seat empty row distinct from the no-seat shared-history row because one is a setup state while the other already exposes reusable replay memory
- avoid changing button rendering or shared-history wording in the same pass so the diff stays limited to the empty no-seat path

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny no-seat empty-row tone cleanup so Recent Commands distinguishes setup state from the broader neutral shared-history state without changing the actual replay-button cases.
```
