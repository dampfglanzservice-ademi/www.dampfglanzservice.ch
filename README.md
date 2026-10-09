# Dampfglanzservice-Ademi

Statische, mehrseitige Website für das bestehende GitHub-Pages-Projekt. Die Domain in `CNAME` bleibt `www.dampfglanzservice-ademi.ch`; die bisherigen 20 Seitenadressen bleiben erhalten. Zusätzlich gibt es `/offerte/` und eine 404-Seite.

## Bearbeiten und prüfen

Das Angebotsformular liegt in `tools/quote.template`. Die Seiten werden aus `tools/build_site.py` erzeugt. Dort liegen Seiteninhalte und gemeinsame Komponenten. Vorhandene Unternehmensbilder werden als optimierte WebP-Dateien verwendet. Das Sofa-Foto wurde mit Zustimmung des Betreibers aus der Inhaber-Galerie seines Google-Profils übernommen. Originalbilder bleiben erhalten. Die bisherigen Rechtstexte sind in `tools/legal_content.json` gesichert und um die Fotoanfrage ergänzt.

```sh
python3 -m pip install -r tools/requirements.txt
python3 tools/build_site.py
python3 tools/check_site.py
node tools/test_pricing.cjs
node --check script.js
python3 -m http.server 8765
```

## Preisregel und kostenlose Grenzen

Alle vier Leistungen besitzen definierte Online-Pakete. Die internen Regeln, recherchierten Vergleichspreise und Unterschiede sind in `tools/price-research.md` dokumentiert. Keine sichtbare Mindestpreistabelle. Budgets unter der Paketgrenze werden gesperrt, gültige Budgets ergeben den Mittelwert aus Paketgrenze und Budget. Sonderfälle benötigen eine persönliche Offerte; keine erfundenen Zuschläge. Preise gelten für das beschriebene Paket in Rorschach. Betreiber muss Umfang und Durchführbarkeit vor Annahme prüfen.

Kunden geben zwei unterschiedliche zukünftige Termine (dritter optional) an und bestätigen Preis und Leistungsumfang. Jede Änderung setzt ihr Einverständnis zurück. Das Unternehmen bestätigt Auftrag und Termin persönlich. GitHub Pages und vorhandenes FormSubmit benötigen keinen neu gebuchten kostenpflichtigen Dienst; bestehende Domainkosten bleiben bestehen.

GitHub Pages führt keine Serverprüfung aus. Browserregeln sind einsehbar und manipulierbar; versteckte UI-Werte sind keine geheimen Werte. Eingehende Anfragen vor Annahme nachrechnen. Echte Vertraulichkeit und manipulationssichere Prüfung benötigen einen anderen Serverdienst, der hier nicht aktiviert wurde.

## Anfragen und Fotos

Die Website verwendet den im ursprünglichen Projekt vorhandenen FormSubmit-Empfänger `info@dampfglanzservice-ademi.ch`. Die Formulare senden per normalem POST; Fotoanfragen verwenden `multipart/form-data`. Es gibt drei separate Foto-Felder, passend zur FormSubmit-Dokumentation. JPG/PNG und zusammen maximal 9 MB sind im Browser geprüft. FormSubmit hat ein eigenes 10-MB-Limit und Spam-Schutz.

Berechnen, Vorschau und Drucken senden nichts. Erst das bewusste Absenden übermittelt die Eingaben und Dateien an FormSubmit. Die Website speichert Eingaben nicht in localStorage und setzt keine eigenen Analyse- oder Marketingcookies.

Vor dem Produktivbetrieb: Eine Anfrage aus der veröffentlichten Domain senden, gegebenenfalls die FormSubmit-Aktivierung im Firmenpostfach bestätigen und Eingang inklusive aller Fotos überprüfen. Es wurde keine Testmail an das Unternehmen versendet. Die E-Mail-Zustellung wurde daher nicht als bestanden behauptet. Der Browser-Druckdialog kann je nach Umgebung eingeschränkt sein; die Druckansicht ist über Print-CSS vorbereitet.

## SEO

Alle Seiten haben eigene Titel und Beschreibungen, eine kanonische URL auf der bestehenden Domain, Open-Graph-Angaben, eine einzelne H1 und JSON-LD für Unternehmen und Seiten. Leistungsseiten erhalten Service-Markup. `sitemap.xml` enthält die indexierbaren Seiten. Der vorhandene Search-Console-Verifizierungscode ist erhalten. Kein erfundenes Bewertungs-, Kunden- oder Auszeichnungs-Markup.

Nach Freigabe: Änderungen in die bestehende GitHub-Pages-Quelle übernehmen, Veröffentlichung prüfen und die Sitemap in der Search Console einreichen. Es werden keine Rankingversprechen abgegeben.

## Gestaltung und regionale Suche

Weiss/Rot, feste WhatsApp-/Anrufleiste auf allen Seiten; drei Kantonsseiten St. Gallen/Thurgau/Zürich. Google-Profil mit datierter Bewertung 5.0 aus 11 Rezensionen (9. Oktober 2026), kein Live-Widget. Marketingvorbereitung und Keyword-Gruppen: tools/search-marketing.md. Sonstige Dienstleistungen erhalten Budgetanfrage ohne automatischen Fixpreis. Keine Werbung gestartet.

## Bewertungen und weitere Ostschweizer Gebiete

36 Seiten: zusätzliche regionale Seiten für Appenzell Ausserrhoden/Innerrhoden, Schaffhausen, Glarus, Graubünden, Rheintal, Toggenburg und Werdenberg/Sarganserland. Jede Seite behandelt eigene Auftragsfragen. Keine erfundenen Niederlassungen, Referenzen oder Anfahrtsversprechen. Kombireinigung kann individuell angefragt werden. Weisse Fusszeile, optimiertes WhatsApp-Symbol und leichte perspektivische Effekte; reduzierte Bewegung wird berücksichtigt.

`tools/reviews.json`: alle 11 sichtbaren Einträge mit Namen, relativer Google-Zeitangabe und Quellenlink; 10 kurze Originalauszüge mit zusammen 25 Wörtern, ein Eintrag ohne Text. Keine vollständige Kopie längerer fremder Rezensionen, keine erfundenen Kalenderdaten. Die datierte Momentaufnahme wird nicht live aktualisiert.

## Qualitätsrunde: Offertenablauf

Das Formular führt in drei Schritten durch Leistung, Preis/Fotos und Kontakt/Termine. Vorwärts wird nur bei gültigen Feldern des aktuellen Schritts gewechselt; zurück bleiben Angaben erhalten. Sonderverschmutzung und auswärtige Einsätze können eine persönliche Offerte mit Budgetwunsch erhalten, ohne die Paketgrenze zu umgehen. Leistungs-/Ortsänderungen widerrufen die vorherige Zustimmung. Die Druckübersicht enthält nun auch Auftragsbeschreibung und gewählten Ort. Preiscode lädt nur auf der Offertenseite. Eine neue Projektseite zeigt vorhandene echte Vorher-/Nachher-Aufnahmen und Fotohinweise.

Autorisierter Versandtest am 9. Oktober 2026: FormSubmit zeigte `Check Your Email` und meldete eine notwendige Formularaktivierung. Laut Dienst wurde die Aktivierungs-E-Mail an info@dampfglanzservice-ademi.ch gesendet. Eingang und Aktivierung müssen vom Inhaber bestätigt werden; die Zustellung der eigentlichen Offerte ist noch nicht nachgewiesen. Keine Veröffentlichung erfolgt.
