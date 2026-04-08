# Learn LikeCode - 自由换模型的 Agent CLI 学习与实验场

> **在线页面**: <https://harzva.github.io/learn-likecc/index.html>  
> **本文件**: `site/md/index.md`  
> **说明**: HTML 为权威阅读面；本文件提供与首页章节对齐的目录与摘要，便于审阅与纯文本导航。

## 概要

本站主入口：从 **Source Map 事件** 切入，连接 **源码学习、可运行复刻、自由换模型** 三条主线；聚合教程/手册/专题入口，列出 24 讲源码课与面试题库，并展示精选热点标题表。适合作为 **Learn LikeCode** 的整站地图，帮助读者快速定位到具体讲义、专题或产品化方向。

## 目录（对照 HTML）

- **🧭 LikeCode 路线**
- **✅ 绿钩进度 + 🪄 私人订制 Todo**
- **2026 年 3 月：Source Map 事件是怎么回事？**
- **📚 学习入口**
  - Source Map 源码专题
  - 大模型专题
  - CC 庖丁解牛（`topic-cc-unpacked-zh`）
  - Claude Code 官方教程
  - 完全手册
  - 面试题库
  - RAG 大专题
  - Agent 大专题（含 Memory `topic-memory-harness`、插件对照 `topic-superpowers-autoresearch`）
  - 工具链专题（`topic-toolchain`）
- **🛤️ 学习路径**
- **📚 源码课程章节**
- **💼 面试题库**
- **🔥 热点话题**
  - 工具链专题 · 工具链阅读（本站 `column-agent-journey`；仓库稿 `wemedia/zhihu/articles/11-…`）
  - 上手与踩坑：赛博档案 · 实战篇 · Agent 实战手记（本站 `column-shangshou-cikeng`；仓库稿 `articles/12-…`）
  - 工具链专题 · 渠道评测（本站 `column-channel-review`）
  - Claude Code 封号真相：Anthropic 如何通过数字指纹追踪你
  - Claude Code 源码泄露：44个未发布功能，Anthropic 藏了多少惊喜？
  - Claude Code vs OpenClaw：谁的记忆系统更强？
  - Anthropic 的遥测帝国：Claude Code 上报了什么？
  - 51万行代码揭秘：Claude Code 的 Agent Loop 如何工作？
  - Claude Code MCP 协议：Anthropic 的工具生态野心
  - Claude Code 权限系统：如何在安全与便捷间平衡？
  - Claude Code 如何在 200K 上下文中装下 100 万字？
  - 57MB Source Map 泄露：Anthropic 犯了什么错？
  - Claude Code 源码泄露：Anthropic 的下一步棋
  - Memory 长期记忆机制（稿 13 + 本站 `topic-memory-harness`）
  - Harness 工程向深度稿 14–20：`articles/14-…` 至 `20-…`（子 Agent、工具链、规则分层、写盘安全、上下文预算、RAG 三轨、幻觉治理）
  - Superpowers 市场 vs Autoresearch（稿 21 + `topic-superpowers-autoresearch`，证据 `reference/reference_agent/`）

## 各节摘要（对照 HTML）

### 🧭 LikeCode 路线

首页前排新增的产品路线图区块，用更强的视觉方式说明：这个仓库不只是在“讲 Claude Code”，而是在尝试把 Agent CLI 推向 **同 session 切模型、多 provider 兼容、私人订制工作台** 的更自由方向。

### ✅ 绿钩进度 + 🪄 私人订制 Todo

把“已经做成的能力”和“真实场景驱动的待办”并排展示。前者强调当前工程基线已经稳住，后者强调需求来自长期使用里的痛点，而不是拍脑袋列 wishlist。

### 2026 年 3 月：Source Map 事件是怎么回事？

用时间线与要点帮助读者理解「Source Map 泄露」类事件**为何重要**、与源码学习路径的关系，并自然过渡到本站专题入口。

### 📚 学习入口

把最常用的纵向资源（源码专题、教程、手册、题库、RAG/Agent 大专题、工具链专题）收成一组**并列卡片式导航**，降低首次访问时的迷路成本。

#### Source Map 源码专题

指向以 Source Map 与重建源码为主线的专题页，承接上方事件背景。

#### CC 庖丁解牛

`topic-cc-unpacked-zh.html`：用中文结构地图与说明对照官方包结构（思路参考 ccunpacked.dev），含概览数据、Loop 相关入口与工具系统分组，适合与 24 讲并排使用。

#### Claude Code 官方教程 / 完全手册 / 面试题库

其中“Claude Code 官方教程”把教程首页、Skills、完全手册与发版监督合并为一组，形成更明确的官方资料阅读轴；面试题库继续作为练习入口。

#### RAG 大专题 / Agent 大专题

引向检索增强与 Agent 两条扩展学习线，与源码课形成互补。

#### 大模型专题

补模型本体这条线：架构图谱、注意力与混合结构阅读入口，首推 Sebastian Raschka 的 `LLM Architecture Gallery`。

### 🛤️ 学习路径

用图示或步骤说明**建议的阅读顺序**（例如先教程再 24 讲、何时穿插专题），帮助学习者按目标排期。

### 📚 源码课程章节

列出 24 讲（S/D）入口，作为本站**核心课程表**；与 `topic-sourcemap` 等页交叉引用。

### 💼 面试题库

集中展示面试向内容入口，强调与讲义知识点的对应关系，便于求职向复盘。

### 🔥 热点话题

经验向入口现在统一收在 `topic-toolchain`：工具链阅读 `column-agent-journey`、实战向 `column-shangshou-cikeng`、渠道评测 `column-channel-review` 与开发日志 `devlog`；`column-show-your-usage` 仍单独保留为用量自证页。知乎/小红书稿见 `wemedia/zhihu/articles/11-…`、`12-…`；Memory 机制见稿 `13-…` 与专题页；**14–20** 为 Harness 工程向深度解析（与 01–10 卡片并列展示）。其余以表格或列表呈现**精选外文/社区长文标题**（带外链）；教学目的是把分散热点收敛成可扫清单，并提醒读者自行核对原文与时效。

各条目标题即 HTML 中 `h3` 文案：阅历随笔之后分别涉及封号与指纹、未公开功能爆料、记忆系统对比、遥测与隐私、Agent Loop 长文、MCP 生态、权限模型、长上下文压缩、Source Map 技术复盘与后续动向等主题；其后为 **14–20** 所列七篇工程向深度稿标题，以及 **21**（Superpowers 与 Autoresearch 对照）。
