# REFERENCE-STRUCTURE.md

> **更新时间**: 2026-04-13  
> **用途**: 作为 `reference/` 的结构镜像、当前站点吸收状态总表，以及后续站内选题的统一入口。  
> **对应循环任务**: `Task 8 · reference mining`

## 这份文件做什么

这不是公开站点页面，而是维护者使用的 `reference/` 总表。  
每次 `Task 8` 运行时，都先对照这份文件做三件事：

1. 看 `reference/` 目录有没有新增仓库。
2. 看哪些仓库已经进入站点专题，哪些还没有。
3. 优先处理“新仓库”或“仍未找到合适站点落点”的仓库。

## 当前目录结构

```text
reference/
  reference_agent/
  reference_agent_dev/
  reference_ai_scientist/
  reference_cc_ui/
  reference_cli_platform/
  reference_design_ui/
  reference_knowledge/
  reference_meta(Manage)agent/
  reference_paper/
  reference_rag/
  reference_skill/
  reference_sourcemap/
  rererence_harness/
```

## 当前状态总表

### `reference_agent/`

- 代表仓库：
  - `feynman`
  - `ChatDev`
  - `multica`
  - `hermes-agent`
  - `EvoScientist`
- 当前站点状态：
  - `feynman / ChatDev / multica`：已进入 `topic-agent-comparison`
  - `hermes-agent`：已进入 `topic-hermes-unpacked`
  - `EvoScientist`：已进入 `topic-ai-scientist` 主线，但仍可继续深化
- 当前判断：
  - 这一组已经有多个站点落点，优先级中等

### `reference_agent_dev/`

- 代表仓库：
  - `OpenDevin`
  - `MetaGPT`
  - `Devika`
  - `Flowise`
- 当前站点状态：
  - 大多仍未被系统吸收
- 当前判断：
  - 这是一个潜在大池子，但还没进入当前 bounded pass 主线

### `reference_ai_scientist/`

- 代表仓库：
  - `AI-Scientist`
  - `AI-Scientist-v2`
  - `DeepScientist`
  - `Auto-claude-code-research-in-sleep`
  - `DeepBI`
- 当前站点状态：
  - 已进入 `topic-ai-scientist`
  - `DeepScientist` 已有解构页
  - `ARIS / Auto-claude-code-research-in-sleep` 已有 `codex-loop in sleep` 线
- 当前判断：
  - 主线已建立，后续更适合做纵深拆解

### `reference_cc_ui/`

- 代表仓库：
  - `claudecodeui`
  - `hermes-webui`
  - `hermes-hud`
- 当前站点状态：
  - 已进入 `topic-codex-loop-console`
  - 已影响 `LikeCode Workspace` 和 `AI Terminal` 设计线
- 当前判断：
  - 已有明确落点，继续服务 Task 9 / Task 13

### `reference_cli_platform/`

- 代表仓库：
  - `twitter-cli`
  - `xiaohongshu-cli`
  - `bilibili-cli`
  - `discord-cli`
  - `tg-cli`
- 当前站点状态：
  - 还没有稳定专题落点
  - 当前仅完成本地 shelf 建立和目录说明
- 当前判断：
  - 这组更适合按 **connector-platform workflow** 来看，而不是当成普通平台抓取脚本堆
  - 重点不是“支持几个平台”，而是：
    - 平台对象如何变成 CLI
    - 本地优先同步 / 搜索 / 导出如何组织
    - 这些 CLI 如何继续接入 connector、workspace、automation
  - 后续最可能的站点落点：
    - `connector shell / wechat bind`
    - `CLI Agent`
    - 或新的 `platform workflow` 子专题

### `reference_design_ui/`

- 代表仓库：
  - `LivePPT`
  - `remotion`
  - `slidev`
- 当前站点状态：
  - 已进入 `topic-design-ui`
  - 已拆成教程页和解构页
- 当前判断：
  - 已有完整专题，后续继续做 recipe 和插件决策

### `reference_knowledge/`

- 代表仓库：
  - `andrej-karpathy-skills`
  - `deepwiki-open`
  - `wikillm`
- 当前站点状态：
  - 还没有稳定专题落点
- 当前判断：
  - 值得后续作为“知识组织 / wiki / memory”方向单独开线

### `reference_meta(Manage)agent/`

- 代表仓库：
  - `cabinet`
  - `multica`
  - `gstack`
  - `open-multi-agent`
- 当前站点状态：
  - `cabinet`：已进入 `topic-cabinet-unpacked`
  - `multica`：已进入 `topic-multica-unpacked`
  - `gstack`：**新加入，尚未明确挂到站点**
  - `open-multi-agent`：尚未明确挂到站点
- 当前判断：
  - **这里是当前最值得优先看的缺口**
  - 下一轮 Task 8 应优先判断 `gstack` 和 `open-multi-agent` 应该落到：
    - `topic-meta-agent`
    - `topic-agent-comparison`
    - 或新的 managed-agent 对照页

### `reference_paper/`

- 代表内容：
  - `agent-skills-papers`
- 当前站点状态：
  - 已进入 `topic-agent-papers`
- 当前判断：
  - 已有专题基础，后续继续扩论文条目

### `reference_rag/`

- 代表仓库：
  - `all-in-rag`
- 当前站点状态：
  - 已进入 RAG 主线
- 当前判断：
  - 结构稳定，优先级低

### `reference_skill/`

- 代表仓库：
  - `baoyu-skills`
  - `codex-plugin-cc`
  - `practical-toolflows`
- 当前站点状态：
  - 已进入 `topic-skillmarket`
- 当前判断：
  - 结构已落地，继续做技能市场增强即可

### `reference_sourcemap/`

- 代表仓库：
  - `claude-code`
  - `claude-code-book`
  - `open-claude-code`
  - `openclaw-learn`
  - `everything-claude-code`
- 当前站点状态：
  - 已进入 `topic-sourcemap`
  - 已进入源码课程主线
  - `everything-claude-code`：已进入 `topic-everything-claude-code-unpacked`
- 当前判断：
  - 已是成熟主干
  - `everything-claude-code` 更适合作为“跨 harness 壳层 / control plane 演化样本”继续深挖

## 当前高优先级缺口

- [ ] `reference/reference_meta(Manage)agent/gstack/` 还没有明确站点落点
- [ ] `reference/reference_meta(Manage)agent/open-multi-agent/` 还没有明确站点落点
- [ ] `reference/reference_cli_platform/` 整组还没有稳定专题承接，需要按 `connector-platform workflow` 口径决定第一站
- [ ] `reference/reference_knowledge/` 整组还没有稳定专题承接
- [ ] `reference_agent_dev/` 整组还没有系统化吸收到站点

## 下一步计划

- [ ] 为 `gstack` 做第一轮定位判断：
  - 它更像 skill/workflow team shell，还是 managed-agent runtime shell？
- [ ] 为 `reference_cli_platform/` 做第一轮定位判断：
  - 它更适合先挂到 `connector shell / wechat bind`
  - 还是先挂到 `CLI Agent`
  - 还是新开 `platform workflow` 子专题
- [ ] 判断 `gstack` 应该先挂到：
  - `topic-meta-agent`
  - `topic-agent-comparison`
  - 还是新建对照页
- [ ] 把 `open-multi-agent` 也纳入同一轮比对，避免只看单仓库
- [ ] 每次 `Task 8` 结束后，刷新这份文件里的：
  - 新增仓库
  - 当前站点状态
  - 高优先级缺口

## 维护约束

- 不把所有新仓库都马上写成新专题
- 先更新这份总表，再决定真正的站点落点
- 如果某个仓库已经存在于 `reference/`，但站点里还没有明确入口，就把它视为高信号待办，而不是“以后再说”
