# Git 集成分析

## 概述

Claude Code 深度集成 Git，提供版本控制、worktree 管理等功能。

## 文件结构

| 文件 | 大小 | 功能 |
|------|------|------|
| git.ts | 30KB | Git 核心操作 |
| gitDiff.ts | 16KB | Diff 分析 |
| git/gitFilesystem.ts | 22KB | Git 文件系统操作 |
| git/gitConfigParser.ts | 7KB | Git 配置解析 |
| git/gitignore.ts | 3KB | Gitignore 处理 |

## 核心功能

### 1. Git Root 查找

```typescript
function findGitRootImpl(startPath: string): string | typeof GIT_ROOT_NOT_FOUND {
  let current = resolve(startPath)
  const root = current.substring(0, current.indexOf(sep) + 1)

  while (current !== root) {
    const gitPath = join(current, '.git')
    const stat = statSync(gitPath)
    // .git 可以是目录或文件 (worktree/submodule)
    if (stat.isDirectory() || stat.isFile()) {
      return current.normalize('NFC')
    }
    current = dirname(current)
  }
  return GIT_ROOT_NOT_FOUND
}
```

### 2. Git 文件系统操作

```typescript
// 缓存的分支信息
getCachedBranch()
getCachedDefaultBranch()
getCachedHead()
getCachedRemoteUrl()

// Worktree 管理
getWorktreeCountFromFs()

// 浅克隆检测
isShallowCloneFs()

// 解析 Git 目录
resolveGitDir()
```

### 3. Worktree 管理

```typescript
// 创建 Agent worktree
createAgentWorktree(options: {
  dir: string
  branch: string
  gitRoot: string
}): Promise<string>

// 移除 Agent worktree
removeAgentWorktree(worktreePath: string): Promise<void>
```

### 4. Git Diff 分析

```typescript
// 获取文件差异
getGitDiff(options: {
  file?: string
  staged?: boolean
  branch?: string
}): Promise<DiffResult>
```

## Commit 流程

```
1. 分析变更
   └── git status + git diff

2. 生成提交信息
   └── LLM 生成 commit message

3. 执行提交
   └── git commit -m "..."

4. 可选推送
   └── git push
```

## GitHub 集成

```typescript
// GitHub 仓库路径映射
githubRepoPathMapping.ts

// GitHub API 操作
src/utils/github/
```

## 缓存策略

- **分支缓存**: 避免重复 git 命令
- **LRU 缓存**: memoizeWithLRU
- **文件系统缓存**: 直接读取 .git 目录

## 设计亮点

### 1. Worktree 隔离
为 Agent 创建独立 worktree，避免冲突

### 2. 混合读取
结合 git 命令和文件系统直接读取

### 3. 缓存优化
减少重复 git 命令调用

### 4. 子模块支持
.git 文件检测支持 submodule