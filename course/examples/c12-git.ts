/**
 * c12: Git Integration 示例代码
 *
 * 最小化的 Git 操作封装实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: string[]
  unstaged: string[]
  untracked: string[]
  conflicts: string[]
}

interface DiffResult {
  added: string[]
  modified: string[]
  deleted: string[]
  renamed: Array<{ from: string; to: string }>
}

interface CommitInfo {
  hash: string
  author: string
  date: string
  message: string
}

interface WorktreeInfo {
  path: string
  branch: string
  commit: string
}

// ============================================
// 2. Git 命令执行器
// ============================================

class GitExecutor {
  private cwd: string

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd
  }

  async exec(args: string[]): Promise<string> {
    // 模拟 Git 命令执行
    console.log(`[Git] git ${args.join(' ')}`)

    // 实际实现:
    // const result = await execFile('git', args, { cwd: this.cwd })
    // return result.stdout

    return '(mock output)'
  }
}

// ============================================
// 3. Git Root 查找
// ============================================

function findGitRoot(startPath: string): string | null {
  const path = require('path')
  const fs = require('fs')

  let current = path.resolve(startPath)
  const root = current.substring(0, current.indexOf(path.sep) + 1)

  while (current !== root) {
    const gitPath = path.join(current, '.git')

    try {
      const stat = fs.statSync(gitPath)
      if (stat.isDirectory() || stat.isFile()) {
        return current
      }
    } catch {
      // 不存在
    }

    current = path.dirname(current)
  }

  return null
}

// ============================================
// 4. Git 状态解析
// ============================================

class GitStatusParser {
  parse(output: string): GitStatus {
    // 解析 git status --porcelain=v1 --branch 输出
    const lines = output.split('\n')

    let branch = 'unknown'
    let ahead = 0
    let behind = 0
    const staged: string[] = []
    const unstaged: string[] = []
    const untracked: string[] = []
    const conflicts: string[] = []

    for (const line of lines) {
      // 分支信息
      if (line.startsWith('## ')) {
        const branchMatch = line.match(/## (.+?)(?:\.\.\.)?/)
        if (branchMatch) {
          branch = branchMatch[1]
        }

        const aheadMatch = line.match(/ahead (\d+)/)
        const behindMatch = line.match(/behind (\d+)/)

        if (aheadMatch) ahead = parseInt(aheadMatch[1], 10)
        if (behindMatch) behind = parseInt(behindMatch[1], 10)

        continue
      }

      // 文件状态
      if (line.length < 2) continue

      const index = line[0]
      const workTree = line[1]
      const filePath = line.substring(3)

      // 冲突
      if (index === 'U' || workTree === 'U' || (index === 'A' && workTree === 'A')) {
        conflicts.push(filePath)
        continue
      }

      // 暂存
      if (index !== ' ' && index !== '?') {
        staged.push(filePath)
      }

      // 未暂存
      if (workTree !== ' ' && workTree !== '?') {
        unstaged.push(filePath)
      }

      // 未跟踪
      if (index === '?' && workTree === '?') {
        untracked.push(filePath)
      }
    }

    return {
      branch,
      ahead,
      behind,
      staged,
      unstaged,
      untracked,
      conflicts,
    }
  }
}

// ============================================
// 5. Git Diff 解析
// ============================================

class GitDiffParser {
  parse(output: string): DiffResult {
    const result: DiffResult = {
      added: [],
      modified: [],
      deleted: [],
      renamed: [],
    }

    for (const line of output.split('\n')) {
      if (!line.trim()) continue

      const [status, ...rest] = line.split('\t')

      switch (status) {
        case 'A':
          result.added.push(rest[0])
          break
        case 'M':
          result.modified.push(rest[0])
          break
        case 'D':
          result.deleted.push(rest[0])
          break
        case 'R':
          result.renamed.push({ from: rest[0], to: rest[1] })
          break
      }
    }

    return result
  }
}

// ============================================
// 6. Git 操作封装
// ============================================

class GitOperations {
  private executor: GitExecutor
  private statusParser: GitStatusParser
  private diffParser: GitDiffParser

  constructor(cwd: string) {
    this.executor = new GitExecutor(cwd)
    this.statusParser = new GitStatusParser()
    this.diffParser = new GitDiffParser()
  }

  async status(): Promise<GitStatus> {
    const output = await this.executor.exec([
      'status',
      '--porcelain=v1',
      '--branch',
    ])
    return this.statusParser.parse(output)
  }

  async diff(options?: { staged?: boolean; file?: string }): Promise<DiffResult> {
    const args = ['diff', '--name-status']

    if (options?.staged) {
      args.push('--staged')
    }
    if (options?.file) {
      args.push('--', options.file)
    }

    const output = await this.executor.exec(args)
    return this.diffParser.parse(output)
  }

  async log(options?: { count?: number; file?: string }): Promise<CommitInfo[]> {
    const args = [
      'log',
      `--pretty=format:%H|%an|%ai|%s`,
    ]

    if (options?.count) {
      args.push(`-n ${options.count}`)
    }
    if (options?.file) {
      args.push('--', options.file)
    }

    const output = await this.executor.exec(args)

    return output.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, author, date, ...messageParts] = line.split('|')
        return {
          hash,
          author,
          date,
          message: messageParts.join('|'),
        }
      })
  }

  async branch(): Promise<string> {
    const output = await this.executor.exec(['branch', '--show-current'])
    return output.trim()
  }

  async add(files: string[]): Promise<void> {
    await this.executor.exec(['add', ...files])
  }

  async commit(message: string): Promise<void> {
    await this.executor.exec(['commit', '-m', message])
  }

  async push(options?: { force?: boolean }): Promise<void> {
    const args = ['push']
    if (options?.force) {
      args.push('--force')
    }
    await this.executor.exec(args)
  }

  async pull(): Promise<void> {
    await this.executor.exec(['pull'])
  }
}

// ============================================
// 7. Worktree 管理
// ============================================

class WorktreeManager {
  private executor: GitExecutor

  constructor(cwd: string) {
    this.executor = new GitExecutor(cwd)
  }

  async list(): Promise<WorktreeInfo[]> {
    const output = await this.executor.exec([
      'worktree',
      'list',
      '--porcelain',
    ])

    const worktrees: WorktreeInfo[] = []
    let current: Partial<WorktreeInfo> = {}

    for (const line of output.split('\n')) {
      if (line.startsWith('worktree ')) {
        if (current.path) {
          worktrees.push(current as WorktreeInfo)
        }
        current = { path: line.substring(9) }
      } else if (line.startsWith('HEAD ')) {
        current.commit = line.substring(5)
      } else if (line.startsWith('branch ')) {
        current.branch = line.substring(7)
      }
    }

    if (current.path) {
      worktrees.push(current as WorktreeInfo)
    }

    return worktrees
  }

  async create(name: string, baseBranch?: string): Promise<string> {
    const branch = `agent/${name}`
    const path = `.claude/worktrees/${name}`

    const args = ['worktree', 'add', '-b', branch, path]
    if (baseBranch) {
      args.push(baseBranch)
    }

    await this.executor.exec(args)
    console.log(`[Worktree] Created: ${path} on branch ${branch}`)

    return path
  }

  async remove(worktreePath: string): Promise<void> {
    // 先获取分支名
    const branch = await this.executor.exec([
      '-C', worktreePath,
      'branch', '--show-current',
    ])

    // 移除 worktree
    await this.executor.exec(['worktree', 'remove', worktreePath, '--force'])

    // 删除分支
    if (branch.trim()) {
      await this.executor.exec(['branch', '-D', branch.trim()])
    }

    console.log(`[Worktree] Removed: ${worktreePath}`)
  }
}

// ============================================
// 8. 演示
// ============================================

async function main() {
  console.log('=== Git Integration Demo ===\n')

  // Git Root 查找
  console.log('--- Git Root ---')
  const gitRoot = findGitRoot(process.cwd())
  console.log(`  Git root: ${gitRoot || 'Not found'}`)

  // Git 状态解析
  console.log('\n--- Status Parser Demo ---')
  const statusParser = new GitStatusParser()

  const mockStatus = `## main...origin/main [ahead 2, behind 1]
M  src/index.ts
A  src/new-file.ts
 D src/old-file.ts
?? src/untracked.ts
UU src/conflict.ts`

  const status = statusParser.parse(mockStatus)
  console.log(`  Branch: ${status.branch}`)
  console.log(`  Ahead: ${status.ahead}, Behind: ${status.behind}`)
  console.log(`  Staged: ${status.staged.join(', ') || '(none)'}`)
  console.log(`  Unstaged: ${status.unstaged.join(', ') || '(none)'}`)
  console.log(`  Untracked: ${status.untracked.join(', ') || '(none)'}`)
  console.log(`  Conflicts: ${status.conflicts.join(', ') || '(none)'}`)

  // Git Diff 解析
  console.log('\n--- Diff Parser Demo ---')
  const diffParser = new GitDiffParser()

  const mockDiff = `M       src/modified.ts
A       src/added.ts
D       src/deleted.ts
R100    src/old.ts src/new.ts`

  const diff = diffParser.parse(mockDiff)
  console.log(`  Added: ${diff.added.join(', ')}`)
  console.log(`  Modified: ${diff.modified.join(', ')}`)
  console.log(`  Deleted: ${diff.deleted.join(', ')}`)
  console.log(`  Renamed: ${diff.renamed.map(r => `${r.from} → ${r.to}`).join(', ')}`)

  // Worktree 管理
  console.log('\n--- Worktree Manager Demo ---')
  const worktreeManager = new WorktreeManager(process.cwd())

  // 模拟创建和删除
  console.log(`  [Simulated] Creating worktree...`)
  console.log(`  [Simulated] Removing worktree...`)

  console.log('\n=== Demo Complete ===')
}

main().catch(console.error)