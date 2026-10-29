"""Serve only the publish folder; apply its Cloudflare headers for local QA."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[2] / 'cloudflare-pages'
rules = []
for line in (root / '_headers').read_text(encoding='utf-8').splitlines():
    if not line.strip():
        continue
    if not line.startswith(' '):
        rules.append((line.strip(), []))
    else:
        key, value = line.strip().split(':', 1)
        rules[-1][1].append((key, value.strip()))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(root), **kwargs)

    def end_headers(self):
        url = urlsplit(self.path).path
        headers = {}
        for pattern, values in rules:
            if pattern == '/*' or pattern.endswith('*') and url.startswith(pattern[:-1]) or url == pattern:
                headers.update(values)
        for key, value in headers.items():
            self.send_header(key, value)
        super().end_headers()

print(f'Serving publish folder with CSP: {root}', flush=True)
ThreadingHTTPServer(('127.0.0.1', 8080), Handler).serve_forever()
