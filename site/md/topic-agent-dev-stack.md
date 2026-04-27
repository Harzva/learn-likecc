# 开源 Agent Dev 栈专题 - Everything in Claude-Code
> **更新时间**: 2026-04-17

> **在线页面**: https://harzva.github.io/learn-likecc/topic-agent-dev-stack.html  
> **本文件**: `site/md/topic-agent-dev-stack.md`  
> **说明**: HTML 为权威阅读面；本文件为目录与摘要草稿。

## 概要

这页把一批经典开源 Agent 仓库按“开发栈”重排，而不是按热度罗列。核心目标不是做 Awesome 清单，而是回答三个更实用的问题：这些仓库分别在解决哪一层问题、它们的产品壳有多厚、如果我们自己要做 agent / coding workspace / workflow platform，应该先借鉴哪几个。

本页对应本地证据目录：`reference/reference_agent_dev/`。

## 目录（对照 HTML）

- **四层地图**
  - Tool / Data / Evaluation：`ToolBench`、`OpenAgents`
  - 自动化 / 自主软件 Agent：`OpenDevin`、`MetaGPT`、`AgentGPT`、`SuperAGI`、`Devika`
  - Code / Tool Agent：`open-interpreter`、`developer`
  - 可视化 / 工作流 / 产品化：`Flowise`、`Dify`、`Langflow`
- **项目卡片**
- **怎么看这批仓库更有效**
- **本地目录与阅读建议**

## 各节摘要（对照 HTML）

### 四层地图

这页最重要的不是“谁最火”，而是先把这批项目放回各自的层级：

- `ToolBench` 更像 tool-use 数据与评测底座。
- `OpenDevin / Devika` 更像软件工程 agent。
- `open-interpreter` 更像本地 code executor。
- `Flowise / Dify / Langflow` 更像 workflow builder 和产品化壳层。

也就是说，它们虽然都能被叫做 “Agent 项目”，但解决的问题并不在同一层。

### 项目卡片

每个项目卡片会同时给出三类信息：

- 它适合被归到哪一类
- 本地先看哪个目录
- 一句“拿它来借鉴什么”

这样后续要继续做深拆时，可以直接回到本地克隆目录，不用重新找入口。

### 怎么看这批仓库更有效

建议不要按 star 顺序读，而是按四个问题判断：

1. 它的核心对象是 task、tool、issue 还是 workflow？
2. 它重点卖的是 agent autonomy、multi-agent collaboration、local execution 还是 product shell？
3. 它有没有 UI、部署、权限、观测与 marketplace？
4. 它能给 LikeCode 这种项目提供哪一层借鉴？

### 本地目录与阅读建议

页面最后会给一个最短阅读路径：

- 先看 `ToolBench` 理解 tool-use 数据与评测
- 再看 `OpenDevin` / `MetaGPT` 理解 agent runtime 与协作壳
- 再看 `open-interpreter` 理解 code execution + approval
- 最后看 `Dify` / `Langflow` / `Flowise` 理解工作流产品怎么落地
