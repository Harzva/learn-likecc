# VibePaper 专题 - Claude Code Course

> **在线页面**: https://harzva.github.io/learn-likecc/topic-vibepaper.html  
> **本文件**: `site/md/topic-vibepaper.md`  
> **更新时间**: 2026-04-10

## 概要

VibePaper 专题先收 **Autoresearch** 与 **DeepScientist** 两条线，关注的不是“论文工具很多”，而是：一个系统如何把论文阅读、baseline 复现、实验迭代、图表整理、成稿输出和长期记忆串成持续运行的研究工作流。

## 目录（对照 HTML）

- 为什么单列一个 VibePaper 专题
- 当前先收两条锚点项目
  - Autoresearch
  - DeepScientist
- 建议怎么读这条线
- 这个专题会怎么持续长出来
- 参考与本地路径

## 各节摘要

### 为什么单列一个 VibePaper 专题

这条线不只是在讲 paper，而是在拆“自动科研 / 自动论文系统”的结构：谁更像插件式自主循环，谁更像研究工作台，谁适合成为后续教程与可视化的核心样本。

### 当前先收两条锚点项目

- `Autoresearch`
  - 本地路径：`reference/reference_agent/autoresearch/`
  - 更像单插件 / 单循环协议，适合看 verify loop、命令面与机械验证。
- `DeepScientist`
  - 本地路径：`reference/reference_agent/DeepScientist/`
  - 更像本地优先的自动科研 studio，适合看 quest repo、baseline/experiment/paper 一体化与可见研究进度。

其中两条线现在都已经单独展开为：

- `topic-autoresearch-unpacked.html`
- `topic-deepscientist-unpacked.html`

### [插图提示词]

用途：画 VibePaper 的两条主轴，对比插件式自主循环和工作台式研究系统。  
形式：左右对照图。  
提示词：左边是 Autoresearch，突出 plugin、command surface、verify loop、mechanical checklist；右边是 DeepScientist，突出 quest repo、baseline、experiment rounds、paper outputs、visible workspace、human takeover；中间标注两者共同点是长期研究循环，差异是系统壳层厚度和交互面深度。  
Mermaid 更适合：是。

### 先用四个问题把当前锚点放到一张表里

Task 6 后续加新系统时，不应该先写宣传语，而应该先回答四个结构问题：它更像哪种系统形态，它的 control plane 在哪，它保留什么 durable state，它最适合长成哪类教程内容。先把当前两条锚点放进同一张表，后面加新项目时才能保持口径一致。

| 系统 | 更像哪种形态 | control plane 在哪 | durable state 保留什么 | 值得长成什么教程 |
| --- | --- | --- | --- | --- |
| `Autoresearch` | 插件式研究循环协议 | `goal + metric + scope + verify + rollback + git memory` 这套 loop contract，而不是某个厚 UI | git 历史、实验提交、verify 结果、比较日志、guide / comparison 文档 | 最适合长成“研究循环协议”“验证链路”“单循环 debug / fix / ship 方法论” |
| `DeepScientist` | 本地优先研究工作台 | `quest + baseline/experiment/write stage workflow + quest repo`，而不是单个聊天框 | quest repo、findings memory、artifacts、paper outputs、visible workspace 状态 | 最适合长成“quest repo 操作系统”“durable research loop”“自动科研工作台分层” |

这张表有两个用处：

- 它把 Autoresearch 和 DeepScientist 的差异压缩成站内统一口径，避免以后专题页越长越散
- 它给后续新增项目提供一个最低准入模板：如果这四个问题答不清楚，就先不要急着把它抬成独立子专题

### [插图提示词]

用途：画 VibePaper 四问评估框架，把“系统形态 / 控制面 / 持久状态 / 教程价值”变成可复用评估卡。  
形式：四栏结构卡。  
提示词：画一个 VibePaper evaluation framework 图，横向四列分别是 system shape、control plane、durable state、tutorial value，纵向放两行案例：Autoresearch 和 DeepScientist。Autoresearch 行突出 plugin protocol、loop contract、git memory、verify tutorial；DeepScientist 行突出 research studio、quest workflow、findings memory 和 paper outputs、workspace tutorial。  
Mermaid 更适合：否，更适合 HTML 卡片图。

### 新进候选：AI Scientist-v2 先放 hub，不急着拆独立页

这一轮先把一个新候选系统接进 VibePaper：`AI Scientist-v2`。选择它的原因很直接：它有明确的官方 repo、官方 paper，而且“从 idea 到 experiment 再到 PDF”这条链比一般 research agent 更完整，适合放进 VibePaper 的比较坐标里。

先按四问框架给出当前判断：

- 更像哪种形态：不是插件式协议，也不是厚重 studio，更像 **paper factory / agentic tree search system**
- control plane 在哪：`launch_scientist_bfts.py`、`bfts_config.yaml` 和 README 里提到的 experiment manager agent，说明它的主脑更靠近树搜索调度和阶段编排
- durable state 保留什么：idea JSON、`experiments/` 下的 timestamped logs、`unified_tree_viz.html`、最终 PDF 与 writeup 中间产物
- 值得长成什么教程：最适合长成“idea → tree search → experiment → paper draft”的流水线教程，以及“研究控制面为什么从 loop contract 变成 search manager”的对照课

当前站内决策：它先作为 **short hub card / comparison sample** 保留在 VibePaper 总页里，还不急着升成独立 unpacked 页面。等后面把 `AI Scientist-v1 / v2` 差异和它引用的 AIDE 底座再看清，再决定是否单独拆页。

### 建议怎么读这条线

1. 先看 Autoresearch，理解研究动作如何被拆成循环协议和验证链路。  
2. 再看 DeepScientist，理解如果把整套研究过程做成工作台，会多出哪些层。  
3. 最后回到站点，判断哪些值得继续写成教程、图示和子专题。

### 这个专题会怎么持续长出来

后续会继续：

- 发现新的自动科研 / 自动论文系统并 clone 到 `reference/reference_agent/`
- 挑最值得讲的项目，补结构分析、对照表、插图提示词与教程路线
- 把成熟项目继续拆成独立子页，如 `topic-*-unpacked.html`

### 参考与本地路径

- https://github.com/uditgoenka/autoresearch
- https://github.com/ResearAI/DeepScientist
- https://deepscientist.cc/
- https://openreview.net/forum?id=cZFgsLq8Gs
- https://github.com/SakanaAI/AI-Scientist-v2
- https://pub.sakana.ai/ai-scientist-v2/paper/paper.pdf
- `reference/reference_agent/autoresearch/`
- `reference/reference_agent/DeepScientist/`
- `reference/reference_agent/AI-Scientist-v2/`
