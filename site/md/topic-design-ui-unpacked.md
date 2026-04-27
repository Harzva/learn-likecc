# Design/UI 解构页 - Everything in Claude-Code

> **在线页面**: https://harzva.github.io/learn-likecc/topic-design-ui-unpacked.html  
> **本文件**: `site/md/topic-design-ui-unpacked.md`  
> **更新时间**: 2026-04-13

## 概要

这页把三者先拆开：

- `LivePPT` = deck / 演示页生成器
- `Slidev` = 开发者 slides / 讲义系统
- `Remotion` = 程序化视频表达层

目标不是堆功能，而是看它们分别站在哪一层。

## 第一批样本映射

这轮进一步把一个真实专题拉进来做对照，不再只讲抽象角色。

选中的样本是：

- `topic-cc-unpacked-zh.html`

同一份内容在三条壳层里的切法：

- `LivePPT`
  - 保留原有章节顺序
  - 压成快速浏览的 HTML deck
- `Slidev`
  - 改写成每页一个控制点的开发者讲义
  - 更适合公开分享和 live explanation
- `Remotion`
  - 只取一条最值得动起来的主线
  - 比如 runtime / daemon / connector 或 loop 机制
  - 做成解释结构的动态片段

## 当前结论

`Design/UI` 最重要的判断不是“哪个工具更强”，而是：

- 当前内容更适合变成 deck
- 还是更适合变成 slides
- 还是值得进一步进入视频层

## 插件梯度

这轮把 `Design/UI` 再拆得更清楚了一层：

- `Mermaid`：结构解释层
- `html-card-to-png`：结构解释加强层
- `webpage-screenshot-md`：真实证据保留层
- `LivePPT`：演示页层
- `Slidev`：讲义层
- `Remotion`：视频层

这样以后我们就不会再把所有表达手段都混成“做个图”。

真正该判断的是：

- 现在需要一张结构图
- 还是需要一个真实页面截图
- 还是已经到了把内容升级成 deck / slides / video 的阶段
