# Claude Code 工具链配置指南

## 必装工具（5）

| 工具 | 作用 |
|---|---|
| git | 版本控制基础 |
| rg (ripgrep) | 快速代码搜索 |
| gh (GitHub CLI) | GitHub 操作 |
| tmux | 会话复用 |
| poppler | PDF 处理 |

## 推荐套件（4）

| 工具 | 作用 |
|---|---|
| ast-grep | AST 级代码搜索与重构 |
| fd | 快速文件查找 |
| jq | JSON 处理 |
| git-delta | 语法高亮 diff |

## 语言服务器

- TypeScript：`typescript-language-server`
- Python：`pyright`

## 配置要点

- `CLAUDE.md`：项目级系统提示词
- `settings.json`：工具别名与自定义命令

## Token 经济学

| 工具 | 每 1000 次调用 cost |
|---|---|
| Claude Code 内置 | ~$0.25 |
| 外部 API 调用 | 视模型而定 |

## 一键安装脚本

见页面内嵌的 macOS/Linux 安装脚本。

## 验证脚本

```bash
./scripts/verify-claude-code-tooling.sh
```
