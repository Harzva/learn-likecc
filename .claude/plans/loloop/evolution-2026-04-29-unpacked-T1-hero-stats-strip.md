# Evolution Note: T1 — DeepScientist Hero Stats Strip

**Date:** 2026-04-29
**Task:** T1. DeepScientist hero stats strip
**File:** `site/topic-deepscientist-unpacked.html`

## What Changed

Added a 4-item stats strip to the DeepScientist unpacked hero section, aligning it with the benchmark `topic-cc-unpacked-zh.html` hero stats pattern.

### Stats Added

| Value | Label | Rationale |
|-------|-------|-----------|
| 6 | 系统层数 | Matches the documented six-layer architecture (01–06) |
| 4 | Stage 流程 | baseline → experiment → analysis → write |
| 4+ | Connector 类型 | Weixin / QQ / Telegram / Feishu (documented in connectors section) |
| 1:1 | Quest = Repo | Core design principle: one repo per quest |

### Implementation Details

- Inserted `<div class="hero-stats">` between `ds-hero-meta` (chips) and `hero-actions`
- Used existing CSS classes: `stat-item`, `stat-value`, `stat-label`
- Added inline style for tighter spacing: `margin-top:18px; margin-bottom:18px; justify-content:center; gap:36px;`
- No new CSS required; inherits from existing `style.css` definitions

### Verification

- File validates as well-formed HTML (unchanged structure around insertion point)
- Stats are responsive via existing `.hero-stats { flex-wrap: wrap }` rule
- Visual hierarchy: badge → title → subtitle → chips → stats → actions → console

## Next

T2: Interactive quest-stage walkthrough (tabbed step-through of baseline → experiment → analysis → write).
