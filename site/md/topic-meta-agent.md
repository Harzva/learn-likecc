# (Managed) Meta-Agent 专题 - Everything in Claude-Code

> **在线页面**: https://harzva.github.io/learn-likecc/topic-meta-agent.html  
> **本文件**: `site/md/topic-meta-agent.md`  
> **更新时间**: 2026-04-13

## 概要

这条专题不再只讲“外层 agent 调内层 agent”的抽象定义，而是明确升级成：

- `Claude Managed Agents`
- `Cabinet`
- `Multica`
- `Superset`

四条线的总入口。

它关心的是：**谁来管理 agent，runtime / daemon / board / knowledge base / event log 又是如何协同的。**

## 目录（对照 HTML）

- 为什么现在应该把它单独立成大专题
- Claude Managed Agents 到底讲清了什么
- 现在至少要区分三种路线
- Managed / Meta-Agent 四条路线总图
- 庖丁解牛入口：不要只看概念，要看工程壳层
- 用 GitHub 搜索 skill 补出来的相关候选
- 这条专题最顺的展开路线

## 关键判断

### 为什么现在看

- 单 Agent 时代正在结束
- Board、runtime、daemon、connector、skill compounding 正在变成正式层
- LikeCode 自己也会走到 managed shell 这一步

### Claude Managed Agents

官方路线最重要的启发不是“功能多了”，而是把 agent 拆成：

- 大脑：模型 + 调度器
- 手：sandbox / container
- 记忆：append-only session events

这说明 `Managed Agents` 本质上是 **agent 基础设施层**。

### 当前至少要分清三条主线

- `Cabinet`
  - knowledge-first startup OS
  - markdown on disk + git history + AI team + cron + web terminal

- `Multica`
  - managed agents board
  - local daemon + runtime + workspace + skill compounding

- `Superset`
  - orchestration shell
  - host-service + workspace/worktree + panes + terminal state

### Managed / Meta-Agent 四条路线总图

这页现在补了一张 Mermaid 总图，把：

- `Claude Managed Agents`
- `Cabinet`
- `Multica`
- `Superset`

放到同一张结构图里，帮助快速区分：

- 谁更像基础设施层
- 谁更像 knowledge-first 工作台
- 谁更像 runtime-first managed board
- 谁更像 orchestration shell

### 庖丁解牛入口

- `topic-cabinet-unpacked.html`
- `topic-multica-unpacked.html`
- `topic-superset-unpacked.html`

### GitHub 搜索补样

当前值得后续跟踪的邻居包括：

- `agno`
- `trigger.dev`
- `symphony`
- `swarm`
- `ruflo`
- `mission-control`
- `kiwiq`
- `routa`

但现阶段不宜一下子全开页，先把 `Cabinet` 和 `Multica` 讲透更重要。

### 专题展开路线

1. 固化总页
2. 做 `Cabinet / Multica` 解构
3. 回写到 `LikeCode` 的 workspace / connector / runtime 设计
4. 再继续收 managed control plane 邻居样本

## 参考与本地锚点

- https://claude.com/blog/claude-managed-agents
- https://github.com/hilash/cabinet
- https://github.com/multica-ai/multica
- `reference/reference_meta(Manage)agent/cabinet/`
- `reference/reference_meta(Manage)agent/multica/`
- `reference/reference_agent/multica/`
