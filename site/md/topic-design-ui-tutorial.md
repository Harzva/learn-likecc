# Design/UI 教程页 - Everything in Claude-Code

> **在线页面**: https://harzva.github.io/learn-likecc/topic-design-ui-tutorial.html  
> **本文件**: `site/md/topic-design-ui-tutorial.md`  
> **更新时间**: 2026-04-13

## 概要

这页先回答一个实际问题：

- 什么场景该选 `LivePPT`
- 什么场景该选 `Slidev`
- 什么场景该直接上 `Remotion`

核心判断：

- deck / 演示页 → `LivePPT`
- developer slides / 讲义 → `Slidev`
- 程序化视频 / 动态叙事 → `Remotion`

## 第一批样例转译

这轮给 `Design/UI` 线补了第一个真实样本，不再只停在工具说明。

选中的样本是：

- `topic-cc-unpacked-zh.html`

原因是它已经很成熟：

- 章节边界清楚
- 结构层次完整
- 本身就在讲系统分层和工作流
- 适合同时转成 `deck / slides / video`

对应的建议映射：

- `LivePPT`
  - 先把整篇专题压成 8~12 页 deck
  - 验证“文章能否快速变成演示页”
- `Slidev`
  - 再拆成开发者讲义
  - 用“入口 / runtime / tools / memory / loop / UI”作为页级主线
- `Remotion`
  - 最后只取一个最有画面感的结构，比如 loop 或 runtime 分层
  - 做成 30~60 秒解释型片段

## 现在这页的作用

所以这页现在不只是“怎么选工具”，而是开始回答：

- 哪个已有专题适合优先进入 `Design/UI` 转译流程
- 一篇成熟专题该先变成 deck、slides 还是 video

## 第一版插件线判断规则

这轮也把更底层的一条判断规则固定下来了，不然 `Design/UI` 很容易只剩“选演示工具”。

先问三个问题：

- 我是在解释结构吗？
- 我是在保留真实页面证据吗？
- 我是在升级传播形态吗？

对应规则：

- 解释结构 → `Mermaid`
- 结构语义对，但 Mermaid 视觉不够 → `html-card-to-png`
- 必须保留真实页面和真实模块状态 → `webpage-screenshot-md`
- 成熟专题想快速进入演示页 → `LivePPT`
- 需要开发者讲义或公开分享 → `Slidev`
- 需要节奏、镜头和动画传播 → `Remotion`

一句话说：

- 图和截图，是解释层
- deck / slides / video，是传播形态升级层
