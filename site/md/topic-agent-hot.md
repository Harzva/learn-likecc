# Agent · 技术热点 - Claude Code Course
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-agent-hot.html  
> **本文件**: `site/md/topic-agent-hot.md`  
> **说明**: HTML 为权威阅读面；本文件为目录与摘要草稿。

## 概要

Agent 方向的**热点 curated 页**：与 RAG 热点页姊妹结构，以摘要表呈现外文长文，并讨论自动抓取、翻译与人工审核的推荐流程。当前也开始收录像 **Hermes Agent** 这类“memory + skills + gateway + tools”一体化的官方项目，便于和站内的 Memory / Skills / loop 线索互相参照。

## 目录（对照 HTML）

- **精选摘要表**
- **自动抓取与翻译：怎么做才靠谱？**
  - 推荐路径

## 各节摘要（对照 HTML）

### 精选摘要表

主表格列出 Agent、工具链、多模态等相关热文：每行含中文简介与原文链接。教学目的是让读者在**不离开本站**的情况下浏览议题广度，并养成点回原文的习惯。这轮又补进了来自站内热点快照的 `Build Agents That Don’t Fail in Production`，把 hot-watch intake 的一条新鲜条目真正路由到了下游页。新加的 Hermes Agent 条目，强调的是官方项目如何把持久化记忆、自改进技能、40+ 工具与消息网关合在一条主运行链里；`OfficeCLI` 条目则补上另一条线索：Agent 工具面不只等于 coding shell，还可以是针对 Word / Excel / PowerPoint 的 artifact control plane。

### 自动抓取与翻译：怎么做才靠谱？

讨论 RSS/爬虫/LLM 翻译组合的**错误类型**（幻觉摘要、标题党、版权），以及为何需要人工定稿与来源白名单。现在这条线也统一挂到站内的 `热门话题专项`：先在 intake 层聚合，再决定送往 Agent 或 RAG 热点页。

#### 推荐路径

给出与站内编辑技能或脚本一致的工作流（例如先刷新 `tools/fetch_hot_topic_sources.py` 维护的本地快照，再分类再写摘要），具体步骤以 HTML 为准。现在也明确补了一步：先把真正值得继续讲的条目路由到下游页，而不是把 snapshot 原样留在 intake 层。若是 Hermes Agent、OfficeCLI 这种热门官方项目，优先取官网、官方 GitHub、内置 `SKILL.md` 或文档站，避免只依赖二手转载。
