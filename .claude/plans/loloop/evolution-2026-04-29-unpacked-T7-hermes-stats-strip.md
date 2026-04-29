# Evolution Note: T7 — Hermes Stats Strip & Hero Alignment

Date: 2026-04-29
Task: T7 from active-unpacked-template-align-plan-v2.md

## What Changed

Added a 4-item stats strip to `topic-hermes-unpacked.html` hero section:

- **6** 架构层次 — matching the six-layer stack documented in section 02
- **10+** 核心 API 面 — tools/registry, memory, skills, skill-manager, delegate, terminal, gateway/run, gateway/session, cron/scheduler, environments
- **5** 消息协议 — Telegram, Discord, Slack, WhatsApp, Signal (gateway adapters)
- **6** 执行后端 — Local, Docker, SSH, Daytona, Singularity, Modal

Also added a subtitle note clarifying the "three ingress paths" (CLI / Gateway / Cron) and the session policy concept.

## Alignment with Template Benchmark

This brings the Hermes page closer to the `topic-cc-unpacked-zh.html` quality bar by adding:
1. Hero with stats strip (benchmark item #1)
2. Visual density and structural clarity

## Remaining Gap

Still missing from full template compliance:
- T8: Interactive layer explorer
- T9: Cross-page reading-path component
- T10: Template compliance audit script

## Files Modified

- `site/topic-hermes-unpacked.html`
