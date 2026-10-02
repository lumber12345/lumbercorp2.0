/* Tornpedia — combat, crime and factions. */
(function (root) {
  'use strict';
  const A = (root.TW_ARTICLES = root.TW_ARTICLES || []);
  const push = (o) => A.push(o);

  push({
    id: 'battle-stats',
    title: 'Battle stats',
    cat: 'combat',
    icon: '💪',
    wiki: 'Battle_Stats',
    tags: ['strength', 'speed', 'defense', 'dexterity'],
    summary: 'What each of the four stats does in a fight, the published stat weights, and how stats grow over time.',
    live: 'gym',
    calc: 'weights',
    facts: [
      ['Strength', 'Damage per hit'],
      ['Speed', 'Hit chance, stops escapes'],
      ['Defense', 'Damage mitigation'],
      ['Dexterity', 'Dodge, stealth, escapes'],
      ['Old stat cap', 'Removed Aug 2022'],
    ],
    body: `
Your four battle stats decide every fight in Torn. They are raised almost entirely by spending energy in the
[[gym]], and they grow **exponentially** — the same energy buys far more at 10 million than it did at 1 million.

## What each one does

- **Strength** — increases the damage you deal per hit.
- **Defense** — reduces the damage you take per hit.
- **Speed** — increases your chance to hit, and reduces your opponent's chance to escape.
- **Dexterity** — increases your chance to dodge, your chance to stealth an attack, your chance to escape, and
  reduces your opponent's chance to stealth.

## Stat weights

The published weights (from the Attacking 2.0 announcement) describe how much of one stat you need to beat a fixed
10,000,000 of another:

{{table:statWeights}}

Two things jump out. First, **the curves are brutally diminishing** — 10 million speed against 10 million dexterity
gives only a 50% hit chance. Second, defense against strength is the mirror image, capping at 100% mitigation around
140 million.

{{calc:weights}}

## How stats grow

- **Gym training** — the main route. Energy × happy × gym dots.
- **Stat enhancers** — one-time permanent boosts (skateboard, parachute, boxing gloves, dumbbells each give +1% to a
  stat), plus larger enhancers from events and the museum.
- **Books** — +5% to a stat up to 10m on completion.
- **Company specials, faction perks and education** — percentage boosts to *gains*, not to the stat itself.

## The old stat cap

Until 2 August 2022 there was a soft cap at 50 million per stat, after which gains collapsed to a fixed trickle.
Chedburn removed it: beyond 50m, gains now keep rising at a steadily decreasing rate. The practical effect is that
gym training stays relevant for players in the billions, where before it did not.

> Note: Tornpedia's gym calculator shows both the community formula and the official post-cap growth figures, because
> they disagree at high stat values and the honest answer is that nobody outside Torn knows the exact curve.
`,
    related: ['gym', 'attack', 'weapons', 'armor'],
  });

  push({
    id: 'gym',
    title: 'Gym',
    cat: 'combat',
    icon: '🏋️',
    wiki: 'Gym',
    tags: ['gyms', 'training', 'dots', 'happy'],
    summary: 'All 33 gyms with their dots and unlock costs, the specialist gym requirements, and the gains formula.',
    live: 'gym',
    calc: 'gym',
    facts: [
      ['Standard gyms', '24'],
      ['Specialist gyms', '9'],
      ['Cheapest', 'Premier Fitness, $10'],
      ['Best standard', "George's, 7.3 dots, $100m"],
      ['Best overall', 'Fight Club, 10.0 dots'],
    ],
    body: `
The gym is where energy becomes stats. There are 33 gyms: 24 standard gyms you unlock in sequence with money and gym
experience, and 9 specialist gyms with unusual requirements.

## Standard gyms

{{table:gyms}}

The "dots" are the per-stat multipliers — and in the API they are stored ten times higher, so Premier Fitness is
listed as 20 rather than 2.0.

## Specialist gyms

{{table:specialGyms}}

The specialist gyms trade energy per train (25 or 50) for much higher dots, and they force you into a **stat
imbalance**: you qualify only if one stat (or one pair) is 25% above the rest. That is why endgame players train in a
deliberate, lopsided order.

> Tip: The jail gym's defense gains beat every lightweight gym. If you are a new player and you land in jail, train
> defense while you are there — the advantage disappears once you reach Pioneer Fitness.

## The gains formula

The published community formula (Vladar) is:

> Math: gain = Modifiers × Gym dots × Energy per train × [ (a·ln(Happy + b) + c) × Stat + d·(Happy + b) + e ]

a = 3.480061091e-7, b = 250, c = 3.091619094e-6, d = 6.82775184551527e-5, e = −0.0301431777.

Two caveats Tornpedia will not hide: it grows **linearly** with your stat, and Torn's own published monthly-growth
figures after the 2022 cap removal do not. Use the calculator — it shows both.

{{calc:gym}}

## Happy loss

Every train costs happy equal to **40–60% of the energy used**, regardless of where the energy came from. The 3★
Fitness Center passive halves it.

## What multiplies gains

- **Education** — Sports Science courses, +1% each.
- **Faction Steadfast** — +1% per level in the matching sub-branch.
- **Company specials** — Fitness Center 10★ (+3% all), Ladies Strip Club 7★ (+10% def), Gents Strip Club 7★ (+10% dex).
- **Books** — up to +30% to a single stat for 31 days.
- **Sports Sneakers** — +5% speed gains, if you own a pair.
`,
    related: ['battle-stats', 'happy', 'energy', 'education'],
  });

  push({
    id: 'attack',
    title: 'Attacking',
    cat: 'combat',
    icon: '⚔️',
    wiki: 'Attack',
    tags: ['attack', 'mug', 'hospitalise', 'stealth'],
    summary: 'How a fight resolves: hit chance, damage, escapes, stealth, and the three ways to finish someone.',
    live: 'bars',
    calc: 'weights',
    facts: [
      ['Cost', '25 energy per attack'],
      ['Outcomes', 'Leave, mug, hospitalise'],
      ['XP', 'Leave > mug > hospitalise'],
      ['Timeout', '5 minutes'],
    ],
    body: `
An attack costs 25 energy and resolves as a sequence of rounds. Each round you either hit or miss; the fight ends when
someone's life hits zero, when someone escapes, or after five minutes.

## The rolls

- **Hit chance** — your speed against their dexterity. See [[battle stats|battle-stats]] for the curve.
- **Damage** — your strength (and weapon) against their defense and armour.
- **Dodge** — their dexterity gives them a chance to avoid a hit entirely.
- **Escape** — their dexterity against your speed. High speed pins people in.
- **Stealth** — their dexterity lets them hide the attack from you; your dexterity counteracts it.

{{calc:weights}}

## The three finishes

When you drop someone to zero life you choose:

1. **Leave** — you walk away. This gives the **most experience** (the baseline 100%).
2. **Mug** — you take their cash on hand. About **55–60%** of the leave XP.
3. **Hospitalise** — you send them to hospital. About **40%** of the leave XP, and it makes an enemy.

> Tip: If you are levelling, leave. It is faster XP, it costs you nothing, and the player you just beat is far more
> likely to let you do it again tomorrow than to put a bounty on you.

## Why attacking is the levelling engine

Attacking is one of the few activities that reliably grants experience, and experience is invisible. The loop that
levels accounts fastest is: build an attack list of players you can beat, hit them on cooldown, always leave, and pour
the energy refund into the gym.

## Defending

You do not control a defence directly — your stats, armour and any defensive bonuses do. What you *can* control is
whether you are an attractive target: bank your cash, keep your happy up, and do not sit at zero life if you can help it.
`,
    related: ['battle-stats', 'levels', 'revive', 'hospital'],
  });

  push({
    id: 'weapons',
    title: 'Weapons',
    cat: 'combat',
    icon: '🔫',
    wiki: 'Melee_Weapons',
    tags: ['weapons', 'damage', 'accuracy', 'bonus'],
    summary: 'Melee, primary and secondary weapons: damage types, accuracy, ammo, and why bonus weapons cost a fortune.',
    facts: [
      ['Classes', 'Melee, primary, secondary, temporary'],
      ['Damage types', 'Slashing, piercing, clubbing'],
      ['Bonus tiers', 'Yellow, orange, red'],
      ['Ammo', 'Consumed per fight on some weapons'],
    ],
    body: `
Weapons multiply the damage your strength already produces. They are split into melee, primary and secondary — and each
class has its own damage range, accuracy and ammo behaviour.

## The classes

- **Melee** — knives, bats, katanas, machetes. Cheap, no ammo, and the fast end of the damage curve.
- **Primary** — rifles, machine guns, shotguns. The highest damage in the game, and the reason two evenly-matched
  high-level players can end a fight in seconds.
- **Secondary** — pistols and SMGs. Cheap and quick, with lower ceilings.
- **Temporary** — grenades and bombs. Single use, huge spike damage.

## Damage types

Melee weapons do **slashing**, **piercing** or **clubbing** damage, and armour resists them differently. This is why
the best players carry more than one weapon and switch based on what the other person is wearing — and why company
specials that boost one damage type (like the 10★ Hair Salon's +20% slashing) are build-defining.

## Accuracy and damage numbers

Every weapon has an accuracy and a damage figure, and the item market lets you filter by **exact values**. Serious
buyers do — a 37-accuracy rifle and a 38-accuracy rifle are different weapons at the top end.

## Bonuses

Weapons can roll **bonuses** in three colour tiers: yellow, orange and red. Bonuses add effects — extra damage, extra
accuracy, stealth, life steal, revitalize — and a red-bonus weapon can be worth many times the base item.

> Tip: Weapon damage is only part of the equation. A weapon with the wrong damage type against someone's armour is a
> weapon doing half its listed number.

## Ammo

Some weapons consume ammo per fight. Running dry mid-fight is a real risk on long chains, so check your stack before
you start a war.
`,
    related: ['armor', 'battle-stats', 'attack', 'item-market'],
  });

  push({
    id: 'armor',
    title: 'Armor',
    cat: 'combat',
    icon: '🛡️',
    wiki: 'Armor',
    tags: ['armor', 'sets', 'mitigation'],
    summary: 'How armour reduces incoming damage, why full sets beat mixed pieces, and what the top sets are for.',
    facts: [
      ['Worn as', 'Head, chest, hands, legs, feet'],
      ['Best value', 'Complete sets'],
      ['Interacts with', 'Slashing / piercing / clubbing'],
      ['Marauder set', 'Extra maximum life'],
    ],
    body: `
Armour reduces the damage you take, and it is the cheapest way to survive a stronger opponent. It occupies five slots:
head, chest, hands, legs and feet.

## Sets matter more than pieces

Most armour sets grant a bonus when you wear the whole thing. A full mid-tier set routinely outperforms a mix of
expensive individual pieces, which is why the first armour advice anyone gets is "finish a set".

## Damage types

Armour resists **slashing**, **piercing** and **clubbing** differently. There is no universally best set — there is a
best set against what you are actually being hit with. If your faction is at war with a crowd who all carry katanas,
you want slashing protection.

## Notable sets

- **Marauder** — the endgame set, and it raises your **maximum life** on top of its protection. It is part of how
  players reach the 13,266 life ceiling.
- The mid-tier sets are where most players live for years, and they cost a fraction of the top end.

## Armour versus stats

Defense (the battle stat) and armour (the equipment) do different jobs: defense reduces damage per hit as a
percentage, armour absorbs a flat portion with type-specific resistances. At low stats armour carries you; at high
stats your defense stat dominates, and armour is the tiebreaker.

> Tip: Armour does nothing for you in hospital. If you are going to lose fights, fix the reason before you buy a
> better helmet.
`,
    related: ['weapons', 'battle-stats', 'life', 'attack'],
  });

  push({
    id: 'crimes',
    title: 'Crimes',
    cat: 'combat',
    icon: '🔪',
    wiki: 'Crimes',
    tags: ['crimes', 'nerve', 'crime experience', 'skill'],
    summary: 'Nerve cost, crime skill, crime experience, and why crimes are a daily habit rather than a burst activity.',
    live: 'bars',
    facts: [
      ['Cost', 'Nerve'],
      ['Rewards', 'Cash, items, crime experience'],
      ['Grows', 'Natural nerve bar'],
      ['Failure', 'Jail time'],
    ],
    body: `
Crimes are Torn's PvE progression: spend nerve, get money, items and **crime experience**. Crime experience is the
only thing that grows your **natural nerve bar**, which is why the players with the biggest nerve bars are simply the
players who have never missed a day.

## How it works (Crimes 2.0)

Each crime has a nerve cost and a difficulty. Your **crime skill** (raised by happy, education, merits and faction
perks) determines your success rate. Success pays out and adds crime experience; failure can land you in [[jail]].

Happy matters here too — in Crimes 2.0 happiness increases crime skill and experience gains, not the success rate
directly.

## The natural nerve bar

Every so often your accumulated crime experience tips you over a milestone and your nerve bar grows by **5**. Those
milestones get further apart as you climb, which is exactly why daily crimes beat weekly binges.

## Busting

Busting another player out of jail costs 5 nerve and also raises crime experience — and therefore your natural nerve
bar. Busting *yourself* out costs half your total nerve bar, unless you have completed LAW2990, which reduces it.

> Tip: Crimes 2.0 made specialisations matter. Pick one branch and grind it rather than scattering nerve across
> everything — the higher tiers are where the money is.

## Organised crime

Faction [[organized crime|organized-crime]] is the endgame: it does not consume nerve at all, and the payouts scale
with your crime experience and your faction's coordination. It requires a high natural nerve bar to attempt the best
jobs.
`,
    related: ['nerve', 'jail', 'organized-crime', 'happy'],
  });

  push({
    id: 'jail',
    title: 'Jail & busting',
    cat: 'combat',
    icon: '🚔',
    wiki: 'Jail',
    tags: ['jail', 'bust', 'busting', 'crime experience'],
    summary: 'How you end up in jail, the two ways out, and why busting people is genuinely worth your nerve.',
    facts: [
      ['Bust someone', '5 nerve'],
      ['Bust yourself', 'Half your nerve bar'],
      ['LAW2990', 'Reduces self-bust cost'],
      ['Jail gym', "Crim's — best early defense"],
    ],
    body: `
Failing a crime or being arrested by another player puts you in the city jail. You cannot use most city features from
inside, but you are not dead in the water.

## Getting out

1. **Wait.** Jail time is short compared to hospital time.
2. **Bust yourself.** Costs **half your total nerve bar** — expensive, but instant. LAW2990 reduces the cost, and
   faction Criminality upgrades improve your bust skill by up to 50%.
3. **Get busted.** Ask a faction-mate. It costs *them* 5 nerve, and it costs you nothing.

> Tip: Being busted out is strictly better than busting yourself. Join a faction with people who answer the phone.

## Busting other people

Busting costs **5 nerve** and is one of the better nerve investments in the game:

- It raises your **crime experience**, which grows your natural nerve bar.
- It is how players farm nerve bar growth outside of crimes themselves.
- Your success rate depends on your level, your bust skill, and faction upgrades.

## The jail gym

Jail has its own gym — **Crim's** — with 3.4 / 3.4 / 4.5 dots on strength, speed and defense at 5 energy a train.
That defense figure is better than any lightweight gym, so new players who end up inside should train defense while
they are there. Once you reach Pioneer Fitness (middleweight) the advantage disappears.

Also note: you **cannot** refill your energy bar from the Points Building while in jail, though drugs and energy drinks
still work, and faction armory points can refill you if leadership allows it.
`,
    related: ['crimes', 'nerve', 'gym', 'organized-crime'],
  });

  push({
    id: 'organized-crime',
    title: 'Organised crime',
    cat: 'combat',
    icon: '🕵️',
    wiki: 'Organized_Crime',
    tags: ['OC', 'faction crime', 'endgame'],
    summary: 'The faction crime system: no nerve cost, big payouts, and a hard requirement on crime experience.',
    facts: [
      ['Nerve cost', 'None'],
      ['Requires', 'Faction + crime experience'],
      ['Rewards', 'Cash, items, respect'],
      ['Gated by', 'Natural nerve bar'],
    ],
    body: `
Organised crimes (OCs) are faction-level criminal operations. They are the single biggest change to the crime
ecosystem for established players, because **they do not consume nerve**.

## Why that matters

Nerve is the bottleneck on crimes — you get 288 a day and no more. OCs bypass that entirely, which means the ceiling
on your daily crime income is set by your faction's coordination and your natural nerve bar rather than by your regen
rate.

## Requirements

- You must be in a faction that runs OCs.
- Each OC has a **minimum crime experience / natural nerve bar** to participate.
- The best OCs require very high crime experience, which is a years-long grind — another reason to start crimes on
  day one.

## Rewards

Cash, items and faction respect. At the top end the cash is genuinely competitive with the best money-making methods
in the game, which is why serious crime factions recruit on crime experience rather than battle stats.

> Tip: If you are choosing a faction for OCs, ask what tier they run and what NNB they expect. Joining a faction that
> runs OCs you cannot join is a waste of your time.

## Failure

OCs can fail, and failure can hospitalise participants. Bring medical items.
`,
    related: ['crimes', 'jail', 'factions', 'money'],
  });

  push({
    id: 'revive',
    title: 'Revive',
    cat: 'combat',
    icon: '⛑️',
    wiki: 'Revive',
    tags: ['revive', 'medical job', 'energy cost'],
    summary: 'How reviving works, what it costs the reviver, and the medical rank that unlocks it.',
    facts: [
      ['Base cost', '75 energy'],
      ['Minimum cost', '15 energy'],
      ['Unlocked at', 'Brain surgeon (medical job)'],
      ['Life restored', "Depends on reviver's skill"],
    ],
    body: `
Reviving pulls another player out of hospital and restores a percentage of their life. It is one of the few genuinely
altruistic mechanics in Torn that also pays: revivers earn honors, faction respect, and the gratitude of people who
will return the favour.

## The cost

A revive costs the reviver **75 energy**. Faction upgrades in the **Fortitude** branch cut that by 5 energy per level,
down to a floor of **25 energy**. During the Valentine's event, Love Juice takes a further 10 off, for an absolute
minimum of **15**.

## Unlocking it

You gain the ability to revive by reaching **brain surgeon** in the medical city job. That is a long climb up the
medical ladder — see [[city jobs|jobs]] — which is why revivers are valuable and worth tipping.

## What the patient gets

The life you come back with depends on the **revive skill** of the person reviving you. A skilled reviver in a faction
with Fortitude upgrades is worth far more than a random one.

> Tip: If you are in a faction, ask for a revive before you burn medical items. 75 of someone else's energy is much
> cheaper than your blood bag.

## Reviving in war

In faction wars, revive chains are logistics: the side that can put its attackers back on the street fastest wins the
attrition. This is why war factions recruit medics.
`,
    related: ['hospital', 'jobs', 'factions', 'life'],
  });

  push({
    id: 'factions',
    title: 'Factions',
    cat: 'faction',
    icon: '🏴',
    wiki: 'Factions',
    tags: ['faction', 'upgrades', 'armory', 'respect'],
    summary: 'What a faction gives you — upgrades, armory, wars, organised crime — and how to choose one.',
    live: 'company',
    facts: [
      ['Upgrade branches', 'Fortitude, criminality, intelligence, etc.'],
      ['Armory', 'Shared items and points'],
      ['Wars', 'Ranked, chain, territory'],
      ['Respect', 'Earned by members, spent on upgrades'],
    ],
    body: `
A faction is Torn's team layer. Joining one gives you faction upgrades, access to the armory, organised crime, wars,
and — most importantly — people who will bust you out of jail and revive you from hospital.

## What factions give you

- **Upgrades** across several branches: Fortitude (life, reviving), Criminality (crime and nerve), Steadfast (gym
  gains), and more. Each level in a branch is a permanent bonus to every member.
- **The armory** — shared items, weapons and points, distributed by leadership.
- **Organised crime** — see [[organized crime|organized-crime]].
- **Wars** — ranked, chain and territory, all of which pay out.

## Choosing a faction

Ask three questions:

1. **What tier of OCs do they run, and what NNB do they need?** If you cannot join the OCs, the faction's main benefit
   is unavailable to you.
2. **Are they at war constantly, and do you want that?** War factions pay out and give combat experience, but you will
   be attacked.
3. **Is anyone online when you are?** A faction of ghosts gives you upgrades and nothing else.

## Respect and upgrades

Members earn **respect** by doing things — attacking, criming, reviving, busting — and leadership spends it on
upgrades. The best factions run a clear upgrade plan and tell members what to prioritise.

> Tip: Your faction's Steadfast branch is a straight gym-gains bonus. If you train, that is the branch you should care
> about most.

## Leadership

Directors control the faction bank, the armory, upgrade purchases and war declarations. If you are going to lead, the
job is logistics and diplomacy far more than it is fighting.
`,
    related: ['faction-specials', 'ranked-wars', 'chain-wars', 'territory-wars'],
  });

  push({
    id: 'faction-specials',
    title: 'Faction specials & upgrades',
    cat: 'faction',
    icon: '🌳',
    wiki: 'Factions',
    tags: ['upgrades', 'steadfast', 'fortitude', 'criminality'],
    summary: 'The upgrade branches, what each level actually gives, and which ones change how you play.',
    facts: [
      ['Steadfast', '+1% gym gains per sub-level'],
      ['Fortitude', 'Cheaper revives, more life'],
      ['Criminality', 'Nerve, bust skill'],
      ['Medical', 'Better medical items'],
    ],
    body: `
Faction upgrades are bought with **respect** and apply to every member. There are several branches, and a mature
faction has most of them filled out.

## Steadfast — the gym branch

Each level inside a sub-branch increases that sub-branch's gym trains by **1%**. Strength training VII means +7% to
strength gym gains. It is additive with education, company specials and books, which is why endgame trainers care so
much about which faction they are in.

## Fortitude — the survival branch

- **Reviver** sub-branch: −5 energy per revive level, floor of 25.
- **Life** increases: up to +1,500 maximum life on top of merit upgrades.

## Criminality — the crime branch

- **Nerve** upgrades: +1 maximum nerve each, up to **40**.
- **Bust skill**: up to +50% bust success.
- Crime success and crime experience bonuses.

## Medical

Improves the effectiveness of medical items by up to **30%**, stacking with education's +20% for a total of +50%.
This is what turns a 40-minute first aid kit into a 60-minute one.

## Intelligence and warfare branches

Scouting, war assistance, territory bonuses and chain bonuses. These matter in [[ranked wars|ranked-wars]] and
[[territory wars|territory-wars]] and very little outside them.

> Tip: When you join a faction, look at where their respect is going. A faction sinking everything into warfare
> branches is telling you what it expects you to do.
`,
    related: ['factions', 'gym', 'crimes', 'hospital'],
  });

  push({
    id: 'ranked-wars',
    title: 'Ranked wars',
    cat: 'faction',
    icon: '🥇',
    wiki: 'Ranked_War',
    tags: ['ranked war', 'war', 'rewards'],
    summary: 'The score-based faction war: how points are scored, how matchmaking works, and what winning pays.',
    live: 'bars',
    facts: [
      ['Scored by', 'Points per hit and outcome'],
      ['Length', 'Fixed duration'],
      ['Rewards', 'Points, respect, war chest'],
      ['Matchmaking', 'By faction size and rating'],
    ],
    body: `
Ranked wars are Torn's competitive faction format: two factions fight for a fixed period and the one with the most
points at the bell wins.

## Scoring

Points come from successful attacks on the opposing faction — with bonuses for beating higher-ranked opponents and for
the outcome you choose. Because leaving gives more experience but hospitalising counts in war scoring, ranked wars are
one of the few places where hospitalising is strategically correct.

## Matchmaking

Factions are matched on size and rating, which is why a faction full of heavy hitters will face other heavy hitters.
Stacking your roster with unattackable accounts is a known (and disliked) tactic.

## Rewards

Winning pays points, respect and a war chest that leadership divides. Losing pays much less, and repeated losses can
drop your faction's rating.

## What it asks of you

- Be online at the start and the end.
- Have energy banked and medical items ready.
- Coordinate targets in faction chat — hitting the same person twice is wasted energy.

> Tip: The faction that wins ranked wars is usually the one with the best medical logistics. Being able to put an
> attacker back on the street in ten minutes beats any single big hitter.

## Tools

Third-party war trackers (and this repo's LumberCorp 2.0 Live Wars tab) read the war API and show live scores, target
lists and stat scouting through FF Scouter. Use them — manual scorekeeping loses wars.
`,
    related: ['factions', 'chain-wars', 'territory-wars', 'attack'],
  });

  push({
    id: 'chain-wars',
    title: 'Chains',
    cat: 'faction',
    icon: '⛓️',
    wiki: 'Chain',
    tags: ['chain', 'bonus', 'hits'],
    summary: 'How the chain counter works, why the bonus is worth chasing, and what breaks a chain.',
    live: 'bars',
    facts: [
      ['Bonus tiers', 'Every 10 hits to 100'],
      ['Timer', '5 minutes between hits'],
      ['Shared', 'Faction-wide'],
      ['Breaks on', 'Timeout or a loss'],
    ],
    body: `
A chain is a counter of consecutive successful attacks by your faction. Every 10 hits grants a bonus, the bonuses grow
all the way to 100, and the counter is **faction-wide** — everyone contributes and everyone benefits.

## The rules

- Hits must land within **5 minutes** of each other or the chain lapses.
- Only **successful** attacks count.
- Losses and timeouts break it.

## Why it matters

The chain bonus is a straight multiplier on the rewards of attacking — and at high tiers it is one of the best
income-per-energy activities in the game. A faction that can hold a 100 chain is earning serious money for every
member.

## How factions hold one

1. **A roster of people online at overlapping hours** — the chain dies when nobody is awake.
2. **A target list** that is always attackable.
3. **Fast medicals and revives**, so a chain member who gets hospitalised is back in minutes.
4. **Discipline**: do not start an attack you might lose when the chain is at 90.

> Tip: If the chain is about to lapse and you have 25 energy, hit *anything* you can beat. A weak hit that lands keeps
> the multiplier alive for everyone.

## Chain wars

Some factions run "chain wars" — coordinated periods where the whole roster attacks continuously to push the counter
as high as it will go. They are exhausting and extremely profitable.
`,
    related: ['factions', 'ranked-wars', 'attack', 'revive'],
  });

  push({
    id: 'territory-wars',
    title: 'Territory wars',
    cat: 'faction',
    icon: '🗺️',
    wiki: 'Territory_Wars',
    tags: ['territory', 'map', 'rewards'],
    summary: 'The map-based faction war: how territories are taken, held, and what they pay.',
    facts: [
      ['Format', 'Map control'],
      ['Rewards', 'Respect, cash, bonuses'],
      ['Requires', 'Organisation', 'Time zones'],
    ],
    body: `
Territory wars are the strategic layer of faction conflict: instead of a scoreboard, you fight over map sectors.

## How it works

Factions contest territories on a map, attacking to take and hold ground. Holding a territory pays out over time, and
the payout scales with how desirable the territory is. Larger factions can hold more, but holding more means defending
more.

## Why factions bother

- **Income** — territories pay respect and cash.
- **Prestige** and map presence.
- **Bonuses** applied to members while territories are held.

## What it takes

Territory wars reward organisation more than strength: you need people online in every time zone, a plan for which
territories to contest, and the discipline to defend rather than over-extend.

> Tip: Take territory you can actually hold. Over-extending in a territory war is how a faction loses everything it
> gained in a week.
`,
    related: ['factions', 'ranked-wars', 'chain-wars'],
  });
})(window);
