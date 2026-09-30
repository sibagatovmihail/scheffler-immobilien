"""Schematic Anfahrt map of Waren's Altstadt, drawn from OpenStreetMap data.

Data: tools/osm-waren.json (one Overpass export, 2026-09-30: every highway in the
Altstadt box + the Müritz shoreline way). © OpenStreetMap contributors, ODbL.
Equirectangular projection, 1 SVG unit = 1 m. Writes the inline SVG to
tools/map.svg.html and injects it into every page that has the markers
<!-- map:start --> ... <!-- map:end -->.

    python3 tools/map.py
"""
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S, N, W, E = 53.5098, 53.5162, 12.6815, 12.6955      # view box (lat/lon)
M_LAT = 111_320
M_LON = M_LAT * math.cos(math.radians((S + N) / 2))
VW, VH = round((E - W) * M_LON), round((N - S) * M_LAT)

OFFICE = (53.5136248, 12.6885043)                     # Kirchenstraße 4 (Nominatim)
LABELS = [                                            # (text, lat, lon, class)
    ("Neuer Markt", 53.51432, 12.68945, "sq"),
    ("St. Georgen", 53.51372, 12.68600, "sq"),
    ("St. Marien", 53.51430, 12.69150, "sq"),
    ("Stadthafen", 53.51105, 12.68880, "harbour"),
    ("Müritz", 53.51035, 12.68330, "lake"),
]
STYLE = {  # highway class -> (css class, drawn width in m)
    "primary": ("r1", 11), "secondary": ("r1", 10), "tertiary": ("r2", 8),
    "residential": ("r2", 7), "living_street": ("r2", 6), "pedestrian": ("r3", 6),
    "service": ("r4", 3.5), "footway": ("r4", 2.2), "cycleway": ("r4", 2.2),
}


def xy(lat, lon):
    return (lon - W) * M_LON, (N - lat) * M_LAT


def fmt(pts):
    return " ".join(f"{x:.0f},{y:.0f}" for x, y in pts)


data = json.loads((ROOT / "tools/osm-waren.json").read_text())
roads = {k: [] for k in ("r4", "r3", "r2", "r1")}
widths = {}
shore = None
for el in data["elements"]:
    tags, geom = el.get("tags", {}), el.get("geometry", [])
    pts = [xy(p["lat"], p["lon"]) for p in geom]
    if not tags:
        shore = pts
        continue
    st = STYLE.get(tags.get("highway"))
    if not st or not any(-60 < x < VW + 60 and -60 < y < VH + 60 for x, y in pts):
        continue
    cls, w = st
    roads[cls].append(f'<polyline points="{fmt(pts)}"/>')
    widths[cls] = w

# the shoreline runs through the box; keep the stretch near the view and close it
# along the bottom edge, where the lake is
near = [p for p in shore if -400 < p[0] < VW + 400 and -200 < p[1] < VH + 600]
if near[0][0] > near[-1][0]:
    near.reverse()
lake = near + [(VW + 400, VH + 600), (-400, VH + 600)]

ox, oy = xy(*OFFICE)
parts = [f'<svg class="map__svg" viewBox="0 0 {VW} {VH}" preserveAspectRatio="xMidYMid slice" role="img" '
         f'aria-label="Karte der Altstadt von Waren: Scheffler Immobilien in der Kirchenstraße 4, '
         f'zwischen St. Georgen und dem Neuen Markt, rund 300 m vom Stadthafen">',
         f'<rect class="map__land" width="{VW}" height="{VH}"/>',
         f'<polygon class="map__lake" points="{fmt(lake)}"/>']
for cls in ("r4", "r3", "r2", "r1"):
    if roads[cls]:
        parts.append(f'<g class="map__{cls}" stroke-width="{widths[cls]}">{"".join(roads[cls])}</g>')
for text, lat, lon, cls in LABELS:
    x, y = xy(lat, lon)
    parts.append(f'<text class="map__label map__label--{cls}" x="{x:.0f}" y="{y:.0f}">{text}</text>')
parts.append(
    f'<g class="map__pin" transform="translate({ox:.0f} {oy:.0f})">'
    '<circle class="map__pulse" r="18"/>'
    '<path d="M0 0c-14-18-22-29-22-40a22 22 0 0 1 44 0c0 11-8 22-22 40Z"/>'
    '<circle cy="-40" r="8" fill="#fff"/></g>')
parts.append("</svg>")
svg = "".join(parts)
(ROOT / "tools/map.svg.html").write_text(svg + "\n")

for page in ROOT.glob("*.html"):
    src = page.read_text()
    new = re.sub(r"(<!-- map:start -->).*?(<!-- map:end -->)", lambda m: m.group(1) + svg + m.group(2), src, flags=re.S)
    if new != src:
        page.write_text(new)
        print("map ->", page.name)
print(f"map.svg.html written ({VW} x {VH} m, {len(svg) // 1024} KB)")
