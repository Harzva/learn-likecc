---
name: zhihu-publish
description: Use when the task is to publish a Zhihu article from Markdown using the local browser-automation pipeline in this repo. Covers the text-only publishing chain, the multimodal chain that uploads Markdown images into the Zhihu editor, cookie-based login checks, and choosing between the stable text script and the richer multimodal script.
---

# Zhihu Publish

## Overview

This skill uses the repo-local Zhihu publishing scripts under `wemedia/zhihu/` to publish Markdown articles through Zhihu's web editor.

Use it when the user wants to:

- publish a Markdown article to Zhihu
- verify whether `cookies.json` still works
- use the text-only chain first
- try the multimodal chain for Markdown files that contain local images
- overwrite an existing Zhihu article instead of creating a new one
- include generated article visuals from HTML/CSS flow cards or webpage screenshots

## Workflow

### 1. Choose the pipeline

Prefer these paths:

- text only or first-pass stability: `wemedia/zhihu/publish_article_text.js`
- text + Markdown images: `wemedia/zhihu/publish_article_multimodal.js`
- overwrite an existing article: `wemedia/zhihu/edit_article_multimodal.js`

Keep `wemedia/zhihu/publish_article.js` as the general entry if the repo later repoints it, but when reliability matters, call the explicit script.

### 2. Confirm prerequisites

Before publishing:

- `wemedia/zhihu/cookies.json` must exist
- the target Markdown article must exist
- image files referenced by Markdown must exist if using the multimodal path

Useful checks:

```bash
ls -l wemedia/zhihu/cookies.json
ls -l wemedia/zhihu/articles/your-article.md
```

If the article needs images first, generate them before publishing:

- webpage section screenshots: use `webpage-screenshot-md`
- small explainer graphics from HTML/CSS: use `html-card-to-png`

### 3. Run the text pipeline first when risk is unclear

For first-time validation or when the user mainly wants the article live:

```bash
cd wemedia/zhihu
node publish_article_text.js ./articles/your-article.md
```

This is the safest baseline because it has already been proven against the current Zhihu write page selectors.

### 4. Run the multimodal pipeline for image-rich Markdown

When the Markdown body contains image lines like `![alt](../images/foo.png)`:

```bash
cd wemedia/zhihu
node publish_article_multimodal.js ./articles/your-article.md
```

The multimodal script:

- parses Markdown into text/image blocks
- uploads正文图片 into the editor
- keeps the block order
- uses Zhihu-hosted image URLs after upload

### 4.1 Keep the final Zhihu spacing style

Prefer the tighter style that was validated on the final `topic-cc-unpacked` Zhihu article:

- keep text paragraphs compact and avoid many short standalone lines
- place images on their own Markdown line
- do not surround every image with multiple blank blocks in Markdown
- keep one natural separation between text and image, not stacked double gaps
- rewrite short bullet bursts into inline prose when Zhihu would otherwise render them too loosely

The current multimodal scripts were adjusted to preserve this style:

- text-to-text transitions use only the minimum needed separation
- text followed by image does not add an extra stacked blank gap
- image upload spacing is controlled explicitly instead of always inserting double breaks before and after images

Use this as the default compact layout baseline, but not as the only allowed article style.

When the upstream draft clearly fits another mode, keep the spacing baseline while allowing different rhetorical styles, for example:

- unpacked deep-dive
- tool notebook / quick-start
- workflow recipe
- hotspot commentary
- paper reading note

### 5. Overwrite an existing Zhihu article

When the user wants to keep the old article URL and revise text or images in place:

```bash
cd wemedia/zhihu
node edit_article_multimodal.js --article-id 2025288497372643675 ./articles/your-article.md
```

Use this after polishing the Markdown locally. This is the preferred path when the user says "edit the old one" or "overwrite the previous version".

For the current repo, the canonical example is:

- local final draft: `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/22-庖丁解牛专题页-知乎图文终版.md`
- maintained published article: `https://zhuanlan.zhihu.com/p/2025288497372643675`

### 6. Debug strategy

When publishing fails:

- inspect `wemedia/zhihu/debug-*.png`
- verify the current write-page selectors
- check whether the cookie expired or the editor UI changed
- if images show as raw `![...](...)` text, the Markdown parser is failing to split image lines into image blocks
- if images show with huge vertical gaps, the spacing logic around text/image transitions has regressed

## Script Map

- text path: `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/publish_article_text.js`
- multimodal path: `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/publish_article_multimodal.js`
- edit path: `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/edit_article_multimodal.js`
- cookie helper template: `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/make_cookies_template.py`
- article folder: `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles`
- image folder: `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/images`

## Decision Rule

Use this quick rule:

- no images or first-time validation: text pipeline
- local images in Markdown and the user wants a full Zhihu图文稿: multimodal pipeline
- existing published article should be updated in place: edit pipeline

If the multimodal pipeline fails, fall back to text publishing rather than blocking the whole task.

## 已知问题

### 人机验证问题

知乎的反机器人检测非常严格。即使使用 puppeteer-extra-plugin-stealth，headless 模式仍会触发人机验证页面 (`/account/unhuman`)。

**症状**：发布脚本运行后跳转到 `/account/unhuman?type=Q8J2L3` 页面

**原因**：知乎检测到浏览器自动化特征

**解决方案**：
1. 使用有图形界面的环境运行，设置 `headless: false`
2. 在远程服务器上使用 `xvfb-run` 提供虚拟显示
3. 手动发布（见下方手动发布流程）

### 手动发布流程

当自动发布失败时，使用以下流程：

```bash
# 1. 查看文章内容
cat wemedia/zhihu/articles/你的文章.md

# 2. 打开知乎创作中心
# 浏览器访问 https://zhuanlan.zhihu.com/write

# 3. 复制粘贴内容
# - 标题粘贴到标题输入框
# - 正文粘贴到编辑器

# 4. 选择专栏并发布
```

## House Style

Treat this as the default house style for Zhihu in this repo:

- compact paragraphs
- image on its own line
- no stacked blank gaps around images
- fewer loose bullet lists
- prefer overwriting the maintained old article over creating another duplicate test post

Do not over-standardize article voice. Preserve layout consistency, but allow different openings, section rhythms, and closings when the topic warrants it.

Before publishing, do one final anti-template check:

- reduce obvious AI-sounding contrast chains
- especially rewrite repeated `不是……而是……` / `不只是……而是……` structures when they appear as stock rhetorical fillers
- prefer natural technical prose over “反转句式” stacking

Also run one final copy audit before real publication:

1. 去 AI 味道
- remove stock LLM rhetoric
- avoid repeated contrast chains and over-neat summary phrasing

2. 专业化
- keep the article sounding like a technical practitioner
- prefer precise wording over hype or slogan-like claims

3. 自然可读
- reduce explanation drag
- prefer shorter, cleaner sentence rhythm

4. 证据充分
- make sure the main claims still map back to repo evidence, topic pages, scripts, screenshots, or paper references
- if a sentence cannot be grounded, soften or remove it before publishing

Prefer using the dedicated local diagnosis skill before final publish:

```bash
python3 /home/clashuser/hzh/item_bo/learn-likecc/.claude/skills/zhihu-copy-diagnose/scripts/audit_zhihu_copy.py /abs/path/to/article.md
```

If the diagnosis returns `BLOCK`, stop and fix the copy first.
