# evolution-2026-04-12-tool-logo-cli-wall.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- bounded target: stay on the active Task 9 logo-asset line long enough to prove reuse by extending the new image-first / letter-fallback system from the coding-tools wall to the CLI-agent wall

## Completed

- reused the repo-local `site/images/tool-logos/` asset path instead of inventing a second icon location
- added one new local asset for `Gemini CLI`
- extended image-first logo rendering on `site/topic-ai-cli-agent.html` for five representative cards: `Claude Code`, `Gemini CLI`, `OpenCode`, `Cursor`, and `GitHub Copilot`
- kept the existing fallback initials in place for tools whose official marks are still missing or fetch-blocked, so the wall remains stable even when a logo cannot be bundled locally yet

## Failed or Deferred

- did not force a local `Codex` mark into this pass because OpenAI icon fetches are still challenge-gated from this environment
- did not expand the asset system to `site/topic-ai-agents.html` in the same round; that remains the strongest next reuse candidate if the logo line stays active

## Reference-backed decision

- `reference/reference_cc_ui/claudecodeui/README.md` keeps the product mark close to the product name rather than relying on text-only recognition
- `reference/reference_cc_ui/hermes-webui/CHANGELOG.md` explicitly documents bundled self-hosted icon work instead of runtime dependency on remote icon sources
- applied pattern: keep wall scanning image-first for familiar products, but preserve deterministic local fallback so the page never depends on third-party icon availability at render time

## Verification

- `node --check site/js/app.js`
- `python3 tools/check_site_md_parity.py`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-tool-logo-cli-wall.md first. The Task 9 logo-asset line is now proven across both `site/topic-ai-coding-tools.html` and `site/topic-ai-cli-agent.html`. Choose exactly one next bounded move from the remaining task pool. Prefer staying on this same line for one more reuse pass if you can do it with stable local assets and clear fallback behavior, with `site/topic-ai-agents.html` as the strongest default candidate; otherwise choose another high-value, low-risk, locally verifiable recurring-task slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
