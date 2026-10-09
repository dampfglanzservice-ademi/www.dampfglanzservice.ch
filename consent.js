(()=>{
 'use strict';
 const ID='G-479RC4GH7F',KEY='dampfglanz-consent-v1',MAX_AGE=180*86400000;
 const dialog=document.getElementById('cookie-dialog'),toggle=document.getElementById('cookie-analytics');
 if(!dialog||!toggle)return;
 let consent=null,loaded=false,previousFocus=null;
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.version===1&&typeof saved.analytics==='boolean'&&Date.now()-saved.at<MAX_AGE&&saved.at<=Date.now())consent=saved;}catch{}
 const cleanURL=value=>{try{const u=new URL(value);return u.origin+u.pathname;}catch{return '';}};
 const event=(name,params={})=>{if(consent?.analytics&&loaded)window.gtag('event',name,{...params,transport_type:'beacon'});};
 function start(){
  if(loaded||!consent?.analytics)return;
  loaded=true;window['ga-disable-'+ID]=false;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('js',new Date());
  window.gtag('config',ID,{page_location:location.origin+location.pathname,page_referrer:cleanURL(document.referrer),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,debug_mode:location.hostname!=='www.dampfglanzservice-ademi.ch'});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(script);
 }
 function clearAnalytics(){
  const names=document.cookie.split(';').map(x=>x.trim().split('=')[0]).filter(x=>/^_ga(?:_|$)|^_gid$|^_gat/.test(x));
  const domains=['',location.hostname,'.'+location.hostname,'.'+location.hostname.split('.').slice(-2).join('.')];
  for(const name of names)for(const domain of domains)document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax; Secure';
 }
 function save(analytics){
  const wasLoaded=loaded;consent={version:1,analytics,at:Date.now()};
  try{localStorage.setItem(KEY,JSON.stringify(consent));}catch{}
  dialog.close();document.body.classList.remove('consent-open');previousFocus?.focus();
  if(analytics)start();else{window['ga-disable-'+ID]=true;clearAnalytics();if(wasLoaded)location.reload();}
 }
 function open(){previousFocus=document.activeElement;toggle.checked=consent?.analytics===true;document.body.classList.add('consent-open');dialog.showModal();}
 document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',open));
 document.getElementById('cookie-accept').addEventListener('click',()=>save(true));
 document.getElementById('cookie-reject').addEventListener('click',()=>save(false));
 document.getElementById('cookie-save').addEventListener('click',()=>save(toggle.checked));
 dialog.addEventListener('cancel',e=>{e.preventDefault();save(false);});
 document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link)return;const href=link.getAttribute('href');if(href.startsWith('tel:'))event('click_call');else if(/^https:\/\/(?:wa.me|api.whatsapp.com)\//.test(href))event('click_whatsapp');else if(href.startsWith('mailto:'))event('click_email');});
 document.querySelectorAll('form').forEach(form=>{
  let started=false;form.addEventListener('input',()=>{if(!started&&consent?.analytics){started=true;event('inquiry_start',{form_kind:form.id==='quote-form'?'quote':'contact'});}});
  form.addEventListener('submit',e=>queueMicrotask(()=>{if(!e.defaultPrevented)event('inquiry_submit_attempt',{form_kind:form.id==='quote-form'?'quote':'contact'});}));
 });
 let scrolled=false;window.addEventListener('scroll',()=>{if(!scrolled&&consent?.analytics&&window.scrollY+innerHeight>=document.documentElement.scrollHeight*.75){scrolled=true;event('scroll_75');}},{passive:true});
 if(consent?.analytics)start();if(!consent&&location.pathname!=='/datenschutz/')open();
})();
