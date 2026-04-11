# evolution-2026-04-12-cli-agent-approval-surface-pass.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: keep the deferred overnight media wave closed and use one stronger non-console non-media pass to thicken `topic-ai-cli-agent` with a repo-backed approval-surface note

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- kept the deferred overnight Zhihu-draft wave closed instead of reopening media work
- chose Task 8 as the next stronger bounded move because the same primary-source approval evidence now supports a CLI-shell teaching gap outside the already-stabilized console page
- reopened `site/topic-ai-cli-agent.html` and `site/md/topic-ai-cli-agent.md` for one bounded approval-surface pass
- added one new repo-backed section explaining that CLI agents may expose different approval models:
  - `action approval` from `reference/reference_agent/reference_control-agent-cli/opencode/README.md` and `reference/reference_agent/reference_control-agent-cli/opencode/internal/permission/permission.go`
  - `artifact review` from `reference/reference_agent/reference_control-agent-cli/OfficeCLI/SKILL.md`
  - `dangerous-command gate` from `reference/reference_agent/hermes-agent/hermes_cli/main.py`
- connected that section back to tool selection so the page now distinguishes shell type from approval model instead of teaching all CLI agents as one flat risk surface
- verified the site/html mirror still matches with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- did not reopen Task 9 because the console page already received the approval-boundary clarification and has an explicit defer condition unless a stronger backend/operator signal appears
- did not reopen Task 4 because there is still no newer official Claude Code changelog delta
- did not run a browser preview pass because this iteration was a bounded content-only site change and the repo already has automatic GitHub Pages deployment for `site/**` pushes

## Decisions

- treat this as a valid Task 8 reactivation because the approval-surface distinction is a stronger CLI taxonomy signal, not just another console-page wording tweak
- defer `topic-ai-cli-agent` again after this pass unless a new CLI control family, stronger primary-source approval pattern, or clearer destination appears
- rely on the existing `.github/workflows/deploy.yml` path trigger to redeploy GitHub Pages once this site-facing commit is pushed

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-cli-agent-approval-surface-pass.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, keep the deferred overnight Zhihu draft wave closed and do not reopen the current Task 8 CLI-agent page unless a stronger CLI-control family or new primary-source approval pattern appears; choose exactly one new bounded non-media slice from the remaining pool. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages should redeploy automatically if the next pass again changes `site/**`.
```
