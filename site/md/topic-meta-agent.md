# Meta-Agent 专题 - Claude Code Course

> **在线页面**: https://harzva.github.io/learn-likecc/topic-meta-agent.html  
> **本文件**: `site/md/topic-meta-agent.md`  
> **更新时间**: 2026-04-09

## 概要

`Meta-Agent` 是今天正式命名的一条专题线。

它讨论的是：**外层 agent 如何去调度内层 agent**。也就是“学会去 agent 一个 agent”的能力。本站当前把这条线放进 `庖丁解牛专题` 下面，和 `CC 庖丁解牛` 并列。

## 目录（对照 HTML）

- **它到底是什么意思**
- **Superset 是怎么做到的**
- **Like Code 应该怎么学它**
- **把什么做到基线，才算产品**

## 各节摘要

### 它到底是什么意思

先明确 `meta-agent` 不是模型名字，而是一个结构概念：

- 外层 agent 负责理解、拆解、分发、汇总
- 内层 agent 负责执行具体任务

### Superset 是怎么做到的

把 `Superset` 拆成五层来看：

- `workspace/worktree`
- `terminal`
- `chat`
- `panes/tabs`
- `host-service`

它的价值不是“多开终端”，而是把 inner agents 统一纳入一个外层 orchestration shell。

### Like Code 应该怎么学它

不要照着再造一个外部总控台，而是让 `Claude Code / Like Code` 自己成为中心，再把别的 CLI agent 接成 worker runtime。

### 把什么做到基线，才算产品

这条线的产品基线至少包括：

- 可拉起
- 可看见
- 可控制
- 可回灌
