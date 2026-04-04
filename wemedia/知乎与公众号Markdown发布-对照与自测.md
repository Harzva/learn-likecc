# 知乎 vs 公众号：Markdown 发布能力对照 + 如何自测「是否打通」

本文说明：**怎样验证本仓库里知乎自动化、公众号（md2wechat）两条链路是否可用**，并整理「知乎没有像 md2wechat 那样面向个人的创作发布 API」的结论与常见替代方案。  
**平台政策与接口以官网为准**；下文中的第三方工具名仅供检索，不构成本仓库背书。

---

## 如何检测「是否打通」

### A. 知乎（本仓库 `wemedia/zhihu/publish_article.js`）

**打通**在这里指：**有效 Cookie → 能打开专栏写作页 → 能写入标题/正文 → 能点发布并拿到文章页**（或你故意只测到「能进编辑器」为止）。

| 步骤 | 做什么 | 算「通」的信号 |
|------|--------|----------------|
| 1 | `cd wemedia/zhihu && npm install` | 无报错 |
| 2 | 准备 `cookies.json`（从 `cookies.json.example` 对照格式） | 文件存在且为有效登录态 |
| 3 | **推荐**：`HEADLESS=false node publish_article.js ./articles/某篇.md` | 肉眼看到进入 `zhuanlan.zhihu.com/write`、**未**跳登录页 |
| 4 | 看控制台与终态 URL | 成功时常出现专栏文章路径（脚本里判断 `finalUrl.includes('/p/')`）；失败看 `debug-*.png` |
| 5 | Cookie 探活（最小动作） | 仅 `goto` 写作页：若 URL 含 `signin` 或标题框等选择器超时 → **未通**，先换 Cookie |

**注意**：知乎前端常改版，选择器失效时表现为「找不到输入框/发布按钮」——属于 **页面结构变了**，不是 Cookie 一定坏了；需对照 `publish_article.js` 里选择器更新。

---

### B. 微信公众号侧（md2wechat + 可选 Claude Code Skill）

**打通**建议分 **两层** 验收，不要混成一步：

1. **CLI 层（不依赖微信账号也能测大部分）**  
   - `md2wechat version --json`  
   - `md2wechat capabilities --json`  
   - `md2wechat themes list --json`  
   若以上稳定成功，说明 **本机 CLI 与 discovery 已通**。

2. **业务层（排版 / 草稿 / 素材）**  
   - **API 模式**：需 md2wechat 文档要求的 **API Key** + 按文档调用 convert；成功则拿到约定形态的 HTML 或中间结果。  
   - **AI 模式**：可能返回 **结构化 AI request**，不等于最终 HTML（以 [官方说明](https://www.md2wechat.com/zh/docs/examples/claude-code) 为准）。  
   - **真·发公众号**：需 **微信公众平台凭证**；未配置时 **CLI 再「通」也不算「发布打通」**。

**Claude Code Skill**：在 CLI 已通的前提下，用官方示例提示词跑一遍「capabilities → 处理 `article.md`」；若 Agent 能执行子命令并给出可核对输出，视为 **编排层打通**。

---

## 一、核心结论（对应 md2wechat：Markdown 转公众号 + 发布 API）

知乎**没有**与 md2wechat 同构的、面向个人的 **「Markdown → 知乎富文本 + 官方创作发布 API」** 一条龙：

- [知乎开放平台](https://open.zhihu.com)主要面向 **企业 / 机构 / 媒体**，提供数据读取、内容同步、账号管理等能力；**不**提供个人创作者常用的「Markdown 转专栏富文本、创建草稿、一键 POST 发布」类接口。  
- 知乎编辑器支持 **手动** 粘贴 Markdown 或 **导入 .md**，但**没有**公开的、个人可申请的「格式转换 + 自动发布」官方 API。  

因此：**个人若要自动化，只能走非官方路径**（浏览器自动化、第三方工具、或先转 HTML 再人工粘贴等）。

---

## 二、知乎官方开放 API 的大致范围（偏数据 / 管理，非个人创作发布）

常见能力方向（具体以开放平台文档为准）：

- **内容数据获取**：问题、回答、文章、专栏、话题、用户、热度等 **GET 类**接口。  
- **账号 / 授权**：OAuth、身份校验、粉丝与关注等。  
- **媒体分发**：多为 **机构白名单** 将知乎内容同步到合作渠道；**不是**从外部 Markdown 反向官方 POST 到知乎个人专栏。  

**一般没有**（对个人自动化发文而言）：Markdown → 知乎 HTML 的官方服务、上传图片到知乎素材库、创建草稿、发布文章/回答的 **标准 POST 创作 API**。

---

## 三、替代方案（实现 md → 知乎，类比 md2wechat 思路）

### 1. 第三方开源 / 插件（偏「转格式 + 人工或半自动」）

- **md2zhihu**（Python 生态中常见检索名）：将 Markdown 转为更接近知乎编辑器的 HTML，处理表格、公式、代码块、图片等；可脚本化后 **粘贴或配合自动化**。  
- **VSCode-Zhihu** 等编辑器插件：在 VS Code 内预览、转换、配合发布流程（实现方式多为 **非官方**，需自行评估风险与 ToS）。  
- **浏览器侧 Markdown 增强插件**：把编辑体验改成 Markdown，再依赖知乎前端保存/发布。

### 2. 自动化发布（无官方 API：模拟真人）

- **Playwright / Selenium / Puppeteer**（本仓库知乎脚本即此类）：登录态 + 打开写作页 + 输入 + 点击发布。  
- **风险**：频率过高、特征明显可能触发风控；需控制间隔、尽量模拟人工（本仓库 `publish_article.js` 使用 Stealth + 输入延迟即为此类缓解）。  
- **第三方运营 SaaS**：多为 **账号绑定 + 后台模拟或半自动**，本质仍非官方创作 API。

---

## 四、对比：md2wechat vs 知乎常见方案

| 维度 | md2wechat（公众号向） | 知乎（官方 + 本仓库/常见替代） |
|------|------------------------|--------------------------------|
| **个人创作官方 API** | 微信侧亦无「Markdown POST 发公众号」的完全开放个人 API；md2wechat 提供 **产品与文档化能力**（API/AI 模式等），仍依赖凭证与合规使用 | **无**面向个人的「Markdown→富文本→发布」官方 API |
| **格式转换** | CLI/服务将 Markdown 转为公众号可用 HTML/流程 | 需自研或 **md2zhihu 类工具** 转 HTML，再粘贴；或依赖编辑器自带 Markdown |
| **自动化发布** | 在凭证齐全前提下走产品能力；否则仍可能需人工在后台点发布 | **Puppeteer/Playwright** 模拟（如本仓库）；或第三方工具 |
| **本仓库已落地** | `wemedia/wechat/` 备忘 + 外链官方 Claude Code 接入文档 | `wemedia/zhihu/publish_article.js` + `cookies.json` |
| **最小自测** | `md2wechat version` / `capabilities` | `HEADLESS=false` 打开发布页 + 是否跳登录 |

---

## 相关路径

- 知乎发布实现：`wemedia/zhihu/publish_article.js`、`wemedia/zhihu/README.md`  
- 公众号备忘：`wemedia/wechat/README.md`、`wemedia/wechat/Claude-Code-md2wechat接入备忘.md`

---

*若开放平台政策变更，请以知乎、微信、md2wechat 官网为准并及时修订本文。*
