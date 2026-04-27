# Design/UI Topic Plan v1

Status: active  
Scope: build `Design/UI` into a stable long-running line that covers deck generation, developer slides, programmatic video, and drawing/demo plugin workflows for the site, teaching pages, and media output.

## Current focus

- [x] Create a top-level `Design/UI` hub under `site/topic-design-ui.html`
- [x] Split the line into one tutorial page and one unpacked page
- [x] Clone `LivePPT`, `Remotion`, and `Slidev` into `reference/reference_design_ui/`
- [x] Connect the topic into top navigation and the left sidebar
- [x] Add a first follow-up pass that turns one mature site topic into a concrete `deck / slides / video` workflow comparison
- [x] Add a first plugin-facing pass that maps existing drawing capabilities (`Mermaid / html-card-to-png / screenshot`) onto this Design/UI line

## Main product areas

- [ ] design/ui topic hub
- [ ] tutorial path for creators
- [ ] unpacked comparison path
- [x] drawing and demo plugin line
- [ ] reference-backed workflow recipes
- [ ] future site-to-deck / site-to-slides / site-to-video experiments

## Expected outputs

- [x] one topic hub:
  - `site/topic-design-ui.html`
- [x] one tutorial page:
  - `site/topic-design-ui-tutorial.html`
- [x] one unpacked page:
  - `site/topic-design-ui-unpacked.html`
- [x] one reference shelf:
  - `reference/reference_design_ui/`
- [x] one follow-up bounded pass that demonstrates how an existing site topic could be transformed into:
  - a deck
  - a slide workflow
  - or a programmatic video prototype
- [x] one follow-up bounded pass that defines the drawing/demo plugin lane for future automation

## Validation

- [ ] `node --check site/js/app.js`
- [ ] `python3 tools/refresh_site_topic_metadata.py`
- [ ] `python3 tools/build_loop_task_board.py`
- [ ] `python3 tools/check_site_md_parity.py`

## Notes

- Treat this as a cross-media expression line, not just a frontend aesthetics page.
- Keep the roles distinct:
  - `LivePPT` = deck / fast presentation layer
  - `Slidev` = developer slide system
  - `Remotion` = programmatic motion/video layer
- Favor repo-backed, repeatable workflows over abstract tool reviews.
- The long-term goal is to connect this line back into:
  - site explanation pages
  - slide generation
  - video snippets
  - and drawing/demo plugins used by the broader content pipeline
- 2026-04-13: first bounded follow-up pass selected `topic-cc-unpacked-zh.html` as the initial transformation sample and mapped it into three media shapes: `LivePPT deck`, `Slidev developer slides`, and `Remotion explanation clip`
- 2026-04-13: second bounded follow-up pass fixed the first plugin-line rule set: `Mermaid` for structure, `html-card-to-png` for stronger designed diagrams, `webpage-screenshot-md` for evidence-preserving UI capture, and only then `LivePPT / Slidev / Remotion` for media-shape upgrades
