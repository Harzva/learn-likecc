# Skill 市场专题
> **更新时间**: 2026-04-11

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
- **回到 GitHub 后，可信 skill 仓库至少该暴露什么证据**
- **这 6 个仓库更适合被当作“实用工具流”来读**
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

### 回到 GitHub 后，可信 skill 仓库至少该暴露什么证据

Task 8 这轮再往前走一步，不是继续夸市场页，而是补一个更实用的判断标准：当 SkillsMP 把你带回 GitHub 后，一个值得继续安装的 skill / plugin 仓库，至少要把“怎么装、会跑什么、怎么发布、出了问题靠什么验证”说清楚。

这一轮拿两个本地 reference 做对照：

- `reference/reference_skill/baoyu-skills/`
  - README 直接给出 `npx skills add`、`/plugin marketplace add`、`/plugin install` 三种安装路径
  - `docs/creating-skills.md` 把 `SKILL.md` frontmatter、脚本目录、EXTEND.md、分组规则写成明确规范
  - `docs/publishing.md` 继续把 `openclaw` metadata、共享包同步、vendor 提交与 pre-push 校验写成可维护发布链
- `reference/reference_skill/codex-plugin-cc/`
  - README 直接列出 `/codex:review`、`/codex:rescue`、`/codex:status` 等具体命令，而不是只说“这是个插件”
  - `plugins/codex/.claude-plugin/plugin.json` 明确暴露 plugin name / version / description
  - `tests/` 目录直接说明这不是纯文案仓库，而是有运行时与命令面的可验证实现

所以回到 GitHub 后，最少要看这四类证据：

- **安装证据**：有没有清楚的 marketplace / direct install / setup 路径
- **执行证据**：有没有具体命令、脚本目录、运行时依赖，而不是只给口号
- **发布证据**：有没有版本、metadata、发布脚本或同步流程
- **验证证据**：有没有测试、pre-push 校验、或至少能说明怎样避免仓库状态和发布状态漂移

这会把 Skill 市场页的角色定得更清楚：它负责把你带到候选仓库，但真正决定“能不能装、该不该装”的，仍然是仓库里的这些证据面，而不是详情页标题本身。

再往前走一步，这两类 reference 还顺手说明了一件更容易混淆的事：**skill 仓库**和**plugin 仓库**虽然都能出现在市场链路里，但你回 GitHub 后，应该看的包装面并不完全一样。

| 包装形态 | 这轮本地样例 | 回 GitHub 后先看什么 | 它更像在交付什么 |
| --- | --- | --- | --- |
| skill bundle / skill marketplace | `reference/reference_skill/baoyu-skills/` | `.claude-plugin/marketplace.json` 里怎样把多个 `skills/baoyu-*` 目录收进同一个 marketplace；每个 skill 是否有独立 `SKILL.md`；`docs/creating-skills.md` 和 `docs/publishing.md` 是否把 authoring / publish 规则写清楚 | 一组可以被市场发现、被单独调用、但又共享发布纪律的 skill 包 |
| plugin bundle / command surface | `reference/reference_skill/codex-plugin-cc/` | `.claude-plugin/marketplace.json` 如何指向 `plugins/codex`；`plugins/codex/.claude-plugin/plugin.json` 是否给出 plugin 元数据；`commands/`、`agents/`、`skills/` 是否把命令面、代理面和内置 skill 面拆开 | 一个可安装的 plugin，里面再挂命令、agent、skill 与 runtime 脚本 |

这张表的作用，是帮我们在“发现之后的 GitHub 校验”阶段少走弯路：如果你看到的是 skill bundle，就重点审 `SKILL.md`、marketplace 收录方式和发布同步链；如果你看到的是 plugin bundle，就重点审 plugin 元数据、命令入口、agent 入口和测试面。不要把这两类仓库都当成同一种“技能目录”去看。

### 这 6 个仓库更适合被当作“实用工具流”来读

按 2026-02-05 掘金文章《GitHub这 6 个超神的 SKills，赶紧收藏》提到的 6 个仓库，我们已经把源码快照统一落到 `reference/reference_skill/practical-toolflows/`。

这轮最重要的新增判断是：**它们更像六条完整工具流，而不只是六个 skill 名字。**

对应关系如下：

- `remotion-dev/skills` → `reference/reference_skill/practical-toolflows/remotion-dev-skills/`
  - 适合当“视频生成规则库”来读，关键在 `skills/remotion/SKILL.md` 和按主题拆开的规则文件。
- `op7418/Youtube-clipper-skill` → `reference/reference_skill/practical-toolflows/Youtube-clipper-skill/`
  - 这是一条完整的视频剪辑流水线：下载、字幕解析、AI 分章、剪辑、双语字幕、烧录、总结文案。
- `GBSOSS/skill-from-masters` → `reference/reference_skill/practical-toolflows/skill-from-masters/`
  - 这是“生产 skill 的工作流”：先找实践高手与失败案例，再归纳，再交给 skill-creator 生成。
- `PleasePrompto/notebooklm-skill` → `reference/reference_skill/practical-toolflows/notebooklm-skill/`
  - 把浏览器自动化、NotebookLM 知识库、CLI 提问和追问补全接成一条研究流。
- `wshuyi/x-article-publisher-skill` → `reference/reference_skill/practical-toolflows/x-article-publisher-skill/`
  - 这是内容发布流：Markdown 解析、结构化定位、浏览器自动化写入 X Articles 草稿。
- `anthropics/skills` → `reference/reference_skill/practical-toolflows/anthropics-skills/`
  - 更像技能生态底座：样例、模板、规范、plugin marketplace 都在同一个仓库里。

这 6 个样本合起来，刚好覆盖了六种典型“实用工具流”：

- 视频生成
- 视频剪辑
- skill 生产
- 知识库问答
- 内容发布
- 官方生态底座

所以这页现在不只是在讲“怎么发现 skill”，而是在往前推进一步：**发现之后，要学会判断一个仓库到底只是 prompt 包，还是已经长成了可执行的工具流。**

### 我们已经把这条线整理成仓库内汇总

说明这条路线已经同步沉淀到根目录的 `awesome-skills.md`，让它不只是网页入口，也成为一个仓库内可维护、可补充、可 diff 的长期锚点。当前仓库还新增了 `tools/install_skill_from_github.py`，开始承接真正的 GitHub 安装层。

### 下一步怎么把它做成真正的“自动找 skill 并安装”

当前建议先做成**半自动 skill** 而不是全自动安装器：

- 先提取用户任务关键词
- 再从 SkillsMP 找候选 skill
- 默认先推荐与解释，最后才按用户确认去安装
- 安装动作优先走仓库内脚本 `tools/install_skill_from_github.py`

仓库里现在有三块执行面：`.claude/skills/skillsmp-find-install/SKILL.md` 负责工作流，`tools/install_skill_from_github.py` 负责实际安装，`tools/skillsmp_find_and_install.py` 负责根据 SkillsMP 搜索结果自动挑选候选并继续走安装链。
