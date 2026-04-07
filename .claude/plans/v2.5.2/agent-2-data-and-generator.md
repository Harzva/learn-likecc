# Agent 2 上下文 — v2.5.2 数据文件 + 生成脚本（阶段 2）

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.2_plan.md](../v2.5.2_plan.md)

**前置**: Agent 1 已定 **最终 `stem`** 且 MVP 页已合并（或可并行起草数据 schema，合并时再对齐路径）。

---

## 职责

1. 设计并落地 **`data/cc-overview.json`**（或 `site/data/cc-overview.json`，**在 PR 中与 Agent 1 约定统一路径**），至少包含：
   - `meta`：`base_commit`、`updated`、`locale`
   - `sections[]`：与五区块对应的 `id`、`title_zh`、`intro_zh`、`links[]`
   - `tool_groups[]` / `command_groups[]`（可选）：`name_zh`、`items[]`（每项含 `name`、`note_zh`、`href_s` / `href_d` 可选）
2. 提供 **`tools/gen_cc_overview.py`**（或 `tools/render_cc_overview.py`）：读取 JSON，输出 **HTML 片段**（stdout 或写入 `site/partials/cc-overview-body.html`）**或** 打印合并说明供人工粘贴 —— **实现方式在 PR 描述中写清**。
3. 在脚本文件头与 `v2.5.2_plan.md` / README 中说明：**如何从 `ccsource` 用 `rg`/脚本草稿生成列表，再人工审核入库**。

---

## 非职责

- **不**强制在本期改 Agent 1 的页面为「全自动生成」；首期可以是 **JSON + 文档**，生成器供后续迭代接入。

---

## 任务清单 — 完成后 `[x]`

- [x] JSON schema 与示例数据已提交（`site/data/cc-overview.json`），与 02–04 节三表对齐
- [x] 生成脚本可运行：`python3 tools/gen_cc_overview.py`（`--check` / `--dry-run`）；见脚本 docstring
- [x] **回写打钩**：本文件 + [v2.5.2_plan.md 第七节](../v2.5.2_plan.md)

---

## 完成定义

- 另一开发者仅凭文档可 **更新 JSON 并重新生成** 列表块
- 无敏感信息；路径均为站内相对或 `https://harzva.github.io/learn-likecc/...`
