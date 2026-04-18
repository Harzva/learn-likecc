# Multica 解构

> **在线页面**: https://harzva.github.io/learn-likecc/topic-multica-unpacked.html  
> **本文件**: `site/md/topic-multica-unpacked.md`  
> **更新时间**: 2026-04-13

本页归入 **(Managed) Meta-Agent 专题**，目标不是介绍 Multica 有多少 feature，而是拆它怎样把 `board + workspace + daemon + runtime + skill compounding` 组织成更接近 managed agents 的开源平台。

本轮质量提升把页面从文字笔记升级为结构专题：Hero 增加 `board / workspace / daemon / runtime / skills` 视觉摘要，首屏下方增加 `PRODUCT VIEW / RUNTIME / COMPOUNDING` 三点速览，分层区补五层结构栈，Board 区把原来的插图提示词替换成页面内可读的 managed agents 架构图。

本次连续美化 pass 又补了阅读路径组件：先看分层，再看 daemon/runtime，重点看 board 视角，最后看 skill compounding。

## 目录（对照 HTML）

- 01 为什么 Multica 值得单独拆
- 02 Multica 先拼的是哪几层
- 03 它最关键的地方：Daemon 和 Runtime 被正式命名了
- 04 它不是聊天前端，而是 Board 视角的多 Agent 协作面
- 05 “成功方案沉淀成 Skill” 是最有产品味的一层
- 06 对 LikeCode / codex-loop 最值得学什么

## 关键判断

- Multica 更像 `runtime-first managed agents platform`
- 主视角不在单个聊天窗口，而在 board / assignment / blocker / status
- daemon / runtime / worker provider 是正式层
- 它和 Cabinet 的对照很清楚：一个偏 runtime-first，一个偏 knowledge-first
- `successful solutions automatically become reusable skills` 是它最有产品味的一层：任务结果会回到 team memory，而不只是留在一次 transcript 里

## 参考与锚点

- https://github.com/multica-ai/multica
- https://multica.ai
- `reference/reference_meta(Manage)agent/multica/README.md`
- `reference/reference_meta(Manage)agent/multica/docs/`
- `reference/reference_meta(Manage)agent/multica/cli/`
