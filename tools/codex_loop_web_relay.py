#!/usr/bin/env python3
"""Local relay for a minimal codex-loop web console.

Usage:
  python3 tools/codex_loop_web_relay.py --workspace /path/to/repo

Then open the site locally, for example:
  cd site && python3 -m http.server 8080
  http://127.0.0.1:8080/topic-codex-loop-console.html
"""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import pty
import select
import signal
import subprocess
import tempfile
import termios
import threading
import time
import struct
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from socketserver import ThreadingMixIn
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
STATUS_SCRIPT = Path.home() / ".codex/skills/codex-loop/scripts/status_codex_loop.sh"
START_SCRIPT = Path.home() / ".codex/skills/codex-loop/scripts/start_codex_loop.sh"
STOP_SCRIPT = Path.home() / ".codex/skills/codex-loop/scripts/stop_codex_loop.sh"
THREAD_LOCK_FILE = ".codex-loop/state/thread_lock.json"
WORKSPACE_SHELL_FILE = ".codex-loop/workspace-shell.json"
CONNECTOR_SHELL_FILE = ".codex-loop/connector-shell.json"
ALLOWED_EDIT_ROOTS_REL = (
    ".claude/plans/loloop",
    ".claude/plans",
)
ALLOWED_EDIT_FILES_REL = (
    ".codex-loop/prompt.md",
)


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class ShellSession:
    def __init__(self, session_id: str, cwd: Path, shell: str) -> None:
        self.session_id = session_id
        self.cwd = cwd
        self.shell = shell
        master_fd, slave_fd = pty.openpty()
        self.master_fd = master_fd
        self.slave_fd = slave_fd
        self.buffer = ""
        self.lock = threading.Lock()
        env = os.environ.copy()
        env.setdefault("TERM", "xterm-256color")
        self.process = subprocess.Popen(
            [shell, "-l"],
            cwd=str(cwd),
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            env=env,
            start_new_session=True,
            close_fds=True,
        )
        flags = fcntl.fcntl(master_fd, fcntl.F_GETFL)
        fcntl.fcntl(master_fd, fcntl.F_SETFL, flags | os.O_NONBLOCK)
        self._append_output()

    def _append_output(self) -> None:
        chunks: list[str] = []
        while True:
            try:
                ready, _, _ = select.select([self.master_fd], [], [], 0)
            except (OSError, ValueError):
                break
            if not ready:
                break
            try:
                data = os.read(self.master_fd, 4096)
            except BlockingIOError:
                break
            except OSError:
                break
            if not data:
                break
            chunks.append(data.decode("utf-8", errors="replace"))
        if chunks:
            with self.lock:
                self.buffer = (self.buffer + "".join(chunks))[-120000:]

    def read(self) -> dict:
        self._append_output()
        with self.lock:
            return {
                "session_id": self.session_id,
                "alive": self.process.poll() is None,
                "pid": self.process.pid,
                "cwd": str(self.cwd),
                "buffer": self.buffer[-20000:],
                "returncode": self.process.poll(),
            }

    def write(self, text: str) -> None:
        self._append_output()
        if self.process.poll() is not None:
            raise RuntimeError("shell session is not running")
        os.write(self.master_fd, text.encode("utf-8"))
        time.sleep(0.06)
        self._append_output()

    def resize(self, cols: int, rows: int) -> None:
        winsz = struct.pack("HHHH", rows, cols, 0, 0)
        fcntl.ioctl(self.master_fd, termios.TIOCSWINSZ, winsz)

    def close(self) -> None:
        try:
            if self.process.poll() is None:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
        except OSError:
            pass
        for fd in (self.master_fd, self.slave_fd):
            try:
                os.close(fd)
            except OSError:
                pass


def run_status(workspace: Path) -> dict:
    env = os.environ.copy()
    env["CODEX_LOOP_WORKSPACE"] = str(workspace)
    completed = subprocess.run(
        ["bash", str(STATUS_SCRIPT)],
        check=True,
        text=True,
        capture_output=True,
        env=env,
    )
    return json.loads(completed.stdout)


def tail_text(path: Path | None, lines: int) -> str:
    if not path or not path.exists():
        return ""
    try:
        with path.open("r", encoding="utf-8", errors="replace") as fh:
            content = fh.readlines()[-lines:]
        return "".join(content)
    except OSError:
        return ""


def send_to_thread(workspace: Path, thread_id: str, message: str) -> dict:
    with tempfile.NamedTemporaryFile("w+", encoding="utf-8", delete=False) as tmp:
        out_path = Path(tmp.name)
    try:
        completed = subprocess.run(
            [
                "codex",
                "exec",
                "resume",
                "--json",
                "-o",
                str(out_path),
                "--dangerously-bypass-approvals-and-sandbox",
                thread_id,
                "-",
            ],
            input=message,
            text=True,
            capture_output=True,
            cwd=str(workspace),
            timeout=300,
        )
        last_message = tail_text(out_path, 400)
        return {
            "ok": completed.returncode == 0,
            "returncode": completed.returncode,
            "stdout": completed.stdout[-4000:],
            "stderr": completed.stderr[-4000:],
            "last_message": last_message,
        }
    finally:
        try:
            out_path.unlink(missing_ok=True)
        except OSError:
            pass


def control_daemon(workspace: Path, action: str, interval_minutes: int | None = None) -> dict:
    env = os.environ.copy()
    env["CODEX_LOOP_WORKSPACE"] = str(workspace)
    if interval_minutes is not None:
        env["CODEX_LOOP_INTERVAL_MINUTES"] = str(interval_minutes)

    if action == "start":
        script = START_SCRIPT
    elif action == "stop":
        script = STOP_SCRIPT
    else:
        raise ValueError(f"unsupported daemon action: {action}")

    completed = subprocess.run(
        ["bash", str(script)],
        cwd=str(workspace),
        text=True,
        capture_output=True,
        env=env,
        timeout=60,
    )
    return {
        "ok": completed.returncode == 0,
        "action": action,
        "returncode": completed.returncode,
        "stdout": completed.stdout[-4000:],
        "stderr": completed.stderr[-4000:],
    }


def thread_lock_path(workspace: Path) -> Path:
    return workspace / THREAD_LOCK_FILE


def read_thread_lock(workspace: Path) -> dict:
    path = thread_lock_path(workspace)
    if not path.exists():
        return {"mode": "writable", "source": "default", "thread_id": "", "note": ""}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        return {
            "mode": payload.get("mode", "writable"),
            "source": payload.get("source", "manual"),
            "thread_id": payload.get("thread_id", ""),
            "note": payload.get("note", ""),
            "updated_at": payload.get("updated_at", ""),
        }
    except Exception:
        return {"mode": "readonly", "source": "corrupt", "thread_id": "", "note": "lock file parse failed"}


def write_thread_lock(workspace: Path, mode: str, thread_id: str = "", note: str = "") -> dict:
    path = thread_lock_path(workspace)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "mode": mode,
        "source": "web-relay",
        "thread_id": thread_id,
        "note": note,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def create_shell_session(workspace: Path, shell: str | None = None) -> ShellSession:
    shell_name = shell or os.environ.get("SHELL", "/bin/bash")
    session_id = f"sh-{int(time.time() * 1000)}"
    return ShellSession(session_id=session_id, cwd=workspace, shell=shell_name)


def resolve_edit_path(workspace: Path, rel_path: str) -> Path:
    if not rel_path:
        raise ValueError("path is required")
    candidate = (workspace / rel_path).resolve()
    allowed_roots = [(workspace / rel).resolve() for rel in ALLOWED_EDIT_ROOTS_REL]
    allowed_files = [(workspace / rel).resolve() for rel in ALLOWED_EDIT_FILES_REL]
    if candidate in allowed_files:
        return candidate
    if any(root == candidate or root in candidate.parents for root in allowed_roots):
        return candidate
    raise ValueError("path is outside the allowed editable workspace")


def read_repo_text(workspace: Path, path: Path) -> dict:
    return {
        "path": str(path.relative_to(workspace)),
        "text": path.read_text(encoding="utf-8"),
        "updated_at": git_date(workspace, path),
    }


def git_date(workspace: Path, path: Path) -> str:
    rel = path.relative_to(workspace)
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cs %H", "--", str(rel)],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip() or "unknown"


def load_workspace_shell_config(workspace: Path) -> dict:
    path = workspace / WORKSPACE_SHELL_FILE
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def connector_shell_path(workspace: Path) -> Path:
    return workspace / CONNECTOR_SHELL_FILE


def default_connector_state() -> dict:
    return {
        "shell_mode": "ui-shell",
        "bind_state": "unbound",
        "target_dialog": "",
        "note": "local draft only",
        "session_key": "",
        "qrcode_content": "",
        "login_status": "idle",
        "runtime_mode": "mock-flow",
        "runtime_owner": "workspace-shell",
        "write_policy": "local-draft",
        "bridge_mode": "queue-ticket",
        "bridge_target": "workspace",
        "bridge_policy": "daemon-safe",
        "bridge_status": "draft",
        "bridge_lock_rule": "daemon-holds-thread",
        "delivery_guardrail": "queue-only",
        "updated_at": "",
    }


def read_connector_state(workspace: Path) -> dict:
    path = connector_shell_path(workspace)
    state = default_connector_state()
    if not path.exists():
        return state
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            state.update(payload)
    except Exception:
        state["note"] = "connector shell parse failed"
        state["bind_state"] = "unbound"
        state["login_status"] = "error"
    return state


def write_connector_state(workspace: Path, patch: dict) -> dict:
    path = connector_shell_path(workspace)
    path.parent.mkdir(parents=True, exist_ok=True)
    allowed_fields = {
        "shell_mode",
        "bind_state",
        "target_dialog",
        "note",
        "session_key",
        "qrcode_content",
        "login_status",
        "runtime_mode",
        "runtime_owner",
        "write_policy",
        "bridge_mode",
        "bridge_target",
        "bridge_policy",
        "bridge_status",
        "bridge_lock_rule",
        "delivery_guardrail",
    }
    state = read_connector_state(workspace)
    for key, value in (patch or {}).items():
        if key in allowed_fields and isinstance(value, str):
            state[key] = value
    state["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return state


def start_connector_qr(workspace: Path, target_dialog: str = "", note: str = "") -> dict:
    token = f"mock-qr-{int(time.time())}"
    patch = {
        "shell_mode": "mock-qr",
        "bind_state": "qr-wait",
        "login_status": "waiting_scan",
        "runtime_mode": "mock-flow",
        "runtime_owner": "workspace-shell",
        "write_policy": "local-draft",
        "bridge_mode": "queue-ticket",
        "bridge_target": "workspace",
        "bridge_policy": "daemon-safe",
        "bridge_status": "draft",
        "bridge_lock_rule": "daemon-holds-thread",
        "delivery_guardrail": "queue-only",
        "session_key": token,
        "qrcode_content": f"mock://wechat-bind/{token}",
    }
    if target_dialog:
        patch["target_dialog"] = target_dialog
    if note:
        patch["note"] = note
    return write_connector_state(workspace, patch)


def wait_connector_qr(workspace: Path, session_key: str = "") -> dict:
    state = read_connector_state(workspace)
    if session_key and state.get("session_key") and session_key != state.get("session_key"):
        raise ValueError("session_key does not match active connector session")
    if state.get("bind_state") == "bound":
        state["poll_hint"] = "bound"
    elif state.get("session_key"):
        if not state.get("login_status") or state.get("login_status") == "idle":
            state["login_status"] = "waiting_scan"
        state["poll_hint"] = "keep-waiting"
    else:
        state["poll_hint"] = "start-qr-first"
    return state


def infer_git_remote(workspace: Path) -> str:
    result = subprocess.run(
        ["git", "remote", "get-url", "origin"],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        check=False,
    )
    remote = result.stdout.strip()
    if remote.startswith("git@github.com:"):
        remote = "https://github.com/" + remote[len("git@github.com:") :]
    if remote.endswith(".git"):
        remote = remote[:-4]
    return remote


def infer_blob_base(workspace: Path) -> str:
    remote = infer_git_remote(workspace)
    if remote.startswith("https://github.com/"):
        return remote + "/blob/main"
    return ""


def infer_pages_base(workspace: Path, config: dict) -> str:
    explicit = (config.get("site_base_url") or "").rstrip("/")
    if explicit:
        return explicit
    remote = infer_git_remote(workspace)
    parsed = urlparse(remote)
    parts = parsed.path.strip("/").split("/")
    if remote.startswith("https://github.com/") and len(parts) == 2:
        owner, repo = parts
        return f"https://{owner.lower()}.github.io/{repo}"
    return ""


def workspace_meta(workspace: Path) -> dict:
    config = load_workspace_shell_config(workspace)
    workspace_name = config.get("workspace_name") or workspace.name
    shell_title = config.get("shell_title") or f"{workspace_name} Workspace Shell"
    shell_eyebrow = config.get("shell_eyebrow") or "Codex Loop Workspace"
    shell_summary = config.get("shell_summary") or "Plan-driven task pool, plan editing, and runtime visibility in one local workspace shell."
    blob_base = infer_blob_base(workspace)
    pages_base = infer_pages_base(workspace, config)
    return {
        "workspace_name": workspace_name,
        "shell_title": shell_title,
        "shell_eyebrow": shell_eyebrow,
        "shell_summary": shell_summary,
        "task_board_path": "site/data/loop-task-board.json",
        "site_root": "site",
        "site_base_url": pages_base,
        "github_blob_base": blob_base,
        "github_repo_url": infer_git_remote(workspace),
        "workspace_root": str(workspace),
        "config_path": WORKSPACE_SHELL_FILE,
        "links": config.get("links", {}),
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "CodexLoopRelay/0.1"

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    @property
    def workspace(self) -> Path:
        return self.server.workspace

    @property
    def shell_sessions(self) -> dict:
        return self.server.shell_sessions

    @property
    def shell_lock(self) -> threading.Lock:
        return self.server.shell_lock

    def _send_json(self, data: dict, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _send_text(self, text: str, status: int = 200) -> None:
        body = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        path = parsed.path

        if path in ("/", "/index"):
            self._send_text(
                "codex-loop web relay\n"
                "GET /api/status\n"
                "GET /api/workspace/meta\n"
                "GET /api/task-board\n"
                "GET /api/logs/daemon?lines=120\n"
                "GET /api/logs/latest?lines=120\n"
                "GET /api/last-message?lines=120\n"
                "GET /api/thread/lock\n"
                "GET /api/plan/read?path=...\n"
                "GET /api/connector/state\n"
                "GET /api/shell/list\n"
                "GET /api/shell/read?id=...\n"
                "GET /events\n"
                "POST /api/daemon/start\n"
                "POST /api/daemon/stop\n"
                "POST /api/plan/write\n"
                "POST /api/connector/state\n"
                "POST /api/connector/qr/start\n"
                "POST /api/connector/qr/wait\n"
                "POST /api/thread/lock\n"
                "POST /api/thread/unlock\n"
                "POST /api/thread/send\n"
                "POST /api/shell/create\n"
                "POST /api/shell/write\n"
                "POST /api/shell/resize\n"
                "POST /api/shell/close\n"
            )
            return

        if path == "/api/status":
            try:
                status = run_status(self.workspace)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return
            status["thread_lock"] = read_thread_lock(self.workspace)
            status["ok"] = True
            self._send_json(status)
            return

        if path == "/api/workspace/meta":
            self._send_json({"ok": True, "meta": workspace_meta(self.workspace)})
            return

        if path == "/api/task-board":
            board_path = self.workspace / "site" / "data" / "loop-task-board.json"
            if not board_path.exists():
                self._send_json({"ok": False, "error": "task board not found", "path": str(board_path)}, 404)
                return
            try:
                payload = json.loads(board_path.read_text(encoding="utf-8"))
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return
            self._send_json({"ok": True, "task_board": payload, "path": str(board_path.relative_to(self.workspace))})
            return

        if path == "/api/thread/lock":
            self._send_json({"ok": True, "thread_lock": read_thread_lock(self.workspace)})
            return

        if path == "/api/plan/read":
            rel_path = query.get("path", [""])[0]
            try:
                repo_path = resolve_edit_path(self.workspace, rel_path)
                payload = read_repo_text(self.workspace, repo_path)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 400)
                return
            self._send_json({"ok": True, **payload})
            return

        if path == "/api/connector/state":
            self._send_json(
                {
                    "ok": True,
                    "connector": read_connector_state(self.workspace),
                    "path": CONNECTOR_SHELL_FILE,
                }
            )
            return

        if path == "/api/shell/list":
            with self.shell_lock:
                sessions = [session.read() for session in self.shell_sessions.values()]
            self._send_json({"ok": True, "sessions": sessions})
            return

        if path == "/api/shell/read":
            session_id = query.get("id", [""])[0]
            if not session_id:
                self._send_json({"ok": False, "error": "id is required"}, 400)
                return
            with self.shell_lock:
                session = self.shell_sessions.get(session_id)
            if not session:
                self._send_json({"ok": False, "error": "shell session not found"}, 404)
                return
            self._send_json({"ok": True, "session": session.read()})
            return

        if path.startswith("/api/logs/"):
            try:
                status = run_status(self.workspace)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return

            lines = max(20, min(800, int(query.get("lines", ["120"])[0])))
            state_dir = self.workspace / ".codex-loop/state/logs"
            daemon_log = state_dir / "daemon_stdout.log"
            latest_tick = status.get("last_tick", {}).get("raw_log_path")
            latest_tick_path = Path(latest_tick) if latest_tick else None

            if path == "/api/logs/daemon":
                self._send_json({"ok": True, "text": tail_text(daemon_log, lines), "path": str(daemon_log)})
                return
            if path == "/api/logs/latest":
                self._send_json(
                    {
                        "ok": True,
                        "text": tail_text(latest_tick_path, lines),
                        "path": str(latest_tick_path) if latest_tick_path else "",
                    }
                )
                return

        if path == "/api/last-message":
            try:
                status = run_status(self.workspace)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return
            lines = max(20, min(800, int(query.get("lines", ["120"])[0])))
            message_path = status.get("last_tick", {}).get("last_message_file")
            message_file = Path(message_path) if message_path else None
            self._send_json(
                {
                    "ok": True,
                    "text": tail_text(message_file, lines),
                    "path": str(message_file) if message_file else "",
                }
            )
            return

        if path == "/events":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            while True:
                try:
                    status = run_status(self.workspace)
                    payload = {
                        "type": "status",
                        "ts": int(time.time() * 1000),
                        "status": status,
                        "thread_lock": read_thread_lock(self.workspace),
                    }
                    self.wfile.write(("data: " + json.dumps(payload, ensure_ascii=False) + "\n\n").encode("utf-8"))
                    self.wfile.flush()
                    time.sleep(2.5)
                except BrokenPipeError:
                    return
                except ConnectionResetError:
                    return
                except Exception as exc:  # noqa: BLE001
                    payload = {"type": "error", "ts": int(time.time() * 1000), "error": str(exc)}
                    self.wfile.write(("data: " + json.dumps(payload, ensure_ascii=False) + "\n\n").encode("utf-8"))
                    self.wfile.flush()
                    time.sleep(3.0)
            return

        self._send_json({"ok": False, "error": "not found"}, 404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length else "{}"
            payload = json.loads(raw or "{}")
        except Exception as exc:  # noqa: BLE001
            self._send_json({"ok": False, "error": f"bad json: {exc}"}, 400)
            return

        if parsed.path in ("/api/daemon/start", "/api/daemon/stop"):
            action = "start" if parsed.path.endswith("/start") else "stop"

            interval = payload.get("interval_minutes")
            try:
                interval_minutes = int(interval) if interval is not None else None
            except ValueError:
                self._send_json({"ok": False, "error": "interval_minutes must be an integer"}, 400)
                return

            try:
                result = control_daemon(self.workspace, action, interval_minutes=interval_minutes)
                status = run_status(self.workspace)
            except subprocess.TimeoutExpired:
                self._send_json({"ok": False, "error": f"daemon {action} timed out"}, 504)
                return
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return

            result["status"] = status
            self._send_json(result, 200 if result.get("ok") else 500)
            return

        if parsed.path in ("/api/thread/lock", "/api/thread/unlock"):
            mode = "readonly" if parsed.path.endswith("/lock") else "writable"
            note = payload.get("note", "")
            thread_id = payload.get("thread_id", "")
            lock_state = write_thread_lock(self.workspace, mode=mode, thread_id=thread_id, note=note)
            self._send_json({"ok": True, "thread_lock": lock_state})
            return

        if parsed.path == "/api/plan/write":
            rel_path = payload.get("path", "")
            text = payload.get("text", "")
            if not isinstance(text, str):
                self._send_json({"ok": False, "error": "text must be a string"}, 400)
                return
            try:
                repo_path = resolve_edit_path(self.workspace, rel_path)
                repo_path.write_text(text, encoding="utf-8")
                result = read_repo_text(self.workspace, repo_path)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 400)
                return
            self._send_json({"ok": True, **result})
            return

        if parsed.path == "/api/connector/state":
            patch = payload.get("connector") or payload
            if not isinstance(patch, dict):
                self._send_json({"ok": False, "error": "connector payload must be an object"}, 400)
                return
            try:
                state = write_connector_state(self.workspace, patch)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 400)
                return
            self._send_json({"ok": True, "connector": state, "path": CONNECTOR_SHELL_FILE})
            return

        if parsed.path == "/api/connector/qr/start":
            try:
                state = start_connector_qr(
                    self.workspace,
                    target_dialog=str(payload.get("target_dialog", "") or ""),
                    note=str(payload.get("note", "") or ""),
                )
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 400)
                return
            self._send_json({"ok": True, "connector": state, "path": CONNECTOR_SHELL_FILE})
            return

        if parsed.path == "/api/connector/qr/wait":
            try:
                state = wait_connector_qr(self.workspace, session_key=str(payload.get("session_key", "") or ""))
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 400)
                return
            self._send_json({"ok": True, "connector": state, "path": CONNECTOR_SHELL_FILE})
            return

        if parsed.path == "/api/shell/create":
            shell_name = payload.get("shell")
            try:
                session = create_shell_session(self.workspace, shell=shell_name)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return
            with self.shell_lock:
                self.shell_sessions[session.session_id] = session
            self._send_json({"ok": True, "session": session.read()})
            return

        if parsed.path == "/api/shell/write":
            session_id = payload.get("id", "")
            text = payload.get("input", "")
            with self.shell_lock:
                session = self.shell_sessions.get(session_id)
            if not session:
                self._send_json({"ok": False, "error": "shell session not found"}, 404)
                return
            try:
                session.write(text)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return
            self._send_json({"ok": True, "session": session.read()})
            return

        if parsed.path == "/api/shell/resize":
            session_id = payload.get("id", "")
            cols = int(payload.get("cols", 120))
            rows = int(payload.get("rows", 30))
            with self.shell_lock:
                session = self.shell_sessions.get(session_id)
            if not session:
                self._send_json({"ok": False, "error": "shell session not found"}, 404)
                return
            try:
                session.resize(cols=cols, rows=rows)
            except Exception as exc:  # noqa: BLE001
                self._send_json({"ok": False, "error": str(exc)}, 500)
                return
            self._send_json({"ok": True, "session": session.read()})
            return

        if parsed.path == "/api/shell/close":
            session_id = payload.get("id", "")
            with self.shell_lock:
                session = self.shell_sessions.pop(session_id, None)
            if not session:
                self._send_json({"ok": False, "error": "shell session not found"}, 404)
                return
            session.close()
            self._send_json({"ok": True, "closed": session_id})
            return

        if parsed.path != "/api/thread/send":
            self._send_json({"ok": False, "error": "not found"}, 404)
            return

        try:
            status = run_status(self.workspace)
        except Exception as exc:  # noqa: BLE001
            self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        message = (payload.get("message") or "").strip()
        force = bool(payload.get("force"))
        thread_id = payload.get("thread_id") or status.get("thread_id")
        lock_state = read_thread_lock(self.workspace)

        if not message:
            self._send_json({"ok": False, "error": "message is required"}, 400)
            return
        if not thread_id:
            self._send_json({"ok": False, "error": "no thread id available"}, 400)
            return
        if lock_state.get("mode") == "readonly":
            self._send_json(
                {
                    "ok": False,
                    "error": "thread is currently readonly-locked; unlock it before sending",
                    "thread_id": thread_id,
                    "thread_lock": lock_state,
                },
                423,
            )
            return
        if status.get("daemon_running") and not force:
            self._send_json(
                {
                    "ok": False,
                    "error": "daemon is currently running; stop it first or send with force=true if you accept thread-write risk",
                    "thread_id": thread_id,
                },
                409,
            )
            return

        try:
            result = send_to_thread(self.workspace, thread_id, message)
        except subprocess.TimeoutExpired:
            self._send_json({"ok": False, "error": "codex exec resume timed out", "thread_id": thread_id}, 504)
            return
        except Exception as exc:  # noqa: BLE001
            self._send_json({"ok": False, "error": str(exc), "thread_id": thread_id}, 500)
            return

        result["thread_id"] = thread_id
        result["thread_lock"] = lock_state
        self._send_json(result, 200 if result.get("ok") else 500)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8770)
    ap.add_argument("--workspace", default=str(ROOT))
    args = ap.parse_args()

    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    httpd.workspace = Path(args.workspace).resolve()
    httpd.shell_sessions = {}
    httpd.shell_lock = threading.Lock()
    print(f"codex-loop relay: http://{args.host}:{args.port} (workspace={httpd.workspace})")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        with httpd.shell_lock:
            sessions = list(httpd.shell_sessions.values())
            httpd.shell_sessions.clear()
        for session in sessions:
            session.close()
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
