# Dampfglanzservice-Ademi

Mehrseitige statische GitHub-Pages-Website auf www.dampfglanzservice-ademi.ch. Aktuelle Fassung: 10. Oktober 2026, 53 Seiten einschliesslich 404; bestehende Adressen bleiben erhalten.

## Quellen und Bearbeitung

`tools/build_site.py` erzeugt alle Seiten. `tools/quote.template` enthält das Anfrageformular. `tools/additional_services.json` enthält die neuen, eigenständig beschriebenen Leistungsbereiche. `tools/profile_services.json` dokumentiert die 31 verschiedenen Leistungsbezeichnungen aus dem Google-Unternehmensprofil, am 10. Oktober 2026 im angemeldeten Profil geprüft. Verwandte Leistungen teilen sich eine passende Detailseite; es gibt keine duplizierten Seiten für Synonyme.

Die Hauptgestaltung, Farben, vier Hauptkarten auf Start- und Regionalseiten und die festen Kontaktbuttons bleiben erhalten. Die Online-Offerte steht direkt unter dem Startseiten-Hero und ist bereits im Hero verlinkt.

Vom Betreiber bereitgestellte Medien: Die optimierten Porträts `assets/ferki-ademi-weiss-480.webp` und `assets/ferki-ademi-weiss-960.webp` zeigen Ferki Ademi mit weissem Hintergrund. Das vollständige Startseiten-GIF wurde ohne Beschnitt in `assets/dampfreinigung-vollstaendig.mp4` umgewandelt (576 × 1024, rund 5,3 Sekunden). Native Videosteuerung bietet Pause und Vollbild; bei reduzierter Bewegung startet es nicht automatisch. Leistungen ohne passendes Originalfoto erscheinen als schlichte verlinkte Balken.

```sh
python3 -m pip install -r tools/requirements.txt
python3 tools/build_site.py
python3 tools/check_site.py
node tools/test_pricing.cjs
node --check script.js
python3 -m http.server 8765
```

## Kundenangebote und Preisorientierung (15. Oktober 2026)

`tools/customer_offers.py` enthält die Kundenvorteile und Paketbeschreibungen für Start-, Auto-, Polster- und Endreinigungsseite. Die Büroreinigungsseite enthält den kostenlosen, unverbindlichen Objektvergleich für Gewerbe/Verwaltungen; erste Reinigung als einzelner bezahlter Auftrag.

`pricing.js` trennt `calculate()` (freiwilliger Wunschbetrag, unverändert, auch 0) von `estimate()` (unverbindlicher Preisrahmen für Auto/Sofa). Die Preisorientierung ist ohne Kontaktdaten sichtbar. Auto: Basis oder Intensiv plus Fahrzeuggrösse; Polster: 1-5 Sitzplätze. Bei besonderer Verschmutzung, empfindlichem Material, unbekannter Fahrzone oder anderen Leistungen wird kein automatisch berechneter Preis ausgegeben. Eine Anfrage bleibt möglich.

Die Rahmen sind geschätzte Kunden-Gesamtpreise mit Standardmaterial, der gewählten Anfahrt und allfälliger MwSt.; kein Nettopreis, kein verbindlicher Festpreis und keine Margengarantie. Fahrzone: bis 15 km 0, 16-30 km 50 CHF, 31-50 km 90 CHF, einfache Fahrstrecke ab Rorschach; deckt eine An- und Rückfahrt. Gross-/Sonderaufträge und weitere Leistungen werden persönlich kalkuliert. Mindestauftrag für ein einzelnes Polsterobjekt 150 CHF. Sonderfälle dürfen die Standardpreise nicht erben. Preisrahmen und Wunschbudget bleiben in Darstellung und E-Mail-Zusammenfassung getrennt.

Kunden können eine günstigere Alternative mit geringerem Umfang und weitere Reinigungen anfragen; kein pauschaler Kombirabatt. Alle Eingaben, Zustand, Paket, Fahrzone und angezeigter Preisrahmen werden in der Anfrage zusammengefasst. Freiwillige Termine bleiben freiwillig; Änderungen setzen die Anfragezustimmung zurück. Erst schriftliche Bestätigung von Arbeiten, Gesamtpreis und Termin und anschliessende Auftragsbestätigung des Kunden führen zur Buchung. Die Nachbesserungszusage gilt für berechtigte Mängel vereinbarter ausgeführter Reinigungsarbeiten; keine Neuzustands-/Fleckenentfernungsgarantie.

Zusätzliche Prüfung:

```sh
node tools/test_estimates.cjs
```

## Kontakt und Fotos

Normaler Formular-POST an den vorhandenen FormSubmit-Empfänger info@dampfglanzservice-ademi.ch; Fotos über multipart/form-data. Bis zu drei JPG-/PNG-Bilder, zusammen höchstens 9 MB. Vorschau und Drucken senden nichts. Die Eingaben werden nicht dauerhaft im Browser gespeichert. FormSubmit kann beim Absenden eine externe Spamprüfung anzeigen. Ein erfolgreicher Browser-Versand ersetzt keine Bestätigung des tatsächlichen Eingangs im Firmenpostfach.

## SEO

Eindeutige Titel und Beschreibungen, kanonische URLs, einzelne H1, interne Links, Open Graph, strukturierte Unternehmens-, Seiten-, Leistungs- und Breadcrumb-Daten. Vollständiger Leistungskatalog im Unternehmens-Markup; Ferki Ademi ist auf der Über-uns-Seite als Person ausgezeichnet. Sitemap: 52 indexierbare Seiten. Regionale Seiten behalten eigene Auftragsinformationen. Keine erfundenen Niederlassungen, Referenzen oder Rankingversprechen. Keine bezahlte Werbung gestartet.

Google-Bewertungen bleiben eine datierte Momentaufnahme: 11 echte Einträge, 5,0/5, geprüft am 9. Oktober 2026. Kurze gekennzeichnete Originalauszüge und Quellenlinks; keine erfundenen Kalendertage und keine selbst kontrollierte AggregateRating-Auszeichnung.

## Cookie-Banner und Messung

GA4 G-479RC4GH7F, kostenlos im Google-Konto des Betreibers eingerichtet. `consent.js` lädt Google erst nach Zustimmung. Ablehnung lädt keinen Messcode. Die Auswahl wird 180 Tage lokal gespeichert und kann in der Fusszeile geändert werden. Widerruf löscht erreichbare GA-Cookies und lädt ohne Tracker neu. Die Datenschutzseite ist ohne vorherige Auswahl zugänglich.

Seitenaufrufe, click_whatsapp, click_call, click_email, inquiry_start, inquiry_submit_attempt und scroll_75. Absendeversuche sind keine bestätigten Leads, E-Mails oder Aufträge. Namen, Kontaktdaten, Nachrichten, Fotos und Preiswünsche werden nicht an Analytics gesendet. URL-Abfrageparameter, Werbesignale und optimierte automatische Analysen sind deaktiviert. Lokale Vorschauen sind als debug_mode markiert.
