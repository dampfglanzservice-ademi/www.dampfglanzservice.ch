'use strict';
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const vm = require('node:vm');
const code = readFileSync(join(__dirname, '../inquiry-tracking.js'), 'utf8');
const endpoint = 'https://usebasin.com/f/local-stub';
const inquiryId = 'bbbbbbbb-2222-4444-aaaa-000000000001';
const photo = {size: 7};

class LocalFormData {
  constructor(form) { this.entries = form ? [...form.fields] : []; }
  get(name) { return this.entries.find(([key]) => key === name)?.[1] ?? null; }
  has(name) { return this.entries.some(([key]) => key === name); }
  append(name, value) { this.entries.push([name, value]); }
  delete(name) { this.entries = this.entries.filter(([key]) => key !== name); }
  set(name, value) { this.delete(name); this.append(name, value); }
  [Symbol.iterator]() { return this.entries[Symbol.iterator](); }
}

async function run({
  ok = true, result = {success: true}, failure = false, test = false,
  cancelled = false, valid = true, honeypot = '', action = endpoint,
  duplicate = false, phoneOnly = false, attributable = false,
} = {}) {
  let submit;
  const requests = [], events = [], states = [], links = [];
  const status = {
    textContent: '',
    append(node) { if (node.href) links.push(node.href); },
    focus() {}, scrollIntoView() {},
  };
  const button = {disabled: false};
  const fields = [
    ['Ort', '9000 St. Gallen'], ['Leistung', 'polsterreinigung'], ['Paket', 'fp-010'],
    [phoneOnly ? 'Telefon' : 'email', phoneOnly ? '+41 00 000 00 00' : 'local@example.invalid'],
    ['attachment', photo], ['attachment2', {size: 0}], ['Terminvorschlag_1', '2026-12-04'],
    ['Auftragsdetails', 'Synthetischer Auftrag'], ['DGS_Anfrageregion', 'St. Gallen'],
    ['DGS_Kampagne_ID', 'untrusted'], ['_honey', honeypot],
    ['Angebotsübersicht', 'Leistung: Sofa\nGewünschter Leistungsumfang: Zwei Sitzplätze\nAngezeigter Preisrahmen der Hauptleistung: CHF 200\nOrt: 9000 St. Gallen'],
  ];
  const selected = {Leistung: 'Sofa & Polster', Paket: 'Sofa · 2 Plätze'};
  const form = {
    id: 'quote-form', action, fields, dataset: {shortRequest: 'true'},
    reportValidity: () => valid,
    elements: {namedItem: name => name === '_honey' ? {value: honeypot}
      : selected[name] ? {tagName: 'SELECT', selectedOptions: [{text: selected[name]}]} : null},
    querySelector: selector => selector === '[type="submit"]' ? button : status,
    addEventListener(event, handler) { assert.equal(event, 'submit'); submit = handler; },
    dispatchEvent(event) { states.push(event.detail.state); },
  };
  const measurement = Object.fromEntries(['attempted', 'completed', 'failed'].map(
    event => [event, (...args) => events.push([event, ...args])]
  ));
  vm.runInNewContext(code, {
    window: {
      crypto: {randomUUID: () => inquiryId}, DGSMeasurement: measurement,
      DGSCampaignAttribution: attributable ? {get: () => ({campaignId: '24457117427', campaignName: 'Sofa', entryPath: '/polsterreinigung/'})} : undefined,
    },
    document: {
      querySelectorAll(selector) { assert.equal(selector, 'form[data-dgs-backend="basin"]'); return [form]; },
      createElement: tagName => ({tagName}), createTextNode: textContent => ({textContent}),
    },
    location: {href: 'https://example.invalid/offerte/' + (test ? '?dgs_test=1' : '')},
    URL, FormData: LocalFormData, AbortController, setTimeout: () => 1, clearTimeout() {},
    CustomEvent: class { constructor(_type, {detail}) { this.detail = detail; } },
    async fetch(url, options) {
      assert.equal(url, endpoint);
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Accept, 'application/json');
      requests.push(options.body);
      if (failure) throw Error('Offline');
      return {ok, json: async () => result};
    },
  });
  const trigger = () => submit({defaultPrevented: cancelled, preventDefault() {}});
  await trigger();
  if (duplicate) await trigger();
  return {requests, events, states, links, status, button};
}

(async () => {
  const accepted = await run({duplicate: true});
  assert.equal(accepted.requests.length, 1);
  const [payload] = accepted.requests;
  assert.deepEqual([...payload].slice(0, 4).map(([name]) => name), ['email', 'Ort', 'Leistung', 'Paket']);
  for (const [name, value] of Object.entries({
    email: 'local@example.invalid', Leistung: 'Sofa & Polster', Paket: 'Sofa · 2 Plätze',
    Leistungsumfang: 'Zwei Sitzplätze', Preisrahmen: 'CHF 200', Terminvorschlag_1: '04.12.2026',
    Auftragsdetails: 'Synthetischer Auftrag', DGS_Anfrageregion: 'St. Gallen',
    DGS_Anfragekennung: inquiryId, DGS_Formular: 'quote',
  })) assert.equal(payload.get(name), value, name);
  assert.equal(payload.get('attachment'), photo);
  for (const name of ['Angebotsübersicht', 'attachment2', 'DGS_Kampagne_ID', 'DGS_Funktionstest', '_honey']) {
    assert.equal(payload.has(name), false, name);
  }
  assert.deepEqual(accepted.events, [['attempted', 'quote', false], ['completed', 'quote', inquiryId, false]]);
  assert.deepEqual(accepted.states, ['sending', 'success']);
  assert.equal(accepted.button.disabled, true);

  const phone = await run({phoneOnly: true, attributable: true});
  assert.equal(phone.requests[0].get('Telefon'), '+41 00 000 00 00');
  assert.equal(phone.requests[0].has('email'), false);
  assert.equal(phone.requests[0].get('DGS_Kampagne_ID'), '24457117427');

  for (const options of [{ok: false}, {result: {success: false}}, {result: {}}, {failure: true}]) {
    const response = await run(options);
    assert.equal(response.requests.length, 1);
    assert.deepEqual(response.events, [['attempted', 'quote', false], ['failed', 'quote', false]]);
    assert.deepEqual(response.states, ['sending', 'error']);
    assert.match(response.status.textContent, /nicht bestätigt/);
    assert.deepEqual(response.links, ['tel:+41765024998', 'mailto:info@dampfglanzservice-ademi.ch']);
    assert.equal(response.button.disabled, false);
  }
  const test = await run({test: true, attributable: true});
  assert.equal(test.requests.length, 1);
  assert.equal(test.requests[0].has('DGS_Funktionstest'), true);
  assert.equal(test.requests[0].has('DGS_Kampagne_ID'), false);
  assert.deepEqual(test.events, [['attempted', 'quote', true], ['completed', 'quote', inquiryId, true]]);
  assert.match(test.status.textContent, /Testanfrage/);
  for (const options of [{cancelled: true}, {valid: false}, {honeypot: 'filled'}, {action: 'https://example.invalid/send'}]) {
    const blocked = await run(options);
    assert.equal(blocked.requests.length, 0);
    assert.deepEqual(blocked.events, []);
  }
  console.log('11 offline transport scenarios passed, including attachment, duplicate, consent marker and rejected requests.');
})().catch(error => { console.error(error); process.exitCode = 1; });
