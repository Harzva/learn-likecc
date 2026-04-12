# Hot Topic Source Policy

## Purpose

This skill maintains a lightweight “hot-topic wire”, not a mirror site.

The goal is:

- discover high-signal external items quickly
- preserve title/link/date-level evidence
- route items to the right site pages
- keep long-form interpretation separate

## Preferred Source Order

1. official RSS / Atom feed
2. stable public daily digest page
3. stable public category page with obvious list entries
4. browser-gated or anti-bot pages only when a dedicated scraping workflow already exists

Prefer feed-style sources whenever possible.

## What to Store Locally

Safe local snapshot fields:

- source label
- source URL
- item title
- item link
- item date
- short description or one-line note

Do not store full copied article bodies by default.

## Source Classes

### RSS / Atom

Best choice for long-term maintenance.

Examples:

- Substack feeds
- blog feeds
- project release feeds

### HTML Daily Digest

Use when a site exposes one stable public page that already aggregates a day's hot items.

Examples:

- AIbase Daily-like pages

These pages are useful because they reduce discovery cost, but they still need routing and filtering.

## Lane-specific Handling

After the first real downstream route and the first official-blog expansion, the intake layer now has three practical lanes:

| Lane | Example | Best use | Common route targets | Main caution |
| --- | --- | --- | --- | --- |
| public digest | AIbase AI日报 | fast discovery and broad domestic product / platform scanning | `topic-hot-watch`, `topic-ai-zahuopu`, `topic-agent-hot`, `topic-llm` | do not confuse a digest hit with a finished teaching angle |
| independent RSS blog | Daily Dose of Data Science | stable engineering commentary, agent / RAG / workflow articles | `topic-agent-hot`, `topic-rag-hot` | quality is high, but it is still commentary rather than a primary-source release log |
| official product / ecosystem blog RSS | Hugging Face Blog | model releases, embeddings / rerankers, infra, ecosystem shifts | `topic-toolchain`, `topic-llm`, `topic-rag-hot` | keep it as a primary-source lane, but do not let one vendor blog dominate the whole intake board |

The point is not to flatten all RSS into one bucket.  
Each lane has a different editorial role and a different best downstream destination.

## Routing Principle

The hot-topic hub is not the final destination for every item.

Use the hub as:

- intake
- triage
- source registry
- route map

Then promote important items into:

- `topic-agent-hot`
- `topic-rag-hot`
- `topic-ai-zahuopu`
- `topic-toolchain`
- `topic-llm`
- or a dedicated long-form topic

## Editorial Guardrails

- summarize, do not republish
- preserve source attribution
- prefer official / primary links when promoting an item downstream
- do not over-automate route decisions without human sanity checks for new source types
- keep source-lane balance visible: discovery digests, independent blogs, and official blogs should complement each other instead of collapsing into one noisy stream
