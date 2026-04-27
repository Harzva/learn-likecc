# evolution-2026-04-12-likecode-workspace-app-seed.md

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- bounded target: land a first app-style LikeCode workspace shell that can see the task pool, edit a dedicated plan, and keep runtime/log context visible in the same local page

## What changed

- added a new app-style local page at `site/app-likecode-workspace.html`
- added `site/js/likecode-workspace.js` to connect the app shell to the loop task board JSON plus the local relay
- extended `tools/codex_loop_web_relay.py` with guarded `GET /api/plan/read` and `POST /api/plan/write` endpoints for repo-local plan editing
- created the dedicated long-loop plan `active-likecode-workspace-app-plan-v1.md`

## Why this pass matters

- the existing `topic-codex-loop-console` page had already become a strong dynamic monitor, but it was still framed like a teaching page
- this pass opens the next layer: a real local workspace shell where task selection, plan editing, and runtime awareness can coexist
- the guardrail is still explicit: editable paths are whitelisted instead of allowing arbitrary file writes from the browser

## Validation

- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`

## Next handoff

Use codex-loop to continue the active plan at `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`. Read this evolution note first, then keep the new workspace-app line bounded. The best next move is probably one of: checklist-aware plan editing, an evolution write-back surface, or stronger daemon-selected active-task highlighting. Keep the app shell separate from the existing monitor page, validate locally, and only widen the write surface if the guardrails stay clear.
