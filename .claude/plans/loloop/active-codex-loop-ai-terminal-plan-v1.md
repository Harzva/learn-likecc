# codex-loop AI Terminal Plan v1

Status: active  
Scope: local AI terminal for `codex-loop` with daemon control, protected thread interaction, shell workspace, and sustained UI polish.

## Current focus

- [x] Upgrade shell rendering from plain text PTY output toward a more terminal-like experience
- [x] Add a clearer event / timeline surface for daemon, thread lock, and shell actions
- [x] Add workspace presets so `Overview`, `Thread Desk`, `Shell Lab`, and `Debug` can be restored quickly

## Foundations

- [x] Build local relay for daemon status, logs, and last-message access
- [x] Build local page for AI Terminal with draggable / resizable panes
- [x] Add daemon start / stop controls
- [x] Add layout persistence with `localStorage`
- [x] Add thread readonly / writable lock support
- [x] Add local PTY shell session creation, write, read, and close
- [x] Add tabbed workspace scaffold

## Safety and control

- [x] Prevent silent conflict between daemon loop and manual thread write by default
- [x] Expose thread lock state in the UI
- [x] Add more explicit conflict-state messaging between daemon, thread, and shell operations
- [x] Add recovery guidance when a thread is readonly-locked or a shell session dies

## UX and polish

- [ ] Make the shell pane feel more like a real terminal instead of a plain log box
- [ ] Improve visual hierarchy so status, logs, thread, and shell are easier to scan
- [ ] Add better mobile / narrow-screen fallback for local debugging
- [ ] Refine pane defaults and spacing so the first-load layout feels intentional

## Observability

- [x] Add an event timeline pane
- [x] Add recent action history for daemon start/stop, thread lock/unlock, and shell create/close
- [ ] Add clearer success / error feedback for relay actions

## Validation

- [ ] Keep `python3 -m py_compile tools/codex_loop_web_relay.py` passing
- [ ] Keep `node --check site/js/codex-loop-console.js` passing
- [ ] Keep `python3 tools/check_site_md_parity.py` passing
- [ ] When doing live relay tests, leave no stale thread lock note or orphan shell session

## Notes

- Active thread target: `019d7762-4c82-7b63-9e1e-ebbca2962185`
- Daemon PID is runtime-dependent and should be read live from status, not hardcoded here
- Update this file after each bounded pass and use it as the canonical checklist for Task 7
