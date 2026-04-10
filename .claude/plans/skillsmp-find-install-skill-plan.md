# SkillsMP Find-Install Skill Plan

## 动机

`SkillsMP` 适合做 skill 发现层，但当前不负责完整的一键安装闭环。

我们自己补这一层，有三个直接价值：

1. 让“找 skill”从网页浏览升级成可执行工作流。
2. 把最终信任面放回 GitHub 仓库与本地落盘，而不是停留在聚合站详情页。
3. 让 Claude Code / Codex 都能复用同一套安装逻辑。

## 目标

- 做一个可复用的 `skillsmp-find-install` skill
- 配一个仓库内安装脚本，负责从 GitHub 拉取 skill 目录并安装
- 把动机、用法、边界写进仓库文档与 changelog

## 非目标

- 不复刻一个新的 Skills 市场
- 不尝试绕过 SkillsMP 的前端保护去做脆弱爬虫
- 不在没有用户确认时静默覆盖本地已有 skill

## 工作流

1. 先在 SkillsMP 找 2 到 5 个候选 skill。
2. 回 GitHub 仓库检查 `SKILL.md`、脚本与维护状态。
3. 默认先推荐，再按用户确认安装。
4. 安装时用 `tools/install_skill_from_github.py` 落到：
   - `~/.claude/skills/`
   - `.claude/skills/`
   - `~/.codex/skills/`

## 当前交付

- [x] 新增 `tools/install_skill_from_github.py`
- [x] 将 `skillsmp-find-install` 从骨架升级为可执行工作流说明
- [x] 更新 `awesome-skills.md`
- [x] 更新 `tools/README.md`
- [x] 记录动机与边界

## 后续可继续

- [ ] 增加 `--from-skillsmp-url` 之类的详情页解析辅助能力
- [ ] 增加 repo 安全检查与最近更新时间提示
- [ ] 增加可选的安装后 smoke test
