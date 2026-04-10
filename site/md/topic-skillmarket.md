# Skill 市场专题

> **在线页面**: <https://harzva.github.io/learn-likecc/topic-skillmarket.html>  
> **本文件**: `site/md/topic-skillmarket.md`  
> **说明**: HTML 为权威阅读面；本文件提供目录与摘要，便于 diff、审阅与纯文本导航。

## 概要

这页把 `https://skillsmp.com/` 单独收成一个专题，核心判断是：它很适合做 `SKILL.md` 生态的**发现层**，帮助我们先搜到候选 skill、看到仓库入口，再回到 GitHub 判断要不要安装。对后续“自动寻找合适 skill 并下载”的能力来说，正确链路不是一步到位自动安装，而是 **SkillsMP 发现 → GitHub 校验 → 本地安装**。

## 目录（对照 HTML）

- **为什么看**
- **截至 2026-04-10，SkillsMP 给了我们什么**
- **为什么它适合做我们后续自动化 skill 的发现层**
- **现在就能拿来当样例的两个详情页**
- **我们已经把这条线整理成仓库内汇总**
- **下一步怎么把它做成真正的“自动找 skill 并安装”**

## 各节摘要（对照 HTML）

### 为什么看

解释为什么要把 SkillsMP 升级成一个单独专题：市场页适合聚合和搜索，但真正决定能不能安装、该不该信，仍然要回到 GitHub 仓库里的 `SKILL.md`、脚本与目录结构。

### 截至 2026-04-10，SkillsMP 给了我们什么

这一节记录首页口径：当前站点强调自己是面向开放 `SKILL.md` 生态的聚合市场，首页展示 `805,711` 个 skill，并给出按分类、职业和技能详情页三种主要组织方式，足以承担“先搜候选，再精筛”的工作流。

### 为什么它适合做我们后续自动化 skill 的发现层

把未来自动化拆成三步：

- `SkillsMP` 负责搜索和消歧
- `GitHub` 负责核验仓库与 skill 内容
- 本地 skill 目录负责最终落盘与使用

结论是：“在这个网址寻找就行”，但不要把这个网址当作最终信任面。

### 现在就能拿来当样例的两个详情页

用两个已经能验证到仓库指向的例子说明 SkillsMP 的价值：

- `github-repo-management` → `fanthus/agent-skills`
- `slides` → `Bloody-BadAim/svsit-site/.claude/skills/slides`

这足以证明详情页已能承担“发现 + 跳转仓库 + 看安装提示”的前置角色。

### 我们已经把这条线整理成仓库内汇总

说明这条路线已经同步沉淀到根目录的 `awesome-skills.md`，让它不只是网页入口，也成为一个仓库内可维护、可补充、可 diff 的长期锚点。当前仓库还新增了 `tools/install_skill_from_github.py`，开始承接真正的 GitHub 安装层。

### 下一步怎么把它做成真正的“自动找 skill 并安装”

当前建议先做成**半自动 skill** 而不是全自动安装器：

- 先提取用户任务关键词
- 再从 SkillsMP 找候选 skill
- 默认先推荐与解释，最后才按用户确认去安装
- 安装动作优先走仓库内脚本 `tools/install_skill_from_github.py`

仓库里现在有两块执行面：`.claude/skills/skillsmp-find-install/SKILL.md` 负责工作流，`tools/install_skill_from_github.py` 负责实际安装。
