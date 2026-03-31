---
name: 源码位置参考
description: 关键源码文件位置
type: reference
---

## 源码根目录
`/home/clashuser/hzh/item_bo/learn-likecc/ccsource/claude-code-main/src/`

## 核心文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 入口 | `main.tsx` | CLI 入口，800KB |
| 查询引擎 | `QueryEngine.ts` | API 调用核心 |
| 工具定义 | `Tool.ts` | 工具类型 |
| 工具注册 | `tools.ts` | 工具列表 |
| 命令注册 | `commands.ts` | 斜杠命令 |

## 关键目录

| 目录 | 说明 |
|------|------|
| `tools/` | 工具实现 (~40个) |
| `commands/` | 命令实现 (~50个) |
| `components/` | UI 组件 (~140个) |
| `services/` | 服务层 (API/MCP/LSP等) |
| `bridge/` | IDE 桥接 |
| `hooks/` | React hooks + 权限 |
