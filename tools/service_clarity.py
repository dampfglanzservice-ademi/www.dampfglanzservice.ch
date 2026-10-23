"""Keep existing service pages explicit and their request links valid."""
import re
HEADINGS = {
  "autopolsterreinigung": "Autopolsterreinigung",
  "badreinigung": "Badreinigung",
  "balkonreinigung": "Balkonreinigung",
  "fensterreinigung": "Fenster- und Glasreinigung",
  "fruehlingsreinigung": "Frühlingsreinigung",
  "grundreinigung": "Grundreinigung",
  "hochdruckreinigung": "Hochdruckreinigung",
  "kalkentfernung": "Kalkentfernung",
  "kombireinigung": "Reinigungen kombinieren",
  "kuechenreinigung": "Küchenreinigung",
  "ladenreinigung": "Ladenreinigung",
  "matratzenreinigung": "Matratzenreinigung",
  "moebelreinigung": "Möbelreinigung",
  "polsterreinigung": "Sofa- und Polsterreinigung",
  "praxisreinigung": "Praxisreinigung",
  "teppichreinigung": "Teppichreinigung",
  "terrassenreinigung": "Terrassenreinigung",
  "wintergartenreinigung": "Wintergartenreinigung",
  "wohnungsreinigung": "Wohnungsreinigung"
}
def enhance_service_clarity(document, path):
    slug = path.strip('/')
    heading = HEADINGS.get(slug)
    if heading:
        document = re.sub(r'<h1[^>]*>[\s\S]*?</h1>', '<h1>'+heading+'.<br>In Rorschach und der Ostschweiz.</h1>', document, count=1)
    elif path == '/leistungen/':
        document = re.sub(r'<h1[^>]*>[\s\S]*?</h1>', '<h1>Reinigungsleistungen.<br>Für Zuhause und Unternehmen.</h1>', document, count=1)
    elif path == '/regionen/':
        document = re.sub(r'<h1[^>]*>[\s\S]*?</h1>', '<h1>Reinigung in der Ostschweiz.<br>Unsere Einsatzgebiete.</h1>', document, count=1)
    document = document.replace('/offerte/?leistung=autoreinigung', '/offerte/?leistung=auto').replace('/offerte/?leistung=kombireinigung', '/offerte/?leistung=other')
    return re.sub(r'/consent\.js\?v=[^"]+', '/consent.js?v=20261023c', document)
