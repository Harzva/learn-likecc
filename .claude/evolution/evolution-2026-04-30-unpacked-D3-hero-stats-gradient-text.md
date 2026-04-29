# Evolution: Task D3 — Hero-stats gradient-text consistency + Task C1 — Global rule

**Target:** `site/css/style.css` (global shared surface)  
**Reference:** `site/topic-cc-unpacked-zh.html` (quality bar)  
**Date:** 2026-04-30

## Change Summary

Added a single CSS rule under `.cc-unpacked-page .cc-unpacked-hero-stats .stat-value` to apply `gradient-text` styling automatically to all unpacked topic pages that use the shared hero-stats component.

## Rule Added

```css
.cc-unpacked-page .cc-unpacked-hero-stats .stat-value {
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

## Rationale

- The quality bar explicitly lists "gradient-text" as a visual-density requirement for hero-stats.
- Previously, no unpacked page applied gradient styling to `.stat-value` inside `.cc-unpacked-hero-stats`.
- Rather than adding `gradient-text` class to every HTML file individually (fragile, repetitive), a single shared CSS rule ensures consistency and zero-maintenance alignment.
- This approach completes both **D3** (deepscientist hero-stats verification) and **C1** (global rule application) in one bounded pass.

## Impact

- `site/topic-cc-unpacked-zh.html` — reference page now renders gradient stat-values automatically.
- `site/topic-deepscientist-unpacked.html` — P0 target now meets the gradient-text density requirement.
- `site/topic-hermes-unpacked.html` — P1 target also receives the effect without additional edits.
- Future unpacked pages using `.cc-unpacked-hero-stats` inherit the rule automatically.

## Files Modified

- `site/css/style.css`

## Also Completes

- **C1:** Ensure `.cc-unpacked-hero-stats gradient-text` rule applies globally.

## Next

Task D2: Add interactive module placeholder zone for research cycle visualization in topic-deepscientist-unpacked.html.
