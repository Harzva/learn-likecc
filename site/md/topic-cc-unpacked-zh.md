# CC 结构导览（中文）

> **在线页面**: https://harzva.github.io/learn-likecc/topic-cc-unpacked-zh.html  
> **本文件**: `site/md/topic-cc-unpacked-zh.md`  
> **说明**: 与 HTML 同步；权威技术叙述以 `ccsource` 与 S/D 讲义为准。

本页是 **Claude Code 仓库结构的中文地图**：主循环、目录分区、工具分组、斜杠命令场景与实验特性导读，并链回本站课程。**版式与分块思路**参考英文站 [Claude Code Unpacked](https://ccunpacked.dev/)，**正文独立撰写**。

## 目录（对照 HTML）

章节标题与 [`site/topic-cc-unpacked-zh.html`](../topic-cc-unpacked-zh.html) 内锚点一致；统计卡片与表格以在线页为准。

### 参考来源与版本锚定

说明 ccunpacked.dev 的参考关系、本站权威源（`ccsource`、S/D、`topic-sourcemap`）、以及当前镜像 commit（维护者随镜像更新修订）。

### 01 · 智能体主循环

概括输入 → LLM → tool 执行 → `tool_result` 回流直至停止调用工具的闭环；出口链到 S01、D01、OH01。

### 02 · 架构导览（目录心智模型）

用表格归纳 tools/commands、核心服务、UI、bridge、utils/hooks 等与顶层目录的对应，并指向源码专题与反推思想页。

### 03 · 工具系统（分组地图）

按文件、执行、检索、Agent/任务、规划、MCP 等列出**代表工具名**，完整清单以源码为准；链到 S02/S06/S07 等。

### 04 · 斜杠命令目录

按初始化、日常、Git、诊断、实验等场景给出**示例命令**；链到 S04、发版监督、D04。

### 05 · 实验与「代码中存在」的特性

提醒特性开关与未默认发布能力可能随版本变化；链到发版监督、S03/D03、S10/D10。

### 延伸阅读

ccunpacked.dev、DeepWiki、本站 Awesome 源码汇总链接。

## 正文（可选 / 待补全）

与 [v2.5.2_plan.md](../../.claude/plans/v2.5.2_plan.md) 阶段 B 衔接时，可将工具/命令表迁入 `data/cc-overview.json` 并由脚本生成片段。
