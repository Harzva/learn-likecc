# evolution-2026-04-14-likecode-workspace-shell-seats.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: keep turning the LikeCode workspace shell into a reusable app surface instead of a thin reader around hidden relay capabilities
- bounded target: expose the existing relay shell session API inside the workspace app so shell seats can be listed, created, selected, and closed without leaving the page

## Completed

- added a `Shell Seats` panel to `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the app now reads `/api/shell/list`, can create a shell with `/api/shell/create`, close the active shell with `/api/shell/close`, and render a small local shell roster
- updated `site/md/app-likecode-workspace.md` to record why shell seats now belong inside the reusable workspace surface
- recorded the new bounded Task 13 pass in `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- did not add shell write / terminal streaming into the app because this pass stayed bounded to session visibility and seat lifecycle
- did not merge shell seats with the log panel because the goal was to expose the capability first, not redesign the whole runtime area

## Decisions

- treat shell seats as first-class workspace surface, not hidden monitor-only capability
- keep Task 13 active, but only continue if another existing workspace capability is still too hidden or if the next move is a clearly bounded step toward a multi-pane terminal shell

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then choose exactly one next bounded move from the recurring pool. The LikeCode workspace app now exposes workspace meta, write-scope boundaries, and a minimal shell seat roster, so only stay on Task 13 if another existing capability still lacks a reusable surface or there is a clearly bounded next step toward a multi-pane terminal shell; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
