# VibePaper Hub Plan v1

Status: active  
Scope: keep growing `VibePaper` into a durable hub for autonomous research, paper-production systems, and related subtopics.

## Current focus

- [ ] Strengthen the hub as a comparison surface, not just a collection page
- [ ] Keep `Autoresearch / ARIS` as the lead sample while making room for the next strong candidates
- [ ] Improve the page’s teaching value: control plane, durable state, loop shape, and what to learn
- [ ] Continue Task 6 with the next bounded comparison-surface follow-up after the shell-column sync

## Hub anchors

- [x] Create and maintain the main hub page:
  - `site/topic-vibepaper.html`
  - `site/md/topic-vibepaper.md`
- [x] Bring `Autoresearch / ARIS` into the hub as the first primary sample
- [x] Keep local source anchors for key projects under:
  - `reference/reference_agent/`

## Current sample set

- [x] `Autoresearch / ARIS`
- [x] `DeepScientist`
- [x] `AIDE`
- [x] `AI Scientist-v2`
- [ ] Evaluate whether the next candidate should get:
  - a short card
  - a comparison row
  - or a dedicated subtopic page

## Comparison structure

- [x] Keep the “four questions” framing alive:
  - what shape of system it is
  - where the control plane lives
  - what durable state it keeps
  - what is worth teaching from it
- [x] Tighten the comparison table so rows feel structurally consistent
- [ ] Keep the page useful for future tutorials, not hype summaries

## Growth workflow

- [ ] When a new system looks promising:
  - clone it into `reference/reference_agent/` first
  - read primary sources first
  - then decide whether it belongs in the hub or needs its own subtopic
- [ ] Prefer official repo, official docs, and official paper links over secondary commentary

## Visuals

- [x] Add Mermaid or structure-ready notes where useful
- [ ] Add `[插图提示词]` blocks only where comparison visuals truly help
- [ ] Keep the hub visually readable even as more sample systems are added

## Validation

- [ ] Keep `python3 tools/check_site_md_parity.py` passing after each pass
- [ ] Keep references and local repo anchors present
- [ ] Avoid adding a new sample system without a clear structural reason

## Notes

- Canonical site page: `site/topic-vibepaper.html`
- Canonical markdown mirror: `site/md/topic-vibepaper.md`
- Canonical local source root: `reference/reference_agent/`
