"""
Assemble site pages from _src/pages/*.html + _src/partials/*.html.

Placeholders inside a page:
  <!-- @head title="..." desc="..." page="home" -->   document head + <body>
  <!-- @nav -->       main navigation (sits inside each page's hero frame)
  <!-- @footer -->    footer, sticky nav, drawer, lightbox, scripts, </body>

Run from anywhere:  python _src/build.py
"""
import hashlib, pathlib, re

SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
part = {p.stem: p.read_text(encoding='utf8') for p in (SRC / 'partials').glob('*.html')}

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#066739">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/img/projects/msc-00.webp">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/duotone/style.css">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-page="{page}" id="top">
<a class="skip-link" href="#main">Skip to content</a>
""" + part['sprite']

FOOT = part['footer'] + part['chrome'] + """
<script src="assets/js/data.js"></script>
<script src="assets/js/zim-geo.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
"""

def version(rel):
    return hashlib.md5((ROOT / rel).read_bytes()).hexdigest()[:8]

def head(m):
    attrs = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
    return HEAD.format(**attrs)

for page in sorted((SRC / 'pages').glob('*.html')):
    html = page.read_text(encoding='utf8')
    html = re.sub(r'<!-- @head (.*?) -->', head, html)
    html = html.replace('<!-- @nav -->', part['nav']).replace('<!-- @footer -->', FOOT)
    # cache-bust local CSS/JS by content, so a deploy never pairs new JS with a CDN-cached old stylesheet
    html = re.sub(r'(href|src)="(assets/(?:css|js)/[\w.-]+\.(?:css|js))"', lambda m: f'{m[1]}="{m[2]}?v={version(m[2])}"', html)
    (ROOT / page.name).write_text(html, encoding='utf8')
    print('built', page.name)
