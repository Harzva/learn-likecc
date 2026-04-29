# Evolution Log: Task UI1 — topic-design-ui-unpacked.html hero-stats

## What changed
Added `.hero-stats.cc-unpacked-hero-stats` row to `topic-design-ui-unpacked.html`, matching the reference pattern from `topic-cc-unpacked-zh.html` and `topic-hermes-unpacked.html`.

### Stats chosen (content-native)
| Value | Label | Rationale |
|---|---|---|
| 3 | 表达壳层 | LivePPT / Slidev / Remotion — the three shells the page deconstructs |
| 6 | 插件梯度层级 | Mermaid → html-card-to-png → screenshot → LivePPT → Slidev → Remotion |
| 4 | 核心学习要点 | The four lessons in the #lessons section |
| 1 | 判断标准：哪种更适合 | The page's central thesis: not "which is fuller" but "which fits the goal" |

### Structure added
- `hero-stats` grid (4 columns) inside `.hero-content`
- `.cc-unpacked-hero-subtitle-note` below stats for the key framing sentence
- `hero-actions` with primary CTA to #roles and secondary to topic-design-ui.html

## Verification
- [x] Local server render check: stats visible, gradient-text applied via shared CSS rule `.cc-unpacked-hero-stats .stat-value`
- [x] Mobile layout: flex-wrap keeps readable on narrow viewport
- [x] Commit: 2b7e461, pushed to main

## Delta from reference
No gaps. The page now has the same hero density pattern as P0/P1 targets.

## Next task (from plan pool)
Task UI2: Add hero-badge with topic label — currently has a basic badge, may need alignment pass.
