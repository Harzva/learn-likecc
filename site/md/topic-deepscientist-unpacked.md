# DeepScientist 解构

> **在线页面**: https://harzva.github.io/learn-likecc/topic-deepscientist-unpacked.html  
> **本文件**: `site/md/topic-deepscientist-unpacked.md`  
> **更新时间**: 2026-04-12

本页归入 **VibePaper 专题**，目标不是介绍 DeepScientist 有多少功能，而是拆它如何把 `quest repo + baseline/experiment + findings memory + paper outputs + visible workspace + connectors` 拼成一个本地优先的自动科研工作台。

## 目录（对照 HTML）

### 参考来源与版本锚定

官方来源优先：

- `https://github.com/ResearAI/DeepScientist`
- `https://deepscientist.cc/`
- `https://openreview.net/forum?id=cZFgsLq8Gs`

本地锚点：

- `reference/reference_agent/DeepScientist/README.md`
- `reference/reference_agent/DeepScientist/README_ZH.md`
- `reference/reference_agent/DeepScientist/docs/en/12_GUIDED_WORKFLOW_TOUR.md`
- `reference/reference_agent/DeepScientist/docs/en/02_START_RESEARCH_GUIDE.md`
- `reference/reference_agent/DeepScientist/src/`
- `reference/reference_agent/DeepScientist/tests/test_init_and_quest.py`
- `reference/reference_agent/DeepScientist/tests/test_memory_and_artifact.py`

### 01 · 为什么 DeepScientist 值得单独拆

DeepScientist 不只是“会读 paper 的聊天机器人”，而是在试图把课题启动、baseline 修复、实验推进、paper output 和 human takeover 一起收进同一套本地工作区。

### 02 · 先拆成六层：DeepScientist 到底在拼什么

- 课题入口层：paper / repo / natural-language quest 输入
- Quest 仓库层：one repo per quest
- 研究控制面：baseline / experiment / write 等阶段流程
- 持久状态层：Findings Memory、artifacts、paper-facing outputs
- 可见工作区层：Web workspace、Canvas、Studio + Details
- 协作与 connector 层：Weixin / QQ / Telegram / Feishu 等外部入口

结论：它更像一个 `research studio / quest operating system`，不是单纯的研究 prompt 包。

### [插图提示词]

用途：画出 DeepScientist 的六层总图。  
形式：分层结构图。  
提示词：画一个 DeepScientist 六层架构图，顶部是 paper/repo/natural-language quest 输入，中间是 quest repo、baseline/experiment/write control plane，左侧是 findings memory 与 artifacts，右侧是 web workspace、canvas、studio details，底部是 weixin/qq/telegram/feishu connectors 与 local-first machine，箭头标出研究推进、结果沉淀、人工 takeover 与外部进度回送。  
Mermaid 更适合：是。

### 03 · 它的控制面到底在哪：不是聊天框，而是 quest + stage workflow

真正的控制面更像 quest 驱动的阶段流程，而不是单个聊天窗口。问题被转成 quest，quest 绑定真实仓库，然后沿 baseline、experiment、analysis、write 阶段推进。

### 04 · DeepScientist 的核心资产：Quest repo + Findings Memory + Paper outputs

DeepScientist 的关键资产不是一次会话结果，而是可持续状态：repo、branch、artifact、memory、paper-facing outputs 都变成下一轮可复用输入。

### [插图提示词]

用途：说明 DeepScientist 的 durable research loop。  
形式：闭环流程图。  
提示词：画一个 DeepScientist research loop：paper/repo/goal 输入生成 quest repo，baseline reproduction 进入 experiment rounds，结果沉淀为 findings memory 和 artifacts，再流向 figures/reports/paper draft，人工可以在任意阶段 takeover，最后这些结果反过来成为下一轮 hypothesis 和 plan 的输入。  
Mermaid 更适合：是。

### 05 · Web、Canvas、TUI、Connectors：它为什么不像黑盒

它把 visible research progress 当成产品基线：Web workspace、Canvas、Studio + Details 和多 connector 共同保证研究过程可见、可接手、可外部协作。

### 06 · 它和 Autoresearch 的根本差异：工作台厚度不同

Autoresearch 更像 plugin / command surface / verify loop；DeepScientist 更像 local-first research studio / quest repo。前者适合学研究循环协议，后者适合学研究工作台操作层。

### 07 · 对我们自己的站点和值得学什么

- 自动科研不只讲模型和 prompt，还要讲 quest repo、artifact、memory 和人类 takeover。
- 专题页要抓控制面和 durable state，不只是项目清单。
- VibePaper 后续可以继续沿“research loop 协议”与“research studio 工作台”两条线扩展。

### 参考与原始链接

- https://github.com/ResearAI/DeepScientist
- https://deepscientist.cc/
- https://openreview.net/forum?id=cZFgsLq8Gs
- `reference/reference_agent/DeepScientist/README.md`
- `reference/reference_agent/DeepScientist/README_ZH.md`
- `reference/reference_agent/DeepScientist/docs/en/12_GUIDED_WORKFLOW_TOUR.md`
- `reference/reference_agent/DeepScientist/docs/en/02_START_RESEARCH_GUIDE.md`
- `reference/reference_agent/DeepScientist/src/`
- `reference/reference_agent/DeepScientist/tests/test_init_and_quest.py`
- `reference/reference_agent/DeepScientist/tests/test_memory_and_artifact.py`
