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
  const requested=params.get('preis'),pkg=service&&(catalog[service]||[]).some(item=>item[0]===requested)?requested:'custom';
  const tier='';
  const region=Object.hasOwn(regionNames,params.get('region'))?params.get('region'):'';
  return {service,pkg,tier,region,place:cityRegions.includes(region)?regionNames[region]:'',combination:service==='polsterreinigung'&&params.get('kombi')==='ja'};
 }
 function photoError(files){
  if(files.some(file=>!['image/jpeg','image/png'].includes(file.type)))return 'Bitte nur JPG- oder PNG-Fotos auswählen.';
  return files.reduce((sum,file)=>sum+file.size,0)>6*1024*1024?'Die Fotos dürfen zusammen höchstens 6 MB gross sein.':'';
 }
 function autoHandover(zone){
  const choices={self:{value:'bring',label:'Selbst bringen und abholen in Rorschach.'},pickup15:{value:'pickup15',label:'Kostenlose Abholung und Rückgabe bis 15 km Fahrstrecke ab Rorschach, nach Vereinbarung.'},outside15:{value:'outside15',label:'Abholung weiter als 15 km: Übergabe und Gesamtpreis persönlich klären.'}};
  return choices[zone]||{value:'discuss',label:'Übergabe noch gemeinsam klären; Gesamtpreis persönlich bestätigen.'};
 }
 function requestSummary(m){
  return ['Unverbindliche Reinigungsanfrage – Dampfglanzservice-Ademi','Leistung: '+m.serviceLabel,'Gewünschter Leistungsumfang: '+m.scope,'Angezeigter Preisrahmen der Hauptleistung: '+String(m.orientation).split('\n').filter(line=>!['Ihre Übersicht','Preisübersicht'].includes(line)).join(' · '),'Ort: '+m.place,'Keine Buchung. Persönliche Fixpreis-Offerte mit vereinbartem Umfang, Anfahrt, Material und Termin abwarten. Für den vereinbarten Umfang keine Zusatzkosten.'].join('\n');
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
  heading.id='quote-success-heading';heading.className='sq-success-title';heading.textContent=test?'Testanfrage angenommen':'Ihre Anfrage wurde erfolgreich übermittelt';
  message.textContent=test?'Dieser Test zählt nicht als Kundenanfrage.':'Vielen Dank! Wir melden uns persönlich bei Ihnen.';
  body.append(heading,message);status.replaceChildren(mark,body);status.setAttribute('aria-labelledby',heading.id);
  status.focus({preventScroll:true});status.scrollIntoView({block:'center',behavior:'instant'});
 }
 if(typeof module==='object'&&module.exports)module.exports={classifyContact,contextFromQuery,photoError,requestSummary,autoHandover,submissionLocked,renderSubmissionUI};
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
 function selectedScope(){const r=window.DGSFixedPrice.row(pack.value),e=fixedEstimate();const scope=r?window.DGSFixedPrice.data.groups[r.group].scope+' Ausgewähltes Paket: '+r.label+'. Menge gleicher Pakete: '+(e.quantity||1)+'. Zusätze: '+(e.additional||[]).join('; ')+'.':'Gewünschte Reinigung und genauer Umfang werden persönlich geklärt; kein Paket angenommen.';return scope+(condition.value?' Zustand: '+condition.selectedOptions[0].textContent+'.':'')+($('fixed-zone')?.value&&$('fixed-zone').value!=='unknown'?' Anfahrt / Übergabe: '+$('fixed-zone').selectedOptions[0].textContent+'.':'');}
 function selectedInclusions(){const r=window.DGSFixedPrice.row(pack.value),box=$('selected-package-inclusions'),headboard=$('fixed-headboard');if(headboard){const eligible=r&&r.index>=10&&r.index<=14&&Number($('fixed-quantity')?.value||1)===1;headboard.closest('.field').hidden=!eligible;if(!eligible)headboard.value='';}if(!box)return;box.hidden=!r;if(!r)return;let scope=window.DGSFixedPrice.data.groups[r.group].scope;if(r.group==='auto'){scope=['Innenraum saugen und zugängliche Oberflächen. Ohne Kofferraum und Innenscheiben.','Saugen und zugängliche Oberflächen, Kofferraum und Innenscheiben.','Intensiv-Reinigung, zusätzlich Textilsitze schamponieren und extrahieren oder Leder reinigen und pflegen (nach Materialprüfung).'][r.index%3];if(r.index>=6)scope+=' Bis sieben Sitze.';}
  if(r.group==='polster'&&r.index>=15&&r.index<=20){
   const packageScopes={
    'fp-015':'Komplettreinigung eines Textilsessels.',
    'fp-016':'Reinigung eines Polsterhockers.',
    'fp-017':'Reinigung von Sitz und Rücken eines Polsterstuhls.',
    'fp-018':'Reinigung von vier Polsterstühlen.',
    'fp-019':'Reinigung eines Bettkopfteils bis 180 cm als Einzelbesuch.',
    'fp-020':'Reinigung eines Bettkopfteils und zweier Bettseiten als Einzelbesuch.'
   };
   // Only the first sentence describes the sofa. Keep the shared conditions below it.
   scope=scope.replace(/^[^.]*\./,packageScopes[r.id]+' Ausführung nach Materialprüfung.');
  }
  $('selected-package-scope').textContent=scope;
 }
 function fixedEstimate(){return window.DGSFixedPrice.quote({service:service.value,rowID:pack.value,quantity:Number($('fixed-quantity')?.value||1),condition:condition.value||'unknown',zone:$('fixed-zone')?.value||'unknown',petHair:$('fixed-pets')?.checked||false,additionalRow:$('fixed-headboard')?.value||'',stores:Number($('fixed-stores')?.value||0)});}
 function orientation(){const e=fixedEstimate(),r=window.DGSFixedPrice.row(pack.value);if(!e.available)return 'Preisübersicht\nGesamtpreis nach persönlicher Bestätigung.'+(service.value==='auto'?'\n'+autoHandover($('fixed-zone')?.value).label:'');const unit=r.unit==='je Termin'?' pro Reinigung':'';const lines=['Ihre Übersicht',r.label+(e.quantity>1?' · '+e.quantity+' Pakete':''),...e.additional];if(e.minimumApplied)lines.push('Mindestauftrag ersetzt den tieferen Betrag: CHF 150');if(e.total!==null&&service.value!=='teppichreinigung')lines.push('Gesamtpreis: CHF '+e.total+unit+' inkl. MwSt.');else {lines.push('Paket und Zusätze: CHF '+e.min+unit+' inkl. MwSt.');lines.push('Gesamtpreis nach persönlicher Bestätigung.');}if(service.value==='auto')lines.push(autoHandover($('fixed-zone')?.value).label);else if(service.value==='matratzenreinigung')lines.push('Eine Liegefläche und zugängliche Seiten.');else if(service.value==='teppichreinigung')lines.push('Material und Abholtermin noch bestätigen.');else if(!e.travelConfirmed)lines.push('Anfahrt noch klären.');return lines.join('\n');}
 function renderOverview(){
  if(!$('quote-price-label')){
   $('fixed-selection-summary').replaceChildren(...orientation().split('\n').flatMap((line,i)=>{const n=document.createElement(line==='Ihre Übersicht'||line.startsWith('Gesamtpreis:')?'strong':'span');n.textContent=line;return i?[document.createElement('br'),n]:[n];}));
   return;
  }
  const prices=window.DGSFixedPrice,estimate=fixedEstimate(),row=prices.row(pack.value),zone=$('fixed-zone')?.value;
  const auto=service.value==='auto',rug=service.value==='teppichreinigung';
  const extraRequest=Boolean($('combine-services').value.trim());
  const complete=estimate.available&&estimate.total!==null&&!rug&&!extraRequest;
  const amount=estimate.available?(complete?estimate.total:estimate.min):null;
  const notes=[];
  if(estimate.available){
   const unit=row.unit==='je Termin'?'Pro Reinigung, inkl. MwSt.':'Inkl. MwSt.';
   notes.push(unit);
   if(estimate.minimumApplied)notes.push('Mindestauftrag berücksichtigt.');
   if(estimate.additional.length)notes.push('Gewählte Zusätze eingerechnet.');
   if(!estimate.scopeConfirmed)notes.push('Zustand und Umfang noch klären.');
   if(service.value==='moebelreinigung')notes.push('Für die ausgewählten Textilpolster.');
   if(rug){
    notes.push('Material und Abholtermin noch bestätigen.');
    notes.push(estimate.travelConfirmed?'Gebündelte Abholung und Rückgabe bis 15 km ab Rorschach.':zone==='outside15'?'Abholung ausserhalb von 15 km persönlich klären.':'Abholung und Rückgabe noch klären.');
   }else if(!auto){
    notes.push(estimate.travelConfirmed?'Anfahrt bis 15 km ab Rorschach inklusive.':zone==='outside15'?'Anfahrt über 15 km persönlich klären.':'Anfahrt noch klären.');
   }
  }else if(estimate.reason){
   notes.push(estimate.reason);
  }
  if(auto){
   const handover=autoHandover(zone);
   notes.push(handover.value==='discuss'?'Übergabe noch klären.':handover.value==='outside15'?'Abholung weiter als 15 km persönlich klären.':handover.label);
  }
  if(extraRequest)notes.push('Weitere Wünsche werden separat geprüft.');
  if(complete)notes.push('Preis und Umfang vor Auftrag bestätigen.');
  else if(estimate.available)notes.push('Gesamtpreis folgt mit der Offerte.');

  const setText=(id,value)=>{const element=$(id);if(element.textContent!==value)element.textContent=value;};
  const amountElement=$('quote-price-amount');
  setText('quote-price-label',complete?'Gesamtpreis':amount!==null?'Paketpreis':'Gesamtpreis folgt mit der Offerte');
  amountElement.hidden=amount===null;
  setText('quote-price-amount',amount===null?'':new Intl.NumberFormat('de-CH',{style:'currency',currency:'CHF',minimumFractionDigits:0,maximumFractionDigits:2}).format(amount));
  setText('quote-price-note',notes.join(' '));

  $('quote-price-details').hidden=!row;
  setText('quote-price-package',row?row.label+(estimate.quantity>1?' · '+estimate.quantity+' Pakete':''):'');
  const headboard=prices.row($('fixed-headboard')?.value);
  const storePrice=prices.row('fp-060')?.grossCHF;
  const stores=Number($('fixed-stores')?.value||0);
  const extras=(estimate.additional||[]).map(detail=>{
   if(headboard&&detail===headboard.label)return detail+': CHF '+headboard.grossCHF;
   if(row?.group==='fenster'&&stores&&storePrice!=null)return detail+': CHF '+stores*storePrice;
   return detail;
  });
  $('quote-price-extras').hidden=!extras.length;
  setText('quote-price-extras',extras.join(' · '));
  setText('quote-price-scope',row?$('selected-package-scope').textContent:'');
 }
 function summary(){return requestSummary({serviceLabel:label(),scope:selectedScope()+(window.DGSQuoteWizard?.scope()?' Auswahl: '+window.DGSQuoteWizard.scope():''),orientation:orientation(),place:place.value.trim()});}
 function renderPrice(){const F=window.DGSFixedPrice;F.render(document.getElementById('price-orientation'),service.value,false);$('price-orientation-note').textContent='';$('price-options').hidden=false;$('package-field').hidden=F.options(service.value).length===0;$('cleaning-tier-field').hidden=true;$('auto-handover-field').hidden=true;$('price-scope').textContent='Vereinbarter Umfang zum Fixpreis. Extras nur nach Absprache.';$('price-travel').textContent=service.value==='auto'||service.value==='autopolsterreinigung'?'Stationäre Reinigung in Rorschach. Abholung und Rückgabe bis 15 km nach Vereinbarung kostenlos; weitere Strecken persönlich klären.':'Anfahrt bis 15 km ab Rorschach inklusive; darüber auf Anfrage.';window.DGSFixedPreviewForm?.sync(service.value);}
 function update(){
  syncContact();validateDates();const auto=service.value==='auto',withScope=['auto','polsterreinigung','endreinigung-abnahmegarantie'].includes(service.value);
  if(auto)handover.value=autoHandover($('fixed-zone')?.value).value;
  setName(pack,'Paket',Object.hasOwn(catalog,service.value)&&pack.value!=='custom');setName(tier,'Autoreinigung_Umfang',auto&&['basis','intensiv'].includes(tier.value));setName(condition,'Zustand',['normal','special'].includes(condition.value));setName(handover,'Auto_Uebergabe',auto&&handover.value!=='discuss');
  $('quote-location').value=auto?'rorschach':'unknown';
  const limit=Boolean(form.querySelector('[data-budget-mode="limit"]:checked'));budget.disabled=!limit;$('budget-field').hidden=!limit;
  const parts=Object.hasOwn(catalog,service.value)?[label()]:[];if(pack.value!=='custom'&&pack.selectedOptions.length)parts.push(pack.selectedOptions[0].text);if(auto&&tier.value)parts.push(tier.selectedOptions[0].text);
  const regionalContext=ctx.region?' Region: '+regionNames[ctx.region]+'. PLZ / Ort: __.':service.value==='polsterreinigung'?' PLZ / Ort: __.':'';
  const message=(parts.length?'Guten Tag, ich möchte '+parts.join(' · ')+' anfragen.':'Guten Tag, ich möchte eine Reinigung unverbindlich anfragen.')+regionalContext+' Bitte nennen Sie mir den Gesamtpreis und einen möglichen Termin.';
  document.querySelectorAll('[data-quote-whatsapp]').forEach(link=>{link.href='https://wa.me/41765024998?text='+encodeURIComponent(message);link.setAttribute('aria-label',parts.length?parts.join(' · ')+' per WhatsApp anfragen':'Per WhatsApp anfragen');});
  selectedInclusions();$('quote-combination-note').hidden=!$('combine-services').value.trim();{const r=window.DGSFixedPrice.row(pack.value),caption=pack.selectedOptions[0]?.textContent||'',detail=$('selected-package-detail');detail.textContent=r?.label||'';const norm=x=>x.toLowerCase().replace(/[^a-z0-9äöü]/g,'');detail.hidden=!r||norm(caption)===norm(r.label);}renderOverview();$('quote-summary').value=summary();send.disabled=submissionLocked(form)||!Object.hasOwn(catalog,service.value);
 }
 function reportContact(){if(!isTest&&!panel.hidden){try{window.DGSMeasurement?.step('quote','contact',false);}catch{}}}
 function showService(value,focus=true){
  if(!Object.hasOwn(catalog,value))return;
  if(previousService)perService.set(previousService,{pkg:pack.value,tier:tier.value,condition:condition.value,handover:handover.value});
  service.value=value;packageList();const stored=perService.get(value)||{pkg:'custom',tier:'',condition:'',handover:'discuss'};
  if(Array.from(pack.options).some(option=>option.value===stored.pkg))pack.value=stored.pkg;tier.value=stored.tier;condition.value=stored.condition;handover.value=stored.handover;previousService=value;
  $('selected-service').textContent=label();$('selected-service-row').hidden=false;choice.hidden=true;panel.hidden=false;
  const auto=['auto','autopolsterreinigung'].includes(value);$('customer-place-label').textContent=auto?'Ihre PLZ / Ihr Ort *':'PLZ / Ort der Reinigung *';
  renderPrice();update();if(!form.dataset.choiceWizard)reportContact();if(focus&&!form.dataset.choiceWizard){place.focus({preventScroll:true});panel.scrollIntoView({block:'start',behavior:'auto'});}
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

