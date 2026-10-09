const assert=require('node:assert/strict');
const {calculate}=require('../pricing.js');
for(const [budget,proposal] of [['',100],[null,100],[0,100],[50,100],[100,100],[150,125],[200,150],[150.5,125.25],[100000,50050]]){
 const result=calculate('auto',budget);assert.equal(result.valid,true);assert.equal(result.proposal,proposal);assert.ok(result.proposal>=100);
}
assert.equal(calculate('auto',50).belowMinimum,true);
assert.equal(calculate('auto',150).belowMinimum,false);
for(const budget of [-1,'nonsense',Infinity,100001])assert.equal(calculate('auto',budget).valid,false);
for(const service of ['wohnungsreinigung','endreinigung-abnahmegarantie','polsterreinigung']){const result=calculate(service,150);assert.equal(result.proposal,null);assert.equal(result.automatic,false);assert.equal(result.budget,150)}
console.log('Pricing checks passed: minimum, mean, decimals, invalid budgets and manual services.');
