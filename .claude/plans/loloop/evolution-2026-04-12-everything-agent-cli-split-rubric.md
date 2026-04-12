# evolution-2026-04-12-everything-agent-cli-split-rubric.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-everything-agent-cli-plan-v1.md`
- bounded target: convert the umbrella-vs-plugin split from a README statement into a reusable routing rubric, then sync that guidance back into the CLI Agent topic

## Completed

- upgraded `projects/everything-agent-cli-to-claude-code/docs/repo-strategy.md` from a short repo split note into a concrete routing guide with:
  - a four-question checklist
  - a quick decision table
  - explicit split triggers
  - explicit keep-in-umbrella conditions
- updated `projects/everything-agent-cli-to-claude-code/README.md` and `README_CN.md` so `docs/repo-strategy.md` is now part of the recommended reading order
- synced the same guidance back into `site/topic-ai-cli-agent.html` and `site/md/topic-ai-cli-agent.md` so the site recommendation now points readers to the routing document when they are unsure whether a capability belongs in the umbrella repo or a `*-plugin-cc` repo
- re-ran `bash tests/test_wrappers.sh`
- re-ran `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- no new runnable workflow example was added in this round
- no provider-specific repo was modified; this pass stayed on umbrella positioning and teaching clarity

## Decisions

- continue Task 10 for one more pass because the plan still had a sharper active frontier than the other recurring slices
- use the existing `docs/repo-strategy.md` file instead of creating a parallel split-guide doc, to avoid duplicated repo-strategy explanations
- keep this round bounded to one decision artifact plus one site sync, instead of expanding into provider-repo surgery

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-everything-agent-cli-split-rubric.md first. Task 10 now has two completed bounded passes: one README-positioning pass and one reusable split-rubric pass. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 10 only if there is one more clear, low-risk, locally verifiable runnable-example or workflow-proof improvement that better demonstrates the umbrella repo as a usable sample, not just a strategy-doc set; otherwise switch to the next higher-value recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
