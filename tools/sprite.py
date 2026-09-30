"""Build the inline icon sprite from the shared library (~/Projekte/_icons, Heroicons 24 outline)
and write it into index.html between <!-- partial:sprite --> markers.
Animated Animate UI icons (pin, phone, key, send, search, clock) sit inline in the pages,
because their parts are animated; see .ai-* in css/styles.css.

    python3 tools/sprite.py && python3 tools/sync_partials.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HERO = Path.home() / "Projekte/_icons/heroicons/24/outline"
ICONS = [
    "home-modern", "building-office-2", "map", "sun", "envelope", "chevron-down", "check",
    "squares-2x2", "arrows-pointing-out", "calendar-days", "banknotes", "wrench-screwdriver",
    "document-text", "calculator", "users", "chat-bubble-left-right", "shield-check",
    "clipboard-document-check", "camera", "scale", "device-phone-mobile", "x-mark",
    "building-storefront", "sparkles", "user", "currency-euro", "arrow-long-right", "home",
    "information-circle", "hand-thumb-up",
]
ARROW = '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'   # Animate UI arrow-right, static part

symbols = []
for name in ICONS:
    svg = (HERO / f"{name}.svg").read_text()
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    inner = re.sub(r'\s*stroke-(linecap|linejoin)="round"', "", inner)
    inner = re.sub(r">\s+<", "><", inner.strip())
    symbols.append(f'<symbol id="i-{name}" viewBox="0 0 24 24">{inner}</symbol>')
symbols.append(f'<symbol id="i-arrow" viewBox="0 0 24 24">{ARROW}</symbol>')

sprite = ('<!-- partial:sprite --><svg class="sr-only" aria-hidden="true" focusable="false">'
          + "".join(symbols) + "</svg><!-- /partial:sprite -->")
page = ROOT / "index.html"
src = page.read_text()
page.write_text(re.sub(r"<!-- partial:sprite -->.*?<!-- /partial:sprite -->", lambda m: sprite, src, flags=re.S))
print(f"sprite: {len(symbols)} symbols -> index.html")
