# Evolution: UI3 — Expand hero-subtitle with stronger value proposition

## Date
2026-04-30

## Target
`site/topic-design-ui-unpacked.html`

## Task
Task UI3: Expand hero-subtitle with stronger value proposition

## Changes
- Replaced short hero-subtitle with a longer, structurally richer value proposition.
- New subtitle follows the reference pattern (topic-cc-unpacked-zh.html):
  - Uses `<code>` tags for tool names (LivePPT, Slidev, Remotion)
  - Uses `<strong>` tags for key concepts (different expression layers: deck / slides / video)
  - Has a progression structure: from content-to-deck → developer slides system → programmatic video engine
  - Ends with a clear decision heuristic: "先拆清角色，再决定场景该用哪条工具链"
- Kept existing `.cc-unpacked-hero-subtitle-note` untouched.

## Before
```html
<p class="hero-subtitle">
    `LivePPT`、`Slidev`、`Remotion` 都在解决"怎样讲清楚一件事"，但它们不是同一层工具。最值得做的不是列功能，而是先拆角色。
</p>
```

## After
```html
<p class="hero-subtitle">
    <code>LivePPT</code>、<code>Slidev</code>、<code>Remotion</code> 都在解决"怎样讲清楚一件事"，但它们处于<strong>不同表达层级</strong>：从<strong>内容变 deck</strong>到<strong>开发者讲义系统</strong>再到<strong>程序化视频引擎</strong>——先拆清角色，再决定场景该用哪条工具链。
</p>
```

## Side note
Task UI2 (Add hero-badge with topic label) was already physically present in the HTML but unchecked in the plan. Verified hero-badge structure matches reference exactly; marked complete in plan.

## Commit
TBD
