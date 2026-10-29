"""Create independent demo and full snapshots without modifying existing sites."""
from pathlib import Path
import hashlib
import json
import re
import shutil

root = Path(__file__).resolve().parents[1]
source = root / 'public'
demo = root / 'azifit-demo'
full = root / 'azifit-full'
assert not demo.exists() and not full.exists(), 'Refusing to overwrite existing versions'
def hashes(folder):
    return {str(p.relative_to(folder)): hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.rglob('*') if p.is_file()}
before = hashes(source)
publish_before = hashes(root / 'cloudflare-pages')
shutil.copytree(source, full)
for name in ['index.html','404.html','favicon.svg','site.webmanifest','_headers','assets/css/main.css','assets/img/og.png']:
    target = demo / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source / name, target)
html = (source / 'index.html').read_text(encoding='utf-8')
for section in ['values','prices','schedule','lpg','intensive','team','booking']:
    html = re.sub(r'<section\b(?=[^>]*\bid="'+section+r'")[^>]*>.*?</section>', '', html, flags=re.S)
html = re.sub(r'<section\b[^>]*class="[^"]*\bfaq\b[^"]*"[^>]*>.*?</section>', '', html, flags=re.S)
html = re.sub(r'<dialog id="booking-dialog".*?</dialog>', '', html, flags=re.S)
html = re.sub(r'<button class="floating-book.*?</button>', '<a class="floating-book button js-only" href="https://wa.me/77007194746">Связаться ↗</a>', html, flags=re.S)
html = re.sub(r'<div id="toast".*?</div>', '', html, flags=re.S)
html = re.sub(r'<a href="#(?:prices|schedule|lpg)">.*?</a>', '', html)
html = re.sub(r'<a href="#prices" data-price-link="[^"]*" aria-label="Цены: ([^"]*)">Цены ↗</a>', r'<a href="#contacts" aria-label="Связаться: \1">↗</a>', html)
html = html.replace(' data-book', '')
html = html.replace('href="#values">О студии ↓', 'href="#women">Направления ↓')
html = html.replace('02 / НАПРАВЛЕНИЯ', '01 / НАПРАВЛЕНИЯ').replace('03 / НАПРАВЛЕНИЯ', '02 / НАПРАВЛЕНИЯ').replace('10 / КОНТАКТЫ', '03 / КОНТАКТЫ')
html = html.replace('Прайс, расписание и запись.', 'Предварительная версия.')
html = html.replace('<title>AziFit Studio — женский фитнес и детское развитие в Алматы</title>', '<title>AziFit Studio — предварительная версия</title>\n  <meta name="robots" content="noindex, nofollow">')
html = html.replace('<link rel="stylesheet" href="assets/css/main.css">', '<link rel="stylesheet" href="assets/css/main.css">\n  <link rel="stylesheet" href="assets/css/demo.css">')
html = html.replace('<script defer src="assets/js/data.js"></script><script defer src="assets/js/app.js"></script>', '<script defer src="assets/js/demo.js"></script>')
html = html.replace('<div class="hero-heading">', '<!-- COPY-DRAFT: Demo status, excluded from the full version. -->\n  <p class="demo-badge"><span aria-hidden="true"></span>Предварительная версия</p>\n  <div class="hero-heading">')
html = html.replace('<p>© AziFit Studio<br>', '<p>© AziFit Studio<br><span>Предварительная версия</span><br>')
html = html.replace('<p id="hours" hidden></p>', '')
(demo / 'index.html').write_text(html, encoding='utf-8')
(demo / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
(demo / 'assets/js').mkdir(parents=True)
qa = root / 'tools/demo-qa'
qa.mkdir(parents=True, exist_ok=True)
assert before == hashes(source) == hashes(full)
assert publish_before == hashes(root / 'cloudflare-pages')
(qa / 'original-hashes.json').write_text(json.dumps({'public':before,'cloudflare-pages':publish_before}, indent=2), encoding='utf-8')
print('PASS: azifit-full is an exact full copy; public and cloudflare-pages are unchanged.')
print('Created azifit-demo with hero, both service directions, contacts and mobile menu.')
