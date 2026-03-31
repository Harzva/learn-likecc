# Vim 模式实现分析

## 概述

Claude Code 内置 Vim 模式，提供类似 Vim 的编辑体验。

## 文件结构

| 文件 | 大小 | 功能 |
|------|------|------|
| types.ts | 6KB | 状态机类型定义 |
| transitions.ts | 12KB | 状态转换逻辑 |
| operators.ts | 16KB | 操作符实现 |
| motions.ts | 2KB | 移动命令 |
| textObjects.ts | 5KB | 文本对象 |

## 状态机设计

### VimState

```typescript
type VimState =
  | { mode: 'INSERT'; insertedText: string }
  | { mode: 'NORMAL'; command: CommandState }
```

### CommandState (NORMAL 模式)

```typescript
type CommandState =
  | { type: 'idle' }                          // 空闲
  | { type: 'count'; digits: string }         // 计数 (如 3d)
  | { type: 'operator'; op: Operator; count } // 操作符等待
  | { type: 'operatorCount'; ... }            // 操作符+计数
  | { type: 'operatorFind'; ... }             // f/t 查找
  | { type: 'operatorTextObj'; ... }          // 文本对象
  | { type: 'find'; find: FindType; count }   // 查找模式
  | { type: 'g'; count }                      // g 前缀
  | { type: 'operatorG'; ... }                // 操作符+g
  | { type: 'replace'; count }                // 替换模式
  | { type: 'indent'; dir: '>' | '<'; count } // 缩进
```

## 状态图

```
NORMAL 模式状态机:

  idle ──┬─[d/c/y]──► operator
         ├─[1-9]────► count
         ├─[fFtT]───► find
         ├─[g]──────► g
         ├─[r]──────► replace
         └─[><]─────► indent

  operator ─┬─[motion]──► execute
            ├─[0-9]────► operatorCount
            ├─[ia]─────► operatorTextObj
            └─[fFtT]───► operatorFind
```

## 操作符

```typescript
type Operator = 'delete' | 'change' | 'yank'

const OPERATORS = {
  d: 'delete',
  c: 'change',
  y: 'yank',
}
```

## 移动命令

```typescript
const SIMPLE_MOTIONS = new Set([
  'h', 'l', 'j', 'k',       // 基本移动
  'w', 'b', 'e', 'W', 'B', 'E', // 单词移动
  '0', '^', '$',            // 行位置
])
```

## 查找键

```typescript
const FIND_KEYS = new Set(['f', 'F', 't', 'T'])
// f: 向后查找
// F: 向前查找
// t: 向后查找，停在字符前
// T: 向前查找，停在字符后
```

## 文本对象

```typescript
const TEXT_OBJ_SCOPES = {
  i: 'inner',   // 内部
  a: 'around',  // 包含周围
}

const TEXT_OBJ_TYPES = new Set([
  'w', 'W',           // 单词
  '"', "'", '`',      // 引号
  '(', ')', 'b',      // 圆括号
  '[', ']',           // 方括号
  '{', '}', 'B',      // 花括号
  '<', '>',           // 尖括号
])
```

## 持久状态

```typescript
type PersistentState = {
  lastChange: RecordedChange | null  // 用于点重复
  lastFind: { type: FindType; char: string } | null
  register: string           // 寄存器
  registerIsLinewise: boolean
}
```

## 设计亮点

### 1. 类型驱动设计
状态机类型即文档，TypeScript 保证穷尽处理

### 2. 状态转换函数
```typescript
function transition(
  state: CommandState,
  input: string,
  ctx: TransitionContext,
): TransitionResult
```

### 3. 记录重放
完整记录操作用于点重复 (.)

### 4. 计数支持
支持数字前缀如 `3dw` 删除 3 个单词