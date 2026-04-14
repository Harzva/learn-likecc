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
- 2026-04-14: tenth bounded Task 13 follow-up should expose one-line shell write inside the app so `/api/shell/write` stops being relay-only capability and the shell surface becomes minimally operable
- 2026-04-14: tenth bounded Task 13 follow-up landed a one-line shell command sender in the app shell; `Shell Seats` can now send a single command to the active seat and refresh the returned output without pretending to be a full terminal
- 2026-04-14: eleventh bounded Task 13 follow-up should add safe shell presets so the new shell write surface can trigger the most common probes without manual typing
- 2026-04-14: eleventh bounded Task 13 follow-up landed a compact `Shell Presets` row plus shared shell-send feedback; the app now exposes `pwd / ls / git status / python -V` as one-click probes and reports `no active shell / empty command / sent <command>` in the existing status lane
- 2026-04-14: twelfth bounded Task 13 follow-up should add a tiny recent-command memory or replay affordance so the one-line shell lane keeps just enough operator context after each preset or manual send
- 2026-04-14: twelfth bounded Task 13 follow-up landed a local `Recent Commands` replay strip; the shell lane now keeps the latest successful probes in browser storage and lets the operator re-run them without retyping after refresh
- 2026-04-14: thirteenth bounded Task 13 follow-up should add a tiny shell-lane context cue that shows which command most recently produced the current output so replay and output stay visually paired
- 2026-04-14: thirteenth bounded Task 13 follow-up landed a seat-scoped `output from` cue; the shell output area now labels the latest local command associated with the visible seat output instead of leaving replay context implicit
- 2026-04-14: fourteenth bounded Task 13 follow-up should add one tiny shell-lane timestamp cue so recent replay, last command, and visible output share the same minimal chronology
- 2026-04-14: fourteenth bounded Task 13 follow-up landed an `updated` timestamp cue beside `output from`; the shell output context now shows both the latest local command and the local send time for the visible seat
- 2026-04-14: fifteenth bounded Task 13 follow-up should add one tiny seat-sensitive empty state so switching to a shell with no local command history explains that the output context is unknown rather than merely blank
- 2026-04-14: fifteenth bounded Task 13 follow-up landed a seat-sensitive unknown-state cue; shell output context now explicitly says `unknown on this seat / no local send yet` when the visible output has no local command provenance
- 2026-04-14: sixteenth bounded Task 13 follow-up should add one tiny clear-history affordance so local replay memory can be intentionally reset without clearing all browser storage
- 2026-04-14: sixteenth bounded Task 13 follow-up landed a `清空本地记忆` affordance; recent replay history plus local output provenance can now be reset from the shell panel without touching broader browser storage
- 2026-04-14: seventeenth bounded Task 13 follow-up should add one tiny shell-memory scope note so the UI teaches that replay and provenance are browser-local rather than relay-backed session history
- 2026-04-14: seventeenth bounded Task 13 follow-up landed a shell-memory scope note in the panel itself; the UI now explicitly teaches that replay and provenance are browser-local memory rather than relay-backed session history
- 2026-04-14: eighteenth bounded Task 13 follow-up should add one tiny current-seat reset affordance or hint so operators can distinguish global local-memory reset from seat-specific provenance gaps
- 2026-04-14: eighteenth bounded Task 13 follow-up landed a current-seat reset hint; the clear action now explicitly says it is `清空全部本地记忆` and that seat-scoped reset is not yet supported
- 2026-04-14: nineteenth bounded Task 13 follow-up should add one tiny seat-scoped provenance explanation near the `unknown on this seat` cue so operators can connect that empty state back to the current global-only reset model
- 2026-04-14: nineteenth bounded Task 13 follow-up landed a dynamic provenance hint under shell output; the `unknown on this seat` state now explains that output may predate current browser memory or follow a global local-memory clear
- 2026-04-14: twentieth bounded Task 13 follow-up should add one tiny success-state hint cleanup so the known-provenance path reads less defensively and more like a normal operator cue
- 2026-04-14: twentieth bounded Task 13 follow-up landed a shorter success-state provenance hint; the known-provenance path now reads like a simple operator cue instead of repeating storage-scope implementation detail
- 2026-04-14: twenty-first bounded Task 13 follow-up should add one tiny visual distinction between global shell-memory notes and seat-scoped output hints so the two explanatory layers do not blur together
- 2026-04-14: twenty-first bounded Task 13 follow-up landed split scope badges for shell provenance; `browser-local memory` now stays as the panel-level note while `seat-local hint / gap / cue` marks the current seat's output-provenance layer directly beside the hint text
- 2026-04-14: twenty-second bounded Task 13 follow-up should add one tiny current-seat cue inside `Recent Commands` so replay history stops reading like a fully global strip when the operator is switching between shell seats
- 2026-04-14: twenty-second bounded Task 13 follow-up landed a current-seat cue inside `Recent Commands`; the replay strip now surfaces `current seat: <id>` plus whether that seat already has a last local match, so switching seats no longer leaves the row looking fully global
- 2026-04-14: twenty-third bounded Task 13 follow-up should add one tiny recent-button highlight for the current seat's last local command so the replay strip can visually echo the output-provenance cue instead of only naming the seat in a badge
- 2026-04-14: twenty-third bounded Task 13 follow-up landed a current-seat replay highlight; the latest local command for the active seat now renders as the primary button in `Recent Commands`, so the replay strip visually echoes `output from` instead of only describing context in text
- 2026-04-14: twenty-fourth bounded Task 13 follow-up should add one tiny non-active recent-button demotion or stale cue so replay items tied to other seats read more clearly as reusable global memory rather than current-seat context
- 2026-04-14: twenty-fourth bounded Task 13 follow-up landed a shared-replay cue for non-active buttons; `Recent Commands` now labels non-current entries as `shared · ...`, so reusable browser memory stops masquerading as current-seat context
- 2026-04-14: twenty-fifth bounded Task 13 follow-up should add one tiny no-seat replay wording cleanup so the strip explains shared replay more cleanly when there is no active shell at all
- 2026-04-14: twenty-fifth bounded Task 13 follow-up landed a no-seat shared-replay wording cleanup; the replay strip now keeps `shared replay only` and `shared · ...` wording even before any shell seat is selected, instead of falling back to bare commands
- 2026-04-14: twenty-sixth bounded Task 13 follow-up should add one tiny browser-local replay hint on hover or inline microcopy so `shared` buttons read clearly as local memory rather than relay-backed shell history
- 2026-04-14: twenty-sixth bounded Task 13 follow-up landed browser-local hover hints for shared replay buttons; `Recent Commands` now exposes `title` / `aria-label` copy that explicitly says shared replay is browser-local memory, not relay-backed shell history
- 2026-04-14: twenty-seventh bounded Task 13 follow-up should add one tiny mixed-row wording cleanup so the row explains more cleanly when it contains both one current-seat replay button and several shared replay buttons
- 2026-04-14: twenty-seventh bounded Task 13 follow-up landed a mixed-row wording cleanup; the `Recent Commands` badge now appends `+ shared replay below` whenever one current-seat replay button appears beside additional shared replay buttons
- 2026-04-14: twenty-eighth bounded Task 13 follow-up should add one tiny no-match row cleanup so the badge reads more naturally when a seat is selected but all replay buttons are shared history rather than current-seat context
- 2026-04-14: twenty-eighth bounded Task 13 follow-up landed a no-match row cleanup; when a seat is selected but has no current local replay match, the badge now reads `no local match · shared replay below` if the row is entirely shared history
- 2026-04-14: twenty-ninth bounded Task 13 follow-up should add one tiny empty-row wording cleanup so the replay strip reads more naturally when a seat is selected, has no local match, and there are still no recent commands at all
- 2026-04-14: twenty-ninth bounded Task 13 follow-up landed an empty-row wording cleanup; when a seat is selected but has no local replay and no recent commands yet, the placeholder now says that the current seat has no local replay instead of falling back to a fully generic strip-level hint
- 2026-04-14: thirtieth bounded Task 13 follow-up should add one tiny no-seat empty-row wording cleanup so the replay strip reads more intentionally before any shell seat has been selected and there is still no recent local history at all
- 2026-04-14: thirtieth bounded Task 13 follow-up landed a no-seat empty-row wording cleanup; when no shell seat is selected and there is still no replay history, the badge now says `no seat selected` and the placeholder explicitly says there is no shared replay yet
- 2026-04-14: thirty-first bounded Task 13 follow-up should add one tiny no-seat empty-row tone cleanup so the replay strip can distinguish setup state from the broader neutral shared-history state without changing the actual button cases
- 2026-04-14: thirty-first bounded Task 13 follow-up landed a no-seat empty-row tone cleanup; the empty no-seat row now uses an attention badge so setup state no longer shares the same neutral tone as the broader no-seat shared-history path
- 2026-04-14: thirty-second bounded Task 13 follow-up should add one tiny post-clear status wording cleanup so clearing local replay memory points operators back to the setup-state replay row instead of only saying `local memory cleared`
- 2026-04-14: thirty-second bounded Task 13 follow-up landed a post-clear status wording cleanup; clearing local replay memory now says `replay row reset to setup state` so the operator gets a direct pointer back to the reset strip
- 2026-04-14: thirty-third bounded Task 13 follow-up should add one tiny post-clear status tone cleanup so the intentional reset path reads less like a warning while staying distinct from normal send success
- 2026-04-14: thirty-third bounded Task 13 follow-up landed a post-clear status tone cleanup; clearing local replay memory now reports through the neutral shell-status tone instead of reusing the same warning-style attention state as gaps or setup prompts
- 2026-04-14: thirty-fourth bounded Task 13 follow-up should add one tiny post-clear status scope cleanup so the reset message aligns with the panel's `browser-local memory` wording instead of the shorter `local memory` phrasing
- 2026-04-14: thirty-fourth bounded Task 13 follow-up landed a post-clear status scope cleanup; the shell status now says `browser-local memory cleared` so the reset message uses the same scope wording as the panel note
- 2026-04-14: thirty-fifth bounded Task 13 follow-up should add one tiny clear-action wording cleanup so the `清空本地记忆` control and its resulting status line point at the same `browser-local memory` concept instead of mixing two nearby phrasings
- 2026-04-14: thirty-fifth bounded Task 13 follow-up landed a clear-action wording cleanup; the button now says `清空全部浏览器本地记忆` so action, panel note, and status line all point at the same browser-local scope
- 2026-04-14: thirty-sixth bounded Task 13 follow-up should add one tiny clear-action helper cleanup so the adjacent copy explains more directly that this reset affects replay/provenance memory only, not the relay-backed shell session itself
- 2026-04-14: thirty-sixth bounded Task 13 follow-up landed a clear-action helper cleanup; the helper text now says the action clears browser-local replay/provenance memory and does not reset the relay-backed shell seat
- 2026-04-14: thirty-seventh bounded Task 13 follow-up should add one tiny clear-action helper phrasing cleanup so the Chinese helper and English `replay / provenance` terms read a bit more native without losing the precise scope boundary
- 2026-04-14: thirty-seventh bounded Task 13 follow-up landed a clear-action helper phrasing cleanup; the helper now says `回放 / 来源记忆` instead of mixing Chinese framing with English `replay / provenance`
- 2026-04-14: thirty-eighth bounded Task 13 follow-up should add one tiny clear-action helper wording cleanup so `relay-backed shell seat` reads a bit more native in the same helper without losing the implementation boundary it names
- 2026-04-14: thirty-eighth bounded Task 13 follow-up landed a clear-action helper wording cleanup; the helper now says `relay 端 shell seat` instead of the stiffer `relay-backed shell seat`
- 2026-04-14: thirty-ninth bounded Task 13 follow-up should add one tiny clear-action helper rhythm cleanup so the helper reads less like two noun chunks glued by slashes while keeping both replay/provenance and relay-seat boundaries visible
- 2026-04-14: thirty-ninth bounded Task 13 follow-up landed a clear-action helper rhythm cleanup; the helper now says `回放与来源记忆` instead of the slash-joined `回放 / 来源记忆`
- 2026-04-14: fortieth bounded Task 13 follow-up should add one tiny clear-action helper wording cleanup so `shell seat` also reads a bit more native in the same sentence without dropping the seat-level boundary it names
- 2026-04-14: fortieth bounded Task 13 follow-up landed a clear-action helper wording cleanup; the helper now says `relay 端的 shell seat` so the seat-side boundary reads less like two hard-glued noun chunks
- 2026-04-14: forty-first bounded Task 13 follow-up should add one tiny clear-action helper localization cleanup so the remaining `shell seat` term reads a bit more native while keeping the seat-level object explicit
- 2026-04-14: forty-first bounded Task 13 follow-up landed a clear-action helper localization cleanup; the helper now says `relay 端的 shell seat 本身` so the seat-side warning reads more like normal operational copy while keeping the seat object explicit
- 2026-04-14: forty-second bounded Task 13 follow-up should add one tiny clear-action helper terminology cleanup so `shell seat` itself can be localized or annotated more cleanly without losing the exact seat-level boundary
- 2026-04-14: forty-second bounded Task 13 follow-up was intentionally deferred because deeper `shell seat` renaming had lower value than making the clear action self-describing on hover and assistive readout
- 2026-04-14: forty-second bounded Task 13 follow-up landed clear-action scope hints on the button itself; the clear button now exposes `title` / `aria-label` copy that repeats the browser-local-only reset boundary even without the adjacent helper
- 2026-04-14: forty-third bounded Task 13 follow-up should add one tiny clear-action/helper dedupe cleanup so the visible helper and the button hint share one tighter sentence instead of repeating the full scope copy twice
- 2026-04-14: forty-third bounded Task 13 follow-up landed a clear-action/helper dedupe cleanup; the button now uses a short hover title plus `aria-describedby`, and the visible helper carries the shared boundary sentence that keeps the relay-side seat unchanged
- 2026-04-14: forty-fourth bounded Task 13 follow-up should add one tiny clear-action terminology cleanup so the remaining `shell seat` phrase in the shared helper can be localized or annotated more naturally without losing the seat-level boundary
- 2026-04-14: forty-fourth bounded Task 13 follow-up landed a clear-action terminology cleanup; the shared helper now says `shell 会话位` so the sentence stays seat-scoped but reads more like normal Chinese operator copy
- 2026-04-14: forty-fifth bounded Task 13 follow-up should add one tiny clear-action consistency cleanup so the older markdown notes about `shell seat` do not lag behind the now-shared `shell 会话位` helper wording
- 2026-04-14: forty-fifth bounded Task 13 follow-up landed a clear-action consistency cleanup; the nearby markdown note trail now also says `shell 会话位`, so the current helper wording and recent operator-facing documentation no longer diverge
- 2026-04-14: forty-sixth bounded Task 13 follow-up should mark the current clear-action wording microthread locally done and pivot back to one higher-value workspace-app usability gap instead of continuing low-value terminology churn
- 2026-04-14: forty-sixth bounded Task 13 follow-up landed the microthread close-out by pivoting back to shell-lane usability; the command input now submits on `Enter` and ignores IME composition, so sending a quick probe no longer requires a mouse click
- 2026-04-14: forty-seventh bounded Task 13 follow-up should add one tiny shell-lane convenience pass so the input itself exposes the `Enter 发送` affordance instead of leaving it implicit in behavior only
- 2026-04-14: forty-seventh bounded Task 13 follow-up landed a shell-lane convenience pass; the command input placeholder now explicitly teaches `按 Enter 发送`, so the new shortcut is visible before first use
- 2026-04-14: forty-eighth bounded Task 13 follow-up should add one tiny shell-lane convenience pass so preset probes and manual send share one glanceable teaching cue instead of leaving shortcut knowledge inside the placeholder only
- 2026-04-14: forty-eighth bounded Task 13 follow-up landed a shared shell-lane teaching cue; manual send and preset probes now sit under one visible hint row, so the `Enter 发送` shortcut and the quick-probe route are taught together
- 2026-04-14: forty-ninth bounded Task 13 follow-up should add one tiny shell-lane convenience pass so the send button itself also hints at the `Enter` shortcut instead of leaving that cue in the field and helper row only
- 2026-04-14: forty-ninth bounded Task 13 follow-up landed a send-button shortcut cue; the primary action now reads `发送命令 · Enter`, so the shortcut is visible at the action surface itself
- 2026-04-14: fiftieth bounded Task 13 follow-up should add one tiny shell-lane convenience pass so the preset row also declares its role as quick probes instead of leaving that meaning inside the helper sentence only
- 2026-04-14: fiftieth bounded Task 13 follow-up landed a preset-row role cue; the probe row now carries a visible `常用探针` label, so the preset buttons no longer depend on the helper sentence alone for meaning
- 2026-04-14: fifty-first bounded Task 13 follow-up should add one tiny shell-lane convenience pass so the browser-local memory row also references the nearby probe/send cluster more directly instead of reading like an isolated reset strip
- 2026-04-14: fifty-first bounded Task 13 follow-up landed a browser-local memory context cue; the memory row now explicitly says its entries come from the nearby manual send and quick-probe actions instead of reading like an isolated reset note
- 2026-04-14: fifty-second bounded Task 13 follow-up should add one tiny shell-lane convenience pass so the `Recent Commands` empty state also mentions the nearby `Enter / 常用探针` routes instead of teaching replay in isolation
- 2026-04-14: forty-sixth bounded Task 13 follow-up landed the microthread close-out by pivoting back to shell-lane usability; the command input now submits on `Enter` and ignores IME composition, so sending a quick probe no longer requires a mouse click
- 2026-04-14: forty-seventh bounded Task 13 follow-up should add one tiny shell-lane convenience pass so the input itself exposes the `Enter 发送` affordance instead of leaving it implicit in behavior only
