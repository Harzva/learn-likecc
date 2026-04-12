# evolution-2026-04-12-codex-loop-in-sleep-memory-layout.md

## Plan

- path: `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`
- milestone: `codex-loop in sleep` 第二条 route-back
- bounded target: 把 `persistent wiki` 从概念差异落成第一版 memory layout，并明确先长哪一层

## Completed

- decided that `codex-loop` should start `persistent wiki` from `topic wiki`, not from a wide `project wiki`
- defined the first three-layer memory layout:
  - `topic wiki = site topic pages`
  - `working memory = active plans`
  - `failed-attempt memory = evolution trail`
- synced the same layout into `site/topic-codex-loop-in-sleep.html` and `site/md/topic-codex-loop-in-sleep.md`
- marked the `persistent wiki` decision and first memory-layout write-back as completed in `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`

## Failed or Deferred

- did not create a standalone memory service or a new `project wiki` directory in this pass
- did not tackle `watchdog` boundaries in this pass
- did not pin the subtopic into `topic-ai-scientist.html` in this pass

## Decisions

- prefer `topic wiki` first because `codex-loop` already grows via stable topic pages and public topic semantics
- treat `.claude/plans/loloop/evolution-*.md` as the first `failed-attempt memory` lane instead of creating a separate failure ledger prematurely
- leave `project wiki` as a later expansion only if the current three-layer layout stops being enough

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-codex-loop-in-sleep-memory-layout.md first. Task 14 now has two real route-back passes: a `Meta-opt rule` in `.codex-loop/prompt.md` and a first `persistent wiki` memory layout that reads `topic page / active plan / evolution trail` as `topic wiki / working memory / failed-attempt memory`. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 14 only if the next slice cleanly advances `watchdog` boundary clarification or pins this subtopic into the broader AI-Scientist hub; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
