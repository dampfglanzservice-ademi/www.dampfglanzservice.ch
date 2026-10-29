"""Keep the service overview enquiry routes clear without replacing SEO content."""
import re

HERO = r'''<section class="hero text-hero overview-enquiry"><div class="container hero-grid"><div class="hero-copy">
<span class="eyebrow"><i></i>Reinigung für Privatkunden &amp; Unternehmen</span><h1>Ihre Reinigungsfirma<br>für die Ostschweiz.</h1>
<p>Was dürfen wir für Sie reinigen? Nennen Sie uns Ihren Reinigungswunsch und Ort. Wir klären Umfang, Preis und Termin persönlich.</p>
<div class="overview-contact" aria-label="Kostenlos und unverbindlich anfragen">
<a class="button primary overview-main-cta" href="/offerte/">Kostenlose Offerte anfragen <span aria-hidden="true">↗</span></a>
<a class="button overview-whatsapp" href="https://wa.me/41765024998?text=Guten%20Tag%2C%20ich%20m%C3%B6chte%20eine%20Reinigung%20anfragen.%20Gew%C3%BCnschte%20Leistung%20und%20Ort%3A" target="_blank" rel="noopener"><svg class="whatsapp-mark" viewbox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 2.4a10.6 10.6 0 1 1-5.7 19.5l-.5-.3-3.4.9.9-3.3-.3-.5A10.6 10.6 0 0 1 16 5.4Z"></path><path fill="currentColor" d="M11.1 9.5c-.4 0-.7.2-1 .5-.6.7-.9 1.4-.8 2.4.2 2.7 2.7 6.6 6.7 8.3 2 .9 3.4.9 4.3.3.7-.5 1.1-1.3 1.2-2.1 0-.3-.1-.5-.4-.6l-2.8-1.3c-.3-.1-.5 0-.7.2l-1.1 1.3c-.2.2-.4.3-.7.1-1.9-.9-3.2-2.1-4.2-3.9-.2-.3-.1-.5.1-.7l.9-1.1c.2-.2.3-.5.1-.8l-1.2-2.4c-.1-.2-.3-.3-.6-.3Z"></path></svg>WhatsApp schreiben</a>
<a class="button overview-call" href="tel:+41765024998" aria-label="Dampfglanzservice-Ademi jetzt anrufen: 076 502 49 98"><svg viewbox="0 0 24 24" aria-hidden="true"><path d="M5 3 3 5c0 8 8 16 16 16l2-2-4-5-3 2-6-6 2-3Z"></path></svg>Jetzt anrufen</a>
</div>
<p class="overview-promise">Kostenlos &amp; unverbindlich · Antwort spätestens innerhalb eines Tages</p>
<p class="overview-assurance">Fixpreis vor dem Auftrag. Zusatzarbeiten nur mit Ihrer Zustimmung.</p>
<p class="overview-person"><a href="/ueber-uns/">Ihr Ansprechpartner: Ferki Ademi</a><span aria-hidden="true"> · </span><a href="/bewertungen/">Echte Kundenbewertungen ansehen ↗</a></p>
<div class="overview-selection"><h2>Welche Reinigung möchten Sie anfragen?</h2><p>Direkt zur passenden Offerte – die Leistung ist bereits ausgewählt.</p>
<div class="overview-choice-grid"><article class="overview-choice"><h3><a href="/wohnungsreinigung/">Wohnung &amp; Haus</a></h3><p>Böden, Küche und Bad – einmalig oder regelmässig.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=wohnungsreinigung" aria-label="Wohnung &amp; Haus: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/wohnungsreinigung/" aria-label="Wohnung &amp; Haus: Leistungen und Details ansehen">Details</a></div></article>
<article class="overview-choice"><h3><a href="/endreinigung-abnahmegarantie/">Umzug &amp; Endreinigung</a></h3><p>Mit vereinbarter Abnahmegarantie und Nachreinigung.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=endreinigung-abnahmegarantie" aria-label="Umzug &amp; Endreinigung: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/endreinigung-abnahmegarantie/" aria-label="Umzug &amp; Endreinigung: Leistungen und Details ansehen">Details</a></div></article>
<article class="overview-choice"><h3><a href="/bueroreinigung/">Büro &amp; Treppenhaus</a></h3><p>Reinigung für Unternehmen und Verwaltungen.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=bueroreinigung" aria-label="Büro &amp; Treppenhaus: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/bueroreinigung/" aria-label="Büro &amp; Treppenhaus: Leistungen und Details ansehen">Details</a></div></article>
<article class="overview-choice"><h3><a href="/fensterreinigung/">Fenster &amp; Glas</a></h3><p>Fenster und Rahmen nach Ihrem Bedarf.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=fensterreinigung" aria-label="Fenster &amp; Glas: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/fensterreinigung/" aria-label="Fenster &amp; Glas: Leistungen und Details ansehen">Details</a></div></article>
<article class="overview-choice"><h3><a href="/polsterreinigung/">Sofa &amp; Polster</a></h3><p>Reinigung bei Ihnen zu Hause, ohne Möbeltransport.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=polsterreinigung" aria-label="Sofa &amp; Polster: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/polsterreinigung/" aria-label="Sofa &amp; Polster: Leistungen und Details ansehen">Details</a></div></article>
<article class="overview-choice"><h3><a href="/teppichreinigung/">Teppiche</a></h3><p>Teppiche und Teppichböden reinigen lassen.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=teppichreinigung" aria-label="Teppiche: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/teppichreinigung/" aria-label="Teppiche: Leistungen und Details ansehen">Details</a></div></article>
<article class="overview-choice"><h3><a href="/matratzenreinigung/">Matratzen</a></h3><p>Material und Zustand persönlich abstimmen.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=matratzenreinigung" aria-label="Matratzen: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/matratzenreinigung/" aria-label="Matratzen: Leistungen und Details ansehen">Details</a></div></article>
<article class="overview-choice"><h3><a href="/autoreinigung/">Auto innen</a></h3><p>Basis oder Intensiv passend zu Ihrem Fahrzeug.</p><div class="overview-choice-actions"><a class="overview-request" href="/offerte/?leistung=auto" aria-label="Auto innen: kostenlose Offerte anfragen">Offerte anfragen <span aria-hidden="true">↗</span></a><a class="overview-detail" href="/autoreinigung/" aria-label="Auto innen: Leistungen und Details ansehen">Details</a></div></article></div>
<p class="overview-other">Mehrere Leistungen oder noch unsicher? <a href="/offerte/?leistung=other">Reinigungswunsch persönlich klären ↗</a></p>
</div>
</div></div></section>'''
STYLES = r'''<style id="overview-enquiry-20261029">
.landing-overview .overview-enquiry{padding:28px 0 34px}
.landing-overview .overview-enquiry .hero-copy>p{max-width:760px;line-height:1.6}
.landing-overview .overview-contact{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.landing-overview .overview-contact .button{min-height:50px;font-size:15px;gap:10px}
.landing-overview .overview-contact svg{width:22px;height:22px;flex:none}
.landing-overview .overview-whatsapp{background:#edf8f0;color:#145f32;border:1px solid #b7d8c1}
.landing-overview .overview-whatsapp svg{stroke:none}
.landing-overview .overview-call{background:#fff;border:1px solid #d8c9c4}
.landing-overview .overview-call svg{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.landing-overview .hero-copy>p.overview-promise{font-size:14px;margin-top:17px}
.landing-overview .hero-copy>p.overview-assurance{font-size:14px;margin-top:4px}
.landing-overview .hero-copy>p.overview-person{font-size:14px;margin-top:14px}
.landing-overview .overview-person a,.landing-overview .overview-other a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.landing-overview .overview-selection{margin-top:32px}
.landing-overview .overview-selection h2{font-size:clamp(24px,2.5vw,32px);letter-spacing:-.025em;line-height:1.2}
.landing-overview .overview-selection>p{font-size:15px;margin-top:10px}
.landing-overview .overview-choice-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:20px}
.landing-overview .overview-choice{border:1px solid var(--line);border-radius:14px;padding:20px;background:#fff;display:flex;flex-direction:column;min-width:0}
.landing-overview .overview-choice h3{font-size:19px;line-height:1.25;letter-spacing:-.02em}
.landing-overview .overview-choice p{font-size:14px;line-height:1.5;margin:10px 0 16px}
.landing-overview .overview-choice-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:auto}
.landing-overview .overview-request{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:8px 12px;background:#fff4f2;border:1px solid #e4c3bc;border-radius:8px;font-size:14px;font-weight:700;color:var(--accent)}
.landing-overview .overview-detail{display:inline-flex;align-items:center;min-height:44px;font-size:14px;text-decoration:underline;text-underline-offset:3px;color:var(--muted)}
.landing-overview .overview-selection>p.overview-other{margin-top:20px}
@media(max-width:1000px){.landing-overview .overview-choice-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){
.landing-overview .overview-enquiry{padding:22px 0 28px}
.landing-overview .overview-enquiry .eyebrow{margin-bottom:16px}
.landing-overview .overview-enquiry h1{font-size:32px;line-height:1.12}
.landing-overview .overview-enquiry .hero-copy>p{font-size:16px}
.landing-overview .overview-contact{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:20px}
.landing-overview .overview-main-cta{grid-column:1/-1}
.landing-overview .overview-contact .button{padding:13px 9px;font-size:14px;gap:7px}
.landing-overview .overview-contact svg{width:21px;height:21px}
.landing-overview .hero-copy>p.overview-promise,.landing-overview .hero-copy>p.overview-assurance,.landing-overview .hero-copy>p.overview-person{font-size:14px}
.landing-overview .overview-choice-grid{gap:10px}
.landing-overview .overview-choice{padding:14px}
.landing-overview .overview-choice h3{font-size:18px}
.landing-overview .overview-choice-actions{gap:4px}
.landing-overview .overview-request{padding:8px;font-size:13px}
.landing-overview .overview-person span{display:none}
.landing-overview .overview-person a{display:block;line-height:1.7}
}
</style>'''

def enhance_service_overview(document, path):
    if path != '/leistungen/':
        return document
    document = re.sub(r'<style id="overview-enquiry-20261029">[\s\S]*?</style>\s*', '', document)
    document = re.sub(r'<section class="hero [^"]*">[\s\S]*?</section>', lambda _: HERO, document, count=1)
    if 'class="landing-overview"' not in document:
        document = document.replace('<body id="top">', '<body id="top" class="landing-overview">', 1)
    return document.replace('</head>', STYLES + '\n</head>', 1)
