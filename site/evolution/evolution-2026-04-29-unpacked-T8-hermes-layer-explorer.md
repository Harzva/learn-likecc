# Evolution Note: T8 — Hermes Interactive Layer Explorer

**Date:** 2026-04-29
**Task:** T8 — Hermes interactive layer explorer (expandable layer cards with sub-component breakdown)
**Scope:** site/topic-hermes-unpacked.html

## What Changed

Replaced the static six-layer table in the `#layers` section with an interactive accordion-style layer explorer (`hermes-layer-explorer`).

### Component Structure
- Six expandable accordion items, one per architecture layer:
  1. **入口壳** (🚪) — CLI / Gateway adapters
  2. **控制面** (🧠) — AIAgent, prompt builder, provider, tool handler
  3. **工具执行面** (🧰) — Tool registry, model tools, terminal tool, delegate tool
  4. **长期记忆层** (💾) — MemoryStore, memory manager, nudges, background review
  5. **技能层** (🎓) — Skills surface, skill manager, learning loop
  6. **平台与时间轴** (🌐) — Gateway session, cron scheduler, environment backends

### Interaction Model
- Click header to expand/collapse layer card
- Expanding one card auto-collapses others (exclusive mode)
- Each card reveals sub-component breakdown with code anchors and bullet lists
- Uses existing `.features-accordion` CSS from `css/style.css`
- Added inline accordion script scoped to `.hermes-layer-explorer`

### Stats Preserved
- Existing hero stats strip (T7) left untouched: 6 layers, 10+ APIs, 5 protocols, 6 backends
- Page updated timestamp bumped to 2026-04-29

## Verification
- [x] File paths referenced in task exist
- [x] Module renders in local preview
- [x] Responsive on mobile (max-width container, existing CSS)
- [x] No broken navigation links

## Next
T9: Cross-page reading-path component — add reusable "← back to hub / → next topic" strip to all unpacked pages.
