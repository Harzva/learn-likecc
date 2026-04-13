# Paper Reading Topic Plan v1

Status: active  
Scope: grow the site-level paper-reading line into a reusable hub for paper shelves, per-paper analysis pages, screenshot previews, and future topic-specific paper clusters.

## Current focus

- [x] Upgrade `topic-agent-papers.html` from a placeholder into a real paper-reading hub
- [x] Download the first four `Agent Skills` papers into `reference/reference_paper/agent-skills-papers/`
- [x] Extract first-page preview screenshots for each paper
- [x] Create one analysis page per paper for the first four papers
- [ ] Add the first site navigation / topic-hub linkage pass so the paper-reading line is easier to discover outside the Agent topic
- [ ] Define the next paper cluster after `Agent Skills` and decide whether it belongs under Agent, AI-Scientist, RAG, or a new paper sub-hub

## Main product areas

- [ ] paper-reading hub page
- [ ] local paper shelf and PDF references
- [ ] screenshot-first paper previews
- [ ] per-paper analysis pages
- [ ] future topic-specific paper clusters
- [ ] screenshot / diagram / zhihu adaptation opportunities

## Expected outputs

- [x] one upgraded hub page:
  - `site/topic-agent-papers.html`
- [x] four first-wave paper analysis pages:
  - `site/topic-paper-agent-skills-architecture.html`
  - `site/topic-paper-agent-skills-data-driven.html`
  - `site/topic-paper-malicious-agent-skills.html`
  - `site/topic-paper-sage-skill-library.html`
- [x] one local paper shelf:
  - `reference/reference_paper/agent-skills-papers/`
- [x] one screenshot shelf:
  - `site/images/paper-reading/`
- [ ] one follow-up pass that improves discoverability from the site-wide navigation and related topic hubs
- [ ] one follow-up pass that selects the next paper cluster and opens the next shelf

## Validation

- [ ] `python3 tools/refresh_site_topic_metadata.py`
- [ ] `python3 tools/build_loop_task_board.py`
- [ ] `python3 tools/check_site_md_parity.py`

## Notes

- Keep the first wave narrow and coherent; `Agent Skills` is the first shelf because it directly connects to the site's existing skills / loop / workspace / managed-agent lines.
- Prefer primary paper PDFs plus screenshot previews, not only secondary article summaries.
- Treat paper-reading pages as explainers with strong mapping back to existing site topics rather than isolated summaries.
