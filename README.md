# Dampfglanzservice-Ademi

Statische, mehrseitige Website für das bestehende GitHub-Pages-Projekt. Die Domain in `CNAME` bleibt `www.dampfglanzservice-ademi.ch`; die bisherigen 20 Seitenadressen bleiben erhalten. Zusätzlich gibt es `/offerte/` und eine 404-Seite.

## Bearbeiten und prüfen

Die Seiten werden aus `tools/build_site.py` erzeugt. Dort liegen Seiteninhalte und gemeinsame Komponenten. Vorhandene Unternehmensbilder werden als optimierte WebP-Dateien verwendet. Die Sofaillustration ist als Illustration gekennzeichnet, nicht als Referenzfoto. Originalbilder bleiben erhalten. Die bisherigen Rechtstexte sind in `tools/legal_content.json` gesichert und um die Fotoanfrage ergänzt.

```sh
python3 -m pip install -r tools/requirements.txt
python3 tools/build_site.py
python3 tools/check_site.py
node tools/test_pricing.cjs
node --check script.js
python3 -m http.server 8765
```

## Preisregel

`pricing.js` enthält die separat getestete Preisregel für die Autoinnenreinigung:

`Vorschlag = max(100, (100 + Kundenbudget) / 2)`, auf zwei Nachkommastellen gerundet.

- Ohne Budget: CHF 100.
- Budget CHF 150: CHF 125.
- Budget CHF 50: CHF 100, mit Hinweis auf die Budgetüberschreitung.
- Fahrzeuggrösse, Verschmutzung, Fotos und Extras werden zur persönlichen Prüfung erfasst. Ohne freigegebene Zuschläge werden sie nicht automatisch berechnet.
- Andere Reinigungsleistungen erhalten eine individuelle Offerte; der Auto-Mindestpreis wird nicht auf sie übertragen.
- Keine KI-Fotoanalyse, automatische Buchung oder verbindliche Preiszusage.
- MWST-Behandlung, Zusatzkosten, Anfahrt und endgültiger Umfang müssen in der persönlichen Bestätigung festgelegt werden.
- Kunden können Browserwerte verändern. Die eingehende Anfrage ist untrusted input; immer anhand der Preisregel und des tatsächlichen Aufwands überprüfen. Eine verbindliche automatische Kalkulation erfordert einen serverseitigen Angebotsdienst.

## Anfragen und Fotos

Die Website verwendet den im ursprünglichen Projekt vorhandenen FormSubmit-Empfänger `info@dampfglanzservice-ademi.ch`. Die Formulare senden per normalem POST; Fotoanfragen verwenden `multipart/form-data`. Es gibt drei separate Foto-Felder, passend zur FormSubmit-Dokumentation. JPG/PNG und zusammen maximal 9 MB sind im Browser geprüft. FormSubmit hat ein eigenes 10-MB-Limit und Spam-Schutz.

Berechnen, Vorschau und Drucken senden nichts. Erst das bewusste Absenden übermittelt die Eingaben und Dateien an FormSubmit. Die Website speichert Eingaben nicht in localStorage und setzt keine eigenen Analyse- oder Marketingcookies.

Vor dem Produktivbetrieb: Eine Anfrage aus der veröffentlichten Domain senden, gegebenenfalls die FormSubmit-Aktivierung im Firmenpostfach bestätigen und Eingang inklusive aller Fotos überprüfen. Es wurde keine Testmail an das Unternehmen versendet. Die E-Mail-Zustellung wurde daher nicht als bestanden behauptet. Der Browser-Druckdialog kann je nach Umgebung eingeschränkt sein; die Druckansicht ist über Print-CSS vorbereitet.

## SEO

Alle Seiten haben eigene Titel und Beschreibungen, eine kanonische URL auf der bestehenden Domain, Open-Graph-Angaben, eine einzelne H1 und JSON-LD für Unternehmen und Seiten. Leistungsseiten erhalten Service-Markup. `sitemap.xml` enthält die indexierbaren Seiten. Der vorhandene Search-Console-Verifizierungscode ist erhalten. Kein erfundenes Bewertungs-, Kunden- oder Auszeichnungs-Markup.

Nach Freigabe: Änderungen in die bestehende GitHub-Pages-Quelle übernehmen, Veröffentlichung prüfen und die Sitemap in der Search Console einreichen. Es werden keine Rankingversprechen abgegeben.
