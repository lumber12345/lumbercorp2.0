[README.md](https://github.com/user-attachments/files/31874506/README.md)
# LumberCorp Companion — Abroad-Stock Aggregator

## 📖 Lumbercorpedia (`lumbercorpedia/`)

**Lumbercorpedia** is a Torn City wiki that loads instantly and works offline —
the reference layer that sits next to LumberCorp's live data.

| | wiki.torn.com | Lumbercorpedia |
| --- | --- | --- |
| Search | server round-trip per keystroke | instant, fuzzy, offline, `⌘K` |
| Offline | no | yes — installable PWA, whole library cached |
| Live data | none | optional Torn API key fills pages with *your* numbers |
| Maths | read the numbers | 10 interactive calculators |
| Depth | every page, ever | 53 curated articles + live lookup of the rest |

- **53 bundled articles** across core mechanics, combat & crime, work & money,
  items, travel, factions and strategy — every number checked against
  [wiki.torn.com](https://wiki.torn.com/), with estimates labelled as estimates.
- **Verified datasets** ported straight out of this repo's LumberCorp 2.0 PDA
  (and regenerable from it): 13 lootable NPCs with all **58 drops**, **41 city-job
  positions** across six ladders, **39 companies** with every special, 11 travel
  destinations, 33 gyms, properties, medical items and stat weights.
- **10 calculators**: gym gains (both the community formula *and* Torn's official
  growth figures), happy jumps, daily energy, travel profit, battle-stat weights,
  hospital items, NPC loot timers, job points, market fees, company payback.
- **Live layer**: paste a Minimal-access Torn API key and articles grow a box with
  your real bars, travel timer, battle stats, job points, cash and company.
- **Hybrid content**: anything not bundled is one keystroke away — the palette and
  search also query wiki.torn.com live, and pages you open can be saved for offline.

```bash
node tools/preview-server.js 4173     # serves lumbercorpedia/ + /api/wiki + /api/torn proxies
node tools/check.js                   # headless tests: links, tables, calculators, search
node tools/build-datasets.js          # regenerate data/datasets.js from lumbercorp-2/
```

Deploy: `render.yaml` publishes it as a static site (no build step, no keys on the
server). See [`lumbercorpedia/README.md`](lumbercorpedia/README.md) for the file map.

## ✨ LumberCorp 2.0 (`lumbercorp-2/`)

The next generation of the app lives in **`lumbercorp-2/`** — still a
zero-dependency, single-file PWA (`index.html` + `sw.js` + manifest + icons).

Run it:

```bash
cd lumbercorp-2
python3 -m http.server 8000     # or any static server; then open http://localhost:8000
```

### Deploy on Render (v2.4.0+)

`render.yaml` is a **Blueprint** that deploys both pieces in one click
(Render → **New → Blueprint** → this repo):

| Service | What | Notes |
| --- | --- | --- |
| `lumbercorp2` | Static site — the PWA (`lumbercorp-2/`) | Free tier, no build; serves `/` with SPA rewrite, `no-cache` on `sw.js`/`manifest`/`config.js` |
| `lumbercorp2-proxy` | Tiny Torn v2 proxy (`proxy/server.js`) | Zero-dep Node, health check `/api/ping`, 10 s cache, allow-listed paths, CORS open, keys never logged |

Then in the Render dashboard set `RW_PROXY_URL` (on the **static** service)
to the proxy's URL, e.g. `https://lumbercorp2-proxy.onrender.com`, and
redeploy the static site — the build stamps it into `config.js` and the
**Rank Wars** tab auto-connects. (You can also just paste the proxy URL in
the app's Rank Wars → Connect card; it's stored per-browser.)

Static-only deploy: delete the proxy service from `render.yaml` — Rank Wars
falls back to demo mode until any rankwars-compatible proxy is configured.

New over 1.0:

- **Live bar ETAs** — energy/nerve/happy/life tick client-side with “full in …” countdowns
- **NPC Loot tab (v2.44.0)** — all 13 lootable NPCs (Duke, Leslie, Jimmy, Fernando, Tiny,
  Scrooge, Easter Bunny, M'aol + the five Praetorians) with their real Torn profile pictures,
  every possible drop (58 entries, rendered with Torn's own item art) and a **live loot-level
  ladder driven by TornStats' public [`/loot` timer board](https://www.tornstats.com/loot): the tab reads
  the matching structured feed at `/api/v2/<key>/loot` (relayed through the proxy as `/api/npc-loot`
  when one is configured, cached 60 s) for each NPC's real hospital-exit and Loot Level II–V
  timestamps, re-polled every minute while the tab
  is open and kept in `localStorage` so the last good read survives a reload. No key, no feed or
  feed down? The card falls back to your own *⚔️ Defeated now* clock (100–120 min hospital, then
  +30 m / +1 h 30 m / +3 h 30 m / +7 h 30 m), which you can pin per NPC with *✎ My own clock*.
  Filter by year-round / seasonal / attackable-now, search any loot item, and get an alert when a
  tracked NPC climbs a level (Alerts → *NPC loot level up*). Note: pulling the feed sends your
  Torn API key to tornstats.com.
- **The Job Book tab (v2.45.0)** — **city jobs only**: all six Torn city-job ladders (Army,
  Grocer, Casino, Medical, Education, Law — 41 positions), each with its own distinct layout and
  full Man/Int/End requirements, daily stat gains, pay, points per day, promotion thresholds and
  job specials. No player-company listings
  or company specials. Add a Minimal-access Torn API key to see your city-job position, working
  stats and banked city-job points (`selections=profile,jobpoints,workstats`); the book marks your
  current rung, greens city positions your stats qualify for, shows the exact stat gap to your next
  city-job promotion, and counts down to the 18:00 TCT point drop. Filter to all city jobs or only
  ones with positions you qualify for; search any city-job position or special. Tables verified
  against the Torn Wiki.
- **Company tab (v2.46.0)** — two sub-tabs. **My Company** is the live director dashboard:
  daily/weekly profit and customers, popularity / efficiency / environment meters, the company bank
  and advertising budget, size / staff-room / storage upgrades, every stock line (cost, RRP, your
  price, margin per unit, in stock, on order, sold, revenue) with reorder and below-cost warnings,
  the full employee table (position, days, wage, effectiveness, working stats) and your company's
  own 1★–10★ specials ladder marked up to your current star rating. Reads `company` selections
  `profile` + `detailed` + `employees` + `stock` one at a time, so a key that can't see the
  director-only sections still shows everything it *can* — and the last good read survives a reload.
  **What company should I make?** covers all 39 companies a player can start: startup cost, default
  staff, how it earns, its five specials (1★/3★/5★/7★/10★, passive or job-point cost), honest pros
  & cons, "best for" tags, price-tier/search filters, affordability against your live cash, an
  A–Z/cheapest/most-profitable sort, a **demo preview** of any company's dashboard, and a
  goal-based recommender (pick gym, energy, travel, crime, PvP, education, profit, hacking, defense
  or passive stats) that ranks the best five. Data verified against the Torn Wiki
  [Company List](https://wiki.torn.com/wiki/Company/Company_List) and
  [Special List](https://wiki.torn.com/wiki/Company/Special_List).
- **Race to Level 15 tab (v2.47.0)** — the fastest route to the Travel Agency, in one place: why
  level 15 matters, a five-phase tick-list (setup → baseline stats → the attack grind → free XP/energy
  from jobs & companies → what to do the moment you hit 15) with 32 steps and saved progress, and a
  live pace calculator that turns real numbers into a countdown. It reads your level, energy bar and
  nerve from the Torn API (the regen rate comes from your own bar, so donator status and bonuses are
  respected), then works out energy/day (regen + Xanax + energy drinks + the daily refill),
  attacks/day at 25 energy each, wins/day at your win rate, and the days left — every input is yours
  to steer. Also in the tab: the honest community timeline (3–5 days hardcore, 1–2 weeks active,
  3–6 weeks casual), the level-by-level unlock table, the ten habits that cost days (mugging or
  hospitalising leveling targets, sitting at a full bar, carrying cash, drugs on a full bar…), and
  one-tap links to the attack page, gym, crimes, Baldr's leveling list and the app's own Targets tab.
  Mechanics verified against the Torn Wiki — Level and Ranks, Energy, Nerve and Attack.
- **Flight planner** — pick destination + class (Standard/Airstrip/WLT/Business), see arrival/return
  times, begin a flight and get a live countdown + landing notification (persisted across reloads)
- **Restock ticker** — abroad markets restock on a fixed 15-min cycle; the bar shows the next one
- **Abroad profit table** — YATA shop cost vs market value → profit/unit and “total if cleared”
- **⌘K command palette** (or `/`) — jump to pages, flights, items, links
- **Notifications** — energy full, flight landed, cooldown finished
- **Theming** — dark/light + 5 accent finishes; **watchlist** stars; **export/reset**
- Demo mode by default; add a Torn API key in Settings → Live. Abroad stock still uses
  YATA with last-good caching (stale-while-revalidate), and honors the same optional
  `AGGREGATOR_URL` backend described below.

## Why this exists (v1)

Foreign stock in Torn City is **crowd-sourced** — Torn's official API does not
expose it. The only clean public JSON feed is YATA (`yata.yt`), and YATA goes
down. A static site can't survive that: it can only cache what each browser has
already seen.


This service is the fix. It is a tiny always-on proxy/cache that:

| Tier | What it does | Value |
|------|--------------|-------|
| 1 — Cache | Polls YATA every 60s and persists the last-good feed to disk | Survives YATA outages *and* restarts; never returns blank |
| 2 — Stale-while-revalidate | Always returns 200 with data, flagged `stale` when upstream is down | The app keeps working, honestly labelled |
| 3 — Crowd-source | Accepts `POST /report` from your own users | Over time becomes an **independent** source of truth, no longer dependent on YATA |

## Endpoints

- `GET /health` → `{ ok, uptime, cached, stale }`
- `GET /api/abroad-stock` → `{ ok, source, updatedAt, stale, reports, stocks }`
  (`stocks` matches YATA's shape: `{ mex: { stocks: [{name, quantity, cost}], update } }`)
- `POST /report` → body `{ country: "japan", stock: { "Cherry Blossom": { quantity, cost } } }`

All responses carry `Access-Control-Allow-Origin: *`, so the static client can
call them cross-origin.

## Run locally

```bash
cd server
node server.js          # PORT=10000 by default
```

Env vars: `PORT`, `POLL_MS`, `REPORT_TTL`.

## Deploy on Render (Web Service)

1. In Render: **New → Web Service**, point at this repo (or just the `server/` dir).
2. Runtime **Node**, build command `npm install` (or empty — no deps), start command `node server.js`.
3. Set env `PORT` (Render sets it automatically).
4. Attach a **persistent disk** mounted at `/opt/render/project/src` (or wherever
   `cache.json` lives) so the cache survives deploys. Without a disk, Render's
   ephemeral filesystem is wiped on each deploy — the service still works, but
   cold-starts from empty cache.

> Note: the app itself stays a **Static Site** (unchanged). This is a *second*
> Render service. See `render.yaml` for a two-service Blueprint.

## Wire-up in the app

In `index.html`, set `AGGREGATOR_URL` to your service URL, e.g.
`https://lumbercorp-aggregator.onrender.com`. The client then fetches:

1. YATA directly (fastest, freshest)
2. On failure → your aggregator (which serves cached/stale data)
3. On failure → browser-local last-good cache (already implemented)

## Roadmap / future

- Add Prombot (`prombot.co.uk`) as a second upstream if/when it exposes JSON.
- Normalize country codes between YATA and the app's `YATA_CODES` map.
- Auth on `/report` (a shared token) so only your users can contribute.
