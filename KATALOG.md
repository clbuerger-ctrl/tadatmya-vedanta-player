# Neuen Vortrag hinzufügen (Tādātmya Vedānta Player)

Stand V1.86. Kurz: **MP3 in Dropbox → Zeile in `katalog.txt` → Eintrag in `lesungen.js` → `texte/N.txt`**.
Schon nach Schritt 2 erscheint der Vortrag im Player (mit Titel aus dem Dateinamen).

## 1. MP3 in Dropbox
Ordner `/03 Bhakti Marga/00 Tadatmiya Vedanta` (geteilter Link, im Code `FOLDER` + `RLKEY` in `app.js`).
Dateiname wie bisher, z. B.
`Tādātmya Vedānta - Vortrag #37 zum Buch über die Philosophie der Hari Bhakta Sampradaya.mp3`
Abgespielt wird über `mediaUrl(name)` = `FOLDER?rlkey=…&preview=<Dateiname>&raw=1`
(Dropbox leitet per 302 auf dl.dropboxusercontent.com um; das Audio-Element folgt dem problemlos).

## 2. `katalog.txt` hier im Repo (wichtig!)
Der Player (`katalog.js`) lädt beim Start **`katalog.txt` aus diesem Repo** (GitHub Pages, gleicher Ursprung).
Jede MP3-Zeile, die noch nicht in `lesungen.js` steht, wird automatisch angehängt
(nummerierte Vorträge direkt hinter dem letzten Vortrag, vor den Team-Satsangs).

Format: eine Zeile pro MP3, **exakter Dropbox-Dateiname**. Optional mit `|` getrennt:

    Dateiname.mp3
    Dateiname.mp3 | Titel | #Tag1 #Tag2 | Kap. 10.3

Ohne Titel heißt ein Vortrag „Neuer Vortrag — Titel folgt“ (Tag `#Neu`), andere Dateien
bekommen den Dateinamen ohne „Tādātmya Vedānta - “ als Titel. Zeilen mit `#` am Anfang sind Kommentare.

Warum nicht direkt die `katalog.txt` in Dropbox? Der Browser darf sie nicht lesen:
`www.dropbox.com` antwortet mit einer 302-Weiterleitung **ohne** `Access-Control-Allow-Origin`,
daher blockiert der Browser den `fetch()` (CORS). Der Player (app.js) versucht Dropbox-`katalog.json`/`katalog.txt`
zwar weiterhin als letzte Quelle, verlassen kann man sich darauf aber nicht.
Die Dropbox-`katalog.txt` kann als Vorlage weitergepflegt und hierher kopiert werden.

## 3. Eintrag in `lesungen.js`
`window.LESUNGEN = [ … ];` – ein Objekt pro Vortrag, in Reihenfolge der Liste
(neuen Vortrag hinter den letzten nummerierten Vortrag, vor die Team-Einträge mit `"nr": 0`):

    {"nr": 37, "file": "Tādātmya Vedānta - Vortrag #37 zum Buch über die Philosophie der Hari Bhakta Sampradaya.mp3",
     "titel": "Kurzer Titel (Thema)", "tags": ["#Bhakti", "#Stichwort"], "kap": "Kap. 10.3"}

- `nr`: Vortragsnummer (0 = ohne Nummer, z. B. Einführung/Team)
- `file`: exakter Dropbox-Dateiname (wie in `katalog.txt`)
- `titel`: kurz, Sanskrit mit Diakritika (z. B. „Puṇya und Anugraha — Weg zum Satguru“)
- `tags`: 3–5 Hashtags ohne Umlaute/Diakritika (`#Punya`, `#Satguru`, `#Kap10`)
- `kap`: Kapitel im Buch, z. B. `"Kap. 10.2"`; leer lassen, wenn unklar

Sobald der Eintrag in `lesungen.js` steht, wird die Zeile aus `katalog.txt` automatisch ignoriert
(kein Doppel-Eintrag; Abgleich über Dateiname bzw. Vortragsnummer).

## 4. Excerpt `texte/N.txt`
Datei `texte/37.txt` (UTF-8), genau so:

    Tādātmya Vedānta Vertiefung #37 – Thema
    geschrieben von Hariharānanda

    Text …

Zeile 1 Überschrift, Zeile 2 „geschrieben von …“, dann eine Leerzeile, dann direkt der Text.
Weitere Regeln (keine Hashtags, keine „Autor:“/„Datum:“-Zeilen, keine Links …) siehe `texte/README.txt`.

## 5. Version
Bei Änderungen an JS/HTML: Version in `index.html` (Titel + `<span class="ver">`, `?v=`-Parameter
der geänderten Skripte) und Cache-Name in `sw.js` (`tv-player-vXYZ`) hochzählen.
