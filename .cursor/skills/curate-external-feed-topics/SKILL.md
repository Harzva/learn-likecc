---
name: curate-external-feed-topics
description: >-
  Curates foreign tech blogs (e.g. Daily Dose of Data Science Substack) via RSS,
  classifies items into learn-likecc RAG vs Agent “技术热点” sub-topics, drafts
  Chinese summaries with attribution, and appends rows to the site HTML tables.
  Use when the user asks to ingest Daily Dose of DS, Substack feeds, auto-fetch
  hot topics, translate articles for topic-rag-hot or topic-agent-hot, or refresh
  external curated content for the course site.
---

# Curate external feeds into RAG / Agent 热点专题

## Preconditions

1. Read [reference.md](reference.md) for the target site’s **RSS URL**, **robots.txt** notes, and RAG vs Agent routing hints.
2. Confirm the user wants **summaries + links** (recommended) rather than republishing full translated articles (copyright risk).

## Workflow

### 1) Fetch latest items (no extra deps)

```bash
python3 tools/fetch_substack_rss.py --url https://blog.dailydoseofds.com/feed --limit 25 --json
```

Use another `--url` for a different Substack or any RSS 2.0 feed.

### 2) Filter & classify

- Drop duplicates (same `link`).
- Assign each item to **`site/topic-rag-hot.html`** or **`site/topic-agent-hot.html`** using the keyword heuristic in [reference.md](reference.md). If both apply, pick the stronger match or ask the user once.

### 3) Translate & summarize for the table

For each selected item, produce:

- **中文标题**：忠实意译，可加括号标注原文关键术语。
- **一句话摘要**：1–2 句中文，避免大段照搬。
- **标签**：如 `Agent` / `RAG` / `工程` / `训练` 等简短词。

Always keep the **原文链接** (`link` from RSS).

### 4) Patch the site

Append a `<tr>` block inside the `<tbody>` of the target page’s curated table. Match existing columns:

- 日期（可用 RSS `pubDate` 转短日期或 `—` 若不可靠）
- 中文标题 / 摘要
- 原文
- 归档（`RAG 技术热点` 或 `Agent 技术热点`）

Add a footnote line if the batch is large: “本期条目来自 RSS 抓取 + 人工摘要，版权归原作者。”

### 5) Quick QA

- Links open in `target="_blank"` with `rel="noopener noreferrer"`.
- No paywalled content quoted at length; prefer summary + outbound link.
- Run a local spot-check of the edited HTML in the browser if available.

## Anti-patterns

- Do not scrape aggressively (no parallel hammering); RSS polling is enough for “what’s new”.
- Do not mirror full post HTML into the repo without rights clearance.
- Do not strip attribution or canonical URLs.

## Related site pages

- RAG 专题入口：`site/topic-rag.html`（**All-in-RAG** 体系参考见同页 `#all-in-rag`）→ 论文分析 / 技术热点
- Agent 专题入口：`site/topic-agent.html` → 论文分析 / 技术热点 / 生态对比
