## Pipeline Notes

- `webpage-screenshot-md`: captures webpage sections and inserts image references into Markdown drafts.
- `html-card-to-png`: renders small article graphics from HTML/CSS when Mermaid is unavailable or too loose.
- `publish_article_text.js`: stable baseline for current Zhihu editor selectors.
- `publish_article_multimodal.js`: parses standalone Markdown image blocks and uploads them through the正文图片 input.
- `edit_article_multimodal.js`: overwrites an existing Zhihu article in place through the `/edit` page.
- Both scripts require `wemedia/zhihu/cookies.json`.
- Debug screenshots are written to `wemedia/zhihu/debug-*.png`.
- The validated spacing style is the tighter `topic-cc-unpacked` layout: compact paragraphs, image-on-own-line, and no large stacked blank areas around images.

## Recommended Skill Stack

For a polished Zhihu article workflow, use the skills in this order:

1. `webpage-screenshot-md`
   Capture strong webpage sections and insert image references into the working Markdown.
2. `html-card-to-png`
   Replace loose bullets or text-heavy explanations with compact custom visuals.
3. local article editing
   Rewrite the Markdown into a Zhihu-friendly draft with tighter spacing and fewer stray lines.
4. `zhihu-publish`
   Publish a new article or overwrite an existing one with the multimodal pipeline.

## Current Canonical Example

- Local final draft:
  `/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/22-庖丁解牛专题页-知乎图文终版.md`
- Maintained Zhihu URL:
  `https://zhuanlan.zhihu.com/p/2025288497372643675`

Use this pair as the reference example for layout, image spacing, and overwrite-in-place workflow.

## Missing But Useful Future Skills

- a `zhihu-md-polish` style skill for converting raw Markdown into Zhihu-friendly prose and spacing
- a `zhihu-review` style skill for preflight checks such as duplicate paragraphs, overly loose lists, and image placement balance
