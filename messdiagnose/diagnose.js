(()=>{
'use strict';
const ADS='AW-17797086557',DEST=ADS+'/ac3LCInLoaYdEN36p6ZC';
const form=document.getElementById('diagnostic-form'),button=document.getElementById('send'),stop=document.getElementById('stop'),status=document.getElementById('google-status');
window['ga-disable-G-479RC4GH7F']=true;
let ready=false,sent=false,blocked=false;
const block=message=>{blocked=true;button.disabled=true;stop.hidden=false;stop.textContent=message;};
const url=new URL(location.href);
if(url.searchParams.get('dgs_test')!=='1')block('Falscher Testlink. Bitte ausschliesslich den vorbereiteten Link mit dgs_test=1 verwenden.');
if(Date.now()>Date.parse('2026-10-29T23:59:00+01:00'))block('Dieser Diagnose-Link ist abgelaufen. Es wird kein Google-Ereignis ausgelöst.');
const hasClick=u=>['gclid','gbraid','wbraid','dclid','gclsrc'].some(k=>u.searchParams.has(k));
if(hasClick(url))block('Anzeigenkennung erkannt. Bitte alle privaten Fenster schliessen und mit dem ursprünglichen Diagnose-Link neu beginnen.');
try{if(document.referrer&&hasClick(new URL(document.referrer)))block('Anzeigenkennung im Herkunftslink erkannt. Bitte in einem neuen privaten Fenster beginnen.');}catch{}
const hasMeasurement=()=>document.cookie.split(';').some(c=>/^(?:_gcl_|_ga(?:_|=)|_gid=|_gat|dgs_diag_)/.test(c.trim()));
if(hasMeasurement())block('Bereits vorhandene Mess-Cookies erkannt. Bitte alle privaten Fenster schliessen und ein neues privates Safari-Fenster verwenden.');
try{if(localStorage.getItem('dampfglanz-consent-v1')||sessionStorage.getItem('dgs-diagnostic-sent'))block('Bestehende Website-Sitzung erkannt. Bitte alle privaten Fenster schliessen und neu beginnen.');}catch{block('Der Sitzungs-Schutz ist in diesem Browser nicht verfügbar. Test sicherheitshalber gesperrt.');}
const checked=()=>document.getElementById('fresh').checked&&document.getElementById('agree').checked;
form.addEventListener('change',()=>{button.disabled=blocked||!checked()||sent;});
form.addEventListener('submit',event=>{
 if(Date.now()>Date.parse('2026-10-29T23:59:00+01:00'))block('Dieser Diagnose-Link ist abgelaufen.');
 if(blocked||!checked()||sent){event.preventDefault();return;}
 if(!ready&&hasMeasurement()){block('Mess-Cookies wurden zwischenzeitlich erkannt. Bitte den Test in einer neuen privaten Sitzung starten.');event.preventDefault();return;}
 if(!ready){
  ready=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'granted',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('set','allow_ad_personalization_signals',false);
  window.gtag('js',new Date());
  window.gtag('config',ADS,{send_page_view:false,page_location:location.origin+location.pathname,page_referrer:'',allow_google_signals:false,allow_ad_personalization_signals:false,allow_enhanced_conversions:false,cookie_prefix:'dgs_diag',cookie_expires:0});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ADS;
  script.onerror=()=>{status.textContent='Google-Skript konnte nicht geladen werden. Der Google-Empfang ist nicht bestätigt.';};
  document.head.append(script);
 }
});
window.DGSMeasurement={completed:(kind,id,test)=>{
 if(blocked||!ready||sent||test!==true||Date.now()>Date.parse('2026-10-29T23:59:00+01:00'))return;
 sent=true;try{sessionStorage.setItem('dgs-diagnostic-sent',id);}catch{}
 const transaction='DGS-DIAG-'+id;
 status.textContent='Formulardienst hat den Test angenommen. Technisches Google-Ereignis wird übergeben. Testkennung: '+transaction+'. Dies ist noch keine Empfangsbestätigung durch Google.';
 window.gtag('event','conversion',{send_to:DEST,transaction_id:transaction,value:0,currency:'CHF',transport_type:'beacon',event_callback:()=>{
 status.textContent='Google-Tag hat den Ereignisaufruf verarbeitet. Testkennung: '+transaction+'. Bitte im Tag Assistant den Conversion-Hit prüfen. Die Kampagnenzuordnung und der serverseitige Google-Empfang sind damit allein noch nicht bestätigt.';
 }});
}};
})();
