# Evolution Note: Unpacked Template Align — Hermes Data Table

**Date:** 2026-04-29
**Task:** H6 — API surface / protocol / backend comparison table
**Plan:** active-unpacked-template-align-plan-v2.md

## What Changed

Added `05C · API 面 / 协议 / 后端 对照表` section to `site/topic-hermes-unpacked.html`.

### Table Structure

8-row comparison table (`<table class="options-table">`) mapping Hermes core components to:
- Protocol / platform coverage (Telegram/Discord/Slack/WhatsApp/Signal/QQ)
- Execution backend availability (Local/Docker/SSH/Daytona/Singularity/Modal)
- Core responsibility one-liner

### Rows Covered

1. `AIAgent` kernel — main loop, inference, tool dispatch
2. `gateway/run.py` + `gateway/session.py` — ingress, session identity, delivery
3. `cron/scheduler.py` — time-triggered agent tasks
4. `tools/terminal_tool.py` — unified terminal interface, backend selector
5. `tools/memory_tool.py` — cross-session persistence, FTS5 search
6. `tools/skills_tool.py` — skill creation, self-improvement
7. `tools/delegate_tool.py` — subagent delegation, parallel workstreams
8. `tools/registry.py` — tool discovery, dispatch, toolset management

### Key Design Decision

Gateway adapters do NOT directly bind execution backends. They handle ingress, session keying, and delivery routing only. The actual backend execution happens at the `AIAgent` kernel and `terminal_tool` layer. This separation is made explicit in the table to avoid the common misreading that "more platform adapters = more execution surface."

### Navigation Update

Added `05C API 对照` nav link in the top navbar, between `05B 适配器目录` and `06 运行链路`.

## Verification

- Local HTTP preview (port 8888) confirms table renders correctly
- Responsive check: table scrolls horizontally on narrow viewports via `.options-table` CSS contract
- No new JS or data files needed — pure HTML table reusing existing `.options-table` styles

## Next

Hermes P0 items are now complete (H1–H6). Remaining gaps:
- Hermes experimental section (optional, not in current audit gap)
- DeepScientist D1 (experimental section) — P1
- Shared S2 (cross-page reading-path component) — infrastructure

## Files Modified

- `site/topic-hermes-unpacked.html`
