(()=>{
 'use strict';
 const ID='G-479RC4GH7F',ADS='AW-17797086557',KEY='dampfglanz-consent-v1',MAX_AGE=180*86400000;
 const dialog=document.getElementById('cookie-dialog'),toggle=document.getElementById('cookie-analytics');
 if(!dialog||!toggle)return;
 let consent=null,loaded=false,analyticsStarted=false,adsStarted=false,previousFocus=null,needsAdsChoice=false,needsOfflineChoice=false;
 const testMode=new URL(location.href).searchParams.get('dgs_test')==='1';
 const adsLabel=document.createElement('label');adsLabel.className='cookie-option';adsLabel.innerHTML='<input type="checkbox" id="cookie-ads"> Anfragenmessung mit Google Ads erlauben';toggle.closest('label').after(adsLabel);
 const adsToggle=adsLabel.querySelector('input');
 const offlineLabel=document.createElement('label');offlineLabel.className='cookie-option';offlineLabel.innerHTML='<input type="checkbox" id="cookie-ads-offline"> Anfragen bis zu Offerte und Auftrag Google Ads zuordnen';adsLabel.after(offlineLabel);
 const offlineToggle=offlineLabel.querySelector('input');
 const syncOfflineChoice=()=>{offlineToggle.disabled=!adsToggle.checked;if(!adsToggle.checked)offlineToggle.checked=false;};
 adsToggle.addEventListener('change',syncOfflineChoice);
 document.getElementById('cookie-title').textContent='Cookies & Anfragenmessung';
 document.getElementById('cookie-description').textContent='Wir speichern Ihre Cookie-Auswahl. Optional verwenden wir Google Analytics für Statistik und Google Ads zur Zuordnung erfolgreicher Formularanfragen zu Anzeigenklicks. Dabei werden Nutzungs- und Gerätedaten an Google übermittelt, möglicherweise auch in die USA. Alle Formulare funktionieren auch ohne Messung.';
 offlineLabel.nextElementSibling.textContent='Die zusätzliche Offerten- und Auftragszuordnung ist freiwillig und setzt Anzeigenmessung voraus: Nur dann begleitet eine vorhandene Google-Klickkennung (GCLID, GBRAID oder WBRAID) Ihre abgesendete Anfrage an Basin. Später können Klickkennung, zufällige Vorgangskennung, Bearbeitungsstufe, Zeitpunkt und bei einem Auftrag dessen Betrag in CHF an Google Ads übermittelt werden. Keine Namen, Kontaktdaten, Fotos oder Nachrichten an Google; keine Werbepersonalisierung. Beim Öffnen von WhatsApp kann eine kurze Referenz mit Kampagnen- und Keyword-Kennung im vorbereiteten Nachrichtentext an WhatsApp übergeben werden. Die Google-Klickkennung bleibt dabei auf der Website. Erst eine tatsächlich eingegangene Nachricht wird als Anfrage geprüft. Alle Kontaktwege funktionieren auch ohne diese Zuordnung.';

 // Keep the first visit usable while all optional measurement stays off.
 const shortDescription=document.createElement('p');shortDescription.id='cookie-compact-description';shortDescription.className='cookie-compact-description';
 shortDescription.textContent='Statistik und Anzeigenzuordnung mit Google sowie Herkunftsreferenzen für WhatsApp sind freiwillig (Daten ggf. in die USA). Ohne Zustimmung bleibt die Messung aus.';
 document.getElementById('cookie-description').before(shortDescription);
 const configureButton=document.createElement('button');configureButton.type='button';configureButton.id='cookie-configure';configureButton.className='button secondary cookie-configure';configureButton.textContent='Einstellungen';configureButton.addEventListener('click',()=>open(false));document.getElementById('cookie-accept').before(configureButton);
 const noticeStyle=document.createElement('style');noticeStyle.textContent=`
.cookie-compact-description,.cookie-configure{display:none}
#cookie-dialog.dgs-consent-compact[open]{position:fixed;inset:auto 16px 16px auto;width:min(560px,calc(100% - 32px));max-height:calc(100dvh - 32px);margin:0;z-index:1000;border-radius:16px;overflow:auto;box-shadow:0 6px 30px #39201c26}
#cookie-dialog.dgs-consent-compact .cookie-content{padding:14px}
#cookie-dialog.dgs-consent-compact .cookie-content>.eyebrow,#cookie-dialog.dgs-consent-compact .cookie-content>.cookie-small,#cookie-dialog.dgs-consent-compact #cookie-description,#cookie-dialog.dgs-consent-compact .cookie-content details,#cookie-dialog.dgs-consent-compact .cookie-content>a,#cookie-dialog.dgs-consent-compact #cookie-save{display:none}
#cookie-dialog.dgs-consent-compact .cookie-content h2{position:absolute;width:1px;height:1px;padding:0;margin:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
#cookie-dialog.dgs-consent-compact .cookie-compact-description{display:block;font-size:12px;line-height:1.4;margin:0 0 10px}
#cookie-dialog.dgs-consent-compact .cookie-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;gap:6px}
#cookie-dialog.dgs-consent-compact .cookie-actions .button{min-height:44px;padding:8px;font-size:12px}
#cookie-dialog.dgs-consent-compact .cookie-configure{display:flex}
@media(max-width:600px){#cookie-dialog.dgs-consent-compact[open]{inset:auto 12px 12px;width:calc(100% - 24px);max-height:calc(100dvh - 24px)}}
`;document.head.append(noticeStyle);
 const details=dialog.querySelector('details');
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.version===1&&typeof saved.analytics==='boolean'&&typeof saved.at==='number'&&Date.now()-saved.at<MAX_AGE&&saved.at<=Date.now()){needsAdsChoice=typeof saved.ads!=='boolean';needsOfflineChoice=saved.ads===true&&saved.adsOffline===true&&saved.offlineVersion!==2;consent={...saved,ads:saved.ads===true,adsOffline:saved.ads===true&&saved.adsOffline===true&&saved.offlineVersion===2};}}catch{}
 const cleanURL=value=>{try{const u=new URL(value);return u.origin+u.pathname;}catch{return '';}};
 // Preserve Google click IDs only with explicit Ads consent. Other query fields
 // (including form details and arbitrary URL values) are never sent as page URLs.
 const measurementURL=()=>{
  const page=new URL(location.origin+location.pathname);
  if(consent?.ads){
   const current=new URL(location.href);
   for(const key of ['gclid','gbraid','wbraid']){
    const value=current.searchParams.get(key);
    if(value&&/^[A-Za-z0-9._~-]{1,512}$/.test(value))page.searchParams.set(key,value);
   }
  }
  return page.href;
 };
 // Forward only our known campaign labels; never arbitrary URL parameters.
 const trafficFields=()=>{
  const fields={};
  try{
   const u=new URL(location.href);
   const campaign=u.searchParams.get('utm_campaign');
   const knownProfiles=['business_profile','gbp_autoinnenreinigung','gbp_sofareinigung','treppenhaus_unterhalt'];
   if(u.searchParams.get('utm_source')==='google'&&u.searchParams.get('utm_medium')==='organic'&&knownProfiles.includes(campaign)){
    fields.campaign_source='google';fields.campaign_medium='organic';fields.campaign_name=campaign;
   }else if(u.searchParams.get('utm_source')==='chatgpt.com'&&!['gclid','gbraid','wbraid'].some(key=>u.searchParams.has(key))){
    // An allowlisted source hint, not proof of an AI recommendation or a lead.
    fields.campaign_source='chatgpt.com';fields.campaign_medium='referral';
   }
  }catch{}
  // Returning from the form provider must not replace the original traffic source.
  try{if(new URL(document.referrer).origin==='https://formsubmit.co')fields.ignore_referrer=true;}catch{}
  return fields;
 };
 const event=(name,params={})=>{if(!testMode&&consent?.analytics&&loaded)window.gtag('event',name,{...params,send_to:ID,transport_type:'beacon'});};
 function start(){
  if(testMode||(!consent?.analytics&&!consent?.ads))return;
  if(!loaded){
   loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   window.gtag('js',new Date());
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+(consent.analytics?ID:ADS);document.head.append(script);
  }
  window['ga-disable-'+ID]=!consent.analytics;
  window.gtag('consent','update',{analytics_storage:consent.analytics?'granted':'denied',ad_storage:consent.ads?'granted':'denied',ad_user_data:consent.ads?'granted':'denied',ad_personalization:'denied'});
  const page={page_location:measurementURL(),page_referrer:cleanURL(document.referrer),allow_google_signals:false,allow_ad_personalization_signals:false};
  if(consent.analytics&&!analyticsStarted){analyticsStarted=true;window.gtag('config',ID,{...trafficFields(),...page,cookie_expires:15552000,debug_mode:location.hostname!=='www.dampfglanzservice-ademi.ch'});}
  if(consent.ads&&!adsStarted){adsStarted=true;window.gtag('config',ADS,{...page,send_page_view:false,allow_enhanced_conversions:false,conversion_linker:true,cookie_expires:15552000});}
  document.dispatchEvent(new Event('dgs:measurement-ready'));
 }
 const measuredSteps=new Set();
 window.DGSMeasurement={step:(kind,stage,test)=>{
  if(test||testMode||!consent?.analytics||!loaded||!['quote','contact'].includes(kind)||!['photos','contact'].includes(stage))return;
  const key=kind+':'+stage;if(measuredSteps.has(key))return;measuredSteps.add(key);
  event('inquiry_step_'+stage,{form_kind:kind});
 },failed:(kind,test)=>{
  if(test||!['quote','contact'].includes(kind))return;
  event('inquiry_send_failed',{form_kind:kind});
 },attempted:(kind,test)=>{
  if(test)return;
  event('inquiry_submit_attempt',{form_kind:kind});
 },completed:(kind,id,test)=>{
  if(test)return;
  if(consent?.analytics)event('inquiry_form_completed',{form_kind:kind});
  if(consent?.ads&&adsStarted)window.gtag('event','conversion',{send_to:'AW-17797086557/ac3LCInLoaYdEN36p6ZC',transaction_id:id,value:0,currency:'CHF',transport_type:'beacon'});
 }};
 function clearAnalytics(analytics=true,ads=true){
  const names=document.cookie.split(';').map(x=>x.trim().split('=')[0]).filter(x=>(analytics&&/^_ga(?:_|$)|^_gid$|^_gat/.test(x))||(ads&&/^_gcl_/.test(x)));
  const domains=['',location.hostname,'.'+location.hostname,'.'+location.hostname.split('.').slice(-2).join('.')];
  for(const name of names)for(const domain of domains)document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax; Secure';
 }
 function save(analytics,ads,adsOffline=false){
  const wasLoaded=loaded,previous=consent;consent={version:1,analytics,ads,adsOffline:ads&&adsOffline,offlineVersion:2,offlineAt:ads&&adsOffline?Date.now():null,at:Date.now()};
  try{localStorage.setItem(KEY,JSON.stringify(consent));}catch{}
  dialog.close();document.body.classList.remove('consent-open');previousFocus?.focus();
  if(wasLoaded){clearAnalytics(previous?.analytics===true&&!analytics,previous?.ads===true&&!ads);location.reload();}else start();
 }
 function open(compact=false){previousFocus=document.activeElement;if(dialog.open)dialog.close();toggle.checked=consent?.analytics===true;adsToggle.checked=consent?.ads===true;offlineToggle.checked=consent?.adsOffline===true;syncOfflineChoice();dialog.classList.toggle('dgs-consent-compact',compact);dialog.setAttribute('aria-describedby',compact?'cookie-compact-description':'cookie-description');if(compact){if(details)details.open=false;dialog.classList.remove('settings-open');dialog.show();}else{document.body.classList.add('consent-open');dialog.showModal();}}
 document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',()=>open()));
 document.getElementById('cookie-accept').addEventListener('click',()=>save(true,true,true));
 document.getElementById('cookie-reject').addEventListener('click',()=>save(false,false));
 document.getElementById('cookie-save').addEventListener('click',()=>save(toggle.checked,adsToggle.checked,offlineToggle.checked));
 dialog.addEventListener('cancel',e=>{e.preventDefault();save(false,false);});
 dialog.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.classList.contains('dgs-consent-compact')){e.preventDefault();save(false,false);}});
 document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link)return;const href=link.getAttribute('href');if(href.startsWith('tel:'))event('click_call');else if(/^https:\/\/(?:wa.me|api.whatsapp.com)\//.test(href))event('click_whatsapp');else if(href.startsWith('mailto:'))event('click_email');else if(e.isTrusted){try{const destination=new URL(href,location.href);if(destination.origin===location.origin&&/^\/offerte\/?$/.test(destination.pathname))event('click_quote');}catch{}}});
 document.querySelectorAll('form').forEach(form=>{
  // A visible form is diagnostic only, never an enquiry or an Ads conversion.
  // Record no field values. Existing analytics consent and test exclusions apply.
  if(form.matches('[data-dgs-backend="basin"]')&&'IntersectionObserver' in window){
   let viewed=false,visible=false,observer;
   const reportView=()=>{
    if(viewed||!visible||testMode||!consent?.analytics||!loaded)return;
    viewed=true;
    event('inquiry_view',{form_kind:form.id==='quote-form'?'quote':'contact'});
    observer.disconnect();
    document.removeEventListener('dgs:measurement-ready',reportView);
   };
   observer=new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=0.01);
    reportView();
   },{threshold:0.01});
   observer.observe(form);
   document.addEventListener('dgs:measurement-ready',reportView);
  }
  let started=false;
  const reportStart=()=>{
   if(started||testMode||!consent?.analytics||!loaded)return;
   started=true;event('inquiry_start',{form_kind:form.id==='quote-form'?'quote':'contact'});
  };
  form.addEventListener('input',e=>{
   // Search alone and the controller's synthetic form-level validation input are not an enquiry start.
   if(form.id==='quote-form'&&(e.target===form||e.target.id==='service-search'))return;
   reportStart();
  });
  if(form.id==='quote-form')form.addEventListener('click',e=>{
   if(!e.isTrusted)return;
   const choice=e.target.closest('button[data-service],button[data-question]');
   if(choice&&form.contains(choice))reportStart();
  });
  // Diagnose fixed field groups only: never field values or customer details.
  if(form.matches('[data-dgs-backend="basin"]')){
   const invalidSeen=new Set();
   const groups={'service':'service','package':'service','customer-place':'location','customer-name':'contact','customer-email':'contact','customer-phone':'contact','customer-contact':'contact','date-1':'date','date-2':'date','date-3':'date','budget':'budget'};
   form.addEventListener('invalid',e=>{
    const target=e.target;
    const group=groups[target.id]||(target.matches('[data-photo]')?'photo':target.matches('input[name="Datenschutz"]')?'privacy':null);
    if(!group||invalidSeen.has(group))return;invalidSeen.add(group);
    event('inquiry_invalid_'+group,{form_kind:form.id==='quote-form'?'quote':'contact'});
   },true);
  }
  // Basin submit attempts are measured by its validated handler, not defaultPrevented.
 });
 let scrolled=false;window.addEventListener('scroll',()=>{if(!scrolled&&consent?.analytics&&window.scrollY+innerHeight>=document.documentElement.scrollHeight*.75){scrolled=true;event('scroll_75');}},{passive:true});
 if(consent?.analytics||consent?.ads)start();if((!consent||needsAdsChoice||needsOfflineChoice)&&location.pathname!=='/datenschutz/')open(true);
})();

// Keep only a recognised campaign reference, after explicit Ads-measurement consent.
// For Sofa and Endreinigung, optionally retain the targeted Google Ads keyword ID.
// No click IDs, search terms, full URLs or customer details are stored here.
;(()=>{
 'use strict';
 const KEY='dgs-campaign-session-v1',CONSENT='dampfglanz-consent-v1',TTL=30*60*1000;
 const CAMPAIGNS={
  '24407255482':'Reinigung Ostschweiz',
  '24407267470':'Auto-Innenreinigung Ostschweiz',
  '24415776164':'Grundreinigung Ostschweiz',
  '24457117427':'Sofa- und Polsterreinigung',
  '24464010908':'Endreinigung mit Abgabegarantie – Suchtest'
 };
 const KEYWORD_CAMPAIGNS=new Set(['24457117427','24464010908']);
 const pageAt=Date.now();
 const validKeyword=(id,value)=>KEYWORD_CAMPAIGNS.has(id)&&typeof value==='string'&&/^[1-9]\d{0,19}$/.test(value);
 const isTest=()=>new URL(location.href).searchParams.get('dgs_test')==='1';
 const allowed=()=>{
  try{const c=JSON.parse(localStorage.getItem(CONSENT));return c?.version===1&&c.ads===true&&typeof c.at==='number'&&c.at<=Date.now()&&Date.now()-c.at<180*86400000;}catch{return false;}
 };
 const clear=()=>{try{sessionStorage.removeItem(KEY);}catch{}};
 const campaignFrom=raw=>{
  try{const u=new URL(raw);if(u.origin!==location.origin)return null;const id=u.searchParams.get('dgs_campaign');if(!Object.hasOwn(CAMPAIGNS,id))return null;
   const targets=u.searchParams.getAll('dgs_target');
   const keywords=targets.length===1?targets[0].split(':').filter(part=>part.startsWith('kwd-')):[];
   const keywordId=keywords.length===1?keywords[0].slice(4):'';
   return {id,entryPath:u.pathname,keywordId:validKeyword(id,keywordId)?keywordId:''};}catch{return null;}
 };
 const saved=()=>{
  try{const x=JSON.parse(sessionStorage.getItem(KEY));if(x?.version===1&&Object.hasOwn(CAMPAIGNS,x.id)&&typeof x.at==='number'&&x.at<=Date.now()&&Date.now()-x.at<TTL)return x;}catch{}
  clear();return null;
 };
 const capture=()=>{
  if(!allowed()){clear();return null;}
  if(isTest())return null;
  let x=saved();
  const current=campaignFrom(location.href);
  const previous=campaignFrom(document.referrer);
  const source=current||(!x?previous:null);
  if(source){
   const sameClick=x?.id===source.id&&x?.keywordId===source.keywordId&&x?.entryPath===source.entryPath;
   const keywordAt=sameClick&&Number.isFinite(x.keywordAt)?x.keywordAt:pageAt;
   x={version:1,...source,at:Date.now(),keywordAt};
   if(Date.now()-keywordAt>=TTL)x.keywordId='';
   try{sessionStorage.setItem(KEY,JSON.stringify(x));}catch{}
  }
  return x;
 };
 window.DGSCampaignAttribution={
  get:()=>{const x=capture();return x?{campaignId:x.id,campaignName:CAMPAIGNS[x.id],method:'campaign_parameter',keywordId:validKeyword(x.id,x.keywordId)&&Number.isFinite(x.keywordAt)&&x.keywordAt<=Date.now()&&Date.now()-x.keywordAt<TTL?x.keywordId:'',entryPath:typeof x.entryPath==='string'&&/^\/[a-z0-9\/-]{0,160}$/i.test(x.entryPath)?x.entryPath:''}:null;},
  clear
 };
 document.addEventListener('dgs:measurement-ready',capture);
 capture();
})();


// Optional offline attribution v2. Requires a new, explicit purpose choice.
// Store one recognised identifier for 30 minutes in this tab, never customer data.
;(()=>{
 'use strict';
 const KEY='dgs-offline-click-session-v2',OLD='dgs-offline-click-session-v1',CONSENT='dampfglanz-consent-v1',TTL=30*60*1000;
 const CAMPAIGNS=new Set(['24457117427','24464010908']),TYPES=['gclid','wbraid','gbraid'];
 const valid=x=>typeof x==='string'&&/^[A-Za-z0-9._~-]{1,512}$/.test(x);
 const clear=()=>{try{sessionStorage.removeItem(KEY);sessionStorage.removeItem(OLD);sessionStorage.removeItem('dgs-whatsapp-ref-v2');}catch{}};
 const allowed=()=>{
  try{const c=JSON.parse(localStorage.getItem(CONSENT));return c?.version===1&&c.ads===true&&c.adsOffline===true&&c.offlineVersion===2&&Number.isFinite(c.at)&&c.at<=Date.now()&&Date.now()-c.at<180*86400000&&Number.isFinite(c.offlineAt)&&c.offlineAt<=Date.now()&&Date.now()-c.offlineAt<180*86400000?c:null;}catch{return null;}
 };
 let expiredOnPage=false;
 const capture=()=>{
  const consent=allowed(),url=new URL(location.href);
  if(!consent||url.searchParams.get('dgs_test')==='1'){clear();return null;}
  if(expiredOnPage)return null;
  let raw=null;
  try{raw=JSON.parse(sessionStorage.getItem(KEY));}catch{}
  const validStored=raw?.version===2&&CAMPAIGNS.has(raw.campaignId)&&TYPES.includes(raw.clickType)&&valid(raw.clickId)&&Number.isFinite(raw.at)&&raw.at<=Date.now()&&Date.now()-raw.at<TTL&&raw.consentAt===consent.offlineAt;
  let saved=validStored?raw:null;
  const present=TYPES.filter(type=>url.searchParams.has(type));
  if(present.length){
   const campaignId=url.searchParams.get('dgs_campaign');
   if(!CAMPAIGNS.has(campaignId)||url.searchParams.getAll('dgs_campaign').length!==1||present.some(type=>url.searchParams.getAll(type).length!==1||!valid(url.searchParams.get(type)))){clear();return null;}
   // Keep case and identifier type. Never rename a BRAID into GCLID.
   const clickType=present[0],clickId=url.searchParams.get(clickType);
   const same=x=>x?.campaignId===campaignId&&x?.clickType===clickType&&x?.clickId===clickId;
   const stamps=url.searchParams.getAll('dgs_capture_at');
   if(stamps.length>1||(stamps.length&&!/^\d{13}$/.test(stamps[0]))){clear();return null;}
   let capturedAt=stamps.length?Number(stamps[0]):Date.now();
   if(same(raw)&&Number.isFinite(raw.at))capturedAt=Math.min(capturedAt,raw.at);
   if(capturedAt>Date.now()||capturedAt<consent.offlineAt||Date.now()-capturedAt>=TTL){expiredOnPage=true;clear();return null;}
   // Persist the capture TIME in this history entry so repeated reloads cannot
   // renew an expired click after session data is deleted. Google IDs stay intact.
   if(!stamps.length){
    try{url.searchParams.set('dgs_capture_at',String(capturedAt));window.history.replaceState(window.history.state,'',url.href);}catch{clear();return null;}
   }
   if(!same(saved))saved={version:2,clickType,clickId,campaignId,at:capturedAt,consentAt:consent.offlineAt};
  }
  const currentCampaign=url.searchParams.get('dgs_campaign');
  if(currentCampaign&&saved&&currentCampaign!==saved.campaignId){clear();return null;}
  if(saved){try{sessionStorage.setItem(KEY,JSON.stringify(saved));sessionStorage.removeItem(OLD);}catch{return null;}}
  else clear();
  return saved;
 };
 const safe=()=>{try{return capture();}catch{clear();return null;}};
 window.DGSOfflineAttribution={get:()=>{const x=safe();return x?{clickType:x.clickType,clickId:x.clickId,campaignId:x.campaignId,capturedAt:new Date(x.at).toISOString(),consentAt:new Date(x.consentAt).toISOString(),consentVersion:'offline-v2'}:null;},clear};
 document.addEventListener('dgs:measurement-ready',safe);
 safe();

 // A WhatsApp reference identifies campaign/keyword only. It contains NO click ID.
 // No request, conversion or customer enquiry is created by opening WhatsApp.
 const reference=()=>{
  const click=window.DGSOfflineAttribution.get(),origin=window.DGSCampaignAttribution?.get();
  if(!click||!origin||origin.campaignId!==click.campaignId)return '';
  const keyword=/^[1-9]\d{0,19}$/.test(origin.keywordId||'')?origin.keywordId:'0';
  let r=null;try{r=JSON.parse(sessionStorage.getItem('dgs-whatsapp-ref-v2'));}catch{}
  if(!(r&&r.capturedAt===click.capturedAt&&r.campaignId===origin.campaignId&&r.keywordId===keyword&&/^[a-f0-9]{12}$/.test(r.nonce||''))){
   const bytes=new Uint8Array(6);if(!window.crypto?.getRandomValues)return '';
   window.crypto.getRandomValues(bytes);
   r={capturedAt:click.capturedAt,campaignId:origin.campaignId,keywordId:keyword,nonce:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')};
   try{sessionStorage.setItem('dgs-whatsapp-ref-v2',JSON.stringify(r));}catch{return '';}
  }
  return 'DGS-'+(r.campaignId==='24457117427'?'S':'E')+'-'+r.keywordId+'-'+r.nonce;
 };
 document.addEventListener('click',e=>{
  if(!e.isTrusted||e.defaultPrevented)return;
  const a=e.target.closest('a[href]');if(!a)return;
  try{
   const u=new URL(a.href);
   if(u.protocol!=='https:')return;
   if(!((u.hostname==='wa.me'&&u.pathname==='/41765024998')||(u.hostname==='api.whatsapp.com'&&u.pathname==='/send'&&u.searchParams.get('phone')==='41765024998')))return;
   const text=(u.searchParams.get('text')||'').replace(/\nReferenz: DGS-[SE]-(?:0|[1-9]\d{0,19})-[a-f0-9]{12}$/,'');
   const ref=reference();
   if(ref)u.searchParams.set('text',text+'\nReferenz: '+ref);
   else if(text)u.searchParams.set('text',text);
   else u.searchParams.delete('text');
   a.href=u.href;
  }catch{}
 });
})();
