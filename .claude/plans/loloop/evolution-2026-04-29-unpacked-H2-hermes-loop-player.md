# Evolution Note — Unpacked Template Align Loop

**Date:** 2026-04-29
**Topic:** Hermes Agent unpacked page
**Task:** H2 — Hermes interactive step-through

## What changed

Added a 6-step interactive loop player to `site/topic-hermes-unpacked.html` (section 02B · Agent 循环步进).

### New files
- `site/data/hermes-loop-steps.json` — step data (message in → session build → AIAgent run → tool call → memory review → response out)
- `site/js/hermes-loop-player.js` — player logic adapted from cc-loop-player.js

### Modified files
- `site/topic-hermes-unpacked.html` — added section #agent-loop with player mount point + script tag

### UI/UX contract
- Step tabs (clickable)
- Play/pause with autoplay loop
- Speed control (0.5× / 1× / 2×)
- Keyboard nav (← → Space)
- Progress bar countdown
- Terminal preview panel
- Card with 关键点 / 别误会 / 源码抓手

## Verification
- Local preview confirmed player renders and steps are navigable
- Responsive layout inherits existing CSS

## Next
- H3: Hermes architecture treemap (6-layer stack)
