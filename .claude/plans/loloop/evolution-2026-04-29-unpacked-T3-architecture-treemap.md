# Evolution Note: T3 — DeepScientist Architecture Treemap

**Date:** 2026-04-29
**Task:** T3. DeepScientist architecture treemap
**Plan:** active-unpacked-template-align-plan-v2.md

## What was done

Added an interactive D3 treemap to `topic-deepscientist-unpacked.html` that visualizes the 6-layer DeepScientist stack:

1. **Data file**: `site/data/ds-arch-treemap.json`
   - Structured the 6 layers with weighted sub-components:
     - 课题入口层 (input)
     - Quest 仓库层 (repo)
     - 研究控制面 (control)
     - 持久状态层 (state)
     - 可见工作区层 (workspace)
     - 协作与 Connector 层 (connectors)
   - Values represent relative conceptual weight, not file counts.

2. **JS module**: `site/js/ds-arch-treemap.js`
   - Forked from `cc-arch-treemap.js` with adapted colors and labels.
   - Supports click-to-drill-down, breadcrumb navigation, and click-to-copy on leaf nodes.
   - Responsive with ResizeObserver.

3. **HTML integration**: `site/topic-deepscientist-unpacked.html`
   - Added treemap mount point in `#layers` section after the existing Mermaid diagrams.
   - Added descriptive subtitle and caption.
   - Included `ds-arch-treemap.js` in script tags.
   - Added scoped CSS for treemap styling.

## Visual result

The page now shows a color-coded treemap in the "02 · 六层结构" section:
- Large blocks = architecture layers
- Smaller blocks = sub-components within each layer
- Users can click a layer to zoom in, use breadcrumbs to zoom out.

## Files changed

- `site/topic-deepscientist-unpacked.html`
- `site/data/ds-arch-treemap.json` (new)
- `site/js/ds-arch-treemap.js` (new)
- `.claude/plans/loloop/active-unpacked-template-align-plan-v2.md`

## Verification

- All referenced file paths exist.
- Treemap uses D3 from CDN (same as other unpacked pages).
- Responsive and mobile-friendly via CSS.

## Next

T4: DeepScientist connector/tool catalog — pill wall or brick wall for Weixin/QQ/Telegram/Feishu connectors + internal tools.
