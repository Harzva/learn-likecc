# Claude 调 Codex 的桥接链路
> **更新时间**: 2026-04-10

> **在线页面**: https://harzva.github.io/learn-likecc/topic-claude-codex-bridge.html  
> **本文件**: `site/md/topic-claude-codex-bridge.md`  
> **说明**: 本页聚焦 Claude Code 通过 `codex-plugin-cc` 调用 Codex 的桥接机制；页面叙事以站内分析与插件源码为准。

本页把一次真实问题拆成一节独立网页课：**Claude 是如何通过插件调用 Codex 的**。重点不是“某个命令怎么写”，而是把整个桥接分层看清：

- Claude 插件命令
- Claude 子代理
- 本地 Node 桥接脚本 `codex-companion.mjs`
- Codex App Server JSON-RPC
- `stdio` 与本地 `socket broker`
- Codex runtime 中真正执行的 thread / turn

## 目录（对照 HTML）

### 一句话结论

Claude 不是在模型内部直接切成 Codex，而是先调本地插件脚本，再由脚本通过 App Server 协议把任务送进 Codex runtime。

### 01 · 完整调用链

从 `/codex:rescue` 到 `codex app-server` 的六段链路：插件命令、子代理、Bash、桥接脚本、JSON-RPC、Codex 执行。

### 02 · Claude 与 Codex 之间到底靠什么通信

把通信拆成两段理解：

- Claude → 插件脚本：插件命令 + 子代理 + Bash
- 插件脚本 → Codex runtime：Codex App Server JSON-RPC

### 03 · `codex-companion.mjs` 到底是什么

说明它是插件侧桥接器 / 编排器，不是 Codex 本体；负责参数、job、resume、前后台、日志与运行时连接。

### 04 · 源码定位表：每个文件在这条链里负责什么

建议先建立一张职责地图，再继续深挖。重点文件可以分成三层：

- Claude 入口层：`commands/rescue.md`、`agents/codex-rescue.md`
- 桥接编排层：`codex-companion.mjs`、`lib/state.mjs`、`lib/tracked-jobs.mjs`
- Codex runtime 协议层：`lib/codex.mjs`、`lib/app-server.mjs`、`app-server-broker.mjs`

### 05 · 逐文件讲解顺序

推荐按“从外到内”的顺序读：

1. `commands/rescue.md`
2. `agents/codex-rescue.md`
3. `codex-companion.mjs`
4. `lib/codex.mjs`
5. `lib/app-server.mjs`
6. `app-server-broker.mjs`
7. `session-lifecycle-hook.mjs` + `lib/state.mjs`

这样先看清 Claude 如何发起，再看桥接脚本如何接，再看 Codex runtime 如何执行。

### 06 · 这样传输会不会慢？是不是应该全改成 socket？

解释为什么真正瓶颈通常不在 IPC；同时指出插件本来就支持两条路径：

- 直接模式：`stdio`
- 共享模式：broker + 本地 `socket`

### 07 · 为什么有时会掉到错误的工作目录

说明这更像上下文绑定 / `cwd` 透传问题，而不是协议本身有问题。

### 08 · 关键源码锚点

列出 `commands/rescue.md`、`agents/codex-rescue.md`、`codex-companion.mjs`、`lib/app-server.mjs`、`app-server-broker.mjs` 等关键位置，方便对照页面回看源码。

### 09 · 最后要记住的分层

最值得记住的不是某一个命令，而是分层：

- Claude：插件命令与子代理调度
- `codex-companion.mjs`：桥接与编排
- Codex App Server：协议与 runtime
- Codex 模型：真正推理的一层

## 备注

如果后续要把这节课继续扩成“插件机制专题”，可以在本站继续追加：

- Claude 插件命令文件格式与执行规则
- Claude 子代理 prompt 契约
- broker 生命周期与 session hook
- `cwd` / `sessionId` / `threadId` 的上下文透传链
