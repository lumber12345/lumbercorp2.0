/* Tornpedia — work, economy and items. */
(function (root) {
  'use strict';
  const A = (root.TW_ARTICLES = root.TW_ARTICLES || []);
  const push = (o) => A.push(o);

  push({
    id: 'jobs',
    title: 'City jobs',
    cat: 'work',
    icon: '💼',
    wiki: 'Jobs',
    tags: ['city jobs', 'job points', 'working stats'],
    summary: 'All six city-job ladders, their 41 positions, requirements, pay, daily stat gains and job specials.',
    live: 'job',
    calc: 'jobpoints',
    facts: [
      ['Ladders', '6'],
      ['Positions', '41'],
      ['Requirements', 'Man / Int / End'],
      ['Point drop', '18:00 TCT daily'],
      ['Cost to join', 'Free'],
    ],
    body: `
There are six city jobs, all free to join, and each is a ladder of positions you climb by raising three working stats:
**manual labor (Man)**, **intelligence (Int)** and **endurance (End)**. Every day you work you gain a little of each,
plus pay, plus **job points** — the currency behind job specials, company specials and merits.

{{table:jobs}}

## Reading the table

- **Man / Int / End** are the working stats needed to be promoted into that position.
- **+Man / +Int / +End per day** is what working there trains. This is why job choice is a stat decision: the Army
  trains manual labor, Education trains intelligence, Medical trains endurance.
- **$/day** is the wage. It is pocket change after the early game — the real value is the points.
- **Promotion pts** is the job-point threshold for the next rung.

## Which one should you take?

- **Army** — combat specials: strength boosts, stealing a weapon, and at General the ability to **spy a player's
  battle stats** for 10 army points and $5,000. The most valuable special in the game for PvP.
- **Grocer** — cheap, low requirements, and steals cash, candy, alcohol and energy drinks with job points.
- **Casino** — the best early pay and the classic starting job for new players.
- **Medical** — the only route to the **revive** ability (brain surgeon rank), and it lets you steal medical items.
- **Education** — intelligence-heavy, and pairs with the education system.
- **Law** — nerve refills and busting benefits.

> Tip: You keep the job points you already banked when you switch jobs, but you start the new ladder at the bottom.
> Climb the ladder whose special you want, then switch.

## Job points

Points drop at **18:00 TCT** every day, and they fund job specials, company specials and merit purchases. Work out
your next promotion here:

{{calc:jobpoints}}
`,
    related: ['companies', 'company-specials', 'merits', 'revive'],
  });

  push({
    id: 'companies',
    title: 'Companies',
    cat: 'work',
    icon: '🏪',
    wiki: 'Company/Company_List',
    tags: ['companies', 'director', 'special stars'],
    summary: 'Every company a player can start — cost, staff, how it earns, and what its specials are worth.',
    live: 'company',
    calc: 'company',
    facts: [
      ['Player-startable', '39'],
      ['Cheapest', '$750,000 (Hair Salon)'],
      ['Join from', 'Level 3'],
      ['Director from', 'Level 10'],
      ['Specials', '1★ / 3★ / 5★ / 7★ / 10★'],
    ],
    body: `
A company is Torn's business sim. You buy one, hire staff, buy stock, set prices, advertise, and climb a star rating
from 1★ to 10★. Each star unlocks a special, and the 10★ specials are among the strongest effects in the game.

{{table:companies}}

## Reading the list

- **Startup** is the cash you need to open the doors.
- **Default staff** is the headcount the company expects; wages are your biggest recurring cost.
- **Profit /5** and **Effort /5** are community ratings — how much money it can make, and how much daily fiddling it
  takes to get there.

## How a company earns

Customers arrive based on **popularity** (advertising), and buy stock based on your **prices** versus the going rate.
Staff generate stock or serve customers depending on their roles and how well their working stats match. Your
**efficiency** meter is the quick health check: if it is below about 70%, you have people in the wrong jobs.

## What makes a company worth it

Most companies lose money on paper and pay for themselves through their specials. Before you buy, ask:

1. Does the 10★ special do something I would otherwise pay cash for? (Energy, nerve, education speed, damage boosts.)
2. Can I afford to run it for a month before it turns a profit?
3. Will I actually log in to restock and re-price?

{{calc:company}}

> Warn: A company with no advertising gets no customers, and a company with no stock gets no sales. The two failure
> modes are both boring, and both cost you money every day.

## Employee view

You do not have to own one. Working at a company pays wages, trains working stats, and gives you access to the
company's specials while you are employed there.
`,
    related: ['company-specials', 'company-management', 'jobs', 'money'],
  });

  push({
    id: 'company-specials',
    title: 'Company specials',
    cat: 'work',
    icon: '✨',
    wiki: 'Company/Special_List',
    tags: ['specials', 'job points', 'stars'],
    summary: 'The 1★–10★ ladder, the difference between passive and job-point specials, and the ones players build around.',
    facts: [
      ['Unlocked at', '1★, 3★, 5★, 7★, 10★'],
      ['Two kinds', 'Passive and job-point'],
      ['Energy cap', '100 JP/day on energy specials'],
      ['Reset', '00:00 TCT daily'],
    ],
    body: `
Every company has five specials, one per star milestone. Some are **passive** — they simply apply while you are
employed. Others cost **job points** to fire, and those have a daily budget: you cannot spend more than
**100 job points a day** on energy-granting specials, and the counter resets at 00:00 TCT.

## The specials worth knowing

- **10★ Farm — Early Riser**: +7 energy per job point. The most efficient energy conversion in the game.
- **10★ Game Shop — Overpowered**: +5 energy, +1 nerve, +50 happy for one job point.
- **10★ Pub — Buzzed**: +15 maximum nerve.
- **7★ Hair Salon — Cutting Corners**: 30 minutes off any education course for 1 job point.
- **10★ Television Network — Press Pass**: a chance at 300 energy for 25 job points, and it is *not* subject to the
  100 JP daily energy cap.
- **7★ Candle Shop — Reinvigorating Therapy**: +5 energy per job point.
- **5★ Amusement Park — Unflinching** and **5★ Meat Warehouse — Carnage**: +10 maximum nerve each.

## Gym-gain specials

- 7★ Ladies Strip Club — *Boxercise*: +10% defense gym gains.
- 7★ Gents Strip Club — *Pilates*: +10% dexterity gym gains.
- 10★ Fitness Center — *Training Regime*: +3% to all gym gains.
- 3★ Fitness Center — *Goal Oriented*: halves the happy you lose per train.

## Combat specials

Damage bonuses cluster in the 10★ tier: +20% slashing damage (Hair Salon), and similar lines for other weapon types
across the furniture, gun, gas and adult-novelty companies.

> Tip: If you only ever use one special, make it an energy one — energy is the input to everything else, and the
> 100 JP/day cap means you should spend it every single day rather than saving it.
`,
    related: ['companies', 'company-management', 'energy', 'jobs'],
  });

  push({
    id: 'company-management',
    title: 'Running a company',
    cat: 'work',
    icon: '📊',
    wiki: 'Company',
    tags: ['management', 'staff', 'stock', 'profit'],
    summary: 'Popularity, efficiency, environment, stock lines and the weekly rhythm of a profitable company.',
    live: 'company',
    facts: [
      ['Meters', 'Popularity, efficiency, environment'],
      ['Staff roles', 'Manager, marketer, trainer, cleaner'],
      ['Advertising', 'Drives customers'],
      ['Upgrades', 'Size, staff room, storage'],
    ],
    body: `
Owning a company is a daily chore with a weekly payoff curve. Three meters decide everything.

## The three meters

- **Popularity** — how many customers walk in. Raised by advertising spend and by good reviews; falls when you
  overcharge or run out of stock.
- **Efficiency** — how well your staff fit their roles. Match people to positions that suit their working stats and it
  climbs; leave a manual-labor genius in marketing and it collapses.
- **Environment** — how pleasant the place is. It feeds popularity and staff morale.

## The weekly loop

1. **Check stock lines.** Anything below your reorder level gets restocked. Anything priced below cost gets fixed —
   this is the single most common way companies quietly lose money.
2. **Check wages.** Wages are your biggest cost. Pay enough to keep good people, not enough to keep everyone.
3. **Set advertising.** A company with no customers sells nothing regardless of how good the stock is.
4. **Read the profit line.** Daily and weekly views both matter: daily catches mistakes, weekly shows trends.
5. **Bank the profit** and reinvest in the next upgrade — size, staff room, then storage.

## Staff roles

Employees fill four broad roles — **manager**, **marketer**, **trainer** and **cleaner** — and each rewards a
different working-stat profile. A well-run company keeps a spreadsheet of who is good at what.

## Director perks

As director you control the company bank, set everyone's wages, buy upgrades and take profit. You can also run the
company at a loss deliberately, if the specials are worth more to you than the money — which, at 10★, they often are.

> Tip: The fastest way to spot a sick company is margin per unit. If a stock line's margin is negative, every sale
> makes you poorer.
`,
    related: ['companies', 'company-specials', 'money'],
  });

  push({
    id: 'item-market',
    title: 'Item market',
    cat: 'work',
    icon: '🏷️',
    wiki: 'Item_Market',
    tags: ['market', 'fees', 'trading'],
    summary: 'The city’s one-stop shop for player listings: categories, filters, and the fees that came in with 2.0.',
    calc: 'market',
    facts: [
      ['Sales tax', '5% (since 22 Jun 2025)'],
      ['Anonymous listing', '+10%'],
      ['Categories', '24 + Popular'],
      ['Level requirement', 'None'],
    ],
    body: `
The item market is where players sell to players. Since the **Item Market 2.0** update it no longer shows bazaar
listings — it is its own thing, with instant bulk purchases, real-time quantities and filters good enough to shop by
exact damage and accuracy ranges.

## Categories

There are 24 categories — melee, primary, secondary, temporary and armor under equipment; medical, drugs, energy
drinks, alcohol, candy, boosters, enhancers, special, tools, materials and supply packs under consumables; and
clothing, jewelry, flowers, plushies, cars, artifacts, collectibles and miscellaneous under everything else. A 25th
"Popular" tab shortlists the most-traded items.

## Filters that matter

For equipment you can filter by weapon type, by bonus (any, specific, or by colour tier — yellow, orange, red), by
price band and by **exact accuracy and damage numbers**. That last one is how players shop for a precise weapon
rather than hoping.

## Fees

- A **5% sales tax** has been in force since 22 June 2025. It arrived at 1% in February 2025 and stepped up 1% a
  month.
- Listing **anonymously** costs an extra **10%** of the sale price — unless you hold the 5★ Car Dealership or 5★
  Property Broker special, which reduce it to zero.
- Fees are taken at the moment of sale, not when you list.

{{calc:market}}

> Tip: Sort by unit price, not listing price. Bulk listings hide expensive units inside a big stack.

## Related: the bazaar

Your own shop is the [[bazaar]] — different mechanics, different audience, and no sales tax for the buyer to worry
about beyond your price.
`,
    related: ['bazaar', 'auction-house', 'items', 'money'],
  });

  push({
    id: 'bazaar',
    title: 'Bazaar',
    cat: 'work',
    icon: '🛒',
    wiki: 'Bazaar',
    tags: ['bazaar', 'shop', 'customers'],
    summary: 'Your own shop: how customers find you, what sells, and why pricing is 90% of the work.',
    facts: [
      ['Location', 'Your property / bazaar page'],
      ['Customers', 'Driven by advertising and price'],
      ['Fees', 'None on the sale itself'],
      ['Advertising', 'Costs money, brings footfall'],
    ],
    body: `
Your bazaar is your personal shop. You stock it, you price it, and players browsing the bazaar directory (or hitting
your profile) buy from it.

## How customers arrive

Footfall comes from three places: the bazaar directory, your advertising spend, and people who already know you.
Merit upgrades in the bazaar line increase the number of customers you get, which is why bazaar merits are a slow,
reliable investment for traders.

## What sells

- **Consumables** — energy drinks, medical items, candy, drugs. High turnover, thin margins, constant demand.
- **Weapons and armour** — low turnover, huge margins, and the buyers are picky about exact stats.
- **Flowers and plushies** — set collectors pay over the odds for the one they are missing.
- **Materials and tools** — steady industrial demand from company owners.

## Pricing

Price against the item market, not against hope. Buyers check. If you are the cheapest listing you will sell fast; if
you are 5% over you will sit on stock.

> Tip: Bazaar customers are capped per day by your merits and advertising. If you are selling out instantly, you are
> underpriced — raise prices until you are selling through but not clearing out.

## Bazaar vs item market

The item market charges a 5% tax and takes the listing out of your hands. Your bazaar charges nothing but only reaches
people who come looking. Serious traders use both: bazaar for steady turnover, market for one-off big-ticket items.
`,
    related: ['item-market', 'auction-house', 'money'],
  });

  push({
    id: 'auction-house',
    title: 'Auction house',
    cat: 'work',
    icon: '🔨',
    wiki: 'Auction_House',
    tags: ['auction', 'bidding', 'level 5'],
    summary: 'Where the rare stuff goes: how auctions work, when to bid, and the sniping problem.',
    facts: [
      ['Unlocked at', 'Level 5'],
      ['Format', 'Timed ascending bids'],
      ['Best for', 'Rare, bonus and collector items'],
    ],
    body: `
The auction house is Torn's marketplace for things that do not have a stable price: bonus weapons, artifacts, rare
collectibles, cars, and anything a seller thinks two people will fight over.

## How it works

A seller lists an item with a starting price and a duration. Buyers bid; the highest bid when the clock runs out wins.
Bids are binding, and the auction extends if a bid lands near the end.

## When to use it

- **Selling** anything with no obvious market price. Let two collectors discover the value for you.
- **Buying** items that never appear on the item market.
- **Never** for commodities. You will pay a premium for the theatre.

## Bidding discipline

1. Decide your maximum before you bid.
2. Write it down if you have to.
3. Do not bid in the first hour — you are only raising the price for yourself.
4. Expect to be sniped in the final seconds. That is the game.

> Warn: Auction wins are final. There is no "I misread the number" refund, and the seller is not obliged to care.
`,
    related: ['item-market', 'bazaar', 'items'],
  });

  push({
    id: 'stock-market',
    title: 'Stock market',
    cat: 'work',
    icon: '📉',
    wiki: 'Stock_Market',
    tags: ['stocks', 'blocks', 'dividends', 'benefits'],
    summary: 'The Torn City Stock Exchange: what blocks are for, the passive benefits, and why most stocks are not investments.',
    facts: [
      ['Exchange', 'TCSE'],
      ['Blocks', 'Bought in fixed sizes'],
      ['Benefits', 'Collected every 7 days'],
      ['Dividends', 'Paid on profitable stocks'],
    ],
    body: `
The Torn City Stock Exchange lets you buy **blocks** of the game's own companies. Stocks pay dividends when the
company is profitable, and — far more importantly — certain stocks grant **benefits** you can collect every seven days.

## Benefits: the real reason to hold stock

| Stock | Benefit |
| --- | --- |
| Mc Smoogle Corp (MSC) | 100 energy per block, every 7 days |
| Herbal Releaf Co. (CBD) | 50 nerve per block, every 7 days |
| EVL | 1,000 happy per block, every 7 days |
| THS | Box of Medical Supplies |
| Others | Company-specific perks |

Those three — energy, nerve and happy — are why established players treat stock blocks as infrastructure rather than
as an investment. They are the closest thing Torn has to passive income.

## Dividends

Profitable companies pay out to shareholders. The yield is small relative to the capital, so nobody sensible buys
stock purely for dividends.

## Price movement

Stock prices move with company performance and with player speculation. Some players trade the spread; most buy a
block for the benefit and hold it forever.

> Tip: Buy one block of MSC, CBD and EVL before you buy anything else in this game that costs eight figures. The
> weekly energy, nerve and happy pay out forever.
`,
    related: ['money', 'energy', 'nerve', 'happy'],
  });

  push({
    id: 'casino',
    title: 'Casino',
    cat: 'work',
    icon: '🎰',
    wiki: 'Casino',
    tags: ['gambling', 'blackjack', 'dice', 'slots'],
    summary: 'Every game on the floor and the honest expected value of each. Short version: the house always wins.',
    facts: [
      ['Location', 'Red-light district'],
      ['Games', 'Blackjack, dice, slots, roulette, wheel'],
      ['Expected value', 'Negative'],
      ['Unlocks', 'Level 4 (blackjack), 6 (roulette), 7 (wheel)'],
    ],
    body: `
The casino is on the red-light district and it is a reliable way to turn a large pile of money into a small one.
Every game on the floor has a negative expected value — that is what keeps the lights on.

## The games

- **Blackjack** (level 4) — the least bad game if you play perfect basic strategy. Still negative.
- **Dice** — pure variance, quick, and the fastest way to lose a bankroll.
- **Slots** — the worst odds on the floor, by a distance.
- **Roulette** (level 6) — negative, and Russian Roulette is worse: losing drops your life to 1.
- **Spin the Wheel** (level 7) — outcomes include "face punch", "kick to the throat" and "choke hold", all of which
  send you to hospital.

## Why people still play

- It is fast, and fast is fun.
- Some players chase the casino-related honors.
- A few games are used to move money between players (with all the risk that implies).

> Warn: If you are playing to make money, stop. Every dollar the casino pays out came from another player who lost it,
> minus the house edge. The same energy spent on a travel run or a bazaar flip makes real money.

## The one exception

Some event periods and promotions change the maths. If Torn is running a bonus, do the arithmetic on the actual
numbers before you sit down.
`,
    related: ['money', 'levels', 'points'],
  });

  push({
    id: 'racing',
    title: 'Racing',
    cat: 'work',
    icon: '🏎️',
    wiki: 'Race_Track',
    tags: ['racing', 'cars', 'upgrades'],
    summary: 'Street racing for money and honors: how cars, upgrades and race points fit together.',
    facts: [
      ['Location', 'Raceway, red-light district'],
      ['Requires', 'A car'],
      ['Upgrades', 'Speed, handling, acceleration'],
      ['Rewards', 'Cash, racing honors'],
    ],
    body: `
Racing is Torn's car game. You buy a car, upgrade it, and race other players on the raceway for cash and racing
honors.

## How it works

You enter a race, and the outcome is decided by your car's stats against the field's — speed, handling and
acceleration all matter, and each car has a different profile. Upgrades cost money and improve the car permanently.

## The cars

Cars range from cheap starter motors to absurdly expensive machines that exist mainly as status symbols. Better cars
start with better base stats and have more upgrade headroom.

## Is it worth it?

Racing pays, but it pays like a job rather than like a heist: steady, modest, and gated by the money you have already
spent on the car. Players race for the honors and for the fun; almost nobody races as their primary income.

> Tip: Racing consumes energy. If you are mid [[happy jump|happyjump]], do not spend it on the track.
`,
    related: ['items', 'money', 'energy'],
  });

  push({
    id: 'items',
    title: 'Item categories',
    cat: 'items',
    icon: '🎒',
    wiki: 'Item_Market',
    tags: ['items', 'categories', 'inventory'],
    summary: 'How Torn organises the thousands of items in the game, and which categories actually matter.',
    facts: [
      ['Categories', '24 marketable'],
      ['Equipment', 'Melee, primary, secondary, temporary, armor'],
      ['Consumables', 'Medical, drugs, drinks, alcohol, candy, boosters'],
      ['Collectibles', 'Flowers, plushies, artifacts'],
    ],
    body: `
Torn has thousands of items. They are grouped into 24 marketable categories, and understanding the groups is most of
understanding where value sits.

## Equipment

- **Melee** — knives, bats, katanas, machetes. Damage and accuracy vary by weapon type, and slashing/piercing/clubbing
  damage types matter against different armour.
- **Primary** — rifles, machine guns, shotguns. The biggest damage numbers in the game, and the reason high-level
  fights end fast.
- **Secondary** — pistols and SMGs. Cheaper, faster, weaker.
- **Temporary** — grenades, nail bombs, smoke. Single-use combat items with outsized effects.
- **Armor** — reduces incoming damage. Sets matter more than pieces.

## Consumables

Medical items, drugs, energy drinks, alcohol, candy and boosters. This is where most of your daily cash goes, and
where the [[item market]] is most liquid.

## Everything else

Tools and materials feed companies. Flowers and plushies are set-collection items tied to [[travel]]. Artifacts belong
to the museum. Collectibles are pure speculation. Clothing and jewelry are cosmetic with a handful of useful sets.

## Weapon bonuses

Equipment can roll **bonuses** — extra damage, accuracy, stealth, revive chances — in three colour tiers (yellow,
orange, red). A red-bonus weapon is worth multiples of the same gun without one, which is why the item market lets you
filter by bonus colour.

> Tip: Do not hoard. Items in your inventory are not earning anything, and they are the first thing a mugger looks at.
`,
    related: ['weapons', 'armor', 'medical-items', 'drugs'],
  });

  push({
    id: 'drugs',
    title: 'Drugs',
    cat: 'items',
    icon: '💊',
    wiki: 'Drugs',
    tags: ['drugs', 'addiction', 'overdose', 'cooldown'],
    summary: 'Effects, cooldowns, addiction and overdose — the four things to understand before you take anything.',
    facts: [
      ['Xanax', '+250 energy'],
      ['LSD', '+50 energy, +5 nerve'],
      ['Cannabis', '+8–12 nerve'],
      ['Ecstasy', 'Doubles happy'],
      ['Overdose', 'Empties your happy'],
    ],
    body: `
Drugs are the fastest way to convert cash into bars, and they are the fastest way to ruin a week's planning. Four
mechanics govern all of them.

## 1. Effects

| Drug | Effect |
| --- | --- |
| Xanax | +250 energy |
| LSD | +50 energy, +5 nerve |
| Cannabis | +8–12 nerve (tripled on 420 day) |
| Ecstasy | Doubles happy |
| Ketamine, PCP, Shrooms, Speed | Various combat and stat effects |
| Vicodin | Pain relief, life effects |

## 2. The drug cooldown

Every drug you take adds to a shared **drug cooldown**. While it is running you cannot take another drug, and the
amount added depends on the drug — Xanax and Ecstasy both add hours. This is the constraint that stops players
chaining Xanax indefinitely.

## 3. Addiction

Using drugs raises your **addiction** percentage. High addiction applies penalties — reduced effectiveness, unhappy
side effects, and at very high levels a chance of being hospitalised while training at the gym. Travelling to
Switzerland and paying for rehab ($250,000) is the reset button.

## 4. Overdose

Take a drug while the odds are against you and you **overdose**. The penalties are severe: for Xanax, Ecstasy,
Ketamine, PCP, Shrooms, Speed and Vicodin your **happy bar is emptied completely**, which destroys any happy jump in
progress.

> Warn: An overdose mid-jump is the single most expensive accident in Torn. Days of happy regeneration gone, plus the
> hospital time, plus the addiction.

## Buying and selling

Drugs are legal to trade on the item market and are cheaper abroad — Switzerland is the classic run, along with South
Africa for Xanax. Check the [[travel]] tables.
`,
    related: ['medical-items', 'energy-drinks', 'happy', 'travel'],
  });

  push({
    id: 'medical-items',
    title: 'Medical items',
    cat: 'items',
    icon: '🩹',
    wiki: 'Hospital',
    tags: ['medical', 'first aid', 'cooldown'],
    summary: 'First aid kits, morphine, blood bags and opium — and the medical cooldown that limits all of them.',
    calc: 'hospital',
    facts: [
      ['SFAK', '20 min, 5% life'],
      ['FAK', '40 min, 10% life'],
      ['Morphine', '70 min, 15% life'],
      ['Blood bag', '120 min, 30% life'],
      ['Opium', '180 min, no cooldown'],
    ],
    body: `
Medical items cut your hospital timer and restore life. They are the difference between a five-minute setback and an
afternoon lost.

{{table:medical}}

## The medical cooldown

Every item except **Opium** adds to your medical cooldown — 10 minutes for a small first aid kit, up to 30 for a blood
bag. Once that cooldown passes **six hours** you cannot take another medical item until it falls back below. Faction
upgrades raise the ceiling to nine hours.

That makes opium special: it is the only item you can always take, which is why it commands a premium.

## Where they come from

- **Steal them** from the hospital while working in the medical job.
- **Buy them** at the pharmacy.
- **Open a Box of Medical Supplies** from the THS stock benefit — 25% chance of 50 SFAKs, 30 FAKs or 20 morphine.

## Education and faction bonuses

Education adds up to **20%** and faction specials up to **30%**, for a **50%** total. That turns a first aid kit from
40 minutes into 60, and a blood bag from 120 into 180.

{{calc:hospital}}

> Tip: Blood bags must match your blood type. The wrong one drops your life to 1 instead of healing you.
`,
    related: ['hospital', 'drugs', 'jobs'],
  });

  push({
    id: 'energy-drinks',
    title: 'Energy drinks & boosters',
    cat: 'items',
    icon: '🥤',
    wiki: 'Energy_Drink',
    tags: ['boosters', 'cooldown', 'energy'],
    summary: 'Cans, coupons and the booster cooldown that quietly caps how many you can drink in a day.',
    calc: 'energy',
    facts: [
      ['Range', '5–30 energy per can'],
      ['Faction perk', '×1.5 gain'],
      ['Booster cooldown', '+2 hours per can'],
      ['Feathery Hotel Coupon', '150 E, +500 happy, +6 h'],
    ],
    body: `
Energy drinks are the mid-tier energy source: more expensive per point than Xanax, but flexible, legal, and stackable
in small doses.

{{table:energyItems}}

## The booster cooldown

Every energy drink adds **two hours** to your booster cooldown, and that cooldown is shared with alcohol and with
Feathery Hotel Coupons (which add six hours). Once it is running you cannot drink another can until it clears.

That is the hard ceiling: at +2 hours per can you cannot chain more than a handful a day, no matter how much money you
have.

## Faction perks

Faction upgrades multiply the energy you get from a can by **1.5×**, which turns a 25-energy Red Cow into 38. That is
often enough to flip the cost-per-energy comparison against Xanax.

## Choosing a can

Bigger cans are not always better value. The community tracks **dollars per energy** for every can, and the ranking
shuffles constantly with market prices — which is exactly what the calculator on the [[Energy|energy]] page is for.

{{calc:energy}}
`,
    related: ['energy', 'drugs', 'happy'],
  });

  push({
    id: 'books',
    title: 'Books',
    cat: 'items',
    icon: '📚',
    wiki: 'Books',
    tags: ['books', 'buffs', 'credits'],
    summary: 'The 31-day subscriber buffs — including the gym books that permanently change your training maths.',
    facts: [
      ['Duration', '31 days'],
      ['Bought with', 'Credits (points)'],
      ['Best gym book', '+30% to one stat'],
      ['Stacking', 'One per stat family'],
    ],
    body: `
Books are 31-day buffs bought with credits. Most are niche; the gym ones are not.

## The gym books

| Book | Effect |
| --- | --- |
| Get Hard Or Go Home | +20% to all gym gains |
| Gym Grunting | +30% strength gym gains |
| Self Defense In The Workplace | +30% defense gym gains |
| Speed 3 — The Rejected Script | +30% speed gym gains |
| Limbo Lovers 101 | +30% dexterity gym gains |
| Higher Daddy, Higher! | +20% energy regeneration |

## Stat books

A separate family grants a permanent **+5% to a stat, up to 10m** on completion — Brawn Over Brains (strength), Time Is
In The Mind (speed), Keeping Your Distance (defense) and the dexterity equivalent. These are how players push past the
point where gym gains alone get slow.

## Are they worth it?

If you train seriously, the gym books pay for themselves in saved energy many times over. A +30% book for the stat you
are grinding is one of the best credit purchases in the game.

If you do not train much, save your credits for daily energy refills instead — those are unconditional.
`,
    related: ['gym', 'battle-stats', 'points', 'energy'],
  });
})(window);
