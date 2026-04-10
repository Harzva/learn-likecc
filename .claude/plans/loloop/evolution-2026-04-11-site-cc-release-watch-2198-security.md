# evolution-2026-04-11-site-cc-release-watch-2198-security.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 持续推进 Claude Code release-watch recurring task
- bounded target: 在同一 release-watch 页面上补一个 `2.1.98` 的安全向关键词段落，把 subprocess sandboxing、script caps 和 Bash 权限硬化收束成一条“可控性补课”主线

## Completed

- added a bounded keyword-focus section on subprocess sandboxing, `CLAUDE_CODE_SCRIPT_CAPS`, and the 2.1.98 Bash permission-hardening cluster
- connected that section back to the earlier Monitor/status-line slices as the “可控性” counterpart to the recent “可观测性” slices
- added one new `[插图提示词]` block for a background-script security-boundary diagram
- kept the update anchored to the same official changelog sources

## Failed or Deferred

- no browser render pass was run in this iteration
- no separate security topic page was created; this pass intentionally stayed inside the release-watch host page
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- the best next move was to deepen the same release-watch page one more time, because 2.1.98 observability and 2.1.98 control hardening together form a more complete teaching bundle than a one-off isolated note
- release-watch is still the right host as long as the keyword is best understood as part of the official release stream rather than as a standalone concept page

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-2198-security.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The release-watch page now has a coherent recent bundle, so the best next move may be either one last bounded changelog slice under Task 4 if there is a clearly worthwhile adjacent keyword, or a controlled shift to Task 6 if the VibePaper hub becomes the better next-site move. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
