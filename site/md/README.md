# `site/md/` — 站点页面 Markdown 镜像

本目录存放与 `site/<stem>.html` **一一对应**的 Markdown 源文件，便于在 GitHub 上审阅、提 PR 与纯文本阅读。

## 命名规则

- **stem**：与 HTML 文件名相同、不含扩展名。例如 `site/tutorial.html` ↔ `site/md/tutorial.md`。
- **GitHub 原文**：`https://github.com/Harzva/learn-likecc/blob/main/site/md/<stem>.md`
- **在线页面**（GitHub Pages）：`https://harzva.github.io/learn-likecc/<stem>.html`

## 编辑政策（v2.5.1）

### 谁是权威？

- **HTML（`site/<stem>.html`）**：面向读者的**权威渲染面**。版式、图表、代码 Tab、侧栏与 GitHub Pages 上实际展示的内容以 HTML 为准。
- **Markdown（`site/md/<stem>.md`）**：与 HTML **成对存在**的讲义草稿 / 镜像，适合 diff、评审与长文协作；**不要求**与 HTML 字节级一致，但应避免与 HTML **明显矛盾**（事实、章节顺序、术语）。

默认协同方式：**先改 HTML（若需动站点呈现），再让 MD 跟进摘要与目录**；仅改文案润色且不影响页面结构时，可只改 MD 或只改 HTML，但合并前应自检二者不冲突。

### 推荐 PR 流程

1. 若变更影响站点页面：在 PR 描述中注明触及的 `stem` 列表。
2. 新增独立页面时：同时添加 `site/<stem>.html`、`site/md/<stem>.md`，并在 HTML 页脚加入指向 `blob/main/site/md/<stem>.md` 的互链（见下文「各页 HTML 入口」）。
3. 深化 MD 正文时：保留文件顶部元信息块（在线页、`site/md/...` 路径、说明）；在「概要」下可增「目录（对照 HTML）」与各节短摘要（见 v2.5.1 计划）。

### 与校验脚本、CI 的关系

- 本地或 CI 会运行 `tools/check_site_md_parity.py`（workflow：**Site MD parity check** / job **`site-md-parity`**）。
- 脚本要求：每个 `site/*.html`（除无对应约定外）存在同 stem 的 `site/md/<stem>.md`，且 HTML 内至少有一处正确的 GitHub blob 链接，路径中的 **stem 必须与当前 HTML 文件名一致**；`README.md` 不参与成对校验。
- PR 或推送到 `main`/`master` 且改动 `site/**`、该脚本或对应 workflow 时，应看到该检查**通过**后再合并。

### 与 v2.5.0 互链规则

上述 blob URL 前缀、stem 与文件名一致、页脚互链等约定与 **v2.5.0** 计划一致；本节的「编辑政策」是对**内容维护策略**的补充，不替代互链与命名规则。

## 与 HTML 的关系（v2.5.0）

首版以元信息、在线页链接与**概要**为主；正文可与 HTML 逐步对齐，不要求首版全文等价。v2.5.1 起鼓励在 MD 中补充对照 HTML 的目录与节摘要（见总计划 `.claude/plans/v2.5.1_plan.md`）。

## 各页 HTML 入口

每个对外 HTML 页脚区域提供「Markdown 源文件（GitHub）」链接，stem 与当前页文件名一致。

## 辅助：从 HTML 抽标题草稿

从某页 HTML 抽取 `h2` / `h3` 生成 Markdown 目录草稿（需人工校对、可删导航噪声）：

```bash
python3 tools/extract_html_headings.py site/s01.html
python3 tools/extract_html_headings.py --stem tutorial
python3 tools/extract_html_headings.py site/handbook.html --flat
```

## 校验

仓库根目录执行：

```bash
python3 tools/check_site_md_parity.py
```

应输出 `OK (38 html, ...)`。
