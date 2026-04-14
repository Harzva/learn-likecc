# evolution-2026-04-14-likecode-workspace-shell-presets.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: add safe shell presets to the workspace app so the new one-line shell write surface can trigger common probes without manual typing

## Completed

- exposed a compact `Shell Presets` row in `site/app-likecode-workspace.html` with `pwd / ls / git status / python -V`
- refactored shell write dispatch in `site/js/likecode-workspace.js` so manual send and preset buttons share one code path
- added lightweight shell-send feedback for `no active shell`, `empty command`, and `sending / sent / failed: <command>` states
- synced the workspace app Markdown note so the preset lane is described as part of the shell surface

## Failed or Deferred

- no browser render pass was run in this bounded iteration
- no command history or replay lane was added yet; the shell surface is still intentionally one-command-at-a-time

## Decisions

- keep the preset list short and probe-oriented instead of turning the page into a risky multi-action terminal
- keep shell-send feedback local to the existing status strip instead of adding another panel or backend field

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first, then continue Task 13 with one more bounded shell-surface pass: add a tiny recent-command memory or replay affordance so the one-line shell lane keeps just enough operator context without pretending to be a full terminal.
```

