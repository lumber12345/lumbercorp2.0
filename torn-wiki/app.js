/* ============================================================================
 * Tornpedia — app.js
 * An offline-first Torn City wiki: instant fuzzy search, a bundled article
 * library, live Torn API widgets, calculators, and live wiki.torn.com lookup.
 * Zero dependencies. Hash router. Everything is rendered client-side.
 * ========================================================================== */
(function () {
  'use strict';

  const A = (window.TW_ARTICLES || []);
  const D = window.TW_DATA || {};
  const CALCS = window.TW_CALCS || [];

  const CATS = [
    { id: 'core', name: 'Core mechanics', icon: '⚙️' },
    { id: 'combat', name: 'Combat & crime', icon: '⚔️' },
    { id: 'work', name: 'Work & money', icon: '💼' },
    { id: 'items', name: 'Items & gear', icon: '🎒' },
    { id: 'travel', name: 'Travel & abroad', icon: '✈️' },
    { id: 'faction', name: 'Factions & war', icon: '🏴' },
    { id: 'strategy', name: 'Guides & strategy', icon: '🧭' },
    { id: 'reference', name: 'Reference & tools', icon: '📐' },
  ];
  const CAT_BY_ID = {};
  CATS.forEach((c) => { CAT_BY_ID[c.id] = c; });

  const TORN_API = 'https://api.torn.com';
  const WIKI_API = 'https://wiki.torn.com/api.php';

  /* ============================================================== utils */
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const nf = new Intl.NumberFormat('en-US');
  const fmtInt = (n) => (Number.isFinite(n) ? nf.format(Math.round(n)) : '—');
  function fmtMoney(n) {
    if (!Number.isFinite(n)) return '—';
    const abs = Math.abs(n);
    if (abs >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (abs >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (abs >= 1e4) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + nf.format(Math.round(n));
  }
  function fmtShort(n) {
    if (!Number.isFinite(n)) return '—';
    const abs = Math.abs(n);
    if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return nf.format(Math.round(n));
  }
  function fmtDur(mins) {
    if (!Number.isFinite(mins)) return '—';
    const m = Math.max(0, Math.round(mins));
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d) return d + 'd ' + h + 'h';
    if (h) return h + 'h ' + mm + 'm';
    return mm + 'm';
  }
  function fmtClock(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(ss).padStart(2, '0');
  }
  function slug(s) { return norm(s).replace(/ /g, '-'); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function num(v, dflt) { const n = parseFloat(v); return Number.isFinite(n) ? n : (dflt || 0); }

  /* ============================================================== state */
  const LS = 'tornpedia.v1';
  const defaults = { theme: 'dark', bookmarks: [], key: '', proxy: '', offline: {}, live: true, visited: [] };
  let S;
  try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(LS) || '{}')); }
  catch (e) { S = Object.assign({}, defaults); }
  function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* private mode */ } }

  /* ============================================================== index */
  const BY_ID = {};
  A.forEach((a, i) => {
    a.i = i;
    BY_ID[a.id] = a;
    a._t = norm(a.title);
    a._al = (a.alias || []).map(norm);
    a._s = norm(a.summary || '');
    a._g = norm((a.tags || []).join(' '));
    a._b = norm(String(a.body || '').replace(/\{\{[^}]*\}\}/g, ' ').replace(/[|#>*_\[\]]/g, ' ')
      + ' ' + (a.facts || []).map((f) => f.join(' ')).join(' ')      // infobox text is searchable too
      + ' ' + (a.tags || []).join(' '));
  });

  function scoreWord(a, w) {
    const t = a._t;
    if (t === w) return 1000;
    if (t.startsWith(w)) return 700;
    if (t.includes(' ' + w) || t.includes(w)) return 480;
    for (const al of a._al) {
      if (al === w) return 620;
      if (al.startsWith(w)) return 430;
      if (al.includes(w)) return 280;
    }
    if (a._g.includes(w)) return 200;
    if (a._s.includes(w)) return 140;
    if (a._b.includes(w)) return 55;
    // fuzzy subsequence on the title, penalised
    let i = 0, hits = 0;
    for (let c = 0; c < t.length && i < w.length; c++) { if (t[c] === w[i]) { i++; hits++; } }
    if (i === w.length) return Math.max(8, 90 * (hits / w.length) - 20);
    return 0;
  }

  /* Requiring every word to match is too strict for a library this size —
     "george gym" should still find the Gym article even though "George's"
     only appears in its infobox and its dataset table. So: score every word,
     keep articles that match at least half of them (at least one for short
     queries), and sort by how much of the query they actually answered. */
  function search(q, limit) {
    const words = norm(q).split(' ').filter(Boolean);
    if (!words.length) return [];
    const out = [];
    for (const a of A) {
      let total = 0, matched = 0;
      for (const w of words) {
        const s = scoreWord(a, w);
        if (s > 0) { total += s; matched++; }
      }
      if (!matched) continue;
      const coverage = matched / words.length;
      if (coverage < 0.5 && words.length > 2) continue;
      if (words.length === 2 && matched < 1) continue;
      total = total * (0.55 + 0.45 * coverage);        // full matches outrank partial ones
      total += Math.max(0, 24 - a.title.length) * 0.4; // nudge short, punchy titles
      if (words.length > 1 && (a._t + ' ' + a._s + ' ' + a._b).includes(words.join(' '))) total += 220; // phrase hit
      out.push({ a, score: total, coverage });
    }
    out.sort((x, y) => y.score - x.score || x.a.title.localeCompare(y.a.title));
    return limit ? out.slice(0, limit) : out;
  }

  /* ======================================================= markdown-ish */
  function inline(text) {
    let s = esc(text);
    // internal wiki links: [[Title]] or [[Title|id]]
    s = s.replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
      const parts = inner.split('|');
      const label = parts[0].trim();
      const target = (parts[1] || parts[0]).trim();
      const art = BY_ID[target] || A.find((x) => x.title.toLowerCase() === target.toLowerCase());
      if (art) return '<a class="wiki-link" href="#/a/' + esc(art.id) + '">' + esc(label) + '</a>';
      const calc = CALCS.find((c) => c.id === target);
      if (calc) return '<a class="wiki-link" href="#/t/' + esc(calc.id) + '">' + esc(label) + '</a>';
      return '<span class="wiki-link missing" title="Not in the bundled library yet">' + esc(label) + '</span>';
    });
    // external links [text](url)
    s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,
      (m, t, u) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(t) + ' ↗</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:)!?]|$)/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<code>$1</code>');
    return s;
  }

  /* opts: { caption, numCols:[0,2] } — numCols right-aligns and tabulates. */
  function renderTable(rows, opts) {
    opts = opts || {};
    const numCols = new Set(opts.numCols || []);
    const head = rows[0];
    let h = '<div class="tbl-wrap">';
    if (opts.caption) h += '<div class="tbl-cap">' + esc(opts.caption) + '</div>';
    h += '<table><thead><tr>';
    head.forEach((c, i) => { h += '<th' + (numCols.has(i) ? ' class="num"' : '') + '>' + inline(String(c)) + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.slice(1).forEach((r) => {
      h += '<tr>';
      r.forEach((c, i) => {
        let cls = numCols.has(i) ? ' class="num"' : '';
        let val = String(c);
        if (typeof c === 'string' && c.startsWith('!')) { cls = ' class="acc"'; val = c.slice(1); }
        h += '<td' + cls + '>' + inline(val) + '</td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* dataset tables that articles can drop in with {{table:key}} */
  const TABLES = {
    gyms() {
      const rows = [['Gym', 'Tier', 'Unlock cost', 'Energy / train', 'STR', 'SPD', 'DEF', 'DEX', 'Est. E to unlock next']];
      D.gyms.forEach((g) => rows.push([g.name, g.tier, fmtMoney(g.cost), g.energy,
        g.str || '—', g.spd || '—', g.def || '—', g.dex || '—', g.next ? fmtInt(g.next) : '—']));
      return renderTable(rows, { caption: '24 standard gyms — gains are the per-stat multiplier (“dots”)', numCols: [2, 3, 4, 5, 6, 7, 8] });
    },
    specialGyms() {
      const rows = [['Gym', 'Unlock cost', 'Energy / train', 'STR', 'SPD', 'DEF', 'DEX', 'Requirement']];
      D.specialGyms.forEach((g) => rows.push([g.name, g.cost ? fmtMoney(g.cost) : 'free', g.energy,
        g.str || '—', g.spd || '—', g.def || '—', g.dex || '—', g.req]));
      return renderTable(rows, { caption: 'Specialist gyms — you are kicked out (but keep the membership) if you stop meeting the requirement', numCols: [1, 2, 3, 4, 5, 6] });
    },
    jobs() {
      return D.jobs.map((j) => {
        const rows = [['Position', 'Man', 'Int', 'End', '+Man/day', '+Int/day', '+End/day', '$/day', 'Points/day', 'Promotion pts', 'Job special']];
        j.pos.forEach((p) => rows.push([p.title, fmtInt(p.man), fmtInt(p.int), fmtInt(p.end),
          '+' + fmtInt(p.gMan), '+' + fmtInt(p.gInt), '+' + fmtInt(p.gEnd),
          fmtInt(p.pay), '+' + p.points, p.promo == null ? 'max rank' : fmtInt(p.promo),
          p.special === 'none' ? '—' : p.special]));
        return '<h3>' + j.glyph + ' ' + esc(j.name) + '</h3><p class="tbl-cap" style="padding:0 0 6px">' + esc(j.tag) + '</p>'
          + renderTable(rows, { numCols: [1, 2, 3, 4, 5, 6, 7, 8, 9] });
      }).join('');
    },
    companies() {
      const rows = [['Company', 'Startup', 'Default staff', 'Profit /5', 'Effort /5', 'Known for']];
      D.companies.slice().sort((a, b) => a.cost - b.cost).forEach((c) => {
        rows.push([c.glyph + ' ' + c.name, fmtMoney(c.cost), c.emp, c.inc + '/5', c.eff + '/5', c.tag]);
      });
      return renderTable(rows, { caption: 'All 39 player-startable companies, cheapest first', numCols: [1, 2, 3, 4] });
    },
    npcs() {
      const rows = [['NPC', 'HP', 'Availability', 'Role', 'Drops']];
      D.npcs.forEach((n) => rows.push([n.glyph + ' ' + n.name, fmtShort(n.hp),
        n.season === 'year' ? 'Year-round' : 'Seasonal', n.tag, n.loot.length + ' items']));
      return renderTable(rows, { caption: 'Every lootable NPC in Torn City', numCols: [1, 4] });
    },
    npcLoot() {
      const rows = [['NPC', 'Drop', 'Type', 'Notable']];
      D.npcs.forEach((n) => n.loot.forEach((l) => rows.push([n.glyph + ' ' + n.name,
        (l.rare ? '! ' : ' ') + l.icon + ' ' + l.name, l.type, l.rare ? 'headline drop' : ''])));
      return renderTable(rows, { caption: 'All ' + (rows.length - 1) + ' verified NPC drops, including every Praetorian and seasonal NPC', numCols: [1] });
    },
    travel() {
      const rows = [['Country', 'City', 'Standard', 'Airstrip', 'WLT', 'Business', 'Ticket', 'Buys abroad']];
      D.travel.forEach((t) => rows.push([t.country, t.city, fmtDur(t.times.standard), fmtDur(t.times.airstrip),
        fmtDur(t.times.wlt), fmtDur(t.times.business), fmtMoney(t.cost),
        t.items.map((i) => i.name).join(', ')]));
      return renderTable(rows, { caption: 'Flight times are one-way, in hours/minutes; WLT = Winner’s Lucky Ticket, business class costs more', numCols: [2, 3, 4, 5, 6] });
    },
    abroadItems() {
      const rows = [['Country', 'Item', 'Kind', 'Shop price']];
      D.travel.forEach((t) => t.items.forEach((i) => rows.push([t.country, i.name, i.kind, fmtMoney(i.price)])));
      return renderTable(rows, { caption: 'What you can buy abroad — prices are the shop’s listed price', numCols: [3] });
    },
    properties() {
      const rows = [['Property', 'Max happy (with staff)']];
      D.properties.forEach((p) => rows.push([p[0], fmtInt(p[1])]));
      return renderTable(rows, { caption: 'Every standard property, from the Shack to the Private Island', numCols: [1] });
    },
    levelUnlocks() {
      const rows = [['Level', 'Unlocks']];
      D.levelUnlocks.forEach((u) => rows.push(['Level ' + u[0], u[1]]));
      return renderTable(rows, { caption: 'Feature unlocks by level', numCols: [0] });
    },
    medical() {
      const rows = [['Item', 'Time off hospital', 'Life restored', 'Medical cooldown added', 'Notes']];
      D.medical.forEach((m) => rows.push([m.name + (m.aka ? ' (' + m.aka + ')' : ''),
        m.mins + ' min', m.life + '%', m.cd ? m.cd + ' min' : 'none', m.note]));
      return renderTable(rows, { caption: 'Base values — education adds up to 20% and faction upgrades up to 30%, for 50% total', numCols: [1, 2, 3] });
    },
    energyItems() {
      const rows = [['Item', 'Kind', 'Energy', 'Notes']];
      D.energyItems.forEach((e) => rows.push([e.name, e.kind, '+' + e.energy, e.note]));
      return renderTable(rows, { caption: 'Energy sources — faction perks multiply energy drink gains by 1.5×', numCols: [2] });
    },
    statWeights() {
      const rows = [['Speed vs 10M dexterity', 'Hit chance', 'Defense vs 10M strength', 'Damage mitigation']];
      for (let i = 0; i < D.statWeights.length; i++) {
        const s = D.statWeights[i], d = D.defWeights[i] || [null, null];
        rows.push([fmtShort(s[0]), s[1] + '%', d[0] ? fmtShort(d[0]) : '—', d[1] != null ? d[1] + '%' : '—']);
      }
      return renderTable(rows, { caption: 'Stat weights published with Attacking 2.0 — the two scales are independent', numCols: [1, 3] });
    },
  };

  function renderBody(md) {
    const lines = String(md || '').split('\n');
    let out = '', list = null, para = [];
    const flush = () => {
      if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>'; para = []; }
      if (list) { out += '</' + list + '>'; list = null; }
    };
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();

      if (!line) { flush(); continue; }

      if (line.startsWith('{{table:')) {
        flush();
        const key = line.slice(8, -2).trim();
        out += (TABLES[key] ? TABLES[key]() : '<p class="tbl-cap">Missing table: ' + esc(key) + '</p>');
        continue;
      }
      if (line.startsWith('{{calc:')) { flush(); out += '<div data-calc="' + esc(line.slice(7, -2).trim()) + '"></div>'; continue; }
      if (line.startsWith('{{live:')) { flush(); out += '<div data-live="' + esc(line.slice(7, -2).trim()) + '"></div>'; continue; }

      if (/^---+$/.test(line)) { flush(); out += '<hr>'; continue; }

      const h = line.match(/^(#{2,4})\s+(.*)$/);
      if (h) {
        flush();
        const lvl = h[1].length;
        const text = h[2];
        if (lvl === 2) out += '<h2 id="h-' + slug(text) + '">' + inline(text) + '</h2>';
        else if (lvl === 3) out += '<h3 id="h-' + slug(text) + '">' + inline(text) + '</h3>';
        else out += '<h4 id="h-' + slug(text) + '">' + inline(text) + '</h4>';
        continue;
      }

      const call = line.match(/^>\s*(Tip|Note|Warn|Bad|Math|Formula)\s*:\s*(.*)$/i);
      if (call) {
        flush();
        const kind = call[1].toLowerCase();
        out += '<div class="callout ' + kind + '"><span class="lbl">' + esc(call[1]) + '</span>' + inline(call[2]) + '</div>';
        continue;
      }
      if (line.startsWith('> ')) { flush(); out += '<div class="callout note">' + inline(line.slice(2)) + '</div>'; continue; }

      if (line.startsWith('|')) {
        flush();
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const r = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
          if (!/^[:\- ]+$/.test(r.join(''))) rows.push(r);
          i++;
        }
        i--;
        if (rows.length > 1) out += renderTable(rows);
        continue;
      }

      const bullet = line.match(/^[-*]\s+(.*)$/);
      if (bullet) {
        if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>'; para = []; }
        if (list !== 'ul') { if (list) out += '</' + list + '>'; out += '<ul>'; list = 'ul'; }
        out += '<li>' + inline(bullet[1]) + '</li>';
        continue;
      }
      const ordered = line.match(/^\d+\.\s+(.*)$/);
      if (ordered) {
        if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>'; para = []; }
        if (list !== 'ol') { if (list) out += '</' + list + '>'; out += '<ol>'; list = 'ol'; }
        out += '<li>' + inline(ordered[1]) + '</li>';
        continue;
      }

      para.push(line);
    }
    flush();
    return out;
  }

  /* ========================================================= live (Torn) */
  /* Live reads are cached per selection set for 60s and de-duplicated while a
     call is in flight, so an article with several widgets asks Torn once. */
  const liveStore = {};      // selections -> { ts, data }
  const liveInflight = {};   // selections -> Promise
  let liveErr = '';

  async function liveData(selections) {
    if (!(S.key || '').trim()) throw new Error('no-key');
    const hit = liveStore[selections];
    if (hit && Date.now() - hit.ts < 60000) return hit.data;
    if (!liveInflight[selections]) {
      liveInflight[selections] = tornGet('user', selections)
        .then((d) => { liveStore[selections] = { ts: Date.now(), data: d }; return d; })
        .catch((e) => { liveErr = e.message; throw e; })
        .finally(() => { delete liveInflight[selections]; });
    }
    return liveInflight[selections];
  }
  function clearLive() { Object.keys(liveStore).forEach((k) => delete liveStore[k]); }

  async function tornGet(path, selections) {
    const key = (S.key || '').trim();
    if (!key) throw new Error('no-key');
    const tries = [];
    if (S.proxy) tries.push(S.proxy.replace(/\/$/, '') + '/api/torn?path=/' + path + '/&key=' + encodeURIComponent(key) + (selections ? '&selections=' + selections : ''));
    tries.push('/api/torn?path=/' + path + '/&key=' + encodeURIComponent(key) + (selections ? '&selections=' + selections : ''));
    tries.push(TORN_API + '/' + path + '/?selections=' + encodeURIComponent(selections || '') + '&key=' + encodeURIComponent(key) + '&comment=tornpedia');
    let lastErr;
    for (const url of tries) {
      try {
        const r = await fetch(url, { cache: 'no-store' });
        if (!r.ok) { lastErr = new Error('HTTP ' + r.status); continue; }
        const j = await r.json();
        if (j && j.error) { lastErr = new Error((j.error.error || 'Torn API error') + ' (code ' + j.error.code + ')'); continue; }
        return j;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('unreachable');
  }

  function barMeta(key) {
    return {
      energy: { label: 'Energy', icon: '⚡', max: 150, perMin: 0.5 },
      nerve: { label: 'Nerve', icon: '🧠', max: 100, perMin: 0.2 },
      happy: { label: 'Happy', icon: '🙂', max: 5000, perMin: 1 / 3 },
      life: { label: 'Life', icon: '❤️', max: 5000, perMin: null },
    }[key] || { label: key, icon: '•', max: 100, perMin: 0.5 };
  }
  function barCell(k, v) {
    const m = barMeta(k);
    const cur = v.current, max = v.maximum || m.max;
    const pct = max ? clamp((cur / max) * 100, 0, 100) : 0;
    let eta = '';
    if (v.fulltime) eta = 'full in ' + fmtClock(v.fulltime * 1000);
    else if (m.perMin && cur < max) eta = 'full in ' + fmtDur((max - cur) / m.perMin);
    else if (cur >= max) eta = 'full';
    const color = k === 'energy' ? 'var(--green)' : k === 'nerve' ? 'var(--purple)' : k === 'happy' ? 'var(--acc)' : 'var(--red)';
    return '<div class="live-cell"><span>' + m.icon + ' ' + m.label + '</span>'
      + '<b>' + fmtInt(cur) + ' <small style="font-size:11px;color:var(--tx-3);font-weight:400">/ ' + fmtInt(max) + '</small></b>'
      + '<div class="bar-track"><div class="bar-fill" style="width:' + pct.toFixed(1) + '%;background:' + color + '"></div></div>'
      + '<small>' + esc(eta) + '</small></div>';
  }

  const LIVE_WIDGETS = {
    async bars(el) {
      const d = await liveData('bars');
      const b = d.bars || {};
      el.innerHTML = '<div class="live-grid">'
        + ['energy', 'nerve', 'happy', 'life'].map((k) => b[k] ? barCell(k, b[k]) : '').join('')
        + '</div><div class="live-note">Live from the Torn API'
        + (b.energy ? ' · your bar ticks ' + (b.energy.maximum >= 150 ? '5 energy / 10 min (donator)' : '5 energy / 15 min') : '')
        + '</div>';
    },
    async travel(el) {
      const d = await liveData('travel');
      const t = d.travel || {};
      const dest = t.destination || 'Torn City';
      const status = (t.status || '').toLowerCase();
      const left = t.timestamp ? t.timestamp * 1000 - Date.now() : 0;
      el.innerHTML = '<div class="live-grid">'
        + '<div class="live-cell"><span>Status</span><b>' + esc(t.status || 'In Torn City') + '</b></div>'
        + '<div class="live-cell"><span>Destination</span><b>' + esc(dest) + '</b>'
        + '<small>' + esc(t.method || '') + '</small></div>'
        + '<div class="live-cell"><span>' + (status === 'traveling' ? 'Arrives in' : 'Time away') + '</span><b data-live-secs="' + Math.round(left / 1000) + '">'
        + (left > 0 ? fmtClock(left) : '—') + '</b></div>'
        + '</div><div class="live-note">You cannot attack, be attacked, or use most city features while abroad.</div>';
    },
    async gym(el) {
      const d = await liveData('profile,bars');
      const p = d.profile || {};
      const st = p.battle_stats || {};
      const names = [['strength', 'STR'], ['speed', 'SPD'], ['defense', 'DEF'], ['dexterity', 'DEX']];
      const total = names.reduce((a, [k]) => a + (parseFloat(st[k]) || 0), 0);
      const happy = (d.bars && d.bars.happy && d.bars.happy.current) || 0;
      const info = p.gym || null;
      el.innerHTML = '<div class="live-grid">'
        + names.map(([k, lbl]) => '<div class="live-cell"><span>' + lbl + '</span><b>' + fmtShort(parseFloat(st[k]) || 0) + '</b></div>').join('')
        + '<div class="live-cell"><span>Total</span><b>' + fmtShort(total) + '</b><small>' + esc(p.level ? 'level ' + p.level : '') + '</small></div>'
        + '<div class="live-cell"><span>Happy right now</span><b>' + fmtInt(happy) + '</b><small>' + esc(info ? info.name || '' : '') + '</small></div>'
        + '</div><div class="live-note">Plug these numbers into the <a href="#/t/gym">Gym gains calculator</a> — happy is the single biggest lever on your next train.</div>';
    },
    async job(el) {
      const d = await liveData('profile,jobpoints,workstats');
      const p = d.profile || {}, jp = d.jobpoints || {}, ws = d.workstats || {};
      const points = jp.jobs || {};
      el.innerHTML = '<div class="live-grid">'
        + '<div class="live-cell"><span>Position</span><b style="font-size:14px">' + esc((p.job && p.job.position) || p.job || '—') + '</b>'
        + '<small>' + esc((p.job && p.job.company_name) || 'city job') + '</small></div>'
        + '<div class="live-cell"><span>Manual</span><b>' + fmtInt(ws.manual_labor) + '</b></div>'
        + '<div class="live-cell"><span>Intelligence</span><b>' + fmtInt(ws.intelligence) + '</b></div>'
        + '<div class="live-cell"><span>Endurance</span><b>' + fmtInt(ws.endurance) + '</b></div>'
        + '</div>'
        + (Object.keys(points).length
          ? '<div class="pill-row">' + Object.keys(points).map((k) => '<span class="pill">' + esc(k) + ' points <b>' + fmtInt(points[k]) + '</b></span>').join('') + '</div>'
          : '')
        + '<div class="live-note">City-job points drop at 18:00 TCT. Use the <a href="#/t/jobpoints">Job points calculator</a> for promotion maths.</div>';
    },
    async money(el) {
      const d = await liveData('money,networth');
      el.innerHTML = '<div class="live-grid">'
        + '<div class="live-cell"><span>Cash on hand</span><b>' + fmtMoney(d.money_onhand) + '</b></div>'
        + '<div class="live-cell"><span>In the bank</span><b>' + fmtMoney(d.money_inbank) + '</b></div>'
        + '<div class="live-cell"><span>Net worth</span><b>' + fmtMoney(d.networth) + '</b></div>'
        + '<div class="live-cell"><span>Points</span><b>' + fmtInt(d.points) + '</b></div>'
        + '</div><div class="live-note">Never fly with a fat wallet — you can be mugged abroad, and there is no hospital nearby.</div>';
    },
    async company(el) {
      const d = await liveData('profile');
      const c = (d.profile && d.profile.job) || {};
      const rating = (d.profile && d.profile.company) ? d.profile.company.rating : null;
      if (!c.company_id) {
        el.innerHTML = '<div class="live-note">You are not currently employed by a player company. See <a href="#/a/companies">Companies</a> for the full list.</div>';
        return;
      }
      el.innerHTML = '<div class="live-grid">'
        + '<div class="live-cell"><span>Company</span><b style="font-size:14px">' + esc(c.company_name || '—') + '</b><small>' + esc(c.position || '') + '</small></div>'
        + '<div class="live-cell"><span>Days employed</span><b>' + fmtInt(c.days_in_company) + '</b></div>'
        + (rating ? '<div class="live-cell"><span>Star rating</span><b>' + rating + '★</b></div>' : '')
        + '</div><div class="live-note">Directors can read every stock line, employee and the company bank in <b>LumberCorp 2.0 → Company</b>.</div>';
    },
  };

  function renderLivePlaceholders(root) {
    root.querySelectorAll('[data-live]').forEach((el) => {
      const kind = el.getAttribute('data-live');
      if (!S.key) {
        el.innerHTML = '<div class="live-box"><h4>⚡ Live data <span class="pill">optional</span></h4>'
          + '<div class="live-note">Add a Torn API key in <a href="#/live">Live data</a> and this box fills with '
          + 'your real numbers: bars, travel timer, stats, job points, cash. Keys never leave your browser except to talk to the Torn API.</div></div>';
        return;
      }
      const fn = LIVE_WIDGETS[kind];
      if (!fn) { el.innerHTML = ''; return; }
      el.innerHTML = '<div class="live-box"><h4>⚡ Live data <span class="pill">loading…</span></h4></div>';
      fn(el).catch((e) => {
        el.innerHTML = '<div class="live-box"><h4>⚡ Live data <span class="pill">unavailable</span></h4>'
          + '<div class="live-note">' + esc(e && e.message === 'no-key' ? 'No API key set.' : (e && e.message) || 'Could not reach the Torn API.') + '</div></div>';
      });
    });
  }

  /* ================================================== live wiki fetching */
  async function wikiApi(params) {
    // 1) same-origin proxy (works on the preview server and on Render),
    // 2) direct to MediaWiki with CORS, 3) user-configured proxy.
    const qs = Object.keys(params).map((k) => k + '=' + encodeURIComponent(params[k])).join('&');
    const direct = WIKI_API + '?' + qs + '&format=json&origin=*';
    const tries = ['/api/wiki?' + qs];
    if (S.proxy) tries.push(S.proxy.replace(/\/$/, '') + '/api/wiki?' + qs);
    tries.push(direct);
    let lastErr;
    for (const url of tries) {
      try {
        const r = await fetch(url, { cache: 'no-store' });
        if (!r.ok) { lastErr = new Error('HTTP ' + r.status); continue; }
        return await r.json();
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('offline');
  }

  async function wikiSearch(q) {
    const j = await wikiApi({ action: 'query', list: 'search', srsearch: q, srlimit: '8', srprop: 'snippet' });
    return ((j.query && j.query.search) || []).map((r) => ({
      title: r.title,
      snippet: String(r.snippet || '').replace(/<[^>]+>/g, ''),
    }));
  }
  async function wikiPage(title) {
    const j = await wikiApi({
      action: 'query', prop: 'extracts|info', titles: title,
      explaintext: '1', exintro: '0', redirects: '1', inprop: 'url',
    });
    const pages = (j.query && j.query.pages) || {};
    const first = Object.keys(pages)[0];
    const p = pages[first];
    if (!p || p.missing !== undefined) return null;
    return { title: p.title, extract: p.extract || '', url: (p.fullurl || ('https://wiki.torn.com/wiki/' + encodeURIComponent(p.title))) };
  }

  function offlineCount() { return Object.keys(S.offline || {}).length; }
  function saveOffline(title, page) {
    S.offline[title] = { title, extract: page.extract, url: page.url, at: Date.now() };
    if (Object.keys(S.offline).length > 120) {
      const oldest = Object.keys(S.offline).sort((a, b) => S.offline[a].at - S.offline[b].at)[0];
      delete S.offline[oldest];
    }
    save();
  }

  /* ============================================================ calculators */
  function renderCalc(id, root) {
    const c = CALCS.find((x) => x.id === id);
    if (!c) return '';
    const wrap = document.createElement('div');
    wrap.className = 'calc';
    wrap.innerHTML = '<h4>🧮 ' + esc(c.title) + '</h4>'
      + '<div class="calc-desc">' + inline(c.blurb || '') + '</div>'
      + '<div class="calc-grid">' + c.fields.map((f) => {
        const input = f.type === 'select'
          ? '<select data-k="' + f.key + '">' + f.options.map((o) => '<option value="' + esc(o.v) + '">' + esc(o.t) + '</option>').join('') + '</select>'
          : '<input type="number" data-k="' + f.key + '" value="' + esc(f.def) + '"'
            + (f.step ? ' step="' + f.step + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '') + '>';
        return '<div class="field"><label>' + esc(f.label) + '</label>' + input + '</div>';
      }).join('') + '</div>'
      + '<div class="calc-out"></div>';
    if (root) root.appendChild(wrap); else return wrap.outerHTML;

    const out = wrap.querySelector('.calc-out');
    const read = () => {
      const v = {};
      wrap.querySelectorAll('[data-k]').forEach((el) => {
        const k = el.getAttribute('data-k');
        const f = c.fields.find((x) => x.key === k);
        v[k] = (f && f.type === 'select') ? el.value : num(el.value, 0);
      });
      return v;
    };
    const update = () => {
      let r;
      try { r = c.run(read()); } catch (e) { r = { big: '—', sub: 'Check your inputs.' }; }
      out.innerHTML = (r.big ? '<div class="big">' + esc(r.big) + '</div>' : '')
        + (r.sub ? '<div class="sub">' + inline(r.sub) + '</div>' : '')
        + (r.grid ? '<div class="out-grid" style="margin-top:10px">' + r.grid.map((g) =>
          '<div><span>' + esc(g.label) + '</span><b>' + esc(g.value) + '</b></div>').join('') + '</div>' : '')
        + (r.note ? '<div class="live-note">' + inline(r.note) + '</div>' : '');
    };
    wrap.addEventListener('input', update);
    wrap.addEventListener('change', update);
    update();
  }
  function renderCalcPlaceholders(root) {
    root.querySelectorAll('[data-calc]').forEach((el) => renderCalc(el.getAttribute('data-calc'), el));
  }

  /* ================================================================ views */
  function articleCard(a) {
    const on = (S.bookmarks || []).indexOf(a.id) >= 0;
    return '<a class="card" href="#/a/' + esc(a.id) + '">'
      + '<button class="star' + (on ? ' on' : '') + '" data-star="' + esc(a.id) + '" title="Bookmark">'
      + (on ? '★' : '☆') + '</button>'
      + '<div class="top"><span class="ic">' + esc(a.icon || '📄') + '</span><h3>' + esc(a.title) + '</h3></div>'
      + '<p>' + esc(a.summary || '') + '</p>'
      + '</a>';
  }

  function viewHome() {
    const counts = {};
    A.forEach((a) => { counts[a.cat] = (counts[a.cat] || 0) + 1; });
    const startHere = ['getting-started', 'energy', 'happy', 'gym', 'travel', 'npc-looting']
      .map((id) => BY_ID[id]).filter(Boolean);
    const recent = (S.visited || []).map((id) => BY_ID[id]).filter(Boolean).slice(0, 4);
    const tables = [
      ['articles', A.length, 'Articles'],
      ['calculators', CALCS.length, 'Calculators'],
      ['drops', D.npcs.reduce((s, n) => s + n.loot.length, 0), 'NPC drops'],
      ['rows', D.jobs.reduce((s, j) => s + j.pos.length, 0) + D.companies.length + D.travel.length + D.gyms.length, 'Data rows'],
    ];

    let h = '<section class="hero">'
      + '<h1>The Torn City wiki, <span>without the MediaWiki</span>.</h1>'
      + '<p>Every article is in your browser, so search is instant and it works on a plane. Add a Torn API key and the reference pages fill in <em>your</em> numbers.</p>'
      + '<div class="hero-stats">' + tables.map(([k, v, l]) =>
        '<div class="hero-stat"><b>' + fmtInt(v) + '</b><span>' + l + '</span></div>').join('') + '</div>'
      + '</section>';

    h += '<div class="quicklinks">' + ['core', 'combat', 'work', 'travel', 'faction', 'strategy'].map((cid) => {
      const c = CAT_BY_ID[cid];
      return '<a class="qlink" href="#/c/' + cid + '"><span class="ic">' + c.icon + '</span>'
        + '<span><span class="t">' + esc(c.name) + '</span><br><span class="s">' + (counts[cid] || 0) + ' articles</span></span></a>';
    }).join('') + '</div>';

    if (recent.length) {
      h += '<div class="sec-head"><h2>Pick up where you left off</h2><div class="line"></div></div>'
        + '<div class="cards">' + recent.map(articleCard).join('') + '</div>';
    }
    h += '<div class="sec-head"><h2>Start here</h2><div class="line"></div></div>'
      + '<div class="cards">' + startHere.map(articleCard).join('') + '</div>';

    h += '<div class="sec-head"><h2>Calculators</h2><div class="line"></div><a href="#/tools">all tools →</a></div>'
      + '<div class="cards">' + CALCS.slice(0, 4).map((c) =>
        '<a class="card" href="#/t/' + esc(c.id) + '"><div class="top"><span class="ic">🧮</span><h3>' + esc(c.title) + '</h3></div>'
        + '<p>' + esc(c.blurb) + '</p></a>').join('') + '</div>';

    h += '<div class="sec-head"><h2>Browse everything</h2><div class="line"></div></div>'
      + '<div class="cards">' + CATS.map((c) =>
        '<a class="card" href="#/c/' + c.id + '"><div class="top"><span class="ic">' + c.icon + '</span><h3>' + esc(c.name) + '</h3></div>'
        + '<p>' + (counts[c.id] || 0) + ' articles</p></a>').join('') + '</div>';
    return h;
  }

  function viewCategory(id) {
    const c = CAT_BY_ID[id];
    if (!c) return viewEmpty('No such category');
    const list = A.filter((a) => a.cat === id);
    return '<section class="hero"><h1>' + c.icon + ' ' + esc(c.name) + '</h1>'
      + '<p>' + list.length + ' article' + (list.length === 1 ? '' : 's') + '.</p></section>'
      + '<div class="cards">' + list.map(articleCard).join('') + '</div>';
  }

  function viewArticle(a) {
    const cat = CAT_BY_ID[a.cat] || { name: 'Reference', icon: '📄' };
    let h = '<article class="article">'
      + '<div class="art-eyebrow"><a href="#/c/' + esc(a.cat) + '">' + cat.icon + ' ' + esc(cat.name) + '</a>'
      + '<span class="dot"></span><span>' + esc((a.tags || []).join(' · ')) + '</span></div>'
      + '<h1 class="art-title">' + esc(a.title) + '</h1>'
      + '<p class="art-lede">' + inline(a.summary || '') + '</p>'
      + '<div class="art-actions">'
      + '<button class="btn sm" data-star-btn="' + esc(a.id) + '">' + ((S.bookmarks || []).indexOf(a.id) >= 0 ? '★ Bookmarked' : '☆ Bookmark') + '</button>'
      + '<button class="btn sm" id="wikiFetchBtn" data-wiki="' + esc(a.wiki || a.title) + '">↯ Load the official wiki page</button>'
      + '<a class="btn sm" target="_blank" rel="noopener" href="https://wiki.torn.com/wiki/' + encodeURIComponent((a.wiki || a.title).replace(/ /g, '_')) + '">wiki.torn.com ↗</a>'
      + '<button class="btn sm ghost" data-random="1">🎲 Random</button>'
      + '</div>';

    if (a.facts && a.facts.length) {
      h += '<div class="infobox"><h4>Quick facts</h4><div class="info-grid">'
        + a.facts.map((f) => '<div><span>' + esc(f[0]) + '</span><b>' + esc(f[1]) + '</b></div>').join('')
        + '</div></div>';
    }

    /* front-matter live widget (articles can also drop one inline with {{live:x}}) */
    if (a.live && LIVE_WIDGETS[a.live]) h += '<div data-live="' + esc(a.live) + '"></div>';

    const body = renderBody(a.body || '');
    const toc = (body.match(/<h2 id="h-([^"]+)">([^<]+)<\/h2>/g) || []);
    if (toc.length >= 3) {
      h += '<aside class="toc"><h5>On this page</h5>' + toc.map((m) => {
        const mm = m.match(/id="h-([^"]+)">([^<]+)</);
        return '<a href="#/a/' + a.id + '#' + mm[1] + '" data-toc="' + mm[1] + '">' + esc(mm[2]) + '</a>';
      }).join('') + '</aside>';
    }
    h += '<div class="art-body">' + body + '</div>';

    if (a.related && a.related.length) {
      h += '<div class="sec-head"><h2>Keep reading</h2><div class="line"></div></div><div class="related">'
        + a.related.map((r) => {
          const t = BY_ID[r];
          return t ? '<a href="#/a/' + esc(t.id) + '"><span>' + esc(t.icon || '📄') + '</span>' + esc(t.title) + '</a>' : '';
        }).join('') + '</div>';
    }

    h += '<div class="art-foot"><div class="src">Sources: the mechanics on this page were checked against '
      + '<a target="_blank" rel="noopener" href="https://wiki.torn.com/wiki/' + encodeURIComponent((a.wiki || a.title).replace(/ /g, '_')) + '">'
      + esc(a.wiki || a.title) + ' on wiki.torn.com</a>. '
      + 'Anything marked as an estimate is a community figure, not an official number.</div>'
      + '<div>Tornpedia is an unofficial fan project. Not affiliated with Torn City / Eugenius Ltd.</div></div>';

    return h + '</article>';
  }

  function viewSearch(q) {
    const res = q ? search(q) : [];
    let h = '<div class="search-row"><span class="mag" style="font-size:17px;color:var(--tx-3)">⌕</span>'
      + '<input id="searchInput" value="' + esc(q) + '" placeholder="Search the library…" autocomplete="off">'
      + '<span style="color:var(--tx-3);font-size:12.5px">' + res.length + ' result' + (res.length === 1 ? '' : 's') + '</span></div>';
    if (!q) {
      h += '<div class="empty"><div class="big">⌕</div>Type to search ' + A.length + ' articles — or press <kbd>/</kbd> anywhere.</div>';
      return h;
    }
    h += '<div class="res">' + res.map((r) => {
      const a = r.a;
      const cat = CAT_BY_ID[a.cat];
      return '<a href="#/a/' + esc(a.id) + '"><span class="ic">' + esc(a.icon || '📄') + '</span><span>'
        + '<div class="t">' + esc(a.title) + '</div><div class="s">' + esc(a.summary || '') + '</div>'
        + '<div class="m">' + esc(cat ? cat.icon + ' ' + cat.name : '') + ' · score ' + Math.round(r.score) + '</div></span></a>';
    }).join('') + '</div>';
    h += wikiSection(q);
    return h;
  }

  function wikiSection(q) {
    return '<div id="wikiRemote" class="sec-head"><h2>On wiki.torn.com</h2><div class="line"></div></div>'
      + '<div id="wikiRemoteOut"><div class="empty" style="padding:20px">Searching the official wiki…</div></div>'
      + '<script type="text/plain" data-wiki-q="' + esc(q) + '"></script>';
  }

  async function runWikiSearch(q) {
    const box = $('wikiRemoteOut');
    if (!box) return;
    try {
      const res = await wikiSearch(q);
      if (!res.length) { box.innerHTML = '<div class="empty" style="padding:20px">No matches on the official wiki.</div>'; return; }
      box.innerHTML = '<div class="res">' + res.map((r) =>
        '<a href="#/w/' + encodeURIComponent(r.title) + '"><span class="ic">🌐</span><span>'
        + '<div class="t">' + esc(r.title) + '</div><div class="s">' + esc(r.snippet) + '</div>'
        + '<div class="m">live from wiki.torn.com</div></span></a>').join('') + '</div>';
    } catch (e) {
      box.innerHTML = '<div class="empty" style="padding:20px">Could not reach wiki.torn.com' 
        + (S.proxy ? '' : ' — set a proxy URL in <a href="#/live">Live data</a> to enable this on a static host')
        + '.</div>';
    }
  }

  function viewTools() {
    let h = '<section class="hero"><h1>🧮 Calculators</h1><p>Live maths on the numbers that decide your day in Torn. Every formula is shown, and every estimate is labelled as one.</p></section>';
    h += '<div class="cards">' + CALCS.map((c) =>
      '<a class="card" href="#/t/' + esc(c.id) + '"><div class="top"><span class="ic">' + esc(c.icon || '🧮') + '</span><h3>' + esc(c.title) + '</h3></div>'
      + '<p>' + esc(c.blurb) + '</p></a>').join('') + '</div>';
    return h;
  }
  function viewCalc(id) {
    const c = CALCS.find((x) => x.id === id);
    if (!c) return viewEmpty('No such calculator');
    let h = '<section class="hero"><h1>' + esc(c.icon || '🧮') + ' ' + esc(c.title) + '</h1><p>' + inline(c.blurb) + '</p></section>';
    h += '<div data-calc="' + esc(id) + '"></div>';
    if (c.how) h += '<div class="art-body">' + renderBody(c.how) + '</div>';
    return h;
  }

  function viewBookmarks() {
    const list = (S.bookmarks || []).map((id) => BY_ID[id]).filter(Boolean);
    if (!list.length) return viewEmpty('No bookmarks yet', 'Tap the ☆ on any article to save it for offline reading.');
    return '<section class="hero"><h1>🔖 Bookmarks</h1><p>' + list.length + ' saved — all of them available offline.</p></section>'
      + '<div class="cards">' + list.map(articleCard).join('') + '</div>';
  }

  function viewOffline() {
    const pages = Object.keys(S.offline || {});
    let h = '<section class="hero"><h1>📥 Offline</h1>'
      + '<p>Tornpedia is an installable PWA: the whole bundled library works with no connection. Pages you pull from the official wiki are cached here too.</p></section>';
    h += '<div class="infobox"><h4>This browser</h4><div class="info-grid">'
      + '<div><span>Bundled articles</span><b>' + A.length + '</b></div>'
      + '<div><span>Wiki pages saved</span><b>' + pages.length + '</b></div>'
      + '<div><span>Installed</span><b>' + (isStandalone() ? 'yes' : 'no') + '</b></div>'
      + '<div><span>Connection</span><b>' + (navigator.onLine ? 'online' : 'offline') + '</b></div>'
      + '</div></div>';
    if (pages.length) {
      h += '<div class="sec-head"><h2>Saved from wiki.torn.com</h2><div class="line"></div></div>'
        + '<div class="cards">' + pages.map((t) =>
          '<a class="card" href="#/w/' + encodeURIComponent(t) + '"><div class="top"><span class="ic">🌐</span><h3>' + esc(t) + '</h3></div>'
          + '<p>Saved ' + esc(new Date(S.offline[t].at).toLocaleDateString()) + '</p></a>').join('') + '</div>';
    }
    h += '<div class="sec-head"><h2>Install</h2><div class="line"></div></div>'
      + '<div class="art-body"><p>Use <b>Install app</b> in the sidebar (or your browser’s “Add to Home Screen”) to get Tornpedia as a standalone app. '
      + 'Once installed, the service worker serves every bundled article with no network at all.</p></div>';
    return h;
  }

  function viewLive() {
    const key = (S.key || '').trim();
    let h = '<section class="hero"><h1>🔌 Live data</h1>'
      + '<p>Optional. Add a Torn API key and the reference articles stop being generic — your bars, your stats, your job points, right inside the page.</p></section>';
    h += '<div class="infobox"><h4>Your key</h4>'
      + '<div class="field" style="max-width:520px"><label>Torn API key (stored in this browser only)</label>'
      + '<input id="keyInput" type="password" value="' + esc(key) + '" placeholder="paste a Minimal-access key" autocomplete="off"></div>'
      + '<div class="pill-row"><span class="pill ' + (key ? 'ok' : '') + '">' + (key ? 'key saved' : 'no key — demo mode') + '</span>'
      + (key ? '<button class="btn sm" id="testKeyBtn">Test connection</button>' : '')
      + (key ? '<button class="btn sm ghost" id="clearKeyBtn">Remove key</button>' : '')
      + '</div><div id="keyMsg" class="live-note"></div></div>';

    h += '<div class="infobox"><h4>Proxy (optional)</h4>'
      + '<div class="field" style="max-width:520px"><label>Proxy base URL — enables wiki.torn.com lookup on a static host</label>'
      + '<input id="proxyInput" value="' + esc(S.proxy || '') + '" placeholder="https://your-proxy.onrender.com" autocomplete="off"></div>'
      + '<div class="live-note">Browsers block direct calls to wiki.torn.com from some hosts. Point this at the repo’s '
      + '<code style="font-family:var(--mono);font-size:12px">proxy/server.js</code> (it serves <code style="font-family:var(--mono);font-size:12px">/api/wiki</code> '
      + 'and <code style="font-family:var(--mono);font-size:12px">/api/torn</code>) and live wiki search works everywhere.</div></div>';

    if (key) {
      h += '<div class="sec-head"><h2>Your numbers</h2><div class="line"></div><button class="btn sm" id="refreshLiveBtn">⟳ Refresh</button></div>';
      h += '<div data-live="bars"></div><div data-live="money"></div><div data-live="travel"></div><div data-live="gym"></div><div data-live="job"></div>';
    } else {
      h += '<div class="art-body"><h3>How to get a key</h3><ol>'
        + '<li>In Torn: <b>Account → Settings → API</b>, or the API page under your profile.</li>'
        + '<li>Create a key with <b>Minimal access</b> — that is all Tornpedia needs.</li>'
        + '<li>Paste it above. It is kept in this browser’s localStorage and sent only to api.torn.com.</li>'
        + '</ol><div class="callout warn"><span class="lbl">Warn</span>Never paste a full-access key into a site you do not control. '
        + 'Tornpedia only ever asks the API for read-only selections.</div></div>';
    }
    return h;
  }

  async function viewWikiPage(title) {
    const cached = S.offline[title];
    let h = '<section class="hero"><h1>🌐 ' + esc(title) + '</h1>'
      + '<p>Fetched live from wiki.torn.com' + (cached ? ' (a copy is saved on this device)' : '') + '.</p>'
      + '<div class="art-actions"><button class="btn sm" id="saveOfflineBtn">' + (cached ? '✓ Saved for offline' : '📥 Save for offline') + '</button>'
      + '<a class="btn sm" target="_blank" rel="noopener" href="https://wiki.torn.com/wiki/' + encodeURIComponent(title.replace(/ /g, '_')) + '">Open on the wiki ↗</a>'
      + '</div></section>';
    h += '<div class="art-body" id="wikiBody">' + (cached
      ? renderWikiExtract(cached.extract)
      : '<div class="empty">Loading…</div>') + '</div>';
    return h;
  }

  function renderWikiExtract(text) {
    return String(text).split(/\n{2,}/).map((p) => {
      const t = p.trim();
      if (!t) return '';
      if (/^={2,4}\s*.+\s*={2,4}$/.test(t)) {
        const level = (t.match(/^=+/) || ['=='])[0].length;
        const label = t.replace(/^=+\s*|\s*=+$/g, '');
        return level <= 3 ? '<h2>' + esc(label) + '</h2>' : '<h3>' + esc(label) + '</h3>';
      }
      if (/^\*/.test(t)) return '<ul>' + t.split('\n').map((l) => '<li>' + esc(l.replace(/^\*\s*/, '')) + '</li>').join('') + '</ul>';
      return '<p>' + esc(t) + '</p>';
    }).join('');
  }

  function viewEmpty(title, sub) {
    return '<div class="empty"><div class="big">🪵</div><h2>' + esc(title) + '</h2>'
      + '<p>' + esc(sub || 'Try the search — or press ⌘K.') + '</p></div>';
  }

  /* ============================================================== router */
  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, anchor] = raw.split('#');
    const parts = path.split('/').filter(Boolean);
    return { parts, anchor: anchor || '', raw };
  }

  function renderSidebar(activeCat) {
    const counts = {};
    A.forEach((a) => { counts[a.cat] = (counts[a.cat] || 0) + 1; });
    $('sbNav').innerHTML = '<div class="nav-group"><h4>Library</h4>'
      + CATS.map((c) => '<a class="nav-item' + (c.id === activeCat ? ' active' : '') + '" href="#/c/' + c.id + '">'
        + '<span class="ic">' + c.icon + '</span>' + esc(c.name) + '<span class="n">' + (counts[c.id] || 0) + '</span></a>').join('')
      + '</div>';
    $('bmCount').textContent = (S.bookmarks || []).length;
  }

  let currentArticle = null;

  async function route() {
    const { parts, anchor } = parseHash();
    const view = $('view');
    const crumb = $('crumb');
    window.scrollTo(0, 0);
    renderSidebar(parts[0] === 'c' ? parts[1] : null);

    if (!parts.length) {
      currentArticle = null;
      crumb.innerHTML = '<b>Home</b>';
      view.innerHTML = viewHome();
    } else if (parts[0] === 'a' && parts[1]) {
      const a = BY_ID[parts[1]];
      if (!a) { view.innerHTML = viewEmpty('Article not found'); crumb.innerHTML = '<b>Not found</b>'; return; }
      currentArticle = a;
      S.visited = [a.id].concat((S.visited || []).filter((x) => x !== a.id)).slice(0, 12);
      save();
      crumb.innerHTML = esc((CAT_BY_ID[a.cat] || {}).name || '') + ' / <b>' + esc(a.title) + '</b>';
      document.title = a.title + ' — Tornpedia';
      view.innerHTML = viewArticle(a);
      renderCalcPlaceholders(view);
      renderLivePlaceholders(view);
      setupToc(anchor);
    } else if (parts[0] === 'c' && parts[1]) {
      currentArticle = null;
      const c = CAT_BY_ID[parts[1]];
      crumb.innerHTML = '<b>' + esc(c ? c.name : 'Category') + '</b>';
      document.title = (c ? c.name : 'Category') + ' — Tornpedia';
      view.innerHTML = viewCategory(parts[1]);
    } else if (parts[0] === 's') {
      currentArticle = null;
      const q = decodeURIComponent(parts[1] || '');
      crumb.innerHTML = '<b>Search</b> ' + esc(q);
      view.innerHTML = viewSearch(q);
      const input = $('searchInput');
      if (input) {
        input.addEventListener('input', () => {
          const val = input.value.trim();
          history.replaceState(null, '', '#/s/' + encodeURIComponent(val));
          const keep = view.querySelector('.res');
          const res = val ? search(val) : [];
          if (keep) {
            keep.innerHTML = res.map((r) => {
              const a = r.a, cat = CAT_BY_ID[a.cat];
              return '<a href="#/a/' + esc(a.id) + '"><span class="ic">' + esc(a.icon || '📄') + '</span><span>'
                + '<div class="t">' + esc(a.title) + '</div><div class="s">' + esc(a.summary || '') + '</div>'
                + '<div class="m">' + esc(cat ? cat.icon + ' ' + cat.name : '') + '</div></span></a>';
            }).join('');
          }
        });
        input.focus();
      }
      const qNode = view.querySelector('[data-wiki-q]');
      if (qNode) runWikiSearch(qNode.getAttribute('data-wiki-q'));
    } else if (parts[0] === 't') {
      currentArticle = null;
      crumb.innerHTML = 'Tools / <b>' + esc(((CALCS.find((c) => c.id === parts[1]) || {}).title) || 'Calculators') + '</b>';
      view.innerHTML = parts[1] ? viewCalc(parts[1]) : viewTools();
      renderCalcPlaceholders(view);
    } else if (parts[0] === 'tools') {
      currentArticle = null;
      crumb.innerHTML = '<b>Calculators</b>';
      view.innerHTML = viewTools();
    } else if (parts[0] === 'bookmarks') {
      currentArticle = null;
      crumb.innerHTML = '<b>Bookmarks</b>';
      view.innerHTML = viewBookmarks();
    } else if (parts[0] === 'offline') {
      currentArticle = null;
      crumb.innerHTML = '<b>Offline</b>';
      view.innerHTML = viewOffline();
    } else if (parts[0] === 'live') {
      currentArticle = null;
      crumb.innerHTML = '<b>Live data</b>';
      view.innerHTML = viewLive();
      renderLivePlaceholders(view);
      wireLive();
    } else if (parts[0] === 'w' && parts[1]) {
      currentArticle = null;
      const title = decodeURIComponent(parts[1]);
      crumb.innerHTML = 'wiki.torn.com / <b>' + esc(title) + '</b>';
      view.innerHTML = await viewWikiPage(title);
      wireWikiPage(title);
    } else if (parts[0] === 'random') {
      const a = A[Math.floor(Math.random() * A.length)];
      location.hash = '#/a/' + a.id;
      return;
    } else {
      view.innerHTML = viewEmpty('Nothing here');
    }

    attachStarHandlers(view);
  }

  function setupToc(anchor) {
    const links = document.querySelectorAll('.toc a');
    if (!links.length) return;
    const go = (id) => {
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('data-toc') === id));
    };
    links.forEach((l) => l.addEventListener('click', () => go(l.getAttribute('data-toc'))));
    if (anchor) {
      const el = document.getElementById('h-' + anchor);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      go(anchor);
    }
    // highlight on scroll (one listener at a time — routes come and go)
    const heads = [].slice.call(document.querySelectorAll('.art-body h2[id]'));
    if (tocScrollHandler) document.removeEventListener('scroll', tocScrollHandler);
    if (heads.length) {
      tocScrollHandler = () => {
        let cur = heads[0].id.replace('h-', '');
        heads.forEach((hd) => { if (hd.getBoundingClientRect().top < 140) cur = hd.id.replace('h-', ''); });
        go(cur);
      };
      document.addEventListener('scroll', tocScrollHandler, { passive: true });
      tocScrollHandler();
    }
  }
  let tocScrollHandler = null;

  function wireLive() {
    const keyInput = $('keyInput');
    const proxyInput = $('proxyInput');
    if (keyInput) {
      keyInput.addEventListener('change', () => {
        S.key = keyInput.value.trim(); save(); toast('Key saved'); route();
      });
    }
    if (proxyInput) {
      proxyInput.addEventListener('change', () => {
        S.proxy = proxyInput.value.trim().replace(/\/$/, ''); save(); toast('Proxy saved');
      });
    }
    const test = $('testKeyBtn');
    if (test) test.addEventListener('click', async () => {
      const msg = $('keyMsg');
      msg.textContent = 'Contacting the Torn API…';
      try {
        const d = await tornGet('user', 'bars');
        const e = d.bars && d.bars.energy;
        msg.innerHTML = '✅ Connected' + (e ? ' — energy ' + fmtInt(e.current) + '/' + fmtInt(e.maximum) : '') + '.';
        toast('Connected to the Torn API', 'ok');
        route();
      } catch (err) {
        msg.innerHTML = '❌ ' + esc((err && err.message) || 'failed') + ' — check the key’s access level.';
        toast('Connection failed', 'bad');
      }
    });
    const clear = $('clearKeyBtn');
    if (clear) clear.addEventListener('click', () => { S.key = ''; save(); toast('Key removed'); route(); });
    const refresh = $('refreshLiveBtn');
    if (refresh) refresh.addEventListener('click', () => { clearLive(); route(); toast('Refreshed from the Torn API', 'ok'); });
  }

  function wireWikiPage(title) {
    const saveBtn = $('saveOfflineBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const body = $('wikiBody');
      if (S.offline[title]) { delete S.offline[title]; save(); toast('Removed from offline'); saveBtn.textContent = '📥 Save for offline'; return; }
      const cached = window.__tpLastWiki;
      if (cached && cached.title === title) { saveOffline(title, cached); toast('Saved for offline', 'ok'); saveBtn.textContent = '✓ Saved for offline'; }
      else toast('Wait for the page to finish loading', 'bad');
    });
    if (!S.offline[title]) {
      wikiPage(title).then((p) => {
        if (!p) { $('wikiBody').innerHTML = '<div class="empty">That page does not exist on wiki.torn.com.</div>'; return; }
        window.__tpLastWiki = p;
        $('wikiBody').innerHTML = renderWikiExtract(p.extract);
      }).catch(() => {
        $('wikiBody').innerHTML = '<div class="empty">Could not reach wiki.torn.com. '
          + (S.offline[title] ? '' : 'Try again when you are online, or set a proxy in <a href="#/live">Live data</a>.') + '</div>';
      });
    }
  }

  function attachStarHandlers(root) {
    root.querySelectorAll('[data-star]').forEach((b) => {
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleStar(b.getAttribute('data-star')); });
    });
    root.querySelectorAll('[data-star-btn]').forEach((b) => {
      b.addEventListener('click', () => toggleStar(b.getAttribute('data-star-btn')));
    });
    root.querySelectorAll('[data-random]').forEach((b) => b.addEventListener('click', () => { location.hash = '#/random'; }));
    root.querySelectorAll('[data-wiki]').forEach((b) => {
      b.addEventListener('click', () => { location.hash = '#/w/' + encodeURIComponent(b.getAttribute('data-wiki')); });
    });
  }

  function toggleStar(id) {
    const i = (S.bookmarks || []).indexOf(id);
    if (i >= 0) { S.bookmarks.splice(i, 1); toast('Bookmark removed'); }
    else { S.bookmarks.push(id); toast('Bookmarked — available offline', 'ok'); }
    save();
    renderSidebar(parseHash().parts[0] === 'c' ? parseHash().parts[1] : null);
    const btn = document.querySelector('[data-star-btn="' + id + '"]');
    if (btn) btn.textContent = (S.bookmarks.indexOf(id) >= 0 ? '★ Bookmarked' : '☆ Bookmark');
    document.querySelectorAll('[data-star="' + id + '"]').forEach((s) => {
      const on = S.bookmarks.indexOf(id) >= 0;
      s.classList.toggle('on', on); s.textContent = on ? '★' : '☆';
    });
  }

  /* ============================================================== palette */
  let pSel = 0, pItems = [];
  function openPalette(prefill) {
    $('paletteWrap').hidden = false;
    const input = $('paletteInput');
    input.value = prefill || '';
    input.focus(); input.select();
    renderPalette(input.value);
  }
  function closePalette() { $('paletteWrap').hidden = true; }

  function renderPalette(q) {
    const box = $('paletteResults');
    pItems = [];
    const groups = [];
    if (!q.trim()) {
      const recent = (S.visited || []).map((id) => BY_ID[id]).filter(Boolean).slice(0, 5);
      if (recent.length) {
        groups.push({
          label: 'Recently read',
          items: recent.map((a) => ({ kind: 'article', href: '#/a/' + a.id, icon: a.icon || '📄', title: a.title, sub: a.summary })),
        });
      }
      groups.push({
        label: 'Jump to',
        items: [
          { href: '#/', icon: '🏠', title: 'Home', sub: 'Start here and browse categories', kind: 'page' },
          { href: '#/tools', icon: '🧮', title: 'All calculators', sub: CALCS.length + ' tools', kind: 'page' },
          { href: '#/live', icon: '🔌', title: 'Live data', sub: 'Connect a Torn API key', kind: 'page' },
          { href: '#/bookmarks', icon: '🔖', title: 'Bookmarks', sub: (S.bookmarks || []).length + ' saved', kind: 'page' },
          { href: '#/offline', icon: '📥', title: 'Offline & install', sub: offlineCount() + ' wiki pages cached', kind: 'page' },
          { href: '#/random', icon: '🎲', title: 'Random article', sub: 'Roll the dice', kind: 'page' },
        ],
      });
    } else {
      const arts = search(q, 9).map((r) => ({
        kind: 'article', href: '#/a/' + r.a.id, icon: r.a.icon || '📄', title: r.a.title, sub: r.a.summary,
      }));
      if (arts.length) groups.push({ label: 'Articles', items: arts });
      const calcs = CALCS.filter((c) => norm(c.title + ' ' + c.blurb).includes(norm(q))).slice(0, 3).map((c) => ({
        kind: 'calculator', href: '#/t/' + c.id, icon: c.icon || '🧮', title: c.title, sub: c.blurb,
      }));
      if (calcs.length) groups.push({ label: 'Calculators', items: calcs });
      if (!pItems.length && !arts.length && !calcs.length) {
        groups.push({ label: '', items: [], empty: 'No bundled match. Looking on wiki.torn.com…' });
      }
    }
    let html = '';
    groups.forEach((g) => {
      if (g.empty) { html += '<div class="p-empty">' + esc(g.empty) + '</div>'; return; }
      if (g.label) html += '<div class="p-group">' + esc(g.label) + '</div>';
      pItems = pItems.concat(g.items);
    });
    html += pItems.map((it, i) => '<div class="p-item' + (i === pSel ? ' sel' : '') + '" data-i="' + i + '">'
      + '<span class="ic">' + esc(it.icon) + '</span><span class="txt"><div class="t">' + esc(it.title) + '</div>'
      + '<div class="s">' + esc(it.sub || '') + '</div></span>'
      + '<span class="kind">' + esc(it.kind) + '</span></div>').join('');
    box.innerHTML = html;
    box.querySelectorAll('.p-item').forEach((el) => {
      el.addEventListener('click', () => goPalette(parseInt(el.getAttribute('data-i'), 10)));
      el.addEventListener('mousemove', () => {
        const i = parseInt(el.getAttribute('data-i'), 10);
        if (i !== pSel) { pSel = i; highlight(); }
      });
    });
    $('paletteScope').textContent = pItems.length + ' bundled results';

    // live wiki results, appended when the bundled library has nothing great
    if (q.trim().length > 2) {
      wikiSearch(q).then((res) => {
        if (!res.length || $('paletteWrap').hidden) return;
        if ($('paletteInput').value !== q) return;
        const div = document.createElement('div');
        div.innerHTML = '<div class="p-group">On wiki.torn.com</div>' + res.slice(0, 5).map((r, i) =>
          '<div class="p-item" data-w="' + esc(r.title) + '"><span class="ic">🌐</span><span class="txt">'
          + '<div class="t">' + esc(r.title) + '</div><div class="s">' + esc(r.snippet) + '</div></span>'
          + '<span class="kind">wiki</span></div>').join('');
        box.appendChild(div);
        div.querySelectorAll('[data-w]').forEach((el) => {
          el.addEventListener('click', () => {
            closePalette();
            location.hash = '#/w/' + encodeURIComponent(el.getAttribute('data-w'));
          });
        });
        $('paletteScope').textContent = pItems.length + ' bundled + ' + res.length + ' wiki';
      }).catch(() => { /* offline — the bundled results stand on their own */ });
    }
  }
  function highlight() {
    document.querySelectorAll('#paletteResults .p-item').forEach((el, i) => el.classList.toggle('sel', i === pSel));
    const sel = document.querySelector('#paletteResults .p-item.sel');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }
  function goPalette(i) {
    const it = pItems[i];
    if (!it) return;
    closePalette();
    location.hash = it.href;
  }

  /* ================================================================ toasts */
  function toast(msg, kind) {
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.innerHTML = msg;
    $('toastWrap').appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2600);
    setTimeout(() => t.remove(), 3000);
  }

  /* ================================================================== PWA */
  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  }
  let deferredPrompt = null;
  function initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* file:// or unsupported */ });
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); deferredPrompt = e;
      const b = $('installBtn'); b.hidden = false;
      b.addEventListener('click', async () => {
        b.hidden = true; deferredPrompt.prompt();
        const r = await deferredPrompt.userChoice;
        if (r && r.outcome === 'accepted') toast('Tornpedia installed', 'ok');
        deferredPrompt = null;
      });
    });
    window.addEventListener('online', () => { $('netStatus').className = 'sb-status'; });
    window.addEventListener('offline', () => { $('netStatus').className = 'sb-status off'; toast('Offline — the bundled library still works'); });
    $('netStatus').className = 'sb-status' + (navigator.onLine ? '' : ' off');
  }

  /* ================================================================ events */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', S.theme || 'dark');
  }
  function init() {
    applyTheme();
    initPWA();
    renderSidebar(null);

    $('themeBtn').addEventListener('click', () => {
      S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme();
    });
    $('sbOpen').addEventListener('click', () => { $('sidebar').classList.add('open'); $('sbScrim').classList.add('show'); });
    $('sbClose').addEventListener('click', closeSidebar);
    $('sbScrim').addEventListener('click', closeSidebar);
    $('sbSearch').addEventListener('click', () => openPalette(''));
    $('topSearch').addEventListener('click', () => openPalette(''));

    $('paletteInput').addEventListener('input', (e) => { pSel = 0; renderPalette(e.target.value); });
    $('paletteWrap').addEventListener('click', (e) => { if (e.target === $('paletteWrap')) closePalette(); });
    $('paletteInput').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); pSel = Math.min(pSel + 1, pItems.length - 1); highlight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); pSel = Math.max(pSel - 1, 0); highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); goPalette(pSel); }
      else if (e.key === 'Escape') closePalette();
    });

    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(''); return; }
      if (e.key === '/' && !typing) { e.preventDefault(); openPalette(''); return; }
      if (e.key === 'Escape' && !$('paletteWrap').hidden) closePalette();
      if (e.key === 'Escape') closeSidebar();
    });

    window.addEventListener('hashchange', route);
    route();
    setInterval(() => {
      document.querySelectorAll('[data-live-secs]').forEach((el) => {
        let s = parseInt(el.getAttribute('data-live-secs'), 10) - 1;
        el.setAttribute('data-live-secs', String(s));
        el.textContent = s > 0 ? fmtClock(s * 1000) : 'landed';
      });
    }, 1000);

    const meta = $('footMeta');
    if (meta) {
      meta.textContent = A.length + ' articles · ' + CALCS.length + ' calculators · '
        + D.npcs.length + ' NPCs · ' + D.companies.length + ' companies · '
        + D.jobs.reduce((s, j) => s + j.pos.length, 0) + ' job positions · '
        + (D.gyms.length + D.specialGyms.length) + ' gyms · all bundled, no network needed';
    }
  }
  function closeSidebar() { $('sidebar').classList.remove('open'); $('sbScrim').classList.remove('show'); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* exposed for tools/check.js (and for poking at the library in devtools) */
  window.Tornpedia = { search, A, D, CALCS, renderCalc, renderBody, route, BY_ID, TABLES, LIVE_WIDGETS, esc };
})();
