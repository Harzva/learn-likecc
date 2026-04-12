# Hot Topic Watch Plan v1

Status: active  
Scope: build and maintain a site-level 热门话题专项 that aggregates AIbase Daily-like pages plus RSS-friendly sources, keeps a local source snapshot, and routes worthwhile items into the right hotspot or long-form pages.

## Current focus

- [x] Create a dedicated hot-topic source registry under `site/data/`
- [x] Add a reusable fetch script that can read multiple source types and write one local snapshot
- [x] Create the first site-facing hot-topic hub page and Markdown mirror
- [x] Link the new hub back into `AI杂货铺`
- [x] Refresh the existing Agent / RAG hotspot copy so it points to the repo-local hot-topic workflow instead of the old placeholder skill path
- [x] Expand the source roster carefully beyond the first two trusted examples
- [x] Route one fresh fetched item into a downstream hotspot or long-form topic as the first bounded editorial follow-up

## Source classes

- [x] AIbase Daily-style public digest pages
- [x] RSS / Atom feeds
- [ ] additional public category pages with stable list structure
- [ ] browser-gated sources only if a dedicated workflow already exists

## Main outputs

- [x] `site/data/hot-topic-sources.json`
- [x] `site/data/hot-topic-snapshot.json`
- [x] `site/topic-hot-watch.html`
- [x] `site/md/topic-hot-watch.md`
- [x] `.claude/skills/hot-topic-curation/`
- [x] one downstream routed hotspot update from a newly fetched item
- [x] one stronger source-policy refinement after more real usage

## Route targets

- [x] `site/topic-agent-hot.html`
- [x] `site/topic-rag-hot.html`
- [x] `site/topic-ai-zahuopu.html`
- [x] `site/topic-toolchain.html`
- [ ] `site/topic-llm.html`

## Validation

- [x] `python3 tools/fetch_hot_topic_sources.py --write`
- [x] `python3 tools/refresh_site_topic_metadata.py`
- [x] `python3 tools/build_loop_task_board.py`
- [x] `python3 tools/check_site_md_parity.py`

## Notes

- This plan is the canonical checklist for the hot-topic intake layer.
- Keep `prompt.md` short and keep the operational detail here.
- The hot-topic hub is an intake + routing surface, not the final destination for every item.
- 2026-04-12: first bounded downstream route landed on `site/topic-agent-hot.html` by taking `Build Agents That Don't Fail in Production` from the local snapshot and turning it into a real curated entry instead of leaving it stranded inside the intake layer
- 2026-04-12: source roster now also includes `Hugging Face Blog` via `https://huggingface.co/blog/feed.xml`; this gives the intake layer a stable official-blog RSS lane for model / embedding / infra / agent-adjacent ecosystem items
- 2026-04-12: source policy now explicitly separates three lanes after real usage: discovery digest, independent RSS commentary, and official product / ecosystem blog RSS
- 2026-04-12: second bounded downstream route landed on `site/topic-toolchain.html` by taking `Safetensors is Joining the PyTorch Foundation` from the Hugging Face Blog snapshot and treating it as a long-lived toolchain / infra signal instead of leaving it stranded in the intake hub
