---
name: repo-release-governance
description: Use when working on learn-likecc and the task involves new requirements, roadmap updates, README updates, git commits, GitHub Pages updates, or release/version changes. Ensures every new requirement is written into plan files, unfinished work remains in TODO sections, and release/git/pages handling follows the repo workflow without the user needing to restate it each time.
---

# Repo Release Governance

Use this skill for `learn-likecc` whenever the work touches:

- new user requirements
- roadmap or milestone changes
- README positioning / TODO updates
- git commits
- GitHub Pages related updates
- release / version / changelog updates

## Mandatory workflow

1. Every new user requirement must be recorded in a plan file.
   Preferred file:
   - `.claude/plans/likecode-model-freedom-roadmap.md`
   If the requirement belongs elsewhere, add it to the relevant plan too.

2. Every unfinished requirement must remain visible in README TODO sections.
   Do not quietly drop pending work after discussing it.
   If something is proposed but not implemented, keep it in:
   - `README.md`
   - relevant `.claude/plans/*.md`

3. When a feature is finished:
   - mark it complete in the relevant plan
   - update README checklists
   - add a short real-demand mapping when useful

4. When the work affects release shape:
   always check and update these if relevant:
   - `CHANGELOG.md`
   - visible version strings
   - release/tag baseline
   - Pages-facing README/site copy if user-facing behavior changed

5. When committing:
   - keep commits scoped to the current task
   - avoid mixing unrelated dirty worktree changes
   - summarize what was included and what was intentionally excluded

## Persistent assumptions for this repo

- The user expects requirements to be tracked, not just discussed.
- The repo tradition is: completed items get check marks, pending items stay in TODO.
- Git / Pages / Release work should not require repeated reminders from the user.

## Minimum checklist before finishing a task

- Was the new requirement written into a plan?
- If not finished, is it still present in README TODO?
- If finished, did we mark it complete in README/plan?
- If user-facing, did we update release/version/changelog context?
- If committing, did we keep the commit scoped?
