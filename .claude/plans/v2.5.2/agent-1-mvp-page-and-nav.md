# Agent 1 上下文 — v2.5.2 MVP 导览页 + 导航入口

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.2_plan.md](../v2.5.2_plan.md)

---

## 职责

1. **选定 `stem`**（建议 `topic-cc-unpacked-zh`，与现有 `topic-*.html` 命名一致；若过长可改用 `cc-unpacked-zh` —— **须与 Agent 3 同一 stem**）。
2. 新建 `site/<stem>.html`：实现 v2.5.2 总计划 **第三节** 五区块 IA，**全中文**；每块有导语 + 列表/卡片 + 指向现有 `sNN`/`dNN`/专题的链接。
3. **署名**：显著位置放置对 [ccunpacked.dev](https://ccunpacked.dev/) 的「版式与策展参考」说明 + 本站内容独立声明。
4. **版本锚定**：写明导览所依据的 `ccsource/claude-code-main` **commit SHA 或日期**（可与 `git rev-parse` 或文档一致）。
5. **导航**：在 `site/index.html` 主导航栏增加入口（文案简短，如 **「解构」** 或 **「CC 导览」**，`title` 可写全名）；若项目要求侧栏同步，更新 `site/js/app.js` 中 `site-sidebar` 片段。

---

## 规范摘录

- 样式：复用 `site/css/style.css` 现有 **专题页 / course-main** 类布局，**不**引入新框架。
- 统计数字（文件数、行数等）：与 **首页 hero** 或当期 `ccsource` 实测口径一致；若暂时沿用首页数字，在页内脚注说明「与首页同源」。
- **不写**巨型工具/命令全文首版：每组 **代表性条目 +「完整列表见讲义 / 源码检索」** 即可。

---

## 任务清单 — 完成后 `[x]`

- [ ] `site/<stem>.html` 存在且五区块完整、中文、链接可点
- [ ] ccunpacked **参考致谢** + **源码版本锚定** 已写
- [ ] `index.html` 已加入口（及侧栏若适用）
- [ ] **回写打钩**：本文件 + [v2.5.2_plan.md 第七节](../v2.5.2_plan.md)

---

## 完成定义

- 本地打开该页无需额外构建；移动端首屏与锚点导航可用
- `stem` 已告知 Agent 2/3（或在总计划第七节填写最终 stem）
