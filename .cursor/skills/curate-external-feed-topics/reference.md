# External feeds: Daily Dose of Data Science

## Site

- Public blog: [blog.dailydoseofds.com](https://blog.dailydoseofds.com/)
- RSS (Substack): `https://blog.dailydoseofds.com/feed` — `200`, `application/xml`

## robots.txt (check before bulk automation)

- `User-agent: *` disallows paths such as `/action/`, `/publish`, `/sign-in`, `/embed`, private feeds, etc.
- Public post URLs under `/p/...` are intended to be read in the browser; **prefer RSS** instead of scraping HTML for titles and links.
- Official sitemaps are declared in robots.txt (may occasionally error with HTTP 500 — RSS is the reliable index for recent posts).

## Can we “auto crawl, translate, and publish”?

| Step | Feasibility | Notes |
|------|-------------|--------|
| Discover new posts | **High** | Poll RSS on a schedule; dedupe by `link`. |
| Full article body | **Medium** | RSS `description` is often truncated; full text may require opening the public post URL (HTML). Respect robots, rate limits, and copyright — summarize + link to original rather than reposting full text without permission. |
| Translate | **High** | LLM or translation API; keep **attribution** and **canonical URL** on every curated row. |
| Push to site | **High (manual or CI)** | Add a row to `site/topic-rag-hot.html` or `site/topic-agent-hot.html` (or generate from a small JSON file later). |

## RAG curriculum alignment (learn-likecc)

- The site’s **RAG 大专题** treats **[Datawhale All-in-RAG](https://github.com/datawhalechina/all-in-rag)** as the structured stack reference (`docs/` + `code/`). Hot-topic rows are **supplementary** digests, not a replacement for that tutorial.

## Routing: RAG vs Agent “技术热点”

Heuristic keywords (adjust as needed):

- **Agent 热点**: `agent`, `subagent`, `tool`, `mcp`, `skill`, `orchestr`, `multi-agent`, `workflow`, `coding assistant`, `claude`, `llm agent`.
- **RAG 热点**: `retriev`, `embedding`, `vector`, `rag`, `knowledge`, `index`, `chunk`, `ground`, `semantic search`, `context window` (when about long-context + retrieval).

When unclear, default to **Agent** if the title is about agents/tools; **RAG** if about retrieval/knowledge grounding.
