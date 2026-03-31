# 依赖规则

## 已识别的外部依赖

### 核心 runtime
| 依赖 | 用途 |
|------|------|
| `bun` | 运行时环境 |

### API 层
| 依赖 | 用途 |
|------|------|
| `@anthropic-ai/sdk` | Anthropic API 客户端 |

### CLI 层
| 依赖 | 用途 |
|------|------|
| `@commander-js/extra-typings` | CLI 参数解析 |
| `chalk` | 终端着色 |

### UI 层
| 依赖 | 用途 |
|------|------|
| `react` | UI 框架 |
| `ink` | React 终端渲染 |

### 工具库
| 依赖 | 用途 |
|------|------|
| `lodash-es` | 工具函数 |
| `zod` | Schema 验证 |

### 协议
| 依赖 | 用途 |
|------|------|
| `@modelcontextprotocol/sdk` | MCP 协议 |

## 依赖扫描命令
```bash
# 提取所有 import 语句
grep -rh "from '" src/ | grep -v "from '\." | sort | uniq
```

## 版本确定策略
1. 查看 package-lock.json (如果有)
2. 检查 API 兼容性
3. 使用最新稳定版本
