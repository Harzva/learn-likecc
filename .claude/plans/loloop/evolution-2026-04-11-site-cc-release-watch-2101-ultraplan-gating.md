# evolution-2026-04-11-site-cc-release-watch-2101-ultraplan-gating.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Claude Code 发版监督页继续吸收 `2.1.101` 的官方 changelog 信号
- bounded target: 增补一条围绕 `Refine with Ultraplan` gating 的 release-watch 切片，解释它为什么是 capability 判定前移

## Completed

- updated the `2.1.101` summary row to mention the new Ultraplan-gating angle
- added one new `ultraplan-gating-keyword` section to the release-watch HTML page
- added the matching Markdown section focusing on web reachability and hidden-entry behavior
- updated the active loop plan to record this bounded Task 4 pass

## Failed or Deferred

- no browser render pass was run in this iteration
- no additional live browsing beyond the two official changelog sources was needed
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- keep this slice anchored to the exact official phrase `hide the "Refine with Ultraplan" option when the user's org or auth setup can't reach Claude Code on the web`
- frame the change as capability gating rather than generic UI polish because the interaction difference comes from explicit reachability checks

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-2101-ultraplan-gating.md first, then choose exactly one best-next task from the pool by prioritizing main site work. Good next options are either a controlled return to Task 6 if the VibePaper hub becomes the better next-site move, or another bounded Task 4 slice only if a new official changelog keyword adds a genuinely distinct teaching angle. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
