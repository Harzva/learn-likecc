# evolution-2026-04-14-likecode-workspace-shell-status-start-cue.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13 - LikeCode workspace app
- bounded target: make the no-seat shell status preview teach the same create/select plus `Enter` / quick-probe startup path already used in nearby output states

## Completed

- updated the no-seat `workspace-shell-preview` copy in `site/js/likecode-workspace.js` so it no longer stops at `select or create a shell seat first`
- aligned the preview copy with the newer shell-lane startup path: create/select a shell first, then press `Enter` or use quick probes
- synced the workspace app markdown note and active Task 13 plan with the new preview-level teaching cue

## Failed or Deferred

- did not change relay behavior or shell lifecycle logic in this pass
- did not branch into media work; Task 13 remains the active bounded site move

## Decisions

- keep this pass text-only and local to the shell no-seat state, because the status preview was the last nearby startup cue still lagging behind the newer helper and output guidance
- keep the preview phrasing compact so it fits the status lane while still naming the two real operator entry paths

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 in .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md by tightening one more tiny no-seat shell cue, update the evolution trail, validate the touched files, and push the bounded pass.
```
