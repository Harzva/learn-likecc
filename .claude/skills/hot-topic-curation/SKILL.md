---
name: hot-topic-curation
description: Use when the task is to build or maintain a repo-local 热门话题/AI日报专项, aggregate multiple public hot-topic sources such as AIbase Daily or RSS feeds, normalize them into a reusable snapshot, route the findings into the best existing site hotspot pages, and keep the hot-topic hub updated over time.
---

# Hot Topic Curation

Use this skill when the task sounds like:

- “做一个 AI 日报 / 热门话题专项”
- “抓几个外部热点站聚合到站内”
- “维护热点源、更新摘要页、顺手路由到对应专题”
- “像 AIbase Daily 那样做一个长期维护的热点聚合页”

This is a project-local editorial + ingestion skill. Prefer repo conventions over generic scraping habits.

## Core Outcome

Produce or maintain a lightweight hot-topic aggregation flow that does all of the following:

1. fetch trusted public source pages or feeds
2. normalize them into a reusable local snapshot
3. keep the hub page updated
4. route worthwhile findings into the right site hotspot or topic pages
5. preserve source links and avoid full-text copying

## Workflow

### 1. Read the source policy first

Before adding a new source, read:

- `references/source-policy.md`
- `references/route-hints.md`

This skill is deliberately conservative:

- prefer RSS / feed endpoints first
- use HTML daily pages when the site exposes a stable public digest page
- keep only title/link/date/one-line note level data in the local snapshot
- never turn this into a full-content mirroring pipeline

### 2. Inspect the current source registry

The canonical source registry is:

- `site/data/hot-topic-sources.json`

It defines which sources are watched, how they are parsed, and which site routes they usually feed.

Do not hardcode a new source directly into prose if it should become a durable maintained source. Add it to the registry first.

### 3. Refresh the local snapshot

Use the repo tool:

```bash
python3 tools/fetch_hot_topic_sources.py --write
```

Useful variants:

```bash
python3 tools/fetch_hot_topic_sources.py --limit 6 --json
python3 tools/fetch_hot_topic_sources.py --config site/data/hot-topic-sources.json --write
```

The default output snapshot is:

- `site/data/hot-topic-snapshot.json`

### 4. Keep the hub page aligned

The hot-topic hub is:

- `site/topic-hot-watch.html`
- `site/md/topic-hot-watch.md`

When the source registry or snapshot meaningfully changes, keep this hub page aligned. The page should explain:

- what kinds of sources are watched
- what is RSS-first vs HTML-digest fallback
- how the snapshot should be read
- which downstream site pages receive routed items

### 5. Route findings into the right topic

Do not keep everything trapped inside the hot-topic hub.

Use `references/route-hints.md` to decide where an item belongs:

- Agent / CLI / workflow news:
  - `site/topic-agent-hot.html`
  - `site/topic-ai-cli-agent.html`
- RAG / retrieval / evaluation:
  - `site/topic-rag-hot.html`
- model releases / API / pricing / infra:
  - `site/topic-llm.html`
  - `site/topic-ai-api.html`
- broader tool discovery:
  - `site/topic-ai-zahuopu.html`
  - `site/topic-toolchain.html`

If one concrete keyword deserves a proper draft, hand it off to:

- `.claude/skills/keyword-site-topic/SKILL.md`

### 6. Leave traceability

The hub and downstream pages should preserve:

- source site name
- original link
- date if available
- why it matters in one line

When summarizing, stay at digest level. This skill is for aggregation, routing, and maintenance, not article plagiarism.

## Editing Targets

Default targets for this skill:

- `site/data/hot-topic-sources.json`
- `site/data/hot-topic-snapshot.json`
- `site/topic-hot-watch.html`
- `site/md/topic-hot-watch.md`
- hotspot pages such as `site/topic-agent-hot.html` or `site/topic-rag-hot.html`

## Validation

After a maintained pass, prefer this sequence:

1. refresh the snapshot
2. update the hub or routed page
3. run:

```bash
python3 tools/refresh_site_topic_metadata.py
python3 tools/check_site_md_parity.py
```

If the loop-task board should reflect a new recurring line, also run:

```bash
python3 tools/build_loop_task_board.py
```
