"""Present one primary enquiry action and quiet direct-contact alternatives."""
import re

PATHS = {'/leistungen/', '/autoreinigung/', '/wohnungsreinigung/', '/endreinigung-abnahmegarantie/', '/bueroreinigung/', '/fensterreinigung/', '/polsterreinigung/', '/matratzenreinigung/', '/teppichreinigung/'}

STYLES = r'''<style id="calm-landing-contact-20261029">
.landing-contact{margin-top:22px}
.landing-contact .landing-contact-primary{display:inline-flex;min-height:48px;font-size:15px;padding:14px 22px;border-radius:10px;box-shadow:0 2px 5px #39201c14;transform:none;transition:background .2s}
.landing-contact .landing-contact-primary:hover{box-shadow:0 2px 5px #39201c14;transform:none}
.landing-contact-alternatives{display:flex;align-items:center;flex-wrap:wrap;gap:6px 20px;margin-top:9px}
.landing-contact-alternatives>span{font-size:13px;color:var(--muted)}
.landing-contact-alternatives a{display:inline-flex;align-items:center;gap:7px;min-height:44px;font-size:15px;font-weight:600;text-decoration:underline;text-underline-offset:4px;text-decoration-color:#d9cbc6;box-shadow:none}
.landing-contact-alternatives svg{width:21px;height:21px;flex:none}
.landing-contact-whatsapp{color:#145f32}
.landing-contact-whatsapp svg{stroke:none}
.landing-contact-call svg{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.hero-copy>p.landing-reviews-link{font-size:14px;margin-top:8px}
.landing-reviews-link a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.landing-contact-options{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:40}
.landing-contact-options>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:44px;padding:10px 17px;border:1px solid #dfd1cc;border-radius:24px;background:#fff;color:var(--ink);font-size:14px;font-weight:600;box-shadow:0 2px 10px #39201c12}
.landing-contact-options>summary::-webkit-details-marker{display:none}
.landing-contact-options[open]>summary{border-color:var(--accent)}
.landing-contact-options>.quick-contact{position:absolute;left:auto;right:0;bottom:calc(100% + 10px);display:flex;flex-direction:column;align-items:stretch;gap:6px;min-width:170px;padding:10px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 5px 18px #39201c18}
.landing-contact-options:not([open])>.quick-contact{display:none}
.landing-contact-options .quick-contact a{width:auto;height:auto;min-height:46px;justify-content:flex-start;gap:10px;padding:10px 14px;border-radius:8px;box-shadow:none;transform:none}
.landing-contact-options .quick-contact a>span:not(.interaction-spark){display:inline}
.landing-contact-options .quick-contact svg{width:22px;height:22px}
.landing-overview .overview-request{background:none;border:0;border-radius:0;padding:0;box-shadow:none;text-decoration:underline;text-underline-offset:4px}
.landing-overview .overview-choice-actions{gap:8px 14px}
@media(max-width:600px){
.landing-contact .landing-contact-primary{width:100%;font-size:15px}
.landing-contact-alternatives{gap:4px 18px}
.landing-contact-alternatives>span{flex-basis:100%;margin-top:2px}
.landing-contact-alternatives a{font-size:15px}
}
@media print{.landing-contact-options{display:none}}
</style>'''

def _enhance_primary_contacts(document, path):
    if path == '/offerte/':
        return enhance_quote_contacts(document)
    if path not in PATHS:
        return document
    document = re.sub(r'<style id="calm-landing-contact-20261029">[\s\S]*?</style>\s*', '', document)
    hero_match = re.search(r'<section class="hero [^"]*">[\s\S]*?</section>', document)
    if not hero_match:
        return document
    hero = hero_match.group(0)
    if 'class="landing-contact"' not in hero:
        actions = re.search(r'<div class="(?:hero-actions|overview-contact)"[^>]*>[\s\S]*?</div>', hero)
        if not actions:
            return document
        primary = re.search(r'<a\b([^>]*class="[^"]*\bprimary\b[^"]*"[^>]*)>([\s\S]*?)</a>', actions.group(0))
        whatsapp = re.search(r'<a\b([^>]*href="https://wa\.me/[^"]*"[^>]*)>[\s\S]*?</a>', actions.group(0))
        if not primary or not whatsapp:
            return document
        primary_href = re.search(r'href="([^"]+)"', primary.group(1)).group(1)
        whatsapp_href = re.search(r'href="([^"]+)"', whatsapp.group(1)).group(1)
        primary_text = re.sub(r'<span[\s\S]*?</span>', '', primary.group(2)).strip()
        wa_svg_match = re.search(r'<a class="quick-whatsapp"[\s\S]*?(<svg[\s\S]*?</svg>)', document)
        call_svg_match = re.search(r'<a class="quick-call"[\s\S]*?(<svg[\s\S]*?</svg>)', document)
        wa_svg = wa_svg_match.group(1) if wa_svg_match else ''
        call_svg = call_svg_match.group(1) if call_svg_match else ''
        replacement = ('<div class="landing-contact">'
            '<a class="button primary landing-contact-primary" href="' + primary_href + '">' + primary_text + '</a>'
            '<div class="landing-contact-alternatives" aria-label="Alternativ persönlich Kontakt aufnehmen"><span>Oder direkt:</span>'
            '<a class="landing-contact-whatsapp" href="' + whatsapp_href + '" target="_blank" rel="noopener">' + wa_svg + 'WhatsApp</a>'
            '<a class="landing-contact-call" href="tel:+41765024998" aria-label="Dampfglanzservice-Ademi anrufen: 076 502 49 98">' + call_svg + 'Anrufen</a>'
            '</div></div>')
        hero = hero.replace(actions.group(0), replacement, 1)
        def retain_review(match):
            links = re.findall(r'<a\b[^>]*href="/bewertungen/"[^>]*>[\s\S]*?</a>', match.group(0))
            return '<p class="landing-reviews-link">' + ' '.join(links) + '</p>' if links else ''
        hero = re.sub(r'<p class="(?:hero-direct-call|specialist-direct-contact)">[\s\S]*?</p>', retain_review, hero)
        document = document[:hero_match.start()] + hero + document[hero_match.end():]
    if 'class="landing-contact-options"' not in document:
        floating = re.search(r'<nav class="quick-contact" aria-label="Direktkontakt">[\s\S]*?</nav>', document)
        if floating:
            widget = '<details class="landing-contact-options"><summary>Kontakt</summary>' + floating.group(0) + '</details>'
            document = document.replace(floating.group(0), widget, 1)
    return document.replace('</head>', STYLES + '\n</head>', 1)

FORM_STYLES = r'''<style id="calm-quote-20261029">
.quote-heading .form-direct-contact,.quote-step .form-direct-contact{gap:8px 22px;margin:10px 0 8px}
.quote-heading .form-direct-contact a,.quote-step .form-direct-contact a{min-height:44px;padding:4px 0;width:auto;height:auto;background:none;border:0;border-radius:0;box-shadow:none;transform:none;color:var(--ink);font-size:15px;text-decoration:underline;text-underline-offset:4px}
.quote-heading .form-direct-contact .quick-whatsapp,.quote-step .form-direct-contact .quick-whatsapp{color:#145f32}
.form-direct-contact svg{width:21px;height:21px}
#quote-form .fine-print,#quote-form .upload-zone>p{font-size:14px;line-height:1.6}
#quote-form .field label,#quote-form .photo-inputs label{font-size:14px}
#quote-form input:not([type=checkbox]):not([type=file]),#quote-form select,#quote-form textarea{font-size:16px}
#quote-form .upload-zone{text-align:left}
#quote-form .photo-inputs{gap:16px}
#quote-form .photo-inputs input{font-size:14px;max-width:100%}
#quote-form .button{box-shadow:0 2px 5px #39201c14;transform:none}
#quote-form .consent span{font-size:14px;line-height:1.6}
#quote-form #send-offer{font-size:15px;min-height:48px}
#contact-choice-help{font-size:15px;line-height:1.6;margin:12px 0 18px}
.quote-progress span{font-size:12px}
@media(max-width:600px){.quote-heading{padding-top:22px}.quote-heading p{font-size:15px;line-height:1.65}.quote-progress{padding-top:18px}.quote-section{padding-top:22px}}
</style>'''

def enhance_quote_contacts(document):
    document = re.sub(r'<style id="calm-quote-20261029">[\s\S]*?</style>\s*', '', document)
    document = re.sub(r'(<section class="quote-heading">[\s\S]*?<h1>[\s\S]*?</h1>\s*)<p>[\s\S]*?</p>', r'\1<p>Ihre Anfrage ist kostenlos und unverbindlich. Für Auto und Sofa sehen Sie vorab einen Preisrahmen. Für andere Reinigungen erstellen wir Ihre persönliche Offerte. Antwort spätestens innerhalb eines Tages.</p>', document, count=1)
    document = document.replace('Bitte nennen Sie Ihre E-Mail-Adresse oder Telefonnummer. Eine Kontaktmöglichkeit genügt; beides ist nicht nötig.', 'Wie dürfen wir Sie erreichen? E-Mail oder Telefon genügt.')
    document = document.replace('<h3>Zeigen Sie uns den Zustand.</h3>', '<h3>Fotos hinzufügen · freiwillig</h3>')
    return document.replace('</head>', FORM_STYLES + '\n</head>', 1)

SITE_STYLES = r'''<style id="calm-site-contact-20261029">
.hero-actions .button.primary{box-shadow:0 2px 5px #39201c14;transform:none}
.hero-actions a[href*="wa.me"]{display:inline-flex;align-items:center;min-height:44px;padding:6px 0;background:none;border:0;box-shadow:none;transform:none;color:#145f32;font-size:15px;text-decoration:underline;text-underline-offset:4px}
.hero-actions a[href*="wa.me"] span[aria-hidden]{display:none}
@media(max-width:600px){.hero-actions{gap:8px 18px}.hero-actions a[href*="wa.me"]{width:auto}}
</style>'''

def enhance_landing_contacts(document, path):
    document = _enhance_primary_contacts(document, path)
    if path in PATHS or path == '/offerte/':
        return document
    document = re.sub(r'<style id="calm-landing-contact-20261029">[\s\S]*?</style>\s*', '', document)
    document = re.sub(r'<style id="calm-site-contact-20261029">[\s\S]*?</style>\s*', '', document)
    if 'class="landing-contact-options"' not in document:
        floating = re.search(r'<nav class="quick-contact" aria-label="Direktkontakt">[\s\S]*?</nav>', document)
        if floating:
            document = document.replace(floating.group(0), '<details class="landing-contact-options"><summary>Kontakt</summary>' + floating.group(0) + '</details>', 1)
    return document.replace('</head>', STYLES + SITE_STYLES + '\n</head>', 1)
