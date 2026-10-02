/* ============================================================================
 * Tornpedia calculators — data/calcs.js
 * Every `run()` gets an object of the current field values and returns
 * { big, sub, grid:[{label,value}], note }. No DOM, no dependencies.
 * ========================================================================== */
(function () {
  'use strict';
  const D = window.TW_DATA || {};

  const nf = new Intl.NumberFormat('en-US');
  const fmtInt = (n) => (Number.isFinite(n) ? nf.format(Math.round(n)) : '—');
  const fmtShort = (n) => {
    if (!Number.isFinite(n)) return '—';
    const a = Math.abs(n);
    if (a >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return nf.format(Math.round(n));
  };
  const money = (n) => {
    if (!Number.isFinite(n)) return '—';
    const a = Math.abs(n);
    if (a >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + nf.format(Math.round(n));
  };
  const dur = (mins) => {
    if (!Number.isFinite(mins)) return '—';
    const m = Math.max(0, Math.round(mins));
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d) return d + 'd ' + h + 'h';
    if (h) return h + 'h ' + mm + 'm';
    return mm + 'm';
  };
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : (d || 0); };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* Vladar's gym-gains formula, as published on wiki.torn.com/wiki/Gym:
     gain = Modifiers * GymDots * EnergyPerTrain
            * [ (a*ln(Happy + b) + c) * Stat  +  d*(Happy + b) + e ]            */
  const GYM_A = 3.480061091e-7, GYM_B = 250, GYM_C = 3.091619094e-6,
    GYM_D = 6.82775184551527e-5, GYM_E = -0.0301431777;

  function vladar(stat, happy, dots, energy, mods) {
    const inner = (GYM_A * Math.log(Math.max(1, happy) + GYM_B) + GYM_C) * stat
      + GYM_D * (happy + GYM_B) + GYM_E;
    return Math.max(0, mods * dots * energy * inner);
  }

  /* Chedburn's official monthly-growth figures (stat-cap removal, 02/08/22):
     heavy training = 1500 E/day, George's, fully-staffed Private Island happy,
     no Steadfast. Used as the cross-check for large stats.                    */
  const OFFICIAL_GROWTH = [
    [50e6, 211.75], [100e6, 108.05], [1e9, 12.87], [5e9, 4.47], [10e9, 3.37],
    [50e9, 2.40], [100e9, 2.24], [500e9, 2.03], [1e12, 1.97],
  ];
  function officialMonthly(stat) {
    if (stat <= 0) return null;
    if (stat <= OFFICIAL_GROWTH[0][0]) return OFFICIAL_GROWTH[0][1];
    for (let i = 1; i < OFFICIAL_GROWTH.length; i++) {
      if (stat <= OFFICIAL_GROWTH[i][0]) {
        const [s0, g0] = OFFICIAL_GROWTH[i - 1], [s1, g1] = OFFICIAL_GROWTH[i];
        const t = Math.log(stat / s0) / Math.log(s1 / s0);   // log-interpolate
        return g0 + (g1 - g0) * clamp(t, 0, 1);
      }
    }
    return OFFICIAL_GROWTH[OFFICIAL_GROWTH.length - 1][1];
  }
  /* monthly % growth -> gain per train, given energy per train and E/day */
  function officialPerTrain(stat, growthPct, ePerTrain, ePerDay) {
    if (!stat || ePerTrain <= 0) return null;
    const trainsPerDay = Math.max(1, (ePerDay || 1500) / ePerTrain);
    return (growthPct / 100) * stat / 30 / trainsPerDay;
  }

  const GYM_OPTIONS = (D.gyms || []).concat(D.specialGyms || [])
    .map((g, i) => ({ v: String(i), t: g.name + ' — ' + (g.str || g.spd || g.def || g.dex || 0) + ' dots, ' + g.energy + ' E/train' }));
  function gymByIndex(i) {
    const all = (D.gyms || []).concat(D.specialGyms || []);
    return all[num(i, 0)] || all[0];
  }

  const CALCS = [
    /* ------------------------------------------------------------- gym */
    {
      id: 'gym', title: 'Gym gains', icon: '🏋️',
      blurb: 'What your next train is worth — from Vladar’s community formula and from Torn’s own published growth figures.',
      fields: [
        { key: 'stat', label: 'Stat you are training', def: 1000000, min: 0, step: 1000 },
        { key: 'happy', label: 'Happy at train time', def: 5000, min: 1 },
        { key: 'gym', label: 'Gym', type: 'select', options: GYM_OPTIONS },
        { key: 'energy', label: 'Energy per train', def: 10, min: 1 },
        { key: 'mods', label: 'Bonus % (edu + steadfast + company + books)', def: 0, min: 0, step: 1 },
        { key: 'trains', label: 'Trains', def: 10, min: 1 },
      ],
      run(v) {
        const g = gymByIndex(v.gym);
        const dots = Math.max(g.str || 0, g.spd || 0, g.def || 0, g.dex || 0);
        const mods = 1 + num(v.mods) / 100;
        const per = vladar(num(v.stat), num(v.happy), dots, num(v.energy, 10), mods);
        const total = per * num(v.trains, 1);
        const growth = officialMonthly(num(v.stat));
        const perOfficial = officialPerTrain(num(v.stat), growth, num(v.energy, 10), 1500);
        const happyLoss = num(v.energy, 10) * num(v.trains, 1) * 0.5;
        return {
          big: fmtShort(per) + ' per train',
          sub: num(v.trains, 1) + ' trains → about **' + fmtShort(total) + '** '
            + '(' + fmtShort(num(v.stat) + total) + ' total) using **' + fmtInt(num(v.energy, 10) * num(v.trains, 1)) + ' energy**.',
          grid: [
            { label: 'Dots used', value: dots.toFixed(1) + (g.name ? ' (' + g.name + ')' : '') },
            { label: 'Happy burned (~50%)', value: fmtShort(happyLoss) },
            { label: 'Official estimate', value: perOfficial ? fmtShort(perOfficial) + ' / train' : '—' },
            { label: 'Official monthly growth', value: growth ? growth.toFixed(2) + '%' : '—' },
          ],
          note: 'The community formula (Vladar, published on the wiki) is the "per train" figure. '
            + 'The "official" column is derived from Chedburn’s post-cap-removal growth table, which assumes 1500 E/day in George’s '
            + 'at Private Island happy with no Steadfast — treat whichever bracket you are in as the better guide, and remember both are estimates.',
        };
      },
      how: `## Where the numbers come from

The published gym-gains formula (Vladar, linked from the official wiki) is:

> Math: gain = Modifiers × Gym dots × Energy per train × [ (a·ln(Happy + b) + c) × Stat + d·(Happy + b) + e ]

with a = 3.480061091e-7, b = 250, c = 3.091619094e-6, d = 6.82775184551527e-5, e = -0.0301431777.

That formula grows **linearly** with your stat, so it drifts high once you are in the hundreds of millions.
Chedburn’s 2022 stat-cap removal announcement gave official monthly growth figures for 1500 E/day in George’s
at Private Island happiness — 211.75% at 50m, 108.05% at 100m, 12.87% at 1b, 3.37% at 10b, 1.97% at 1t.
Tornpedia shows both, because the honest answer is "it depends where you are on the curve".

## What actually moves the number

- **Happy.** It is inside a logarithm, so the jump from 500 → 5,000 happy matters far more than 5,000 → 10,000.
- **Gym dots.** George’s 7.3 vs Fight Club’s 10.0 is a 37% swing on everything.
- **Energy per train.** Specialist gyms cost 25–50 E per train; they are worth it because dots scale linearly with energy.
- **Modifiers.** Education courses, faction Steadfast, company specials and subscriber books all stack additively.`,
    },

    /* -------------------------------------------------------- happy jump */
    {
      id: 'happyjump', title: 'Happy jump planner', icon: '🙂',
      blurb: 'Fill happy, bank energy, then dump it all in one session — with the maths of how long that takes.',
      fields: [
        { key: 'max', label: 'Your max happy', def: 5025, min: 100 },
        { key: 'cur', label: 'Happy right now', def: 500, min: 0 },
        { key: 'happyItems', label: 'Extra happy/day (candy, drugs, items)', def: 0, min: 0 },
        { key: 'eday', label: 'Natural energy/day', def: 720, min: 0, step: 10 },
        { key: 'bar', label: 'Energy bar cap', def: 150, min: 1 },
        { key: 'xan', label: 'Xanax per day while filling', def: 0, min: 0, step: 1 },
        { key: 'stat', label: 'Stat you will train', def: 1000000, min: 0, step: 1000 },
        { key: 'dots', label: 'Gym dots', def: 7.3, min: 0.1, step: 0.1 },
        { key: 'ept', label: 'Energy per train', def: 10, min: 1 },
        { key: 'mods', label: 'Bonus %', def: 0, min: 0, step: 1 },
      ],
      run(v) {
        const max = num(v.max, 5025), cur = num(v.cur), perDay = 480 + num(v.happyItems);
        const need = Math.max(0, max - cur);
        const days = need / Math.max(1, perDay);
        const bankedNatural = Math.min(num(v.bar, 150), num(v.eday) * days);
        const bankedXan = num(v.xan) * 250 * Math.ceil(days);
        const banked = bankedNatural + bankedXan;
        const trains = Math.floor(banked / num(v.ept, 10));
        const mods = 1 + num(v.mods) / 100;
        const atMax = vladar(num(v.stat), max, num(v.dots, 7.3), num(v.ept, 10), mods);
        const atCur = vladar(num(v.stat), cur, num(v.dots, 7.3), num(v.ept, 10), mods);
        const gainMax = atMax * trains, gainCur = atCur * trains;
        return {
          big: days <= 0 ? 'You are already full' : dur(days * 1440) + ' of filling',
          sub: days <= 0
            ? 'Happy is already at (or above) its base maximum — jump now.'
            : 'Bank about **' + fmtInt(banked) + ' energy** (' + fmtInt(bankedNatural) + ' natural + ' + fmtInt(bankedXan)
              + ' from Xanax) and train **' + fmtInt(trains) + ' times** at full happy.',
          grid: [
            { label: 'Happy needed', value: fmtInt(need) },
            { label: 'Gain at full happy', value: fmtShort(gainMax) },
            { label: 'Gain at today’s happy', value: fmtShort(gainCur) },
            { label: 'Extra from jumping', value: fmtShort(gainMax - gainCur) + ' (+' + (gainCur > 0 ? ((gainMax / gainCur - 1) * 100).toFixed(0) : '∞') + '%)' },
          ],
          note: 'Natural happy is 5 every 15 minutes (480/day). Natural energy regen fills the bar to its cap every five hours — '
            + '720/day at 150 max (donator) or 480/day at 100 max. Xanax adds 250 energy each but is limited by your drug cooldown, '
            + 'and an overdose empties your happy completely, which costs you the whole jump.',
        };
      },
      how: `## Why a happy jump works

Gym gains scale with the **logarithm** of your happiness, and you burn 40–60% of the energy you train with as
happy. So spending energy at low happy both gains less *and* drains the pool you need later. The classic play:

1. Stop training. Let happy refill to its base maximum (5 every 15 minutes = 480/day).
2. Let energy bank up to the cap at the same time. Optional: stack Xanax — mind the drug cooldown.
3. Dump the whole bar in one session at maximum happy, then repeat.

The bigger your property (and the more staff you hire), the higher the ceiling you fill to: a Shack caps at 100 happy,
a fully-staffed Private Island at 5,025. That is why the Private Island is the single biggest gym upgrade in the game.

> Warn: An overdose on Xanax, Ecstasy, Ketamine, PCP, Shrooms, Speed or Vicodin empties your happy bar entirely. If you
> are mid-jump, that is days of progress gone — check your drug cooldown and addiction before stacking.`,
    },

    /* ------------------------------------------------------------ energy */
    {
      id: 'energy', title: 'Daily energy planner', icon: '⚡',
      blurb: 'How much energy you can actually burn per day, and what it costs in cash.',
      fields: [
        { key: 'target', label: 'Target energy per day', def: 1000, min: 0, step: 50 },
        { key: 'donator', label: 'Bar cap (donator status)', type: 'select', options: [{ v: '150', t: '150 — donator' }, { v: '100', t: '100 — non-donator' }] },
        { key: 'xanPrice', label: 'Xanax price', def: 850000, min: 0, step: 1000 },
        { key: 'maxXan', label: 'Max Xanax/day (drug cooldown)', def: 1, min: 0, step: 1 },
        { key: 'drinkPrice', label: 'Energy drink price', def: 1776000, min: 0, step: 1000 },
        { key: 'drinkE', label: 'Energy per can', def: 25, min: 5, step: 5 },
        { key: 'refill', label: 'Daily points refill?', type: 'select', options: [{ v: '1', t: 'Yes (30 points)' }, { v: '0', t: 'No' }] },
      ],
      run(v) {
        const cap = num(v.donator, 150) || 150;
        const natural = num(v.donator, 150) >= 150 ? 720 : 480;    // fills to max every 5 h
        const refill = num(v.refill) ? cap : 0;
        let need = Math.max(0, num(v.target) - natural - refill);
        const xanP = num(v.xanPrice), drinkP = num(v.drinkPrice), drinkE = Math.max(1, num(v.drinkE, 25));
        const perXan = xanP > 0 ? xanP / 250 : Infinity;
        const perDrink = drinkP > 0 ? drinkP / drinkE : Infinity;
        let xans = 0, drinks = 0, spend = 0;
        const order = [['xan', perXan], ['drink', perDrink]].sort((a, b) => a[1] - b[1]);
        for (const [kind] of order) {
          if (need <= 0) break;
          if (kind === 'xan') {
            const use = Math.min(num(v.maxXan), Math.ceil(need / 250));
            xans = use; need -= use * 250; spend += use * xanP;
          } else {
            const use = Math.ceil(need / drinkE);
            drinks = use; need -= use * drinkE; spend += use * drinkP;
          }
        }
        const got = Math.min(num(v.target), natural + refill + xans * 250 + drinks * drinkE);
        return {
          big: fmtInt(got) + ' E/day',
          sub: '**' + fmtInt(natural) + '** natural + **' + fmtInt(refill) + '** refill + **' + xans + '** Xanax + **' + drinks + '** cans'
            + ' → ' + money(spend) + '/day (' + money(spend * 30) + '/month).',
          grid: [
            { label: '$ per energy (Xanax)', value: Number.isFinite(perXan) ? money(perXan) : '—' },
            { label: '$ per energy (cans)', value: Number.isFinite(perDrink) ? money(perDrink) : '—' },
            { label: 'Cheapest first', value: perXan <= perDrink ? 'Xanax' : 'Energy drinks' },
            { label: 'Faction perk (×1.5 cans)', value: Number.isFinite(perDrink) ? money(perDrink / 1.5) : '—' },
          ],
          note: 'Natural regen fills the bar to maximum every five hours: 720/day at 150 max, 480/day at 100 max. '
            + 'The points refill can only be used once per day and only fills to your bar’s cap. '
            + 'Energy drinks share a booster cooldown (2 hours each) alongside alcohol and Feathery Hotel Coupons, so there is a hard ceiling on cans per day.',
        };
      },
    },

    /* ------------------------------------------------------------ travel */
    {
      id: 'travel', title: 'Travel run profit', icon: '✈️',
      blurb: 'Is the flight worth it? Buy price, ticket, flight time and the market value at home.',
      fields: [
        { key: 'country', label: 'Destination', type: 'select', options: (D.travel || []).map((t, i) => ({ v: String(i), t: t.country + ' — ' + t.city })) },
        { key: 'item', label: 'Item to buy', type: 'select', options: (function () {
          const out = [];
          (D.travel || []).forEach((t, ci) => t.items.forEach((it, ii) => out.push({ v: ci + ':' + ii, t: t.country + ' — ' + it.name + ' (' + money(it.price) + ')' })));
          return out;
        }()) },
        { key: 'qty', label: 'Quantity', def: 100, min: 1 },
        { key: 'value', label: 'Market value at home (each)', def: 0, min: 0, step: 100 },
        { key: 'cls', label: 'Class', type: 'select', options: [{ v: 'standard', t: 'Standard' }, { v: 'airstrip', t: 'Airstrip' }, { v: 'wlt', t: 'WLT' }, { v: 'business', t: 'Business' }] },
      ],
      run(v) {
        const t = (D.travel || [])[num(v.country)] || (D.travel || [])[0];
        if (!t) return { big: '—', sub: 'No travel data.' };
        const key = String(v.item || '0:0').split(':');
        const it = t.items[num(key[1])] || t.items[0];
        const mins = t.times[v.cls] || t.times.standard;
        const qty = num(v.qty, 1);
        const buy = (it ? it.price : 0) * qty;
        const tickets = t.cost * 2;
        const rev = num(v.value) * qty;
        const profit = rev - buy - tickets;
        const perHour = mins ? profit / ((mins * 2) / 60) : 0;
        return {
          big: money(profit) + (profit > 0 ? ' profit' : ' loss'),
          sub: 'Buy ' + fmtInt(qty) + ' × ' + esc(it ? it.name : '—') + ' for **' + money(buy) + '**, fly ' + dur(mins) + ' each way ('
            + money(tickets) + ' return), sell at ' + money(num(v.value)) + ' each → **' + money(rev) + '**.',
          grid: [
            { label: 'Flight time (one way)', value: dur(mins) },
            { label: 'Round trip', value: dur(mins * 2) },
            { label: 'Profit per hour flying', value: money(perHour) },
            { label: 'Break-even sale price', value: money((buy + tickets) / qty) },
          ],
          note: 'Abroad shops restock on a fixed ~15-minute cycle, and stock is shared across every player flying there — '
            + 'a run that looked profitable in the calculator can be cleaned out by the time you land. Flowers and plushies '
            + 'are also needed for their sets, which is where their real value sits.',
        };
      },
    },

    /* ----------------------------------------------------------- weights */
    {
      id: 'weights', title: 'Battle stat weights', icon: '⚖️',
      blurb: 'Hit chance from speed vs dexterity, and damage mitigation from defense vs strength.',
      fields: [
        { key: 'speed', label: 'Your speed', def: 10000000, min: 0, step: 100000 },
        { key: 'dex', label: 'Their dexterity', def: 10000000, min: 1, step: 100000 },
        { key: 'def', label: 'Your defense', def: 10000000, min: 0, step: 100000 },
        { key: 'str', label: 'Their strength', def: 10000000, min: 1, step: 100000 },
      ],
      run(v) {
        const scale = (own, opp) => own * (1e7 / Math.max(1, opp));
        const sp = scale(num(v.speed), num(v.dex));
        const df = scale(num(v.def), num(v.str));
        const hit = interp(D.statWeights || [], sp);
        const mit = interp(D.defWeights || [], df);
        return {
          big: hit.toFixed(1) + '% hit chance',
          sub: 'and **' + mit.toFixed(1) + '% damage mitigation** against that opponent. '
            + 'You take ' + (100 - mit).toFixed(1) + '% of their raw damage.',
          grid: [
            { label: 'Effective speed', value: fmtShort(sp) },
            { label: 'Effective defense', value: fmtShort(df) },
            { label: 'Damage taken', value: (100 - mit).toFixed(1) + '%' },
            { label: 'Their hit chance on you', value: interp(D.statWeights || [], scale(num(v.dex), num(v.speed) || 1)).toFixed(1) + '%' },
          ],
          note: 'The published tables are "speed versus 10,000,000 dexterity" and "defense versus 10,000,000 strength". '
            + 'Tornpedia rescales by ratio (your stat × 10m / theirs), which is the standard approximation — the wiki itself '
            + 'notes the speed-vs-dexterity curve is an approximation. Below 156,250 effective speed the hit chance is reported as 0% '
            + 'and above 640m it is 100%.',
        };
      },
    },

    /* ---------------------------------------------------------- hospital */
    {
      id: 'hospital', title: 'Hospital & medical items', icon: '🏥',
      blurb: 'How many first aid kits, morphine or blood bags to cut your hospital time — and what it costs.',
      fields: [
        { key: 'time', label: 'Hospital time left (minutes)', def: 180, min: 0 },
        { key: 'edu', label: 'Education bonus', type: 'select', options: [{ v: '0', t: 'None' }, { v: '20', t: 'Education (+20%)' }] },
        { key: 'fac', label: 'Faction upgrade', type: 'select', options: [{ v: '0', t: 'None' }, { v: '30', t: 'Faction (+30%)' }] },
        { key: 'item', label: 'Item', type: 'select', options: (D.medical || []).map((m, i) => ({ v: String(i), t: m.name + ' — ' + m.mins + ' min' })) },
        { key: 'price', label: 'Price per item', def: 15000, min: 0, step: 500 },
      ],
      run(v) {
        const m = (D.medical || [])[num(v.item)] || (D.medical || [])[0];
        if (!m) return { big: '—', sub: 'No medical data.' };
        const bonus = 1 + (num(v.edu) + num(v.fac)) / 100;
        const per = m.mins * bonus;
        const need = Math.ceil(num(v.time) / per);
        const cd = (m.cd || 0) * need;
        return {
          big: fmtInt(need) + ' × ' + m.name,
          sub: 'Each one takes **' + Math.round(per) + ' minutes** off (base ' + m.mins + ' min, ×' + bonus.toFixed(2) + ' bonus) '
            + 'and restores **' + (m.life * bonus).toFixed(1) + '% life**. Total cost ' + money(num(v.price) * need) + '.',
          grid: [
            { label: 'Time removed', value: dur(per * need) },
            { label: 'Medical cooldown added', value: cd ? dur(cd * 60) : 'none (opium)' },
            { label: 'Over the 6h cap?', value: (m.cd ? m.cd : 0) === 0 ? 'no' : (cd > 360 ? 'yes — cooldown gates you' : 'no') },
            { label: 'Cost per minute saved', value: money(num(v.price) / Math.max(1, per)) },
          ],
          note: 'Every medical item except Opium adds to your medical cooldown, and once that cooldown passes six hours you cannot '
            + 'take another one until it drops back below (faction upgrades raise the ceiling to nine). Education adds up to 20% and '
            + 'faction specials up to 30%, for a 50% total. Blood bags typed wrong drop your life to 1.',
        };
      },
    },

    /* --------------------------------------------------------------- npc */
    {
      id: 'npc', title: 'NPC loot timer', icon: '💀',
      blurb: 'When an NPC hits Loot Level I–V after you (or someone else) puts them in hospital.',
      fields: [
        { key: 'npc', label: 'NPC', type: 'select', options: (D.npcs || []).map((n, i) => ({ v: String(i), t: n.glyph + ' ' + n.name })) },
        { key: 'ago', label: 'Defeated (minutes ago)', def: 0, min: 0 },
        { key: 'hosp', label: 'Hospital time', type: 'select', options: [{ v: '100', t: '100 min' }, { v: '110', t: '110 min' }, { v: '120', t: '120 min' }] },
      ],
      run(v) {
        const n = (D.npcs || [])[num(v.npc)];
        if (!n) return { big: '—', sub: 'No NPC data.' };
        const ladder = [0, 30, 90, 210, 450];
        const roman = ['I', 'II', 'III', 'IV', 'V'];
        const out = num(v.ago) + num(v.hosp, 110);
        const rows = ladder.map((m, i) => ({
          label: 'Loot Level ' + roman[i],
          value: (out + m <= 0 ? 'now' : 'in ' + dur(out + m)) + ' · ' + (i + 1) + ' attacker' + (i ? 's' : ''),
        }));
        const nowLevel = ladder.reduce((acc, m, i) => (out + m <= 0 ? i : acc), -1);
        return {
          big: nowLevel < 0 ? 'In hospital' : 'Loot Level ' + roman[nowLevel],
          sub: nowLevel < 0
            ? esc(n.name) + ' is still in hospital — ' + dur(out) + ' until the first loot window opens.'
            : esc(n.name) + ' can be looted by **' + (nowLevel + 1) + ' attacker' + (nowLevel ? 's' : '') + '** right now.',
          grid: rows,
          note: 'Torn hospitalises an NPC for 100–120 minutes; the loot ladder then runs +0 / +30 / +90 / +210 / +450 minutes '
            + 'from the moment they get out, and each level lets one more attacker share the drop. TornStats publishes the same '
            + 'clocks server-side — the NPC Loot tab in LumberCorp 2.0 reads them live.',
        };
      },
    },

    /* --------------------------------------------------------- job points */
    {
      id: 'jobpoints', title: 'Job points & promotions', icon: '💼',
      blurb: 'Pay, daily stat gains and how many days until your next city-job promotion.',
      fields: [
        { key: 'pos', label: 'Your position', type: 'select', options: (function () {
          const out = [];
          (D.jobs || []).forEach((j) => j.pos.forEach((p) => out.push({ v: j.id + ':' + p.title, t: j.name + ' — ' + p.title })));
          return out;
        }()) },
        { key: 'banked', label: 'Points banked', def: 0, min: 0 },
        { key: 'perk', label: 'Points/day bonus (company specials)', def: 0, min: 0, step: 1 },
      ],
      run(v) {
        const val = String(v.pos || '');
        const parts = val.split(':');
        const job = (D.jobs || []).find((j) => j.id === parts[0]);
        const idx = job ? job.pos.findIndex((p) => p.title === parts.slice(1).join(':')) : -1;
        if (!job || idx < 0) return { big: '—', sub: 'Pick a position.' };
        const p = job.pos[idx];
        const next = job.pos[idx + 1];
        const perDay = p.points + num(v.perk);
        const days = next && perDay > 0 ? Math.max(0, (next.promo - num(v.banked)) / perDay) : null;
        return {
          big: '+' + perDay + ' ' + job.name.toLowerCase() + ' points/day',
          sub: next
            ? 'Next rung: **' + next.title + '** needs ' + fmtInt(next.promo) + ' points — '
              + (days == null ? 'set a points/day bonus to project it.' : days <= 0 ? 'you can claim it now.' : '**' + Math.ceil(days) + ' days** away.')
            : 'You are at the top of the ' + job.name + ' ladder.',
          grid: [
            { label: 'Daily pay', value: money(p.pay) },
            { label: 'Daily stat gains', value: '+' + p.gMan + '/' + p.gInt + '/' + p.gEnd },
            { label: 'Requirements (M/I/E)', value: fmtInt(p.man) + '/' + fmtInt(p.int) + '/' + fmtInt(p.end) },
            { label: 'Next requirements', value: next ? fmtInt(next.man) + '/' + fmtInt(next.int) + '/' + fmtInt(next.end) : '—' },
          ],
          note: 'City-job points drop at 18:00 TCT. Job specials cost points to fire and are the real reason to climb a ladder — '
            + 'the Army’s stat spy and the Law’s nerve refill are the two most sought after.',
        };
      },
    },

    /* ------------------------------------------------------------- market */
    {
      id: 'market', title: 'Item market fees', icon: '🏷️',
      blurb: 'What you actually receive after the sales tax and the optional anonymous-listing fee.',
      fields: [
        { key: 'price', label: 'Sale price each', def: 100000, min: 0, step: 1000 },
        { key: 'qty', label: 'Quantity', def: 10, min: 1 },
        { key: 'anon', label: 'List anonymously?', type: 'select', options: [{ v: '0', t: 'No' }, { v: '1', t: 'Yes (+10%)' }] },
        { key: 'special', label: 'Car Dealership / Property Broker 5★', type: 'select', options: [{ v: '0', t: 'No' }, { v: '1', t: 'Yes — waives the fee' }] },
      ],
      run(v) {
        const gross = num(v.price) * num(v.qty, 1);
        const tax = gross * 0.05;
        const anon = num(v.anon) && !num(v.special) ? gross * 0.10 : 0;
        const net = gross - tax - anon;
        return {
          big: money(net) + ' received',
          sub: 'Gross **' + money(gross) + '** − 5% sales tax **' + money(tax) + '**'
            + (anon ? ' − 10% anonymous fee **' + money(anon) + '**' : '') + '.',
          grid: [
            { label: 'Total fees', value: (((tax + anon) / gross) * 100).toFixed(1) + '%' },
            { label: 'Net each', value: money(net / Math.max(1, num(v.qty, 1))) },
            { label: 'Break-even buy price', value: money(net / Math.max(1, num(v.qty, 1))) },
            { label: 'Tax since', value: '5% (22 Jun 2025)' },
          ],
          note: 'The item market charged nothing until 22 Feb 2025, when a 1% fee arrived and stepped up 1% a month to 5%. '
            + 'The anonymous-listing fee is 10% of the sale price, unless you hold the 5★ Car Dealership or 5★ Property Broker '
            + 'special, which reduces it to zero. Fees are taken at the moment of sale.',
        };
      },
    },

    /* ------------------------------------------------------------ company */
    {
      id: 'company', title: 'Company payback', icon: '🏪',
      blurb: 'How long a company takes to earn back its startup cost at your numbers.',
      fields: [
        { key: 'co', label: 'Company', type: 'select', options: (D.companies || []).slice().sort((a, b) => a.cost - b.cost).map((c) => ({ v: c.id, t: c.glyph + ' ' + c.name + ' — ' + money(c.cost) })) },
        { key: 'profit', label: 'Net profit per day', def: 500000, min: 0, step: 10000 },
        { key: 'wages', label: 'Wages per day', def: 0, min: 0, step: 10000 },
        { key: 'upkeep', label: 'Other daily costs', def: 0, min: 0, step: 10000 },
      ],
      run(v) {
        const c = (D.companies || []).find((x) => x.id === v.co) || (D.companies || [])[0];
        if (!c) return { big: '—', sub: 'No company data.' };
        const net = num(v.profit) - num(v.wages) - num(v.upkeep);
        const days = net > 0 ? c.cost / net : null;
        return {
          big: days ? Math.ceil(days) + ' days to pay back' : (net <= 0 ? 'never at this rate' : '—'),
          sub: 'Opening **' + esc(c.name) + '** costs ' + money(c.cost) + ' and expects about **' + c.emp
            + ' staff**. At ' + money(net) + '/day net, that is ' + money(net * 30) + ' a month.',
          grid: [
            { label: 'Profit rating', value: c.inc + '/5' },
            { label: 'Effort rating', value: c.eff + '/5' },
            { label: 'Monthly net', value: money(net * 30) },
            { label: 'ROI after 90 days', value: c.cost ? ((net * 90 / c.cost) * 100).toFixed(0) + '%' : '—' },
          ],
          note: 'Profit ratings are the community’s 1–5 scale, not a promise: a company’s real income depends on your stock '
            + 'pricing, advertising budget, popularity and how well your staff match their roles. Ten-star specials are where '
            + 'most companies actually pay for themselves.',
        };
      },
    },
  ];

  /* linear interpolation on [[value, percent], …] lookup tables */
  function interp(table, x) {
    if (!table || !table.length) return 0;
    if (x <= table[0][0]) return table[0][1];
    for (let i = 1; i < table.length; i++) {
      if (x <= table[i][0]) {
        const [x0, y0] = table[i - 1], [x1, y1] = table[i];
        const t = (x - x0) / (x1 - x0 || 1);
        return y0 + (y1 - y0) * t;
      }
    }
    return table[table.length - 1][1];
  }

  /* tiny escape used inside calculator text (values are our own strings) */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.TW_CALCS = CALCS;
})();
