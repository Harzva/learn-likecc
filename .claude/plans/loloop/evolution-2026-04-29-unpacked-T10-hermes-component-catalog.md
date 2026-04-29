# Evolution Note: Unpacked Template Align v2 — H5 Hermes Component Catalog

**Date:** 2026-04-29
**Task:** H5 — Hermes component catalog (pill wall)
**Trigger:** cron loop tick

## What was done

Added a `.cc-pill-wall` component catalog to `topic-hermes-unpacked.html` as section `05B · Gateway 适配器与执行后端目录`.

### Files created
- `site/data/hermes-component-catalog.json` — 3 categories, 16 pills total
  - Gateway adapters: Telegram, Discord, Slack, WhatsApp, Signal, QQ (blue)
  - Environment backends: Local, Docker, SSH, Daytona, Singularity, Modal (green)
  - Core entry links: CLI, Gateway, Cron, SessionStore (amber)
- `site/js/hermes-component-wall.js` — pill wall renderer reusing `.cc-pill-wall` CSS contract

### Files modified
- `site/topic-hermes-unpacked.html`
  - Added nav link `#gateway-catalog` between Gateway/Cron and Flows
  - Added `<section id="gateway-catalog">` with mount div and description
  - Added `<script src="js/hermes-component-wall.js">` to footer script block

## Design decisions

- Reused existing `.cc-pill-wall` / `.cc-pill-cat` / `.cc-pill` CSS classes instead of creating new styles. This keeps visual consistency with the `topic-cc-unpacked-zh.html` template benchmark.
- Placed the catalog immediately after `#gateway-cron` (section 05) because it directly visualizes the adapters/backends discussed in that section.
- Did not add interactivity (pills are `<span>`, not `<a>`) because these are descriptive labels, not navigation links.

## Remaining work

- H6: Hermes data table — API surface / protocol / backend comparison table
- D1: DeepScientist experimental section
- S2: Cross-page reading-path component

## Verification

- Local file paths verified before execution.
- Plan file updated: H5 marked `[x]`.
