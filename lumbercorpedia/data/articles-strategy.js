/* Lumbercorpedia — travel, guides and reference. */
(function (root) {
  'use strict';
  const A = (root.TW_ARTICLES = root.TW_ARTICLES || []);
  const push = (o) => A.push(o);

  push({
    id: 'travel',
    title: 'Travel',
    cat: 'travel',
    icon: '✈️',
    wiki: 'Travel',
    tags: ['travel', 'flights', 'level 15', 'abroad'],
    summary: 'Every destination, every class, and the flight maths that decides whether a run is worth it.',
    live: 'travel',
    calc: 'travel',
    facts: [
      ['Unlocked at', 'Level 15'],
      ['Destinations', '11'],
      ['Classes', 'Standard, airstrip, WLT, business'],
      ['Fastest', 'Business class'],
      ['While abroad', 'No hospital, muggable'],
    ],
    body: `
The travel agency opens at **level 15** and it is the single biggest unlock in the game: abroad shops sell flowers,
plushies, drugs and equipment at prices the city cannot match.

## Destinations

{{table:travel}}

Flight times are one-way. **Airstrip** requires the airstrip upgrade, **WLT** is a Winner's Lucky Ticket (a lottery
prize that gets you home free), and **business class** costs extra but roughly halves the flight.

## The rules of being abroad

- **There is no hospital abroad.** If you are hospitalised on foreign soil you fly home automatically and lose the trip.
- **You can be mugged abroad** — and there is nothing to stop it. Travel light.
- You cannot attack or be attacked while in the air.
- Abroad shops restock on a **~15 minute cycle**, and stock is shared between every player who flies there. A run that
  looked profitable on paper can be cleaned out by the time you land.

## What to buy

{{table:abroadItems}}

The classic runs:

- **Mexico** — dahlias, and the shortest flight in the game.
- **Switzerland** — rehab, and the banking angle.
- **South Africa** — Xanax, well under city prices.
- **Japan / China** — equipment and collectibles.
- **Cayman Islands / UAE** — money runs and high-value items.

{{calc:travel}}

> Tip: Work out profit **per hour of flying**, not per trip. A $2m profit on a 9-hour return flight is worse than
> $400k on a 40-minute hop, because the short run can be repeated all day.

## Flying and your other plans

While you are in the air you cannot train, attack or crime. Long flights are dead time, which is why serious players
either fly business class or plan flights around sleep and work.
`,
    related: ['abroad', 'npc-looting', 'levels', 'money-making'],
  });

  push({
    id: 'abroad',
    title: 'Abroad shops & arbitrage',
    cat: 'travel',
    icon: '🌍',
    wiki: 'Travel',
    tags: ['arbitrage', 'shops', 'restock', 'profit'],
    summary: 'How abroad shops stock, what the flower and plushie sets are worth, and how to run a repeatable route.',
    calc: 'travel',
    facts: [
      ['Restock cycle', '~15 minutes (community figure)'],
      ['Stock', 'Shared across all players'],
      ['Best sellers', 'Flowers, plushies, drugs'],
      ['Risk', 'Mugging, no hospital'],
    ],
    body: `
Abroad shops sell a fixed list of items per country at fixed prices. The money comes from the gap between those prices
and what players at home will pay.

## The arbitrage loop

1. Check the shop price in the country (see the tables on the [[travel]] page).
2. Check the market value at home — the item market gives you the real number.
3. Subtract two tickets and the flight time.
4. If the margin survives all three, fly it. Repeat.

{{calc:travel}}

## Sets and collectors

Flowers and plushies are not just trade goods — they are **set collections**, and set collectors pay a premium for the
one piece they are missing. A plushie that sells for $400 in a shop can be worth a great deal more to someone on the
last item of a set.

That is why the abroad market never fully arbitrages away: the demand is not rational, it is completist.

## Restock behaviour

Abroad shops restock on a cycle the community has measured at roughly **15 minutes**, and stock is shared: if another
player clears the shop, you get nothing. Popular routes are therefore timing games — arrive just after a restock.

> Warn: Stock levels also depend on how many players are flying the route. A run that is reliable at 03:00 TCT can be
> impossible at 20:00.

## Risk management

- Never carry more cash than the goods cost.
- Do not fly with a full inventory of valuables unless you want to lose them.
- Keep a medical item or two in case a crime or event goes wrong at home.

## Scaling up

Once you have capital, the constraint stops being money and starts being **flight time**. That is the point where
business class, the airstrip, and WLT tickets start paying for themselves.
`,
    related: ['travel', 'money-making', 'item-market'],
  });

  push({
    id: 'npc-looting',
    title: 'NPC looting',
    cat: 'strategy',
    icon: '💀',
    wiki: 'NPC_Loot',
    tags: ['NPC', 'loot', 'Duke', 'Praetorians'],
    summary: 'All 13 lootable NPCs, the loot-level ladder, and how to time a run so you actually get the drop.',
    calc: 'npc',
    facts: [
      ['Lootable NPCs', '13'],
      ['Verified drops', '58'],
      ['Hospital time', '100–120 min'],
      ['Ladder', '0 / 30 / 90 / 210 / 450 min'],
      ['Shares', 'One more attacker per level'],
    ],
    body: `
Twelve NPCs in Torn City can be attacked for loot, plus the seasonal Easter Bunny. Beat one and it goes to hospital for
**100–120 minutes**; when it comes out it starts climbing a **loot ladder**, and each rung lets one more attacker share
the drop.

## The ladder

| Level | Time after hospital exit | Attackers who get loot |
| --- | --- | --- |
| I | Immediately | 1 |
| II | +30 minutes | 2 |
| III | +90 minutes | 3 |
| IV | +3 h 30 m | 4 |
| V | +7 h 30 m | 5 |

That is the whole game: the longer an NPC has been out of hospital, the more people can loot it — and the more likely
someone else has already hit it.

## The NPCs

{{table:npcs}}

## Every drop

{{table:npcLoot}}

## Timing a run

{{calc:npc}}

The reliable method is a **tracked clock**: the moment you see an NPC defeated, start a timer at hospital exit plus the
ladder offsets. TornStats publishes these clocks server-side, and this repo's LumberCorp 2.0 NPC Loot tab reads them
live — otherwise you are guessing from your own "⚔️ defeated now" timestamp.

## Who can loot what

The scale of the NPC matters. Duke has 5.5m HP and drops the **Rheinmetall MG 3**; the Praetorians and seasonal NPCs
sit at the other end of the scale. If you cannot beat the NPC's HP before its own damage output ends you, the loot
table is irrelevant.

> Tip: Loot level does not make the NPC weaker — it only widens who gets a share. Do not wait for level V to attack if
> you can beat it now; you are just inviting competition.

## Seasonal NPCs

The **Easter Bunny** only exists during the Easter event; the rest are year-round. Event NPCs are the reason players
stockpile energy before an event window opens.
`,
    related: ['travel', 'seasonal-events', 'money-making', 'attack'],
  });

  push({
    id: 'seasonal-events',
    title: 'Seasonal events',
    cat: 'strategy',
    icon: '🎃',
    wiki: 'Current_Events',
    tags: ['events', 'easter', 'halloween', 'christmas'],
    summary: 'Easter, Halloween, Christmas and the anniversary — what each one drops and how to prepare.',
    live: 'bars',
    facts: [
      ['Easter', 'Egg hunt, eggs, Easter Bunny NPC'],
      ['Halloween', 'Trick or treat baskets'],
      ['Christmas', 'Presents, snow'],
      ['Anniversary', 'Click the TORN logo'],
    ],
    body: `
Torn runs several seasonal events a year, and they are the most profitable windows in the game if you are prepared.

## Easter — the egg hunt

Eggs spawn around the city and can be eaten for large one-off boosts:

| Egg | Effect |
| --- | --- |
| Green | +500 energy |
| Red | +250 nerve |
| Yellow | +10,000 happy |
| Pink | Experience (removed in 2023) |

All of them add six hours of booster cooldown. The **Easter Bunny** also becomes a lootable NPC for the duration.

## Halloween — trick or treat

Collect treats and exchange them at baskets that you upgrade in tiers. The tier III upgrades are the point:

- **Dark Power** — +5 energy per treat exchanged.
- **Cold Sweat** — +1 nerve per treat exchanged.
- **Save Your Tears** — +500 happy per treat exchanged.

Upgrade the basket *before* you start exchanging, or you throw the bonus away.

## Christmas

Presents, seasonal items and the usual limited-stock rush. Seasonal items often hold value for months afterwards, which
makes them one of the few genuinely good speculative plays in Torn.

## Anniversary

Clicking the letters of the TORN logo during the anniversary event gives free bars — **T** gives 50 energy, **R** gives
500 happy — with a 15-minute cooldown between uses and a cap of ten uses each. Free bars are free bars.

## 420 day

Cannabis effects are **tripled**. If you are going to use nerve drugs, that is the day.

> Tip: Bank energy and happy *before* an event starts. Every event reward is bigger when you have a bar to pour it into,
> and the players who clean up are the ones who prepared a week ahead.
`,
    related: ['npc-looting', 'energy', 'happy', 'drugs'],
  });

  push({
    id: 'race-to-15',
    title: 'Race to level 15',
    cat: 'strategy',
    icon: '🏁',
    wiki: 'Level_and_Ranks',
    tags: ['level 15', 'travel agency', 'new player'],
    summary: 'The fastest honest route from level 1 to the travel agency, with the maths on how long it takes.',
    live: 'gym',
    calc: 'energy',
    facts: [
      ['Unlock', 'Travel agency'],
      ['Hardcore', '3–5 days'],
      ['Active', '1–2 weeks'],
      ['Casual', '3–6 weeks'],
      ['Main XP source', 'Attacking and leaving'],
    ],
    body: `
Level 15 unlocks the **travel agency**, which unlocks abroad shops, cheap drugs, flowers, plushies and the arbitrage
economy. Getting there fast is the single highest-leverage thing a new account can do.

## Why 15 and not "as high as possible"

Because 15 is where Torn changes from a single-city economy into a global one. Everything before it is rehearsal.

## Where the XP comes from

Experience is invisible, but the relative values are known: **attacking and leaving** is the baseline, mugging gives
about 55–60% of that, hospitalising about 40%. Crimes, gym training and holding a job all contribute.

That leads to the core loop:

1. Build an **attack list** of players you can reliably beat.
2. Hit them, and **leave** every time.
3. Spend the energy you are not attacking with in the gym.
4. Take a city job and never miss a day's work.
5. Crime daily, even with a small nerve bar.

## The habits that cost you days

- **Mugging or hospitalising** your levelling targets — less XP, and they stop being repeatable targets.
- **Sitting at a full energy bar.** Every minute at 150/150 is wasted XP.
- **Carrying cash** — you will get mugged and lose tempo.
- **Using Xanax on a full bar** — you cannot go above what you can spend.
- **Training the wrong stat spread** — balanced stats beat lopsided ones until you have a reason to specialise.

## Honest timelines

- **Hardcore** (refills, Xanax, several sessions a day): **3–5 days**.
- **Active** (a few sessions a day, natural regen only): **1–2 weeks**.
- **Casual** (one session a day): **3–6 weeks**.

## What to do the moment you hit 15

1. Buy property and staff — happy is gym gains.
2. Start a daily crime habit if you have not already.
3. Fly a route, work out the margin, repeat.
4. Join a company with useful specials.

{{calc:energy}}
`,
    related: ['getting-started', 'levels', 'attack', 'travel'],
  });

  push({
    id: 'money-making',
    title: 'Making money',
    cat: 'strategy',
    icon: '💵',
    wiki: 'Money_Making_Guide',
    tags: ['income', 'profit', 'economy', 'guide'],
    summary: 'Every real income route in Torn, ranked by how much capital and effort each one needs.',
    live: 'money',
    facts: [
      ['Best early', 'City job + crimes'],
      ['Best mid', 'Travel arbitrage, bazaar flipping'],
      ['Best late', 'Company ownership, organised crime'],
      ['Always wrong', 'The casino'],
    ],
    body: `
Torn's economy is player-run, so "making money" means doing something another player will pay for — or taking
advantage of a price difference somebody else has not noticed.

## By stage of the game

| Route | Capital | Effort | Scale |
| --- | --- | --- | --- |
| City job wages | None | Low | Low but guaranteed |
| Crimes | Nerve | Medium | Medium |
| Item flipping (market/bazaar) | Low | Medium | Medium–high |
| Travel arbitrage | Low–medium | Medium | Medium–high |
| Own a company | High | High | Very high |
| Organised crime | Crime experience | High | High |
| Attacking / mugging | Battle stats | High | Streaky |
| Stock benefits | Very high | None | Passive |
| Casino | Any | None | Negative |

## The three rules

1. **Never let a bar sit full.** Idle energy and nerve are the biggest hidden cost in Torn.
2. **Never pay retail for something you will use in bulk.** Energy drinks, medical items and drugs are all cheaper in
   bulk or abroad.
3. **Know your fees.** The item market takes 5% (plus 10% if you list anonymously), and the auction house takes its cut
   in the final price.

## Flipping

The core skill: buy below market value, sell at market value. That means watching the item market for mispriced bulk
listings, buying abroad, and knowing what collectors will pay for set pieces.

## Scaling

Every route above scales with one of three things — **energy, nerve, or capital**. Work out which one you are short of
and spend your playtime fixing that, rather than doing more of a route that cannot grow.

> Tip: The players with the highest net worth almost always own a company. Not because companies are easy, but because
> they are the only asset that earns while you sleep.
`,
    related: ['money', 'travel', 'companies', 'crimes'],
  });

  push({
    id: 'stat-building',
    title: 'Building battle stats',
    cat: 'strategy',
    icon: '📐',
    wiki: 'Battle_Stats',
    tags: ['training', 'gym guide', 'enhancers', 'happy jump'],
    summary: 'How to choose a stat spread, when to specialise, and the order to spend money on gym upgrades.',
    live: 'gym',
    calc: 'gym',
    facts: [
      ['Early', 'Balanced'],
      ['Mid', 'Pick a pair'],
      ['Late', 'Specialist gyms'],
      ['Biggest lever', 'Happy, then gym'],
    ],
    body: `
Battle stats grow exponentially, which means the order you do things in matters more than how hard you grind.

## Phase 1 — stay balanced

While you are climbing the standard gyms, train all four stats. Balanced stats keep you competitive against everyone,
which matters because you do not get to choose your opponents.

## Phase 2 — pick a pair

Once you are in the middleweight gyms, decide on a direction:

- **Strength + speed** — the aggressive build. You hit hard and you land hits.
- **Defense + dexterity** — the defensive build. You take less and you dodge more.

This is not cosmetic: the **specialist gyms** require a 25% imbalance, so you cannot reach the best gyms in the game
without committing.

## Phase 3 — specialist gyms

Balboas (def + dex), Frontline Fitness (str + spd), then the four 8.0-dot gyms (Gym 3000, Mr. Isoyamas, Total Rebound,
Elites) that each train a single stat at 50 energy a train. Pick the one that matches your chosen stat.

Beyond those: **The Sports Science Lab** (9.0 across the board, 25 energy, capped at 150 lifetime Xanax and Ecstasy)
and **Fight Club** (10.0, by invitation).

## Where to spend money, in order

1. **Property and staff** — raises your happy ceiling, which raises everything.
2. **Gym unlocks** — the dots are linear and permanent.
3. **Education (Sports Science)** — +1% per course, forever.
4. **Books** — +30% for 31 days when you are pushing one stat.
5. **Stat enhancers and boosters** — the fast, expensive route to big numbers.

## Happy jumps

Training at your happy maximum instead of your daily happy is worth a large multiple. Plan them with the calculator on
the [[Happy|happy]] page, and never waste a jump by overdosing.

{{calc:gym}}
`,
    related: ['gym', 'battle-stats', 'happy', 'properties'],
  });

  push({
    id: 'attack-guide',
    title: 'The attacking guide',
    cat: 'strategy',
    icon: '🎯',
    wiki: 'Attack',
    tags: ['attack list', 'targets', 'levelling', 'XP'],
    summary: 'Building an attack list, reading a target, and the leaving-vs-mugging decision that decides your XP rate.',
    calc: 'weights',
    live: 'bars',
    facts: [
      ['Cost', '25 energy'],
      ['Best XP', 'Leave'],
      ['Best cash', 'Mug (less XP)'],
      ['List size', '30–100 targets'],
    ],
    body: `
Attacking is the XP engine of Torn, and it is a logistics problem more than a fighting one.

## Building an attack list

A good list has 30–100 targets you can beat, spanning several levels and time zones. Build it by:

1. Using a third-party target finder (Baldr's leveling list, TornTools, YATA, or this repo's LumberCorp 2.0 Targets
   tab) to find players around your level with low battle stats.
2. Recording who you beat, how long it took, and what they were worth.
3. **Revisiting the list daily** — people train, and a target who was free XP last week may beat you today.

## Reading a target

- **Level** tells you their life total, roughly.
- **Estimated battle stats** narrow the risk. Scout properly with the Army's 10★ spy special if you have it.
- **Hospital time and last action** tell you whether they are active. Active players fight back.
- **Cash on hand** matters only if you plan to mug.

## Leave, mug, or hospitalise?

| Choice | XP | Cash | Cost |
| --- | --- | --- | --- |
| Leave | 100% | None | None |
| Mug | ~55–60% | Their cash on hand | Makes an enemy |
| Hospitalise | ~40% | None | Makes a real enemy |

If you are levelling, **always leave**. You get the most XP, you can hit the same person tomorrow, and you do not end
up on someone's enemies list.

## The daily rhythm

1. Spend energy on attacks while your bar is high.
2. Use Xanax or drinks to extend the session if the maths works.
3. Train the rest in the gym.
4. Never attack on an empty medical stock if you are in a war.

> Warn: Attacking players far above your level is how you end up in hospital for an hour with nothing to show for it.
> Beat people you can beat.

{{calc:weights}}
`,
    related: ['attack', 'battle-stats', 'levels', 'revive'],
  });

  push({
    id: 'formulas',
    title: 'Formulas & rates',
    cat: 'reference',
    icon: '🧮',
    wiki: 'Formulas',
    tags: ['formulas', 'rates', 'maths', 'reference'],
    summary: 'Every rate and formula worth knowing, in one table — with the honest caveats about which are estimates.',
    calc: 'gym',
    facts: [
      ['Energy regen', 'Full bar in 5 hours'],
      ['Nerve regen', '1 per 5 min'],
      ['Happy regen', '5 per 15 min'],
      ['Life regen', '5% of total per 5 min'],
    ],
    body: `
The numbers behind Torn, in one place.

## Bar rates

| Bar | Regen | Per day | Cap |
| --- | --- | --- | --- |
| Energy | Full bar every 5 h | 720 at 150 max, 480 at 100 max | 150 (donator) / 100 |
| Nerve | 1 per 5 min | 288 | Natural nerve bar + bonuses |
| Happy | 5 per 15 min | 480 | Base max (property + staff) |
| Life | 5% of total per 5 min | Full in ~1 h 40 m | 5,000 + bonuses |

## Other rates

- **Job points** drop at 18:00 TCT daily.
- **Abroad shops** restock roughly every 15 minutes (community measurement, not an official figure).
- **Booster cooldown**: +2 h per energy drink or alcohol, +6 h per Feathery Hotel Coupon or Easter egg.
- **Medical cooldown**: caps at 6 hours (9 with faction upgrades).
- **Stock benefits** can be collected every 7 days.
- **Energy-special job point cap**: 100 JP per day, resets 00:00 TCT.

## The gym formula

> Math: gain = Modifiers × Gym dots × Energy per train × [ (a·ln(Happy + b) + c) × Stat + d·(Happy + b) + e ]

a = 3.480061091e-7, b = 250, c = 3.091619094e-6, d = 6.82775184551527e-5, e = −0.0301431777.

> Warn: This is a community fit, not an official formula, and it grows linearly with your stat. Torn's own published
> monthly growth figures after the August 2022 stat-cap removal do not. Lumbercorpedia's gym calculator shows both — trust
> whichever bracket you are actually in.

## Happy loss

> Math: happy lost per train = 40–60% of the energy used

Halved by the 3★ Fitness Center passive *Goal Oriented*.

## Item market

> Math: net = gross × (1 − 0.05) × (1 − 0.10 if anonymous)

The 10% anonymous fee is waived by the 5★ Car Dealership and 5★ Property Broker specials.

## NPC loot ladder

> Math: loot level N opens at hospital exit + [0, 30, 90, 210, 450] minutes

Hospital time for an NPC is 100–120 minutes.
`,
    related: ['gym', 'energy', 'happy', 'npc-looting'],
  });

  push({
    id: 'glossary',
    title: 'Glossary',
    cat: 'reference',
    icon: '📖',
    wiki: 'Torn_Wiki',
    tags: ['terms', 'slang', 'reference'],
    summary: 'The slang, abbreviations and acronyms you will see in Torn chat within your first hour.',
    facts: [
      ['E / N / H', 'Energy, nerve, happy'],
      ['NNB', 'Natural nerve bar'],
      ['CE', 'Crime experience'],
      ['OC', 'Organised crime'],
    ],
    body: `
Torn has twenty years of accumulated slang. A short field guide.

## Bars and stats

- **E / N / H / L** — energy, nerve, happy, life.
- **NNB** — natural nerve bar, the part of your nerve cap earned through crime experience.
- **CE** — crime experience.
- **BS** — battle stats (the four: str, spd, def, dex).
- **WS** — working stats (manual labor, intelligence, endurance).
- **Total** — the sum of your four battle stats, the usual bragging number.

## Play

- **Chain** — consecutive faction attacks, bonus every 10.
- **OC** — organised crime, faction crimes that cost no nerve.
- **Bust** — freeing someone from jail.
- **Revive** — pulling someone out of hospital.
- **Jump** — a happy jump: fill happy, then dump a banked energy bar.
- **Level holding** — sitting at a low level while your true level climbs.
- **Flying / abroad** — travelling; **WLT** is a Winner's Lucky Ticket, a free flight home.
- **Spy** — the Army General special that reveals a target's battle stats.

## Economy

- **MV** — market value.
- **Bazaar / BM** — your shop / the bazaar directory.
- **Flipping** — buy low, sell at market value.
- **JP** — job points.
- **PI** — Private Island, the top property and the happy ceiling.
- **Xan** — Xanax.

## Community

- **TCT** — Torn City Time, the game's clock (GMT-5). Everything daily happens on TCT, not your local time.
- **Baldr's list** — a community target-finding list for attackers.
- **YATA / TornStats / TornTools** — the big third-party tool sites.
- **FF Scouter** — a battle-stat scouting service used in faction wars.

> Tip: If you see an acronym you do not know, ask in faction chat. The answer is usually two words and saves an hour.
`,
    related: ['torn-tools', 'factions', 'attack'],
  });

  push({
    id: 'torn-tools',
    title: 'Tools & sites',
    cat: 'reference',
    icon: '🧰',
    wiki: 'External_Links',
    tags: ['tools', 'API', 'YATA', 'TornStats', 'third party'],
    summary: 'The third-party ecosystem around Torn — what each tool does, and what it needs from you.',
    facts: [
      ['Torn API', 'api.torn.com'],
      ['Access levels', 'Public, minimal, full'],
      ['Key safety', 'Never share a full-access key'],
    ],
    body: `
Torn has one of the richest third-party ecosystems of any browser game, because it has a public API.

## The official API

**[api.torn.com](https://api.torn.com)** exposes user, faction, company, item, market and Torn-wide data. You create a
key in-game under Account → Settings → API, with an access level:

- **Public** — very little.
- **Minimal** — your own bars, profile, travel, money, work stats, job points. Everything a personal dashboard needs.
- **Full** — faction and company internals, and more.

> Warn: Never paste a full-access key into a site you do not trust. Lumbercorpedia only ever asks for Minimal, only ever
> reads, and stores the key in your own browser.

## What the big sites do

- **YATA (yata.yt)** — travel and abroad stock, item values, crime tools, and the most complete travel dataset.
- **TornStats** — NPC loot clocks, war and chain analytics, stat tracking over time.
- **TornTools** — a browser extension that improves the Torn interface itself.
- **Baldr's leveling list** — community-driven target lists for attackers.
- **FF Scouter** — battle-stat scouting used in faction wars.
- **Prombot, DocTorn and others** — various utility bots and dashboards.

## This repo

**LumberCorp 2.0** (in the same repository as Lumbercorpedia) is the live companion: bars with ETAs, the NPC loot tab with
real TornStats clocks, the job book, the company dashboard, rank wars and the bazaar scanner. Lumbercorpedia is the
reference layer; LumberCorp is the live one.

## Using an API key safely

1. Create a **Minimal** key for personal dashboards.
2. Create separate keys for separate tools, so you can revoke one without breaking everything.
3. Revoke keys you no longer use.
4. If a tool asks for Full access, ask it why.
`,
    related: ['glossary', 'factions', 'npc-looting'],
  });
})(window);
