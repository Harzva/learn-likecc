# reference/ 本地参考仓库布局

本目录用于存放**体积较大的外部克隆/镜像**，默认不将整个树纳入 Git（见仓库根目录 `.gitignore`）。**仅本 `README.md` 会提交**，便于协作者统一目录名与用途。

> 说明：原消息里的两个 `reference_agent` 按意图拆成 **`reference_rag`** 与 **`reference_agent`**；与 Source Map / Claude Code 逆向相关的仓库集中在 **`reference_sourcemap`**。

## 子目录一览

| 目录 | 内容定位 |
|------|-----------|
| **`reference_rag/`** | RAG 全栈教程与实验数据（例如 Datawhale **all-in-rag** 克隆）。 |
| **`reference_agent/`** | Agent、论文导读、研究站点等（例如 **AgentGuide** 整包）；撰稿用浅克隆见该目录下 **`README.md`**（如 `superpowers-marketplace`、`autoresearch`、`DeepScientist`、`hermes-agent`）。 |
| **`reference_cc_ui/`** | Claude Code / agent 可视化控制台、Web UI、HUD 参考（如 `claudecodeui`、`hermes-webui`、`hermes-hud`），适合给 LikeCode 的 Web UI 借鉴。 |
| **`reference_design_ui/`** | 演示页、Slides、程序化视频与前端表达参考（如 `LivePPT`、`Remotion`、`Slidev`），适合给站点专题、可视化讲解、演示稿和绘图/演示插件线借鉴。 |
| **`reference_meta(Manage)agent/`** | Managed / meta-agent 平台与多 agent 工作台参考（如 `cabinet`、`multica`），适合研究“谁来管理 agent”“runtime / daemon / board / knowledge base 如何协同”。 |
| **`reference_skill/`** | 技能库、技能打包与知识胶囊型仓库（如 `baoyu-skills`），适合给技能市场、知识组织与 prompt packaging 借鉴。 |
| **`reference_sourcemap/`** | Claude Code **泄露 / 逆向 / 镜像** 工程、对话抽取、中文 howto，以及原 `course_reference/` 里除 all-in-rag 外的学习材料（如 learn-claude-code、claude-code-book、openclaw-learn 等）。其中 **`claude-code`、`claude-code2`、`leaked-claude-code`、`open-claude-code`** 在本仓库中以 **git submodule（gitlink）** 登记，拉取主仓库后请在对应目录下执行 `git submodule update --init`。 |
| **`rererence_harness/`** | **OpenHarness**（MIT 开源 Python Agent Harness）可选快照；目录名为历史拼写。见该目录 **`README.md`** 与站内专题 **`topic-openharness.html`**。 |

## 迁移对照（2026-04）

| 原路径 | 现路径 |
|--------|--------|
| `reference/AgentGuide/` | `reference/reference_agent/AgentGuide/` |
| `reference/course_reference/all-in-rag/` | `reference/reference_rag/all-in-rag/` |
| `reference/course_reference/*`（除 all-in-rag） | `reference/reference_sourcemap/*` |
| `reference/claude-code2/`、`reference/claw-code/` 等逆向镜像 | `reference/reference_sourcemap/<同名>/` |

个人脚本或文档里若仍写旧路径，请按上表替换。

## 2026-04 新增参考分类

这次额外补进了一批更偏 **agent control / CLI orchestration / Web UI / HUD / skills packaging** 的仓库，按用途自动归类如下：

### `reference_agent/`

- `feynman/`
- `ChatDev/`
- `multica/`
- `hermes-agent/`（已存在，本次复用）
- `AI-Scientist/`
- `AI-Scientist-v2/`（已存在）
- `EvoScientist/`

这些更适合用来研究：
- 多智能体协作
- 研究 / 任务工作流
- 控制平面与运行边界
- 对我们自己的 Agent 叙事与专题文章写作

另外，`reference/reference_agent/reference_ai_scientist/` 下补了一个专题卫星目录，专门收：

- `DeepBI`
- `Auto-Analyst-Streamlit`
- `Awesome-AI-Scientist`
- `AI-Scientist-ICLR2025-Workshop-Experiment`
- `open-data-scientist`
- `AI-CoScientist`
- `ai-data-scientist-handbook`

这组目录更适合服务 `AI-Scientist / VibePaper / 自动科研 / 自动数据科学` 专题线，而不是混到通用 agent 参考池里。

### `reference_agent/reference_control-agent-cli/`

- `OfficeCLI/`
- `anomalyco-opencode/`
- `opencode/`

这些更适合用来研究：
- CLI 驱动的 agent 控制方式
- terminal / operator workflow
- 命令式 agent 管理与 session 组织

### `reference_cc_ui/`

- `hermes-webui/`
- `claudecodeui/`
- `hermes-hud/`

这些非常适合给 **LikeCode 的 Web UI / AI Terminal / HUD** 借鉴，尤其是：
- pane / terminal / workspace 组织
- 可视化控制台
- 运行状态与事件可观测性
- agent session 的前端表达

### `reference_design_ui/`

- `LivePPT/`
- `remotion/`
- `slidev/`

这类仓库更适合借鉴：
- Markdown / README 如何直接变成演示页
- 前端讲解页、讲义页、发布页如何更具可演示性
- 程序化视频、动效叙事、绘图/演示插件线如何融入开发者内容门户

### `reference_meta(Manage)agent/`

- `cabinet/`
- `multica/`

这类仓库更适合借鉴：
- managed agents / meta-agent 的产品壳层
- knowledge base 与 runtime 的协同关系
- board / daemon / connector / skill compounding 的编排方式
- “Claude Code / Codex / OpenClaw / OpenCode” 等多 provider 管理层如何组织

### `reference_skill/`

- `baoyu-skills/`

这类仓库更适合借鉴：
- 技能组织方式
- 技能分发 / 打包
- 技能市场与知识胶囊表达
