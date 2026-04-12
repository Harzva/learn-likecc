# evolution-2026-04-12-everything-agent-cli-family-verification.md

## Plan

- path: `.claude/plans/loloop/active-everything-agent-cli-plan-v1.md`
- milestone: umbrella repo positioning and recommendation hardening
- bounded target: add one umbrella-level family verification entry and sync that proof back into the site recommendation

## Completed

- added `projects/everything-agent-cli-to-claude-code/tests/test_plugin_family.sh` so the umbrella repo can run the current sibling `*-plugin-cc` smoke tests in one pass
- updated `README.md` and `README_CN.md` to teach the shortest verification path as `umbrella smoke -> plugin family smoke -> workflow proof`
- updated `site/topic-everything-agent-cli.html`, `site/md/topic-everything-agent-cli.md`, `site/topic-ai-cli-agent.html`, and `site/md/topic-ai-cli-agent.md` so the site recommendation now points to the family verification entry instead of only the umbrella repo's own smoke test
- updated the active Task 10 plan and the site-detail active plan to record the fifth bounded pass and keep the next frontier explicit

## Failed or Deferred

- did not add a new provider-ready live demo beyond the existing workflow proof
- did not build a richer cross-repo dashboard; this pass stays script-first and verification-first
- did not reopen Task 11 or Task 15 because their current frontiers are locally healthier than this remaining Task 10 verification gap was

## Decisions

- treat family verification as the right next proof layer after repo-local smoke tests and before any heavier live-runtime demo
- keep the new verification entry inside the umbrella repo test surface instead of inventing a new top-level tooling lane
- prefer a sharper provider-ready demo or cross-repo matrix only if a future pass needs more than sequential smoke proof

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-everything-agent-cli-family-verification.md first. Task 10 now has a fifth bounded pass landed: the umbrella repo exposes `tests/test_plugin_family.sh` as a family-level verification entry, and the site recommendation teaches `umbrella smoke -> plugin family smoke -> workflow proof` instead of only repo-local proof. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 10 unless there is a clearly stronger provider-ready demo artifact or cross-repo verification surface than the other active plans; otherwise pick the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
