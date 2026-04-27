---
name: keyword-site-topic
description: Use when the task is to take a user-provided keyword, search the web for relevant articles, summarize and cluster the findings, choose the most appropriate existing `site/` topic or hotspot page in this project, and draft a publish-ready Markdown article with explicit image prompt placeholders or Mermaid notes.
---

# Keyword Site Topic

Use this skill for this repo's editorial workflow when the user says things like:

- "给我一个关键词，联网搜一下然后写成站内专题稿"
- "把这个话题整理成热点专题"
- "挑一个合适的 site 专题去发"
- "顺便把配图提示词也留出来"

This is a project-local skill. Prefer repo conventions over generic blog-writing habits.

## Core Outcome

Produce a publish-ready Markdown draft for `site/md/` that does all of the following:

1. search the web for the keyword with source links
2. cluster and summarize the main threads
3. route the topic to the best existing site topic or hotspot page
4. write in the house style used by this repo
5. leave explicit image prompt placeholders where visuals would help

Do not stop at a loose summary if the user clearly wants a site draft.

## Workflow

### 1. Search broadly, then compress

Use web search first. Prefer primary sources when available:

- official docs
- company blogs
- original papers
- original repos
- direct product pages

Use secondary reporting only to widen coverage or triangulate reactions.

After reading enough sources, compress them into:

- what happened
- why it matters
- what is signal vs noise
- which angle best fits this repo

Always keep the source URLs for later citation or link blocks.

### 2. Route to the right site topic

Do not invent a new top-level topic unless the current structure clearly cannot fit.

Use these routing defaults and read `references/topic-routing.md` when choosing:

- Agent systems, memory, orchestration, MCP, subagents, product comparisons:
  `site/md/topic-agent.md`, `site/md/topic-agent-hot.md`, `site/md/topic-agent-comparison.md`
- RAG methods, retrieval stacks, indexing, evaluation:
  `site/md/topic-rag.md`, `site/md/topic-rag-hot.md`, `site/md/topic-rag-papers.md`
- Model architecture, inference, MoE, long context, reasoning costs:
  `site/md/topic-llm.md`
- Tooling, workflow migration, pricing/channels, usage transparency:
  `site/md/topic-toolchain.md` or related columns
- Long-term references, tutorials, repos, evergreen reading:
  `site/md/topic-websites.md`
- Knowledge workflows, personal memory, wiki mindset:
  `site/md/topic-personal-knowledge.md`
- Source-map, codebase reconstruction, product-shell teardown:
  `site/md/topic-sourcemap.md`, `site/md/topic-paoding-jieniu.md`, subtopics under them

When uncertain, prefer adding or updating a hotspot-style page under an existing umbrella rather than creating a brand-new root page.

### 3. Pick the page form

Choose one of these output shapes:

- hotspot curated page: best when the keyword maps to multiple recent articles
- single longform interpretation: best when one event or one source deserves a guided reading
- companion subsection for an existing topic page: best when the keyword is important but too narrow for a full standalone page

State the chosen form near the top of the draft in one short note if the decision is non-obvious.

### 4. Write in repo house style

Match the style already used in `site/md/`:

- lead with why the page exists
- keep sections purposeful and named in Chinese
- summarize linked material instead of dumping links
- be explicit about what the page is for: hotspot scan, paper reading, comparison, or long-term bookmark
- connect back to other site topics when useful

Prefer compact, editorial prose over fluffy transitions.

### 5. Insert image prompt placeholders

When a visual would help, insert a dedicated block exactly where the image should go.

Use this format:

```md
> [插图提示词]
> 用途：解释 xxx
> 建议形式：信息图 / 时间线 / 对比表 / 流程图 / 截图拼图
> 提示词：...
> 备注：如果更适合结构图，可用 Mermaid 绘制
```

Use these blocks only when the visual adds value. Do not sprinkle them mechanically.

Typical good placements:

- timeline after the opening context
- architecture or workflow diagram before a mechanism section
- comparison visual before or after a contrast table
- screenshot prompt when a product UI or chart is central evidence

### 6. Leave source traceability

At minimum, include a "参考与原文" or equivalent closing section with source links.

If the page is a curated hotspot page, prefer a table or bullet list that preserves:

- title
- source
- why it matters in one line

## Output Template

Use this default scaffold and adapt it to the routed page:

```md
# 标题

> 页面定位：一句话说明这篇稿子在站内承担什么角色。

## 为什么值得单独写这页

## 这次关键词检索后，最值得看的几条线索

## 核心判断

## 逐条展开

> [插图提示词]
> 用途：...
> 建议形式：...
> 提示词：...
> 备注：如果更适合结构图，可用 Mermaid 绘制

## 和站内其他专题怎么串起来看

## 参考与原文
```

For hotspot curated pages, replace "逐条展开" with a table-like or list-like digest section.

## Editing Targets

Default to one of these actions:

- create a new draft in `site/md/` when the page does not exist yet
- update an existing topic or hot page when the keyword clearly belongs there
- optionally prepare a matching Zhihu-side draft only if the user asks for multi-platform publishing

Do not modify unrelated site pages just to add cross-links unless it materially improves navigation.

## Decision Rule

Prefer this sequence:

1. search and cluster the keyword
2. choose the site location
3. draft the Markdown
4. leave image prompt blocks
5. summarize the chosen angle and target file

If the fit across multiple topics is ambiguous, make a reasonable choice and say why in one short sentence instead of blocking on a question.
