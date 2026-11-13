'use strict';
const assert = require('node:assert/strict');
const prices = require('../fixed-prices.js');
const {estimate, packages} = require('../pricing.js');
const {contextFromQuery} = require('../quote-request.js');

const combinations = Object.keys(prices.data.services).flatMap(service =>
  prices.options(service).map(row => [service, row])
);
assert.equal(combinations.length, 86);
assert.equal(new Set(combinations.map(([, row]) => row.id)).size, 71);

for (const [service, row] of combinations) {
  const zone = row.group === 'auto' ? 'self' : 'within15';
  const expected = row.group === 'polster' ? Math.max(row.grossCHF, 150) : row.grossCHF;
  assert.ok(packages[service].some(([id]) => id === row.id), service + '/' + row.id);
  const base = estimate(service, row.id, '', 'normal', zone);
  assert.equal(base.total, expected, service + '/' + row.id);
  assert.equal(base.travel, 0);
  assert.equal(base.vatIncluded, true);
  assert.equal(base.binding, false);
  assert.equal(base.needsConfirmation, true);
  for (const condition of ['special', 'unknown']) {
    assert.equal(estimate(service, row.id, '', condition, zone).total, null);
  }
  for (const outside of ['outside15', 'unknown']) {
    const incomplete = estimate(service, row.id, '', 'normal', outside);
    assert.equal(incomplete.total, null);
    assert.equal(incomplete.travelConfirmed, false);
    assert.equal(incomplete.min, expected);
  }
}

for (const [service, rowID, total] of [
  ['polsterreinigung', 'fp-010', 200],
  ['wohnungsreinigung', 'fp-044', 190],
  ['grundreinigung', 'fp-048', 550],
  ['endreinigung-abnahmegarantie', 'fp-052', 650],
  ['fensterreinigung', 'fp-057', 260],
]) {
  assert.equal(estimate(service, rowID, '', 'normal', 'within15').total, total);
}
const regionQuery = '?leistung=endreinigung-abnahmegarantie&preis=fp-052&region=reinigung-toggenburg';
assert.deepEqual(contextFromQuery(regionQuery, packages), {
  service: 'endreinigung-abnahmegarantie', pkg: 'fp-052', tier: '',
  region: 'reinigung-toggenburg', place: '', combination: false,
});
assert.equal(contextFromQuery(regionQuery.replace('fp-052', 'fp-010'), packages).pkg, 'custom');
assert.equal(contextFromQuery(regionQuery.replace('reinigung-toggenburg', 'unknown'), packages).region, '');
assert.equal(contextFromQuery('?leistung=grundreinigung&preis=fp-048&region=reinigungsfirma-arbon', packages).place, 'Arbon');

for (const row of prices.options('auto')) {
  const input = {service: 'auto', rowID: row.id, condition: 'normal'};
  assert.equal(prices.quote({...input, zone: 'pickup15'}).total, row.grossCHF);
  assert.equal(prices.quote({...input, zone: 'pickup15', petHair: true}).total, row.grossCHF + 50);
}
const windows = {service: 'fensterreinigung', rowID: 'fp-057', condition: 'normal', zone: 'within15'};
assert.equal(prices.quote({...windows, stores: 2}).total, 320);
assert.equal(prices.quote({...windows, petHair: true}).available, false);
assert.equal(prices.quote({...windows, service: 'auto'}).available, false);
assert.equal(estimate('auto', 'custom', '', 'normal', 'self').available, false);
assert.equal(prices.combine(['fp-044', 'fp-052']).automatic, false);
console.log('86 service/package combinations, 71 selectable packages, regional preselection and price conditions passed.');
