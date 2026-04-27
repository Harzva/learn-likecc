# evolution-2026-04-13-site-copy-audit-scope-upgrade.md

## This pass

- clarified that `19 tasks` means `19 long-running loop tasks`, not `19 pages`
- upgraded Task 19 from a local homepage-copy cleanup into a site-wide wording audit task
- added audit-mode rules to the dedicated plan:
  - scan the whole site first
  - group pages into batches
  - clean one batch per bounded pass
  - treat `不是` selectively instead of replacing it blindly
- recorded the first quick audit snapshot:
  - `不只讲`: rare direct hit now
  - `不只列`: currently absent in the site scan
  - `不是`: widely distributed and needs selective review

## Why this matters

- the task now matches the real user intent: not just polish one page, but improve wording across the whole site
- the loop can now progress systematically instead of relying on one-off complaints
- future passes can target high-traffic hubs first without losing track of the broader sweep

## Next handoff

Use codex-loop to continue the dedicated site-copy tone task by reading `.claude/plans/loloop/active-site-copy-tone-plan-v1.md` first. The next bounded pass should build or execute the first real batch after the audit snapshot, starting with high-traffic hub pages and first-screen helper copy.
