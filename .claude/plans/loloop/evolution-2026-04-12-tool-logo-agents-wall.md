# evolution-2026-04-12-tool-logo-agents-wall.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- bounded target: stay on the active Task 9 logo-asset line for one more reuse pass and prove that the same local image-first / fallback system also works on the broader agent wall

## Completed

- reused the same local asset directory `site/images/tool-logos/` instead of creating a second agent-specific icon path
- added local logo assets for `OpenClaw`, `Manus`, `MiniMax Agent`, `Genspark`, and `Fellou`
- extended `site/topic-ai-agents.html` so those five representative cards now render local product marks first and fall back to initials only when the image cannot load
- kept the remaining cards letter-first for now, which preserves wall consistency while avoiding a long unstable fetch tail for weaker sources

## Failed or Deferred

- did not add an `Operator` image in this pass because OpenAI asset fetches remain challenge-gated from this environment
- did not convert the entire `AI 智能体墙`; this round was intentionally capped at one representative subset spanning open-source assistant, generalist agent, platform-backed agent, workspace agent, and browser agent

## Reference-backed decision

- `reference/reference_cc_ui/claudecodeui/README.md` keeps recognizable product marks adjacent to names, which lowers scan cost when a page compares multiple tools in one surface
- `reference/reference_cc_ui/hermes-webui/CHANGELOG.md` explicitly prefers bundled self-hosted icons over runtime dependence on remote icon delivery
- applied pattern: on dense comparison walls, use local product marks only where the source is stable, and keep deterministic fallback text everywhere else so visual recognition improves without making the page brittle

## Verification

- `node --check site/js/app.js`
- `python3 tools/check_site_md_parity.py`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-tool-logo-agents-wall.md first. The Task 9 logo-asset line is now live across `site/topic-ai-coding-tools.html`, `site/topic-ai-cli-agent.html`, and a representative subset of `site/topic-ai-agents.html`. Choose exactly one next bounded move from the remaining task pool. Prefer first deciding whether this logo wave is locally mature enough to mark deferred and switch to another higher-value recurring slice, unless one last small follow-up on the same line is clearly justified and easy to verify. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
