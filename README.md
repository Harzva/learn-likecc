# Learn Claude Code

> Claude Code 源码分析与深度学习项目 | Source Map 分析 · 架构解析 · 可运行版本

[![Website](https://img.shields.io/badge/Website-在线课程-orange)](https://harzva.github.io/learn-likecc/)
[![GitHub stars](https://img.shields.io/github/stars/Harzva/learn-likecc?style=social)](https://github.com/Harzva/learn-likecc)
[![License](https://img.shields.io/badge/license-Educational-blue)](LICENSE)

---

## 在线课程站点预览

以下为 [GitHub Pages 在线站点](https://harzva.github.io/learn-likecc/) 界面截图：侧栏导航、顶栏搜索与 **12 章源码课程**卡片（主线 / 深挖入口、预估阅读时长等）。实际布局与文案以线上版本为准。

![Claude Code Course 在线站点：课程章节网格与导航](docs/readme-assets/course-site-preview.jpg)

---

## 🔥 Source Map 事件

### 什么是 Source Map？

Source Map 是一张**对照表**，告诉调试器压缩代码与源码的对应关系。当它被打入正式发布包后，就变成了**源码导航图**。

### 事件规模

| 项目 | 数量 |
|------|------|
| TypeScript 源文件 | **1900+** |
| 代码行数 | **51万+** |
| cli.js.map 大小 | **57 MB** |

### 分析内容

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
├── bin/
│   └── likecode              # 全局 PATH 后可执行：启动 ccsource CLI
├── ccsource/
│   ├── claude-code-main/     # 恢复的源码 (可运行)
│   └── CC/cli.js.map         # 原始 Source Map (57MB)
│
├── course/
│   ├── docs/zh/              # 12 章节课程 (S01-S12)
│   └── examples/             # TypeScript 示例代码
│
├── site/                     # 课程网站（含专栏页 column-agent-journey 等）
│   ├── index.html
│   ├── md/                   # 与 HTML 成对的 Markdown 镜像
│   ├── css/style.css
│   └── js/app.js
│
├── docs/readme-assets/        # README 用截图等（如 course-site-preview.jpg）
│
├── wemedia/zhihu/articles/   # 知乎等平台待发 / 已发稿 Markdown
├── wemedia/wechat/           # 微信公众号：md2wechat + Claude Code 接入备忘
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

### 终端全局命令 `likecode`

仓库根目录提供启动脚本 **`bin/likecode`**：在任意目录输入 `likecode` 即等同于在 `ccsource/claude-code-main` 下执行 `bun run src/entrypoints/cli.tsx`。

```bash
# 1) 赋予执行权限（克隆后执行一次）
chmod +x /path/to/learn-likecc/bin/likecode

# 2) 加入 PATH：二选一
#    A) 把 bin 目录放进 PATH（示例：写入 ~/.bashrc 或 ~/.zshrc）
export PATH="/path/to/learn-likecc/bin:$PATH"

#    B) 或建符号链接到已有 PATH 目录（如 ~/.local/bin）
mkdir -p ~/.local/bin
ln -sf /path/to/learn-likecc/bin/likecode ~/.local/bin/likecode
# 确保 ~/.local/bin 已在 PATH 中
```

使用示例（与直接 `bun run dev` 相同，参数传给 CLI）：

```bash
likecode --version
likecode -- --help          # 部分环境下建议加 -- 再跟 CLI 参数
likecode -- -p "当前目录有哪些文件？"
```

**`bun install` 与 workspaces**：此前若出现 `Workspace name "@ant/..." already exists`，是因为 `packages/*` 与 `src/_external/shims/` 里注册了**同名**工作区包。当前根目录 `ccsource/claude-code-main/package.json` 已去掉重复项（`@ant/*` 与 napi 等仅以 `packages/` 为准；`@anthropic-ai/*` 中仅保留 shim 里独有的四个包 + `packages` 里的 `sandbox-runtime`）。拉取最新代码后再执行 `bun install` 即可。

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

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Harzva/learn-likecc&type=Date)](https://star-history.com/#Harzva/learn-likecc&Date)

---

## 📝 免责声明

本项目仅供学习研究使用，与 Anthropic 官方无关。

- Claude Code 是 Anthropic, PBC 的产品
- 本项目基于公开的 Source Map 文件进行学习分析
- 请勿将本项目用于商业用途

---

*最后更新: 2026-04-05*