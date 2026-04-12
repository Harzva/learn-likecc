# OpenHarness 专题 · 完全开源 Agent Harness
> **更新时间**: 2026-04-07

> **在线页面**: https://harzva.github.io/learn-likecc/topic-openharness.html  
> **本文件**: `site/md/topic-openharness.md`  
> **上游项目**: [HKUDS/OpenHarness](https://github.com/HKUDS/OpenHarness)（MIT）

## 概要

本站专题，与 **Source Map 源码课**（TypeScript）并列：**OpenHarness** 为 **Python / MIT** 开源 Agent Harness（CLI `oh`）。首页课程总览 Mermaid 中已用虚线连接 S01/S07 与 OpenHarness 对照节点。

**源码课（专门对照 Claude Code 思想架构）**：[topic-openharness-course.md](topic-openharness-course.md) / [topic-openharness-course.html](https://harzva.github.io/learn-likecc/topic-openharness-course.html) — 相同点、不同点、根因、OH 优势与学习路径。

## 快速上手（摘录）

详见上游 [README.zh-CN.md](https://github.com/HKUDS/OpenHarness/blob/main/README.zh-CN.md)。

```bash
curl -fsSL https://raw.githubusercontent.com/HKUDS/OpenHarness/main/scripts/install.sh | bash
```

```bash
git clone https://github.com/HKUDS/OpenHarness.git
cd OpenHarness
uv sync --extra dev
uv run oh
```

配置：`oh setup`。

## 与源码课的关系

| 入口 | 侧重 |
|------|------|
| Source Map 源码专题 | 读重建 TS、S01–S12 课程 |
| Harness 工程向长文（稿 14–20 等） | 架构与产品层讨论 |
| **OpenHarness** | **可 fork 的可运行 Harness 代码** |

## S 课 ↔ `src/openharness/`（节选）

| 课程 | 路径提示 |
|------|-----------|
| S01 | `engine/query_engine.py`, `engine/query.py`, `stream_events.py` · 细讲 [OH01](oh01.md) |
| S02 | `tools/`（`base.py`、`*_tool.py`） · 细讲 [OH02](oh02.md) |
| S03 | `permissions/`、`ui/permission_dialog.py` · 细讲 [OH03](oh03.md) |
| S04 | `commands/`, `cli.py` · [OH04](oh04.md) |
| S05 | `services/compact/`, `prompts/context.py` · [OH05](oh05.md) |
| S06 | `coordinator/`, `swarm/` · [OH06](oh06.md) |
| S07 | `mcp/` · [OH07](oh07.md) |
| S08 | `tasks/` · [OH08](oh08.md) |
| S09 | `bridge/`, `ui/backend_host.py` · [OH09](oh09.md) |
| S10 | `hooks/` · [OH10](oh10.md) |
| S11 | `vim/`, `keybindings/` · [OH11](oh11.md) |
| S12 | `tools/*worktree*`, `bash_tool.py` · [OH12](oh12.md) |

## 本仓库路径

```
reference/rererence_harness/OpenHarness/
```

（`rererence` 为历史目录拼写。克隆后若无目录，见 [reference/rererence_harness/README.md](https://github.com/Harzva/learn-likecc/blob/main/reference/rererence_harness/README.md)。）

## 后续迭代

- 可选：上游架构图本地化预览（版权与体积允许时）。

OpenHarness 功能与 bug 请向 **HKUDS** 上游反馈。
