# reference_agent · 插件与 Agent 工具对照用克隆

本目录存放**为撰稿与对照分析**而 `git clone --depth 1` 的第三方仓库；**非 submodule**。更新快照：

```bash
cd reference/reference_agent/superpowers-marketplace && git pull
cd ../autoresearch && git pull
```

## 当前克隆

| 目录 | 上游 | 用途 |
|------|------|------|
| `superpowers-marketplace/` | [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace) | Claude Code **插件市场目录**：`marketplace.json` 聚合多个插件（含 Superpowers 核心等） |
| `autoresearch/` | [uditgoenka/autoresearch](https://github.com/uditgoenka/autoresearch) | **单一插件**：Karpathy 式自主改进循环 + 10 条子命令 |

本站长文与知乎稿见：`wemedia/zhihu/articles/21-…`、`site/topic-superpowers-autoresearch.html`。

> 若你本地另有 `AgentGuide/` 等大块参考，可并列放在本目录下；未写入 `.gitignore` 白名单的文件夹仍会被忽略规则挡住，需要时请仿照上表在根 `.gitignore` 增加 `!` 规则。
