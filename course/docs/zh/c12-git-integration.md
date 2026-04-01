# c12: Git Integration (Git集成)

`c01 > c02 > c03 > c04 | c05 > c06 > c07 > c08 | c09 > c10 > c11 > [ c12 ]`

> *"Git is the source of truth"* -- 版本控制是代码协作的基础。
>
> **Harness 层**: Git -- 代码版本与协作管理。

## 问题

AI 编程需要:
- 了解代码变更历史
- 安全地修改代码
- 管理并行开发
- 与远程同步

直接执行 Git 命令有风险，需要封装。

## 解决方案

Claude Code 提供完整的 Git 封装:

```
+-------------+     +-------------+
| Git Utils   | --> | Git CLI     |
+------+------+     +-------------+
       |
  +----+----+-----+
  |    |    |     |
Diff  Status Log  Worktree
```

## 源码分析

### Git Root 查找

```typescript
// 源码位置: src/utils/git/git.ts

function findGitRoot(startPath: string): string | null {
  let current = resolve(startPath)
  const root = current.substring(0, current.indexOf(sep) + 1)

  while (current !== root) {
    const gitPath = join(current, '.git')
    
    try {
      const stat = statSync(gitPath)
      // .git 可以是目录或文件 (worktree/submodule)
      if (stat.isDirectory() || stat.isFile()) {
        return current.normalize('NFC')
      }
    } catch {}
    
    current = dirname(current)
  }
  
  return null
}
```

### 缓存的 Git 信息

```typescript
// 源码位置: src/utils/git/gitFilesystem.ts

// 分支信息
function getCachedBranch(gitRoot: string): string | null
function getCachedDefaultBranch(gitRoot: string): string
function getCachedHead(gitRoot: string): string | null

// 远程信息
function getCachedRemoteUrl(gitRoot: string): string | null

// Worktree 信息
function getWorktreeCountFromFs(gitRoot: string): number

// 浅克隆检测
function isShallowCloneFs(gitRoot: string): boolean
```

### Git Diff 分析

```typescript
// 源码位置: src/utils/git/gitDiff.ts

interface DiffResult {
  added: string[]
  modified: string[]
  deleted: string[]
  renamed: { from: string; to: string }[]
}

async function getGitDiff(options: {
  file?: string
  staged?: boolean
  branch?: string
}): Promise<DiffResult> {
  const args = ['diff', '--name-status']
  
  if (options.staged) args.push('--staged')
  if (options.branch) args.push(options.branch)
  if (options.file) args.push('--', options.file)
  
  const output = await execGit(args)
  return parseDiffOutput(output)
}
```

### Worktree 管理

```typescript
// 源码位置: src/utils/worktree.ts

async function createAgentWorktree(options: {
  dir: string
  branch: string
  gitRoot: string
}): Promise<string> {
  const worktreePath = join(options.gitRoot, '.claude', 'worktrees', options.dir)
  const branchName = `agent/${options.branch}`
  
  // 创建 worktree
  await exec(`git worktree add -b ${branchName} ${worktreePath}`)
  
  return worktreePath
}

async function removeAgentWorktree(worktreePath: string): Promise<void> {
  // 获取分支名
  const branch = await exec(`git -C ${worktreePath} branch --show-current`)
  
  // 移除 worktree
  await exec(`git worktree remove ${worktreePath} --force`)
  
  // 删除分支
  await exec(`git branch -D ${branch}`)
}
```

### Commit 流程

```typescript
// /commit 技能的核心流程

async function createCommit(message?: string): Promise<void> {
  // 1. 获取变更状态
  const status = await getGitStatus()
  
  // 2. 获取 diff
  const diff = await getGitDiff()
  
  // 3. 生成提交信息 (如果没有提供)
  if (!message) {
    message = await generateCommitMessage(diff, status)
  }
  
  // 4. 添加文件
  await exec('git add -A')
  
  // 5. 提交
  await exec(`git commit -m "${message}"`)
}
```

### GitHub 集成

```typescript
// 源码位置: src/utils/github/

// 获取 PR 信息
async function getPullRequest(owner: string, repo: string, number: number) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`
  )
  return response.json()
}

// 创建 PR
async function createPullRequest(options: {
  owner: string
  repo: string
  title: string
  body: string
  head: string
  base: string
}) {
  // 使用 gh CLI 或 GitHub API
}
```

### Git 配置解析

```typescript
// 源码位置: src/utils/git/gitConfigParser.ts

function parseGitConfig(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  let currentSection = ''

  for (const line of content.split('\n')) {
    // [section "subsection"]
    const sectionMatch = line.match(/^\[([^\]]+)\]$/)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      continue
    }

    // key = value
    const kvMatch = line.match(/^\s*(\w+)\s*=\s*(.*)$/)
    if (kvMatch && currentSection) {
      const [, key, value] = kvMatch
      result[`${currentSection}.${key}`] = value
    }
  }

  return result
}
```

### Gitignore 处理

```typescript
// 源码位置: src/utils/git/gitignore.ts

async function isIgnored(filePath: string, gitRoot: string): Promise<boolean> {
  const result = await exec(
    `git -C ${gitRoot} check-ignore ${filePath}`
  )
  return result.code === 0
}
```

## 缓存策略

```typescript
// 使用 LRU 缓存减少 Git 命令调用
const branchCache = memoizeWithLRU(
  getCachedBranchImpl,
  { maxAge: 60_000, maxSize: 100 }
)
```

## 设计模式

### 1. 外观模式

统一的 Git 接口:

```typescript
class GitFacade {
  status(): Promise<GitStatus>
  diff(): Promise<DiffResult>
  commit(message: string): Promise<void>
}
```

### 2. 策略模式

不同 Git 操作使用不同策略:

```typescript
const strategies = {
  status: statusStrategy,
  diff: diffStrategy,
  log: logStrategy,
}
```

### 3. 缓存模式

缓存 Git 信息:

```typescript
getCached() // 优先缓存
getFresh()  // 强制刷新
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Git Ops | 无 | 完整封装 |
| Worktree | 无 | 自动管理 |
| Diff | 无 | 结构化解析 |
| GitHub | 无 | API 集成 |

## 实践练习

### 练习 1: 实现 Git Status 解析

```typescript
function parseGitStatus(output: string): GitStatus {
  // TODO: 解析 git status --porcelain 输出
}
```

### 练习 2: 实现 Diff 解析

```typescript
function parseDiffOutput(output: string): DiffResult {
  // TODO: 解析 git diff --name-status 输出
}
```

### 练习 3: 实现 Worktree 管理

```typescript
class WorktreeManager {
  create(name: string): Promise<string>
  remove(path: string): Promise<void>
  list(): Promise<string[]>
}
```

## 思考题

1. 为什么需要 Git 信息缓存？
2. Worktree 如何实现并行开发？
3. 如何处理 Git 冲突？

## 延伸阅读

- [c06: Subagent](c06-subagent-fork.md) - Worktree 隔离
- [c04: Command Interface](c04-command-interface.md) - /commit 命令
- 源码: `src/utils/git/`

---

**课程结束** | 返回 [课程大纲](README.md)