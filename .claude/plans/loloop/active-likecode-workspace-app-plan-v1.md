# LikeCode Workspace App Plan v1

Status: active  
Scope: grow the current codex-loop monitor into a separate app-style LikeCode workspace that can read tasks, edit plans in the browser, and keep runtime/log context visible without living inside an article shell.

## Current focus

- [x] Seed a first independent app shell under `site/app-likecode-workspace.html`
- [x] Add relay-backed plan read/write for dedicated plan files and the guarded prompt contract
- [x] Connect the app shell to `site/data/loop-task-board.json` so the task pool is visible inside the workspace
- [x] Show runtime status and one switchable log lane (`daemon / latest tick / last message`) in the same app shell
- [x] Add checklist-aware plan interactions instead of raw markdown-only save
- [ ] Add a lightweight evolution composer so the app can record bounded passes without leaving the page
- [ ] Add a stronger active-task sync so the workspace can highlight the daemon-selected task rather than only the plan-declared task

## Main product areas

- [ ] task pool navigation
- [ ] active plan editing
- [ ] runtime and thread observability
- [ ] log switching and recent context
- [ ] future multi-pane terminal workspace

## Expected outputs

- [x] one app-style local page:
  - `site/app-likecode-workspace.html`
- [x] one app-specific frontend script:
  - `site/js/likecode-workspace.js`
- [x] one guarded relay extension for plan read/write:
  - `tools/codex_loop_web_relay.py`
- [x] one follow-up pass that replaces raw markdown editing with clearer checklist or field-level controls
- [ ] one follow-up pass that introduces evolution write-back from the app itself

## Validation

- [ ] `python3 -m py_compile tools/codex_loop_web_relay.py`
- [ ] `node --check site/js/likecode-workspace.js`
- [ ] `python3 tools/check_site_md_parity.py`

## Notes

- Keep this line separate from the existing `topic-codex-loop-console` monitor page; the monitor can stay article-like while this page grows into an actual workspace shell.
- The first version should stay conservative: whitelist editable plan paths, prefer raw markdown save over risky rich editing, and avoid pretending to be a full collaborative IDE yet.
- 2026-04-12: first bounded Task 13 follow-up landed checklist-aware plan interactions inside the app shell; plan markdown now exposes a dedicated clickable checklist lane that writes back into the same editor text before save, without adding a second relay mutation API
