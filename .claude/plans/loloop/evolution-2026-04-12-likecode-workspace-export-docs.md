# evolution-2026-04-12-likecode-workspace-export-docs.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- milestone: standalone reuse pass for the LikeCode workspace shell
- bounded target: export the workspace-shell reuse path into `exports/codex-loop-skill` without forcing the full site bundle into the exported skill repo

## Completed

- reviewed `exports/codex-loop-skill/README.md` and confirmed the exported repo still only described the daemon/automation layer, not the operator-facing workspace shell
- added `exports/codex-loop-skill/references/workspace-shell.md` to document the companion shell split, minimum relay contract, copy order, and what stays outside the core skill package
- updated `exports/codex-loop-skill/README.md` so the exported repo now advertises the workspace-shell companion note instead of looking daemon-only
- marked the Task 13 export follow-up as completed in the active workspace-app plan

## Failed or Deferred

- did not copy the full `site/app-likecode-workspace.html` bundle into the exported skill repo because that would drag repo-local site CSS and topic assumptions into what should stay a small reusable skill package
- did not change the live workspace shell implementation in this pass because the bounded target was export documentation, not another frontend feature

## Decisions

- keep `codex-loop-skill` small and script-first; document the workspace shell as a companion layer rather than bundling the full site assets into the exported repo
- treat the current Task 13 export requirement as satisfied by a clear reuse path and copy-order note, unless a future pass explicitly asks for a packaged standalone shell scaffold

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-likecode-workspace-export-docs.md first. The LikeCode workspace-app line has now closed its standalone-export follow-up by documenting the companion workspace-shell reuse path inside `exports/codex-loop-skill`, without forcing the full site bundle into the exported skill repo. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 13 unless there is a clearly stronger reuse or packaging slice than the other active plans; otherwise pick the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
