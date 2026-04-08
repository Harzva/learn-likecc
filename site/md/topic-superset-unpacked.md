# Superset 解构

> **在线页面**: https://harzva.github.io/learn-likecc/topic-superset-unpacked.html  
> **本文件**: `site/md/topic-superset-unpacked.md`  
> **更新时间**: 2026-04-09

本页现已归入 **庖丁解牛专题**，是其中的第二个子专题：用结构网页的方式拆解 `reference/reference_agent/reference_control-agent-cli/superset`，把它从“多 agent 产品”拆成五层能力图，并把 `meta-agent` 思想落到具体工程结构上。

## 目录（对照 HTML）

### 参考来源与版本锚定

锚定本地参考仓 `reference/reference_agent/reference_control-agent-cli/superset`，重点阅读 `README.md`、`packages/panes/README.md`、`packages/host-service/src/app.ts`、`packages/host-service/src/runtime/chat/chat.ts` 与 `plans/chat-mastra-rebuild-execplan.md`。

### 01 · 外层产品壳

从 `apps/desktop`、`apps/web`、`apps/api` 与配套 apps 说明：Superset 首先是完整工作台，不是单个 CLI。

### 02 · Pane / Workspace 引擎

围绕 `packages/panes` 拆解 `Workspace`、`Tab`、`Pane`、layout tree 的数据结构，说明它为什么是多 agent 工作位抽象的底座。

### 03 · Host-Service 调度中枢

根据 `packages/host-service/src/app.ts`，解释 `createApp()` 如何组装 db、git、filesystem、chat runtime、event bus、terminal route 与 tRPC router。

### 04 · Chat Runtime 不是普通聊天框

根据 `ChatRuntimeManager` 与相关 runtime 类型，说明 chat 在 Superset 中承担的是控制协议入口，而不是单纯消息显示。

### 05 · Superset 如何拼出 Meta-Agent

把“外层 agent 调 inner agent”拆成五步：可运行对象、独立工位、统一状态、统一控制、结果回收。

### 06 · 对 Like Code 的启发

强调三点：

- 终端不是智能体本体，worker runtime 才是
- Claude Code / Like Code 应继续作为主脑
- 产品基线是可拉起、可看见、可控制、可回灌

### 延伸阅读

回链 `CC 庖丁解牛`、`庖丁解牛专题总页`、`Agent 大专题` 与 Superset 上游仓库。
