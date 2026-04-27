# Claude 官方资源翻译 - Everything in Claude-Code

> **在线页面**: https://harzva.github.io/learn-likecc/topic-claude-official-resources.html  
> **本文件**: `site/md/topic-claude-official-resources.md`  
> **更新时间**: 2026-04-17

## 概要

这是一条挂在 `Claude Code 教程` 下面的子专题，专门收：

- `https://claude.com/resources/tutorials`
- `https://claude.com/resources/use-cases`
- `https://www.anthropic.com/engineering`

目标不是简单贴官方链接，而是把它们变成站内长期可维护的中文入口：

- 先保住源页截图和图片资产
- 再逐篇翻译高价值文章
- 最后把内容路由回 `教程 / Meta-Agent / codex-loop / Workspace / 发版监督` 等现有专题

## 三条来源

### Tutorials

偏功能上手、产品导览和具体使用方法。适合变成：

- 教程子页
- 功能说明页
- 和现有 `tutorial.html` 的补充小节

### Use Cases

偏场景化样例。更适合择优摘出：

- 教育
- agents
- coding
- 财务 / grant / 规划

这类典型案例，再转成站内短文或专题补充。

### Anthropic Engineering

偏系统设计、工程方法和产品背后的实现思路。这是这条线最值得长期翻的主来源。

当前第一批高优先级包括：

- `Scaling Managed Agents: Decoupling the brain from the hands`
- `Claude Code auto mode: a safer way to skip permissions`
- `Harness design for long-running application development`
- `Using Claude Code Remote Control`
- `What is Claude Managed Agents?`

## 图片策略

- 总览页保留源入口截图
- 单篇翻译保留关键结构图、界面图和封面图
- 图片资产统一收进 `site/images/claude-official-resources/`

## 维护说明

维护规则单独放在：

- `docs/topic-claude-official-resources-rule.md`

这样站点正文只保留入口、优先队列和读者需要的判断，不把维护日志直接堆进 HTML。
