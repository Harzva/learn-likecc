# Agent 2 上下文 — v2.5.1 首页 / 教程 / 手册 / 日志 / 专题 MD 深化

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.1_plan.md](../v2.5.1_plan.md)

---

## 职责

对下列 **14** 个 `site/md/<stem>.md` 做**正文深化**：在保留顶部元信息（在线页链接等）前提下，增加：

1. **`## 目录（对照 HTML）`**：按对应 `site/<stem>.html` 中主要章节（`h2`/`h3`）列出锚点或标题文本（不必与 HTML `id` 完全一致，但要可导航）。  
2. **每节 1～3 句摘要**：概括该节在 HTML 中的教学目的；避免大段复制 HTML 全文（版权与维护量）。  

---

## stem 列表（14）

`index`, `index-old`, `tutorial`, `handbook`, `devlog`, `topic-agent`, `topic-rag`, `topic-sourcemap`, `topic-rag-hot`, `topic-rag-papers`, `topic-agent-comparison`, `topic-agent-hot`, `topic-agent-papers`, `topic-source-derived`

---

## 任务清单 — 完成后 `[x]`

- [ ] 上述 14 个 `.md` 均已补充目录 + 摘要（最低标准见上）
- [ ] 未删除或破坏页脚互链说明、顶部 `>` 引用块中的 URL
- [ ] **回写打钩**：本文件 + [v2.5.1_plan.md 第五节](../v2.5.1_plan.md)

---

## 完成定义

- 每个文件可读性明显优于 v2.5.0 占位版
- `python3 tools/check_site_md_parity.py` 仍通过（不修改 HTML 互链规则则自然通过）
