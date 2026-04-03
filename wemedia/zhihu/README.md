# 知乎自动发布系统

基于 Puppeteer + Stealth 插件的知乎自动发布工具，模拟真人浏览器操作，无需 API。

## 功能特点

- ✅ 支持 Markdown 文件发布
- ✅ 支持 JSON 配置文件
- ✅ 支持命令行参数
- ✅ 封面图自动上传
- ✅ 反检测机制
- ✅ 模拟真人输入节奏

## 安装

```bash
cd /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu
npm install
```

## 配置 Cookie

### 步骤 1：获取 Cookie

1. 打开 Chrome 浏览器
2. 访问 https://zhuanlan.zhihu.com
3. 登录你的知乎账号
4. 安装 Cookie 编辑器插件（如 "EditThisCookie"）
5. 导出 Cookie

### 步骤 2：保存 Cookie

将导出的 Cookie 保存到 `cookies.json` 文件：

```bash
cp cookies.json.example cookies.json
# 编辑 cookies.json，填入你的 Cookie 值
```

**重要的 Cookie 字段**：
- `z_c0` - 登录凭证
- `SESSIONID` - 会话ID
- `d_c0` - 设备ID
- `_xsrf` - CSRF Token

## 使用方法

### 方式 1：发布 Markdown 文件

```bash
node publish_article.js ./articles/01-封号机制揭秘.md
```

### 方式 2：使用配置文件

```bash
cp config.json.example my-article.json
# 编辑 my-article.json
node publish_article.js --config my-article.json
```

### 方式 3：命令行参数

```bash
node publish_article.js -t "文章标题" -c "文章内容"
```

### 调试模式

```bash
HEADLESS=false node publish_article.js ./article.md
```

## Markdown 格式要求

```markdown
# 文章标题

正文内容第一段...

正文内容第二段...
```

- 第一行的 `# 标题` 会作为文章标题
- 其余内容作为正文

## 注意事项

### Cookie 有效期

- 知乎 Cookie 通常有效期 7-30 天
- 发布失败时先检查 Cookie 是否过期
- 定期更新 Cookie

### 发布频率

- 建议每篇文章间隔 **5 分钟以上**
- 避免触发知乎的反 spam 机制
- 每天发布数量建议不超过 10 篇

### 内容审核

- 知乎有内容审核机制
- 发布后可能需要等待审核通过
- 敏感内容可能被直接删除

## 定时发布

配合 crontab 实现定时发布：

```bash
# 编辑 crontab
crontab -e

# 每天早上 8 点发布
0 8 * * * cd /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu && node publish_article.js ./articles/today.md
```

## 批量发布脚本

```bash
#!/bin/bash
# batch_publish.sh

ARTICLES_DIR="./articles"
INTERVAL=300  # 5 分钟间隔

for article in "$ARTICLES_DIR"/*.md; do
  echo "发布: $article"
  node publish_article.js "$article"
  sleep $INTERVAL
done
```

## 故障排查

### 登录过期

```
❌ 登录已过期，请更新 cookies.json
```

解决：重新获取 Cookie 并更新 `cookies.json`

### 找不到发布按钮

```
❌ 未找到发布按钮
```

解决：知乎可能更新了页面结构，检查 `debug-no-publish-button.png` 截图

### 输入失败

解决：尝试调试模式查看具体问题

```bash
HEADLESS=false node publish_article.js ./article.md
```

## 文件结构

```
zhihu/
├── publish_article.js      # 主程序
├── package.json            # 依赖配置
├── cookies.json           # Cookie 文件（需自行创建）
├── cookies.json.example    # Cookie 示例
├── config.json.example     # 配置示例
├── README.md              # 说明文档
└── articles/              # 文章目录
    ├── 01-封号机制揭秘.md
    ├── 02-44个隐藏功能.md
    └── ...
```

## 扩展：发布到其他平台

这套方案的核心思路可以复用到其他平台：

- **小红书**：修改选择器和发布流程
- **微信公众号**：使用公众号编辑页面
- **掘金**：适配掘金发布页面
- **CSDN**：适配 CSDN 发布流程

## 许可证

MIT License

---

**作者**: Claude Code Course 团队
