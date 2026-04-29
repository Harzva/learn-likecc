# active-unpacked-template-align-plan-v2.md
# Unpacked Template Alignment Plan v2
# Target quality bar: site/topic-cc-unpacked-zh.html
# Align: interactive modules, visual density, structure clarity

## Alignment Targets

- P0: site/topic-deepscientist-unpacked.html
- P1: site/topic-hermes-unpacked.html
- P2: site/topic-design-ui-unpacked.html
- P2: site/topic-everything-claude-code-unpacked.html
- Shared: site/css/style.css

## Task Pool

### topic-deepscientist-unpacked.html (P0)

- [x] **DS-01**: Switch body class from `deepscientist-page vibe-unpacked-page vibe-unpacked-page--studio` to `cc-unpacked-page` (add `deepscientist-page` as secondary if needed for custom overrides)
- [x] **DS-02**: Replace inline `style="margin-top:18px;margin-bottom:18px;justify-content:center;gap:36px;"` on hero-stats with standard `cc-unpacked-hero-stats` class
- [x] **DS-03**: Add `cc-unpacked-hero-subtitle-note` class to the hero subtitle note paragraph (replace inline style)
- [ ] **DS-04**: Ensure chapter-navigation has proper placement and `data-auto-path` is wired correctly
- [ ] **DS-05**: Audit all `ds-*` custom CSS classes against shared `cc-unpacked-*` equivalents; consolidate where possible
- [ ] **DS-06**: Add missing interactive module slots if content supports them (e.g., tool tiles, command pills if applicable)

### topic-hermes-unpacked.html (P1)

- [ ] **HM-01**: Verify all interactive modules are loading correct data files and rendering
- [ ] **HM-02**: Add `cc-tool-tiles` or equivalent if Hermes has component/tool taxonomy
- [ ] **HM-03**: Add `cc-command-pills` or equivalent if Hermes has CLI/command taxonomy
- [ ] **HM-04**: Ensure hero structure fully matches quality bar (subtitle note placement, actions spacing)

### topic-design-ui-unpacked.html (P2)

- [ ] **DU-01**: Add hero-stats block to hero section for visual density parity
- [ ] **DU-02**: Add at least one interactive module (e.g., feature cards or simple treemap for the three tools)
- [ ] **DU-03**: Restructure body to use `cc-unpacked-page` class
- [ ] **DU-04**: Ensure chapter-navigation is inside `devlog-content` article, not floating after main

### topic-everything-claude-code-unpacked.html (P2)

- [ ] **ECC-01**: Switch body class from `meta-topic-page` to `cc-unpacked-page`
- [ ] **ECC-02**: Restructure hero to use `handbook-hero` with stats and subtitle note
- [ ] **ECC-03**: Move `section--soft` / `quickstart-grid` content into `devlog-main`/`devlog-content` structure
- [ ] **ECC-04**: Add interactive module slots if content supports them
- [ ] **ECC-05**: Fix chapter-navigation placement (currently outside main, should be inside devlog-content)

### Shared style surface (site/css/style.css)

- [ ] **CSS-01**: Add any missing `.cc-unpacked-page` utility classes needed by the alignment
- [ ] **CSS-02**: Ensure `.deepscientist-page` custom styles don't conflict when `cc-unpacked-page` is primary
- [ ] **CSS-03**: Document the unpacked page template contract in a CSS comment block

## Version

- v2.0 - Created 2026-04-30
- Prior loop: none (first iteration)
