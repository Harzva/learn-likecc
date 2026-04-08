# Superset 解构可视化补强计划

日期：2026-04-09

## 状态：已完成

所有步骤已于 2026-04-09 完成。

## 背景

当前 [site/topic-superset-unpacked.html](/home/clashuser/hzh/item_bo/learn-likecc/site/topic-superset-unpacked.html) 已经具备结构解读正文，但还没有像 `Claude Code 解构` 那样的：

- `02 · 架构导览（目录心智模型）`
- `02B · 知识图谱（块内结构 + 块间联系）`
- 对应的 Treemap / 关系图可视化

所以它现在更像"结构文章"，还不是"结构专题页"。

## 目标

把 `Superset 解构` 补成和 `Claude Code 解构` 同级的专题页，至少具备：

1. 一张教学向 Treemap，回答"Superset 主要由哪些目录块组成"
2. 一张知识图谱，回答"这些块之间最值得一起读的联系是什么"
3. 页面中的 `02` 和 `02B` 分节，以及同步 Markdown 镜像
4. 可复用的数据生成脚本，而不是手写一次性 JSON

## 交付物

- [x] `site/data/superset-arch-treemap.json` - Treemap 数据
- [x] `site/data/superset-arch-knowledge.json` - 知识图谱数据
- [x] `site/js/superset-arch-treemap.js` - Treemap 可视化脚本
- [x] `site/js/superset-arch-knowledge.js` - 知识图谱可视化脚本
- [x] `tools/gen_superset_arch_viz.py` - 数据生成脚本
- [x] `site/topic-superset-unpacked.html` - 添加 02 和 02B 分节
- [x] `site/md/topic-superset-unpacked.md` - 同步更新

## 参考

### 站内参考

- `site/topic-cc-unpacked-zh.html`
- `site/js/cc-arch-treemap.js`
- `site/js/cc-arch-knowledge.js`
- `tools/gen_cc_arch_treemap.py`
- `site/data/cc-arch-treemap.json`
- `site/data/cc-arch-knowledge.json`

### Superset 参考源

- `reference/reference_agent/reference_control-agent-cli/superset/README.md`
- `reference/reference_agent/reference_control-agent-cli/superset/packages/panes/README.md`
- `reference/reference_agent/reference_control-agent-cli/superset/packages/host-service/src/app.ts`
- `reference/reference_agent/reference_control-agent-cli/superset/packages/host-service/src/runtime/chat/chat.ts`
- `reference/reference_agent/reference_control-agent-cli/superset/plans/chat-mastra-rebuild-execplan.md`

## 拆解口径

第一版不直接做"全仓 import 图"，而做**教学向结构图**。

### Treemap 口径

按 `apps/` 和 `packages/` 的顶层目录进行教学分区，再按具体 app/package 做叶子块。

初步教学分区：

- 产品壳与工作台
- Pane 与前台工作位
- 调度中枢
- 工作区与隔离层
- 共享基础设施

### 知识图谱口径

图谱不追求机械静态依赖，而追求"最值得一起读的关系"：

- `desktop -> panes`
- `desktop -> host-service`
- `host-service -> chat`
- `host-service -> workspace-fs`
- `host-service -> trpc`
- `panes -> ui`
- `panes -> workspace-client`
- `chat -> trpc`
- `workspace-fs -> db`
- `mcp -> desktop-mcp`

## 实施步骤

### 第一步：数据生成 - 已完成

新增脚本 `tools/gen_superset_arch_viz.py`，生成：

- `site/data/superset-arch-treemap.json`
- `site/data/superset-arch-knowledge.json`

### 第二步：可视化脚本 - 已完成

复用 `Claude Code 解构` 的可视化样式，创建 Superset 专用脚本：

- `site/js/superset-arch-treemap.js`
- `site/js/superset-arch-knowledge.js`

### 第三步：页面接入 - 已完成

在 `site/topic-superset-unpacked.html` 中补出：

- `02 · 架构导览（目录心智模型）`
- `02B · 知识图谱（块内结构 + 块间联系）`

并同步更新：

- `site/md/topic-superset-unpacked.md`

### 第四步：验证 - 已通过

- `python3 tools/check_site_md_parity.py` - OK
- `node --check site/js/superset-arch-treemap.js` - OK
- `node --check site/js/superset-arch-knowledge.js` - OK
- 数据生成脚本本地执行成功

## 交付标准

完成后，`Superset 解构` 页面满足：

- 不是只有静态段落，而是有可探索的结构图
- 读者能快速回答"Superset 的主块是什么、哪些块应该一起读"
- 视觉层次和 `Claude Code 解构` 基本对齐
- 后续若参考仓更新，可以重新跑脚本刷新数据
