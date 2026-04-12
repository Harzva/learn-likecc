# evolution-2026-04-12-likecode-workspace-contract-panel.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: keep growing the LikeCode workspace shell into a reusable cross-project app instead of a repo-specific local page
- bounded target: surface the existing relay-provided workspace contract inside the app so `workspace root / site base / task-board path / config path / repo links` are visible on-page instead of staying implicit in backend responses and docs

## Completed

- added a `Workspace Contract` panel to `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the app now renders relay-provided workspace meta for workspace name, root, site base, task-board path, config path, repo URL, and blob base
- updated `site/md/app-likecode-workspace.md` to document why this panel matters for cross-project packaging and reuse
- recorded the new bounded Task 13 pass in `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- did not add a second packaging flow such as installer copy commands or export buttons because this pass stayed inside the existing relay contract
- did not change relay backend fields because the missing piece was front-end teaching and visibility, not transport capability

## Decisions

- treat `workspace meta` as part of the product surface, not just hidden backend context
- keep Task 13 active, but only continue it when the next slice exposes another existing capability more clearly or adds a genuinely reusable workspace operation

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then choose exactly one next bounded move from the recurring pool. The LikeCode workspace app now exposes its relay-provided workspace contract on-page, so only stay on Task 13 if another existing capability still lacks a clear reusable surface; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
