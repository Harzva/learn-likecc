# CC 结构导览（中文）

> **在线页面**: https://harzva.github.io/learn-likecc/topic-cc-unpacked-zh.html  
> **本文件**: `site/md/topic-cc-unpacked-zh.md`  
> **说明**: 与 HTML 同步；权威技术叙述以 `ccsource` 与 S/D 讲义为准。

本页是 **Claude Code 仓库结构的中文地图**：主循环、目录分区、工具分组、斜杠命令场景与实验特性导读，并链回本站课程。**正文独立撰写**。

## 目录（对照 HTML）

章节标题与 [`site/topic-cc-unpacked-zh.html`](../topic-cc-unpacked-zh.html) 内锚点一致；统计卡片与表格以在线页为准。

### 参考来源与版本锚定

说明本站权威源（`ccsource`、S/D、`topic-sourcemap`）以及当前镜像 commit（维护者随镜像更新修订）。

### 01 · 智能体主循环

概括输入 → LLM → tool 执行 → `tool_result` 回流直至停止调用工具的闭环；出口链到 S01、D01、OH01。

### 02 · 架构导览（目录心智模型）

**Treemap**：[`site/js/cc-arch-treemap.js`](../js/cc-arch-treemap.js) + D3（CDN）读取 [`site/data/cc-arch-treemap.json`](../data/cc-arch-treemap.json)，按教学分区与子目录 TS/TSX **文件数**分块；**单击分区下钻**、面包屑返回，**单击叶子**复制目录名（`tools/gen_cc_arch_treemap.py` 从镜像生成）。另附表格文字归纳。

### 03 · 工具系统（分组地图）

**工具砖墙**：[`site/js/cc-tool-tiles.js`](../js/cc-tool-tiles.js) 读取 [`cc-overview.json`](../data/cc-overview.json) 内 `tool_tiles`，多列分组可点进讲义。另附表格版地图；完整清单以源码为准。

### 04 · 斜杠命令目录

**Pill 墙**：[`site/js/cc-command-pills.js`](../js/cc-command-pills.js) 读取 [`cc-overview.json`](../data/cc-overview.json) 内 `command_pills`，按场景渲染可点击 pill（挂锁表示可能随版本/权限变化）。下表仍为**场景分组 + 示例**文字版；链到 S04、发版监督、D04。

### 05 · 实验与「代码中存在」的特性

**特性卡片**：[`site/js/cc-feature-cards.js`](../js/cc-feature-cards.js) 读取 `feature_cards`，网格卡片 + 下方详情区（`Esc` 关闭）。仍保留列表式免责声明；链到发版监督、S03/D03、S10/D10。

### 延伸阅读

ccunpacked.dev、DeepWiki、本站 Awesome 源码汇总链接。

## 阶段 B：数据驱动三表（02–04 节）

- **数据源**：[`site/data/cc-overview.json`](../data/cc-overview.json)（架构 / 工具 / 斜杠命令三表；**`command_pills`**、**`tool_tiles`**、**`feature_cards`** 供各交互块）。
- **生成**：仓库根执行 `python3 tools/gen_cc_overview.py`，将表写入 [`topic-cc-unpacked-zh.html`](../topic-cc-unpacked-zh.html) 内 `<!-- cc-overview:begin … -->` / `end` 标记之间；**勿手改生成区**。
- **校验**：`python3 tools/gen_cc_overview.py --check` 验证 JSON；`--verify-in-sync` 断言 HTML 标记区间与 JSON 渲染一致（**GitHub Actions** `site-md-parity` 工作流已包含 check + verify）；`--dry-run` 打印 HTML 片段。
- 页内脚注（04 节表下）会显示 JSON 的 `meta.updated` 日期；改版请同步改 JSON 与脚注。
- **架构 Treemap 数据**：[`site/data/cc-arch-treemap.json`](../data/cc-arch-treemap.json)；**双层**（按教学分区再分子目录）；本地有 `ccsource/claude-code-main/src` 时执行 `python3 tools/gen_cc_arch_treemap.py`；CI 无镜像时仅校验 JSON 可读，有镜像时 `--verify-in-sync` 比对全文。

## 阶段 C（部分）：01 节讲解型步进

- **数据**：[`site/data/cc-loop-steps.json`](../data/cc-loop-steps.json)（11 步，中文；`meta.autoplay_base_ms`、`meta.loop_autoplay`）。CI：`python3 tools/check_cc_loop_steps.py`。
- **脚本**：[`site/js/cc-loop-player.js`](../js/cc-loop-player.js) 读取 JSON，提供步骤条、示意终端、播放/倍速、←/→、Space（`focus-within` 于播放器内时）；末步再播放从头；自动翻步用 **倒计时进度条** + 按下播放后 **首帧较短间隔**（避免误以为无响应）；`prefers-reduced-motion` 时拉长自动间隔并弱化动效。
- **样式**：`site/css/style.css` 中 `.cc-loop-player*`（含倍速选中态、播放中外发光与进度条）。
- **说明**：预设讲解，**非**真实运行时事件流。

## 实时事件流（实验，另立项）

- 协议与路线图：[projects/cc-loop-live/README.md](../../projects/cc-loop-live/README.md)（GitHub 上同路径）。
- 演示：`python3 tools/cc_loop_relay_demo.py`（stdout NDJSON）；本机 SSE：`python3 tools/cc_loop_sse_relay.py` + [topic-cc-loop-lab.html](../topic-cc-loop-lab.html)。
- 脚本索引：[tools/README.md](../../tools/README.md)。

## 正文（可选 / 待补全）

其余章节（05、延伸阅读）仍以 HTML/本 MD 摘要为准；统计卡片等可再迁入 JSON。
