# 站点导览 / 思维导图 - Everything in Claude-Code
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-site-map.html  
> **本文件**: `site/md/topic-site-map.md`

## 这页做什么

这页负责两件事：

1. 用一张横向思维导图解释 Everything in Claude-Code 整站结构。
2. 汇总每个专题页的最后更新时间，方便站点维护。

## 思维导图关注什么

- 先按横向主干分三组：
  - 核心入口
  - 站点专题与热点
  - 工作台与科研线
- 再从每组 hub 往下挂关键子链，而不是把所有节点都堆成一层树。

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
  - 本地工作台 / Loop Lab
  - codex-loop AI Terminal / LikeCode Workspace App / Connector Runtime / Daemon Design
  - AI Scientist-v2 / codex-loop in sleep
  - 模型 API / 评测
  - Hermes Agent 解构
  - Autoresearch / ARIS
  - DeepScientist

现在在导览图里，`AI杂货铺 → CLI Agent 专页 → everything-agent-cli umbrella 实验线` 已经是一条显式子链，方便把“CLI 路线分类页”和“多模型 CLI 编排仓库”区分开来看。

同一轮同步里，`热门话题专项 → 热点 intake / 路由页 → Agent 技术热点 / RAG 技术热点` 也被展开了。这样读者能直接看懂：热点页不是另一个孤立 hub，而是站内专题的上游 intake 层。

这次还把 `本地工作台 / Loop Lab → codex-loop AI Terminal / LikeCode Workspace App` 挂进了主图。这样 `app-likecode-workspace.html` 就不再只存在于局部实验页语境里，而是被教成站内一条独立的本地操作面。

同一条本地工作台支线里，这轮再把 `Connector Runtime / Daemon Design` 接了回来。这样 connector shell / WeChat bind 这条设计线也不再只是隐藏在 workspace app 和设计说明里，而是回到了站点主导览。

这轮再把 `VibePaper → AI Scientist-v2 → codex-loop in sleep` 接成显式子链。这样睡眠态自动研究 / 自动推进这条线不再只藏在单页里，而是明确回到 AI-Scientist 语境下，告诉读者它是在解释“研究系统如何长出 sleep 层”。

## 二级局部放大图

总图负责看主干，局部图负责看重点支线。

现在优先放大三条：

- `AI-Scientist`
  - 看 `Autoresearch / DeepScientist / AI Scientist-v2 / codex-loop in sleep`
- `Loop Lab`
  - 看 `AI Terminal / Workspace App / Connector Runtime`
- `Design/UI`
  - 看 `LivePPT / Slidev / Remotion` 以及表达层分工

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
