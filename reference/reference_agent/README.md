# reference_agent · 插件与 Agent 工具对照用克隆

本目录存放**为撰稿与对照分析**而 `git clone --depth 1` 的第三方仓库；**非 submodule**。更新快照：

```bash
cd reference/reference_agent/superpowers-marketplace && git pull
cd ../autoresearch && git pull
cd ../DeepScientist && git pull
```

## 当前克隆

| 目录 | 上游 | 用途 |
|------|------|------|
| `superpowers-marketplace/` | [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace) | Claude Code **插件市场目录**：`marketplace.json` 聚合多个插件（含 Superpowers 核心等） |
| `autoresearch/` | [uditgoenka/autoresearch](https://github.com/uditgoenka/autoresearch) | **单一插件**：Karpathy 式自主改进循环 + 10 条子命令 |
| `DeepScientist/` | [ResearAI/DeepScientist](https://github.com/ResearAI/DeepScientist) | **本地优先的自动科研工作台**：quest repo、baseline/experiment/paper 一体化、可见研究进度、多入口 connector |
| `feynman/` | [getcompanion-ai/feynman](https://github.com/getcompanion-ai/feynman) | 面向研究与知识工作的 agent 工作台，可用于对照研究循环、skills、outputs 与 Web 工作流。 |
| `ChatDev/` | [OpenBMB/ChatDev](https://github.com/OpenBMB/ChatDev) | 经典多智能体软件公司式 workflow 参考，适合比较角色分工、流程编排、协作链路。 |
| `multica/` | [multica-ai/multica](https://github.com/multica-ai/multica) | 多 agent / 多工作区产品形态参考，适合研究控制面、工作区和 operator 体验。 |
| `hermes-agent/` | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | Agent 平台与控制面样本，兼具 CLI、gateway、memory、skills、web 入口，适合庖丁解牛。 |
| `AI-Scientist/` | [SakanaAI/AI-Scientist](https://github.com/SakanaAI/AI-Scientist) | 模板化自动科研 / 自动论文主样本，适合讲 v1 的 paper pipeline 与模板依赖。 |
| `AI-Scientist-v2/` | [SakanaAI/AI-Scientist-v2](https://github.com/SakanaAI/AI-Scientist-v2) | agentic tree search + experiment manager 主样本，适合讲 v2 的 tree-search paper pipeline。 |
| `EvoScientist/` | [EvoScientist/EvoScientist](https://github.com/EvoScientist/EvoScientist) | 自进化 AI scientist / 多 channel 科研搭子，适合对照 `DeepScientist` 与 `AI-Scientist` 之间的工作台厚度。 |

## CLI / 控制面补充参考

在 `reference_control-agent-cli/` 下还补了三类更偏 CLI / terminal / operator 的仓库：

| 目录 | 上游 | 用途 |
|------|------|------|
| `reference_control-agent-cli/OfficeCLI/` | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | 面向办公与 agent 指令流的 CLI 参考。 |
| `reference_control-agent-cli/anomalyco-opencode/` | [anomalyco/opencode](https://github.com/anomalyco/opencode) | 早期 / 另一系 `opencode` 形态，适合比对 agent CLI 和运行面。 |
| `reference_control-agent-cli/opencode/` | [opencode-ai/opencode](https://github.com/opencode-ai/opencode) | 更成熟的 `opencode` 参考，适合对比 terminal / session / agent operator UX。 |

本站长文与专题页见：`site/topic-superpowers-autoresearch.html`、`site/topic-vibepaper.html`。

这些仓库和 `reference_cc_ui/` 里的 `claudecodeui`、`hermes-webui`、`hermes-hud` 一起看时，尤其适合给 **LikeCode 的 Web UI / AI Terminal / agent 管理面板** 借鉴。

## AI Scientist 系列补充

新增一个分组目录：

- `reference_ai_scientist/`

这里收的是 `AI Scientist` 线的卫星仓库和 data-scientist 邻居仓库，例如：

- `DeepBI/`
- `Auto-Analyst-Streamlit/`
- `Awesome-AI-Scientist/`
- `AI-Scientist-ICLR2025-Workshop-Experiment/`
- `open-data-scientist/`
- `AI-CoScientist/`
- `ai-data-scientist-handbook/`

这条线的站内入口建议优先看：

- `site/topic-ai-scientist.html`
- `site/topic-vibepaper.html`

> 若你本地另有 `AgentGuide/` 等大块参考，可并列放在本目录下；未写入 `.gitignore` 白名单的文件夹仍会被忽略规则挡住，需要时请仿照上表在根 `.gitignore` 增加 `!` 规则。
