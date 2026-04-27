# AI-Scientist 专题 - Everything in Claude-Code

> **在线页面**: https://harzva.github.io/learn-likecc/topic-ai-scientist.html  
> **本文件**: `site/md/topic-ai-scientist.md`  
> **更新时间**: 2026-04-12

## 概要

`AI-Scientist` 这条线不该只剩下一张 `AI-Scientist-v2` 卡片。更合理的读法，是把：

- `AI-Scientist v1`
- `AI-Scientist-v2`
- `DeepScientist`
- `EvoScientist`
- 以及 `DeepBI / Auto-Analyst / open-data-scientist / AI-CoScientist`

放到同一张谱系图里看，拆出：

- `paper pipeline`
- `research studio`
- `data-scientist neighbors`

三种不同系统形态。

## 目录（对照 HTML）

- 为什么这条线值得单列成大专题
- 当前先按四条线来收
- 先把主样本放到同一张对照表
- 新增子专题：把 “in sleep” 这一层单独讲清楚
- 用 GitHub 搜索 skill 补出来的相关候选
- 这条专题下一步怎么开展最顺

## 各节摘要

### 为什么这条线值得单列成大专题

这条线至少已经分成三种不同的壳层：

- `paper pipeline`
- `research studio`
- `data-scientist neighbors`

所以更应该讲“系统壳层谱系”，而不是继续把所有项目都堆成热点列表。

### 当前先按四条线来收

1. 模板化 paper pipeline
   - `AI-Scientist`
   - `AI-Scientist-ICLR2025-Workshop-Experiment`

2. 树搜索 / experiment manager
   - `AI-Scientist-v2`
   - `AIDE ML`

3. research studio / self-evolving scientist
   - `DeepScientist`
   - `EvoScientist`

4. data-scientist 邻居线
   - `DeepBI`
   - `Auto-Analyst`
   - `open-data-scientist`
   - `AI-CoScientist`

### 先把主样本放到同一张对照表

当前主样本表的核心判断是：

- `AI-Scientist` 更像模板化 paper pipeline
- `AI-Scientist-v2` 更像 agentic tree search paper factory
- `DeepScientist` 更像 research studio / quest workspace
- `EvoScientist` 更像 self-evolving research buddy

这里最值得继续拆的，是：

- `v1 → v2` 差异
- `DeepScientist vs EvoScientist`

### 新增子专题：把 “in sleep” 这一层单独讲清楚

现在已经新增了一条 AI-Scientist 子专题：

- `topic-codex-loop-in-sleep.html`

它的作用不是重复讲 ARIS 或 codex-loop 的功能清单，而是专门解释：

- 研究系统怎样长出 `in-sleep` 层
- `ARIS` 为什么更像研究专用的 in-sleep system
- `codex-loop` 为什么更像通用型 in-sleep shell
- 后面最值得借的三层是什么：`meta-optimize`、`persistent wiki`、`watchdog`

而且它现在已经应该被读成一个长期子专题入口，不是一张一次性分析页。当前已经固定下来的三条 route-back 是：

- `meta-opt rule`
- `persistent wiki` 的三层 memory layout
- `daemon / workspace / watchdog` 边界

### [插图提示词]

用途：画 AI-Scientist family map，把 v1、v2、DeepScientist、EvoScientist 和 data-scientist neighbors 放到同一张总图里。  
形式：分层谱系图。  
提示词：顶部放 AI-Scientist family hub，左线是 template-based paper pipeline（AI-Scientist v1，ICLR workshop experiment），中线是 tree-search paper pipeline（AI-Scientist-v2，AIDE ML substrate），右线是 research studio / self-evolving scientist（DeepScientist，EvoScientist），底部单独放 data-scientist neighbors（DeepBI，Auto-Analyst，open-data-scientist，AI-CoScientist），并用不同颜色区分主样本与邻居样本。  
Mermaid 更适合：是。

### 用 GitHub 搜索 skill 补出来的相关候选

这一轮额外用 `github-repo-search-download` 做了 GitHub 搜索补样。

当前更值得继续跟的候选：

- `DeepAnalyze`
- `NanoResearch`
- `Kosmos`
- `infiAgent`

更像生态工具，不急着单独拆：

- `scientific-agent-skills`
- `paper-search-mcp`
- `Awesome-AI-Scientist`

### 这条专题下一步怎么开展最顺

建议顺序：

1. 先把 `AI-Scientist` 总页固定成 family hub
2. 优先拆高价值子页：
   - `AI-Scientist v1 vs v2`
   - `DeepScientist vs EvoScientist`
   - `Codex-Loop In Sleep`
3. 把 `Codex-Loop In Sleep` 固定成长期子专题入口，而不是临时分析页
4. 再把 `DeepBI / open-data-scientist / Auto-Analyst / AI-CoScientist` 收成 data-scientist 邻居对照页
5. 最后回写到 `VibePaper` 总轴

## 本地锚点

- `reference/reference_agent/AI-Scientist/`
- `reference/reference_agent/AI-Scientist-v2/`
- `reference/reference_agent/DeepScientist/`
- `reference/reference_agent/EvoScientist/`
- `reference/reference_agent/reference_ai_scientist/`
