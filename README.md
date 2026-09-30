# Scheffler Immobilien & Hausverwaltung — Designentwurf

**© 2026 Mykhailo Sibahatov. Alle Rechte vorbehalten.** Der Entwurf dient ausschließlich zur Ansicht.
Kopieren, Veröffentlichen, Betreiben auf einer eigenen Domain oder Weiterverwenden nur mit schriftlicher
Vereinbarung, siehe [LICENSE](LICENSE). Inhalte, Name und Logo des Unternehmens bleiben Eigentum von
Scheffler Immobilien & Hausverwaltung.

Vorschau: https://sibagatovmihail.github.io/scheffler-immobilien/

Neugestaltung der Website von Scheffler Immobilien & Hausverwaltung, Inhaber Sven Scheffler,
Kirchenstraße 4, 17192 Waren (Müritz). Die bisherige Seite (scheffler-immo.de, Drupal) ist
weitgehend leer. Nur zur Ansicht: `index.html` im Browser öffnen oder `python3 -m http.server`
(statisch, kein Build).

## Seiten

| Seite | Inhalt |
|---|---|
| `index.html` | Hero mit den fünf Logo-Balken als Bildmaske und Schnellsuche (Kaufen/Mieten + Objektart), vier Objektarten, aktuelle Angebote, Verkaufen/Vermieten + Hausverwaltung, Über uns mit dem Originalfoto des Büros, Suchauftrag, Kontakt mit Karte |
| `immobilien.html` | Alle Angebote mit Filter (Objektart × Kaufen/Mieten, per URL verlinkbar). Wenn nichts passt: Hinweis „Aktuell keine … im Angebot“ mit Suchauftrag (Text der alten Seite) |
| `anbieten.html` | Für Eigentümer (alte Seite „Anbieten“ war 404): Ablauf in vier Schritten, Unterlagen, Formular |
| `hausverwaltung.html` | Neu (der Firmenname in den Verzeichnissen lautet „& Hausverwaltung“): Leistungen, FAQ, Anfrage |
| `kontakt.html` | Anfrage/Suchauftrag mit den Feldern der alten Seite + Anfahrt (Karte, Bürozeiten live) |
| `impressum.html`, `datenschutz.html` | Impressum übernommen und auf DDG/MStV aktualisiert; Datenschutz als Platzhalter |

## Was ist neu

- **Logo** originalgetreu als SVG nachgebaut (`tools/logo.py`, vermessen am GIF der alten Seite): Balken, Bogen,
  „Scheffler“ / „Immobilien“. Dazu eine Querversion für den Header und eine Negativversion für den Footer.
- **Farben** aus Logo und alter Seite: Blau #0051FF, Oliv #9EA500, Pfirsich #FED18C, Orange #EC7404 als Akzent.
  Für Text und Flächen dunklere, kontrastsichere Töne (Navy #13213F, Oliv-Text #5E6300).
- **Karte** der Altstadt als eigenes SVG aus OpenStreetMap-Daten (`tools/map.py`), ohne Google-Einbettung, keine Cookies.
- **Icons:** Heroicons und Animate UI (animiert per CSS bei Hover), aus der lokalen Bibliothek `~/Projekte/_icons`.
- Eigene Formularelemente (Dropdown, Segmente, Checkbox); Fehlermeldungen verändern die Formulargröße nicht.
- Header als durchgehende Leiste über die volle Breite; auf dem Handy wird daraus das Menü (mit Scroll-Sperre).

## Offene Punkte (mit dem Kunden klären)

- **Telefon/E-Mail:** alte Seite 03991 64 07 88 und sven@scheffler-immo.de; Das Örtliche nennt 03991 64 07-0
  und info@scheffler-immo.de (verwendet). Mobil 0173 614 11 29 aus dem Impressum.
- **Bürozeiten** Mo–Fr 9–18 Uhr stammen aus Branchenverzeichnissen.
- **Angebote:** Beispielobjekte, im Livebetrieb per OpenImmo/ImmoScout24-Export aus der Maklersoftware.
- **Hausverwaltung:** Leistungsumfang (Miet-/WEG-Verwaltung) ist angenommen.
- **Fotos:** Porträt von Sven Scheffler (bisher Monogramm), Fotos des Büros in besserer Auflösung
  (das Originalfoto ist nur 220 × 177 px), eigene Objektfotos.
- Formularversand (vorbereitet für Web3Forms), vollständige Datenschutzerklärung.

## Bilder, Schriften, Lizenzen

Beispielbilder von Unsplash, auf der Seite als „Beispielbild“ markiert: Wolfgang Weiser (hero-seestadt),
Aleksei Tertychnyi (stadt-am-see), Cosmin Gurau (haus-am-see), laura adai (wohnung-hell), Danilo Rios (wohnzimmer),
myHQ Workspaces (buero), Agata Bak-Geerinck (grundstueck), Jacob Bentzinger (steg), Dimitri Frixou (mehrfamilienhaus),
Jakub Żerdzicki (schluessel), Prydumano Design (kueche), Matthias Reumann (altbau).
Büro-Foto (`buero-kirchenstrasse.jpg`): von der bisherigen Website, © Sven Scheffler.

Schriften: Nohemi SemiBold (Titel, Freeware von Rajesh Rajput, kommerziell nutzbar) und Figtree (SIL OFL), lokal eingebunden. Logo-Schrift Tinos (Apache 2.0, nur im Werkzeug).
Heroicons (MIT), Animate UI Icons (MIT + Commons Clause). Karte © OpenStreetMap-Mitwirkende (ODbL).
