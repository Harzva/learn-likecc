# Awesome Skills

> 面向 `SKILL.md` 生态的发现与安装入口清单。与本站 [Skill 市场专题](https://harzva.github.io/learn-likecc/topic-skillmarket.html) 和 [Claude Code 教程里的 Skills 章节](https://harzva.github.io/learn-likecc/tutorial.html#skills) 互补。

姊妹清单：[awesome-agent.md](./awesome-agent.md) · [awesome-rag.md](./awesome-rag.md) · [awesome-claude-code-source.md](./awesome-claude-code-source.md)

## 发现入口

| 资源 | 描述 |
|------|------|
| [SkillsMP](https://skillsmp.com/) | 面向开源 `SKILL.md` 生态的聚合搜索站；按分类、职业、热度与详情页来发现 skill |
| [skills.sh](https://skills.sh/) | 更偏安装入口与包管理心智，适合从 skill 名称直接装包 |
| [Anthropic Skills Docs](https://docs.anthropic.com/en/docs/claude-code/skills) | Claude Code 官方技能文档 |
| [OpenAI Codex Skills Docs](https://github.com/openai/codex/blob/main/docs/skills.md) | Codex / ChatGPT 兼容的技能格式与安装说明 |
| [Agent Skills Spec](https://agentskills.io/) | `SKILL.md` 生态的公开规范入口 |

## 建议工作流

1. 先在 [SkillsMP](https://skillsmp.com/) 按问题域、职业或关键词筛选候选 skill。
2. 再跳到 skill 对应 GitHub 仓库，检查 `SKILL.md`、脚本、模板和最近维护情况。
3. 确认安全边界后，再安装到 `~/.claude/skills/`、`~/.codex/skills/` 或项目级 `.claude/skills/`。

## 已验证的 SkillsMP 详情页样例

| Skill | SkillsMP 页面 | GitHub 仓库 |
|------|------|------|
| `github-repo-management` | [详情页](https://skillsmp.com/skills/fanthus-agent-skills-github-repo-management-skill-md) | [fanthus/agent-skills](https://github.com/fanthus/agent-skills) |
| `slides` | [详情页](https://skillsmp.com/skills/bloody-badaim-svsit-site-claude-skills-slides-skill-md) | [Bloody-BadAim/svsit-site](https://github.com/Bloody-BadAim/svsit-site/tree/main/.claude/skills/slides) |

## 安装落点备忘

| 位置 | 说明 |
|------|------|
| `~/.claude/skills/<skill>/SKILL.md` | Claude Code 个人级 skill |
| `.claude/skills/<skill>/SKILL.md` | Claude Code 项目级 skill |
| `~/.codex/skills/<skill>/SKILL.md` | Codex CLI / ChatGPT 个人级 skill |

## 仓库内安装工具

| 工具 | 作用 |
|------|------|
| [`tools/install_skill_from_github.py`](./tools/install_skill_from_github.py) | 从 GitHub 仓库浅克隆 skill 目录并安装到 Claude/Codex 本地 skill 根目录 |
| [`.claude/skills/skillsmp-find-install/SKILL.md`](./.claude/skills/skillsmp-find-install/SKILL.md) | 先在 SkillsMP 发现候选，再回 GitHub 校验与安装的工作流 skill |

## 本站相关

- [topic-skillmarket.html](site/topic-skillmarket.html) — Skill 市场专题页
- [tutorial.html#skills](site/tutorial.html) — Skills 教程章节
- [.claude/skills/skillsmp-find-install/SKILL.md](.claude/skills/skillsmp-find-install/SKILL.md) — 仓库内可执行的检索安装 skill

---

## 免责声明

本清单仅供学习研究。社区 skill 指向的仓库与脚本请在安装前自行审阅，不应把聚合站条目直接视为安全背书。

---

最后更新：`2026-04-10`
