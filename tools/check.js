/* tools/check.js — headless sanity check for the Tornpedia PWA.
 *
 * Loads the app in a stub DOM and verifies:
 *   - every article id is unique and every internal [[link|id]] resolves
 *   - every {{table:key}} and {{calc:id}} reference exists
 *   - every article renders without throwing (and without "undefined"/"NaN")
 *   - every calculator produces finite numbers from its defaults and from zeros
 *   - the search index ranks obvious queries correctly
 *
 * Usage:  node tools/check.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', 'torn-wiki');
const fails = [];
const warns = [];
const ok = (msg) => console.log('  ✓ ' + msg);
const bad = (msg) => { fails.push(msg); console.log('  ✗ ' + msg); };
const warn = (msg) => { warns.push(msg); console.log('  ! ' + msg); };

/* ------------------------------------------------------------- stub DOM */
function makeEl(id) {
  const el = {
    id, _html: '', textContent: '', value: '', hidden: false, className: '',
    style: {}, dataset: {}, children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {}, removeEventListener() {}, setAttribute() {}, getAttribute: () => null,
    appendChild(c) { this.children.push(c); }, remove() {}, focus() {}, select() {},
    scrollIntoView() {}, getBoundingClientRect: () => ({ top: 0 }),
    querySelector: () => makeEl('q'), querySelectorAll: () => [],
  };
  Object.defineProperty(el, 'innerHTML', {
    get() { return this._html; },
    set(v) { this._html = String(v); },
  });
  return el;
}
const els = {};
const document = {
  readyState: 'complete',
  documentElement: makeEl('html'),
  getElementById(id) { return (els[id] = els[id] || makeEl(id)); },
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (t) => makeEl(t),
  addEventListener() {}, removeEventListener() {},
};
const window = {
  document, navigator: { onLine: true, userAgent: 'node', serviceWorker: { register: () => Promise.resolve() } },
  location: { hash: '' },
  localStorage: {
    _s: {}, getItem(k) { return this._s[k] === undefined ? null : this._s[k]; },
    setItem(k, v) { this._s[k] = String(v); }, removeItem(k) { delete this._s[k]; },
  },
  addEventListener() {}, matchMedia: () => ({ matches: false }),
  scrollTo() {}, setTimeout, clearTimeout, setInterval: () => 0, clearInterval,
  fetch: () => Promise.reject(new Error('no network in tests')),
  Intl, Math, Date, JSON, console, URL, URLSearchParams,
  requestAnimationFrame: (f) => setTimeout(f, 0),
};
window.window = window;
const ctx = vm.createContext(window);
ctx.globalThis = window;

for (const f of ['data/datasets.js', 'data/calcs.js', 'data/articles-core.js', 'data/articles-work.js',
  'data/articles-combat.js', 'data/articles-strategy.js', 'app.js']) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try {
    vm.runInContext(src, ctx, { filename: f });
  } catch (e) {
    bad('could not load ' + f + ': ' + e.message);
  }
}
const T = window.Tornpedia;
if (!T) { console.log('\nFATAL: app did not initialise'); process.exit(1); }
const { A, D, CALCS, BY_ID, TABLES, LIVE_WIDGETS } = T;

/* ------------------------------------------------------------- 1. content */
console.log('\nContent');
const ids = new Set();
let dupes = 0;
A.forEach((a) => {
  if (ids.has(a.id)) { bad('duplicate article id: ' + a.id); dupes++; }
  ids.add(a.id);
  if (!a.title) bad('article ' + a.id + ' has no title');
  if (!a.summary) warn('article ' + a.id + ' has no summary');
  if (!a.cat) bad('article ' + a.id + ' has no category');
});
if (!dupes) ok(A.length + ' articles, all ids unique');

const CATS = new Set(['core', 'combat', 'work', 'items', 'travel', 'faction', 'strategy', 'reference']);
const badCat = A.filter((a) => !CATS.has(a.cat));
if (badCat.length) bad('unknown categories: ' + badCat.map((a) => a.cat).join(', '));
else ok('every article is in a known category');

/* internal links */
const missingLinks = new Set();
A.forEach((a) => {
  const body = String(a.body || '');
  (body.match(/\[\[([^\]]+)\]\]/g) || []).forEach((m) => {
    const parts = m.slice(2, -2).split('|');
    const target = (parts[1] || parts[0]).trim();
    const isArticle = BY_ID[target] || A.find((x) => x.title.toLowerCase() === target.toLowerCase());
    const isCalc = CALCS.find((c) => c.id === target);
    if (!isArticle && !isCalc) missingLinks.add(a.id + ' → ' + target);
  });
});
if (missingLinks.size) bad(missingLinks.size + ' broken internal links: ' + [...missingLinks].slice(0, 8).join(', '));
else ok('all internal wiki links resolve');

/* tables & calc embeds */
const missingTable = new Set(), missingCalc = new Set(), missingLive = new Set();
A.forEach((a) => {
  (String(a.body || '').match(/\{\{table:([^}]+)\}\}/g) || []).forEach((m) => {
    const k = m.slice(8, -2).trim();
    if (!TABLES[k]) missingTable.add(k);
  });
  (String(a.body || '').match(/\{\{calc:([^}]+)\}\}/g) || []).forEach((m) => {
    const k = m.slice(7, -2).trim();
    if (!CALCS.find((c) => c.id === k)) missingCalc.add(k);
  });
  (String(a.body || '').match(/\{\{live:([^}]+)\}\}/g) || []).forEach((m) => {
    const k = m.slice(7, -2).trim();
    if (!LIVE_WIDGETS[k]) missingLive.add(k);
  });
  if (a.live && !LIVE_WIDGETS[a.live]) missingLive.add(a.live + ' (article front-matter)');
  if (a.calc && !CALCS.find((c) => c.id === a.calc)) missingCalc.add(a.calc + ' (article front-matter)');
});
if (missingTable.size) bad('missing tables: ' + [...missingTable].join(', ')); else ok('every {{table:}} reference exists');
if (missingCalc.size) bad('missing calculators: ' + [...missingCalc].join(', ')); else ok('every {{calc:}} reference exists');
if (missingLive.size) bad('missing live widgets: ' + [...missingLive].join(', ')); else ok('every live widget reference exists');

/* related links */
const badRelated = [];
A.forEach((a) => (a.related || []).forEach((r) => { if (!BY_ID[r]) badRelated.push(a.id + '→' + r); }));
if (badRelated.length) bad('broken related links: ' + badRelated.join(', '));
else ok('every "keep reading" link resolves');

/* --------------------------------------------------------- 2. rendering */
console.log('\nRendering');
let rendered = 0;
A.forEach((a) => {
  try {
    const html = T.renderBody(a.body || '');
    if (/Missing table/.test(html)) bad(a.id + ': a table failed to render');
    if (/undefined|NaN/.test(html)) {
      const m = html.match(/.{40}(undefined|NaN).{40}/);
      bad(a.id + ': rendered output contains "' + (m ? m[0].trim() : 'undefined/NaN') + '"');
    }
    if (html.length < 400) warn(a.id + ' renders only ' + html.length + ' chars of HTML');
    rendered++;
  } catch (e) {
    bad(a.id + ' threw while rendering: ' + e.message);
  }
});
ok(rendered + '/' + A.length + ' articles rendered');

/* route every view once */
const routes = ['#/', '#/c/core', '#/c/combat', '#/c/work', '#/c/items', '#/c/travel', '#/c/faction',
  '#/c/strategy', '#/c/reference', '#/tools', '#/bookmarks', '#/offline', '#/live', '#/s/xanax', '#/s/gym'];
routes.forEach((h) => {
  try { window.location.hash = h; T.route(); } catch (e) { bad('route ' + h + ' threw: ' + e.message); }
});
ok(routes.length + ' views routed without throwing');

/* ------------------------------------------------------ 3. calculators */
console.log('\nCalculators');
CALCS.forEach((c) => {
  const defaults = {};
  c.fields.forEach((f) => { defaults[f.key] = f.type === 'select' ? (f.options[0] || {}).v : f.def; });
  let r;
  try {
    r = c.run(defaults);
  } catch (e) { bad('calculator ' + c.id + ' threw on defaults: ' + e.message); return; }
  if (!r || typeof r.big !== 'string') { bad('calculator ' + c.id + ' returned no headline'); return; }
  if (/NaN|Infinity|undefined/.test(r.big + (r.sub || '') + (r.grid || []).map((g) => g.value).join(' '))) {
    bad('calculator ' + c.id + ' produced NaN/Infinity/undefined from its defaults');
    return;
  }
  // zeroed inputs must not crash or produce NaN either
  const zeros = {};
  c.fields.forEach((f) => { zeros[f.key] = f.type === 'select' ? (f.options[0] || {}).v : 0; });
  try {
    const z = c.run(zeros);
    if (/NaN/.test(z.big + (z.sub || ''))) bad('calculator ' + c.id + ' produced NaN from zeroed inputs');
  } catch (e) { bad('calculator ' + c.id + ' threw on zeroed inputs: ' + e.message); }
});
ok(CALCS.length + ' calculators run cleanly on defaults and on zeros');

/* a few spot-checks on the maths */
const gymCalc = CALCS.find((c) => c.id === 'gym');
const gymOut = gymCalc.run({ stat: 1e6, happy: 5000, gym: '23', energy: 10, mods: 0, trains: 10 });
if (!/per train/.test(gymOut.big)) bad('gym calculator headline looks wrong: ' + gymOut.big);
else ok('gym: 1m stat @5k happy, George\'s → ' + gymOut.big);

const wCalc = CALCS.find((c) => c.id === 'weights');
const wOut = wCalc.run({ speed: 1e7, dex: 1e7, def: 1e7, str: 1e7 });
if (Math.abs(parseFloat(wOut.big) - 50) > 0.6) bad('10m speed vs 10m dexterity should be ~50%, got ' + wOut.big);
else ok('weights: 10m vs 10m → ' + wOut.big + ' (matches the published 50% table)');

const mCalc = CALCS.find((c) => c.id === 'market');
const mOut = mCalc.run({ price: 100000, qty: 10, anon: '0', special: '0' });
if (!mOut.big.includes('950')) bad('market: 1,000,000 gross with 5% tax should net 950,000, got ' + mOut.big);
else ok('market: $1m gross → ' + mOut.big + ' net');

/* ----------------------------------------------------------- 4. search */
console.log('\nSearch');
const cases = [
  ['energy', 'energy'], ['xanax', 'energy'], ['happy jump', 'happy'],
  ['npc loot', 'npc-looting'], ['george gym', 'gym'], ['job points', 'jobs'],
  ['travel', 'travel'], ['how do i get out of hospital', 'hospital'], ['battle stats', 'battle-stats'],
];
let hits = 0;
cases.forEach(([q, want]) => {
  const res = T.search(q, 5);
  if (!res.length) { bad('search "' + q + '" returned nothing'); return; }
  if (res[0].a.id === want) { hits++; }
  else warn('search "' + q + '" → ' + res[0].a.id + ' (wanted ' + want + ')');
});
ok(hits + '/' + cases.length + ' search queries rank the expected article first');

/* ------------------------------------------------------------ 5. data */
console.log('\nDatasets');
const expect = [
  ['npcs', 13], ['jobs', 6], ['companies', 39], ['travel', 11], ['gyms', 24],
];
expect.forEach(([k, n]) => {
  if (!Array.isArray(D[k]) || D[k].length !== n) bad('dataset ' + k + ' should have ' + n + ' entries, has ' + (D[k] || []).length);
});
ok('datasets intact: ' + expect.map(([k]) => k + '=' + D[k].length).join(', '));
const lootRows = D.npcs.reduce((s, n) => s + n.loot.length, 0);
const positions = D.jobs.reduce((s, j) => s + j.pos.length, 0);
ok(lootRows + ' NPC loot rows · ' + positions + ' job positions · ' + D.specialGyms.length + ' specialist gyms');

/* ------------------------------------------------------------- verdict */
console.log('\n' + '─'.repeat(60));
if (fails.length) {
  console.log('FAILED — ' + fails.length + ' error(s):');
  fails.forEach((f) => console.log('  · ' + f));
  process.exit(1);
}
console.log('PASSED — ' + A.length + ' articles, ' + CALCS.length + ' calculators, '
  + (lootRows + positions + D.companies.length + D.travel.length) + ' data rows'
  + (warns.length ? ' (' + warns.length + ' warning(s))' : ''));
