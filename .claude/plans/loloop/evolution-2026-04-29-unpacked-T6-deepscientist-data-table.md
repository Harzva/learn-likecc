# Evolution Note: T6 — DeepScientist Data Table

**Date:** 2026-04-29
**Task:** T6 — DeepScientist data table (stage-to-asset mapping table with links to reference docs)
**Page:** `site/topic-deepscientist-unpacked.html`

## What was added

- New section **04B · Stage 与资产映射表** (`#stage-assets`) inserted between section 04 (Quest State) and section 05 (Surfaces).
- A 4-column data table mapping each of the 4 research stages to:
  - **核心资产** — directory and file artifacts produced in that stage
  - **参考文档** — links to DeepScientist official docs (GitHub blob URLs)
  - **关键控制点** — the critical quality gate for that stage
- Nav link added: `04B 资产映射` between `04 Quest 状态` and `05 界面与连接器`.

## Table contents

| 阶段 | 核心资产 | 参考文档 | 关键控制点 |
|---|---|---|---|
| Quest 初始化 | `quest/`, `README.quest.md`, 初始状态文件 | 02_START_RESEARCH_GUIDE, 00_QUICK_START | one repo per quest |
| Baseline 复现 | `baseline/`, 指标日志, 依赖锁定 | 12_GUIDED_WORKFLOW_TOUR, 13_CORE_ARCHITECTURE | baseline 必须可复现 |
| Experiment 轮次 | `experiments/`, 每轮参数与结果, 失败记录 | 12_GUIDED_WORKFLOW_TOUR, 06_RUNTIME_AND_CANVAS, 07_MEMORY_AND_MCP | Findings Memory 自动沉淀 |
| Analysis / Write | `figures/`, `reports/`, `paper_draft.md` | 12_GUIDED_WORKFLOW_TOUR, 08_FIGURE_STYLE_GUIDE, 26_CITATION | human takeover anytime |

## Design choices

- Used `.ds-compare-table` class for visual consistency with the existing comparison table in section 06 (Autoresearch vs DeepScientist).
- All doc links point to `ResearAI/DeepScientist` GitHub blob URLs with `target="_blank" rel="noopener noreferrer"` for safety.
- Kept the same two-column layout structure as other sections, but replaced the right panel with a full-width table since tables need horizontal space.
- Table fits within the `container--layout-wide` article width.

## Verification

- File paths verified: `site/topic-deepscientist-unpacked.html` exists and is writable.
- All linked GitHub URLs use confirmed paths from the DeepScientist docs directory.
- Responsive behavior: `.ds-compare-table` uses standard cell padding and collapse; should scroll horizontally on very narrow viewports via normal table overflow.

## Next task

T7 — Hermes stats strip & hero alignment.
