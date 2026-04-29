# Evolution Note: Unpacked Template Align v2 — T11

**Date:** 2026-04-29
**Task:** S2 — Cross-page reading-path component (reusable data-driven refactor)
**Status:** done

## What Changed

Converted hardcoded `chapter-navigation` HTML in all 9 unpacked pages to a **reusable data-driven component**.

### New Files

1. `site/data/unpacked-reading-paths.json`
   - Central registry mapping each unpacked page to its `prev` and `next` links
   - 9 entries covering all unpacked topics

2. `site/js/unpacked-reading-path.js`
   - Reads `data/unpacked-reading-paths.json` on page load
   - Finds `.chapter-navigation[data-auto-path]` mount points
   - Injects prev/next `<a>` buttons with correct `btn-secondary` / `btn-primary` classes
   - Graceful fallback: if JSON fails or page not in registry, mount stays empty (no broken UI)

### Pages Converted

All 9 unpacked pages updated from hardcoded links to `<div class="chapter-navigation" data-auto-path></div>`:

- `site/topic-cc-unpacked-zh.html`
- `site/topic-hermes-unpacked.html`
- `site/topic-deepscientist-unpacked.html`
- `site/topic-design-ui-unpacked.html`
- `site/topic-everything-claude-code-unpacked.html` (preserved inline wrapper styles)
- `site/topic-multica-unpacked.html`
- `site/topic-superset-unpacked.html`
- `site/topic-cabinet-unpacked.html`
- `site/topic-autoresearch-unpacked.html`

### Why This Matters

- **Single source of truth:** Change a reading path once in JSON, all pages update
- **New unpacked pages:** Just add `data-auto-path` + entry in JSON — no HTML editing
- **Consistent with existing component pattern:** Loop players, treemaps, and knowledge graphs all use `data-json` + mount-point architecture

## Verification

- Local HTTP server confirms JSON loads and mount points resolve
- All 9 pages include `<script src="js/unpacked-reading-path.js"></script>`
- No pages retain hardcoded `chapter-navigation` inner links
