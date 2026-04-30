# Active Unpacked Template Align Plan v2
## Align all *-unpacked topic pages to topic-cc-unpacked-zh.html quality bar

**Reference (Gold Standard):** `site/topic-cc-unpacked-zh.html`
**Quality Dimensions:**
1. Interactive modules (data-driven components, player/treemap)
2. Visual density (hero-stats, hero-badge, gradient-text, chips, console visual)
3. Structure clarity (consistent nav depth, section numbering, attribution block)

**Targets (priority order):**
- P0: `site/topic-deepscientist-unpacked.html` — closest to bar, some custom visual elements
- P1: `site/topic-hermes-unpacked.html` — missing interactive modules, standard hero
- P2: `site/topic-design-ui-unpacked.html` — minimal page, needs most visual density
- P2: `site/topic-everything-claude-code-unpacked.html` — wrong body class, different structure
- Shared: `site/css/style.css` — ensure all new patterns have shared styles

---

## Task Pool

### P0: topic-deepscientist-unpacked.html
- [x] Task D1: Ensure attribution block follows reference pattern (course-quote inside section-block)
- [x] Task D2: Add interactive module placeholder zone (like cc-loop-player) for research cycle visualization
- [x] Task D3: Verify hero-stats use gradient-text class consistently
- [x] Task D4: Check knowledge-map section has treemap-like visual structure or equivalent density (verified: has both ds-arch-treemap + ds-arch-knowledge interactive modules; fixed missing ds-arch-knowledge CSS styles by adding shared rules in style.css)
- [x] Task D5: Ensure section numbering follows 01/02/02B pattern consistently (currently 01/02/02B/03/04/04B/05/05B/06/08/07 — inconsistent order)

### P1: topic-hermes-unpacked.html
- [x] Task H1: Add hero-badge to hero section (already present ✓)
- [x] Task H2: Add hero-stats row with gradient-text values (already present ✓)
- [x] Task H3: Add interactive module placeholder for agent loop visualization (already present: hermes-loop-player + hermes-arch-treemap + hermes-arch-knowledge ✓)
- [x] Task H4: Verify section numbering follows consistent 01/02/02B/03 pattern (fixed: 02C → 02B, nav link "02 图谱" → "02B 图谱")
- [ ] Task H5: Add visual console or chip row below hero-actions for key concepts (optional, reference page does not have this)

### P2: topic-design-ui-unpacked.html
- [x] Task UI1: Add hero-stats row (currently completely missing)
- [x] Task UI2: Add hero-badge with topic label
- [x] Task UI3: Expand hero-subtitle with stronger value proposition
- [ ] Task UI4: Add interactive comparison module (three-column visual with hover states)
- [x] Task UI5: Add section numbering to all sections
- [x] Task UI6: Add knowledge-map or reference-links section at bottom

### P2: topic-everything-claude-code-unpacked.html
- [x] Task E1: Change body class from meta-topic-page to cc-unpacked-page
- [x] Task E2: Add hero-stats row (currently missing)
- [x] Task E3: Add section numbering to main sections
- [ ] Task E4: Add interactive module placeholder for cross-harness comparison
- [x] Task E5: Add attribution block

### Shared: site/css/style.css
- [x] Task C1: Ensure .cc-unpacked-hero-stats gradient-text rule applies globally
- [ ] Task C2: Add .hero-badge visibility rule for all cc-unpacked-page heroes — already visible globally, no extra rule needed
- [x] Task C3: Verify interactive module mount points have consistent min-height (cc-arch-knowledge and ds-arch-knowledge both have min-height via __layout; cc-loop-player has min-height from its own CSS)

---

## Execution Log

| Iteration | Date | Task | Result |
|---|---|---|---|
| 1 | 2026-04-30 | D5 | Fixed section numbering in topic-deepscientist-unpacked.html: reordered nav and body so 07 precedes 08; added missing 03B nav link for quest-walkthrough section | Committed: 80a82f9 |
| 2 | 2026-04-30 | D1 | Replaced ds-two-col + ds-panel attribution layout with course-quote wrapper inside section-block; kept all content and strong-label pattern aligned to reference | Committed: fe0fe0e |
| 3 | 2026-04-30 | D3 | Verified hero-stats gradient-text via global CSS rule under .cc-unpacked-hero-stats .stat-value; applies to all unpacked pages automatically | Committed: 905fc3f |
| 4 | 2026-04-30 | D2 | Added interactive research cycle player to topic-deepscientist-unpacked.html #loop section: created data/ds-research-loop.json (5 steps), js/ds-research-loop-player.js (adapted from hermes-loop-player.js), updated HTML mount point and script tag; section retitled to emphasize loop nature | Committed: 0b3d172 |
| 5 | 2026-04-30 | D4 | Checked knowledge-map section in topic-deepscientist-unpacked.html: verified treemap + knowledge-graph interactive modules present; fixed missing ds-arch-knowledge CSS by adding shared rules paired with cc-arch-knowledge selectors in style.css | Committed: 79fa1d9 |
| 7 | 2026-04-30 | UI1 | Added hero-stats row to topic-design-ui-unpacked.html: 4 stats (3 shells / 6 ladder levels / 4 lessons / 1 criterion), hero-actions with CTAs, subtitle-note; visual density now matches reference | Committed: 2b7e461 |
| 8 | 2026-04-30 | UI5 | Added 01-07 section numbering to topic-design-ui-unpacked.html: updated nav links (01 角色 / 02 LivePPT / 03 Slidev / 04 Remotion / 05 样例映射 / 06 插件梯度 / 07 值得学什么) and all h2 titles to match reference pattern | Committed: cae289d |
| 9 | 2026-04-30 | UI6 | Added reference-links section at bottom of topic-design-ui-unpacked.html: links to LivePPT/Slidev/Remotion official docs + Design/UI专题总页, plus ds-cta next-step hint; aligns with reference page bottom pattern | Committed: b31bf21 |

---

## Evolution Trail
Files in `.claude/evolution/` directory.
