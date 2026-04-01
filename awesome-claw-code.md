# Awesome Claude Code Repositories

> 收集所有与泄露 Claude Code 相关的开源仓库

## 官方 (Anthropic)

| 仓库 | 描述 | 语言 | 状态 |
|------|------|------|------|
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | Anthropic 官方 Claude Code CLI | TypeScript | 官方闭源 |

---

## 逆向工程项目

### 完整恢复项目

| 仓库 | 描述 | 语言 | 编译错误 | Stars |
|------|------|------|----------|-------|
| [instructkr/claw-code](https://github.com/instructkr/claw-code) | Python/Rust 重写版，最快达到 50K stars | Python + Rust | 0 | ![Stars](https://img.shields.io/github/stars/instructkr/claw-code) |
| [Harzva/learn-likecc](https://github.com/Harzva/learn-likecc) | 学习项目：逆向工程 + 课程体系 | TypeScript | ~2180 | ![Stars](https://img.shields.io/github/stars/Harzva/learn-likecc) |

### TypeScript/JavaScript 项目

| 仓库 | 描述 | 语言 | 编译错误 | Stars |
|------|------|------|----------|-------|
| [open-claude-code](https://github.com/user/open-claude-code) | 基于 2.1.88 版本恢复 | TypeScript | 0 | - |
| [claude-code2 (CCB)](https://github.com/user/claude-code2) | 反编译修复版 | TypeScript | ~1341 | - |
| [leaked-claude-code](https://github.com/user/leaked-claude-code) | 源码泄露版本 | TypeScript | 0 | - |

---

## 项目对比

| 项目 | 运行时 | 编译错误 | 可运行 | 功能完整度 |
|------|--------|----------|--------|------------|
| **claw-code** | Python + Rust | 0 | ✅ | 重写实现 |
| **open-claude-code** | Node.js + Bun | 0 | ✅ | 核心 |
| **claude-code2** | Bun | ~294 | ✅ | 核心+扩展 |
| **learn-likecc** | Bun | ~2180 | ✅ | 核心 |

---

## 参考资源

### 分析文档

- [Claude Code 架构分析](./course/) - 本项目课程
- [RECORD.md](./reference/claude-code2/RECORD.md) - 运行记录
- [CLAUDE.md](./reference/claude-code2/CLAUDE.md) - 开发指南
- [PARITY.md](./reference/claw-code/PARITY.md) - 功能对齐

### 技术栈

| 组件 | 官方 | claw-code | 其他项目 |
|------|------|-----------|----------|
| 运行时 | Bun | Python/Rust | Bun |
| UI 框架 | Ink | Rich/Textual | Ink |
| API | Anthropic SDK | 自实现 | Anthropic SDK |
| 工具系统 | 内置 | 自实现 | 内置 |

---

## 相关社区

- [Linux.do](https://linux.do/) - 讨论 Claude Code 逆向
- [GitHub Discussions](https://github.com/instructkr/claw-code/discussions) - claw-code 社区

---

## 免责声明

本汇总仅供学习研究使用。所有仓库内容的版权归原权利人所有。使用者应自行承担风险。

---

## 贡献

欢迎提交 PR 添加新的相关仓库！

---

*最后更新: 2026-04-01*
