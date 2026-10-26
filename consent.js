(()=>{
 'use strict';
 const ID='G-479RC4GH7F',ADS='AW-17797086557',KEY='dampfglanz-consent-v1',MAX_AGE=180*86400000;
 const dialog=document.getElementById('cookie-dialog'),toggle=document.getElementById('cookie-analytics');
 if(!dialog||!toggle)return;
 let consent=null,loaded=false,analyticsStarted=false,adsStarted=false,previousFocus=null;
 const adsLabel=document.createElement('label');adsLabel.className='cookie-option';adsLabel.innerHTML='<input type="checkbox" id="cookie-ads"> Anfragenmessung mit Google Ads erlauben';toggle.closest('label').after(adsLabel);
 const adsToggle=adsLabel.querySelector('input');
 document.getElementById('cookie-title').textContent='Cookies & Anfragenmessung';
 document.getElementById('cookie-description').textContent='Wir speichern Ihre Cookie-Auswahl. Optional verwenden wir Google Analytics für Statistik und Google Ads zur Zuordnung erfolgreicher Formularanfragen zu Anzeigenklicks. Dabei werden Nutzungs- und Gerätedaten an Google übermittelt, möglicherweise auch in die USA. Alle Formulare funktionieren auch ohne Messung.';
 adsLabel.nextElementSibling.textContent='Statistik und Anzeigenmessung sind getrennt wählbar. Keine Werbepersonalisierung. Namen, E-Mail-Adressen, Fotos und Nachrichten aus Formularen werden nicht an Google übermittelt.';
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.version===1&&typeof saved.analytics==='boolean'&&Date.now()-saved.at<MAX_AGE&&saved.at<=Date.now())consent=saved;}catch{}
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
 const event=(name,params={})=>{if(consent?.analytics&&loaded)window.gtag('event',name,{...params,send_to:ID,transport_type:'beacon'});};
 function start(){
  if(!consent?.analytics&&!consent?.ads)return;
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
 window.DGSMeasurement={completed:(kind,id,test)=>{
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
  form.addEventListener('submit',e=>queueMicrotask(()=>{if(!e.defaultPrevented)event('inquiry_submit_attempt',{form_kind:form.id==='quote-form'?'quote':'contact'});}));
 });
 let scrolled=false;window.addEventListener('scroll',()=>{if(!scrolled&&consent?.analytics&&window.scrollY+innerHeight>=document.documentElement.scrollHeight*.75){scrolled=true;event('scroll_75');}},{passive:true});
 if(consent?.analytics||consent?.ads)start();if(!consent&&location.pathname!=='/datenschutz/')open();
})();
