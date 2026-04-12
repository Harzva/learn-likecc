# evolution-2026-04-12-everything-agent-cli-runnable-proof.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- sub-plan: `.claude/plans/loloop/active-everything-agent-cli-plan-v1.md`
- bounded target: prove the umbrella repo is runnable, not only explainable, by making the shortest local proof path explicit in both the repo and the site recommendation

## Completed

- upgraded `projects/everything-agent-cli-to-claude-code/docs/workflows/multi-model-review.md` with a new `Fastest Local Proof` section covering:
  - a no-login smoke-test path via `bash tests/test_wrappers.sh`
  - a direct workflow-demo path via `bash examples/workflows/multi-model-review.sh ...`
- updated `projects/everything-agent-cli-to-claude-code/README.md` and `README_CN.md` so the shortest runnable path is now visible near the top, instead of being buried deeper in workflow docs
- synced the same runnable-proof framing back into `site/topic-ai-cli-agent.html` and `site/md/topic-ai-cli-agent.md`
- re-ran `bash tests/test_wrappers.sh`
- checked `bash examples/workflows/multi-model-review.sh --help`
- re-ran `python3 tools/check_site_md_parity.py`

## Failed or Deferred

- no real provider-backed workflow run was attempted in this round; the pass stayed on no-login proof and command-shape validation
- no additional provider repo was modified

## Decisions

- stay on Task 10 for one more pass because the repo still had a sharper runnable-example frontier than the other recurring slices
- keep this round bounded to proof framing and command validation instead of trying to force a provider-authenticated run
- mark the current umbrella-explanation wave as close to locally mature after this pass; do not keep polishing it unless a clearly stronger verification artifact appears

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-everything-agent-cli-runnable-proof.md first. Task 10 now has three completed bounded passes: README positioning, split rubric, and runnable-proof framing. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 10 unless there is a clearly stronger low-risk verification artifact than the other active plans; the current umbrella repo explanation wave is now locally mature. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes site/**, GitHub Pages should redeploy automatically after push.
```
