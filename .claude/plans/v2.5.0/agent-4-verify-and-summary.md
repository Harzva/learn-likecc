# Agent 4 上下文 — v2.5.0 检测与汇总

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.0_plan.md](../v2.5.0_plan.md)（完成后请在该文件「第七节」与「执行汇总」表同步更新）

---

## 前置条件

- **Agent 1、2、3** 已在 [v2.5.0_plan.md](../v2.5.0_plan.md) 中将其负责章节的所有 `- [ ]` 改为 `- [x]`（或等价合并 PR 已合并且主计划已打钩）。
- 若某 Agent 仅更新了本目录下自己的 `agent-N-*.md` 而未更新总计划，请先**核对总计划**再执行本角色。

---

## 你的职责

1. **验证**每个对外 `site/*.html` 是否有成对 `site/md/<stem>.md`，且 HTML 内互链正确。  
2. **可选**：添加 `tools/check_site_md_parity.py`（或等价脚本）便于以后重复检查。  
3. **汇总**：在总计划「执行汇总」表填写结果；在本文件清单打钩。

---

## 验证规则

- **stem** = `basename(页面.html, '.html')`，例如 `topic-sourcemap.html` → `topic-sourcemap` → 期望 `site/md/topic-sourcemap.md`。
- **互链**：每个 HTML 应包含子串 `github.com/Harzva/learn-likecc/blob/main/site/md/<stem>.md` 且该 `<stem>` 与当前文件 basename 一致。
- **范围**：`site/*.html` 全部纳入；`index-old.html` 若保留则同样要求 `index-old.md`，除非总计划「阻塞项」已登记豁免。

---

## 任务清单（Agent 4）— 完成后改为 `[x]`

- [x] 列出 `site/*.html`，与 `site/md/*.md` 做集合对比，**无缺失 stem**（除已豁免）
- [x] 互链抽查或全量扫描：HTML 中 blob URL 的 stem 与文件名一致
- [x] 处理例外：在 [v2.5.0_plan.md 第八节](../v2.5.0_plan.md) 记录豁免项（若有）
- [x] **可选**：新增 `tools/check_site_md_parity.py`，打印缺 MD / 缺链 / stem 不匹配列表
- [x] 填写 [v2.5.0_plan.md「执行汇总」表](../v2.5.0_plan.md)（完成日期、commit/PR、抽检数量、遗留）
- [x] **回写打钩**：本文件清单 + [v2.5.0_plan.md 第七节](../v2.5.0_plan.md)

---

## Agent 4 执行记录（已填）

- **命令**: `python3 tools/check_site_md_parity.py` → 退出码 **0**，全量 **38** 个 `site/*.html` 通过。
- **脚本路径**: `tools/check_site_md_parity.py`
- **日期**: 2026-04-04

---

## 脚本建议（可选实现要点）

- 输入：仓库根目录  
- 扫描 `site/*.html`，跳过无互链要求的目录（若有）  
- 对每个 `stem`：检查 `site/md/{stem}.md` 存在；用正则检查文件内 `blob/.../site/md/{stem}.md`  
- `exit 1` 若有错误，便于 CI

---

## 完成定义

- 总计划第七节与执行汇总已填写
- 无未说明的缺页 / 错链
- Git 已提交（含脚本时一并提交）
