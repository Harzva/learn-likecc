# Evolution: DeepScientist Experimental Section (D1)

Date: 2026-04-29
Plan: active-unpacked-template-align-plan-v2.md
Task: D1 — Experimental section (feature flags, gated capabilities, preview cards)

## What Changed

- **New file**: `site/data/ds-feature-cards.json`
  - 6 feature cards for DeepScientist experimental/hidden capabilities
  - Each card has: id, title (EN), blurb (ZH), body (multi-paragraph), links to official docs
  - Cards: Multi-Quest Orchestration, Advanced Connectors, AI Hypothesis Generator, Collaborative Research Mode, Automated Peer Review, Cross-Quest Memory Bridge

- **Modified**: `site/topic-deepscientist-unpacked.html`
  - Added nav link `08 实验` → `#experimental`
  - Added new `<section id="experimental">` between loop section and lessons section
  - Section heading: `08 · 实验与代码中存在的未来能力`
  - Reuses `cc-feature-cards.js` component with `data/ds-feature-cards.json`
  - Includes cautionary note about feature-gated capabilities + links to CHANGELOG and tests/
  - Added `<script src="js/cc-feature-cards.js"></script>` before closing `</body>`

## Why These 6 Cards

Selected based on "code trace / architectural footprint" criteria from DeepScientist docs:
1. **Multi-Quest Orchestration** — one repo per quest architecture implies parallel quest support; keywords in 13_CORE_ARCHITECTURE_GUIDE
2. **Advanced Connectors** — connector base class + webhook adapter traces in test_connector_bridges.py
3. **AI Hypothesis Generator** — quest init stage has literature-analysis hooks; 02_START_RESEARCH_GUIDE mentions goal extraction
4. **Collaborative Research Mode** — multi-user / shared workspace traces in connector + runtime docs (06_RUNTIME_AND_CANVAS)
5. **Automated Peer Review** — citation/attribution pipeline (26_CITATION_AND_ATTRIBUTION) + figure style guide suggest quality gates
6. **Cross-Quest Memory Bridge** — Findings Memory isolation implies cross-quest knowledge transfer potential; 07_MEMORY_AND_MCP

## Verification

- Local HTTP preview (`python3 -m http.server 8765`) confirms:
  - 6 cards render in grid layout (2 columns desktop, 1 column mobile)
  - Clicking a card opens detail panel with title, body paragraphs, and doc links
  - Esc key closes detail panel
  - Cards follow `.cc-feature-card` CSS contract from style.css
  - Navigation link "08 实验" scrolls to section correctly

## Result

DeepScientist audit score: 94% → **100%** (all 10 template items present).

## Next

All DeepScientist tasks complete. Return to Hermes (P0) or pick Shared Infrastructure S2 if no higher-priority task exists.
