# 知乎稿目录说明与撰稿证据约定

## 自动化发布原理（本仓库实现）

知乎侧**不是**走知乎开放 API，而是用 **无头浏览器自动化**：

1. **`puppeteer-extra` + `puppeteer-extra-plugin-stealth`**：在 Chromium 里打开页面，并降低「自动化特征」被前端脚本识别的概率。  
2. **会话凭证**：从本地 `cookies.json` 读入 Cookie，`page.setCookie` 注入后访问 `https://zhuanlan.zhihu.com/write`。  
3. **DOM 操作**：用选择器定位标题输入框、正文区（`contenteditable` / Draft 类容器），**模拟键盘输入**（`keyboard.type` + 分段延迟），再尝试点击「发布」类按钮。  
4. **Markdown**：`publish_article.js` 用首行 `# 标题` 拆标题与正文；正文当前发布路径按**纯文本分段键入**，`marked` 生成的 `htmlContent` 在现有主流程中**未参与粘贴**（若需富文本可再改脚本）。

详见上级目录 [`../README.md`](../README.md) 与实现 [`../publish_article.js`](../publish_article.js)。

---

## 撰稿与「是否瞎编」的约定

本仓库的 **课程与源码讲义**以 `ccsource/`、`tools/`、`site/` 为准；`articles/*.md` 中部分内容历史上来自**社区对泄露版 Claude Code 的讨论或示意图归纳**，与 **Anthropic 闭源现行实现**或**本仓库快照**未必逐行一致。

**新写或重大改写**的稿件建议同时满足：

1. **可核对**：关键论断末尾或文首「声明」里列出 **本仓库路径**（例如 `ccsource/claude-code-main/...`）或 **官方文档 URL**，避免只有比喻没有出处。  
2. **分层表述**：  
   - **A 类**：直接引用本仓库已跟踪的源码（文件 + 符号名）。  
   - **B 类**：架构/产品机制归纳（须写「根据公开讨论/示意图」并避免假装逐行对照闭源）。  
3. **Harness 通识稿**（如 14–20）：若一时无对应本仓库单行代码，须在声明中写明 **「工程通识，非单指本 tree 某一提交」**，且不与 A 类事实句混排而不加区分。

需要把某篇旧稿 **升格为 A 类** 时：在文内增加「证据」小节，用反引号路径链到 `ccsource` 具体文件。

---

*发布前请遵守知乎平台规则与本目录上级 README 中的频率、Cookie 安全提示。*
