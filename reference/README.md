# reference/ 本地参考仓库布局

本目录用于存放**体积较大的外部克隆/镜像**，默认不将整个树纳入 Git（见仓库根目录 `.gitignore`）。**仅本 `README.md` 会提交**，便于协作者统一目录名与用途。

> 说明：原消息里的两个 `reference_agent` 按意图拆成 **`reference_rag`** 与 **`reference_agent`**；与 Source Map / Claude Code 逆向相关的仓库集中在 **`reference_sourcemap`**。

## 子目录一览

| 目录 | 内容定位 |
|------|-----------|
| **`reference_rag/`** | RAG 全栈教程与实验数据（例如 Datawhale **all-in-rag** 克隆）。 |
| **`reference_agent/`** | Agent、论文导读、研究站点等（例如 **AgentGuide** 整包）；撰稿用浅克隆见该目录下 **`README.md`**（如 `superpowers-marketplace`、`autoresearch`）。 |
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
