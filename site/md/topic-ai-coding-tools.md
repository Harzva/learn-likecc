# AI编程工具专页
> **更新时间**: 2026-04-12

这页把 AI 编程工具拆成 5 类：

- AI IDE
- CLI Agent
- 全栈生成器
- 插件 / 编程助手
- Coding Studio

这里的 `CLI Agent` 现在不再只按“是不是终端里跑”来粗分；站内已经进一步把它拆成 workflow-complete terminal shell、TUI-first open shell、artifact-control CLI 三种壳，并继续区分 action approval、artifact review、dangerous-command gate 三种 approval surface，入口见 `topic-ai-cli-agent.html`。

## 这页重点

- 不按字母排，而是按工作形态分堆
- 鼠标悬停时，同路线工具一起高亮
- 用来回答“谁和谁是一路的”
- 其中 `CLI Agent` 这堆内部还要再看壳层差异和 approval model，而不是把 Claude Code、OpenCode、OfficeCLI 一股脑算成同一种终端工具

## CLI Agent 这一堆，别只看壳，还要看 approval surface

在这张工具墙上，`CLI Agent` 现在至少要拆两层：

- 第一层是壳层：workflow-complete shell、TUI-first open shell、artifact-control CLI。
- 第二层是 approval surface：`OpenCode` 更偏 action approval，`OfficeCLI` 更偏 artifact review，`Hermes Agent` 则把 dangerous-command gate 单独抬出来。

所以在这页扫工具时，`CLI Agent` 这堆不该再被读成“都能在终端里跑，所以差不多”。更稳的读法是：先判断你要的是哪种终端壳，再判断你接受的是哪种 approval friction。

## 第一批收录

TRAE、秒哒、码上飞、代码小浣熊、Claude Code、Cursor、Qoder、OpenCode、Kilo Code、Google Antigravity、Kiro、YouWare、Codex、Zcode、CodeBuddy IDE、Lovable、CatPaw、Augment Code、MonkeyCode、iFlow CLI、通义灵码、GitHub Copilot、Firebase Studio、Windsurf、Bolt.new、InfCode、CodeFlicker、Clacky AI、Replit Agent、Warp Code。
