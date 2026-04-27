---
name: github-repo-search-download
description: Use when the user wants to search GitHub repositories by keyword, inspect ranked candidates, compare likely matches, and optionally clone the selected repository into a specified local directory. Good for prompts like “帮我搜 GitHub 上相关仓库”, “帮我找并下载一个相关仓库”, “搜索 GitHub 上的项目然后拉到 reference”, or “按关键词找仓库并 clone 到指定位置”.
---

# GitHub Repo Search Download

Use this skill when the user wants to:

- search GitHub repos by keyword
- search first without cloning
- compare a few repo candidates before downloading
- automatically clone a selected repo into a target folder
- pull a repo into `reference/` or another project-specific path

## Core idea

Treat GitHub search as the discovery layer and `git clone` as the delivery layer.

The workflow is:

1. search GitHub repos
2. inspect the top candidates
3. choose the best one
4. clone it into the requested local path

## Default workflow

Run the bundled script:

```bash
python3 .claude/skills/github-repo-search-download/scripts/search_and_clone_github_repo.py \
  "autonomous research studio" \
  --dest-root reference/reference_agent
```

Useful flags:

- `--list-only`
  - search and print candidates without cloning
- `--pick <n>`
  - choose the Nth ranked candidate instead of the default top result
- `--limit <n>`
  - control how many candidates to inspect
- `--min-stars <n>`
  - filter out weak results
- `--language <lang>`
  - prefer a language such as `python`, `typescript`, `rust`
- `--owner <owner>`
  - limit search to a specific GitHub owner/org
- `--name <folder>`
  - override the local cloned folder name
- `--force`
  - replace an existing local directory

## Decision rules

- Prefer official or clearly maintained repos over mirrors or abandoned experiments.
- Prefer repos whose name and description clearly match the requested task.
- When several repos look similar, return 2 to 5 candidates first if the user seems undecided.
- For project reference snapshots, prefer cloning into `reference/...` rather than polluting the repo root.
- For branded aliases or acronyms, search both the full phrase and the shorter alias if needed.

## Good example

Search only:

```bash
python3 .claude/skills/github-repo-search-download/scripts/search_and_clone_github_repo.py \
  "Auto-Research In Sleep" \
  --list-only \
  --limit 8 \
  --dest-root reference/reference_agent
```

## Output format

When only searching, return:

1. best-fit candidate
2. 1 to 3 alternatives
3. stars / language / updated-at signal
4. exact clone command you would use

When cloning, return:

1. selected repo
2. destination path
3. exact command used
4. whether the clone was shallow

## Notes

- This skill uses `gh search repos`, so GitHub CLI should already be installed and authenticated enough to query public repos.
- For a large or important download, prefer `--list-only` first, then clone after confirming the candidate.
