# 57MB Source Map 泄露：Anthropic 犯了什么错？

> 一个低级错误，暴露了整个帝国

---

## 事件回顾

2026年3月，Anthropic 在发布 Claude Code CLI 时，犯了一个低级错误：

> **将 Source Map 文件打入了正式发布包**

57MB 的 cli.js.map，包含了 1906 个 TypeScript 源文件的完整映射。

---

## 什么是 Source Map？

### 基本概念

```
开发环境:
  源码 (TypeScript) ──编译──▶ 压缩代码 (JavaScript)
     ↑                              │
     └────── Source Map ────────────┘
              (对照表)
```

### Source Map 的作用

```javascript
// 压缩后的代码
var a=1,b=2;console.log(a+b);

// Source Map 告诉调试器：
// 第1行第1列的 a 对应 src/index.ts 第5行第10列的 count
// 第1行第5列的 console.log 对应 src/index.ts 第6行第1列的 console.log
```

### 正常情况

```
生产发布时：
  ✅ 压缩后的 JavaScript
  ✅ 必要的资源文件
  ❌ Source Map (不发布！)
```

---

## Anthropic 的错误

### 泄露的文件结构

```
claude-code-v2.1.888/
├── cli.js           (2MB 压缩代码)
├── cli.js.map       (57MB Source Map) ← 不应该存在！
├── package.json
└── ...
```

### Source Map 内容

```json
{
  "version": 3,
  "sources": [
    "src/QueryEngine.ts",
    "src/Tool.ts",
    "src/AgentLoop.ts",
    // ... 1906 个源文件路径
  ],
  "sourcesContent": [
    "// 完整的 TypeScript 源码...",
    "// 完整的 TypeScript 源码...",
    // ... 51万行代码
  ],
  "mappings": "AAAA,OAAM,..."  // 映射关系
}
```

---

## 为什么会泄露？

### 可能的原因

1. **构建配置错误**

```javascript
// webpack/rollup/esbuild 配置
export default {
  // ...
  sourcemap: true,  // ← 开发时设置的，忘记关闭
}
```

2. **CI/CD 流程疏漏**

```yaml
# CI 配置
- name: Build
  run: npm run build  # 包含了 sourcemap

- name: Package
  run: npm pack       # 直接打包，没有过滤
```

3. **紧急发布**

```bash
# 可能的紧急发布流程
npm run build
npm publish  # 没有检查打包内容
```

---

## 泄露了什么？

### 核心代码

| 模块 | 文件数 | 说明 |
|------|--------|------|
| QueryEngine | 50+ | 核心查询引擎 |
| Tools | 100+ | 工具系统 |
| MCP | 30+ | MCP 协议实现 |
| Permissions | 20+ | 权限系统 |
| Telemetry | 15+ | 遥测系统 |

### 敏感信息

```typescript
// 泄露的遥测配置
const TELEMETRY_ENDPOINTS = {
  production: 'https://stats.anthropic.com/v1/telemetry',
  staging: 'https://stats-staging.anthropic.com/v1/telemetry',
}

// 泄露的 feature flags
const FEATURES = {
  KAIROS: 'kairos_enabled',
  ULTRAPLAN: 'ultraplan_enabled',
  // ... 44 个隐藏功能
}

// 泄露的内部注释
// TODO: @internal - This should not be exposed
// FIXME: Security risk - remove before production
```

---

## 安全影响

### 直接影响

1. **商业机密泄露**
   - 核心算法实现
   - 产品路线图（feature flags）
   - 内部架构设计

2. **安全风险**
   - 遥测系统细节
   - 权限验证逻辑
   - 加密实现方式

3. **竞争劣势**
   - 竞争对手可以直接学习
   - 开源项目可以快速复制

### 间接影响

1. **用户信任受损**
   - 遥测数据采集细节引发隐私担忧
   - 隐藏功能的发现引发质疑

2. **法律风险**
   - 未经同意的数据采集可能违法
   - 欧盟 GDPR 合规问题

---

## 如何避免？

### 构建时

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  devtool: false,  // ← 关闭 sourcemap
  // 或者
  devtool: 'hidden-source-map',  // 生成但不包含引用
}
```

### 发布前检查

```bash
#!/bin/bash
# pre-publish-check.sh

# 检查是否包含 sourcemap
if find . -name "*.map" | grep -q .; then
  echo "❌ 发现 Source Map 文件！"
  exit 1
fi

# 检查包大小
SIZE=$(du -sm package.tgz | cut -f1)
if [ $SIZE -gt 10 ]; then
  echo "⚠️ 包大小异常: ${SIZE}MB"
fi

echo "✅ 检查通过"
```

### CI/CD 流程

```yaml
# .github/workflows/publish.yml
- name: Build
  run: npm run build:production

- name: Check for sourcemap
  run: |
    if find dist -name "*.map" | grep -q .; then
      echo "Source map detected!"
      exit 1
    fi

- name: Package
  run: npm pack
```

---

## 行业类似事件

| 公司 | 年份 | 泄露内容 | 原因 |
|------|------|----------|------|
| **Anthropic** | 2026 | Claude Code 源码 | Source Map 未移除 |
| Facebook | 2018 | 内部工具源码 | Source Map 泄露 |
| Microsoft | 2020 | VS Code 扩展 | 开发配置泄露 |
| Google | 2021 | 内部 API | 错误配置 |

---

## 给开发者的启示

### 1. 检查发布包

```bash
# 发布前检查
npm pack
tar -tzf package.tgz  # 查看内容
```

### 2. 使用 .npmignore

```
# .npmignore
*.map
*.ts
src/
test/
.env*
```

### 3. 自动化检查

```json
// package.json
{
  "scripts": {
    "prepack": "node scripts/check-sourcemap.js",
    "postbuild": "rm -rf dist/**/*.map"
  }
}
```

---

## 结语

57MB 的 Source Map，暴露了 Anthropic 的整个 Claude Code 帝国。

这是一个低级错误，但也是一个警示：

> **安全无小事，发布需谨慎**

对于 Anthropic，这是一次昂贵的教训。
对于开发者社区，这是一份宝贵的资源。

---

**作者**: Claude Code Course 团队
**日期**: 2026-04-03
**标签**: #ClaudeCode #SourceMap #安全泄露 #DevOps

---

> 本文基于 Claude Code 源码泄露事件分析，仅供技术学习研究。Claude Code 是 Anthropic 的产品。
