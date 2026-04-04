# 发给 Claude Code 的 md2wechat 提示词（可复制）

官方示例来源：[Claude Code · md2wechat](https://www.md2wechat.com/zh/docs/examples/claude-code)

---

## 能力发现后再排版

```
请先运行 md2wechat capabilities --json，确认当前能力后，再把 article.md 转成公众号 HTML，并给我一个预览版本。
```

## 安装并验证再结束

```
请先安装 md2wechat CLI，再安装 md2wechat skill，验证 version 和 capabilities，所有命令成功后再结束。
```

## AI 模式 + 主题

```
请用 md2wechat 的 AI 模式处理 article.md，主题用 autumn-warm，并告诉我当前拿到的是 AI request 还是最终 HTML。
```

---

## 与本仓库知乎稿联用（可选）

将任意一篇稿设为当前任务的 `article.md`，例如：

```bash
cp wemedia/zhihu/articles/13-Memory长期记忆-写入检索与安全.md article.md
```

再在 Claude Code 中使用上述提示词之一。
