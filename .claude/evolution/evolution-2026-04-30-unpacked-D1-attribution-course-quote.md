# Evolution: Task D1 — Attribution block pattern alignment

**Target:** `site/topic-deepscientist-unpacked.html`  
**Reference:** `site/topic-cc-unpacked-zh.html`  
**Date:** 2026-04-30

## Change Summary

Replaced the custom `ds-two-col` + `ds-panel` layout in the `#attribution` section with the reference-standard `course-quote` wrapper pattern.

## Before

```html
<section id="attribution" class="section-block">
  <h2 class="ds-section-title">参考来源与版本锚定</h2>
  <div class="ds-two-col">
    <div>
      <p><strong>本页目标</strong>...</p>
      <p><strong>官方来源</strong>...</p>
      <p><strong>本地锚点</strong>...</p>
    </div>
    <div class="ds-panel">
      <h3>读法提醒</h3>
      <p>...</p>
    </div>
  </div>
</section>
```

## After

```html
<section id="attribution" class="section-block">
  <h2 class="ds-section-title">参考来源与版本锚定</h2>
  <div class="course-quote">
    <p><strong>本页目标</strong>...</p>
    <p><strong>官方来源</strong>...</p>
    <p><strong>本地锚点</strong>...</p>
    <p><strong>读法提醒</strong>...</p>
  </div>
</section>
```

## Rationale

- The reference page uses `course-quote` as a consistent attribution wrapper across all unpacked topic pages.
- The `ds-panel` sidebar was visually distinct but structurally inconsistent with the gold standard.
- The "读法提醒" content was preserved as a fourth `<p><strong>读法提醒</strong>...</p>` item within `course-quote`, maintaining the `<strong>label</strong>content` pattern used in the reference.
- All hyperlinks and `<code>` references remain intact.

## Files Modified

- `site/topic-deepscientist-unpacked.html`

## Next

Task D2: Add interactive module placeholder zone for research cycle visualization.
