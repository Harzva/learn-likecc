# evolution-2026-04-14-likecode-workspace-shell-output.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: keep growing the LikeCode workspace app from shell-seat visibility toward a real reusable shell surface
- bounded target: extend the new `Shell Seats` roster with a selected-seat output preview so shell read capability stops being hidden behind the relay API

## Completed

- added a shell output preview area to `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so selecting a shell seat now reads `/api/shell/read?id=...` and renders the active seat's recent output
- updated `site/md/app-likecode-workspace.md` to explain that `Shell Seats` is now a read-only shell surface instead of only a lifecycle panel
- recorded the new bounded Task 13 pass in `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- did not add shell write or interactive stdin because this pass stayed bounded to output visibility
- did not merge shell output with the main log panel because the goal was to expose per-seat read capability first

## Decisions

- treat shell read as the next natural step after shell seat lifecycle visibility
- keep Task 13 active, but only continue if the next step toward a multi-pane terminal shell is similarly bounded and locally verifiable

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then choose exactly one next bounded move from the recurring pool. The LikeCode workspace app now exposes workspace meta, write-scope boundaries, shell seat lifecycle, and selected-seat output, so only stay on Task 13 if there is another clearly bounded step toward a multi-pane terminal shell; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
