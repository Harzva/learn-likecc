# 站点导览 / 思维导图 - Learn LikeCode
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-site-map.html  
> **本文件**: `site/md/topic-site-map.md`

## 这页做什么

这页负责两件事：

1. 用一张思维导图解释 Learn LikeCode 整站结构。
2. 汇总每个专题页的最后更新时间，方便站点维护。

## 思维导图关注什么

- 首页是入口，不是内容终点。
- 核心入口包括：
  - Source Map 源码专题
  - 庖丁解牛专题
  - 教程 / 手册
  - AI杂货铺
  - Agent
  - RAG
  - 大模型
  - Skill 市场
  - 工具链
  - VibePaper
- 子专题会继续从这些 hub 往下长，比如：
  - CLI Agent
  - everything-agent-cli umbrella 实验线
  - 热门话题专项
  - 热点 intake / 路由页
  - Agent 技术热点 / RAG 技术热点
  - 模型 API / 评测
  - Hermes Agent 解构
  - Autoresearch / ARIS
  - DeepScientist

现在在导览图里，`AI杂货铺 → CLI Agent 专页 → everything-agent-cli umbrella 实验线` 已经是一条显式子链，方便把“CLI 路线分类页”和“多模型 CLI 编排仓库”区分开来看。

同一轮同步里，`热门话题专项 → 热点 intake / 路由页 → Agent 技术热点 / RAG 技术热点` 也被展开了。这样读者能直接看懂：热点页不是另一个孤立 hub，而是站内专题的上游 intake 层。

## 更新时间索引怎么维护

- 运行：

```bash
python3 tools/refresh_site_topic_metadata.py
```

- 这会自动刷新：
  - 每个 `site/topic-*.html` 的 `page:updated`
  - 对应 `site/md/topic-*.md` 的 `更新时间`
  - `site/data/site-topic-index.json`

## 维护规则

- 新增一个专题页，不只要把页面写出来，也要让它进入这张图和索引。
- 如果某条专题线已经改得和原来结构不一样了，也要回头更新导览图，而不是只改正文。
