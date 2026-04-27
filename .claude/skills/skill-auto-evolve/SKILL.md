---
name: skill-auto-evolve
description: Automatically fix, enhance, and optimize other skills when problems occur. Use when a skill fails or produces unexpected results. Prevents similar issues in the future.
---

# Skill Auto-Evolve

这个 skill 用于自动修复、增强和优化其他 skill。当一个 skill 执行失败或产生意外结果时，自动分析问题并更新对应的 skill 文件。

## 触发条件

当出现以下情况时自动触发：

1. Skill 执行失败（返回错误）
2. Skill 执行超时
3. Skill 输出与预期不符
4. 用户明确表示某个 skill 有问题

## 工作流程

### 1. 问题诊断

首先确定问题类型：

| 错误类型 | 诊断方法 |
|---------|---------|
| 脚本超时 | 检查 timeout 配置，网络状态 |
| 依赖缺失 | 检查 node_modules，npm install |
| Cookie 过期 | 检查 cookies.json 的 expires 字段 |
| 选择器失效 | 检查目标网站 DOM 结构变化 |
| 参数错误 | 检查传入参数格式和内容 |
| 路径问题 | 检查相对/绝对路径 |

### 2. 问题记录

在 skill 目录下创建 `issues/` 子目录，记录问题：

```markdown
# issues/YYYY-MM-DD-issue-name.md

## 问题描述
[错误信息或现象]

## 诊断过程
[分析步骤]

## 根本原因
[根本原因]

## 修复方案
[解决方案]

## 验证结果
[修复后的测试结果]
```

### 3. Skill 更新

根据问题类型更新 SKILL.md：

```markdown
## 已知问题与解决方案

### 问题：[问题名称]
**症状**：[错误表现]
**原因**：[根本原因]
**解决**：[修复方法]

### 问题：[问题名称]
...
```

### 4. 脚本修复

如果是脚本问题，直接修复脚本：

```bash
# 常见修复模式

# 1. 增加超时时间
timeout: 60000  # 从 30000 增加到 60000

# 2. 添加重试逻辑
async function retry(fn, times = 3) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === times - 1) throw e
      await sleep(1000 * (i + 1))
    }
  }
}

# 3. 添加错误处理
try {
  // 操作
} catch (error) {
  console.error('详细错误:', error)
  await page.screenshot({ path: 'debug-error.png' })
  throw error
}
```

### 5. 验证修复

修复后运行测试验证：

```bash
# 重新执行失败的 skill
node [script].js [args]

# 检查输出
echo $?  # 0 表示成功
```

## 常见问题模板

### Puppeteer 超时

```javascript
// 修复方案：增加超时和重试
const browser = await puppeteer.launch({
  headless: false,  // 调试时设为 false
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  protocolTimeout: 120000,  // 增加协议超时
})

await page.goto(url, {
  waitUntil: 'networkidle2',
  timeout: 60000,  // 增加导航超时
})
```

### Cookie 过期

```javascript
// 检查 cookie 有效性
function checkCookieExpiry(cookies) {
  const now = Date.now() / 1000
  for (const cookie of cookies) {
    if (cookie.expires && cookie.expires < now) {
      console.warn(`Cookie ${cookie.name} 已过期`)
      return false
    }
  }
  return true
}
```

### 选择器失效

```javascript
// 使用多个备选选择器
const selectors = [
  '.new-selector',
  '.old-selector',
  '[data-testid="target"]'
]

for (const selector of selectors) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 })
    break
  } catch (e) {
    continue
  }
}
```

## 输出格式

修复完成后输出：

```
✅ Skill 已自动更新

📍 Skill: [skill-name]
🐛 问题: [问题描述]
🔧 修复: [修复内容]
📁 更新文件: [SKILL.md / script.js]

验证: [成功/失败]
```

## 使用方法

```
/skill-auto-evolve [失败的skill名称] [错误信息]
```

例如：
```
/skill-auto-evolve zhihu-publish "Navigation timeout of 30000 ms exceeded"
```
