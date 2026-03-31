# learn-claude-code-source 课程开发路线图

## 项目愿景

基于 Claude Code 源码逆向工程分析，开发两套课程：
1. **本地版本**: Markdown + Python 代码示例
2. **网页版本**: Next.js 在线课程

参考: `rep2course/reference/learn-claude-code/`

---

## 参考课程分析

### 课程结构 (12 章节)

| 章节 | 主题 | 核心概念 |
|------|------|----------|
| s01 | Agent Loop | 智能体循环 |
| s02 | Tool Use | 工具使用 |
| s03 | Todo Write | 任务管理 |
| s04 | Subagent | 子智能体 |
| s05 | Skill Loading | 技能加载 |
| s06 | Context Compact | 上下文压缩 |
| s07 | Task System | 任务系统 |
| s08 | Background Tasks | 后台任务 |
| s09 | Agent Teams | 智能体团队 |
| s10 | Team Protocols | 团队协议 |
| s11 | Autonomous Agents | 自主智能体 |
| s12 | Worktree Isolation | Worktree 隔离 |

### 文件组织

```
learn-claude-code/
├── README.md           # 主文档 (中/英/日三语)
├── docs/               # 课程文档
│   ├── zh/            # 中文
│   ├── en/            # 英文
│   └── ja/            # 日文
├── agents/            # Python 代码示例
│   └── s01_agent_loop.py
├── skills/            # 技能模块
│   ├── agent-builder/
│   ├── code-review/
│   ├── mcp-builder/
│   └── pdf/
└── web/               # Next.js 网页版
    ├── src/
    └── package.json
```

### 核心理念

```
Agent = 模型 (训练出来的神经网络)
Harness = Tools + Knowledge + Observation + Action + Permissions

Claude Code = Agent Loop + Tools + Skills + Compact + Subagent + Tasks + ...
```

---

## 课程开发计划

### 阶段 1: 内容规划 (v0.6.0)

**目标**: 设计课程大纲和章节结构

- [ ] 确定课程定位 (源码学习 vs 实践指南)
- [ ] 设计章节结构 (12 章节 vs 按系统划分)
- [ ] 编写课程简介和目标受众
- [ ] 规划代码示例类型 (TypeScript vs Python)

### 阶段 2: 本地课程开发 (v0.7.0)

**目标**: 开发本地 Markdown 版本课程

- [ ] 创建 docs/ 目录结构
- [ ] 编写中文课程文档
- [ ] 创建代码示例 (基于源码分析)
- [ ] 编写练习题和思考题

### 阶段 3: 代码示例开发 (v0.8.0)

**目标**: 开发可运行的代码示例

- [ ] TypeScript 示例 (与源码一致)
- [ ] Python 示例 (跨语言学习)
- [ ] 配置运行环境
- [ ] 编写测试脚本

### 阶段 4: 网页课程开发 (v0.9.0)

**目标**: 开发 Next.js 网页版本

- [ ] 初始化 Next.js 项目
- [ ] 设计页面布局和样式
- [ ] 实现代码高亮和交互
- [ ] 部署到 Vercel

### 阶段 5: 完善与发布 (v1.0.0)

**目标**: 课程发布

- [ ] 多语言支持 (中/英)
- [ ] 完善文档和示例
- [ ] 添加学习路径
- [ ] 发布到 GitHub

---

## 章节草案 (基于源码分析)

### Part 1: 基础架构

| 章节 | 主题 | 源码对应 |
|------|------|----------|
| c01 | The Agent Loop | QueryEngine.ts |
| c02 | Tool System | Tool.ts, tools/ |
| c03 | Permission Model | permission-system.md |
| c04 | Command Interface | commands/ |

### Part 2: 核心机制

| 章节 | 主题 | 源码对应 |
|------|------|----------|
| c05 | Context Compression | compact-system.md |
| c06 | Subagent & Fork | agent-system.md |
| c07 | MCP Protocol | mcp-system.md |
| c08 | Task Management | tasks/ |

### Part 3: 高级特性

| 章节 | 主题 | 源码对应 |
|------|------|----------|
| c09 | Bridge & IDE | bridge-system.md |
| c10 | Hooks Extension | hooks-system.md |
| c11 | Vim Mode | vim-system.md |
| c12 | Git Integration | git-integration.md |

---

## 差异化定位

### 与参考课程的区别

| 维度 | 参考课程 | 本课程 |
|------|----------|--------|
| 内容来源 | 官方文档 + 实践 | 源码逆向分析 |
| 深度 | 概念 + 用法 | 实现细节 |
| 代码 | Python 示例 | TypeScript 源码 |
| 目标 | 学会使用 | 理解原理 |

### 核心价值

1. **源码级深度**: 基于真实源码分析
2. **设计模式**: 提取可复用的架构模式
3. **实现细节**: 展示具体实现代码
4. **逆向思维**: 从代码反推设计意图

---

## 执行计划

完成本路线图后，创建 v0.6.0_plan.md 开始课程开发。