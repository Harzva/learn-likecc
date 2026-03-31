# Commands 命令系统分析

## 概述

Commands 系统实现斜杠命令，用户通过 `/command` 形式调用。

## 目录结构

- **命令目录数**: 101 个
- **注册文件**: `commands.ts` (25KB)

## 命令注册机制

```typescript
// commands.ts - 导入所有命令
import commit from './commands/commit.js'
import compact from './commands/compact/index.js'
import config from './commands/config/index.js'
import doctor from './commands/doctor/index.js'
import mcp from './commands/mcp/index.js'
// ... 更多命令

// 条件导入 (Feature Flags)
const voiceCommand = feature('VOICE_MODE')
  ? require('./commands/voice/index.js').default
  : null

const bridge = feature('BRIDGE_MODE')
  ? require('./commands/bridge/index.js').default
  : null
```

## 主要命令列表

| 命令 | 目录 | 功能 |
|------|------|------|
| /commit | commit.js | Git 提交 |
| /compact | compact/ | 上下文压缩 |
| /config | config/ | 配置管理 |
| /doctor | doctor/ | 环境诊断 |
| /mcp | mcp/ | MCP 服务器管理 |
| /login | login/ | 登录认证 |
| /logout | logout/ | 登出 |
| /memory | memory/ | 记忆管理 |
| /review | review.js | 代码审查 |
| /resume | resume/ | 恢复会话 |
| /skills | skills/ | 技能管理 |
| /tasks | tasks/ | 任务管理 |
| /theme | theme/ | 主题切换 |
| /vim | vim/ | Vim 模式 |
| /diff | diff/ | 查看差异 |
| /cost | cost/ | 成本查询 |

## 条件命令 (Feature Gated)

| 命令 | Feature Flag |
|------|-------------|
| /voice | VOICE_MODE |
| /bridge | BRIDGE_MODE |
| /proactive | PROACTIVE, KAIROS |
| /assistant | KAIROS |
| /brief | KAIROS, KAIROS_BRIEF |
| /workflows | WORKFLOW_SCRIPTS |

## 命令结构

每个命令模块导出：

```typescript
export default {
  name: 'command-name',
  description: '命令描述',
  usage: '/command-name [args]',
  execute: async (args, context) => {
    // 命令逻辑
  }
}
```

## 命令类型

### 1. 同步命令
立即执行并返回结果

### 2. 交互式命令
需要用户输入或选择

### 3. 启动器命令
启动新的 UI 模式 (如 /doctor)

## 设计亮点

### 1. 条件加载
```typescript
// 根据环境变量条件加载
const agentsPlatform =
  process.env.USER_TYPE === 'ant'
    ? require('./commands/agents-platform/index.js').default
    : null
```

### 2. Feature Flag 控制
未启用的命令完全不加载，减少包体积

### 3. 模块化
每个命令独立目录，易于维护