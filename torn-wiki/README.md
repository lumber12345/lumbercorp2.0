# Tornpedia

An offline-first Torn City wiki: instant fuzzy search, a curated article library,
live Torn API widgets, calculators, and live lookup against wiki.torn.com for
anything that is not bundled.

It is a **static PWA** — plain HTML, CSS and JS, no build step, no framework, no
dependencies, no server-side secrets.

## Run it

```bash
node ../tools/preview-server.js 4173     # from the repo root
# or any static server:
python3 -m http.server 8000
```

The preview server also proxies the two upstreams the app can use
(`/api/wiki` → wiki.torn.com, `/api/torn` → api.torn.com). Without it the app
still works fully — the bundled library needs no network, and the browser talks
to both upstreams directly where CORS allows.

## File map

| File | What |
| --- | --- |
| `index.html` | app shell (sidebar, topbar, command palette) |
| `styles.css` | the whole design system — dark/light, mobile-first |
| `app.js` | router, search engine, markdown renderer, live API, offline store |
| `data/datasets.js` | **generated** — NPC loot, jobs, companies, travel, gyms, tables |
| `data/calcs.js` | calculator definitions (pure functions, no DOM) |
| `data/articles-*.js` | the bundled library, four files by subject |
| `sw.js` / `manifest.webmanifest` | offline shell + installability |
| `icons/` | PWA icons |

## Tests

```bash
node ../tools/check.js
```

Verifies: unique article ids, every internal `[[link]]` resolves, every
`{{table:}}` and `{{calc:}}` reference exists, all 53 articles render without
`undefined`/`NaN`, every calculator survives defaults and zeroed inputs, and
search ranks obvious queries first.

## Regenerating the datasets

`data/datasets.js` is generated from the verified tables inside
`lumbercorp-2/index.html` (the LumberCorp 2.0 PDA) plus reference tables checked
against the official wiki:

```bash
node ../tools/build-datasets.js
```

Do not hand-edit `datasets.js` — edit the generator and re-run.

## Adding an article

Push an object onto `window.TW_ARTICLES` in one of the `data/articles-*.js` files:

```js
push({
  id: 'energy',              // url: #/a/energy
  title: 'Energy',
  cat: 'core',               // core | combat | work | items | travel | faction | strategy | reference
  icon: '⚡',
  wiki: 'Energy',            // matching page on wiki.torn.com
  tags: ['bars', 'regen'],
  summary: 'One line, used in cards and search results.',
  live: 'bars',              // optional live widget: bars|travel|gym|job|money|company
  calc: 'energy',            // optional calculator id
  facts: [['Max', '150'], ['Regen', '5 per 10 min']],
  body: `...`,               // see the markup notes below
  related: ['happy', 'nerve'],
});
```

### Body markup

| Syntax | Renders |
| --- | --- |
| `## Heading` / `### Sub` | heading (level 2 headings build the table of contents) |
| `- item` / `1. item` | bullet / ordered list |
| `**bold**` / `*italic*` / `~~code~~` | inline formatting |
| `[[Label\|article-id]]` | internal link (also resolves calculator ids) |
| `[text](https://…)` | external link |
| `> Tip: …` / `> Warn: …` / `> Math: …` | callout (also Note, Bad, Formula) |
| `\| a \| b \|` + `\|---\|---\|` | table |
| `{{table:gyms}}` | a generated dataset table (`gyms`, `jobs`, `companies`, `npcs`, `npcLoot`, `travel`, `abroadItems`, `properties`, `levelUnlocks`, `medical`, `energyItems`, `statWeights`, `specialGyms`) |
| `{{calc:gym}}` | an embedded calculator |
| `{{live:bars}}` | an embedded live-data widget |
| `---` | horizontal rule |

Bodies are JS template literals, so **no backticks and no `${`** inside them —
use `~~code~~` for inline code and the `> Math:` callout for formulas.

## Live data

Optional. The visitor pastes a **Minimal-access** Torn API key on the
`#/live` page; it is stored in that browser's `localStorage` and sent only to
`api.torn.com` (directly, or through a proxy if one is configured). Nothing is
logged server-side. No key, no problem — every article stands on its own.

## Sources & honesty

Mechanics were checked against [wiki.torn.com](https://wiki.torn.com/); dataset
tables were ported from this repo's LumberCorp 2.0 PDA. Where the community only
has an *estimate* — most importantly the gym gains formula — Tornpedia says so
and shows Torn's own published figures alongside it.

An unofficial fan project. Not affiliated with Torn City or Eugenius Ltd.
