(()=>{
 'use strict';
 // No form contents or contact details are stored or sent to measurement.
 const KEY='dgs-inquiry-pending-v2',TTL=30*60*1000;
 const clear=()=>{try{sessionStorage.removeItem(KEY);}catch{}};
 document.querySelectorAll('form[action="https://formsubmit.co/info@dampfglanzservice-ademi.ch"]').forEach(form=>{
  form.addEventListener('submit',e=>{
   if(e.defaultPrevented||!form.checkValidity()||form.elements.namedItem('_honey')?.value)return;
   const next=form.elements.namedItem('_next');if(!next)return;
   try{
    const id=crypto.randomUUID(),test=new URL(location.href).searchParams.get('dgs_test')==='1';
    sessionStorage.setItem(KEY,JSON.stringify({at:Date.now(),id,kind:form.id==='quote-form'?'quote':'contact',test}));
    next.value=location.origin+'/anfrage-gesendet/?receipt='+encodeURIComponent(id);
   }catch{clear();}
  });
 });
 if(location.pathname!=='/anfrage-gesendet/')return;
 let pending;try{pending=JSON.parse(sessionStorage.getItem(KEY));}catch{}
 const receipt=new URL(location.href).searchParams.get('receipt');
 // Consume before emitting: direct visits, reloads and back navigation cannot recount.
 clear();
 let providerReturn=false;try{providerReturn=new URL(document.referrer).origin==='https://formsubmit.co';}catch{}
 if(!pending||!receipt||receipt!==pending.id||!providerReturn||!['quote','contact'].includes(pending.kind)||!Number.isFinite(pending.at)||Date.now()<pending.at||Date.now()-pending.at>TTL)return;
 // Remove the random receipt from the address bar. It never contains customer data.
 history.replaceState(null,'',location.pathname);
 const message=document.querySelector('.legal-lead');
 if(message)message.textContent=pending.test?'Testanfrage erfolgreich von FormSubmit zurückgeleitet. Dieser Test wird nicht als Kundenanfrage gezählt.':'Vielen Dank. Ihre Anfrage wurde übermittelt. Wir prüfen Ihre Angaben persönlich und melden uns über Ihre angegebenen Kontaktdaten.';
 // Provider success is not proof of inbox delivery, lead quality or a sale.
 window.DGSMeasurement?.completed(pending.kind,pending.id,pending.test);
})();
