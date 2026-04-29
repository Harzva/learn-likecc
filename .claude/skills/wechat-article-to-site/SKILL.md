# WeChat Article to Site Page

将微信公众号文章转化为 learn-likecc 专题页面的标准化流程。

## 触发条件

用户发送微信公众号文章链接（mp.weixin.qq.com），要求：
- 分析文章核心内容
- 整合到 learn-likecc 站点某个专题下
- 完成后 commit + 部署

## 执行流程

### 1. 文章获取与分析

使用 `kimi_fetch` 抓取文章内容。

分析维度：
- 主题归类：判断文章最适合放入哪个现有专题（庖丁解牛 / 工具链 / Agent / AI-Scientist / Design-UI 等）
- 内容密度：是否适合作为独立子页面，还是融入现有页面
- 核心价值：提取可执行步骤、数据对比、配置模板等

### 2. 页面规划

决策树：
```
文章主题与现有专题匹配度高？
  YES → 融入现有页面（新增 section）
  NO  → 创建新页面（独立子专题）
```

页面命名规范：
- 融入现有：`site/topic-{专题名}.html` 内新增 `<section id="...">`
- 独立页面：`site/topic-{主题}-guide.html` 或 `site/topic-{主题}-notes.html`

### 3. 页面构建

必须遵循的模板结构（参考 `topic-cc-unpacked-zh.html`）：

```html
<!DOCTYPE html>
<html lang="zh-CN" data-site-sidebar="">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{标题} - Everything in Claude-Code</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" href="data:image/svg+xml,...">
    <meta name="description" content="{描述}">
    <meta name="page:updated" content="{YYYY-MM-DD}">
</head>
<body class="{page-class}">
    <nav class="navbar">...</nav>
    <section class="hero handbook-hero">
        <!-- Hero badge + title + subtitle + stats strip + actions -->
    </section>
    <main class="course-main devlog-main">
        <div class="container container--layout-wide">
            <article class="course-content devlog-content">
                <!-- 核心内容 section -->
                <div class="chapter-navigation">...</div>
            </article>
        </div>
    </main>
    <footer class="footer">...</footer>
    <script src="js/app.js"></script>
</body>
</html>
```

排版规范：
- **不写"参考来源"section，不写"原文来自哪个公众号"**。页面即内容，来源只在 commit message 中记录。
- Hero 区域必须包含：badge、title、subtitle、stats strip（4 个关键数字）
- 正文用 `<section class="section-block">` 包裹
- 代码块用 `<pre><code class="language-{lang}">`
- 表格用 `<table class="comparison-table">`（带 thead/tbody）
- 工具/组件展示用卡片网格（`tool-grid` + `tool-card`），卡片要统一高度、限制描述行数
- 末尾必须有 `chapter-navigation` 和 `footer`
- CSS 变量兼容：使用 `var(--primary)` 等，不硬编码颜色

### 4. 导航更新

创建或更新页面后，必须同步更新：
- 父专题页面内的导航链接（`<div class="nav-links">`）
- 首页 `index.html` 中相关专题的引用
- `site/data/site-topic-index.json`（如果存在）

### 5. 样式补充

如果新页面需要专属样式：
1. 优先复用现有 CSS 类（`.section-block`, `.tool-grid`, `.comparison-table` 等）
2. 确需新增时，追加到 `site/css/style.css` 末尾，使用页面级命名空间：
   ```css
   .{page-class} .new-component { ... }
   ```
3. **卡片布局必须**：统一高度、适当 gap（1.5rem）、最小宽度 320px、描述文字限制 3 行

### 6. 验证与提交

**必须执行的本地检查（防止 CI 失败）**：

```bash
cd ~/learn-likecc
# 1. 检查 git tracking
python3 tools/check_site_git_tracking.py
# 2. 检查 md 源文件和 blob URL
python3 tools/check_site_md_parity.py
# 3. 检查 cc-overview 一致性（如果改了 topic-cc-unpacked-zh.html）
python3 tools/gen_cc_overview.py --check
# 4. 检查 treemap 一致性
python3 tools/gen_cc_arch_treemap.py --verify-in-sync
# 5. 检查 loop steps schema
python3 tools/check_cc_loop_steps.py
```

**验证清单**：
- [ ] 文件路径正确（在 `site/` 目录下）
- [ ] HTML 结构完整（DOCTYPE → html → head → body → nav → hero → main → footer → script）
- [ ] CSS 变量兼容（使用 `var(--primary)` 等，不硬编码颜色）
- [ ] 响应式（viewport meta 已设置，布局用 flex/grid）
- [ ] 导航链接可点击（相对路径正确）
- [ ] **没有"参考来源"section**
- [ ] 卡片布局整齐、高度一致、gap 适当
- [ ] **✅ 创建了对应的 `site/md/{文件名}.md` 源文件**
- [ ] **✅ HTML footer 中包含 GitHub blob URL：`https://github.com/Harzva/learn-likecc/blob/main/site/md/{文件名}.md`**

**提交规范**：
```bash
cd ~/learn-likecc
git add -A
git commit -m "feat(site): add {主题} guide from WeChat article

- 来源：微信公众号「{公众号}」{作者}
- 页面：site/{文件名}.html
- 归属：{专题名}专题
- 核心内容：{一句话 summary}"
git push origin main
```

### 7. 部署确认

GitHub Actions 会自动部署（`deploy.yml` 监听 `site/**` 变更）。

用户可以通过以下 URL 验证：
```
https://harzva.github.io/learn-likecc/{文件名}.html
```

## 已落地示例

| 文章 | 页面 | 专题归属 |
|------|------|----------|
| 微信公众号「安全手札」c4bbage：《基于源码逆向分析，从代码层面还原 Claude Code 真正需要什么》 | `site/topic-cc-tooling-guide.html` | 工具链专题 |

## 注意事项

- 微信公众号文章可能包含格式混乱的代码块，需要人工清洗
- 优先保留原文的核心结论和可执行步骤，去除营销话术
- Token 经济学类内容需要保留量化数据对比
- 配置类内容需要给出 macOS / Ubuntu 双平台方案
- 图片资源：微信文章图片外链通常无法直接引用，需截图或替换为文字描述
- **排版优先**：卡片统一高度、适当留白、不要挤在一起
- **⚠️ 关键教训（2026-04-29）**：创建新页面后必须同步创建 `site/md/{文件名}.md` 源文件，并在 HTML footer 中添加 GitHub blob URL，否则 `check_site_md_parity.py` 会导致 CI 失败。这是已验证的教训，不要重复犯。
