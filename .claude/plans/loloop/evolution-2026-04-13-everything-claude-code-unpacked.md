# Evolution Note · Everything Claude Code Unpacked

Date: 2026-04-13  
Task: `Task 8` · reference mining

## What changed

- Cloned `affaan-m/everything-claude-code` into `reference/reference_sourcemap/everything-claude-code/`
- Classified it as a source-map-adjacent control-plane sample rather than a plain tutorial repo
- Opened a dedicated unpacked page at `site/topic-everything-claude-code-unpacked.html`
- Added the new page back into `topic-sourcemap.html`

## Why this matters

- The repo shows how a community-built Claude-Code-centric system grows into a cross-harness shell with agents, skills, commands, rules, plugins, and an early control-plane layer.
- This gives us a strong comparison point for `codex-loop`, workspace shell, and umbrella plugin lines.

## Next handoff

- Continue with one bounded follow-up pass:
  - inspect the cross-harness packaging surfaces (`.claude-plugin`, `.codex-plugin`, `.opencode`, `.trae`, `.gemini`)
  - or inspect the `ECC 2.0 alpha` control-plane direction
  - then reflect one clearer lesson back into a site-facing topic
