const assert=require('node:assert/strict');
const {calculate,packages}=require('../pricing.js');
// Regression: every former priced service must accept customer amounts below its former floor.
for(const [service,list] of Object.entries(packages))for(const [key] of list){
 for(const amount of [0,0.01,1,50,99,150,1000000]){
  const result=calculate(service,key,amount);
  assert.equal(result.valid,true,`${service}: ${amount} must be accepted`);
  assert.equal(result.budget,amount);assert.equal(result.automatic,false);assert.equal(result.proposal,undefined);
 }
 for(const amount of ['',null,-1,'bad',Infinity])assert.equal(calculate(service,key,amount).valid,false);
}
assert.equal(calculate('unknown','custom',50).valid,false);
assert.equal(calculate('auto','unknown',50).valid,false);
console.log('All services: free unchanged proposals, zero and low amounts, no automatic fixed price, invalid input checks passed.');
