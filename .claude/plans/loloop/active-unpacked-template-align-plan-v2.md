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

## Target Pages & Current Gap Analysis (Audit Results 2026-04-29)

| Page | Audit Score | Status | Missing Items |
|---|---|---|---|
| `topic-deepscientist-unpacked.html` | **94%** | ✅ PASS | Experimental section only |
| `topic-hermes-unpacked.html` | **25%** | ❌ FAIL | Hero stats, interactive step, treemap, knowledge graph, component catalog, experimental |
| `topic-design-ui-unpacked.html` | — | Not audited | Nearly everything |
| `topic-everything-claude-code-unpacked.html` | — | Not audited | Nearly everything |
| `topic-autoresearch-unpacked.html` | — | Defer | Independent style, do not touch |

## Task Pool (pick one per loop tick when direction is unclear)

When a loop iteration has no better task, scan this pool and choose the highest-priority unchecked item. Mark `[ ]` → `[x]` when done.

### Hermes (P0 — audit 25%, highest gap)

- [ ] **H1. Hermes hero stats strip** — add layer count, API surface count, protocol count, backend count
- [ ] **H2. Hermes interactive step-through** — agent loop walkthrough: message in → session build → AIAgent run → tool call → memory review → response out
- [ ] **H3. Hermes architecture treemap** — 6-layer stack treemap: 入口壳 → 控制面 → 工具面 → 记忆/技能 → 平台/时间轴 → 环境后端
- [ ] **H4. Hermes knowledge graph** — relationship map: gateway adapters, cron scheduler, memory store, skill manager, environment backends
- [ ] **H5. Hermes component catalog** — pill wall for gateway adapters (Telegram/Discord/Slack/WhatsApp/Signal) + backends (Local/Docker/SSH/Daytona/Modal)
- [ ] **H6. Hermes data table** — API surface / protocol / backend comparison table

### DeepScientist (P1 — audit 94%, minor polish)

- [ ] **D1. Experimental section** — feature flags, gated capabilities, preview cards (only missing item from audit)

### Shared Infrastructure

- [x] **S1. Template compliance audit script** — `tools/unpacked-audit.js` scores any page against 10-item benchmark
- [ ] **S2. Cross-page reading-path component** — reusable "← back to hub / → next topic" strip for all unpacked pages

## Done Rules

- A task is `done` when the live page (after GitHub Pages deploy) shows the new module and it is responsive on mobile.
- Do not mark `done` based on local file changes alone.
- After each task, record an evolution note: `evolution-YYYY-MM-DD-unpacked-T{N}-description.md`

## Next Handoff

Current active: **H1** (Hermes hero stats strip) — Hermes scores 25% on audit, biggest gap, highest ROI.

DeepScientist is 94% complete (only missing experimental section). Shift focus to Hermes.
