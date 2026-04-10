---
name: skillsmp-find-install
description: Use when the user wants to find a suitable SKILL.md-based skill from SkillsMP, compare candidates, verify the upstream GitHub repository, and optionally install it into Claude Code or Codex skill directories with the local installer script.
---

# SkillsMP Find And Install

Use this skill when the user asks things like:

- 帮我找一个合适的 skill
- 从 SkillsMP / skill market 里找可用技能
- 帮我装一个 skill 到 Claude Code / Codex
- 找几个候选 skill，对比后再决定装哪个

## Core idea

Treat `https://skillsmp.com/` as the discovery layer, not the final trust layer.

The durable chain is:

1. SkillsMP discovery
2. GitHub verification
3. local installation

## Search workflow

1. Search SkillsMP by task wording, category, or occupation wording.
2. Open 2 to 5 candidate detail pages.
3. Extract:
   - skill name
   - short description
   - repository URL
   - install path hint if visible
   - stars / update recency if visible
4. Verify the upstream GitHub repo:
   - locate `SKILL.md`
   - inspect optional scripts/templates/references
   - check whether the repo still looks maintained
5. Recommend one option, or install only if the user explicitly wants installation.

## Install workflow

Use the local installer script:

```bash
python3 tools/install_skill_from_github.py \
  --repo <owner/repo-or-url> \
  --skill-path <path-to-skill-dir-or-SKILL.md> \
  --target claude-user
```

Common targets:

- `claude-user` → `~/.claude/skills/`
- `claude-project` → `.claude/skills/`
- `codex-user` → `~/.codex/skills/`

Useful flags:

- `--dry-run` to preview
- `--force` to replace an existing installed directory
- `--name <local-name>` to override the installed folder name

## Installation rules

- copy the whole skill directory, not just `SKILL.md`
- preserve scripts, templates, references, and assets
- do not overwrite an existing local skill silently
- prefer a dry run before replacing anything

## Decision rules

- Prefer skills whose detail pages expose a clear GitHub repo and install path.
- Prefer maintained repos over abandoned ones when several skills overlap.
- Prefer narrower, task-specific skills over giant generic bundles unless the user asked for a toolkit.
- Always warn that community skills should be reviewed before installation.

## Output format

When searching, return:

1. Best-fit recommendation
2. 1 to 3 alternatives
3. Install path suggestion
4. Any safety or maintenance caveats

When installing, return:

1. what was installed
2. where it was installed
3. upstream repo URL
4. exact installer command used
5. any manual follow-up needed
