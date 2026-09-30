# Scheffler Immobilien — redesign draft (template)

Redesign of scheffler-immo.de (old Drupal site, almost empty). Scheffler Immobilien & Hausverwaltung,
Inhaber Sven Scheffler, Kirchenstraße 4, 17192 Waren (Müritz). Phone used: 03991 64 07-0 (Das Örtliche; old site 64 07 88),
mobile 0173 6141129, info@scheffler-immo.de (old site sven@). Hours Mo–Fr 9–18 (directories). Google 3.8 (8 reviews), not shown.

Static HTML/CSS/JS, no build. Pages: index, immobilien, anbieten, hausverwaltung, kontakt, impressum, datenschutz.
`css/styles.css` (tokens at top), `js/main.js`.
- Shared blocks live in index.html between `<!-- partial:NAME -->` markers (sprite, header, contact, footer).
  Edit them in index.html only, then `python3 tools/sprite.py && python3 tools/sync_partials.py && python3 tools/map.py`.
- Logo: faithful SVG rebuild of the old GIF (`tools/logo.py`, Tinos outlines, glyphs placed at measured centres,
  crescent fitted to the pixel mask) → assets/logo.svg, logo-quer.svg (header), logo-negativ.svg (footer), mark.svg, favicon.svg.
- Palette = logo + old site: blue #0051FF, olive #9EA500, peach #FED18C, orange #EC7404 (markers only);
  ink #13213F for text/buttons, olive text #5E6300, olive-deep #3F4400 band. Accent words = solid peach block (.hl).
- Fonts: Nohemi 600 (heads; user's local font, freeware, subset → fonts/nohemi-600.woff2) + Figtree (body). Fraunces was rejected.
- Hero: the logo's five bars as an SVG clip mask over the photo (SMIL rise, waits for the preloader) + the blue crescent.
- Icons: Heroicons sprite (`tools/sprite.py` pulls from ~/Projekte/_icons) + inline Animate UI icons (.ai-* keyframes in CSS).
- Map: `tools/map.py` from tools/osm-waren.json (one Overpass export); injected between map:start/map:end.
- Listings are "Beispielobjekt" cards with data-type/data-deal; filter + empty state in main.js (URL ?art=&zweck=).
- Forms: custom select/segments/checkbox, validation, simulated send → modal. Production: Web3Forms.
- Copyright set added 2026-09-30 (LICENSE, notices, footer credit, draft tag, licence lock in main.js: LICENSED hosts).
- Preview: GitHub Pages sibagatovmihail/scheffler-immobilien (noindex).
- Header = full-bleed bar (user: "touch the borders"), --ctl-r 1rem. Card-to-card gaps --grid-gap .5rem (rule 4c).
- Form errors sit absolutely in the row gap: validation never changes form height (rule 14b).
- Bump `?v=` on CSS/JS links with every deploy that changes them.
