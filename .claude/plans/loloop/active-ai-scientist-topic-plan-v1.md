# Active AI Scientist Topic Plan v1

## Goal

把 `AI-Scientist` 做成站内可持续扩展的大专题，而不是只在 `VibePaper` 里零散提到 `AI-Scientist-v2`。

## Current focus

- [x] 补齐主样本 reference：
  - `AI-Scientist`
  - `AI-Scientist-v2`
  - `DeepScientist`
  - `EvoScientist`
- [x] 建 `reference_ai_scientist/` 卫星目录
- [x] 通过 GitHub 搜索补一批相关候选仓库
- [x] 把 `AI-Scientist` 总专题页接进站内入口
- [x] 决定第一条方法型独立子页：
  - `Codex-Loop In Sleep`
- [ ] 继续决定哪些样本值得长成独立 unpacked 子页

## Sample lanes

### 1. Paper pipeline line

- [x] `AI-Scientist`
- [x] `AI-Scientist-v2`
- [x] `AI-Scientist-ICLR2025-Workshop-Experiment`
- [ ] 把 `v1 → v2` 差异讲清楚

### 2. Studio / co-evolving line

- [x] `DeepScientist`
- [x] `EvoScientist`
- [ ] 讲清 `studio shell` 和 `research buddy` 的边界

### 3. Data scientist neighbor line

- [x] `DeepBI`
- [x] `Auto-Analyst-Streamlit`
- [x] `open-data-scientist`
- [x] `AI-CoScientist`
- [ ] 决定哪些值得并入专题，哪些只做对照样本

### 4. Ecosystem / bibliography line

- [x] `Awesome-AI-Scientist`
- [x] `ai-data-scientist-handbook`
- [ ] 只把它们当索引，不误当自治系统样本

## Topic outputs

- [x] `site/topic-ai-scientist.html`
- [x] `site/md/topic-ai-scientist.md`
- [x] 从 hub 拆出第一篇方法型独立子页：
  - `site/topic-codex-loop-in-sleep.html`
- [ ] 从 hub 继续拆出下一篇样本型独立子页
- [ ] 补一张 “AI Scientist family map” 总图
- [ ] 补一张 “paper pipeline vs studio shell vs data-scientist neighbor” 对照图

## Topic routing rules

- `AI-Scientist / AI-Scientist-v2 / workshop experiment`
  - 优先路由到 `paper pipeline` 叙事
- `DeepScientist / EvoScientist`
  - 优先路由到 `research studio / self-evolving scientist` 叙事
- `DeepBI / open-data-scientist / Auto-Analyst / AI-CoScientist`
  - 先作为 `data-scientist neighbor` 线，不急着抬成主样本
- `awesome / handbook`
  - 只做生态补充，不当核心壳层

## Validation

- [x] `python3 tools/check_site_md_parity.py`
- [x] `python3 tools/refresh_site_topic_metadata.py`

## Current status

`AI-Scientist` 专题骨架已建，下一步重点不是继续 clone，而是决定第一批独立子页先拆哪一条：`v1-v2`，还是 `DeepScientist vs EvoScientist`。
