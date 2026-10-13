'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('inquiry-tracking.js','utf8');
const now=Date.now(),KEY='dgs-inquiry-pending-v1';
function run({consent=true,pending=null,path='/anfrage-gesendet/',referrer='https://formsubmit.co/',prevented=false,blocked=false,analytics=true}={}){
 const data=new Map(pending?[[KEY,JSON.stringify(pending)]]:[]),events=[],listeners=[],tasks=[];
 const storage={getItem:k=>{if(blocked)throw Error('blocked');return data.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');data.set(k,v);},removeItem:k=>{if(blocked)throw Error('blocked');data.delete(k);}};
 const sandbox={URL,Date,Number,JSON,location:{pathname:path},localStorage:{getItem:()=>JSON.stringify({version:1,analytics:consent,at:now})},sessionStorage:storage,queueMicrotask:fn=>tasks.push(fn),document:{referrer,querySelectorAll:()=>path==='/offerte/'?[{id:'quote-form',addEventListener:(name,fn)=>listeners.push(fn)}]:[]},window:analytics?{gtag:(...args)=>events.push(args)}:{}};
 vm.runInNewContext(source,sandbox);for(const fn of listeners)fn({defaultPrevented:prevented});for(const fn of tasks)fn();
 return {data,events,sandbox};
}
const valid={at:now,kind:'quote'};
assert.equal(run({pending:valid}).events.length,1);
assert.equal(run({pending:{at:now,kind:'contact'}}).events[0][2].form_kind,'contact');
for(const options of [{},{pending:valid,consent:false},{pending:valid,referrer:''},{pending:valid,referrer:'https://formsubmit.co.evil.example/'},{pending:valid,referrer:'http://formsubmit.co/'},{pending:{at:now-31*60000,kind:'quote'}},{pending:{at:now+60000,kind:'quote'}},{pending:{at:'yesterday',kind:'quote'}},{pending:{at:now,kind:'unknown'}},{pending:valid,blocked:true},{pending:valid,analytics:false}])assert.equal(run(options).events.length,0,JSON.stringify(options));
const once=run({pending:valid});vm.runInNewContext(source,once.sandbox);assert.equal(once.events.length,1,'reload must not recount');
assert.ok(run({path:'/offerte/'}).data.has(KEY));
assert.ok(!run({path:'/offerte/',prevented:true}).data.has(KEY));
assert.ok(!run({path:'/offerte/',consent:false}).data.has(KEY));
assert.doesNotThrow(()=>run({path:'/offerte/',blocked:true}));
assert.deepEqual(Object.keys(JSON.parse(run({path:'/offerte/'}).data.get(KEY))).sort(),['at','kind']);
console.log('18 tracking scenarios passed: consent, cancelled submission, direct visits, provider origin, expiry, storage failure and duplicate suppression.');
