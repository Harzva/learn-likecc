# Active Plan: Unpacked Template Align v2

Status: active
Started: 2026-04-29
Replaces: active-unpacked-topic-beauty-loop-v1.md (completed)

## Scope

Use `topic-cc-unpacked-zh.html` as the canonical quality bar for all structure-oriented `*-unpacked` topics. Bring each target page up to comparable visual density, interactive module coverage, and structural clarity.

When the loop daemon does not know what to optimize next, it picks one unchecked item from this plan's **Task Pool** below.

## Template Benchmark (topic-cc-unpacked-zh.html)

A full-quality unpacked page contains:

1. **Hero with stats strip** — key metrics (files, lines, tools, courses)
2. **Reference & version anchoring** — attribution block with commit/date anchors
3. **Interactive step-through** — e.g. main-loop walkthrough with tabs, playback, keyboard nav
4. **Visual architecture map** — Treemap or equivalent hierarchical explorer
5. **Knowledge graph / network diagram** — relationship view supplementing the hierarchy
6. **Categorized component catalog** — tool brick wall, command pill wall, or feature card grid
7. **Data tables** — summary tables linking back to course lessons
8. **Experimental / advanced section** — feature flags, gated capabilities, preview cards
9. **Cross-links & reading paths** — explicit next/prev and related-topic navigation
10. **Footer with provenance** — markdown source link, update date, hit counter

Not every topic needs all 10. The rule is: pick the subset that best explains *this* system's structure.

## Target Pages & Current Gap Analysis

| Page | Current State | Missing Modules | Priority |
|---|---|---|---|
| `topic-deepscientist-unpacked.html` | Text + static diagrams + image gallery | Interactive quest-stage walkthrough, architecture treemap, tool/connector catalog, stats strip | **P0** — user explicitly requested |
| `topic-hermes-unpacked.html` | Text + mermaid diagrams | Interactive layer explorer, stats strip, command/API catalog | **P1** — active in other plans |
| `topic-design-ui-unpacked.html` | Basic layout | Nearly everything; lowest maturity | **P2** |
| `topic-everything-claude-code-unpacked.html` | Basic layout | Nearly everything | **P2** |
| `topic-autoresearch-unpacked.html` | Has independent protocol visual system | Keep its own style; do not force template | **Defer** — do not touch unless user asks |

## Task Pool (pick one per loop tick when direction is unclear)

When a loop iteration has no better task, scan this pool and choose the highest-priority unchecked item. Mark `[ ]` → `[x]` when done.

- [x] **T1. DeepScientist hero stats strip** — add quest count, connector types, stage count, repo metrics
- [x] **T2. DeepScientist interactive quest-stage walkthrough** — tabbed or step-through baseline → experiment → analysis → write
- [x] **T3. DeepScientist architecture treemap** — layered view of the 6-layer stack (Quest Repo, Control Plane, Durable State, Workspace, Connectors)
- [x] **T4. DeepScientist connector/tool catalog** — pill wall or brick wall for Weixin/QQ/Telegram/Feishu connectors + internal tools
- [x] **T5. DeepScientist knowledge graph** — network diagram showing how layers connect
- [ ] **T6. DeepScientist data table** — stage-to-asset mapping table with links to reference docs
- [ ] **T7. Hermes stats strip & hero alignment** — add layer count, API surface count, protocol count
- [ ] **T8. Hermes interactive layer explorer** — expandable layer cards with sub-component breakdown
- [ ] **T9. Cross-page reading-path component** — reusable "← back to hub / → next topic" strip for all unpacked pages
- [ ] **T10. Template compliance audit script** — a one-page checklist or script that scores any unpacked page against the 10-item benchmark

## Done Rules

- A task is `done` when the live page (after GitHub Pages deploy) shows the new module and it is responsive on mobile.
- Do not mark `done` based on local file changes alone.
- After each task, record an evolution note: `evolution-YYYY-MM-DD-unpacked-T{N}-description.md`

## Next Handoff

Current active: **T6** (DeepScientist data table) — stage-to-asset mapping table with links to reference docs.
