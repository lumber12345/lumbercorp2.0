/* Tornpedia — core mechanics articles. */
(function (root) {
  'use strict';
  const A = (root.TW_ARTICLES = root.TW_ARTICLES || []);
  const push = (o) => A.push(o);

  push({
    id: 'getting-started',
    title: 'Getting started in Torn',
    cat: 'core',
    icon: '🌱',
    wiki: 'Torn_Wiki',
    tags: ['new player', 'basics', 'level 1'],
    summary: 'Your first week in Torn City: what to do, what to ignore, and the four habits that decide how fast you grow.',
    live: 'bars',
    facts: [
      ['Level 15', 'Unlocks travel'],
      ['First gym', 'Premier Fitness, $10'],
      ['First job', 'Any city job, free'],
      ['Energy regen', '5 per 10 min (donator)'],
    ],
    body: `
Torn is a game about **compounding**. Energy becomes stats, stats become wins, wins become money, and money
becomes more energy. Players who fall behind almost always fall behind on the same thing: they let a bar sit full.

## The first day

- **Train.** Your first stop is the gym (Premier Fitness costs $10 to join). Strength, speed, defense and dexterity
  are the only stats that decide fights, and they only grow when you spend energy on them.
- **Take a city job.** All six city jobs are free to join and pay daily. Army, Grocer, Casino, Medical, Education and
  Law each train different working stats and unlock different job specials — see [[City jobs|jobs]].
- **Do crimes.** Crimes cost nerve and build crime experience, which grows your natural nerve bar. Start immediately;
  nerve is a slow, patient stat.
- **Empty every bar before you log off.** A full energy bar is energy you never got.

> Tip: Your most valuable asset early is not money, it is the habit of logging in three or four times a day to
> spend bars. Ten minutes per visit beats one long session.

## The first week

1. Join a company as soon as you hit level 3 — real pay, and job points for specials.
2. Buy the cheapest property you can afford and hire one member of staff. Happy is gym gains.
3. Read the [[Energy|energy]] and [[Happy|happy]] pages. They are the two levers on everything else.
4. Do not mug people for cash. Mugging gives less experience than attacking and leaving, and it makes enemies.
5. Start [[Crimes|crimes]] every single day even if you only spend a little nerve.

## What to ignore at the start

- **The casino.** It is a tax on people who cannot do arithmetic.
- **Expensive weapons.** A weapon you can afford at level 5 will be scrap by level 20.
- **Property upgrades.** Buy the property once, then spend on happy and gyms instead.
- **PvP against players far above you.** Losing puts you in hospital, and hospital time is the most expensive
  currency in Torn.

## The road to level 15

Level 15 unlocks the [[Travel|travel]] agency, which unlocks flowers, plushies, drugs, cheap Xanax and the
abroad market. That is the point where Torn opens up. See [[Race to level 15|race-to-15]] for the full plan.

> Warn: Never carry a big wallet. Cash on hand can be mugged, and there is no hospital abroad. Bank it, or spend it.
`,
    related: ['energy', 'happy', 'gym', 'jobs', 'race-to-15'],
  });

  push({
    id: 'energy',
    title: 'Energy',
    cat: 'core',
    icon: '⚡',
    wiki: 'Energy',
    tags: ['bars', 'regen', 'xanax'],
    summary: 'The bar that becomes stats, crimes and attacks. Regen rates, every source of energy, and what it costs in cash.',
    live: 'bars',
    calc: 'energy',
    facts: [
      ['Max (donator)', '150'],
      ['Max (non-donator)', '100'],
      ['Regen', 'Fills to max every 5 hours'],
      ['Free per day', '720 / 480'],
      ['Xanax', '+250 (drug cooldown)'],
      ['Points refill', 'Once per day'],
    ],
    body: `
Energy is the green bar in your sidebar and the currency behind gym training, attacking, busting, reviving and most
of the rest of the game. Your bar refills to maximum **every five hours**, which works out to 720 energy a day at a
150 cap (donator) or 480 a day at a 100 cap.

## Getting more energy

{{table:energyItems}}

- **Xanax** gives 250 energy and is the standard way to train hard — but it is a drug, so it carries a drug cooldown,
  builds addiction, and an overdose empties your happy bar completely.
- **Energy drinks** give 5–30 energy each and add two hours to your booster cooldown. Faction perks multiply the gain
  by 1.5×. Because every drink shares one booster cooldown, there is a hard ceiling on how many you can chain.
- **Feathery Hotel Coupons** refill the bar (150, or 250 with the Ugly Energy perk) *and* give 500 happy, at the price
  of six hours of booster cooldown.
- **A points refill** can be used once per day to fill the bar to maximum.
- **Company specials** trade job points for energy — capped at 100 job points a day across energy specials.

> Tip: The single most common mistake in Torn is logging in to a full energy bar. Everything you own — your property,
> your gym, your Xanax stack — exists to convert energy into stats. Full bars are waste.

## What energy buys

| Activity | Cost | Returns |
| --- | --- | --- |
| Gym train | 5–50 per train, by gym | Battle stats |
| Attack | 25 per attack | Experience, loot, merit progress |
| Bust someone out of jail | 5 | Crime experience, nerve bar growth |
| Bust yourself out | Half your nerve… and half your bar | Freedom |
| Revive | 75 (less with faction upgrades) | Pulls a player out of hospital |

## Planning a day's energy

{{calc:energy}}

> Note: Energy above your bar's cap behaves differently from nerve: natural regen stops at the cap, but items can push
> you over it. That is what makes a [[happy jump|happyjump]] work — you bank a full bar, then stack Xanax on top.
`,
    related: ['happy', 'nerve', 'gym', 'life'],
  });

  push({
    id: 'happy',
    title: 'Happy',
    cat: 'core',
    icon: '🙂',
    wiki: 'Happy',
    tags: ['bars', 'happy jump', 'property'],
    summary: 'The bar that multiplies your gym gains. Base maximum, regen, the 15-minute reset, and how to plan a happy jump.',
    live: 'bars',
    calc: 'happyjump',
    facts: [
      ['Starting base', '100'],
      ['Regen', '5 every 15 minutes'],
      ['Natural per day', '480'],
      ['Resets', 'xx:15, xx:30, xx:45, xx:00'],
      ['Temporary cap', '99,999'],
      ['Max base (Private Island)', '5,025'],
    ],
    body: `
Happy is the yellow bar, and it is the most underrated number in Torn. It sits **inside a logarithm** in the gym
gains formula, which means the difference between 500 happy and 5,000 happy is enormous, while the difference between
5,000 and 10,000 is modest.

## Regen and the reset

Your happy climbs 5 points every 15 minutes — 480 a day — up to your base maximum. Here is the catch that catches
everyone: **happy resets to your base maximum every fifteen minutes**, on the quarter hour (xx:15, xx:30, xx:45,
xx:00). Anything above the cap is temporary and evaporates at the next quarter hour.

That single rule is why you check the clock before chugging candies.

## Raising your base maximum

Base happy starts at 100 and is set by your property and its staff. Buying a better property and hiring staff is the
most direct gym upgrade in the game.

{{table:properties}}

## Losing happy

- Every gym train costs happy equal to **40–60% of the energy used**. A 10-energy train burns roughly 5 happy.
- Overdosing on Ecstasy, Ketamine, PCP, Shrooms, Speed, Xanax or Vicodin empties the bar entirely.
- Being attacked, losing a fight and some crime failures cost happy too.

## The happy jump

Because gains scale with happy and training *spends* happy, the optimal pattern is not to train a little every day.
It is to stop training, let happy fill to its maximum, bank energy meanwhile, and then spend the whole bar in one
session at peak happy. That is a happy jump, and it is worth a large multiple of casual training.

{{calc:happyjump}}

> Tip: The 3★ Fitness Center passive *Goal Oriented* halves the happy you lose per train. If you work at one, that is
> effectively double the length of every jump.

## Sources of happy

| Source | Happy | Notes |
| --- | --- | --- |
| Natural regen | 5 / 15 min | Up to your base maximum |
| Candy | 25 – 250 | Fast, cheap, temporary overflow |
| Ecstasy | Doubles happy | 200–231 min drug cooldown |
| Erotic DVD | 2,500 (5,000 at 10★ Adult Novelties) | The classic jump fuel |
| Feathery Hotel Coupon | 500 | Plus a full energy refill |
| Yellow Easter Egg | 10,000 | Event only, untradeable |
| Strippogram Voucher | 2,500 | Send it to a friend |
| Game console / TV / CD player | Converts 1–10 energy | Doubled by some company specials |
`,
    related: ['energy', 'gym', 'life', 'properties'],
  });

  push({
    id: 'life',
    title: 'Life',
    cat: 'core',
    icon: '❤️',
    wiki: 'Life',
    tags: ['bars', 'health', 'hospital'],
    summary: 'Your health pool: how much you have at each level, how fast it returns, and what happens at zero.',
    live: 'bars',
    facts: [
      ['At level 1', '100'],
      ['At level 100', '5,000'],
      ['Regen', '5% of total every 5 min'],
      ['Max with merits', '7,500'],
      ['Absolute maximum', '13,266'],
    ],
    body: `
Life is the red bar. You start with 100 and gain more with every level, reaching 5,000 at level 100. It regenerates
by **5% of your total every five minutes**, so a full heal takes about an hour and forty minutes regardless of how
big the pool is.

## How much life you can have

- No upgrades: **5,000**
- 10/10 merits: **7,500**
- Merits + faction specials: **9,000**
- Plus Mining Corporation: **9,900**
- Plus Marauder Armor: **13,266**

## Hitting zero

When your life reaches zero in a fight you have lost. If you were the attacker you go to [[hospital]]; if you were
defending you stay at zero and unconscious until the attacker chooses Leave, Mug or Hospitalise. While you are
unconscious you cannot travel, attack, or be attacked.

Some events drop you to 1 life rather than zero: a drug overdose, losing at Russian Roulette, failing certain crimes,
using the wrong blood type, and blowing yourself up with a SED.

> Warn: On zero life you are not in hospital, so nobody can revive you — but you are also not regenerating. If an
> attacker walks away, you sit there until your next regen tick.

## Restoring life

Medical items are the fast route out of hospital and back to full health, but they share a medical cooldown.
See [[Hospital|hospital]] for the full table and the cooldown maths.
`,
    related: ['hospital', 'energy', 'attack'],
  });

  push({
    id: 'nerve',
    title: 'Nerve',
    cat: 'core',
    icon: '🧠',
    wiki: 'Nerve',
    tags: ['bars', 'crimes', 'crime experience'],
    summary: 'The crime bar: how the natural nerve bar grows with crime experience, and every way to add nerve.',
    live: 'bars',
    calc: 'npc',
    facts: [
      ['Regen', '1 every 5 minutes'],
      ['Free per day', '288'],
      ['Grows from', 'Crime experience'],
      ['Merit bonus', '+10'],
      ['Faction bonus', '+40'],
      ['Internal cap', '32,767'],
    ],
    body: `
Nerve is the purple bar, and it is almost entirely the crime bar. It recovers **1 point every 5 minutes** — 288 a
day — and unlike happy it does not reset to a cap: if you push nerve above your maximum with drugs or alcohol, it
simply stops regenerating until you spend it back down.

## The natural nerve bar

Your "natural nerve bar" (NNB) is the part that reflects your **crime experience**. Every crime you attempt adds
crime experience, and at certain milestones the bar grows in steps of 5. No amount of merits, faction perks or
company specials changes your natural nerve bar — those all sit on top of it.

The practical consequences:

- Crime experience is the *only* thing that grows the natural bar, so crimes are a daily habit, not a burst activity.
- Busting other players out of jail also raises crime experience (and therefore your NNB).
- Failing a crime still teaches you something — but it can land you in [[jail]].

## Growing the maximum

| Source | Bonus |
| --- | --- |
| Crime experience milestones | +5 per milestone (natural, unlimited) |
| Merits | Up to +10 |
| Faction Criminality upgrades | Up to +40 |
| 5★ Amusement Park *Unflinching* | +10 |
| 5★ Meat Warehouse *Carnage* | +10 |
| 10★ Pub *Buzzed* | +15 |

## Adding nerve right now

- **Alcohol** bottles refill nerve and count towards your booster cooldown.
- **Cannabis** gives 8–12 nerve (tripled during the 420 event).
- **LSD** gives 5 nerve and 50 energy.
- **Red Easter Egg** gives 250 nerve.
- **Herbal Releaf Co.** stock blocks pay out 50 nerve per block, collectable every 7 days.
- **30 points** buys a nerve refill in the Points Building, once a day.
- Law job special (+3 nerve for 5 job points) and several company specials add nerve directly.

> Tip: There is an internal cap of 32,767 current nerve. Anything gained beyond that is discarded, so do not stack
> nerve you cannot spend.

## What nerve is for

- Committing [[crimes]] — the main sink.
- Busting another player out of jail: costs 5 nerve.
- Busting yourself out: costs **half your total nerve bar** (reduced by the LAW2990 education course).

Faction [[organized crime|organized-crime]] does *not* consume nerve, which is why it is the endgame crime route.
`,
    related: ['crimes', 'jail', 'energy', 'organized-crime'],
  });

  push({
    id: 'hospital',
    title: 'Hospital',
    cat: 'core',
    icon: '🏥',
    wiki: 'Hospital',
    tags: ['hospital', 'medical', 'revive'],
    summary: 'How you end up there, how to cut the timer with medical items, and the medical cooldown that limits them.',
    calc: 'hospital',
    facts: [
      ['Get out with', 'Medical items, revive, or waiting'],
      ['Medical cooldown cap', '6 hours (9 with faction)'],
      ['Education bonus', '+20%'],
      ['Faction bonus', '+30%'],
      ['Max combined bonus', '+50%'],
    ],
    body: `
You land in hospital by losing a fight (as attacker or defender), timing out after five minutes of combat, losing at
Russian Roulette, failing certain crimes and organised crimes, bad blood bags, SED explosions, and a few event items.
While you are there you cannot attack, be attacked, travel or use most city features.

## Ways out

1. **Wait it out.** Life regenerates 5% of your total every 5 minutes.
2. **Medical items.** Take minutes off the clock and restore life.
3. **Revive.** Another player pulls you out — they spend 75 energy, less with faction Fortitude upgrades. The life you
   come back with depends on their revive skill.
4. **Early discharge / elimination.** Faction perks and event mechanics can cut time.

## Medical items

{{table:medical}}

Education adds up to **20%** and faction specials up to **30%** to those figures, for a 50% total. Every item except
Opium adds to your **medical cooldown**, and once that cooldown passes six hours you cannot take another medical item
until it drops back below. Faction upgrades raise the ceiling to nine hours.

{{calc:hospital}}

> Tip: Small first aid kits are the cheapest time-per-dollar in most cases, but they add the most cooldown per minute
> saved. If you are chaining items, morphine and blood bags are cooldown-efficient; opium is the only item with no
> cooldown at all.

## Getting hold of medical items

Steal them from the hospital while working the medical job, buy them at the pharmacy, or open a Box of Medical
Supplies from the THS stock benefit. See [[Medical items|medical-items]].
`,
    related: ['life', 'attack', 'medical-items', 'revive'],
  });

  push({
    id: 'levels',
    title: 'Level and ranks',
    cat: 'core',
    icon: '📈',
    wiki: 'Level_and_Ranks',
    tags: ['XP', 'experience', 'level holding'],
    summary: 'How experience becomes levels, what each level unlocks, and why some players deliberately hold their level.',
    live: 'gym',
    facts: [
      ['Level 15', 'Travel agency'],
      ['Level 10', 'Company director'],
      ['Level 3', 'Join a company'],
      ['XP bar', 'Hidden — no visible progress bar'],
    ],
    body: `
Experience in Torn is invisible: there is no XP bar. You know it is coming from attacking and leaving, mugging,
hospitalising, crimes, gym training, holding a job, and a handful of company specials. When you have enough, an
**Upgrade** link appears next to your level.

Rough relative XP: attacking and leaving is the baseline at 100%, mugging gives about 55–60% of that, and
hospitalising about 40%. In other words, the *fastest* way to level is also the *kindest* one — hit, leave, repeat.

## Unlocks by level

{{table:levelUnlocks}}

## Level holding

Because you can choose not to press Upgrade, some players sit at a low level while their experience (and therefore
their true level) climbs. It is a pure psychological weapon: enemies see "level 12" and attack a player with
billion-stat battle stats.

The counter is the 10★ Candle Shop special, which reveals a player's true level.

> Tip: You can check how close you are to the next level by visiting the Fortune Teller in China ($75,000) or by
> working at a 7★ Game Shop.

## Ranks

Ranks are cosmetic titles that change at levels 2, 6, 11, 26, 31, 50, 71 and 100. They carry no mechanical benefit,
but most honors and medals are gated on level, so leveling still matters for completionists.
`,
    related: ['getting-started', 'attack', 'race-to-15', 'merits'],
  });

  push({
    id: 'merits',
    title: 'Merits',
    cat: 'core',
    icon: '🏅',
    wiki: 'Merits',
    tags: ['merits', 'upgrades', 'endgame'],
    summary: 'The permanent account-wide upgrades you buy with job points — and the ones that actually change how you play.',
    facts: [
      ['Bought with', 'Job points'],
      ['Life (10/10)', '+2,500 life'],
      ['Nerve (10/10)', '+10 max nerve'],
      ['Cap per merit', '10 points'],
    ],
    body: `
Merits are permanent upgrades purchased with job points, and they are one of the few things in Torn you can never
lose. Every merit line runs to 10 points, and the cost rises as you go, so the last few points are genuinely expensive.

## The merit lines

| Merit | Effect at 10/10 |
| --- | --- |
| Life | +2,500 maximum life (5,000 → 7,500) |
| Nerve | +10 maximum nerve |
| Bank interest | Better daily interest |
| Education | Shorter course times |
| Criminality | Crime success / nerve benefits |
| Working stats | Faster working-stat growth |
| Bazaar | More customers |
| Employee effectiveness | Better company performance |

## What to buy first

There is no single correct order, but two lines are almost universally recommended early:

1. **Education** — courses are measured in hours and days, and shortening them compounds for your whole account.
2. **Bank interest** — money you did not have to work for, forever.

After that it depends on your lane: Criminality if you live in [[crimes]], Life and Nerve if you fight, Working stats
and Employee effectiveness if you are a company lifer.

> Note: Merits cost job points, which are also what fires job specials and company specials. Spending them on merits
> is spending them permanently — budget before you commit.
`,
    related: ['points', 'jobs', 'education', 'life'],
  });

  push({
    id: 'points',
    title: 'Points',
    cat: 'core',
    icon: '🪙',
    wiki: 'Points',
    tags: ['points', 'points building', 'refill'],
    summary: 'Torn’s premium currency: what it buys, the daily refills, and the points market.',
    live: 'money',
    facts: [
      ['Energy refill', 'Once a day'],
      ['Nerve refill', 'Once a day'],
      ['Source', 'Buy, earn, or the points market'],
    ],
    body: `
Points are Torn's premium currency, bought with real money or traded between players on the points market. You spend
them in the **Points Building** on the north side of the city.

## The two refills that matter

- **Energy refill** — fills your energy bar to maximum. Once per day.
- **Nerve refill** — fills your nerve bar to maximum. Once per day, 30 points.

These are the highest-value routine purchases in the game for an active player: two refills a day is roughly 150 extra
energy and a full nerve bar, every day, forever.

## Other things points buy

- Books (subscriber-only titles with 31-day buffs)
- Extra bazaar slots and advertising
- Casino chips and event items
- Company and faction perks at the high end

## The points market

Players sell points to each other for cash at a floating rate, which makes points a legitimate money-making
intermediate: earn cash in the game, buy points, spend them on refills and books. Watch the spread — the buy and sell
prices differ enough to matter.

> Tip: If you only ever buy one thing with points, make it the daily energy refill. Everything else is optional;
> a wasted energy bar is not recoverable.
`,
    related: ['energy', 'nerve', 'books', 'item-market'],
  });

  push({
    id: 'properties',
    title: 'Properties',
    cat: 'core',
    icon: '🏠',
    wiki: 'Properties',
    tags: ['property', 'happy', 'specials'],
    summary: 'Your home, your happy ceiling, and the property specials that quietly change how you play.',
    calc: 'happyjump',
    facts: [
      ['Shack', '100 happy'],
      ['Private Island', '5,025 happy'],
      ['Bought from', 'Estate agents'],
      ['Staff', 'Raise happy toward the cap'],
    ],
    body: `
Buying a property from the estate agents does three things: it raises the **ceiling** on your base happiness, it gives
you somewhere to put upgrades, and at the top end it unlocks property specials.

## The ladder

{{table:properties}}

The staff you hire are what actually move the number — an unfurnished, unstaffed mansion gives you far less happy than
a fully-staffed one. Each property tier also has its own set of purchasable upgrades.

## Why the top of the ladder matters

Happy sits inside a logarithm in the gym gains formula. Going from the Shack (100) to the Private Island (5,025) with
full staff is the single biggest permanent gym upgrade available, and it is why established players tell newcomers to
save for a good property rather than a fancy gun.

> Tip: A cheap property with full staff beats an expensive property with none. Hire staff before you upgrade the
> building.

## Property specials

High-end properties come with specials — reduced hospital time, better happy regen, storage and staff bonuses. The
Castle and Private Island specials are the reason endgame players consider them mandatory rather than luxury.

See [[Happy|happy]] for how the ceiling feeds your training, and [[Money, bank & net worth|money]] for how players
actually afford a Private Island.
`,
    related: ['happy', 'money', 'companies'],
  });

  push({
    id: 'money',
    title: 'Money, bank & net worth',
    cat: 'work',
    icon: '💰',
    wiki: 'Bank',
    tags: ['cash', 'bank', 'networth', 'economy'],
    summary: 'Where money comes from, why you should never carry it, and what net worth actually counts.',
    live: 'money',
    facts: [
      ['Carry limit', 'None — but you can be mugged'],
      ['Bank', 'Interest, tiers, investments'],
      ['Net worth', 'Everything you own, valued'],
    ],
    body: `
Torn's economy is player-run, which means almost every dollar in circulation was created by another player doing
something profitable. Understanding where money comes from is most of understanding Torn.

## Where the money is

| Source | Scale | Effort |
| --- | --- | --- |
| Company wages | Steady, low | Low |
| Bazaar / item market flipping | Medium–high | Medium |
| [[Travel|travel]] and abroad arbitrage | Medium | Medium, gated at level 15 |
| [[Crimes|crimes]] and organised crime | Medium–very high | High, needs nerve and CE |
| Mugging and attacking | High, streaky | High, needs stats |
| Company ownership | Very high | Very high |
| Stock blocks and dividends | Passive | Capital up front |
| Casino | Negative expected value | None |

## Banking it

Money on hand can be **mugged**. There is no reason to carry more than you need for the next few hours, and every
reason not to: bank it, spend it, or put it into stock. The bank pays interest on balances, and merit upgrades improve
the rate.

> Warn: Abroad there is no hospital, and you are a mugging target the moment you land. Travel light, buy, and fly home.

## Net worth

Net worth is the value of everything you own: cash, bank, property, items, company, stock, vehicles and so on. It is
the number players compare, and it is what most "top" lists rank by. It is also the number that decides whether you
can afford the next tier of the game — a Private Island, a block of stock, or a 10★ company.

## The honest hierarchy

1. Stop leaking money (fees, bad prices, casino).
2. Build a steady income (company, bazaar, travel runs).
3. Reinvest in things that raise income (property happy → gym gains → wins; company stars → specials).
4. Only then start speculating.
`,
    related: ['item-market', 'bazaar', 'companies', 'stock-market'],
  });

  push({
    id: 'education',
    title: 'Education',
    cat: 'core',
    icon: '🎓',
    wiki: 'Education',
    tags: ['courses', 'perks', 'long game'],
    summary: 'Courses, completion, and the permanent perks that make education the longest grind in Torn.',
    facts: [
      ['Location', 'Education, west side'],
      ['Speed-ups', 'Merits, company specials, candy'],
      ['Notable', 'Sports Science gym bonuses'],
      ['LAW2990', 'Cheaper self-busts'],
    ],
    body: `
Education is the slowest and most permanent progression system in Torn. Courses take hours to days, cost money, and
grant small permanent bonuses that stack with everything else.

## The course families

- **Sports Science** — the gym line. SPT3510 (Bachelors) gives +1% to all gym gains; SPT2440/2450/2460/2470 each give
  +1% to strength, speed, defense and dexterity respectively.
- **Law** — LAW2990 reduces the nerve cost of busting yourself out of jail.
- **Medical** — improves medical item effectiveness by up to 20%, which stacks with faction bonuses.
- **Business, Psychology, Combat** and the rest — each family has its own perks, from crime success to working stats.

## Speeding it up

- Merit upgrades in the Education line cut course times permanently.
- The 7★ Hair Salon special *Cutting Corners* takes 30 minutes off any course for 1 job point — the cheapest
  speed-up in the game.
- Energy drinks and candy can be traded for course time in some systems.

> Tip: Do the Sports Science line first if you train, the Medical line if you fight a lot, and LAW2990 if you spend
> any time in jail. The rest can wait until you have money to burn.

## Why it matters

Education bonuses are additive with faction Steadfast, company specials and books. That means the endgame gym trainer
is stacking +1% here and +1% there until the total is meaningful — and education is the part of that stack nobody can
take away from you.
`,
    related: ['gym', 'merits', 'battle-stats', 'jail'],
  });

  push({
    id: 'awards',
    title: 'Honors, medals & awards',
    cat: 'core',
    icon: '🎖️',
    wiki: 'Awards',
    tags: ['honors', 'medals', 'completion'],
    summary: 'The three tiers of Torn’s achievement system and the ones worth chasing for real bonuses.',
    facts: [
      ['Honors', 'Progressive, visible bars'],
      ['Medals', 'One-off milestones'],
      ['Awards', 'Everything else'],
      ['Some give', 'Merits, items, permanent perks'],
    ],
    body: `
Torn tracks almost everything you do and hands out three kinds of recognition.

- **Honors** are progressive bars: attack 100 players, 1,000 players, 100,000 players. They are the long-term
  scoreboard and several grant merits or items at thresholds.
- **Medals** are one-off milestones, often gated on level or on a single impressive act.
- **Awards** is the umbrella term, and includes the silly ones (eat 1,000 candies) alongside the serious ones.

## Worth chasing

- Attack and defend honors — they come naturally and grant merits.
- Crime experience honors — same, if you crime daily.
- Level-gated medals — unavoidable if you play long enough.
- Revive and bust counts — useful to faction-mates, and they feed merit progress.

## Not worth chasing

Anything that costs more than it returns. Several awards require spending enormous sums or self-sabotaging your stats.
Check the reward before you commit weeks to a bar.

> Note: Some awards are permanently missable — event awards, mostly. If an event is running, do the event.
`,
    related: ['levels', 'merits', 'attack', 'crimes'],
  });
})(window);
