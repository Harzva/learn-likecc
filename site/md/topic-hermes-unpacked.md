# Hermes Agent 解构

> **在线页面**: https://harzva.github.io/learn-likecc/topic-hermes-unpacked.html  
> **本文件**: `site/md/topic-hermes-unpacked.md`  
> **更新时间**: 2026-04-10

本页归入 **庖丁解牛专题**，目标不是介绍 Hermes Agent 有多“全能”，而是拆它如何把 `agent loop + tools registry + memory/skills + gateway + cron + environments` 拼成一个长期运行的 agent 控制层。

## 目录（对照 HTML）

### 参考来源与版本锚定

官方来源优先：

- `https://hermes-agent.ai/`
- `https://github.com/NousResearch/hermes-agent`
- `https://hermes-agent.nousresearch.com/docs/developer-guide/architecture`
- `https://hermes-agent.nousresearch.com/docs/user-guide/features/memory`

本地锚点：

- `reference/reference_agent/hermes-agent/README.md`
- `reference/reference_agent/hermes-agent/run_agent.py`
- `reference/reference_agent/hermes-agent/tools/registry.py`
- `reference/reference_agent/hermes-agent/tools/memory_tool.py`
- `reference/reference_agent/hermes-agent/tools/skills_tool.py`
- `reference/reference_agent/hermes-agent/tools/delegate_tool.py`
- `reference/reference_agent/hermes-agent/gateway/run.py`
- `reference/reference_agent/hermes-agent/gateway/session.py`
- `reference/reference_agent/hermes-agent/cron/scheduler.py`

### 01 · 为什么 Hermes 值得放进庖丁解牛专题

Hermes 值得拆，不是因为它“功能很多”，而是因为它把长期运行 agent 的关键控制点都做成了正式层：

- CLI / gateway 双入口
- `AIAgent` 主循环
- tools registry 与 toolsets
- memory / user profile / skills
- gateway session 与平台 delivery
- cron scheduler 与环境后端

### 02 · 先拆成六层：Hermes 到底在拼什么

- 入口壳：`hermes_cli/` 与 README 的 CLI / gateway 双入口
- 控制面：`run_agent.py` 中的 `AIAgent`
- 工具执行面：`model_tools.py` + `tools/registry.py`
- 长期记忆层：`tools/memory_tool.py` + `agent/memory_manager.py`
- 技能层：`tools/skills_tool.py`、`tools/skill_manager_tool.py`
- 平台与时间轴：`gateway/`、`cron/`、`environments/`

结论：Hermes 更像一个长期在线的 `agent operations layer`，不是一个单纯终端助手。

### [插图提示词]

用途：画 Hermes 六层总图，让读者先建立入口壳、控制面、工具面、记忆/技能、gateway/cron、环境后端的分层心智。  
形式：分层结构图。  
提示词：画一个 Hermes Agent 六层架构图，顶部是 CLI 与 Messaging Gateway 双入口，中间是 AIAgent 控制面与 Tool Registry，左侧是 Memory / User Profile，右侧是 Skills / Skill Manager，底部是 Gateway adapters、Cron scheduler、Environment backends，箭头标出消息进入、工具调用、记忆写回、定时触发、平台回送。  
Mermaid 更适合：是。

### 03 · 控制面到底在哪：不是 gateway，而是 AIAgent

从官方 Architecture 页与 `run_agent.py` 看，真正像控制面的还是 `AIAgent`：

- 负责 provider 选择
- 负责 prompt assembly
- 负责 tool-calling loop
- 负责 compression / retries / persistence
- 负责 memory / skill nudges

所以 gateway 更像 ingress layer，不是主脑。这一点和我们读 Claude Code / Like Code 时得到的判断一致：不要把壳误认成脑。

### 04 · Hermes 的关键差异：它把记忆和技能放进了主循环

Hermes 的 README 把它描述成 built-in learning loop，本地代码也确实能看到对应结构：

- `AIAgent` 维护 `_turns_since_memory`、`_iters_since_skill`
- 初始化时加载 memory store / memory provider / skills config
- 后台 review 会审查当前对话是否值得写入 memory 或 skill

这说明 Hermes 不把记忆和技能当外挂，而是当 loop 内结构。

### [插图提示词]

用途：说明 Hermes 的 closed learning loop。  
形式：闭环流程图。  
提示词：画一个 Hermes Agent learning loop 闭环：user message 进入 AIAgent，模型调用工具完成任务，conversation 结束后触发 background review，判断是否写入 memory、user profile 或 skill，随后这些内容回到下一轮 system prompt，形成持续学习闭环。  
Mermaid 更适合：是。

### 05 · Gateway、Cron、Environment：它怎么从“会聊天”走到“长期在线”

官方 Architecture 页给出的三条数据流很关键：

- CLI session
- Gateway message
- Cron job

这说明 Hermes 把“从哪里进来”“何时触发”“结果送到哪里”都纳入了正式系统设计。

再叠加 README 里列出的 local / Docker / SSH / Daytona / Modal 等环境后端，可以把它理解成：Hermes 不是只会在当前终端回答一句话，而是在尝试做一个跨平台、跨时间轴、跨执行环境的长期 agent runtime。

### 06 · 三条运行链路复盘：CLI、Gateway、Cron 到底怎么汇进同一套脑子

官方 Architecture 页把三条链路写得很清楚：

- CLI Session：`hermes_cli/main.py` → `AIAgent.run_conversation()` → prompt builder → provider runtime → tool loop
- Gateway Message：`gateway/run.py` → adapter `on_message()` → resolve session key → fresh `AIAgent` + history → adapter delivery
- Cron Job：`cron/scheduler.py` → jobs.json → fresh `AIAgent` → attached skills context → target delivery

这三条链路共同说明：Hermes 的关键不是入口多，而是所有入口都被收敛回同一个 agent kernel。

### 07 · 对 Claude Code / Like Code / codex-loop 值得学什么

- 把控制面和入口壳分开：主脑在 loop，不在 UI 或平台 adapter。
- 把记忆和技能当成 loop 内结构，而不是外挂资料夹。
- 把时间轴与回送通道当成正式能力。
- 学 Hermes 的“长期运行控制层”，不要照搬它的整套产品壳。

### 参考与原始链接

- https://hermes-agent.ai/
- https://github.com/NousResearch/hermes-agent
- https://hermes-agent.nousresearch.com/docs/developer-guide/architecture
- https://hermes-agent.nousresearch.com/docs/user-guide/features/memory
- `reference/reference_agent/hermes-agent/run_agent.py`
- `reference/reference_agent/hermes-agent/tools/registry.py`
- `reference/reference_agent/hermes-agent/gateway/run.py`
- `reference/reference_agent/hermes-agent/cron/scheduler.py`
