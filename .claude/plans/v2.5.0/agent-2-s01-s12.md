# Agent 2 上下文 — v2.5.0 主线讲义 S01–S12

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.0_plan.md](../v2.5.0_plan.md)（完成后请在该文件「第五节」同步打钩）

---

## 你的职责

为 **S01–S12** 共 **12** 个 HTML 页面各建立 `site/md/sNN.md`，并在 `sNN.html` 内加入 GitHub MD 互链。

---

## 规范（摘录）

| 项 | 约定 |
|----|------|
| HTML | `site/sNN.html`（NN = 01…12） |
| Markdown | `site/md/sNN.md` |
| GitHub 链接 | `https://github.com/Harzva/learn-likecc/blob/main/site/md/sNN.md` |
| 在线页 | `https://harzva.github.io/learn-likecc/sNN.html` |

**HTML 互链**（放在 `</footer>` 前；若 Agent 1 已加 `.md-source-link` 样式则复用）：

```html
<p class="md-source-link"><a href="https://github.com/Harzva/learn-likecc/blob/main/site/md/s01.md" target="_blank" rel="noopener noreferrer">📝 本站页的 Markdown 源文件（GitHub）</a></p>
```

将 `s01` 改为当前页 `s02`…`s12`。

**MD 顶部模板**：

```markdown
# <与 sNN.html 的 <title> 主标题一致>

> **在线页面**: https://harzva.github.io/learn-likecc/sNN.html  
> **本文件**: `site/md/sNN.md`  
> **说明**: 正文可与 HTML 逐步对齐；当前版本以概要为主。

## 概要

（2～5 句或提纲）

## 正文（可选 / 待补全）
```

---

## 你负责的文件（12）

`s01`, `s02`, `s03`, `s04`, `s05`, `s06`, `s07`, `s08`, `s09`, `s10`, `s11`, `s12`

对应：`site/s01.html` … `site/s12.html`

---

## 任务清单（Agent 2）— 完成后改为 `[x]`

- [x] 为 `s01`–`s12` 各新增 `site/md/sNN.md`
- [x] 在 `s01.html`–`s12.html` 各加入 GitHub MD 互链（stem 与页一致）
- [x] 自检：12 条链接无张冠李戴
- [x] **回写打钩**：本文件清单 + [v2.5.0_plan.md 第五节](../v2.5.0_plan.md)

---

## 完成定义

- `site/md/s01.md` … `site/md/s12.md` 均存在
- 每个 `sNN.html` 含指向 `blob/main/site/md/sNN.md` 的链接
- Git 已提交
