# Agent 3 上下文 — v2.5.0 深挖讲义 D01–D12

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.0_plan.md](../v2.5.0_plan.md)（完成后请在该文件「第六节」同步打钩）

---

## 你的职责

为 **D01–D12** 共 **12** 个 HTML 页面各建立 `site/md/dNN.md`，并在 `dNN.html` 内加入 GitHub MD 互链。

---

## 规范（摘录）

| 项 | 约定 |
|----|------|
| HTML | `site/dNN.html`（NN = 01…12） |
| Markdown | `site/md/dNN.md` |
| GitHub 链接 | `https://github.com/Harzva/learn-likecc/blob/main/site/md/dNN.md` |
| 在线页 | `https://harzva.github.io/learn-likecc/dNN.html` |

**HTML 互链**（放在 `</footer>` 前；复用 `.md-source-link` 若已存在）：

```html
<p class="md-source-link"><a href="https://github.com/Harzva/learn-likecc/blob/main/site/md/d01.md" target="_blank" rel="noopener noreferrer">📝 本站页的 Markdown 源文件（GitHub）</a></p>
```

将 `d01` 改为当前页 `d02`…`d12`。

**MD 顶部模板**：

```markdown
# <与 dNN.html 的 <title> 主标题一致>

> **在线页面**: https://harzva.github.io/learn-likecc/dNN.html  
> **本文件**: `site/md/dNN.md`  
> **说明**: 正文可与 HTML 逐步对齐；当前版本以概要为主。

## 概要

（2～5 句或提纲）

## 正文（可选 / 待补全）
```

---

## 你负责的文件（12）

`d01`, `d02`, `d03`, `d04`, `d05`, `d06`, `d07`, `d08`, `d09`, `d10`, `d11`, `d12`

对应：`site/d01.html` … `site/d12.html`

---

## 任务清单（Agent 3）— 完成后改为 `[x]`

- [x] 为 `d01`–`d12` 各新增 `site/md/dNN.md`
- [x] 在 `d01.html`–`d12.html` 各加入 GitHub MD 互链（stem 与页一致）
- [x] 自检：12 条链接无张冠李戴
- [x] **回写打钩**：本文件清单 + [v2.5.0_plan.md 第六节](../v2.5.0_plan.md)

---

## 完成定义

- `site/md/d01.md` … `site/md/d12.md` 均存在
- 每个 `dNN.html` 含指向 `blob/main/site/md/dNN.md` 的链接
- Git 已提交
