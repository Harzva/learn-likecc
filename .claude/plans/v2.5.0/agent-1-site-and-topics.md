# Agent 1 上下文 — v2.5.0 站点骨架 / 教程 / 手册 / 日志 / 专题页

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.0_plan.md](../v2.5.0_plan.md)（完成后请在该文件「第四节」同步打钩）

---

## 你的职责

为下列 **14 个** HTML 页面各建立 `site/md/<stem>.md`，并在对应 HTML 内加入指向 GitHub 上该 MD 的互链。

---

## 规范（摘录）

| 项 | 约定 |
|----|------|
| HTML | `site/<stem>.html` |
| Markdown | `site/md/<stem>.md` |
| GitHub 链接 | `https://github.com/Harzva/learn-likecc/blob/main/site/md/<stem>.md` |
| 在线页（写入 MD 头部） | `https://harzva.github.io/learn-likecc/<stem>.html` |

**HTML 互链示例**（放在 `</footer>` 前或页脚容器内、`©` 版权行**上方**）：

```html
<p class="md-source-link"><a href="https://github.com/Harzva/learn-likecc/blob/main/site/md/index.md" target="_blank" rel="noopener noreferrer">📝 本站页的 Markdown 源文件（GitHub）</a></p>
```

将 `index` 换成当前页的 `<stem>`。若全站尚无 `.md-source-link` 样式，在 `site/css/style.css` 增加：

```css
.md-source-link {
    text-align: center;
    margin: 0.75rem 0 0;
    font-size: 0.875rem;
}
.md-source-link a { color: var(--text-muted); }
.md-source-link a:hover { color: var(--primary); }
```

**每个 `site/md/<stem>.md` 顶部模板**：

```markdown
# <与对应 HTML 的 <title> 主标题一致>

> **在线页面**: https://harzva.github.io/learn-likecc/<stem>.html  
> **本文件**: `site/md/<stem>.md`  
> **说明**: 正文可与 HTML 逐步对齐；当前版本以概要为主。

## 概要

（2～5 句或小节提纲）

## 正文（可选 / 待补全）
```

第一期**不要求** MD 与 HTML 全文等价。

---

## 你负责的 stem 列表（14）

| stem | HTML 文件 |
|------|-----------|
| `index` | `site/index.html` |
| `index-old` | `site/index-old.html` |
| `tutorial` | `site/tutorial.html` |
| `handbook` | `site/handbook.html` |
| `devlog` | `site/devlog.html` |
| `topic-agent` | `site/topic-agent.html` |
| `topic-rag` | `site/topic-rag.html` |
| `topic-sourcemap` | `site/topic-sourcemap.html` |
| `topic-rag-hot` | `site/topic-rag-hot.html` |
| `topic-rag-papers` | `site/topic-rag-papers.html` |
| `topic-agent-comparison` | `site/topic-agent-comparison.html` |
| `topic-agent-hot` | `site/topic-agent-hot.html` |
| `topic-agent-papers` | `site/topic-agent-papers.html` |
| `topic-source-derived` | `site/topic-source-derived.html` |

---

## 任务清单（Agent 1）— 完成后改为 `[x]`

- [x] 创建 `site/md/README.md`（说明目录用途、`stem` 与 `.html` 对应规则）
- [x] 为上表 14 个 `stem` 各新增 `site/md/<stem>.md`
- [x] 在 14 个 HTML 中加入互链（`blob/main/site/md/<stem>.md`）
- [x] 如需统一样式，在 `site/css/style.css` 增加 `.md-source-link`
- [x] 自检：每页链接 stem 与文件名一致；推送后 GitHub blob 可打开
- [x] **回写打钩**：本文件清单 + [v2.5.0_plan.md 第四节](../v2.5.0_plan.md)

---

## 完成定义

- `site/md/` 下存在 `README.md` + 上表 14 个 `.md`
- 14 个 HTML 均可点击到达正确 GitHub MD
- Git 已提交（建议一条或按逻辑拆分的 commit）
