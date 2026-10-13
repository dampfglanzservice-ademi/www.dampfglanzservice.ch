(()=>{
 'use strict';
 // Only coarse, consented funnel data. Never store or send form contents.
 const KEY='dgs-inquiry-pending-v1',CONSENT='dampfglanz-consent-v1',TTL=30*60*1000;
 const allowed=()=>{try{const c=JSON.parse(localStorage.getItem(CONSENT));return c?.version===1&&c.analytics===true&&Number.isFinite(c.at)&&Date.now()>=c.at&&Date.now()-c.at<180*86400000;}catch{return false;}};
 const clear=()=>{try{sessionStorage.removeItem(KEY);}catch{}};
 document.querySelectorAll('form[action="https://formsubmit.co/info@dampfglanzservice-ademi.ch"]').forEach(form=>{
  form.addEventListener('submit',e=>queueMicrotask(()=>{
   if(e.defaultPrevented)return;
   if(!allowed()){clear();return;}
   try{sessionStorage.setItem(KEY,JSON.stringify({at:Date.now(),kind:form.id==='quote-form'?'quote':'contact'}));}catch{}
  }));
 });
 if(location.pathname!=='/anfrage-gesendet/')return;
 let pending;try{pending=JSON.parse(sessionStorage.getItem(KEY));}catch{}
 // Consume even on a direct visit: reloads and back navigation must not recount.
 clear();
 if(!allowed()||!pending||!['quote','contact'].includes(pending.kind)||!Number.isFinite(pending.at)||Date.now()<pending.at||Date.now()-pending.at>TTL)return;
 let providerReturn=false;try{providerReturn=new URL(document.referrer).origin==='https://formsubmit.co';}catch{}
 if(!providerReturn||typeof window.gtag!=='function')return;
 // Provider return is not proof of mailbox delivery, qualification or a sale.
 window.gtag('event','inquiry_form_completed',{form_kind:pending.kind,transport_type:'beacon'});
})();
