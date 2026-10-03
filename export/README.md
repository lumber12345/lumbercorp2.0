# Lumbercorpedia export

`Lumbercorpedia-main.bundle` is a git bundle holding the standalone
Lumbercorpedia history: branch `main`, 5 commits, the wiki app at the repo root
plus `tools/`. The LumberCorp 2.0 PDA, the proxy and the render zip are not in it.

The sandbox this was built in cannot write to
`https://github.com/lumber12345/Lumbercorpedia.git` — its credential is a GitHub
App token minted for `lumbercorp2.0` only. Everywhere else writes fine, so the
push has to happen from a machine that is authorised for Lumbercorpedia.

## Push it (4 commands, from any lumbercorp2.0 checkout)

```bash
git fetch origin arena/01a0fed4-lumbercorp2-0
git checkout origin/arena/01a0fed4-lumbercorp2-0 -- export/Lumbercorpedia-main.bundle
git fetch export/Lumbercorpedia-main.bundle main
git push https://github.com/lumber12345/Lumbercorpedia.git FETCH_HEAD:main
```

Then open <https://github.com/lumber12345/Lumbercorpedia> — 5 commits, app at the
root, history preserved.

## Or rebuild it yourself

Deterministic: you will get the same commit SHA `b0be18d6697b1a24bdf1510b15eaec2a2a2671b9`.

```bash
git checkout arena/01a0fed4-lumbercorp2-0
node tools/make-export.js        # writes ../Lumbercorpedia-export
cd ../Lumbercorpedia-export && ./push.sh
```

`tools/filter-for-export.js` does the rewrite (`lumbercorpedia/**` to the repo
root, `tools/**` kept, unrelated commits dropped, authorship and dates intact).
`tools/make-export.js` wraps it: bundle, zip, `push.sh`, instructions, then
verifies by cloning the bundle and running `node tools/check.js` inside it.

## Deployment once it is up

Static site, no build step, publish the repo root. Give `sw.js` a
`Cache-Control: no-cache` header so updates reach returning visitors.
