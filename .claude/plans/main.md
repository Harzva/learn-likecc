# Claude Code 源码学习计划

## 项目背景
2026-03-31，Anthropic 的 Claude Code CLI 源码通过 npm registry 中的 source map 文件泄露。本项目用于学习和分析其架构设计。

## 技术栈
- Runtime: Bun
- Language: TypeScript (strict)
- Terminal UI: React + Ink
- CLI Parsing: Commander.js
- Schema: Zod v4
- API: Anthropic SDK

## 阶段任务

### 阶段 1: 源码结构分析 ✅
- [x] 解压 claude-code-main.zip
- [x] 分析目录结构
- [ ] 统计文件数量和代码行数

### 阶段 2: 编译问题诊断
- [ ] 创建 package.json
- [ ] 创建 tsconfig.json
- [ ] 安装依赖
- [ ] 尝试编译，记录错误

### 阶段 3: 修复与完善
- [ ] 补充缺失的类型定义
- [ ] 修复导入路径问题
- [ ] 处理 bun 特有 API

### 阶段 4: 学习与文档
- [ ] 核心架构文档
- [ ] Tool 系统分析
- [ ] Bridge 系统分析
- [ ] 权限系统分析

## 关键文件
| 文件 | 大小 | 说明 |
|------|------|------|
| main.tsx | 800KB | 入口文件 |
| QueryEngine.ts | 46KB | LLM 查询引擎 |
| Tool.ts | 29KB | 工具类型定义 |
| commands.ts | 25KB | 命令注册 |
| tools.ts | 17KB | 工具注册 |
