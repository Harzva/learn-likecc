# Unpacked Template Align — Iteration 5+6
**Date:** 2026-04-30
**Tasks:** D4 + H4

## D4: topic-deepscientist-unpacked.html knowledge-map visual structure
- Verified: section has both `ds-arch-treemap-mount` and `ds-arch-knowledge-mount`
- Verified: data files (`ds-arch-treemap.json`, `ds-arch-knowledge.json`) and JS modules (`ds-arch-treemap.js`, `ds-arch-knowledge.js`) present
- **Fixed:** `ds-arch-knowledge` CSS selectors were entirely missing from `style.css`; added by pairing all `.cc-arch-knowledge` selectors with `.ds-arch-knowledge` counterparts via sed batch replacement
- Result: DeepScientist knowledge graph now renders with same visual density as reference (gradient background, toolbar, layout grid, canvas SVG, legend, detail panel, chips)

## H4: topic-hermes-unpacked.html section numbering consistency
- **Fixed:** knowledge-map section title `02C · 架构关系图谱` → `02B · 架构关系图谱` to align with reference pattern (02/02B)
- **Fixed:** nav link `02 图谱` → `02B 图谱` to match section numbering
- Confirmed: H1 (hero-badge), H2 (hero-stats), H3 (interactive modules: hermes-loop-player + hermes-arch-treemap + hermes-arch-knowledge) already present and functional

## Files touched
- `site/css/style.css` — added 43 `.ds-arch-knowledge` selector rules
- `site/topic-hermes-unpacked.html` — section + nav numbering fix
- `.claude/plans/loloop/active-unpacked-template-align-plan-v2.md` — progress log update

## Commit
`79fa1d9`
