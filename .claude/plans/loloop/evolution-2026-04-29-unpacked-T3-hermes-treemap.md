# Evolution Note — 2026-04-29 — Unpacked T3

## Task
H3: Hermes architecture treemap — 6-layer stack treemap: 入口壳 → 控制面 → 工具面 → 记忆/技能 → 平台/时间轴 → 环境后端

## What Changed

### New Files
- `site/data/hermes-arch-treemap.json` — Treemap data (6 layers, weighted by sub-module count)
- `site/js/hermes-arch-treemap.js` — Treemap renderer (cloned from cc-arch-treemap, customized for Hermes)

### Modified Files
- `site/topic-hermes-unpacked.html`
  - Inserted `#hermes-arch-treemap-mount` + description paragraph inside `#layers` section
  - Added `<script src="js/hermes-arch-treemap.js"></script>` before the inline accordion script

## Design Decisions
- **Placement**: Treemap sits above the existing `features-accordion` in `#layers`; accordion remains as the drill-down text detail.
- **Data**: Used estimated module weights (not file counts) since we don’t have a live Hermes source mirror. Values reflect relative complexity described in the accordion content.
- **Colors**: New 6-color palette mapped to Hermes categories (entry_shell, control_plane, tool_surface, memory_skills, platform_timeline, env_backend).

## Verification
- Local preview via `python3 -m http.server 8888` in `site/`
- Browser screenshot confirmed treemap renders with 6 top-level blocks, breadcrumb navigation, and legend.

## Next
H4: Hermes knowledge graph (relationship map) or H5: component catalog (pill wall).
