# evolution-2026-04-10-site-superset-knowledge-loading.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Superset 解构页细节打磨
- bounded target: 给 `superset-arch-knowledge` mount 补统一加载态与 `aria-busy` 状态

## Completed

- read `.claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md` first to re-anchor the loop before choosing the next detail slice
- inspected `site/js/superset-arch-knowledge.js` and selected the knowledge-graph mount as the next high-value candidate on `site/topic-superset-unpacked.html`
- added the shared `.superset-loading` placeholder before D3/data bootstrap starts in `site/js/superset-arch-knowledge.js`
- added `aria-busy` enter/exit handling and a single `renderError()` path so the mount clears busy state on D3-load and fetch-failure branches
- tightened the fetch path to report HTTP failures before JSON parsing
- verified the updated script with `node --check site/js/superset-arch-knowledge.js`

## Failed or Deferred

- no browser render pass was run in this iteration
- this pass stayed on the Superset page, so no site-shell accessibility or mobile detail was touched yet

## Decisions

- keep using one-mount polish passes because the page still has several consistent bootstrap gaps that can be fixed independently
- reuse the existing `.superset-loading` language across Superset visual modules so the page feels coherent while data-driven widgets initialize

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-knowledge-loading.md first, then inspect one small site-shell accessibility or mobile detail as the next candidate, complete one bounded polish pass, update the evolution note trail, and prepare the next handoff.
```
