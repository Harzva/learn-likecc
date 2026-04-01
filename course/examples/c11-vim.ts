/**
 * c11: Vim Mode 示例代码
 *
 * 最小化的 Vim 状态机实现
 * 基于 Claude Code 源码分析
 */

// ============================================
// 1. 类型定义
// ============================================

type VimMode = 'NORMAL' | 'INSERT'

type Operator = 'delete' | 'change' | 'yank'
type FindType = 'f' | 'F' | 't' | 'T'
type TextObjScope = 'inner' | 'around'

interface NormalState {
  mode: 'NORMAL'
  command: CommandState
}

interface InsertState {
  mode: 'INSERT'
  insertedText: string
}

type VimState = NormalState | InsertState

type CommandState =
  | { type: 'idle' }
  | { type: 'count'; digits: string }
  | { type: 'operator'; op: Operator; count: number }
  | { type: 'operatorCount'; op: Operator; count1: number; count2: string }
  | { type: 'operatorFind'; op: Operator; count: number; find: FindType }
  | { type: 'operatorTextObj'; op: Operator; count: number; scope: TextObjScope }
  | { type: 'find'; find: FindType; count: number; char?: string }
  | { type: 'g'; count: number }
  | { type: 'replace'; count: number }
  | { type: 'indent'; dir: '>' | '<'; count: number }

interface TransitionResult {
  type: 'continue' | 'execute' | 'invalid' | 'modeChange'
  state?: CommandState
  newMode?: VimMode
  action?: VimAction
}

interface VimAction {
  type: 'motion' | 'operator' | 'insert' | 'replace'
  motion?: string
  operator?: Operator
  count?: number
  text?: string
}

// ============================================
// 2. 常量定义
// ============================================

const OPERATORS: Record<string, Operator> = {
  d: 'delete',
  c: 'change',
  y: 'yank',
}

const SIMPLE_MOTIONS = new Set([
  'h', 'l', 'j', 'k',
  'w', 'W', 'b', 'B', 'e', 'E',
  '0', '^', '$',
  'G',
])

const FIND_KEYS = new Set<FindType>(['f', 'F', 't', 'T'])

const TEXT_OBJ_SCOPES: Record<string, TextObjScope> = {
  i: 'inner',
  a: 'around',
}

const TEXT_OBJ_TYPES = new Set([
  'w', 'W', '"', "'", '`', '(', ')', 'b', '[', ']', '{', '}', 'B',
])

// ============================================
// 3. 状态转换
// ============================================

function transition(
  state: VimState,
  input: string,
): TransitionResult {
  if (state.mode === 'INSERT') {
    return transitionInsert(state, input)
  }
  return transitionNormal(state.command, input)
}

function transitionInsert(
  state: InsertState,
  input: string,
): TransitionResult {
  // Esc → NORMAL
  if (input === 'Escape' || input === '\x1b') {
    return {
      type: 'modeChange',
      newMode: { mode: 'NORMAL', command: { type: 'idle' } },
    }
  }

  // 其他键 → 追加文本
  return {
    type: 'continue',
    state: { mode: 'INSERT', insertedText: state.insertedText + input } as any,
  }
}

function transitionNormal(
  state: CommandState,
  input: string,
): TransitionResult {
  switch (state.type) {
    case 'idle':
      return transitionFromIdle(input)
    case 'count':
      return transitionFromCount(state, input)
    case 'operator':
      return transitionFromOperator(state, input)
    case 'find':
      return transitionFromFind(state, input)
    case 'g':
      return transitionFromG(state, input)
    default:
      return { type: 'invalid' }
  }
}

function transitionFromIdle(input: string): TransitionResult {
  // 数字 → count
  if (/^[1-9]$/.test(input)) {
    return {
      type: 'continue',
      state: { type: 'count', digits: input },
    }
  }

  // 操作符
  if (OPERATORS[input]) {
    return {
      type: 'continue',
      state: { type: 'operator', op: OPERATORS[input], count: 1 },
    }
  }

  // 查找
  if (FIND_KEYS.has(input as FindType)) {
    return {
      type: 'continue',
      state: { type: 'find', find: input as FindType, count: 1 },
    }
  }

  // g 前缀
  if (input === 'g') {
    return {
      type: 'continue',
      state: { type: 'g', count: 1 },
    }
  }

  // 插入模式
  if (input === 'i') {
    return {
      type: 'modeChange',
      newMode: { mode: 'INSERT', insertedText: '' },
    }
  }

  // 简单移动
  if (SIMPLE_MOTIONS.has(input)) {
    return {
      type: 'execute',
      action: { type: 'motion', motion: input, count: 1 },
    }
  }

  return { type: 'invalid' }
}

function transitionFromCount(
  state: { type: 'count'; digits: string },
  input: string,
): TransitionResult {
  // 继续数字
  if (/^[0-9]$/.test(input)) {
    return {
      type: 'continue',
      state: { type: 'count', digits: state.digits + input },
    }
  }

  const count = parseInt(state.digits, 10)

  // 操作符
  if (OPERATORS[input]) {
    return {
      type: 'continue',
      state: { type: 'operator', op: OPERATORS[input], count },
    }
  }

  // 移动
  if (SIMPLE_MOTIONS.has(input)) {
    return {
      type: 'execute',
      action: { type: 'motion', motion: input, count },
    }
  }

  return { type: 'invalid' }
}

function transitionFromOperator(
  state: { type: 'operator'; op: Operator; count: number },
  input: string,
): TransitionResult {
  // 操作符重复 (dd, cc, yy)
  if (Object.keys(OPERATORS).includes(input) && OPERATORS[input] === state.op) {
    return {
      type: 'execute',
      action: {
        type: 'operator',
        operator: state.op,
        count: state.count,
        motion: 'line',
      },
    }
  }

  // 数字
  if (/^[1-9]$/.test(input)) {
    return {
      type: 'continue',
      state: {
        type: 'operatorCount',
        op: state.op,
        count1: state.count,
        count2: input,
      } as CommandState,
    }
  }

  // 移动
  if (SIMPLE_MOTIONS.has(input)) {
    return {
      type: 'execute',
      action: {
        type: 'operator',
        operator: state.op,
        motion: input,
        count: state.count,
      },
    }
  }

  // 文本对象
  if (input === 'i' || input === 'a') {
    return {
      type: 'continue',
      state: {
        type: 'operatorTextObj',
        op: state.op,
        count: state.count,
        scope: TEXT_OBJ_SCOPES[input],
      },
    }
  }

  return { type: 'invalid' }
}

function transitionFromFind(
  state: { type: 'find'; find: FindType; count: number; char?: string },
  input: string,
): TransitionResult {
  // 需要字符参数
  if (!state.char) {
    return {
      type: 'continue',
      state: { ...state, char: input },
    }
  }

  // 执行查找
  return {
    type: 'execute',
    action: {
      type: 'motion',
      motion: `find_${state.find}`,
      count: state.count,
      text: input,
    },
  }
}

function transitionFromG(
  state: { type: 'g'; count: number },
  input: string,
): TransitionResult {
  // gg → 文件开头
  if (input === 'g') {
    return {
      type: 'execute',
      action: { type: 'motion', motion: 'gg', count: state.count },
    }
  }

  return { type: 'invalid' }
}

// ============================================
// 4. Vim 状态机
// ============================================

class VimStateMachine {
  private state: VimState
  private history: VimState[] = []

  constructor() {
    this.state = { mode: 'NORMAL', command: { type: 'idle' } }
  }

  getMode(): VimMode {
    return this.state.mode
  }

  getState(): VimState {
    return this.state
  }

  processInput(input: string): VimAction | null {
    this.history.push(this.state)

    const result = transition(this.state, input)

    switch (result.type) {
      case 'continue':
        if (result.state) {
          this.state = {
            mode: 'NORMAL',
            command: result.state,
          }
        }
        return null

      case 'execute':
        this.state = { mode: 'NORMAL', command: { type: 'idle' } }
        return result.action!

      case 'modeChange':
        this.state = result.newMode!
        return result.action || null

      case 'invalid':
        // 保持当前状态
        return null

      default:
        return null
    }
  }

  undo(): void {
    if (this.history.length > 0) {
      this.state = this.history.pop()!
    }
  }
}

// ============================================
// 5. 演示
// ============================================

function main() {
  console.log('=== Vim Mode Demo ===\n')

  const vim = new VimStateMachine()

  console.log('Initial state:', vim.getMode())

  // 测试序列
  const testSequences = [
    ['i', 'h', 'e', 'l', 'l', 'o', 'Escape'],  // 插入 "hello"
    ['h', 'j', 'k', 'l'],                       // 移动
    ['3', 'w'],                                 // 跳 3 个单词
    ['d', 'd'],                                 // 删除行
    ['d', 'w'],                                 // 删除单词
    ['2', 'd', 'd'],                            // 删除 2 行
    ['g', 'g'],                                 // 文件开头
    ['f', 'a'],                                 // 查找 'a'
  ]

  for (const sequence of testSequences) {
    console.log(`\n--- Sequence: ${sequence.join(' ')} ---`)

    for (const key of sequence) {
      const action = vim.processInput(key)

      console.log(`  Input: '${key}'`)
      console.log(`  Mode: ${vim.getMode()}`)

      if (action) {
        console.log(`  Action: ${JSON.stringify(action)}`)
      }
    }
  }

  console.log('\n=== Demo Complete ===')
}

main()