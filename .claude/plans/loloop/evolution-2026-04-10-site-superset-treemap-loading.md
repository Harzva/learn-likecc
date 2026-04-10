# evolution-2026-04-10-site-superset-treemap-loading.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Superset 解构页细节打磨
- bounded target: 给 `superset-arch-treemap` mount 补统一加载态与 `aria-busy` 状态

## Completed

- inspected `site/js/superset-arch-treemap.js` and chose it as the next high-value, low-risk detail candidate on `site/topic-superset-unpacked.html`
- added a shared loading placeholder in `site/js/superset-arch-treemap.js` before the D3/data bootstrap path starts
- added `aria-busy` enter/exit handling plus a single `renderError()` path so busy state is cleared consistently on empty-data, D3-load, and fetch-failure branches
- added explicit HTTP status checking before JSON parsing in the treemap fetch path
- verified the updated script with `node --check site/js/superset-arch-treemap.js`

## Failed or Deferred

- no browser render pass was run in this iteration
- the Superset knowledge graph mount still has no matching loading-state polish yet

## Decisions

- keep the pass scoped to one mount so the loop stays small and reversible
- reuse the existing `.superset-loading` visual language instead of inventing a second loading style for the same page

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-treemap-loading.md first, then inspect the Superset knowledge-graph mount for a matching low-risk polish pass, complete one bounded iteration, update the evolution note trail, and prepare the next handoff.
```
