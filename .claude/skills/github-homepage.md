# github-homepage

优化 GitHub 个人主页（profile README）与精选展示

## 这个 skill 合不合适

合适。

因为这不是一次性的文案修改，而是一类可重复的工作：

- 读取当前 GitHub profile README
- 识别当前身份定位、研究方向、代表项目
- 重写主页结构，让它更像个人技术主页
- 必要时同步提交到 `Harzva/Harzva`

这类任务边界清楚、重复性高、输出物稳定，非常适合封装成 skill。

## 使用方式

```text
/github-homepage
```

## 任务目标

把 GitHub 主页从默认占位 README，优化成更像：

- 研究者主页
- AI 工程作者主页
- 项目导航首页
- 个人作品集入口

## 默认处理对象

优先处理：

- `Harzva/Harzva`

也就是 GitHub profile README 对应仓库。

## 工作步骤

1. 确认 profile 仓库是否存在
   - `gh repo view Harzva/Harzva`

2. 拉取或更新 profile 仓库
   - 克隆到临时目录
   - 读取当前 `README.md`

3. 结合当前阶段项目重新组织主页内容
   重点包括：
   - 个人一句话定位
   - 当前研究 / 工程方向
   - 正在推进的代表项目
   - 精选仓库链接
   - 联系方式

4. 优化 README 的结构与可读性
   推荐结构：
   - 标题
   - 简介
   - About Me
   - What I'm Working On
   - Featured Repositories
   - Current Focus
   - Collaboration
   - Contact

5. 如果用户明确要落库
   - 提交到 `Harzva/Harzva`
   - 推送到 `main`

## 内容原则

- 不写空泛自我介绍
- 不保留默认模板句式
- 重点突出正在做的项目和真实方向
- 让访问者一眼知道“你在做什么”
- 优先展示能证明技术方向的仓库

## 当前推荐展示项目

- `learn-likecc`
- `everything-agent-cli-to-claude-code`
- `gemini-plugin-cc`
- `qwen-plugin-cc`
- `grok-plugin-cc`
- `trae-plugin-cc`

## 输出

- 优化后的 GitHub profile README
- 如有提交：
  - commit id
  - push 结果
