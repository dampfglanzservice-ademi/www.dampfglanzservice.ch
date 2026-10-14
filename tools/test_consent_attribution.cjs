const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../consent.js','utf8');
const NOW=1791972000000;
function run({href='https://www.dampfglanzservice-ademi.ch/offerte/',ref='',saved={version:1,analytics:true,at:NOW-1000},blocked=false}={}){
 const nodes={},listeners={},appended=[];
 for(const id of ['cookie-dialog','cookie-analytics','cookie-accept','cookie-reject','cookie-save'])nodes[id]={addEventListener:(name,fn)=>listeners[id+':'+name]=fn,showModal(){},close(){},checked:false};
 const u=new URL(href),w={};
 const doc={referrer:ref,cookie:'',activeElement:null,getElementById:id=>nodes[id],querySelectorAll:()=>[],addEventListener(){},createElement:()=>({}),head:{append:x=>appended.push(x)},body:{classList:{add(){},remove(){}}},documentElement:{scrollHeight:1000}};
 const context={window:w,document:doc,location:{href,origin:u.origin,pathname:u.pathname,hostname:u.hostname,reload(){}},localStorage:{getItem(){if(blocked)throw Error('blocked');return JSON.stringify(saved)},setItem(){}},Date:{now:()=>NOW},URL,Number,JSON,innerHeight:500,queueMicrotask:fn=>fn()};
 context.Date=function(){return new Date(NOW)};context.Date.now=()=>NOW;w.addEventListener=()=>{};w.scrollY=0;
 vm.runInNewContext(source,context);
 return {config:w.dataLayer?.map(x=>Array.from(x)).find(x=>x[0]==='config')?.[2],appended};
}
const campaign='?leistung=auto&utm_source=google&utm_medium=organic&utm_campaign=gbp_autoinnenreinigung';
let r=run({href:'https://www.dampfglanzservice-ademi.ch/offerte/'+campaign+'&email=private@example.test&name=PRIVATE#SECRET'});
assert.equal(r.config.campaign_name,'gbp_autoinnenreinigung');assert.equal(r.config.campaign_source,'google');assert.equal(r.config.campaign_medium,'organic');
assert.equal(r.config.page_location,'https://www.dampfglanzservice-ademi.ch/offerte/');assert(!JSON.stringify(r.config).includes('PRIVATE'));assert(!JSON.stringify(r.config).includes('private@example'));
assert.equal(run({ref:'https://formsubmit.co/info@example.test'}).config.ignore_referrer,true);
for(const ref of ['https://formsubmit.co.evil.test/','http://formsubmit.co/','https://example.test/?formsubmit.co','https://google.com/search?q=private','',':bad'])assert.equal(run({ref}).config.ignore_referrer,undefined);
assert.equal(run({ref:'https://google.com/search?q=private'}).config.page_referrer,'https://google.com/search');
for(const bad of ['?utm_source=google&utm_medium=organic&utm_campaign=private_name','?utm_source=evil&utm_medium=organic&utm_campaign=gbp_autoinnenreinigung','?utm_source=google&utm_medium=cpc&utm_campaign=gbp_autoinnenreinigung','?utm_source=google&utm_medium=organic'])assert.equal(run({href:'https://www.dampfglanzservice-ademi.ch/'+bad}).config.campaign_name,undefined);
for(const saved of [{version:1,analytics:false,at:NOW},{version:1,analytics:true,at:NOW-181*86400000},{version:1,analytics:true,at:NOW+1000},null])assert.equal(run({saved}).config,undefined);
assert.equal(run({blocked:true}).config,undefined);
assert.equal(run().appended.length,1);assert.equal(run().config.allow_google_signals,false);assert.equal(run().config.allow_ad_personalization_signals,false);
console.log('PASS: known campaign, no arbitrary URL data, provider-only referral exclusion, consent and expiry respected.');
