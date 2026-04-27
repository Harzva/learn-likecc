# Claude Official Resources Plan v1

Status: active  
Scope: grow a stable tutorial-side subtopic for Claude official resources translation, covering `tutorials`, `use-cases`, and `Anthropic Engineering`, with image-preserving article translation and site-facing routing.

## Current focus

- [x] Create a tutorial-side hub for official resources translation
- [x] Preserve overview screenshots for the three source lanes
- [x] Add the hub into the tutorial page and the left sidebar
- [ ] Open the first engineering-article translation page
- [ ] Define the first `tutorials / use-cases / engineering` routing rules back into existing site topics

## Main product areas

- [ ] official resource hub page
- [ ] screenshot-preserving translation lane
- [ ] engineering article translation queue
- [ ] tutorial-side entry and discoverability
- [ ] site routing back into existing topics

## Expected outputs

- [x] one hub page:
  - `site/topic-claude-official-resources.html`
- [x] one maintenance rule file:
  - `docs/topic-claude-official-resources-rule.md`
- [x] one screenshot shelf:
  - `site/images/claude-official-resources/`
- [x] one tutorial-side entry:
  - `site/tutorial.html`
- [x] one sidebar entry:
  - `site/js/app.js`
- [ ] one first translated engineering article page
- [ ] one follow-up pass that chooses which `use-cases` deserve standalone site pages

## Validation

- [ ] `node --check site/js/app.js`
- [ ] `python3 tools/refresh_site_topic_metadata.py`
- [ ] `python3 tools/build_loop_task_board.py`
- [ ] `python3 tools/check_site_md_parity.py`

## Notes

- Treat `engineering` as the main high-value translation lane.
- Treat `tutorials` as product-facing supplements to `tutorial.html`.
- Treat `use-cases` as a scenario library to be routed selectively, not blindly translated as a whole shelf.
- Keep image retention mandatory for single-article translations.
