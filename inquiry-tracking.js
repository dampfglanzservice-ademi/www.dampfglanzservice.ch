(()=>{
 'use strict';
 // Activate only on forms explicitly connected to the verified Basin endpoint.
 document.querySelectorAll('form[data-dgs-backend="basin"]').forEach(form=>{
  let busy=false,completed=false;
  form.addEventListener('submit',async e=>{
   if(e.defaultPrevented)return; // Existing quote validation runs first.
   e.preventDefault();
   if(busy||completed||!form.reportValidity())return;
   const status=form.querySelector('.form-status')||form.querySelector('#quote-status');
   const say=message=>{if(status)status.textContent=message;};
   if(form.elements.namedItem('_honey')?.value){say('Die Anfrage konnte nicht angenommen werden. Bitte kontaktieren Sie uns direkt.');return;}
   const endpoint=new URL(form.action);
   if(endpoint.origin!=='https://usebasin.com'||!/^\/f\/[a-zA-Z0-9-]+$/.test(endpoint.pathname)){say('Der Formularversand ist derzeit nicht eingerichtet. Bitte kontaktieren Sie uns direkt.');return;}
   busy=true;
   const button=form.querySelector('[type="submit"]');if(button)button.disabled=true;
   const id=crypto.randomUUID(),kind=form.id==='quote-form'?'quote':'contact';
   const test=new URL(location.href).searchParams.get('dgs_test')==='1';
   const data=new FormData(form);
   for(const name of ['_subject','_next','_autoresponse','_template','_honey'])data.delete(name);
   data.set('DGS_Anfragekennung',id);data.set('DGS_Formular',kind);
   if(test)data.set('DGS_Funktionstest','Ja – nicht als Kundenanfrage zählen');
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
   say('Ihre Anfrage wird übermittelt. Bitte warten Sie auf die Bestätigung.');
   try{
    const response=await fetch(endpoint.href,{method:'POST',body:data,headers:{Accept:'application/json'},signal:controller.signal});
    const result=await response.json();
    // Never count a button click, an opaque response, a rejected request or an error page.
    if(!response.ok||result?.success!==true)throw new Error('not-confirmed');
    completed=true;
    say(test?'Testanfrage vom Formulardienst angenommen. Dieser Test zählt nicht als Kundenanfrage.':'Vielen Dank. Ihre Anfrage wurde übermittelt. Wir melden uns persönlich bei Ihnen.');
    window.DGSMeasurement?.completed(kind,id,test);
    // No customer details are passed to measurement. Server acceptance does not prove inbox delivery.
   }catch{
    say('Die Übermittlung konnte nicht bestätigt werden. Ihre Eingaben bleiben erhalten. Bitte kontaktieren Sie uns unter info@dampfglanzservice-ademi.ch oder +41 76 502 49 98, bevor Sie nochmals senden.');
   }finally{
    clearTimeout(timer);busy=false;if(button)button.disabled=completed;
   }
  });
 });
})();
