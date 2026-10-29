"""Package the prototype without modifying source versions or requiring a build."""
from pathlib import Path
import hashlib
import json
import shutil

root = Path(__file__).resolve().parents[1]
destination = root / 'cloudflare-demo'
qa = root / 'tools/cloudflare-demo-qa'
files = ['index.html', '404.html', 'favicon.svg', 'site.webmanifest', 'robots.txt', '_headers',
         'assets/css/main.css', 'assets/css/demo.css', 'assets/js/demo.js', 'assets/img/og.png']

def hashes(folder):
    return {p.relative_to(folder).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in folder.rglob('*') if p.is_file()}

assert not destination.exists(), 'Refusing to overwrite an existing publication folder'
originals = {name: hashes(root / name) for name in ['public', 'azifit-full', 'azifit-demo', 'cloudflare-pages']}
for file in files:
    target = destination / file
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / 'azifit-demo' / file, target)

qa.mkdir(parents=True, exist_ok=True)
for name in ['serve.py', 'browser-check.js']:
    content = (root / 'tools/demo-qa' / name).read_text(encoding='utf-8')
    content = content.replace('azifit-demo', 'cloudflare-demo').replace('tools/demo-qa', 'tools/cloudflare-demo-qa')
    (qa / name).write_text(content, encoding='utf-8')
assert hashes(destination) == {file: originals['azifit-demo'][file] for file in files}
assert all(hashes(root / name) == values for name, values in originals.items())
report = {'sources': originals, 'files': hashes(destination),
          'bytes': sum((destination / file).stat().st_size for file in files)}
(qa / 'manifest.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(f'PASS: {len(files)} files, {report["bytes"]} bytes; all source folders unchanged.')
print('PASS: index.html at package root; no tests, screenshots, models, dependencies or build tools.')
