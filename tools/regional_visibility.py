"""Regional service navigation shared by generated pages and existing routes."""
import json
from html import escape
from urllib.parse import urlencode
from lxml import html

BASE = 'https://www.dampfglanzservice-ademi.ch'
AREAS = ['Ostschweiz', 'Kanton St. Gallen', 'Thurgau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Glarus', 'Graubünden', 'Schaffhausen']
REGIONS = [
 ('St. Gallen', 'reinigungsfirma-st-gallen'), ('Thurgau', 'reinigungsfirma-thurgau'),
 ('Appenzell Ausserrhoden', 'reinigung-appenzell-ausserrhoden'), ('Appenzell Innerrhoden', 'reinigung-appenzell-innerrhoden'),
 ('Rheintal', 'reinigung-rheintal'), ('Toggenburg', 'reinigung-toggenburg'),
 ('Werdenberg & Sarganserland', 'reinigung-werdenberg-sarganserland'),
 ('Goldach', 'reinigungsfirma-goldach'), ('Rorschacherberg', 'reinigungsfirma-rorschacherberg'),
 ('Arbon', 'reinigungsfirma-arbon'), ('Steinach', 'reinigungsfirma-steinach'), ('Horn', 'reinigungsfirma-horn'),
 ('Thal', 'reinigungsfirma-thal'), ('Staad', 'reinigungsfirma-staad'), ('Rheineck', 'reinigungsfirma-rheineck'),
 ('St. Margrethen', 'reinigungsfirma-st-margrethen'), ('Glarus', 'reinigung-glarus'),
 ('Graubünden', 'reinigung-graubuenden'), ('Schaffhausen', 'reinigung-schaffhausen'),
]

def enhance_regional_visibility(document, path, services):
 tree = html.fromstring(document)
 main = tree.xpath('//main')[0]
 for old in main.xpath('.//*[@id="regional-service-access"]'):
  old.getparent().remove(old)
 is_region = path.startswith(('/reinigungsfirma-', '/reinigung-'))
 slug = path.strip('/')
 is_service = slug in services
 if not (is_region or is_service or path in ['/', '/leistungen/', '/regionen/']):
  return document
 def links(items):
  return '<ul>' + ''.join('<li><a href="/'+s+'/">'+escape(n)+'</a></li>' for n,s in items) + '</ul>'
 if is_region:
  heading = 'Alle Reinigungsleistungen für Ihren Standort'
  text = 'Wohnung und Haus, Büro, Praxis oder Laden, Fenster und Aussenflächen, Auto, Sofa und weitere Textilien: Wählen Sie die passende Leistung und beschreiben Sie Ihren Auftrag. Wir planen den Einsatz von Rorschach aus und bestätigen Verfügbarkeit, Umfang und Gesamtpreis vor Ihrer Buchung.'
  details = '<details><summary>Alle Leistungen ansehen</summary>'+links([(label,key) for key,label in services.items()])+'</details>'
 elif is_service:
  label = services[slug]
  heading = label+' in der Ostschweiz anfragen'
  text = 'Sie suchen '+label+' in St. Gallen, im Thurgau, im Appenzellerland, im Rheintal oder im Toggenburg? Senden Sie uns Ihren Standort und die gewünschten Arbeiten. Von Rorschach aus prüfen wir auch Aufträge in Werdenberg, im Sarganserland und in der weiteren Ostschweiz. Termin und Anfahrt werden passend zu Ihrem Auftrag bestätigt.'
  details = '<details><summary>Orte und Regionen ansehen</summary>'+links(REGIONS)+'</details>'
 else:
  heading = 'Reinigung für die ganze Ostschweiz'
  text = 'Unser Standort ist Rorschach. Für Privathaushalte und Unternehmen planen wir Reinigungsaufträge in St. Gallen, im Thurgau, in beiden Appenzell, im Rheintal, Toggenburg sowie in Werdenberg und im Sarganserland. Auch weitere Orte der Ostschweiz können Sie anfragen. Wählen Sie Ihre Leistung und nennen Sie Ihre Adresse; wir bestätigen den Einsatz und die Anfahrt persönlich.'
  details = '<details><summary>Einsatzgebiete ansehen</summary>'+links(REGIONS)+'</details>'
  if path == '/regionen/':
   details += '<details><summary>Alle Reinigungsleistungen ansehen</summary>'+links([(label,key) for key,label in services.items()])+'</details>'
 message = 'Guten Tag, ich möchte '+(services[slug] if is_service else 'eine Reinigung')+' anfragen. PLZ / Ort: __. Gewünschte Arbeiten: __. Fotos sende ich mit. Bitte bestätigen Sie Gesamtpreis und einen möglichen Termin.'
 offer = '/offerte/?'+urlencode({'leistung':slug}) if is_service else '/offerte/'
 block = html.fragment_fromstring('<section class="section muted" id="regional-service-access"><div class="container content-split"><div><span class="eyebrow">Leistungen und Einsatzgebiete</span><h2>'+escape(heading)+'</h2><p>'+escape(text)+'</p>'+details+'</div><div class="note-card"><h3>Ihre Reinigung persönlich anfragen</h3><p>Bitte nennen Sie PLZ, Ort, Reinigungsumfang und Wunschtermin. Bis 15 km Fahrstrecke ab Rorschach ist die Anfahrt kostenlos; darüber hinaus werden Fahrtkosten vor dem Auftrag vereinbart.</p><div class="hero-actions"><a class="button primary" href="'+escape(offer,quote=True)+'">Offerte für meinen Standort ↗</a><a class="button secondary" href="https://wa.me/41765024998?'+escape(urlencode({'text':message}),quote=True)+'" target="_blank" rel="noopener">Fotos per WhatsApp senden ↗</a></div></div></div></section>')
 cta = main.xpath('./section[contains(concat(" ", normalize-space(@class), " "), " cta-section ")]')
 if cta:
  cta[0].addprevious(block)
 else:
  main.append(block)
 title = desc = None
 if is_service:
  label = services[slug]
  title = label+' in St. Gallen & Ostschweiz | Ademi'
  desc = label+' für Privat- und Geschäftskunden in St. Gallen, Thurgau und der Ostschweiz. Fotos und Standort senden; Umfang, Gesamtpreis und Termin vorab klären.'
 elif path == '/':
  title = 'Reinigungsfirma Ostschweiz | St. Gallen, Thurgau & Appenzell'
  desc = 'Wohnung, Umzug, Büro, Fenster, Auto und Sofa: Ihr Reinigungsservice aus Rorschach für St. Gallen, Thurgau, Appenzell und die Ostschweiz. Offerte anfragen.'
 elif path == '/leistungen/':
  title = 'Reinigungsleistungen für die Ostschweiz | Dampfglanzservice-Ademi'
  desc = 'Alle Reinigungen für Wohnung, Umzug, Büro, Praxis, Fenster, Aussenflächen, Auto und Polster in St. Gallen, Thurgau, Appenzell und der Ostschweiz.'
 elif path == '/regionen/':
  title = 'Einsatzgebiete Ostschweiz | St. Gallen, Thurgau & Appenzell'
  desc = 'Reinigungsservice für die Ostschweiz: St. Gallen, Thurgau, beide Appenzell, Rheintal, Toggenburg, Werdenberg und Sarganserland. Alle Leistungen anfragen.'
 if title:
  tree.find('.//title').text = title
  for el in tree.xpath('//meta[@property="og:title"]'): el.set('content', title)
  for el in tree.xpath('//meta[@name="description" or @property="og:description"]'): el.set('content', desc)
 for script in tree.xpath('//script[@type="application/ld+json"]'):
  data = json.loads(script.text)
  for node in data.get('@graph', []):
   if node.get('@type') == 'LocalBusiness': node['areaServed'] = list(dict.fromkeys(node.get('areaServed', [])+AREAS))
   if node.get('@type') == 'Service' and is_service:
    node['areaServed'] = AREAS
    node['serviceType'] = services[slug]
    node['description'] = desc
   if title and node.get('@id') == BASE+path+'#page':
    node['name'], node['description'] = title, desc
  script.text = json.dumps(data,ensure_ascii=False).replace('</','<\\/')
 return html.tostring(tree,encoding='unicode',pretty_print=True,doctype='<!doctype html>')
