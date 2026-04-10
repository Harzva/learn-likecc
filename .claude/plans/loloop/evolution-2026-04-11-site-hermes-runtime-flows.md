# evolution-2026-04-11-site-hermes-runtime-flows.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: Hermes Agent 庖丁解牛子专题成形
- bounded target: 在第一版 Hermes draft 上补一个更硬的代码锚点 section，把官方 architecture data flow 映射回本地代码路径

## Completed

- added a new `06 · 三条运行链路复盘` section to `site/topic-hermes-unpacked.html`
- updated the page nav so the Hermes unpacked topic now exposes a dedicated runtime-flow anchor
- mirrored the same runtime-flow section into `site/md/topic-hermes-unpacked.md`
- grounded the section in concrete paths such as `hermes_cli/main.py`, `gateway/run.py`, and `cron/scheduler.py`
- verified the draft now contains the new runtime-flow section, code-path anchors, and nav hook

## Failed or Deferred

- no browser render pass was run in this iteration
- no Mermaid or PNG diagram was added yet; this pass stayed text-first and code-path-anchored
- no Zhihu publication work was attempted because local time had already crossed outside the allowed 08:00 to 23:00 window

## Decisions

- tighten Hermes with one concrete code-anchored section before adding visuals, so any future diagram is drawn from a stable structure rather than from a loose outline
- continue treating Hermes as a recurring unpacked-topic task until the page has at least one stronger diagram or one more code-backed section

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-hermes-runtime-flows.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The most likely next move is a third Hermes pass: add one concrete structure diagram plan or one more code-backed section on memory/skills or gateway/session boundaries, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
