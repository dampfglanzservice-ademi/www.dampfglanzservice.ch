(function(){
 'use strict';
 const regionNames={"reinigungsfirma-st-gallen":"St. Gallen","reinigungsfirma-thurgau":"Thurgau","reinigungsfirma-zuerich":"Zürich","reinigungsfirma-goldach":"Goldach","reinigungsfirma-rorschacherberg":"Rorschacherberg","reinigungsfirma-arbon":"Arbon","reinigungsfirma-steinach":"Steinach","reinigungsfirma-horn":"Horn","reinigungsfirma-thal":"Thal","reinigungsfirma-staad":"Staad","reinigungsfirma-rheineck":"Rheineck","reinigungsfirma-st-margrethen":"St. Margrethen","reinigung-appenzell-ausserrhoden":"Appenzell Ausserrhoden","reinigung-appenzell-innerrhoden":"Appenzell Innerrhoden","reinigung-rheintal":"Rheintal","reinigung-toggenburg":"Toggenburg","reinigung-werdenberg-sarganserland":"Werdenberg & Sarganserland","reinigung-glarus":"Glarus","reinigung-graubuenden":"Graubünden","reinigung-schaffhausen":"Schaffhausen"};
 const cityRegions=['reinigungsfirma-goldach','reinigungsfirma-rorschacherberg','reinigungsfirma-arbon','reinigungsfirma-steinach','reinigungsfirma-horn','reinigungsfirma-thal','reinigungsfirma-staad','reinigungsfirma-rheineck','reinigungsfirma-st-margrethen'];
 function classifyContact(raw){
  const value=String(raw||'').trim();
  if(value.includes('@'))return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&value.length<=160?{email:value,phone:''}:null;
  const digits=value.replace(/\D/g,'');
  return /^[+0-9 ()/.-]+$/.test(value)&&digits.length>=6&&digits.length<=18&&value.length<=40?{email:'',phone:value}:null;
 }
 function contextFromQuery(search,catalog){
  const params=new URLSearchParams(search),candidate=params.get('leistung'),service=Object.hasOwn(catalog,candidate)?candidate:'';
  const requested=params.get('paket'),pkg=service&&(catalog[service]||[]).some(item=>item[0]===requested)?requested:'custom';
  const tier=service==='auto'&&['basis','intensiv'].includes(params.get('umfang'))?params.get('umfang'):'';
  const region=Object.hasOwn(regionNames,params.get('region'))?params.get('region'):'';
  return {service,pkg,tier,region,place:cityRegions.includes(region)?regionNames[region]:'',combination:service==='polsterreinigung'&&params.get('kombi')==='ja'};
 }
 function photoError(files){
  if(files.some(file=>!['image/jpeg','image/png'].includes(file.type)))return 'Bitte nur JPG- oder PNG-Fotos auswählen.';
  return files.reduce((sum,file)=>sum+file.size,0)>6*1024*1024?'Die Fotos dürfen zusammen höchstens 6 MB gross sein.':'';
 }
 function requestSummary(m){
  return ['Unverbindliche Reinigungsanfrage – Dampfglanzservice-Ademi','Leistung: '+m.serviceLabel,'Gewünschter Leistungsumfang: '+m.scope,'Angezeigter Preisrahmen der Hauptleistung: '+m.orientation,'Ort: '+m.place,'Keine Buchung. Persönliche Fixpreis-Offerte mit vereinbartem Umfang, Anfahrt, Material und Termin abwarten. Für den vereinbarten Umfang keine Zusatzkosten.'].join('\n');
 }
 function submissionLocked(form){
  return ['sending','success'].includes(form.dataset.dgsSubmitState);
 }
 function renderSubmissionUI({state,test=false,form,status,button,document:doc}){
  if(!['sending','success','error'].includes(state)||!form||!button)return;
  form.dataset.dgsSubmitState=state;
  button.disabled=state!=='error';
  button.textContent=state==='success'?(test?'Testanfrage angenommen ✓':'Anfrage gesendet ✓'):state==='sending'?'Wird gesendet …':'Unverbindlich anfragen ↗';
  if(!status)return;
  status.dataset.state=state;
  if(state!=='success'){status.removeAttribute('aria-labelledby');return;}
  const mark=doc.createElement('span');mark.className='sq-success-mark';mark.setAttribute('aria-hidden','true');mark.textContent='✓';
  const body=doc.createElement('div'),heading=doc.createElement('h3'),message=doc.createElement('p');
  heading.id='quote-success-heading';heading.className='sq-success-title';heading.textContent=test?'Testanfrage angenommen':'Anfrage erfolgreich gesendet';
  message.textContent=test?'Dieser Test zählt nicht als Kundenanfrage.':'Vielen Dank! Wir melden uns persönlich bei Ihnen.';
  body.append(heading,message);status.replaceChildren(mark,body);status.setAttribute('aria-labelledby',heading.id);
  status.focus({preventScroll:true});status.scrollIntoView({block:'center',behavior:'instant'});
 }
 if(typeof module==='object'&&module.exports)module.exports={classifyContact,contextFromQuery,photoError,requestSummary,submissionLocked,renderSubmissionUI};
 if(typeof document==='undefined')return;
 const form=document.getElementById('quote-form');
 if(!form||form.dataset.shortRequest!=='true'||!window.DGSPrice)return;
 const $=id=>document.getElementById(id),catalog=window.DGSPrice.packages,ctx=contextFromQuery(location.search,catalog),isTest=new URLSearchParams(location.search).get('dgs_test')==='1';
 const service=$('service'),pack=$('package'),tier=$('cleaning-tier'),condition=$('condition'),handover=$('auto-handover'),budget=$('budget'),contact=$('customer-contact'),place=$('customer-place'),send=$('send-offer'),panel=$('request-contact'),choice=$('service-choice');
 form.addEventListener('dgs:submission-ui',event=>renderSubmissionUI({...event.detail,form,status:$('quote-status'),button:send,document}));
 const fileInputs=Array.from(form.querySelectorAll('[data-photo]')),dates=[1,2,3].map(n=>$('date-'+n)),perService=new Map();let previousService='',objectURLs=[];
 const now=new Date(),today=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);dates.forEach(input=>input.min=today);
 const label=()=>service.selectedOptions[0]?.text||'Reinigung';
 const setName=(control,name,enabled)=>{if(enabled)control.setAttribute('name',name);else control.removeAttribute('name');};
 function packageList(){
  pack.replaceChildren();for(const [value,text]of catalog[service.value]||[]){const option=document.createElement('option');option.value=value;option.textContent=text;pack.append(option);}
  if(!pack.options.length){const option=document.createElement('option');option.value='custom';option.textContent='Noch gemeinsam klären';pack.append(option);}
 }
 function syncContact(){
  let result=classifyContact(contact.value);
  if(result?.email){const probe=document.createElement('input');probe.type='email';probe.value=result.email;if(!probe.checkValidity())result=null;}
  $('customer-email').value=result?.email||'';$('customer-phone').value=result?.phone||'';
  contact.setCustomValidity(contact.value&&!result?'Bitte geben Sie eine vollständige E-Mail-Adresse oder Telefonnummer ein.':'');
  return result;
 }
 function validateDates(){
  for(const input of dates){input.setCustomValidity('');if(input.value&&input.value<today)input.setCustomValidity('Bitte einen zukünftigen Termin wählen.');else if(input.value&&dates.filter(other=>other.value===input.value).length>1)input.setCustomValidity('Bitte unterschiedliche Termine auswählen.');}
 }
 function validatePhotos(){
  const files=fileInputs.flatMap(input=>Array.from(input.files||[])),message=photoError(files);fileInputs.forEach(input=>input.setCustomValidity(message));$('photo-error').textContent=message;$('clear-photos').hidden=files.length===0;return !message;
 }
 function selectedScope(){
  if(service.value==='auto'){
   if(tier.value==='basis')return 'Innen Basis: Innenraum und Kofferraum saugen, Fussmatten, zugängliche Oberflächen und Scheiben innen. Keine Sitz-Shampoonierung oder Aussenwäsche. Extras und Zustand persönlich klären.';
   if(tier.value==='intensiv')return 'Innen Intensiv: Basis plus gründliche Detailreinigung und materialgerechte Reinigung der vereinbarten Sitzflächen. Keine Aussenwäsche. Material, Zustand, Extras und Gesamtpreis persönlich bestätigen.';
   return 'Auto-Innenreinigung: Umfang, Fahrzeuggrösse, Zustand, Übergabe und Gesamtpreis noch gemeinsam klären.';
  }
  const item=(catalog[service.value]||[]).find(value=>value[0]===pack.value);
  return pack.value!=='custom'&&item?item[1]+': '+item[2]+' Genauen Umfang und Gesamtpreis persönlich bestätigen.':'Gewünschte Reinigung und genauer Umfang werden noch persönlich geklärt; keine Paket- oder Zustandsannahme.';
 }
 function orientation(){
  const meaningful=pack.value!=='custom'&&(service.value==='polsterreinigung'||service.value==='auto'&&['basis','intensiv'].includes(tier.value));
  if(!meaningful)return 'Persönliche Fixpreis-Offerte nach Klärung des Umfangs; kein Preis ausgewählt.';
  const estimate=window.DGSPrice.estimate(service.value,pack.value,tier.value||'basis','normal','unknown');
  return estimate.available?'Unverbindliche Orientierung bei normaler Verschmutzung: ca. CHF '+estimate.min+'–'+estimate.max+' inkl. Standardmaterial und allfälliger MwSt.; allfällige Fahrtkosten über 15 km vorab vereinbaren. Zustand noch persönlich prüfen.':'Persönliche Fixpreis-Offerte; kein berechenbarer Preisrahmen ausgewählt.';
 }
 function summary(){return requestSummary({serviceLabel:label(),scope:selectedScope(),orientation:orientation(),place:place.value.trim()});}
 function renderPrice(){
  const area=$('price-orientation');area.replaceChildren();const auto=service.value==='auto',sofa=service.value==='polsterreinigung';
  $('price-orientation-note').textContent=auto||sofa?'Veröffentlichte unverbindliche Preisrahmen bei normaler Verschmutzung. Standardmaterial und allfällige MwSt. sind enthalten.':'Für diese Reinigung erhalten Sie eine persönliche Fixpreis-Offerte. Es ist kein eigener Preisvorschlag nötig.';
  if(auto||sofa){
   for(const level of auto?['basis','intensiv']:['basis']){
    if(auto){const heading=document.createElement('h3');heading.textContent=level==='basis'?'Innen Basis':'Innen Intensiv';area.append(heading);}
    const dl=document.createElement('dl');
    for(const [key,text]of catalog[service.value]||[]){if(key==='custom')continue;const estimate=window.DGSPrice.estimate(service.value,key,level,'normal','unknown');if(!estimate.available)continue;const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=text;dd.textContent='CHF '+estimate.min+'–'+estimate.max;row.append(dt,dd);dl.append(row);}area.append(dl);
   }
  }else{const text=document.createElement('p');text.textContent='Preis nach persönlicher Fixpreis-Offerte';area.append(text);}
  $('price-options').hidden=!['auto','polsterreinigung','endreinigung-abnahmegarantie'].includes(service.value);
  $('package-field').hidden=!['auto','polsterreinigung','endreinigung-abnahmegarantie'].includes(service.value);
  $('cleaning-tier-field').hidden=!auto;$('auto-handover-field').hidden=!auto;
  $('price-scope').textContent=auto?'Basis: Saugen, Fussmatten, zugängliche Oberflächen und Scheiben innen. Intensiv zusätzlich mit Detail- und vereinbarter Sitzreinigung. Keine Aussenwäsche; starke Tierhaare, Flecken und Geruchsbehandlung separat besprechen.':sofa?'Vereinbarte textile Sitzflächen, Rücken- und Armlehnen nach Materialprüfung. Empfindliche Bezüge, Sonderformen und starke Verschmutzung persönlich klären. Keine garantierte vollständige Fleckenentfernung.':'Objekt, Zustand, gewünschte Arbeiten und Zugang werden vor dem Gesamtpreis persönlich geklärt.';
  $('price-travel').textContent=auto?'Reinigung stationär in Rorschach. Abholung und Rückgabe bis 15 km Fahrstrecke nach Vereinbarung kostenlos; weitere Fahrtkosten vorab bestätigen.':service.value==='autopolsterreinigung'?'Autopolster reinigen wir stationär in Rorschach. Ort und Übergabe stimmen wir persönlich ab.':'Bis 15 km Fahrstrecke ab Rorschach keine Anfahrtskosten. Weitere Fahrtkosten werden vor dem Auftrag im Gesamtpreis vereinbart.';
 }
 function update(){
  syncContact();validateDates();const auto=service.value==='auto',withScope=['auto','polsterreinigung','endreinigung-abnahmegarantie'].includes(service.value);
  setName(pack,'Paket',Object.hasOwn(catalog,service.value)&&pack.value!=='custom');setName(tier,'Autoreinigung_Umfang',auto&&['basis','intensiv'].includes(tier.value));setName(condition,'Zustand',withScope&&['normal','special'].includes(condition.value));setName(handover,'Auto_Uebergabe',auto&&handover.value!=='discuss');
  $('quote-location').value=auto&&handover.value==='bring'?'rorschach':'unknown';
  const limit=Boolean(form.querySelector('[data-budget-mode="limit"]:checked'));budget.disabled=!limit;$('budget-field').hidden=!limit;
  const parts=Object.hasOwn(catalog,service.value)?[label()]:[];if(pack.value!=='custom'&&pack.selectedOptions.length)parts.push(pack.selectedOptions[0].text);if(auto&&tier.value)parts.push(tier.selectedOptions[0].text);
  const message=parts.length?'Guten Tag, ich möchte '+parts.join(' · ')+' anfragen. Bitte nennen Sie mir den Gesamtpreis und einen möglichen Termin.':'Guten Tag, ich möchte eine Reinigung unverbindlich anfragen. Bitte nennen Sie mir den Gesamtpreis und einen möglichen Termin.';
  document.querySelectorAll('[data-quote-whatsapp]').forEach(link=>{link.href='https://wa.me/41765024998?text='+encodeURIComponent(message);link.setAttribute('aria-label',parts.length?parts.join(' · ')+' per WhatsApp anfragen':'Per WhatsApp anfragen');});
  $('quote-combination-note').hidden=!$('combine-services').value.trim();$('quote-summary').value=summary();send.disabled=submissionLocked(form)||!Object.hasOwn(catalog,service.value);
 }
 function reportContact(){if(!isTest&&!panel.hidden){try{window.DGSMeasurement?.step('quote','contact',false);}catch{}}}
 function showService(value,focus=true){
  if(!Object.hasOwn(catalog,value))return;
  if(previousService)perService.set(previousService,{pkg:pack.value,tier:tier.value,condition:condition.value,handover:handover.value});
  service.value=value;packageList();const stored=perService.get(value)||{pkg:'custom',tier:'',condition:'',handover:'discuss'};
  if(Array.from(pack.options).some(option=>option.value===stored.pkg))pack.value=stored.pkg;tier.value=stored.tier;condition.value=stored.condition;handover.value=stored.handover;previousService=value;
  $('selected-service').textContent=label();$('selected-service-row').hidden=false;choice.hidden=true;panel.hidden=false;
  const auto=['auto','autopolsterreinigung'].includes(value);$('customer-place-label').textContent=auto?'Ihre PLZ / Ihr Ort *':'PLZ / Ort der Reinigung *';$('request-context').textContent=auto?'Reinigung stationär in Rorschach. Übergabe, Wünsche und Gesamtpreis klären wir persönlich.':'Nur Ihren Ort und einen Kontaktweg. Alles Weitere klären wir persönlich.';
  renderPrice();update();reportContact();if(focus){place.focus({preventScroll:true});panel.scrollIntoView({block:'start',behavior:'auto'});}
 }
 form.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>showService(button.dataset.service)));
 $('change-service').addEventListener('click',()=>{panel.hidden=true;choice.hidden=false;const previous=Array.from(form.querySelectorAll('[data-service]')).find(button=>button.dataset.service===service.value);if(previous){previous.focus({preventScroll:true});previous.scrollIntoView({block:'nearest',behavior:'auto'});}});
 service.addEventListener('change',()=>showService(service.value));form.addEventListener('input',update);
 form.addEventListener('change',event=>{if(event.target.matches('[data-photo]')){
  objectURLs.forEach(URL.revokeObjectURL);objectURLs=[];$('photo-preview').replaceChildren();
  if(validatePhotos())for(const input of fileInputs){if(!input.files.length)continue;const file=input.files[0],url=URL.createObjectURL(file),figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption'),remove=document.createElement('button');objectURLs.push(url);image.src=url;image.alt='Foto-Vorschau';caption.textContent=file.name;remove.type='button';remove.textContent='Foto entfernen';remove.addEventListener('click',()=>{input.value='';input.dispatchEvent(new Event('change',{bubbles:true}));});figure.append(image,caption,remove);$('photo-preview').append(figure);}
  if(!isTest&&fileInputs.some(input=>input.files.length)){try{window.DGSMeasurement?.step('quote','photos',false);}catch{}}
 }update();});
 $('clear-photos').addEventListener('click',()=>{fileInputs.forEach(input=>{input.value='';input.setCustomValidity('');});objectURLs.forEach(URL.revokeObjectURL);objectURLs=[];$('photo-preview').replaceChildren();validatePhotos();});
 form.addEventListener('invalid',event=>{const details=event.target.closest('details');if(details)details.open=true;if(panel.hidden&&Object.hasOwn(catalog,service.value)){choice.hidden=true;panel.hidden=false;}},true);
 // Validation only. The one existing Basin handler remains the sole sender.
 form.addEventListener('submit',event=>{update();if(!Object.hasOwn(catalog,service.value)||!syncContact()||!validatePhotos()||!form.checkValidity()){event.preventDefault();form.reportValidity();return;}$('quote-summary').value=summary();});
 $('print-quote').addEventListener('click',()=>{update();const area=$('print-summary');area.replaceChildren();const heading=document.createElement('h1'),body=document.createElement('p');heading.textContent='Ihre unverbindliche Anfrageübersicht';body.style.whiteSpace='pre-line';body.textContent=summary();area.append(heading,body);window.print();});
 window.addEventListener('pagehide',()=>objectURLs.forEach(URL.revokeObjectURL));document.addEventListener('dgs:measurement-ready',reportContact);
 if(ctx.region){const text=$('regional-request-context');text.textContent='Ihre Anfrage für '+regionNames[ctx.region]+'. Bitte ergänzen oder korrigieren Sie bei Bedarf den genauen Einsatzort.';text.hidden=false;const hidden=document.createElement('input');hidden.type='hidden';hidden.name='DGS_Anfrageregion';hidden.value=regionNames[ctx.region];form.append(hidden);if(ctx.place&&!place.value)place.value=ctx.place;}
 if(ctx.combination)$('combine-services').value='Zusätzlich Matratzenreinigung. Grösse, Material und Zustand gemeinsam klären.';
 $('service-fallback').hidden=true;service.required=false;choice.hidden=false;panel.hidden=true;
 if(ctx.service){perService.set(ctx.service,{pkg:ctx.pkg,tier:ctx.tier,condition:'',handover:'discuss'});showService(ctx.service,false);if(ctx.pkg!=='custom'||ctx.tier)$('request-price').open=true;}
 else{packageList();update();}
})();
