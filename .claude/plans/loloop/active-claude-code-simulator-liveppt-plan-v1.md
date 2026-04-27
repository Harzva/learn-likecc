# Claude Code Simulator LivePPT Plan v1

Status: active  
Scope: use `reference/reference_design_ui/LivePPT` to build a high-fidelity web-based `Claude Code Simulator` demo that looks like a real AI coding agent at work, and keep improving it as a long-running showcase line.

## Current focus

- [ ] turn the simulator into a dedicated LivePPT showcase brief rather than a generic deck idea
- [ ] define the first 8-screen structure and visual language
- [ ] connect the simulator concept back to this repo's site topics, UI work, and loop/runtime lines

## Goals

- Make the result feel like a believable `Claude Code working session`, not a normal PPT.
- Keep the presentation as a clickable web demo with page transitions, navigation dots, progress, and keyboard control.
- Use the simulator to strengthen the site's `Design/UI`, `Agent Runtime`, `LikeCode workspace`, and `Claude Code unpacked` lines.
- Prefer a product-demo feel: calm, technical, high-trust, with visible terminal, repo tree, diff, logs, state tags, and result panels.

## Visual thesis

- Chinese
- dark technology look
- professional, restrained, premium
- closer to `prism-command` / `signal-night` than flashy cyberpunk
- should feel like a real AI coding agent session being observed live

## Interaction thesis

- horizontal page-turn deck, not static article blocks
- visible progress rail + navigation dots
- keyboard control
- each screen has one primary motion idea only
- transitions should feel like tool/state progression, not generic slideshow animation

## 8-screen structure

- [ ] Screen 1: cover
  - title: `Claude Code Simulator`
  - subtitle: not a course poster, but a simulated coding-runtime demo
  - visual anchor: dark workspace frame + terminal glow + agent status line
- [ ] Screen 2: task input
  - show the incoming request, repo context, task tags, and safety mode
  - highlight the difference between user ask and machine execution setup
- [ ] Screen 3: repository scan
  - show file tree, search hits, topic pages, and plan anchors
  - suggest relation to `learn-likecc` real repo structure
- [ ] Screen 4: modification plan
  - show bounded plan, target files, risk tags, and intended verification
  - should look like a real planning/control panel
- [ ] Screen 5: code editing
  - show code excerpt + diff + inline reasoning labels
  - emphasize implementation rather than abstract explanation
- [ ] Screen 6: command execution
  - show terminal logs, checks, and success/failure transitions
  - highlight the run/verify loop
- [ ] Screen 7: result comparison
  - before/after UI or page comparison
  - include measurable output panel or verification summary
- [ ] Screen 8: summary / CTA
  - summarize what the simulator proves
  - route to site topics, design/ui line, runtime line, or future demo pages

## Required UI elements

- terminal
- file tree
- diff panel
- logs
- status badges
- result panel
- plan / target files panel
- repo context labels

## Repo-specific grounding

- Use this repo's real concepts as content anchors when possible:
  - `LikeCode workspace`
  - `codex-loop`
  - `Claude Code unpacked`
  - `Agent Runtime`
  - `topic-design-ui`
  - `site/topic-*.html` and related topic polish flows
- The simulator should feel like it belongs to `Everything in Claude-Code`, not like a generic AI terminal mockup.

## LivePPT skill anchor

- Base reference: `reference/reference_design_ui/LivePPT`
- Prefer the LivePPT path that outputs a clickable HTML showcase deck.
- Keep prompt assets, plan text, and resulting demo files easy to rerun and iterate.

## Enriched creator brief

Use or adapt the following prompt when building the simulator:

```text
请用 LivePPT 做一个中文的“Claude Code Simulator”动态网页演示，不是传统 PPT，而是一个可点击翻页、可键盘控制、带导航点和进度条的高保真网页 deck。

视觉方向：
- 深色科技风
- 专业、克制、高级
- 偏 prism-command / signal-night
- 像真实 AI 编程代理在工作，不要做成泛科幻海报
- 画面重点是终端、文件树、diff、日志、状态标签、结果面板、计划面板

内容方向：
- 结合 `Everything in Claude-Code` / `learn-likecc` 项目语境
- 不是抽象 AI Demo，而是贴近真实 coding agent 工作流
- 可参考 repo 内的 `LikeCode workspace`、`codex-loop`、`Claude Code unpacked`、`Agent Runtime` 这些线
- 每屏只讲一个重点，强调任务推进与状态切换

结构要求：
- 8 屏结构：
  1. 封面
  2. 任务输入
  3. 代码库扫描
  4. 修改计划
  5. 代码编辑
  6. 命令执行
  7. 结果对比
  8. 总结 CTA

输出要求：
- 输出逐屏文案
- 输出每屏布局建议
- 输出每屏动效建议
- 输出每屏 UI 元素建议
- 最终效果像一个高保真的 Claude Code 模拟器展示页

额外要求：
- 不要做成传统课程首页
- 不要堆太多解释性文案
- 不要把每一屏都做成一堆卡片
- 动效以状态切换、日志滚动、光标推进、diff 展开、结果切换为主
- 如果引用 repo 语境，优先使用真实文件名、真实任务名、真实专题名，而不是泛化占位词
```

## Expected outputs

- [ ] one reusable simulator brief / prompt file
- [ ] one first LivePPT simulator output
- [ ] one site-facing topic mention or showcase entry for the simulator line
- [ ] one evolution trail that records each polish pass

## Validation

- [ ] output can be opened as a clickable HTML deck
- [ ] navigation dots / progress / keyboard control work
- [ ] visual language stays consistent across 8 screens
- [ ] deck feels like agent runtime simulation, not generic product slides

## Next handoff

- turn the enriched brief into a first runnable LivePPT input file and decide where the generated simulator demo should live inside this repo
