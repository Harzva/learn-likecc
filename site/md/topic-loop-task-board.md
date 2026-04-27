# Loop 任务驾驶舱 - Everything in Claude-Code
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-loop-task-board.html  
> **本文件**: `site/md/topic-loop-task-board.md`

## 这页做什么

这页把 `codex-loop` 的任务池收成一个控制面，重点展示：

- 当前 active task 置顶
- 长循环任务
- 即时任务
- 当前状态
- 完成情况
- 最近更新时间
- 当前 focus
- 长期 scope 和验证规则
- GitHub Pages / GitHub blob 快捷入口

## 数据来源

- `.codex-loop/prompt.md`
- `.claude/plans/loloop/active-*-plan-v1.md`

## 为什么要单独做一页

长循环任务一多，最容易丢的不是内容本身，而是：

- 当前到底哪条线是 active
- 哪条线已经 deferred
- 哪条线几乎做完
- 哪条线 scope 很大但还没开始

这页就是把这些信息从 prompt / plan / evolution 里抽出来，变成更像控制面的 UI。

现在它又往前走了一步：

- active 任务单独置顶，并按完成度与最近更新时间排序
- 其余循环任务按语义分组收拢，避免任务越来越多时失去结构
- 支持显式切换排序：完成度 / 更新时间 / 状态
- 每张卡片直接显示最近一次 evolution 的一句话摘要，而不只是给一个链接
- 支持关键词搜索
- 支持快速视图切换：只看有 topic / 只看有 evolution / 只看待发布
- 单独增加了“知乎待发布视图”，把和发知乎直接相关的任务从 recurring / inline 两层一起拎出来，方便在白天窗口优先命中

## 维护方式

重新生成数据：

```bash
python3 tools/build_loop_task_board.py
```

然后照常跑：

```bash
python3 tools/check_site_md_parity.py
```
