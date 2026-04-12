# Superset 解构

> **在线页面**: https://harzva.github.io/learn-likecc/topic-superset-unpacked.html  
> **本文件**: `site/md/topic-superset-unpacked.md`  
> **更新时间**: 2026-04-12

本页现已归入 **庖丁解牛专题**，是其中的第二个子专题：用结构网页的方式拆解 `reference/reference_agent/reference_control-agent-cli/superset`，把它从"多 agent 产品"拆成五层能力图，并把 `meta-agent` 思想落到具体工程结构上。

## 目录（对照 HTML）

### 参考来源与版本锚定

锚定本地参考仓 `reference/reference_agent/reference_control-agent-cli/superset`，重点阅读 `README.md`、`packages/panes/README.md`、`packages/host-service/src/app.ts`、`packages/host-service/src/runtime/chat/chat.ts` 与 `plans/chat-mastra-rebuild-execplan.md`。

### 01 · 五层总图：Superset 到底在拼什么

先给出整体公式：`产品壳 + 工作位引擎 + host-service + chat/terminal runtime + worktree 隔离`。先知道它在拼哪五层，后面读目录才不会散。

### 02 · 架构导览（目录心智模型）

Treemap 可视化，按教学分区聚块：

- **产品壳与工作台**（apps/desktop、web、api、docs 等）
- **Pane 与前台工作位**（panes、ui、workspace-client）
- **调度中枢**（host-service、chat、trpc、auth、mcp）
- **工作区与隔离层**（workspace-fs、db、local-db、cli）
- **共享基础设施**（shared、email、metrics 等）

数据文件：`site/data/superset-arch-treemap.json`，生成脚本：`tools/gen_superset_arch_viz.py`。

### 02B · 知识图谱（块内结构 + 块间联系）

网络图可视化，三种模式：

- **混合总览**：块内包含 + 跨块联系
- **块内结构**：每个教学分区下有哪些主目录
- **块间联系**：不同分区之间最值得一起读的关系

关键连接（教学向，非机械依赖）：

- `desktop → panes`：桌面壳依赖 pane 引擎来布局
- `desktop → host-service`：桌面壳通过 tRPC 调用调度中枢
- `host-service → chat`：调度中枢把 chat runtime 接入控制面
- `host-service → workspace-fs`：调度中枢统一管理文件系统
- `panes → ui`：pane 引擎使用共享 UI 组件
- `chat → trpc`：chat runtime 通过 tRPC 暴露接口

数据文件：`site/data/superset-arch-knowledge.json`，生成脚本：`tools/gen_superset_arch_viz.py`。

### 03 · 外层产品壳与顶层目录

从 `apps/desktop`、`apps/web`、`apps/api` 与配套 apps 说明：Superset 首先是完整工作台，不是单个 CLI；`apps` 和 `packages` 的分法本身就在表达产品层与内核层。

### 04 · Pane / Workspace 引擎

围绕 `packages/panes` 拆解 `Workspace`、`Tab`、`Pane`、layout tree 的数据结构，说明它为什么是多 agent 工作位抽象的底座。

### 05 · Host-Service 调度中枢

根据 `packages/host-service/src/app.ts`，解释 `createApp()` 如何组装 db、git、filesystem、chat runtime、event bus、terminal route 与 tRPC router。

### 06 · Superset 如何拼出 Meta-Agent（自己起的名字，区别于 Harness）

根据 `ChatRuntimeManager`、terminal runtime 与 README 中的 worktree 叙述，解释外层 agent 如何把 inner agent 变成可运行对象、独立工位和可回收结果。

### 07 · 对 Like Code 的启发

强调三点：

- 终端不是智能体本体，worker runtime 才是
- Claude Code / Like Code 应继续作为主脑
- 产品基线是可拉起、可看见、可控制、可回灌

### 延伸阅读

回链 `Claude Code 解构`、`庖丁解牛专题总页`、`Agent 大专题` 与 Superset 上游仓库。
