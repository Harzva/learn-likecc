# 热门话题专项 - Learn LikeCode
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-hot-watch.html  
> **本文件**: `site/md/topic-hot-watch.md`

## 这页做什么

这页是站内的热点 intake 层：

- 先聚合 AIbase AI日报、RSS 友好源、官方产品 / 生态博客 RSS 等公开热点入口
- 再把条目路由到 Agent、RAG、AI杂货铺、工具链或大模型专题
- 不做全文镜像，只做轻量摘要和后续分发

## 第一批来源池

- AIbase AI日报
- Daily Dose of Data Science（RSS）
- Hugging Face Blog（官方博客 RSS）

当前来源池按三条 lane 管理：

- 公开聚合页负责 discovery
- 独立 RSS 负责稳定工程评论
- 官方博客 RSS 负责 primary-source 校准

源配置文件：

- `site/data/hot-topic-sources.json`

本地快照文件：

- `site/data/hot-topic-snapshot.json`

抓取脚本：

```bash
python3 tools/fetch_hot_topic_sources.py --write
```

## 路由规则

抓回来的热点不应长期停留在这页。

默认落点：

- Agent / CLI / workflow → `topic-agent-hot`
- retrieval / eval / indexing → `topic-rag-hot`
- 入口发现 / 工具地图 → `topic-ai-zahuopu`
- 模型 / API / provider / infra → `topic-toolchain` 或 `topic-llm`

如果某条内容值得单独写成长稿，再交给 `keyword-site-topic`。

## 维护规则

- 新增源时，先改 `site/data/hot-topic-sources.json`
- 刷新时，运行 `python3 tools/fetch_hot_topic_sources.py --write`
- 新增源后，先判断它属于 discovery digest、independent RSS 还是 official blog RSS，再决定默认 route hints，不要把所有 RSS 当成同一类
- 如果来源池或路由逻辑变了，也要同步更新这页和相关热点页
