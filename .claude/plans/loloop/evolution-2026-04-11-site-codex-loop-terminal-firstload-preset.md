# evolution-2026-04-11-site-codex-loop-terminal-firstload-preset.md

## Plan

- path: `.claude/plans/loloop/active-codex-loop-ai-terminal-plan-v1.md`
- milestone: codex-loop AI Terminal 继续补 first-load layout，让第一次打开时不要落在“碰运气的原始 pane 几何”
- bounded target: 无布局缓存或缓存损坏时，默认回到受控的 `Overview` preset，不改 relay 协议

## Completed

- updated `site/js/codex-loop-console.js` so the console now restores the curated `Overview` preset when no saved layout exists
- updated the fallback path so corrupted layout state also recovers via the same preset instead of falling back to ad-hoc raw panel positions
- kept the first-load restore silent so the UI does not immediately spam success feedback before the operator has done anything
- synced the Markdown mirror note in `site/md/topic-codex-loop-console.md`
- checked off the first-load layout-default item in `.claude/plans/loloop/active-codex-loop-ai-terminal-plan-v1.md`
- updated the umbrella site loop plan to record this Task 7 first-load-layout pass

## Failed or Deferred

- no live relay browser pass was run in this iteration
- no backend relay change was needed in this bounded pass
- the remaining unchecked work in the dedicated plan is now mainly validation-oriented rather than another obvious UI slice

## Decisions

- route first-load recovery through the preset system instead of duplicating another “default layout” codepath
- keep the automatic preset application silent on first load so the operator only sees feedback for actions they explicitly triggered
- treat this as enough to close the first-load layout-default item, rather than also trying to redesign every inline panel position in the same pass

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-codex-loop-terminal-firstload-preset.md first, then continue Task 7 by reading .claude/plans/loloop/active-codex-loop-ai-terminal-plan-v1.md and choosing the next bounded move. The dedicated Task 7 plan is now largely feature-complete, so the next pass can either do one explicit bounded validation / live-relay hygiene pass if you want to keep Task 7 active, or mark Task 7 locally deferred/done with a written reason and move to the next best task from the pool. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit so GitHub Pages redeploys when site-facing files changed.
```
