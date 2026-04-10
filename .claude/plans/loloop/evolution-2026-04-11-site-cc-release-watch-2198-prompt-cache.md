# evolution-2026-04-11-site-cc-release-watch-2198-prompt-cache.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 持续推进 Claude Code release-watch recurring task
- bounded target: 在同一 release-watch 页面上补一个 `2.1.98` 的 prompt-cache 关键词段落，把 `--exclude-dynamic-system-prompt-sections` 解释成“稳定 system prompt 骨架”的控制面问题

## Completed

- added a bounded keyword-focus section on `--exclude-dynamic-system-prompt-sections` and improved cross-user prompt caching
- connected that section back to the existing Monitor / status-line / security slices so the page now reads as observability + controllability + cache stability
- added one new `[插图提示词]` block for a prompt-cache hit/miss comparison diagram
- kept the update anchored to the same official changelog sources

## Failed or Deferred

- no browser render pass was run in this iteration
- no separate prompt-cache topic page was created; this pass intentionally stayed inside the release-watch host page
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- the best next move was still to deepen the same release-watch page, because the prompt-cache slice completes a coherent 2.1.98 teaching bundle instead of scattering related ideas across multiple thin pages
- release-watch remains the right host while the keyword is best understood as part of the official release stream rather than as a standalone concept article

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-2198-prompt-cache.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The release-watch page now has a strong 2.1.98 bundle, so the best next move may be either a controlled shift to Task 6 for the VibePaper hub or one clearly worthwhile adjacent changelog slice under Task 4 only if it adds a genuinely new teaching angle. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
