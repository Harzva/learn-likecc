# evolution-2026-04-11-site-hermes-execution-boundaries.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Hermes Agent 庖丁解牛子专题成形
- bounded target: 在 Hermes draft 上补一段更硬的 environment / backend 边界分析，把“执行面”拆成 backend selection、persistence contract、task-scoped state、research reuse

## Completed

- added a new code-backed environment/backend boundary table inside the Hermes `05 · Gateway、Cron、Environment` section
- mapped `TERMINAL_ENV`, `create_environment()`, `_cleanup_task_resources()`, persistent filesystem semantics, `task_id`, and the Atropos environment reuse path back to local code and docs
- mirrored the same execution-boundary explanation and a new diagram-ready `[插图提示词]` block into `site/md/topic-hermes-unpacked.md`
- verified the draft now contains the new execution-boundary anchor terms

## Failed or Deferred

- no browser render pass was run in this iteration
- no Mermaid or PNG visual was added yet; this pass stayed text-first but diagram-ready
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- explain backend selection and persistence semantics before drawing the execution diagram, because the visual is only useful once “same tool interface, different execution surfaces” is stated precisely
- Hermes remains the best next-site task until the unpacked page gains either one concrete diagram asset or a final synthesis pass tying the control plane back to our own Claude Code / codex-loop stack

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-hermes-execution-boundaries.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The most likely next move is a sixth Hermes pass: turn one existing [插图提示词] block into a concrete Mermaid diagram or add one final synthesis section comparing Hermes to our Claude Code / Like Code / codex-loop control-plane split, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
