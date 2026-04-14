# evolution-2026-04-14-likecode-workspace-shell-write.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: keep growing the LikeCode workspace app from shell-seat visibility toward a minimally operable shell surface
- bounded target: expose a one-line shell write control inside `Shell Seats` so `/api/shell/write` stops being relay-only capability

## Completed

- added a one-line shell command input and send button to `site/app-likecode-workspace.html`
- updated `site/js/likecode-workspace.js` so the active shell seat can receive a single command through `/api/shell/write` and then refresh its output
- updated `site/md/app-likecode-workspace.md` to record that `Shell Seats` is now minimally operable instead of read-only only
- recorded the new bounded Task 13 pass in `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`

## Failed or Deferred

- did not add multiline stdin or full terminal emulation because this pass stayed bounded to one-line command dispatch
- did not add command history or shell safety presets because the immediate gap was simply exposing the existing write API

## Decisions

- treat one-line shell write as the minimal bridge between a read-only shell surface and a future multi-pane terminal shell
- keep Task 13 active, but only continue if the next terminal step stays equally bounded and locally verifiable

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then choose exactly one next bounded move from the recurring pool. The LikeCode workspace app now exposes workspace meta, write-scope boundaries, shell seat lifecycle, selected-seat output, and one-line shell write, so only stay on Task 13 if there is another clearly bounded next step toward a multi-pane terminal shell; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
