# evolution-2026-04-15-likecode-workspace-shell-output-header-empty-cues.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: replace the output-panel `output from / updated` empty placeholders with explicit no-shell cues

## Completed

- changed the output header so `output from` no longer falls back to `--` when no shell exists yet
- changed the output header so `updated` no longer falls back to `--` when no shell exists yet
- kept the existing `--` fallback for states where seats exist but the panel still has no selected/local provenance context
- synced the app note and active Task 13 plan with the new empty-state wording pass

## Failed or Deferred

- no HTML structure changes were needed for this pass
- no browser render pass was run in this iteration

## Decisions

- keep this micro-pass inside the existing shell empty-state cleanup line instead of opening a new interaction branch
- prefer replacing low-information `--` placeholders with operator-readable result text whenever the real state is known to be `no shell yet`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 from .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md and pick one more bounded shell-surface polish pass after the output-header empty cues.
```
