# Agent 生态对比：技能包与子代理 - Claude Code Course
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-agent-comparison.html  
> **本文件**: `site/md/topic-agent-comparison.md`  
> **说明**: HTML 为权威阅读面；本文件为目录与摘要草稿。

## 概要

从**技能包工作流**与**子代理/多智能体范式**两条线对比主流实践：综合知乎、Particula Tech、Daily Dose of Data Science 等来源的论点，并用表格与小结帮助读者建立心智模型。

## 目录（对照 HTML）

- **本页读什么？**
- **📚 参考来源**（知乎专栏 / Particula Tech / Daily Dose of Data Science）
- **一、技能包与工作流：Superpowers vs GStack**
  - Superpowers：用流程强制约束
  - GStack：用角色与斜杠命令模拟「虚拟团队」
  - 对照表（摘自 Particula 文章维度）
- **二、平台范式：Subagents vs Agent Teams**
  - Subagents（子代理）：隔离与压缩
  - Agent Teams（智能体团队）：协作与共享状态
  - 一句话对照
  - 设计原则（摘自 Daily Dose 文章）
  - Repo-backed 补充：三种团队运行时壳
- **三、小结：两条线怎么一起想**

## 各节摘要（对照 HTML）

### 本页读什么？

用极短导语说明：本文不是产品评测，而是**概念对照与引用汇编**，读时应结合原文链接核对细节与时效。

### 📚 参考来源

列出主要二手/一手材料来源，强调**转载与摘要的学术规范**（署名、链接、勿断章取义）。

#### 知乎专栏 / Particula Tech / Daily Dose of Data Science

分别概括各来源的视角侧重（中文社区讨论、工程化对比、数据科学向叙事），便于读者选读。

### 一、技能包与工作流：Superpowers vs GStack

对比两种「把最佳实践固化成可分发包」的思路：一种偏**流程与检查清单强制**，一种偏**角色分工与命令面**。

#### Superpowers：用流程强制约束

说明其如何通过步骤化约束减少模型跑偏，适合高风险或重复性任务。

#### GStack：用角色与斜杠命令模拟「虚拟团队」

说明其如何用多角色提示与命令抽象协作，适合探索性项目。

#### 对照表（摘自 Particula 文章维度）

表格化呈现多个评价维度（可维护性、学习曲线等），摘要提醒读者**维度来自原文**、本站可能仅节选。

### 二、平台范式：Subagents vs Agent Teams

从架构视角比较「子任务隔离」与「多代理共享状态」两类扩展模型，连接 Claude Code 的 Subagent 等实现话题。

#### Subagents（子代理）：隔离与压缩

强调上下文隔离、费用与调试上的收益及通信成本。

#### Agent Teams（智能体团队）：协作与共享状态

强调共享记忆与分工协作的收益及一致性与冲突处理问题。

#### 一句话对照

用一句并列句帮助读者**应试式记忆**核心差异。

#### 设计原则（摘自 Daily Dose 文章）

提炼原文中的设计原则列表，指导读者在选型时自查。

#### Repo-backed 补充：三种团队运行时壳

这一节不是再讲抽象概念，而是用本地 reference 把三种更具体的运行时壳摆在一起：

- `reference/reference_agent/feynman/`
  - 更像 **research-agent CLI shell**
  - 核心是单入口 CLI + bundled research agents + bundled skills，重点在研究工作流与产物生成
- `reference/reference_agent/ChatDev/`
  - 更像 **workflow-orchestration shell**
  - 核心是零代码配置 agent / workflow / task，再配 Web Console 承接更长的多代理编排
- `reference/reference_agent/multica/`
  - 更像 **managed-agent platform shell**
  - 核心是 board、workspace、runtime、daemon、agent profile，把 agent 当长期队友管理，而不是一次性跑完一个 flow

这三者对读者有个直接帮助：看到 “Agent Teams” 时，不要只想成一个概念词，而要继续追问它到底更偏哪种壳层。

| 运行时壳 | 这轮本地样例 | 更像解决什么问题 | 为什么值得和 Subagents / Teams 一起看 |
| --- | --- | --- | --- |
| research-agent CLI shell | `feynman` | 用单入口 CLI 把 research、review、draft、audit 这些多代理研究动作压成一套可直接调用的研究终端 | 它说明多代理不一定先长成“团队平台”，也可以先长成强工作流的研究壳 |
| workflow-orchestration shell | `ChatDev 2.0` | 用零代码配置 agent、workflow、task，让用户搭配不同多代理流程并在 Web Console 里执行 | 它说明 Agent Teams 还可以进一步抽象成“编排平台”，不再只是固定角色聊天 |
| managed-agent platform shell | `Multica` | 把 agent 当长期 teammate，围绕 board、runtime、daemon、workspace 和 issue assignment 管完整生命周期 | 它说明团队协作真正变厚时，难点会转成 runtime 管理、任务分发和状态可视化，而不是 prompt 本身 |

如果再往前收一层，可以直接看它们各自默认的协调方式：

- `feynman`
  - 更像 **一个主入口替你调度多个研究角色**
  - 协作结果尽量收束到单条研究终端与产物目录里
- `ChatDev 2.0`
  - 更像 **把代理之间的协作关系写成 workflow**
  - 重点是可配置编排，而不是长期 team board
- `Multica`
  - 更像 **把代理当长期成员持续接任务**
  - 重点是 runtime、issue、comment、status 和 daemon 组成的队友生命周期

还要防一个常见误读：`ChatDev 2.0` 已经不是早期那种 “CEO / CTO / Programmer” 角色扮演式虚拟软件公司主叙事了。按本地 `reference/reference_agent/ChatDev/README.md`，它在 `2026-01-07` 明确转向了 **Zero-Code Multi-Agent Platform**，重点变成用户自己配置 agent / workflow / task。换句话说，今天再拿 ChatDev 举例，教学重点应该放在**编排壳**，而不是只记住那套经典角色剧本。

这会帮助读者把 “Agent Teams” 这件事再拆细一点：有的系统主要在优化单入口多角色工作流，有的在优化可配置编排，有的已经开始优化长期的人机协作组织面。

### 三、小结：两条线怎么一起想

收束「技能包层」与「运行时多代理层」如何叠加：前者偏**内容与流程资产**，后者偏**执行与状态管理**；与主线 S 课可交叉阅读。
