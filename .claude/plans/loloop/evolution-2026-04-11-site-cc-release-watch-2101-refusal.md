# evolution-2026-04-11-site-cc-release-watch-2101-refusal.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Claude Code 发版监督页继续吸收 `2.1.101` 的官方 changelog 信号
- bounded target: 增补一条围绕 refusal error explanation 的 release-watch 切片，解释它为什么是拒绝边界可解释性的增强

## Completed

- updated the `2.1.101` summary row to mention the new refusal-explanation angle
- added one new `refusal-keyword` section to the release-watch HTML page
- added the matching Markdown section focusing on API-side refusal visibility
- updated the active loop plan to record this bounded Task 4 pass

## Failed or Deferred

- no browser render pass was run in this iteration
- no additional live browsing beyond the two official changelog sources was needed
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- keep this slice anchored to the exact official phrase `include the API-provided explanation when available`
- frame the change as refusal transparency rather than generic error-message polish because the new behavior materially changes what the user can infer from a refusal

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-2101-refusal.md first, then choose exactly one best-next task from the pool by prioritizing main site work. Good next options are either a controlled return to Task 6 if the VibePaper hub becomes the better next-site move, or another bounded Task 4 slice only if a new official changelog keyword adds a genuinely distinct teaching angle. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
