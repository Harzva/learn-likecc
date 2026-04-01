# c11: Vim Mode (Vim模式实现)

`c01 > c02 > c03 > c04 | c05 > c06 > c07 > c08 | c09 > c10 > [ c11 ] > c12`

> *"Vim is a language"* -- 模式编辑是高效输入的艺术。
>
> **Harness 层**: Vim -- 专业用户的效率工具。

## 问题

专业用户习惯 Vim:
- 模式切换编辑
- 快捷键操作
- 高效移动
- 宏和重复

CLI 输入需要支持 Vim 风格的操作。

## 解决方案

Claude Code 实现了完整的 Vim 状态机:

```
NORMAL ──i──► INSERT
   │          │
   └────Esc───┘
```

## 源码分析

### 状态定义

```typescript
// 源码位置: src/vim/types.ts

type VimState =
  | { mode: 'INSERT'; insertedText: string }
  | { mode: 'NORMAL'; command: CommandState }

type CommandState =
  | { type: 'idle' }                              // 空闲
  | { type: 'count'; digits: string }             // 计数 (3d)
  | { type: 'operator'; op: Operator; count: number }  // 操作符等待
  | { type: 'operatorCount'; op: Operator; count1: number; count2: string }
  | { type: 'operatorFind'; op: Operator; count: number; find: FindType }
  | { type: 'operatorTextObj'; op: Operator; count: number; scope: TextObjScope }
  | { type: 'find'; find: FindType; count: number; char?: string }
  | { type: 'g'; count: number }                  // g 前缀
  | { type: 'operatorG'; op: Operator; count: number }
  | { type: 'replace'; count: number }            // r 替换
  | { type: 'indent'; dir: '>' | '<'; count: number }
```

### 状态图

```
NORMAL 模式状态机:

  idle ───┬─[d/c/y]──► operator
          ├─[1-9]────► count
          ├─[fFtT]───► find
          ├─[g]──────► g
          ├─[r]──────► replace
          └─[><]─────► indent

  operator ─┬─[motion]──► execute
            ├─[0-9]────► operatorCount
            ├─[ia]─────► operatorTextObj
            └─[fFtT]───► operatorFind

  count ────┬─[0-9]────► count (追加数字)
            └─[d/c/y]──► operator (带计数)
```

### 操作符

```typescript
type Operator = 'delete' | 'change' | 'yank'

const OPERATORS: Record<string, Operator> = {
  d: 'delete',
  c: 'change',
  y: 'yank',
}
```

### 移动命令

```typescript
const SIMPLE_MOTIONS = new Set([
  'h', 'l',           // 左右
  'j', 'k',           // 上下
  'w', 'W', 'b', 'B', 'e', 'E',  // 单词
  '0', '^', '$',      // 行位置
  'G', 'gg',          // 文件位置
])
```

### 查找键

```typescript
type FindType = 'f' | 'F' | 't' | 'T'

// f: 向后查找字符
// F: 向前查找字符
// t: 向后查找，停在字符前
// T: 向前查找，停在字符后
```

### 文本对象

```typescript
type TextObjScope = 'inner' | 'around'

const TEXT_OBJ_SCOPES = {
  i: 'inner',   // 内部 (不含周围)
  a: 'around',  // 包含周围
}

const TEXT_OBJ_TYPES = new Set([
  'w', 'W',           // 单词
  '"', "'", '`',      // 引号
  '(', ')', 'b',      // 圆括号
  '[', ']',           // 方括号
  '{', '}', 'B',      // 花括号
  '<', '>',           // 尖括号
  's',                // 句子
  'p',                // 段落
])
```

### 状态转换

```typescript
// 源码位置: src/vim/transitions.ts

function transition(
  state: CommandState,
  input: string,
  ctx: TransitionContext,
): TransitionResult {
  switch (state.type) {
    case 'idle':
      return transitionFromIdle(input, ctx)
    case 'count':
      return transitionFromCount(state, input, ctx)
    case 'operator':
      return transitionFromOperator(state, input, ctx)
    // ...
  }
}

function transitionFromIdle(
  input: string,
  ctx: TransitionContext,
): TransitionResult {
  // 数字 → count 状态
  if (/^[1-9]$/.test(input)) {
    return { type: 'continue', state: { type: 'count', digits: input } }
  }

  // 操作符 → operator 状态
  if (OPERATORS[input]) {
    return {
      type: 'continue',
      state: { type: 'operator', op: OPERATORS[input], count: 1 },
    }
  }

  // 查找 → find 状态
  if (FIND_KEYS.has(input)) {
    return { type: 'continue', state: { type: 'find', find: input, count: 1 } }
  }

  // g 前缀
  if (input === 'g') {
    return { type: 'continue', state: { type: 'g', count: 1 } }
  }

  // 简单移动 → 执行
  if (SIMPLE_MOTIONS.has(input)) {
    return { type: 'execute', motion: input, count: 1 }
  }

  return { type: 'invalid' }
}
```

### 持久状态

```typescript
type PersistentState = {
  lastChange: RecordedChange | null  // 点重复 (.)
  lastFind: { type: FindType; char: string } | null
  register: string                   // 默认寄存器
  registerIsLinewise: boolean
}

// 点重复
function dotRepeat(state: PersistentState): void {
  if (state.lastChange) {
    replayChange(state.lastChange)
  }
}
```

### INSERT 模式

```typescript
function handleInsertKey(
  state: { mode: 'INSERT'; insertedText: string },
  key: string,
): VimState {
  // Esc → NORMAL
  if (key === 'Escape') {
    return { mode: 'NORMAL', command: { type: 'idle' } }
  }

  // 其他键 → 追加到 insertedText
  return {
    mode: 'INSERT',
    insertedText: state.insertedText + key,
  }
}
```

## 设计模式

### 1. 状态机模式

Vim 本质是状态机:

```typescript
(currentState, input) → newState
```

### 2. 命令模式

操作封装为命令:

```typescript
interface Command {
  execute(): void
  undo(): void
}
```

### 3. 记录器模式

记录操作用于重放:

```typescript
recorder.record(change)
recorder.replay()
```

## 变更内容

| 组件 | 之前 | 之后 |
|------|------|------|
| Input | 单模式 | NORMAL/INSERT 双模式 |
| Navigation | 无 | hjkl/wb/$^0 |
| Edit | 无 | d/c/y 操作符 |
| Text Object | 无 | iw/aw/i"/a" |

## 实践练习

### 练习 1: 实现简单状态机

```typescript
type SimpleVimState = 'NORMAL' | 'INSERT'

function transition(state: SimpleVimState, key: string): SimpleVimState {
  // TODO: 实现状态转换
}
```

### 练习 2: 实现移动命令

```typescript
function applyMotion(
  cursor: number,
  motion: string,
  lines: string[]
): number {
  // TODO: 实现移动逻辑
}
```

### 练习 3: 实现文本对象

```typescript
function getTextObjectRange(
  cursor: number,
  scope: 'inner' | 'around',
  type: string,
  lines: string[]
): { start: number; end: number } | null {
  // TODO: 计算文本对象范围
}
```

## 思考题

1. 为什么 Vim 使用模式而不是修饰键？
2. 如何实现 `.` (点重复) 功能？
3. 文本对象如何提高编辑效率？

## 延伸阅读

- [c04: Command Interface](c04-command-interface.md) - 命令系统
- 源码: `src/vim/`

---

**下一章**: [c12: Git Integration](c12-git-integration.md) →