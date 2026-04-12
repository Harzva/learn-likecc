# evolution-2026-04-12-everything-agent-cli-readme-pass.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-everything-agent-cli-plan-v1.md`
- bounded target: land one first Task 10 pass that makes `everything-agent-cli-to-claude-code` easier to recommend from both the repo and the site

## Completed

- upgraded `projects/everything-agent-cli-to-claude-code/README.md` with a clearer trust / quick-start frame explaining why the umbrella repo is already recommendable
- upgraded `projects/everything-agent-cli-to-claude-code/README_CN.md` with the same control-plane, trust-signal, and quick-start positioning in Chinese
- added a concise split-reading section to `projects/everything-agent-cli-to-claude-code/registry/plugins.md` so the umbrella repo versus `*-plugin-cc` family roles are easier to parse
- synced the site recommendation line in `site/topic-ai-cli-agent.html` and `site/md/topic-ai-cli-agent.md` so the CLI Agent topic now mentions the repo's local smoke test and explicit umbrella-vs-plugin split
- verified the umbrella repo with `bash tests/test_wrappers.sh`
- verified site/html parity with `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- `git diff --check` reported a pre-existing unrelated trailing-whitespace issue in `awesome-skills.md:32`; this pass did not modify that file
- no new provider-specific plugin split or runnable tutorial example was added in this round

## Decisions

- switch from Task 8 to Task 10 because the broader reference-mining wave had already recooled, while the umbrella repo plan still had a clearly active unchecked focus
- keep this pass bounded to positioning + verification + one site sync instead of expanding into plugin-repo surgery
- treat the next Task 10 step as optional, not mandatory; only continue if another split / example / verification slice is clearly stronger than the other recurring frontiers

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-everything-agent-cli-readme-pass.md first. Task 10 now has one completed bounded README-positioning pass across the umbrella repo and the CLI Agent site recommendation. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 10 only if there is another clear, low-risk, locally verifiable split / example / verification improvement with a sharper active frontier than the other plans; otherwise switch to the next higher-value recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
