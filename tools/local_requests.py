"""Improve request paths on the three existing priority pages only."""
import re
from html import escape
from urllib.parse import quote


def enhance_local_requests(document, path):
    regions = {'/reinigungsfirma-arbon/': 'Arbon', '/reinigungsfirma-goldach/': 'Goldach'}
    region = regions.get(path)
    if not region and path != '/':
        return document
    place = region or 'Rorschach'
    message = (f'Guten Tag, ich möchte eine Reinigung in {place} anfragen. '
               'Objekt und Adresse: __. Gewünschte Arbeiten: __. '
               'Einmalig oder regelmässig: __. Wunschtermin: __. '
               'Bisherige Reinigungskosten und Verbesserungswünsche (falls vorhanden): __. '
               'Bitte erstellen Sie mir eine unverbindliche Offerte mit Gesamtpreis.')
    whatsapp = 'https://wa.me/41765024998?text=' + quote(message, safe='')
    hero_pattern = r'(<section class="hero[\s\S]*?</section>)'
    def improve_hero(match):
        hero = match[0]
        if region:
            hero = re.sub(r'<h1>[\s\S]*?</h1>', '<h1>Reinigungsfirma für '+region+'.<br>Für Zuhause und Betrieb.</h1>', hero, count=1)
            intro = (f'<p>Reinigung in {region} für Wohnungen, Büros und Liegenschaften: '
                     'Wir übernehmen einzelne Arbeiten oder Ihr gesamtes vereinbartes Reinigungspaket. '
                     'Wohnungs- und Endreinigung, Treppenhäuser, Fenster und weitere Leistungen stimmen wir persönlich mit Ihnen ab.</p>')
            detail = (f'<p class="regional-offer-details">Für Firmen und Verwaltungen in {region}: '
                      'Nennen Sie uns Ihre bisherigen Reinigungsleistungen, Kosten und Wünsche. '
                      'Wir vergleichen den Umfang und offerieren einen passenden Reinigungsplan mit klaren Aufgaben, Intervall und Gesamtpreis. '
                      '<a href="/bueroreinigung/#objektvergleich">So funktioniert der unverbindliche Objektvergleich</a>.</p>')
            hero = re.sub(r'<p>[\s\S]*?</p>\s*<p class="regional-offer-details">[\s\S]*?</p>', intro+detail, hero, count=1)
            hero = hero.replace('>Offerte anfragen <span', '>Offerte für '+region+' <span', 1)
        hero = re.sub(r'<a class="button secondary" href="(?:tel:[^"]*|https://wa\.me/[^"]*)">[\s\S]*?</a>',
                      '<a class="button secondary" style="display:inline-flex" href="'+escape(whatsapp, quote=True)+'" target="_blank" rel="noopener">Auftrag per WhatsApp besprechen <span aria-hidden="true">↗</span></a>', hero, count=1)
        return hero
    document = re.sub(hero_pattern, improve_hero, document, count=1)
    if region:
        note = ('<div class="note-card"><h3>Ihre Reinigung passend offeriert</h3>'
                '<ul><li>Objektadresse, Fläche und gewünschte Arbeiten</li>'
                '<li>Einmaliger Auftrag oder gewünschter Reinigungsrhythmus</li>'
                '<li>Bisherige Leistungen und Kosten, sofern vorhanden</li>'
                '<li>Was fehlt oder künftig besser laufen soll</li></ul>'
                '<p>Sie können das gesamte Reinigungspaket oder einzelne Leistungen anfragen. '
                'Umfang, Anfahrt und Gesamtpreis bestätigen wir vor dem Auftrag.</p>'
                '<a class="button primary" href="/offerte/">Offerte für '+region+' anfragen <span aria-hidden="true">↗</span></a></div>')
        document = re.sub(r'<div class="note-card">[\s\S]*?</div>', note, document, count=1)
    else:
        document = document.replace(
            'Wohnung, Auto, Polster und mehr – finden Sie Ihre passende Reinigung. Für Verwaltungen und Gewerbe: <a href="/bueroreinigung/#objektvergleich">ein Objekt kostenlos vergleichen und danach über einen Ersteinsatz entscheiden</a>.',
            'Reinigung für Zuhause, Firmen und Liegenschaften in Rorschach. Auch für <a href="/reinigungsfirma-goldach/">Reinigungsaufträge in Goldach</a> und <a href="/reinigungsfirma-arbon/">Reinigungsaufträge in Arbon</a> sind wir Ihr Ansprechpartner. Für Verwaltungen und Gewerbe: <a href="/bueroreinigung/#objektvergleich">bisherige Leistungen, Kosten und Wünsche für Ihr gesamtes Reinigungspaket vergleichen</a>.')
    return document
