# Agent 生态对比：技能包与子代理 - Claude Code Course

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

### 三、小结：两条线怎么一起想

收束「技能包层」与「运行时多代理层」如何叠加：前者偏**内容与流程资产**，后者偏**执行与状态管理**；与主线 S 课可交叉阅读。
