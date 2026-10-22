const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../inquiry-tracking.js','utf8');
async function run({ok=true,result={success:true},failure=false,test=false,cancelled=false}={}){
 let handler,sends=0,events=0;const status={},button={},form={id:'quote-form',action:'https://usebasin.com/f/example-endpoint',reportValidity:()=>true,elements:{namedItem:()=>({value:''})},querySelector:s=>s==='[type="submit"]'?button:status,addEventListener:(n,f)=>handler=f};
 vm.runInNewContext(code,{document:{querySelectorAll:()=>[form]},URL,location:{href:'https://www.dampfglanzservice-ademi.ch/offerte/'+(test?'?dgs_test=1':'')},crypto:{randomUUID:()=> 'test-random-id'},FormData:class{delete(){}set(){}},AbortController,setTimeout,clearTimeout,window:{DGSMeasurement:{completed:(k,id,t)=>{if(!t)events++;}}},fetch:async()=>{sends++;if(failure)throw Error('network');return{ok,json:async()=>result};}});
 const event={defaultPrevented:cancelled,preventDefault(){}};
 await handler(event);await handler(event);return{events,sends,status,button};
}
(async()=>{
 let r=await run();assert.equal(r.events,1);assert.equal(r.sends,1);assert.equal(r.button.disabled,true);
 for(const options of [{ok:false},{result:{success:false}},{result:{}},{failure:true}]){r=await run(options);assert.equal(r.events,0);assert.match(r.status.textContent,/nicht bestätigt/);}
 r=await run({test:true});assert.equal(r.events,0);assert.equal(r.sends,1);assert.match(r.status.textContent,/Testanfrage/);
 r=await run({cancelled:true});assert.equal(r.events,0);assert.equal(r.sends,0);
 console.log('Basin adapter checks passed: success once, no duplicate send, HTTP error, rejected/missing success, network error, test exclusion, cancelled validation');
})();
