#!/usr/bin/env python3
"""
Live server para arquivos HTML. Auto-reload ao salvar mudanças.
Zero dependencies - usa apenas stdlib do Python.

Usage: uv run server.py
"""

import json
import os
import pathlib
import threading
import time
import socketserver
import http.server

ROOT = pathlib.Path(__file__).resolve().parent
PORT = 8080

# Shared flag for livereload
lr_changed = threading.Event()


class HTTPHandler(http.server.SimpleHTTPRequestHandler):
    """Serves static files with livereload polling."""
    directory = str(ROOT)

    def do_GET(self):
        if self.path == "/__livereload__":
            # Client-side: polls /__livereload__/poll every 1s
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript")
            self.end_headers()
            script = (
                b"(function(){"
                b"setInterval(function(){"
                b"fetch('/__livereload__/poll?t='+Date.now())"
                b".then(function(r){return r.json()})"
                b".then(function(d){if(d.reload)location.reload()})"
                b"},1000);"
                b"})();"
            )
            self.wfile.write(script)
            return

        if self.path.startswith("/__livereload__/poll"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            reload_flag = lr_changed.is_set()
            lr_changed.clear()
            self.wfile.write(json.dumps({"reload": reload_flag}).encode())
            return

        # Inject livereload script in .html files
        filepath = self.translate_path(self.path)
        if filepath.endswith(".html") and os.path.isfile(filepath):
            with open(filepath, "rb") as f:
                html = f.read().decode("utf-8", errors="replace")
            if "</body>" in html:
                html = html.replace("</body>", '<script src="/__livereload__"></script></body>', 1)
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(html.encode("utf-8"))
                return
        super().do_GET()

    def log_message(self, fmt, *args):
        pass  # silence logs


class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True


def get_file_mtimes(root):
    """Return dict of {file: mtime} for all files under root, ignoring .git"""
    mtimes = {}
    for f in root.rglob("*"):
        if f.is_file() and ".git" not in f.parts:
            mtimes[f] = f.stat().st_mtime
    return mtimes


def watcher():
    """Poll for file changes and trigger reload."""
    mtimes = get_file_mtimes(ROOT)
    while True:
        time.sleep(0.5)
        new_mtimes = get_file_mtimes(ROOT)
        changed = False
        for f, mtime in new_mtimes.items():
            if mtimes.get(f) != mtime:
                changed = True
                print(f"  → {f.relative_to(ROOT)} changed")
                break
        mtimes = new_mtimes
        if changed:
            lr_changed.set()


# Start file watcher (ignores .git)
watch_thread = threading.Thread(target=watcher, daemon=True)
watch_thread.start()
print(f"Watching: {ROOT}")

# Start HTTP server
with ReusableServer(("", PORT), HTTPHandler) as httpd:
    print(f"\nServing on http://localhost:{PORT}")
    print("Press Ctrl+C to stop\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        httpd.shutdown()
