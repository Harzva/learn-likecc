# 微信公众号侧工具链（wemedia/wechat）

本目录收录 **Markdown → 微信公众号排版** 相关备忘，与 `wemedia/zhihu/`（知乎稿、自动发布）并列：**知乎长文先在仓库里用 Markdown 维护**，需要发公众号时，可走 **md2wechat**（CLI + Claude Code Skill）生成 HTML / 草稿流程。

**自测 CLI/发布是否打通、与知乎方案对照**：见 [`../知乎与公众号Markdown发布-对照与自测.md`](../知乎与公众号Markdown发布-对照与自测.md)。

## 官方文档（权威）

- **Claude Code 接入示例（原文）**：[md2wechat · Claude Code](https://www.md2wechat.com/zh/docs/examples/claude-code)
- **Coding Agents 总览**：[Coding Agents](https://www.md2wechat.com/zh/docs/examples/coding-agents)
- **Agent API 文档入口**：[Markdown 转微信公众号 API 文档](https://www.md2wechat.com/zh/docs)

## 本仓库内文档

| 文件 | 说明 |
|------|------|
| [`Claude-Code-md2wechat接入备忘.md`](Claude-Code-md2wechat接入备忘.md) | 安装 CLI、安装 skill、discovery、提示词模板、注意事项（与官网同步维护时以官网为准） |
| [`prompts-claude-code-md2wechat.md`](prompts-claude-code-md2wechat.md) | 可直接粘贴给 Claude Code 的短提示词合集 |

## 与知乎稿的衔接

- 深度稿目录：`wemedia/zhihu/articles/*.md`  
- 典型用法：任选一篇或合并节选为 `article.md`，在 Claude Code 中按备忘调用 `md2wechat` 做排版或走 API/AI 模式（详见备忘中的「注意事项」）。

## 凭证与安全

- 创建草稿、上传素材需要 **微信公众平台凭证**；**API 模式**另需 md2wechat.cn 的 API Key。  
- **勿将密钥提交到 Git**；本地配置见仓库根目录惯例，本目录已提供 `.gitignore` 提示常见敏感文件名。

---

*与 Anthropic / md2wechat 官方无隶属关系；命令与版本以官网文档为准。*
