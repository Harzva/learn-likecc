# LikeCode Workspace App Plan v1

Status: active  
Scope: grow the current codex-loop monitor into a separate app-style LikeCode workspace that can read tasks, edit plans in the browser, and keep runtime/log context visible without living inside an article shell.

## Current focus

- [x] Seed a first independent app shell under `site/app-likecode-workspace.html`
- [x] Add relay-backed plan read/write for dedicated plan files and the guarded prompt contract
- [x] Connect the app shell to `site/data/loop-task-board.json` so the task pool is visible inside the workspace
- [x] Show runtime status and one switchable log lane (`daemon / latest tick / last message`) in the same app shell
- [x] Add checklist-aware plan interactions instead of raw markdown-only save
- [x] Add a lightweight evolution composer so the app can record bounded passes without leaving the page
- [x] Add a stronger active-task sync so the workspace can highlight the daemon-selected task rather than only the plan-declared task
- [x] Remove repo-local branding and data assumptions from the shell so it can follow relay-provided workspace metadata
- [x] Make relay-backed plan read/write operate on the selected workspace root instead of the current repo root, so the shell can work across projects and users

## Main product areas

- [ ] task pool navigation
- [ ] active plan editing
- [ ] runtime and thread observability
- [ ] log switching and recent context
- [ ] future multi-pane terminal workspace
- [ ] cross-project packaging and installer-ready distribution

## Expected outputs

- [x] one app-style local page:
  - `site/app-likecode-workspace.html`
- [x] one app-specific frontend script:
  - `site/js/likecode-workspace.js`
- [x] one guarded relay extension for plan read/write:
  - `tools/codex_loop_web_relay.py`
- [x] one workspace metadata + task-board relay path so the shell can follow the current workspace instead of hardcoded local URLs
- [x] one follow-up pass that replaces raw markdown editing with clearer checklist or field-level controls
- [x] one follow-up pass that introduces evolution write-back from the app itself
- [x] one follow-up pass that exports the shell into the standalone `codex-loop-skill` repo for reuse outside this project

## Validation

- [x] `python3 -m py_compile tools/codex_loop_web_relay.py`
- [x] `node --check site/js/likecode-workspace.js`
- [x] `python3 tools/check_site_md_parity.py`

## Notes

- Keep this line separate from the existing `topic-codex-loop-console` monitor page; the monitor can stay article-like while this page grows into an actual workspace shell.
- The first version should stay conservative: whitelist editable plan paths, prefer raw markdown save over risky rich editing, and avoid pretending to be a full collaborative IDE yet.
- 2026-04-12: first bounded Task 13 follow-up landed checklist-aware plan interactions inside the app shell; plan markdown now exposes a dedicated clickable checklist lane that writes back into the same editor text before save, without adding a second relay mutation API
- 2026-04-12: second bounded Task 13 follow-up landed a lightweight evolution composer inside the app shell; it seeds an `evolution-YYYY-MM-DD-*.md` path plus a minimal template and saves through the same guarded plan-write endpoint instead of requiring a separate backend route
- 2026-04-12: third bounded Task 13 follow-up landed a daemon-task sync strip; the app now infers the latest daemon-selected task from `last_message_preview`, highlights that task in the pool, and offers a one-click jump without overriding the operator's manual selection
- 2026-04-12: fourth bounded Task 13 follow-up removed the last hard `learn-likecc` assumptions from the shell surface; branding, links, Pages base, and task-board loading can now come from relay-visible workspace metadata plus `.codex-loop/workspace-shell.json`
- 2026-04-12: fifth bounded Task 13 follow-up exported the workspace-shell reuse path into `exports/codex-loop-skill` as documentation instead of forcing the full site bundle into the skill repo; the exported repo now points at a dedicated `references/workspace-shell.md` note describing minimum frontend surfaces, relay contract, and copy order
- 2026-04-12: sixth bounded Task 13 follow-up should surface the existing relay-provided workspace contract inside the app itself so `workspace root / site base / task-board path / config path / repo links` are visible on-page instead of remaining implicit in backend responses and docs
- 2026-04-12: sixth bounded Task 13 follow-up landed a `Workspace Contract` panel in the app shell; the page now exposes relay-provided workspace meta directly and teaches the cross-project packaging contract without leaving the app
- 2026-04-12: seventh bounded Task 13 follow-up should extend the new contract panel with explicit write-scope visibility so operators can see `allowed edit roots / allowed edit files` without reading relay code
- 2026-04-12: seventh bounded Task 13 follow-up landed write-scope visibility in the `Workspace Contract` panel; the app now shows `site root / allowed edit roots / allowed edit files` from relay meta so write boundaries are visible before any plan or evolution save
- 2026-04-14: eighth bounded Task 13 follow-up should expose the existing shell session API inside the workspace app itself so shell seats stop being relay-only capability and become part of the reusable workspace surface
- 2026-04-14: eighth bounded Task 13 follow-up landed a minimal `Shell Seats` roster in the app shell; the page can now list, create, select, and close relay-backed shell sessions without sending the operator back to the monitor page
- 2026-04-14: ninth bounded Task 13 follow-up should extend the new `Shell Seats` roster with a selected-seat output preview so shell read capability stops being hidden behind the relay API
- 2026-04-14: ninth bounded Task 13 follow-up landed a selected-seat output preview in the app shell; `Shell Seats` now shows recent output for the active shell instead of stopping at lifecycle visibility
