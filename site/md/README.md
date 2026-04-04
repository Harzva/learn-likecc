# `site/md/` — 站点页面 Markdown 镜像

本目录存放与 `site/<stem>.html` **一一对应**的 Markdown 源文件，便于在 GitHub 上审阅、提 PR 与纯文本阅读。

## 命名规则

- **stem**：与 HTML 文件名相同、不含扩展名。例如 `site/tutorial.html` ↔ `site/md/tutorial.md`。
- **GitHub 原文**：`https://github.com/Harzva/learn-likecc/blob/main/site/md/<stem>.md`
- **在线页面**（GitHub Pages）：`https://harzva.github.io/learn-likecc/<stem>.html`

## 与 HTML 的关系（v2.5.0）

首版以元信息、在线页链接与**概要**为主；正文可与 HTML 逐步对齐，不要求首版全文等价。

## 各页 HTML 入口

每个对外 HTML 页脚区域提供「Markdown 源文件（GitHub）」链接，stem 与当前页文件名一致。

## 校验（v2.5.0）

仓库根目录执行：

```bash
python3 tools/check_site_md_parity.py
```

应输出 `OK (38 html, ...)`。下一阶段（**v2.5.1**）见 `.claude/plans/v2.5.1_plan.md`：深化 MD 正文与 CI 常态化校验。
