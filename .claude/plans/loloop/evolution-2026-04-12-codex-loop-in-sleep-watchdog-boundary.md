# evolution-2026-04-12-codex-loop-in-sleep-watchdog-boundary.md

## Plan

- path: `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`
- milestone: `codex-loop in sleep` 第三条 route-back
- bounded target: 把 `watchdog health layer` 从 ARIS 借鉴点落成 `daemon / workspace / watchdog` 的职责边界，并决定是否需要独立计划线

## Completed

- clarified the three-layer boundary in `topic-codex-loop-in-sleep`:
  - `daemon = drive ticks and handoff rhythm`
  - `workspace = operator-facing control and visibility`
  - `watchdog = low-frequency health checks and anomaly summaries`
- anchored the explanation to local evidence from `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/tools/watchdog.py`
- decided not to open a separate watchdog plan line yet
- synced the boundary decision into `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`

## Failed or Deferred

- did not implement a standalone watchdog process in this pass
- did not pin the subtopic into `topic-ai-scientist.html` in this pass
- did not add a new diagram in this pass

## Decisions

- prefer a responsibility split before implementation: first define what belongs to daemon, workspace, and watchdog
- keep watchdog inside the current subtopic until repeated health incidents justify its own plan line
- treat repeated shell orphaning, relay stalls, session loss, or download hangs as the threshold for escalating watchdog into a dedicated plan

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-codex-loop-in-sleep-watchdog-boundary.md first. Task 14 now has three real route-back passes: `meta-opt` prompt rules, a first `persistent wiki` memory layout, and an explicit `daemon / workspace / watchdog` boundary with a decision not to open a separate watchdog line yet. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 14 unless the next slice cleanly pins this subtopic into the broader AI-Scientist hub or adds one concrete structure diagram; the current route-back wave is now locally healthy. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
