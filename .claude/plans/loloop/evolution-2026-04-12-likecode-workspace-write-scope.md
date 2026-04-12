# evolution-2026-04-12-likecode-workspace-write-scope.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: keep turning the LikeCode workspace shell into a reusable app whose safety and packaging contracts are visible on-page
- bounded target: extend the new `Workspace Contract` panel so it also exposes `site root / allowed edit roots / allowed edit files` instead of leaving write-scope assumptions hidden in relay code

## Completed

- extended `tools/codex_loop_web_relay.py` workspace meta so it now returns `allowed_edit_roots` and `allowed_edit_files`
- updated `site/app-likecode-workspace.html` with extra contract slots for `site root`, `edit roots`, and `edit files`
- updated `site/js/likecode-workspace.js` so the new contract fields render directly from relay meta
- updated `site/md/app-likecode-workspace.md` and `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md` to record why the write-scope surface matters

## Failed or Deferred

- did not add per-path write validation previews because this pass stayed on static contract visibility, not interactive linting
- did not widen the allowlist itself because the missing gap was operator visibility, not backend permissions

## Decisions

- treat relay write-scope as part of the operator UX, not hidden implementation detail
- keep Task 13 active, but only continue if another reusable workspace contract or operation is still implicit enough to justify a dedicated surface

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then choose exactly one next bounded move from the recurring pool. The LikeCode workspace app now exposes both workspace meta and write-scope boundaries on-page, so only stay on Task 13 if another existing capability still lacks a clear reusable surface; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
