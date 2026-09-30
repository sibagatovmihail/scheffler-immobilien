"""Copy the shared blocks of index.html into the other pages.

index.html is the source for every block marked
    <!-- partial:NAME --> ... <!-- /partial:NAME -->
(sprite, header, contact, footer). Each page keeps the markers it needs; this
script replaces what is between them and marks the page's own nav link as current.
Run tools/map.py afterwards if a page gained a map block.

    python3 tools/sprite.py && python3 tools/sync_partials.py && python3 tools/map.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = {  # file: nav link href to mark as current (None = no link)
    "index.html": None,
    "immobilien.html": "immobilien.html",
    "anbieten.html": "anbieten.html",
    "hausverwaltung.html": "hausverwaltung.html",
    "kontakt.html": "kontakt.html",
    "impressum.html": None,
    "datenschutz.html": None,
}
BLOCK = re.compile(r"<!-- partial:(\w+) -->.*?<!-- /partial:\1 -->", re.S)

src = (ROOT / "index.html").read_text()
blocks = {m.group(1): m.group(0) for m in BLOCK.finditer(src)}

for name, href in PAGES.items():
    path = ROOT / name
    if not path.exists():
        print(f"{name}: missing")
        continue
    page = path.read_text()

    def fill(m):
        block = blocks[m.group(1)]
        if m.group(1) == "header" and href:
            block = block.replace(f'<a class="nav__link" href="{href}">',
                                  f'<a class="nav__link is-current" href="{href}" aria-current="page">')
        return block

    new = BLOCK.sub(fill, page) if name != "index.html" else page
    path.write_text(new)
    print(f"{name}: synced")
