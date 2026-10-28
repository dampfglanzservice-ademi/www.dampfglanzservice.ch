(()=>{
 'use strict';
 // Keep notification fields readable without sending the quote summary twice.
 function notificationData(form){
  const original=new FormData(form),ordered=new FormData();
  const text=name=>String(original.get(name)||'').trim();
  const selected=name=>{
   const control=form.elements.namedItem(name);
   return control?.tagName==='SELECT'&&control.selectedOptions?.length?control.selectedOptions[0].text.trim():text(name);
  };
  const add=(name,value)=>{if(value)ordered.append(name,value);};
  const summary=text('Angebotsübersicht').split('\n');
  const summaryValue=label=>summary.find(line=>line.startsWith(label+': '))?.slice(label.length+2).trim()||'';
  for(const name of ['Name','email','Telefon','Ort'])add(name,text(name));
  add('Leistung',selected('Leistung'));
  const service=text('Leistung');
  if(text('Paket'))add('Paket',selected('Paket'));
  if(service==='auto')add('Autoreinigung_Umfang',selected('Autoreinigung_Umfang'));
  add('Leistungsumfang',summaryValue('Gewünschter Leistungsumfang'));
  add('Zustand',selected('Zustand'));
  add('Preisrahmen',summaryValue('Angezeigter Preisrahmen der Hauptleistung'));
  add('Auftragsdetails',text('Auftragsdetails')||text('Nachricht'));
  add('Weitere_Reinigungswuensche',text('Weitere_Reinigungswuensche'));
  add('Guenstigere_Alternative',text('Guenstigere_Alternative'));
  add('Preisvorschlag_CHF',text('Preisvorschlag_CHF'));
  for(const name of ['Terminvorschlag_1','Terminvorschlag_2','Terminvorschlag_3']){
   const value=text(name);add(name,/^\d{4}-\d{2}-\d{2}$/.test(value)?value.split('-').reverse().join('.'):value);
  }
  add('Zeitfenster',text('Zeitfenster'));
  if(service==='auto')add('Auto_Uebergabe',selected('Auto_Uebergabe'));
  add('Datenschutz',text('Datenschutz'));
  const handled=new Set(['Angebotsübersicht','Anfahrt_Pruefung','Name','email','Telefon','Ort','Leistung','Paket','Autoreinigung_Umfang','Zustand','Auftragsdetails','Nachricht','Weitere_Reinigungswuensche','Guenstigere_Alternative','Preisvorschlag_CHF','Terminvorschlag_1','Terminvorschlag_2','Terminvorschlag_3','Zeitfenster','Auto_Uebergabe','Datenschutz']);
  // Preserve attachments and any additional fields; do not drop future inputs.
  for(const [name,value] of original){
   if(handled.has(name))continue;
   if(typeof value==='string'){if(value.trim())ordered.append(name,value);}
   else if(value.size>0)ordered.append(name,value);
  }
  return ordered;
 }
 // Activate only on forms explicitly connected to the verified Basin endpoint.
 document.querySelectorAll('form[data-dgs-backend="basin"]').forEach(form=>{
  let busy=false,completed=false;
  form.addEventListener('submit',async e=>{
   if(e.defaultPrevented)return; // Existing quote validation runs first.
   e.preventDefault();
   if(busy||completed||!form.reportValidity())return;
   const status=form.querySelector('.form-status')||form.querySelector('#quote-status');
   const say=message=>{if(status)status.textContent=message;};
   const fail=message=>{
    say(message);
    if(!status)return;
    for(const [label,href] of [['Jetzt anrufen','tel:+41765024998'],['E-Mail schreiben','mailto:info@dampfglanzservice-ademi.ch']]){
     status.append(document.createTextNode(' · '));
     const link=document.createElement('a');link.href=href;link.textContent=label;status.append(link);
    }
    status.tabIndex=-1;status.focus({preventScroll:true});status.scrollIntoView({block:'center',behavior:'auto'});
   };
   if(form.elements.namedItem('_honey')?.value){fail('Die Anfrage konnte nicht angenommen werden. Bitte kontaktieren Sie uns direkt.');return;}
   const endpoint=new URL(form.action);
   if(endpoint.origin!=='https://usebasin.com'||!/^\/f\/[a-zA-Z0-9-]+$/.test(endpoint.pathname)){fail('Der Formularversand ist derzeit nicht eingerichtet. Bitte kontaktieren Sie uns direkt.');return;}
   busy=true;
   const button=form.querySelector('[type="submit"]');if(button)button.disabled=true;
   const id=crypto.randomUUID(),kind=form.id==='quote-form'?'quote':'contact';
   const test=new URL(location.href).searchParams.get('dgs_test')==='1';
   const data=notificationData(form);
   for(const name of ['_subject','_next','_autoresponse','_template','_honey'])data.delete(name);
   data.set('DGS_Anfragekennung',id);data.set('DGS_Formular',kind);
   if(test)data.set('DGS_Funktionstest','Ja – nicht als Kundenanfrage zählen');
   // This is a first-party campaign reference, not a Google-confirmed conversion.
   for(const name of ['DGS_Herkunft','DGS_Kampagne_ID','DGS_Kampagne','DGS_Zuordnung'])data.delete(name);
   if(!test){
    const origin=window.DGSCampaignAttribution?.get();
    if(origin){
     data.set('DGS_Herkunft','Google Ads – Kampagnenparameter');
     data.set('DGS_Kampagne_ID',origin.campaignId);
     data.set('DGS_Kampagne',origin.campaignName);
     data.set('DGS_Zuordnung','Kampagnenparameter dieser Sitzung; Google-Conversion nicht bestätigt');
    }
   }
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
   // Count only validated dispatch attempts; never a conversion or a customer enquiry.
   try{window.DGSMeasurement?.attempted(kind,test);}catch{};
   say('Ihre Anfrage wird übermittelt. Bitte warten Sie auf die Bestätigung.');
   try{
    const response=await fetch(endpoint.href,{method:'POST',body:data,headers:{Accept:'application/json'},signal:controller.signal});
    const result=await response.json();
    // Never count a button click, an opaque response, a rejected request or an error page.
    if(!response.ok||result?.success!==true)throw new Error('not-confirmed');
    completed=true;
    say(test?'Testanfrage vom Formulardienst angenommen. Dieser Test zählt nicht als Kundenanfrage.':'Vielen Dank. Ihre Anfrage wurde übermittelt. Wir melden uns persönlich bei Ihnen.');
    // A blocked measurement tag must never overwrite an accepted enquiry with a send error.
    try{window.DGSMeasurement?.completed(kind,id,test);}catch{};
    // No customer details are passed to measurement. Server acceptance does not prove inbox delivery.
   }catch{
    try{window.DGSMeasurement?.failed(kind,test);}catch{};
    fail('Die Übermittlung konnte nicht bestätigt werden. Ihre Eingaben bleiben erhalten. Bitte kontaktieren Sie uns unter info@dampfglanzservice-ademi.ch oder +41 76 502 49 98, bevor Sie nochmals senden.');
   }finally{
    clearTimeout(timer);busy=false;if(button)button.disabled=completed;
   }
  });
 });
})();
