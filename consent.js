(()=>{
 'use strict';
 const ID='G-479RC4GH7F',ADS='AW-17797086557',KEY='dampfglanz-consent-v1',MAX_AGE=180*86400000;
 const dialog=document.getElementById('cookie-dialog'),toggle=document.getElementById('cookie-analytics');
 if(!dialog||!toggle)return;
 let consent=null,loaded=false,analyticsStarted=false,adsStarted=false,previousFocus=null,needsAdsChoice=false;
 const testMode=new URL(location.href).searchParams.get('dgs_test')==='1';
 const adsLabel=document.createElement('label');adsLabel.className='cookie-option';adsLabel.innerHTML='<input type="checkbox" id="cookie-ads"> Anfragenmessung mit Google Ads erlauben';toggle.closest('label').after(adsLabel);
 const adsToggle=adsLabel.querySelector('input');
 document.getElementById('cookie-title').textContent='Cookies & Anfragenmessung';
 document.getElementById('cookie-description').textContent='Wir speichern Ihre Cookie-Auswahl. Optional verwenden wir Google Analytics für Statistik und Google Ads zur Zuordnung erfolgreicher Formularanfragen zu Anzeigenklicks. Dabei werden Nutzungs- und Gerätedaten an Google übermittelt, möglicherweise auch in die USA. Alle Formulare funktionieren auch ohne Messung.';
 adsLabel.nextElementSibling.textContent='Statistik und Anzeigenmessung sind getrennt wählbar. Keine Werbepersonalisierung. Namen, E-Mail-Adressen, Fotos und Nachrichten aus Formularen werden nicht an Google übermittelt.';
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.version===1&&typeof saved.analytics==='boolean'&&typeof saved.at==='number'&&Date.now()-saved.at<MAX_AGE&&saved.at<=Date.now()){needsAdsChoice=typeof saved.ads!=='boolean';consent={...saved,ads:saved.ads===true};}}catch{}
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
   if(u.searchParams.get('utm_source')==='google'&&u.searchParams.get('utm_medium')==='organic'&&u.searchParams.get('utm_campaign')==='gbp_autoinnenreinigung'){
    fields.campaign_source='google';fields.campaign_medium='organic';fields.campaign_name='gbp_autoinnenreinigung';
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
 function save(analytics,ads){
  const wasLoaded=loaded,previous=consent;consent={version:1,analytics,ads,at:Date.now()};
  try{localStorage.setItem(KEY,JSON.stringify(consent));}catch{}
  dialog.close();document.body.classList.remove('consent-open');previousFocus?.focus();
  if(wasLoaded){clearAnalytics(previous?.analytics===true&&!analytics,previous?.ads===true&&!ads);location.reload();}else start();
 }
 function open(){previousFocus=document.activeElement;toggle.checked=consent?.analytics===true;adsToggle.checked=consent?.ads===true;document.body.classList.add('consent-open');dialog.showModal();}
 document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',open));
 document.getElementById('cookie-accept').addEventListener('click',()=>save(true,true));
 document.getElementById('cookie-reject').addEventListener('click',()=>save(false,false));
 document.getElementById('cookie-save').addEventListener('click',()=>save(toggle.checked,adsToggle.checked));
 dialog.addEventListener('cancel',e=>{e.preventDefault();save(false,false);});
 document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link)return;const href=link.getAttribute('href');if(href.startsWith('tel:'))event('click_call');else if(/^https:\/\/(?:wa.me|api.whatsapp.com)\//.test(href))event('click_whatsapp');else if(href.startsWith('mailto:'))event('click_email');});
 document.querySelectorAll('form').forEach(form=>{
  let started=false;form.addEventListener('input',()=>{if(!started&&consent?.analytics){started=true;event('inquiry_start',{form_kind:form.id==='quote-form'?'quote':'contact'});}});
  // Diagnose fixed field groups only: never field values or customer details.
  if(form.matches('[data-dgs-backend="basin"]')){
   const invalidSeen=new Set();
   const groups={'service':'service','package':'service','customer-place':'location','customer-name':'contact','customer-email':'contact','customer-phone':'contact','date-1':'date','date-2':'date','date-3':'date','budget':'budget'};
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
 if(consent?.analytics||consent?.ads)start();if((!consent||needsAdsChoice)&&location.pathname!=='/datenschutz/')open();
})();

// Keep only a recognised campaign reference, after explicit Ads-measurement consent.
// No click IDs, search terms, full URLs or customer details are stored here.
;(()=>{
 'use strict';
 const KEY='dgs-campaign-session-v1',CONSENT='dampfglanz-consent-v1',TTL=30*60*1000;
 const CAMPAIGNS={
  '24407255482':'Reinigung Ostschweiz',
  '24407267470':'Auto-Innenreinigung Ostschweiz'
 };
 const isTest=()=>new URL(location.href).searchParams.get('dgs_test')==='1';
 const allowed=()=>{
  try{const c=JSON.parse(localStorage.getItem(CONSENT));return c?.version===1&&c.ads===true&&typeof c.at==='number'&&c.at<=Date.now()&&Date.now()-c.at<180*86400000;}catch{return false;}
 };
 const clear=()=>{try{sessionStorage.removeItem(KEY);}catch{}};
 const campaignFrom=raw=>{
  try{const u=new URL(raw);if(u.origin!==location.origin)return null;const id=u.searchParams.get('dgs_campaign');return Object.hasOwn(CAMPAIGNS,id)?id:null;}catch{return null;}
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
  if(current||(previous&&!x)){
   x={version:1,id:current||previous,at:Date.now(),entryPath:current?location.pathname:new URL(document.referrer).pathname};
   try{sessionStorage.setItem(KEY,JSON.stringify(x));}catch{}
  }
  return x;
 };
 window.DGSCampaignAttribution={
  get:()=>{const x=capture();return x?{campaignId:x.id,campaignName:CAMPAIGNS[x.id],method:'campaign_parameter',entryPath:typeof x.entryPath==='string'&&/^\/[a-z0-9\/-]{0,160}$/i.test(x.entryPath)?x.entryPath:''}:null;},
  clear
 };
 document.addEventListener('dgs:measurement-ready',capture);
 capture();
})();
