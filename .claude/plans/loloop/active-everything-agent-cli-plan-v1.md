# Everything Agent-CLI to Claude Code Plan v1

Status: active  
Scope: keep improving the umbrella repo `projects/everything-agent-cli-to-claude-code/`, keep its related `*-plugin-cc` family legible, and keep the site recommendation / documentation line in sync.

## Current focus

- [x] Land one bounded README-positioning pass: explain why the umbrella repo is recommendable now, make the umbrella-vs-plugin split explicit, and verify the wrappers locally
- [ ] Continue stabilizing the umbrella repo as a recommendable CLI Agent reference with the next bounded split / example / verification slice

## Main product areas

- [x] umbrella repo positioning and quick-start clarity
- [x] wrapper verification and example workflow tests
- [x] related plugin-family registry clarity
- [x] site-facing recommendation and teaching copy
- [ ] future plugin-repo split guidance

## Strong reference set

- [ ] `projects/everything-agent-cli-to-claude-code/`
- [ ] `site/topic-ai-cli-agent.html`
- [ ] `site/md/topic-ai-cli-agent.md`
- [ ] related plugin repos under `github.com/Harzva/*-plugin-cc`

## Expected outputs

- [x] README / README_CN upgrades that explain why the repo matters in the CLI Agent landscape
- [x] repeatable local tests for wrappers and example workflows
- [x] clearer registry view for umbrella repo vs plugin repos
- [x] site-level recommendation block in the CLI Agent topic
- [x] evolution notes tying repo improvements to the broader CLI Agent narrative

## Validation

- [x] local repo tests pass
- [x] site / md parity stays valid
- [ ] the project can be explained as both a usable repo and a research / architecture sample

## Notes

- Keep `prompt.md` short; detailed repo-improvement logic belongs here
- Prefer bounded passes: one repo improvement, one validation step, one site sync
- Treat the umbrella repo as the control tower, not the permanent home of every provider-specific detail
- 2026-04-12: first bounded Task 10 pass landed across `README.md`, `README_CN.md`, `registry/plugins.md`, and the site recommendation block on `topic-ai-cli-agent`; local verification passed with `bash tests/test_wrappers.sh` and `python3 tools/check_site_md_parity.py`
- Next strong bounded candidate: add one clearer runnable example or split-guidance artifact that helps explain when a capability should stay in the umbrella repo versus split into a `*-plugin-cc` repo
