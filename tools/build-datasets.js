/* tools/build-datasets.js — regenerate lumbercorpedia/data/datasets.js
 *
 * Pulls the verified tables that already live inside LumberCorp 2.0
 * (lumbercorp-2/index.html) and emits them as a plain data file the wiki app
 * can load without any build step. Reference tables that are not in the PDA
 * (gyms, properties, stat weights, medical items) are kept here and were
 * checked against wiki.torn.com.
 *
 * Usage:  node tools/build-datasets.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
/* The app lives at <repo>/lumbercorpedia in the combined LumberCorp repo, and
   at the repo root in the standalone Lumbercorpedia repo. Support both. */
function appRoot() {
  const repo = path.join(__dirname, '..');
  const candidates = [path.join(repo, 'lumbercorpedia'), repo];
  for (const d of candidates) {
    try { if (fs.existsSync(path.join(d, 'index.html'))) return d; } catch (e) { /* ignore */ }
  }
  return candidates[0];
}

const SRC_FILE = path.join(ROOT, 'lumbercorp-2', 'index.html');
if (!fs.existsSync(SRC_FILE)) {
  console.error('Cannot find ' + SRC_FILE);
  console.error('build-datasets reads the verified tables out of the LumberCorp 2.0 PDA.');
  console.error('Run it from inside the lumbercorp2.0 repo, or copy lumbercorp-2/index.html next to this file.');
  process.exit(1);
}
const SRC = fs.readFileSync(SRC_FILE, 'utf8').split('\n');

/* Evaluate a top-level `const NAME = [...]` straight out of the PDA source. */
function grab(name, start, end) {
  const code = SRC.slice(start - 1, end).join('\n');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(code + '\n;__out = ' + name + ';', ctx);
  return ctx.__out;
}

const NPCS = grab('NPCS', 2885, 2999);
const JB_CITY = grab('JB_CITY', 3394, 3448);
const CO_COMPANIES = grab('CO_COMPANIES', 4720, 5036);
const CO_GOALS = grab('CO_GOALS', 5042, 5053);
const DESTINATIONS = grab('DESTINATIONS', 1628, 1678);

/* ------------------------------------------------------------------ PDA data */
const npcs = NPCS.map((n) => ({
  id: n.id, name: n.name, hp: n.hp, tag: n.tag, glyph: n.glyph, season: n.season,
  face: n.face, note: n.note,
  loot: (n.loot || []).map((l) => ({ name: l[0], itemId: l[1], type: l[2], rare: !!l[3], icon: l[4] })),
}));

const jobs = JB_CITY.map((j) => ({
  id: j.id, name: j.name, glyph: j.glyph, tag: j.tag, point: j.point,
  pos: j.pos.map((r) => ({
    title: r[0], man: r[1], int: r[2], end: r[3],
    gMan: r[4], gInt: r[5], gEnd: r[6],
    pay: r[7], points: r[8], promo: r[9], special: r[10],
  })),
}));

const companies = CO_COMPANIES.map((c) => ({
  id: c.id, name: c.n, glyph: c.g, cost: c.cost, emp: c.emp, inc: c.inc, eff: c.eff,
  tag: c.tag, market: c.mk, highlights: c.hl || [],
  specials: (c.s || []).map((s) => ({ star: s[0], name: s[1], cost: s[2], effect: s[3] })),
  pros: c.pro || [], cons: c.con || [],
}));

const travel = DESTINATIONS.map((x) => ({
  country: x.country, city: x.city, flag: x.flag, times: x.times, cost: x.cost,
  items: (x.items || []).map((i) => ({ name: i.n, price: i.price, kind: i.kind })),
}));

const goals = (CO_GOALS || []).map((g) => ({ id: g.id, label: g.label, chip: g.chip, w: g.w }));

/* ------------------------------------------------- reference tables (wiki) */
/* wiki.torn.com/wiki/Gym */
const gyms = [
  { tier: 'Light', name: 'Premier Fitness', cost: 10, energy: 5, str: 2.0, spd: 2.0, def: 2.0, dex: 2.0, next: 200 },
  { tier: 'Light', name: 'Average Joes', cost: 100, energy: 5, str: 2.4, spd: 2.4, def: 2.8, dex: 2.4, next: 500 },
  { tier: 'Light', name: "Woody's Workout", cost: 250, energy: 5, str: 2.8, spd: 3.2, def: 3.0, dex: 2.8, next: 1000 },
  { tier: 'Light', name: 'Beach Bods', cost: 500, energy: 5, str: 3.2, spd: 3.2, def: 3.2, dex: 0, next: 2000 },
  { tier: 'Light', name: 'Silver Gym', cost: 1000, energy: 5, str: 3.4, spd: 3.6, def: 3.4, dex: 3.2, next: 2750 },
  { tier: 'Light', name: 'Pour Femme', cost: 2500, energy: 5, str: 3.4, spd: 3.6, def: 3.6, dex: 3.8, next: 3000 },
  { tier: 'Light', name: 'Davies Den', cost: 5000, energy: 5, str: 3.7, spd: 0, def: 3.7, dex: 3.7, next: 3500 },
  { tier: 'Light', name: 'Global Gym', cost: 10000, energy: 5, str: 4.0, spd: 4.0, def: 4.0, dex: 4.0, next: 4000 },
  { tier: 'Middle', name: 'Knuckle Heads', cost: 50000, energy: 10, str: 4.8, spd: 4.4, def: 4.0, dex: 4.2, next: 6000 },
  { tier: 'Middle', name: 'Pioneer Fitness', cost: 100000, energy: 10, str: 4.4, spd: 4.5, def: 4.8, dex: 4.4, next: 7000 },
  { tier: 'Middle', name: 'Anabolic Anomalies', cost: 250000, energy: 10, str: 5.0, spd: 4.5, def: 5.2, dex: 4.5, next: 8000 },
  { tier: 'Middle', name: 'Core', cost: 500000, energy: 10, str: 5.0, spd: 5.2, def: 5.0, dex: 5.0, next: 11000 },
  { tier: 'Middle', name: 'Racing Fitness', cost: 1000000, energy: 10, str: 5.0, spd: 5.4, def: 4.8, dex: 5.2, next: 12420 },
  { tier: 'Middle', name: 'Complete Cardio', cost: 2000000, energy: 10, str: 5.5, spd: 5.8, def: 5.5, dex: 5.2, next: 18000 },
  { tier: 'Middle', name: 'Legs, Bums and Tums', cost: 3000000, energy: 10, str: 0, spd: 5.6, def: 5.6, dex: 5.8, next: 18100 },
  { tier: 'Middle', name: 'Deep Burn', cost: 5000000, energy: 10, str: 6.0, spd: 6.0, def: 6.0, dex: 6.0, next: 24140 },
  { tier: 'Heavy', name: 'Apollo Gym', cost: 7500000, energy: 10, str: 6.0, spd: 6.2, def: 6.4, dex: 6.2, next: 31260 },
  { tier: 'Heavy', name: 'Gun Shop', cost: 10000000, energy: 10, str: 6.6, spd: 6.4, def: 6.2, dex: 6.2, next: 36610 },
  { tier: 'Heavy', name: 'Force Training', cost: 15000000, energy: 10, str: 6.4, spd: 6.6, def: 6.4, dex: 6.8, next: 46640 },
  { tier: 'Heavy', name: "Cha Cha's", cost: 20000000, energy: 10, str: 6.4, spd: 6.4, def: 6.8, dex: 7.0, next: 56520 },
  { tier: 'Heavy', name: 'Atlas', cost: 30000000, energy: 10, str: 7.0, spd: 6.4, def: 6.4, dex: 6.6, next: 67775 },
  { tier: 'Heavy', name: 'Last Round', cost: 50000000, energy: 10, str: 6.8, spd: 6.6, def: 7.0, dex: 6.6, next: 84535 },
  { tier: 'Heavy', name: 'The Edge', cost: 75000000, energy: 10, str: 6.8, spd: 7.0, def: 7.0, dex: 6.8, next: 106305 },
  { tier: 'Heavy', name: "George's", cost: 100000000, energy: 10, str: 7.3, spd: 7.3, def: 7.3, dex: 7.3, next: null },
];

const specialGyms = [
  { name: 'Balboas Gym', cost: 50000000, energy: 25, str: 0, spd: 0, def: 7.5, dex: 7.5, req: "Cha Cha's unlocked; Defense + Dexterity 25% higher than Strength + Speed" },
  { name: 'Frontline Fitness', cost: 50000000, energy: 25, str: 7.5, spd: 7.5, def: 0, dex: 0, req: "Cha Cha's unlocked; Strength + Speed 25% higher than Dexterity + Defense" },
  { name: 'Gym 3000', cost: 100000000, energy: 50, str: 8.0, spd: 0, def: 0, dex: 0, req: "George's unlocked; Strength 25% higher than your second highest stat" },
  { name: 'Mr. Isoyamas', cost: 100000000, energy: 50, str: 0, spd: 0, def: 8.0, dex: 0, req: "George's unlocked; Defense 25% higher than your second highest stat" },
  { name: 'Total Rebound', cost: 100000000, energy: 50, str: 0, spd: 8.0, def: 0, dex: 0, req: "George's unlocked; Speed 25% higher than your second highest stat" },
  { name: 'Elites', cost: 100000000, energy: 50, str: 0, spd: 0, def: 0, dex: 8.0, req: "George's unlocked; Dexterity 25% higher than your second highest stat" },
  { name: 'The Sports Science Lab', cost: 500000000, energy: 25, str: 9.0, spd: 9.0, def: 9.0, dex: 9.0, req: 'Last Round unlocked; max 150 Xanax and Ecstasy combined taken in total' },
  { name: 'Fight Club', cost: 2147483647, energy: 10, str: 10.0, spd: 10.0, def: 10.0, dex: 10.0, req: 'Unknown — membership by invite only' },
  { name: 'Jail Gym (Crims Gym)', cost: 0, energy: 5, str: 3.4, spd: 3.4, def: 4.5, dex: 0, req: 'Only usable while you are in jail' },
];

/* wiki.torn.com/wiki/Happy */
const properties = [
  ['Shack', 100], ['Trailer', 165], ['Apartment', 188], ['Semi-Detached House', 275],
  ['Detached House', 500], ['Beach House', 650], ['Chalet', 725], ['Villa', 800],
  ['Penthouse', 1150], ['Mansion', 1725], ['Ranch', 1925], ['Palace', 2550],
  ['Castle', 3475], ['Private Island', 5025],
];

/* wiki.torn.com/wiki/Level_and_Ranks */
const levelUnlocks = [
  [2, 'Bookie'],
  [3, 'Join a company · Lottery'],
  [4, 'Blackjack'],
  [5, "Auction House · Poker · missions beyond George's"],
  [6, 'Russian Roulette'],
  [7, 'Spin The Wheel'],
  [10, 'Be a company director'],
  [13, 'Global chat (loses new-player chat & forum)'],
  [15, 'Travel Agency'],
];

/* wiki.torn.com/wiki/Battle_Stats — speed vs 10m dexterity, and defense vs 10m strength */
const statWeights = [
  [156250, 0], [500000, 5.63], [1000000, 10.93], [2000000, 18.41], [5000000, 33.26],
  [10000000, 50.0], [15000000, 60.49], [20000000, 66.74], [30000000, 74.15], [40000000, 78.57],
  [50000000, 81.59], [60000000, 83.81], [70000000, 85.54], [80000000, 86.94], [90000000, 88.10],
  [100000000, 89.07], [200000000, 94.37], [400000000, 98.11], [500000000, 99.06], [640000000, 100],
];
const defWeights = [
  [312500, 0], [625000, 10], [1250000, 20], [2500000, 30], [5000000, 40], [10000000, 50],
  [15000000, 57.68], [20000000, 63.14], [30000000, 70.81], [40000000, 76.26], [50000000, 80.49],
  [60000000, 83.95], [70000000, 86.87], [80000000, 89.40], [90000000, 91.63], [100000000, 93.63],
  [110000000, 95.43], [120000000, 97.08], [130000000, 98.60], [140000000, 100],
];

/* wiki.torn.com/wiki/Hospital — base values, before education/faction bonuses */
const medical = [
  { name: 'Small First Aid Kit', aka: 'SFAK', mins: 20, life: 5, cd: 10, note: '25% chance of 50 from a Box of Medical Supplies' },
  { name: 'First Aid Kit', aka: 'FAK', mins: 40, life: 10, cd: 15, note: '25% chance of 30 from a Box of Medical Supplies' },
  { name: 'Morphine', aka: '', mins: 70, life: 15, cd: 20, note: '25% chance of 20 from a Box of Medical Supplies' },
  { name: 'Blood Bag', aka: '', mins: 120, life: 30, cd: 30, note: 'Wrong blood type drops your life to 1' },
  { name: 'Opium', aka: '', mins: 180, life: 50, cd: 0, note: 'The only medical item that adds no medical cooldown' },
];

/* wiki.torn.com/wiki/Energy — base energy per item, before faction multipliers */
const energyItems = [
  { name: 'Xanax', kind: 'Drug', energy: 250, note: 'The standard. 250 energy per pill, ~3h drug cooldown' },
  { name: 'LSD', kind: 'Drug', energy: 50, note: 'Also +5 nerve' },
  { name: 'Can of Goose Juice', kind: 'Energy drink', energy: 5, note: '+2h booster cooldown' },
  { name: 'Can of Damp Valley', kind: 'Energy drink', energy: 10, note: '+2h booster cooldown' },
  { name: 'Can of Crocozade', kind: 'Energy drink', energy: 15, note: '+2h booster cooldown' },
  { name: 'Can of Munster', kind: 'Energy drink', energy: 20, note: '+2h booster cooldown' },
  { name: 'Can of Santa Shooters', kind: 'Energy drink', energy: 20, note: '+2h booster cooldown' },
  { name: 'Can of Red Cow', kind: 'Energy drink', energy: 25, note: '+2h booster cooldown' },
  { name: 'Can of Rockstar Rudolph', kind: 'Energy drink', energy: 25, note: '+2h booster cooldown' },
  { name: 'Can of Taurine Elite', kind: 'Energy drink', energy: 30, note: '+2h booster cooldown' },
  { name: 'Can of X-MASS', kind: 'Energy drink', energy: 30, note: '+2h booster cooldown' },
  { name: 'Feathery Hotel Coupon', kind: 'Booster', energy: 150, note: '150 (or 250 with Ugly Energy) + 500 happy, +6h booster cooldown' },
];

const payload = {
  npcs, jobs, companies, travel, goals, gyms, specialGyms, properties,
  levelUnlocks, statWeights, defWeights, medical, energyItems,
};

const out = '/* Lumbercorpedia datasets — GENERATED FILE, do not hand-edit.\n'
  + ' * Regenerate with:  node tools/build-datasets.js\n'
  + ' * Sources: the verified tables inside lumbercorp-2/index.html (NPC loot, city jobs,\n'
  + ' * companies, travel) plus reference tables checked against wiki.torn.com.\n'
  + ' */\n'
  + 'window.TW_DATA = ' + JSON.stringify(payload, null, 1) + ';\n';

const dest = path.join(appRoot(), 'data', 'datasets.js');
fs.writeFileSync(dest, out);
console.log('wrote ' + dest + '  (' + (out.length / 1024).toFixed(1) + ' KB)');
console.log('  npcs ' + npcs.length + ' / loot rows ' + npcs.reduce((a, n) => a + n.loot.length, 0)
  + ' / job positions ' + jobs.reduce((a, j) => a + j.pos.length, 0)
  + ' / companies ' + companies.length
  + ' / destinations ' + travel.length
  + ' / gyms ' + (gyms.length + specialGyms.length));
