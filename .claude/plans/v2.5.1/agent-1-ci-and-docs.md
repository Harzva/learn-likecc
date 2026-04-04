# Agent 1 上下文 — v2.5.1 CI 与编辑文档

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.1_plan.md](../v2.5.1_plan.md)

---

## 职责

1. 保证 **GitHub Actions** 在变更 `site/**` 或校验脚本时执行 `python3 tools/check_site_md_parity.py`。  
2. 更新 **`site/md/README.md`**：写清编辑政策（HTML 为权威渲染面、MD 为可 PR 的讲义草稿、二者如何协同）。  
3. （可选）在 `tools/` 增加从 HTML 抽取 `h2`/`h3` 的辅助脚本，供 Agent 2–4 粘贴润色。

---

## 参考文件

- 校验脚本：`tools/check_site_md_parity.py`
- workflow：`.github/workflows/site-md-parity.yml`（workflow 名 *Site MD parity check*；job id **`site-md-parity`**）

---

## 任务清单 — 完成后 `[x]`

- [x] `site/md-parity` 或等价 job 在 `push`/`pull_request` 上对 `site/**` 变更运行并通过（见 Actions 绿勾）
- [x] `site/md/README.md` 新增 **编辑政策** 章节（权威源、推荐 PR 流程、与校验脚本关系）
- [x] （可选）`tools/extract_html_headings.py` 或类似：输入 `site/s01.html` 输出 markdown 目录草稿
- [x] **回写打钩**：本文件 + [v2.5.1_plan.md 第四节](../v2.5.1_plan.md)

---

## 完成定义

- `main` 最近一次触及 `site/**` 的提交关联 workflow **成功**
- 文档可读、无与 v2.5.0 互链规则冲突的表述
