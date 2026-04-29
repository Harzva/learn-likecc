# Evolution Note: Unpacked Template Align v2 — T5

**Date:** 2026-04-29
**Task:** T5 — DeepScientist knowledge graph (network diagram showing how layers connect)
**Status:** done

## What was done

Added the knowledge graph / network diagram module to `topic-deepscientist-unpacked.html`:

1. **HTML section** inserted after the Treemap in the "02 · 六层结构" block:
   - Section title: "六层架构知识图谱（层间联系）"
   - Explanation text: Treemap shows scale, knowledge graph shows relationships
   - Mount point: `<div id="ds-arch-knowledge-mount" data-json="data/ds-arch-knowledge.json">`
   - Nav link added: "02B 图谱"

2. **CSS styles** appended to `css/style.css`:
   - Full `.ds-arch-knowledge*` component styles (adapted from `.cc-arch-knowledge*`)
   - Responsive layout, legend, detail panel, link styling, node hover states

3. **Script tag** added to footer: `<script src="js/ds-arch-knowledge.js"></script>`

4. **Verification**: Browser screenshot confirmed the D3 force-directed graph renders with:
   - 6 category nodes (colored by layer)
   - 20+ component nodes
   - Contains links (dashed) and cross-layer links (solid)
   - Interactive: click to focus, mode switcher (hybrid/contains/cross)

## Existing assets reused

- `data/ds-arch-knowledge.json` — already contained full node/link data for all 6 layers
- `js/ds-arch-knowledge.js` — already implemented D3 renderer, only needed CSS + mount point

## Gap closed

Template benchmark item #5 (Knowledge graph / network diagram) is now present on the DeepScientist unpacked page.

## Next

T6: DeepScientist data table — stage-to-asset mapping table with links to reference docs.
