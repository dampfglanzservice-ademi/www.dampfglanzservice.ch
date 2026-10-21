"""Improve existing regional search snippets without creating new routes."""
import json,re
from html import escape
REGIONS=json.loads("{\"/reinigungsfirma-st-gallen/\":\"St. Gallen\",\"/reinigungsfirma-thurgau/\":\"Thurgau\",\"/reinigungsfirma-zuerich/\":\"Zürich\",\"/reinigung-appenzell-ausserrhoden/\":\"Appenzell Ausserrhoden\",\"/reinigung-appenzell-innerrhoden/\":\"Appenzell Innerrhoden\",\"/reinigung-rheintal/\":\"Rheintal\",\"/reinigung-toggenburg/\":\"Toggenburg\",\"/reinigung-werdenberg-sarganserland/\":\"Werdenberg & Sarganserland\",\"/reinigungsfirma-goldach/\":\"Goldach\",\"/reinigungsfirma-rorschacherberg/\":\"Rorschacherberg\",\"/reinigungsfirma-arbon/\":\"Arbon\",\"/reinigungsfirma-steinach/\":\"Steinach\",\"/reinigungsfirma-horn/\":\"Horn\",\"/reinigungsfirma-thal/\":\"Thal\",\"/reinigungsfirma-staad/\":\"Staad\",\"/reinigungsfirma-rheineck/\":\"Rheineck\",\"/reinigungsfirma-st-margrethen/\":\"St. Margrethen\",\"/reinigung-glarus/\":\"Glarus\",\"/reinigung-graubuenden/\":\"Graubünden\",\"/reinigung-schaffhausen/\":\"Schaffhausen\"}")
def enhance_search_snippets(document,path):
    region=REGIONS.get(path)
    home=path=='/'
    if not (region or home):return document
    title='Reinigungsfirma Rorschach | Persönliche Offerte – Ademi' if home else ('Reinigung ' if len(region)>20 else 'Reinigungsfirma ')+region+' | Offerte – Ademi'
    desc='Reinigungsfirma aus Rorschach für Wohnung, Umzug, Büro und Treppenhaus sowie Fenster, Auto und Polster. Persönliche Offerte: Arbeiten und Gesamtpreis vor Auftrag.' if home else f'Reinigung für {region}: Wohnung, Umzug, Büro, Treppenhaus und Fenster. Persönliche Offerte von Ademi aus Rorschach. Umfang, Anfahrt und Gesamtpreis vor Auftrag.'
    document=re.sub(r'<title>.*?</title>','<title>'+escape(title)+'</title>',document)
    document=re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*',lambda m:m[1]+escape(desc,quote=True),document)
    document=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m[1]+escape(title,quote=True),document)
    h1='Reinigungsfirma<br>Rorschach.' if home else 'Reinigung für '+escape(region)+'.<br>Persönlich geplant. Klar offeriert.'
    document=re.sub(r'<h1>[\s\S]*?</h1>','<h1>'+h1+'</h1>',document)
    if home:
        document=document.replace('Wohnung, Büro, Auto oder Sofa: Sie kennen Arbeiten und Gesamtpreis, bevor Sie buchen. Ihr Auto holen wir bis 15 km kostenlos ab und bringen es zurück. Ihr Sofa reinigen wir bei Ihnen zu Hause.','Wohnung, Umzug, Büro und Treppenhaus – auch Fenster, Auto und Polster. Ferki Ademi erstellt Ihre persönliche Offerte: Arbeiten und Gesamtpreis stehen vor dem Auftrag fest. Aus Rorschach für die Ostschweiz.')
    else:
        paragraph='<p class="regional-offer-details">Für Privathaushalte, Firmen und Verwaltungen: Wohnungs- und Endreinigung, Büro-, Treppenhaus- und Unterhaltsreinigung sowie Fenster und weitere Arbeiten nach Vereinbarung. Nennen Sie Ort, gewünschte Arbeiten und Rhythmus; wir klären Verfügbarkeit, Anfahrt und Gesamtpreis vor dem Auftrag.</p>'
        if 'class="regional-offer-details"' not in document:
            document=re.sub(r'(<section class="hero[\s\S]*?<p>[\s\S]*?</p>)',lambda m:m[1]+paragraph,document,count=1)
        document=re.sub(r'(<a[^>]*href="/bueroreinigung/"[^>]*>)Büroreinigung(</a>)',lambda m:m[1]+'Büro-, Treppenhaus- und Unterhaltsreinigung'+m[2],document)
    def schema(m):
        data=json.loads(m[1])
        for item in data.get('@graph',[]):
            if item.get('@type')=='WebPage':item.update(name=title,description=desc)
        return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False)+'</script>'
    return re.sub(r'<script type="application/ld\+json">([\s\S]*?)</script>',schema,document)
