# evolution-2026-04-12-tool-logo-v1.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- bounded target: defer the now-low-yield site-shell micro-fix line and land the first complete Task 9 tool-logo asset slice on one high-value tool wall

## Completed

- intentionally deferred the current site-shell micro-wave after the recent mobile overlay / focus / breakpoint passes because another tiny shell-only fix would have been lower-value than the already-active Task 9 logo-asset line
- created a stable repo-local asset folder at `site/images/tool-logos/`
- added local image assets for `Claude Code`, `Cursor`, `OpenCode`, and `GitHub Copilot` from their official favicon sources
- added a generic image-first logo treatment to `.toolspot-card__logo` in `site/css/style.css`
- added `initToolspotLogos()` in `site/js/app.js` so loaded local images suppress the letter fallback and broken / missing assets automatically fall back to the existing initials
- converted the four highest-value coding-tool cards on `site/topic-ai-coding-tools.html` from letter-only badges to image-first logo badges with graceful fallback

## Failed or Deferred

- did not force an OpenAI / Codex logo into this pass because OpenAI blocks straightforward static asset fetches from this environment; the existing letter fallback remains in place for `Codex`
- did not roll the new asset system across a second wall in the same pass; that is the best next bounded follow-up if the first version checks out locally

## Reference-backed decision

- `reference/reference_cc_ui/claudecodeui/README.md` uses a product logo in the primary header and keeps text nearby for semantic clarity instead of making the mark stand alone
- `reference/reference_cc_ui/hermes-webui/CHANGELOG.md` documents a move toward bundled self-hosted SVG icons rather than remote icon dependencies
- applied pattern: keep product recognition image-first, keep text semantics in the card body, and host the visual assets locally so the tool wall does not depend on third-party icon URLs at render time

## Verification

- `node --check site/js/app.js`
- `python3 tools/check_site_md_parity.py`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-tool-logo-v1.md first. The site-shell micro-fix wave is now intentionally deferred because its recent passes are locally stable, and the first complete Task 9 image-first logo system has landed on `site/topic-ai-coding-tools.html`. Choose exactly one next bounded move from the remaining task pool. Prefer staying on the new Task 9 logo-asset line long enough to prove reuse: extend the same local-asset + image-first / letter-fallback system to one more high-value tool wall or closely related page, then update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
