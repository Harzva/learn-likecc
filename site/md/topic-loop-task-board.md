# Loop 任务驾驶舱 - Learn LikeCode
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-loop-task-board.html  
> **本文件**: `site/md/topic-loop-task-board.md`

## 这页做什么

这页把 `codex-loop` 的任务池收成一个控制面，重点展示：

- 长循环任务
- 即时任务
- 当前状态
- 完成情况
- 当前 focus
- 长期 scope 和验证规则

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

## 维护方式

重新生成数据：

```bash
python3 tools/build_loop_task_board.py
```

然后照常跑：

```bash
python3 tools/check_site_md_parity.py
```
