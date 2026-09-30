"""Rebuild the Scheffler Immobilien logo as SVG, text converted to outlines.

Source: the logo GIF of the old website (/files/ad_the-morning-after_logo.gif,
146 x 150 px). Every coordinate below is measured on that image, in its pixels;
the SVGs keep that coordinate system.

  - five bars, 8 px wide, bottoms at y 107: peach #FED18C at x 45 / 57 / 83 / 95
    (tops 33 / 17 / 17 / 33), the olive #9EA500 centre bar at x 70 runs to the top
  - a blue #0051FF crescent sweeps across the bars in front, left tip at (11, 81),
    right tip at (118, 61), with a thin white halo where it crosses them
  - a 1 px blue rule at y 111 across the full width
  - "Scheffler" serif (Times-like, here Tinos), blue, letter-spaced, x 11-145, baseline 134
  - "Immobilien" serif, olive, x 36-111, baseline 149.5

    python3 tools/logo.py  ->  assets/logo.svg, assets/logo-negativ.svg,
                                assets/mark.svg, assets/favicon.svg, assets/logo-quer.svg
Needs tools/fonts/Tinos-Regular.ttf (Apache 2.0, metric clone of Times).
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent.parent
BLUE, OLIVE, PEACH = "#0051FF", "#9EA500", "#FED18C"

font = TTFont(ROOT / "tools/fonts/Tinos-Regular.ttf")
cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]


def outline(text, centres, baseline, cap):
    """Path for `text`: cap height `cap` sets the size, each glyph's ink is centred on its measured x."""
    b = BoundsPen(gs); gs[cmap[ord("H")]].draw(b); s = cap / b.bounds[3]
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    for ch, cx in zip(text, centres):
        g = cmap[ord(ch)]; bp = BoundsPen(gs); gs[g].draw(bp)
        mid = (bp.bounds[0] + bp.bounds[2]) / 2
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx - mid * s, baseline)))
    return pen.getCommands()


BARS = [(45, 33, PEACH), (57.5, 16.5, PEACH), (70, 0, OLIVE), (82.5, 16.5, PEACH), (95, 33, PEACH)]
# fitted to the GIF's blue mask (least squares on the anti-aliased coverage)
SWOOSH = ("M10 80.6C24 90.9 37.5 93.9 60.1 94.2C95.8 95.1 126 83 118.8 62"
          "C114.3 77.4 106.3 82.4 76.8 87.2C52.4 90.7 26 86.8 10 80.6Z")


def mark(halo="#fff", bars=True):
    rects = "".join(f'<rect x="{x}" y="{y}" width="8" height="{107 - y}" fill="{c}"/>' for x, y, c in BARS)
    return (rects + f'<path d="{SWOOSH}" fill="none" stroke="{halo}" stroke-width="3" stroke-linejoin="round"/>'
            f'<path d="{SWOOSH}" fill="{BLUE}"/>')


NAME = outline("Scheffler", [16, 33.5, 50, 66.5, 83, 95, 105, 118.5, 133], 134, 17.3)
SUB = outline("Immobilien", [36.5, 46, 58, 69, 77.3, 84, 89.5, 94, 100.5, 108.5], 150, 10.8)


def svg(view, body, title="Scheffler Immobilien"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')


full = (mark() + f'<rect x="0" y="110.5" width="146" height="1" fill="{BLUE}"/>'
        f'<path d="{NAME}" fill="{BLUE}"/><path d="{SUB}" fill="{OLIVE}"/>')
(ROOT / "assets/logo.svg").write_text(svg("0 0 146 152", full))

neg = (mark(halo="#16213F") + '<rect x="0" y="110.5" width="146" height="1" fill="#fff" opacity=".5"/>'
       f'<path d="{NAME}" fill="#fff"/><path d="{SUB}" fill="{PEACH}"/>')
(ROOT / "assets/logo-negativ.svg").write_text(svg("0 0 146 152", neg))

# the mark alone, square box around bars + crescent (x 9-121, y 0-112)
(ROOT / "assets/mark.svg").write_text(svg("8 -2 114 114", mark()))
(ROOT / "assets/favicon.svg").write_text(svg(
    "-6 -12 142 142", '<rect x="-6" y="-12" width="142" height="142" rx="30" fill="#fff"/>' + mark()))

# horizontal lock-up for the header: mark left, name + rule + sub right, same outlines
# the stacked text block (x 10-137, y 115-150) set beside the mark at 2x, no rule
quer = (mark() + '<g transform="translate(110 -211) scale(2)">'
        f'<path d="{NAME}" fill="{BLUE}"/><path d="{SUB}" fill="{OLIVE}"/></g>')
(ROOT / "assets/logo-quer.svg").write_text(svg("8 -2 378 112", quer))
print("logo.svg, logo-negativ.svg, mark.svg, favicon.svg, logo-quer.svg written")
