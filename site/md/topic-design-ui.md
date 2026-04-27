# Design/UI 专题 - Everything in Claude-Code

> **在线页面**: https://harzva.github.io/learn-likecc/topic-design-ui.html  
> **本文件**: `site/md/topic-design-ui.md`  
> **更新时间**: 2026-04-13

## 概要

`Design/UI` 专题把三条线收在一起：

- `LivePPT`
- `Slidev`
- `Remotion`

并把一条更底层的插件线也收进来：

- `Mermaid`
- `html-card-to-png`
- `webpage-screenshot-md`

目标不是泛泛谈 UI，而是建立一条连续表达链：

- 插图 / 卡片图
- Slides / 演示页
- 程序化视频

## 目录（对照 HTML）

- 为什么值得单独立一个 Design/UI 专题
- 三条路线放到一张图里看
- 子入口：教程页 + 解构页
- 绘图 / 演示插件线
- 后续最顺的开展路线

## 核心判断

- `LivePPT` 更像 deck 生成器
- `Slidev` 更像开发者 slides 工作台
- `Remotion` 更像程序化视频框架
- `Mermaid / html-card-to-png / webpage-screenshot-md` 更像“结构解释与证据保留层”
- 三者合在一起，刚好形成站点后续“图文 → 演示 → 视频”的表达链

## 第一版插件线规则

现在这条专题已经不只是在 `LivePPT / Slidev / Remotion` 之间选，而是先判断：

- 当前任务是在解释结构
- 还是在保留真实页面证据
- 还是在把成熟内容升级成更强传播形态

对应的第一版规则：

- 解释结构 → `Mermaid`
- Mermaid 语义对了但视觉不够 → `html-card-to-png`
- 必须保留真实界面状态 → `webpage-screenshot-md`
- 成熟内容快速变演示页 → `LivePPT`
- 做开发者讲义 / 演讲 → `Slidev`
- 做动态叙事 / 视频传播 → `Remotion`

## 这条线现在能回答什么

所以 `Design/UI` 现在已经不只是：

- `LivePPT / Slidev / Remotion` 三选一

而是开始回答：

- 什么时候该先画结构图
- 什么时候该保留真实页面截图
- 什么时候才值得把内容升级成 deck / slides / video
