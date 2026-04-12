# evolution-2026-04-12-codex-loop-in-sleep-meta-opt-routeback.md

## Plan

- path: `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`
- milestone: `codex-loop in sleep` 第一条 route-back
- bounded target: 把 `meta-optimize` 从分析结论收敛成一条真正写回 `.codex-loop/prompt.md` 的最小规则

## Completed

- added a short `Meta-opt rule` block to `.codex-loop/prompt.md`
- defined `loop improvement candidate` as the smallest reusable unit for loop-level self-optimization
- synced the same route-back logic into `site/topic-codex-loop-in-sleep.html` and `site/md/topic-codex-loop-in-sleep.md`
- marked the first Task 14 route-back and the `meta-opt` line as completed in `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`

## Failed or Deferred

- did not implement a persistent wiki layout in this pass
- did not split out a watchdog plan line in this pass
- did not add a new diagram; this pass prioritized a real prompt write-back over more explanation graphics

## Decisions

- treat `meta-optimize` as a thin operational layer first, not as a large auto-rewriter system
- require repetition or a clearly improved next tick before promoting a loop-level observation into `.codex-loop/prompt.md`
- prefer `persistent wiki` or `watchdog` as the next Task 14 follow-up, because the first meta-opt route-back is now landed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-codex-loop-in-sleep-meta-opt-routeback.md first. Task 14 now has its first real route-back: `meta-optimize` has been reduced to a short operational `Meta-opt rule` in `.codex-loop/prompt.md` and synchronized into `topic-codex-loop-in-sleep`. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 14 only if the next slice cleanly advances either `persistent wiki` memory layout or `watchdog` boundary clarification; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
