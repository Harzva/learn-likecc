# Learn Claude Code

> Claude Code 源码学习与逆向恢复项目

## 项目状态

### 当前版本: v2.0.5

| 指标 | 状态 |
|------|------|
| 编译错误 | ~2175 (不影响运行) |
| Stub 模块 | 35+ 已创建 |
| 运行状态 | ✅ **可运行** |
| Git 仓库 | [公开仓库](https://github.com/Harzva/learn-likecc) |

### 🎉 重大进展

程序现在可以运行！

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
| v2.0.1 | 2271 | -63% (放宽 tsconfig) |
| v2.0.2 | 2034 | -11% (替换 message.ts) |
| v2.0.3 | 2137 | 可运行 ✅ |
| v2.0.5 | 2175 | CLI 正常 ✅ |

---

## 项目结构

```
learn-likecc/
├── ccsource/
│   └── claude-code-main/     # 恢复的源码
│       ├── src/              # 核心源码
│       ├── packages/         # Stub 包 (@ant/*, *-napi)
│       └── package.json      # Bun workspace 配置
│
├── reference/                # 参考项目 (gitignore)
│   ├── claude-code2/         # 最完整的恢复版本
│   ├── open-claude-code/     # 可运行版本
│   └── leaked-claude-code/   # 原始泄露源码
│
├── course/                   # 课程文档
│   ├── docs/zh/              # 12 章节 中文文档
│   └── examples/             # TypeScript 示例代码
│
└── .claude/
    ├── plans/                # 版本计划
    │   ├── CHANGELOG.md      # 工作日志
    │   ├── long-term-roadmap.md
    │   └── v2.0.x_plan.md
    └── rules/                # 项目规则
```

---

## 课程内容

### Part 1: 核心架构
- **c01**: Agent Loop - 主循环与状态管理
- **c02**: Tool System - 工具定义与调用
- **c03**: Permission Model - 权限控制与用户交互
- **c04**: Command Interface - CLI 命令处理

### Part 2: 高级特性
- **c05**: Context Compression - 消息压缩与优化
- **c06**: Subagent Fork - 子代理创建与分支
- **c07**: MCP Protocol - Model Context Protocol
- **c08**: Task Management - 任务队列与调度

### Part 3: 扩展与集成
- **c09**: Bridge IDE - IDE 集成与通信
- **c10**: Hooks Extension - 钩子系统
- **c11**: Vim Mode - Vim 键绑定
- **c12**: Git Integration - Git 工作流集成

---

## 长期计划

### Phase 1: 编译修复 (v2.0.x) ✅
- ✅ 放宽 tsconfig 配置
- ✅ 替换 message.ts 类型定义
- ✅ 创建 stub 模块 (35+)
- ✅ 安装 Bun 运行时
- ✅ 程序可运行
- ✅ CLI 命令正常 (--help, --version)

### Phase 2: 运行测试 (v2.1.x)
- ✅ 基本命令测试
- ⏳ API 调用测试 (需要 ANTHROPIC_API_KEY)
- ⏳ 工具调用测试
- ⏳ MCP 连接测试

### Phase 3: 功能恢复 (v2.2.x)
- ⏳ 恢复核心工具 (Bash, Read, Edit, Write)
- ⏳ 恢复 Agent Tool
- ⏳ 恢复权限系统

### Phase 4: 产品化 (v3.0.x)
- ⏳ 完整功能测试
- ⏳ 性能优化
- ⏳ 文档完善
- ⏳ 发布可用版本

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/Harzva/learn-likecc.git
cd learn-likecc

# 进入源码目录
cd ccsource/claude-code-main

# 安装依赖 (需要 Bun)
bun install

# 配置 API Key
cp .env.example .env
# 编辑 .env 文件，填入你的 ANTHROPIC_API_KEY

# 测试运行
bun run dev --version
bun run dev --help

# 管道模式测试 (需要 API key)
echo "say hello" | ANTHROPIC_API_KEY=your-key bun run dev -p
```

### API Key 配置

有两种方式配置 API Key：

1. **环境变量** (推荐用于测试):
   ```bash
   export ANTHROPIC_API_KEY=your-api-key-here
   bun run dev
   ```

2. **.env 文件**:
   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   ```

获取 API Key: https://console.anthropic.com/settings/keys

---

## 参考资源

- [Claude Code 官方](https://claude.ai/code)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [MCP Protocol](https://modelcontextprotocol.io)

---

## 贡献

本项目为学习用途，欢迎贡献：
1. 修复类型定义
2. 补充缺失模块
3. 完善文档

---

## 许可

本项目仅供学习研究使用。原始 Claude Code 为 Anthropic 产品。

---

*最后更新: 2026-04-01*