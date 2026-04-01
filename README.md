# Learn Claude Code

> Claude Code 源码分析与深度学习项目 | Source Map 分析 · 架构解析 · 可运行版本

[![GitHub stars](https://img.shields.io/github/stars/Harzva/learn-likecc?style=social)](https://github.com/Harzva/learn-likecc)
[![License](https://img.shields.io/badge/license-Educational-blue)](LICENSE)

---

## 🔥 Source Map 事件

### 什么是 Source Map？

Source Map 是一张**对照表**，告诉调试器压缩代码与源码的对应关系。当它被打入正式发布包后，就变成了**源码导航图**。

### 泄露规模

| 项目 | 数量 |
|------|------|
| TypeScript 源文件 | **1900+** |
| 代码行数 | **51万+** |
| cli.js.map 大小 | **57 MB** |

### 泄露内容

- **工具调用框架** - Tool 定义与调用机制
- **权限控制系统** - 多层权限验证
- **上下文管理** - 消息压缩与优化
- **记忆管理机制** - 长期记忆落地
- **IDE 通信桥接** - Bridge 协议
- **未公开功能** - Buddy, Kairos, Ultraplan 等

---

## 📊 项目状态

### 当前版本: v2.0.7

| 指标 | 状态 |
|------|------|
| 编译错误 | ~2180 (不影响运行) |
| Stub 模块 | 40+ 已创建 |
| 运行状态 | ✅ **可运行** |
| 课程章节 | 12 章完成 |

### 🎉 重大进展

```bash
$ bun run dev --version
0.0.1-learn (Claude Code)

$ bun run dev --help
Usage: claude [options] [command] [prompt]
...
```

### 编译错误趋势

| 版本 | 错误数 | 变化 |
|------|--------|------|
| v2.0.0 | 6099 | 原始状态 |
| v2.0.1 | 2271 | -63% |
| v2.0.3 | 2137 | 可运行 ✅ |
| v2.0.7 | 2180 | CLI 正常 ✅ |

---

## 📁 项目结构

```
learn-likecc/
├── ccsource/
│   ├── claude-code-main/     # 恢复的源码 (可运行)
│   └── CC/cli.js.map         # 原始 Source Map (57MB)
│
├── course/
│   ├── docs/zh/              # 12 章节课程 (S01-S12)
│   └── examples/             # TypeScript 示例代码
│
├── site/                     # 课程网站
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
│
├── EXPERIENCE.md             # 工程经验总结
└── .claude/plans/            # 版本计划与 CHANGELOG
```

---

## 📚 课程内容

### Part 1: 核心架构
- **S01**: Agent Loop - 主循环与状态管理
- **S02**: Tool System - 工具定义与调用
- **S03**: Permission Model - 权限控制与用户交互
- **S04**: Command Interface - CLI 命令处理

### Part 2: 高级特性
- **S05**: Context Compression - 消息压缩与优化
- **S06**: Subagent Fork - 子代理创建与分支
- **S07**: MCP Protocol - Model Context Protocol
- **S08**: Task Management - 任务队列与调度

### Part 3: 扩展与集成
- **S09**: Bridge IDE - IDE 集成与通信
- **S10**: Hooks Extension - 钩子系统
- **S11**: Vim Mode - Vim 键绑定
- **S12**: Git Integration - Git 工作流集成

---

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/Harzva/learn-likecc.git
cd learn-likecc/ccsource/claude-code-main

# 安装依赖 (需要 Bun)
bun install

# 配置 API Key
cp .env.example .env
# 编辑 .env 文件，填入 ANTHROPIC_API_KEY

# 测试运行
bun run dev --version
bun run dev --help

# 管道模式测试
echo "list files" | ANTHROPIC_API_KEY=your-key bun run dev -p
```

---

## 🗓️ 长期计划

### Phase 1: 编译修复 ✅
- ✅ 放宽 tsconfig 配置
- ✅ 创建 40+ stub 模块
- ✅ 程序可运行

### Phase 2: 运行测试 (进行中)
- ✅ 基本命令测试
- ⏳ API 调用测试
- ⏳ 工具调用测试

### Phase 3: 功能恢复
- ⏳ 核心工具恢复
- ⏳ 权限系统完善
- ⏳ MCP 协议支持

### Phase 4: 产品化
- ⏳ 完整功能测试
- ⏳ 文档网站
- ⏳ Release 发布

详见: [long-term-roadmap.md](.claude/plans/long-term-roadmap.md)

---

## 🔗 资源链接

- [Claude Code 官方](https://claude.ai/code)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Source Map 分析](ccsource/CC/cli.js.map.README.md)
- [工程经验](EXPERIENCE.md)

---

## 📝 许可声明

本项目仅供学习研究使用。原始 Claude Code 为 Anthropic 产品。

---

*最后更新: 2026-04-01*