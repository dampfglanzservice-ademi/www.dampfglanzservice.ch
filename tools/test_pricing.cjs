'use strict';
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
require('../fixed-prices.js');
const {calculate, estimate, packages} = require('../pricing.js');
const {classifyContact} = require('../quote-request.js');

const page = readFileSync(join(__dirname, '../offerte/index.html'), 'utf8');
const loadedScripts = [...page.matchAll(/<script[^>]+src="([^"?]+)(?:\?[^"]*)?"/g)].map(match => match[1]);
for (const [before, after] of [
  ['/fixed-prices.js', '/pricing.js'], ['/fixed-form-options.js', '/quote-request.js'],
  ['/pricing.js', '/quote-request.js'], ['/quote-request.js', '/inquiry-tracking.js'],
]) {
  assert.ok(loadedScripts.includes(before) && loadedScripts.includes(after));
  assert.ok(loadedScripts.indexOf(before) < loadedScripts.indexOf(after), before + ' before ' + after);
}
const optionsSource = readFileSync(join(__dirname, '../fixed-form-options.js'), 'utf8');
const quoteSource = readFileSync(join(__dirname, '../quote-request.js'), 'utf8');
for (const id of ['fixed-quantity', 'fixed-zone', 'fixed-pets', 'fixed-headboard', 'fixed-stores']) {
  // The price controls are presentation inputs. The submitted summary carries their effects.
  const control = optionsSource.match(new RegExp('<(?:input|select)[^>]*id="' + id + '"[^>]*>'))?.[0];
  assert.ok(control, id);
  assert.doesNotMatch(control, /\sname=/);
  assert.ok(quoteSource.includes("$('" + id + "')"), id);
}
const summaryInput = page.match(/<input\b[^>]*id="quote-summary"[^>]*>/)?.[0];
assert.ok(summaryInput?.includes('name="Angebotsübersicht"'));
assert.match(quoteSource, /\$\('quote-summary'\)\.value=summary\(\)/);
const budgetInput = page.match(/<input\b[^>]*\bid="budget"[^>]*>/)?.[0];
assert.ok(budgetInput);
for (const attribute of ['name="Preisvorschlag_CHF"', 'type="number"', 'min="0"', 'step="0.01"']) {
  assert.ok(budgetInput.includes(attribute), attribute);
}
assert.match(budgetInput, /\bdisabled\b/);

for (const [service, list] of Object.entries(packages)) {
  for (const [key] of list) {
    const zone = service === 'auto' ? 'self' : 'within15';
    const baseline = estimate(service, key, '', 'normal', zone);
    for (const amount of [0, 0.01, 1, 50, 99, 150, 1000000, '', null]) {
      const result = calculate(service, key, amount);
      assert.equal(result.valid, true, service + '/' + key);
      assert.equal(result.budget, amount === '' ? null : amount);
      assert.equal(result.automatic, false);
      assert.equal(result.proposal, undefined);
      assert.deepEqual(estimate(service, key, '', 'normal', zone), baseline);
    }
    for (const amount of ['bad', Infinity, NaN]) {
      assert.equal(calculate(service, key, amount).valid, false);
    }
  }
}
assert.equal(calculate('unknown', 'custom', 50).valid, false);
assert.equal(calculate('auto', 'unknown', 50).valid, false);
assert.deepEqual(classifyContact(' local@example.invalid '), {email: 'local@example.invalid', phone: ''});
assert.deepEqual(classifyContact('+41 00 000 00 00'), {email: '', phone: '+41 00 000 00 00'});
for (const invalid of ['', 'not-an-email@', '123', 'call me 000000000']) {
  assert.equal(classifyContact(invalid), null);
}
console.log('Optional budgets, package-price independence and the email/phone input passed.');
