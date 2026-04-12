# evolution-2026-04-12-everything-agent-cli-provider-demo.md

## Plan

- path: `.claude/plans/loloop/active-everything-agent-cli-plan-v1.md`
- milestone: make the umbrella repo easier to recommend as a runnable CLI Agent reference
- bounded target: replace the empty `examples/` placeholder with one provider-ready demo matrix and sync that new entry surface back into the site recommendation

## Completed

- reviewed `projects/everything-agent-cli-to-claude-code/examples/README.md` and confirmed it was still an empty placeholder with no first-run guidance
- turned `examples/README.md` into a provider-ready demo matrix that maps wrapper entry, lowest-risk proof, stronger demo path, and reading order for `Codex / Gemini / Grok / Qwen`
- updated `projects/everything-agent-cli-to-claude-code/README.md` and `README_CN.md` so the shortest reading order and fastest runnable proof now explicitly include the new examples matrix
- synced the new demo surface back into `site/topic-everything-agent-cli.html` and `site/md/topic-everything-agent-cli.md` so the umbrella repo is now taught as having tests, family verification, and a provider-ready demo entry
- marked the bounded provider-demo pass as completed in the Task 10 plan

## Failed or Deferred

- did not add a new executable provider workflow script because this pass stayed bounded to the missing demo-surface documentation layer rather than inventing another script without stronger need
- did not change `site/topic-ai-cli-agent.html` in this pass because the tighter site sync already landed through the dedicated everything-agent-cli topic page and Markdown mirror

## Decisions

- treat `examples/README.md` as the right middle layer between smoke tests and deeper workflow docs
- only continue Task 10 if the next slice produces a genuinely stronger cross-repo verification or runnable provider artifact than the other active plans

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-everything-agent-cli-provider-demo.md first. The umbrella repo `everything-agent-cli-to-claude-code` now exposes a provider-ready demo matrix in `examples/README.md`, and the site recommendation has been synced to teach that new entry surface. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 10 unless there is a clearly stronger cross-repo verification or runnable provider-demo slice than the other active plans; otherwise pick the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
