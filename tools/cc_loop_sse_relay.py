#!/usr/bin/env python3
"""Minimal local SSE server streaming demo LoopEvents (stdlib only).

For browser EventSource lab: CORS * on /events. Binds 127.0.0.1 by default.

Usage (repo root):
  python3 tools/cc_loop_sse_relay.py
  python3 tools/cc_loop_sse_relay.py --port 8769 --fast

Then open site/topic-cc-loop-lab.html via local HTTP (not file://) and connect.
"""
from __future__ import annotations

import argparse
import json
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

from cc_loop_demo_events import DEMO


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class Handler(BaseHTTPRequestHandler):
    server_version = "CCLoopSSE/0.1"

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path in ("/", "/index"):
            body = (
                "CC Loop SSE demo\n"
                "GET /events — text/event-stream (demo replay)\n"
                "Use topic-cc-loop-lab.html + local static server to test in browser.\n"
            ).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if path == "/events":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            t0 = time.time()
            delay = getattr(self.server, "event_delay", 0.35)
            for stage, title, detail in DEMO:
                ev: dict = {"stage": stage, "title": title, "ts": int((time.time() - t0) * 1000)}
                if detail:
                    ev["detail"] = detail
                line = "data: " + json.dumps(ev, ensure_ascii=False) + "\n\n"
                self.wfile.write(line.encode("utf-8"))
                self.wfile.flush()
                time.sleep(delay)
            end_ev = {"stage": "_end", "title": "sse demo finished", "ts": int((time.time() - t0) * 1000)}
            self.wfile.write(("data: " + json.dumps(end_ev, ensure_ascii=False) + "\n\n").encode("utf-8"))
            self.wfile.flush()
            return

        self.send_response(404)
        self.end_headers()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--host", default="127.0.0.1", help="bind address (default loopback)")
    ap.add_argument("--port", type=int, default=8769, help="TCP port")
    ap.add_argument("--fast", action="store_true", help="shorter delay between events")
    args = ap.parse_args()

    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    httpd.event_delay = 0.06 if args.fast else 0.35
    print("SSE demo: http://%s:%s/events (Ctrl+C to stop)" % (args.host, args.port))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
