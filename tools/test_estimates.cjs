'use strict';
const assert=require('node:assert/strict');
const {estimate,calculate}=require('../pricing.js');
const base=estimate('auto','medium','basis','normal','rorschach');
assert.equal(base.available,true);assert.equal(base.binding,false);
const far=estimate('auto','medium','basis','normal','zone50');
assert.equal(far.min-base.min,90);assert.equal(far.max-base.max,90);
assert.ok(estimate('auto','medium','intensiv','normal','rorschach').min>base.min);
for(const zone of ['unknown','away','',null,'zone100'])assert.equal(estimate('auto','medium','basis','normal',zone).available,false);
for(const service of ['auto','polsterreinigung']){
 const key=service==='auto'?'medium':'3';
 for(const condition of ['special','damaged','',null])assert.equal(estimate(service,key,'basis',condition,'rorschach').available,false);
}
for(const service of ['bueroreinigung','endreinigung-abnahmegarantie','other'])assert.equal(estimate(service,service==='endreinigung-abnahmegarantie'?'3.5':'custom','basis','normal','rorschach').available,false);
assert.equal(estimate('auto','medium','invalid','normal','rorschach').available,false);
assert.equal(estimate('auto','unknown','basis','normal','rorschach').available,false);
assert.equal(estimate('polsterreinigung','1','basis','normal','rorschach').min>=150,true);
for(const budget of ['',0,1,99999]){
 assert.equal(calculate('auto','medium',budget).valid,true);
 assert.deepEqual(estimate('auto','medium','basis','normal','rorschach'),base,'customer budget must not alter the public range');
}
console.log('Price orientation passed: travel charged once, special/unknown cases require review, budget independent, no binding booking.');
