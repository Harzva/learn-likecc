# Claude Code 接入 md2wechat：公众号排版能力备忘

> **原文档**：[Claude Code | md2wechat Agent API](https://www.md2wechat.com/zh/docs/examples/claude-code)  
> 下文根据该页整理，**安装命令与版本号可能随官方更新**；冲突时以官网为准。

---

## 推荐路径

Claude Code 较稳妥的顺序是 **CLI 与 skill 分开装**：

1. 先装 `md2wechat` **CLI**  
2. 再装 `md2wechat` **skill**  
3. 先做 **discovery**（`capabilities` 等），再让 Claude 排版或走草稿流程  

---

## 第一步：安装 CLI

已有 Node / npm 时优先：

```bash
npm install -g @geekjourneyx/md2wechat
```

macOS 若习惯 Homebrew：

```bash
brew install geekjourneyx/tap/md2wechat
```

已有稳定 Go 环境时（**版本以官网为准**，此处为文档页当时示例）：

```bash
go install github.com/geekjourneyx/md2wechat-skill/cmd/md2wechat@v2.0.7
```

兜底安装脚本（版本同以发布页为准）：

```bash
curl -fsSL https://github.com/geekjourneyx/md2wechat-skill/releases/download/v2.0.7/install.sh | bash
export PATH="$HOME/.local/bin:$PATH"
```

---

## 第二步：安装 skill

推荐：

```bash
npx skills add https://github.com/geekjourneyx/md2wechat-skill --skill md2wechat
```

Claude Code **插件市场**方式：

```bash
/plugin marketplace add geekjourneyx/md2wechat-skill
/plugin install md2wechat@geekjourneyx-md2wechat-skill
```

---

## 第三步：验证运行时（不要跳过 discovery）

```bash
md2wechat version --json
md2wechat config init
md2wechat capabilities --json
md2wechat themes list --json
md2wechat providers list --json
```

**说明**：discovery 用来确认 **当前 CLI 真实能力边界**，避免 Agent 假设了不存在的子命令或参数。

---

## 第四步：发给 Claude Code 的提示词（示例）

可直接复制到对话（也可拆到 `prompts-claude-code-md2wechat.md`）：

```
请先运行 md2wechat capabilities --json，确认当前能力后，再把 article.md 转成公众号 HTML，并给我一个预览版本。
```

```
请先安装 md2wechat CLI，再安装 md2wechat skill，验证 version 和 capabilities，所有命令成功后再结束。
```

```
请用 md2wechat 的 AI 模式处理 article.md，主题用 autumn-warm，并告诉我当前拿到的是 AI request 还是最终 HTML。
```

**与本仓库配合**：将 `wemedia/zhihu/articles/` 中某篇复制或软链为工作区内的 `article.md`，再执行上述流程。

---

## 注意事项（官网摘要）

- `npx skills add` **只装 skill**，**不会**自动安装 CLI。  
- `convert` **不传 `--mode`** 时默认走 **API 模式**。  
- 要 **创建草稿** 或 **上传素材**，仍需要 **微信侧凭证**；API 模式还需要 **md2wechat.cn 的 API Key**（勿写入仓库）。  
- **AI 模式**返回的是供外部模型继续处理的 **结构化输出**，**不等于**直接得到最终 HTML；与 API 模式语义不同，需按文档区分。

---

## 继续阅读

- [md2wechat-skill 使用指南](https://www.md2wechat.com/docs/skills/md2wechat-skill-guide)  
- [md2wechat-skill FAQ](https://www.md2wechat.com/docs/skills/md2wechat-skill-faq)  
- [Coding Agents 总览](https://www.md2wechat.com/docs/examples/coding-agents)

---

*仓库路径：`wemedia/wechat/Claude-Code-md2wechat接入备忘.md`*
