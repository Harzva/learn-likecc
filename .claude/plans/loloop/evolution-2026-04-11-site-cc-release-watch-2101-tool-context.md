# evolution-2026-04-11-site-cc-release-watch-2101-tool-context.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Claude Code 发版监督页继续吸收 `2.1.101` 的官方 changelog 信号
- bounded target: 增补一条围绕 `tool-not-available` 的 release-watch 切片，解释“工具存在”和“当前上下文可用”为什么应该分开看

## Completed

- updated the `2.1.101` summary row to mention the new tool-not-available angle
- added one new `tool-context-keyword` section to the release-watch HTML page
- added the matching Markdown section with an explicit note that the control-surface reading is an inference from the official changelog wording
- updated the active loop plan to record this bounded Task 4 pass

## Failed or Deferred

- no browser render pass was run in this iteration
- no additional live browsing beyond the two official changelog sources was needed
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- keep this slice anchored to the exact official phrase `tool that exists but isn't available in the current context`
- treat the “tool existence vs context availability” framing as a clearly marked inference rather than a quoted official architectural claim

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-2101-tool-context.md first, then choose exactly one best-next task from the pool by prioritizing main site work. Good next options are either a controlled return to Task 6 if the VibePaper hub becomes the better next-site move, or another bounded Task 4 slice only if a new official changelog keyword adds a genuinely distinct teaching angle. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
