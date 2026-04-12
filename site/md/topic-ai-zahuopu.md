# AI杂货铺
> **更新时间**: 2026-04-12

AI杂货铺不是一个“工具站镜像页”，而是一间按场景分货的专题入口。

当前先搭五个货架：

1. CLI Agent
2. AI 编辑器
3. Agent 开发工具
4. 模型 API / 聚合
5. 模型评测

## 选货原则

- 不按导航站原分类照搬，而按真实使用场景分货。
- 先收会反复打开的入口，而不是追求一口气收满。
- 每个货架都要说明“为什么值得收”。
- 与站内 `Agent`、`工具链`、`大模型` 等专题互补。

## 第一轮补货

### CLI Agent

- Claude Code
- Codex
- OpenCode
- iFlow CLI
- Qwen CLI（待补更稳的官方入口）
- MiniMax CLI（待补更稳的官方入口）

这条货架现在不再只按“终端里跑不跑”来理解；站内已经把它进一步拆成：

- 不同壳层：workflow-complete shell、TUI-first open shell、artifact-control CLI
- 不同 approval surface：action approval、artifact review、dangerous-command gate

### AI 编辑器

- Cursor
- Windsurf
- TRAE
- Qoder
- Kiro
- CodeBuddy IDE

### Agent 开发工具

- OpenAI Agents SDK
- LangGraph
- AutoGen
- CrewAI
- Mastra
- PydanticAI

### 模型 API / 聚合

- OpenRouter
- OhMyGPT
- 硅基流动
- 七牛云
- 火山方舟

### 模型评测

- MMLU
- MMBench
- OpenCompass
- LMSYS Arena
- HELM
- CMMLU

## 下一轮重点

- CLI Agent 专页：重点补 Qwen CLI / MiniMax CLI
- API 聚合专页：重点比 OpenRouter / OhMyGPT / 硅基流动 / 七牛云
- 模型评测专页：解释 MMLU / MMBench / OpenCompass / HELM 分别适合看什么

主货架同步约束：

- `CLI Agent` 这条线后续都要沿着“先分壳，再看 approval friction”的读法同步，不再把 OpenCode、OfficeCLI、Hermes Agent 只当成更多终端工具名字。
