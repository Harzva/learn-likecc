# 逆向工程规则

## 源码状态
- **来源**: npm registry source map 泄露 (2026-03-31)
- **文件数**: 1884 个 TypeScript 文件
- **代码行**: ~147,000 行
- **状态**: 不完整，缺少配置文件，不可直接编译

## 已识别的问题

### 1. Bun 特有 API
源码使用 `bun:bundle` feature flags:
```typescript
import { feature } from 'bun:bundle'
```
**解决方案**: 需要创建 polyfill 或使用 Bun 运行时

### 2. 缺失的配置文件
- `package.json` - 需要重建
- `tsconfig.json` - 需要创建
- `bunfig.toml` - Bun 配置

### 3. 依赖识别
从 import 语句识别的主要依赖:
- `@anthropic-ai/sdk` - Anthropic API SDK
- `@commander-js/extra-typings` - CLI 解析
- `chalk` - 终端颜色
- `lodash-es` - 工具函数
- `react` + `ink` - 终端 UI
- `zod` - Schema 验证

## 逆向策略

### Phase 1: 依赖重建
1. 扫描所有 import 语句
2. 提取外部依赖列表
3. 创建 package.json

### Phase 2: 类型系统修复
1. 分析 tsconfig 需求
2. 处理 bun 特有类型
3. 创建类型声明文件

### Phase 3: 编译测试
1. 尝试 tsc 编译
2. 记录错误
3. 逐个修复

## 注意事项
- 不修改核心逻辑代码
- 只补充缺失的配置和类型
- 保持代码原貌用于学习
