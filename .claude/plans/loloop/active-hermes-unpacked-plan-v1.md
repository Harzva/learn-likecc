# Hermes Agent Unpacked Plan v1

Status: active  
Scope: keep turning Hermes Agent into a stable 庖丁解牛 / unpacked topic with code-anchored structure, series-consistent voice, and reusable diagrams.

## Current focus

- [ ] Tighten the page so the system split, control plane, and runtime flow read more like a finished 庖丁解牛 chapter
- [x] Add one stronger structure visual path, preferably Mermaid-ready where appropriate
- [ ] Continue Hermes with the next bounded follow-up after the learning-loop Mermaid lands
- [ ] Improve the final “what we can learn for our own stack” closeout

## Anchors

- [x] Create the main topic page:
  - `site/topic-hermes-unpacked.html`
  - `site/md/topic-hermes-unpacked.md`
- [x] Clone the local reference:
  - `reference/reference_agent/hermes-agent/`
- [x] Ground the topic in primary sources:
  - official site
  - official GitHub repo
  - local source clone

## Series consistency

- [x] Keep the tone aligned with existing unpacked pages such as:
  - `site/topic-cc-unpacked-zh.html`
  - `site/topic-superset-unpacked.html`
- [ ] Keep the chapter structure stable:
  - why this system matters
  - how it is split into layers
  - where the control plane lives
  - what is worth learning for our own stack
- [ ] Avoid sliding into generic product summary or market-style copy

## Technical depth

- [x] Add runtime / gateway / session-boundary notes
- [x] Add memory / skills / boundary notes
- [x] Add stack-synthesis notes
- [ ] Make the architecture section easier to scan with clearer code-anchor references
- [ ] Tighten the mapping between Hermes concepts and our own Claude Code / Like Code / codex-loop discussions

## Visuals

- [x] Add Mermaid or structure-ready notes where they help
- [x] Add one stronger final structure diagram path for the page
- [ ] Add or refine `[插图提示词]` blocks only where visual explanation adds real value

## Validation

- [ ] Keep `python3 tools/check_site_md_parity.py` passing after each pass
- [ ] Keep references and original-source links present at the end
- [ ] If the local Hermes clone is stale, refresh it before doing deeper structural claims

## Notes

- Canonical site page: `site/topic-hermes-unpacked.html`
- Canonical markdown mirror: `site/md/topic-hermes-unpacked.md`
- Canonical local source anchor: `reference/reference_agent/hermes-agent/`
