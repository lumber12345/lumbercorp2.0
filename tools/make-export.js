/* tools/make-export.js — build a ready-to-push standalone Lumbercorpedia export.
 *
 * Produces, in ../Lumbercorpedia-export (a sibling of this repo, so it never
 * gets committed here):
 *   Lumbercorpedia-main.bundle  git bundle of the filtered history, branch main
 *   Lumbercorpedia-app.zip      same tree without history
 *   push.sh                     one command: clone the bundle and push it
 *   HOW-TO-PUSH.md              every option, explained
 *
 * Then verifies the bundle by cloning it and running the check suite inside it.
 *
 * Usage:  node tools/make-export.js
 */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = path.join(__dirname, '..');
const OUT = path.join(REPO, '..', 'Lumbercorpedia-export');
const TARGET = 'lumber12345/Lumbercorpedia';
const TMP = path.join(os.tmpdir(), 'lumbercorpedia-export-work');

function run(cmd, opts) {
  const out = execSync(cmd, Object.assign({ encoding: 'utf8', cwd: REPO, maxBuffer: 1 << 28 }, opts || {}));
  return out == null ? '' : out.toString();
}
const runTrim = (cmd, opts) => run(cmd, opts).trim();
const runIn = (dir, cmd, opts) => {
  const out = execSync(cmd, Object.assign({ encoding: 'utf8', cwd: dir, maxBuffer: 1 << 28 }, opts || {}));
  return out == null ? '' : out.toString().trim();
};

/* 1 — the app-only history */
const filterOut = run('node tools/filter-for-export.js 2>/dev/null');
const sha = (filterOut.match(/RESULT_SHA=([0-9a-f]+)/) || [])[1];
if (!sha) { console.error('filter-for-export produced no commit'); process.exit(1); }
const fileCount = (filterOut.match(/FILES=(\d+)/) || [])[1];
console.log(`filtered commit ${sha} (${fileCount} files)`);

/* 2 — bundle it from a throwaway clone (no branch is created in this repo) */
fs.rmSync(TMP, { recursive: true, force: true });
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

run(`git tag -f lc-export ${sha}`, { stdio: 'ignore' });
run(`git clone -q --no-local ${REPO} ${TMP}`, { stdio: 'ignore' });
runIn(TMP, 'git checkout -q -b main lc-export');
const commitCount = runIn(TMP, 'git rev-list --count main');
runIn(TMP, 'git symbolic-ref HEAD refs/heads/main');
runIn(TMP, `git bundle create ${path.join(OUT, 'Lumbercorpedia-main.bundle')} main HEAD`, { stdio: 'ignore' });
runIn(TMP, `git archive --format=zip --prefix=Lumbercorpedia/ main -o ${path.join(OUT, 'Lumbercorpedia-app.zip')}`, { stdio: 'ignore' });
runIn(TMP, `git archive --format=zip main -o ${path.join(OUT, 'Lumbercorpedia-render.zip')}`, { stdio: 'ignore' });
run('git tag -d lc-export', { stdio: 'ignore' });

/* 3 — instructions */
const pushSh = `#!/usr/bin/env bash
# Publish Lumbercorpedia to GitHub. Run this on your own machine, where your
# GitHub credentials work. It uses the bundle in this folder, so the commit
# history (${commitCount} commits, authored dates preserved) comes across intact.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf Lumbercorpedia
git clone Lumbercorpedia-main.bundle Lumbercorpedia
cd Lumbercorpedia
git remote add origin https://github.com/${TARGET}.git \\
  || git remote set-url origin https://github.com/${TARGET}.git
git branch -M main
git push -u origin main
echo "pushed: https://github.com/${TARGET}/tree/main"
`;
fs.writeFileSync(path.join(OUT, 'push.sh'), pushSh, { mode: 0o755 });

const md = `# Getting Lumbercorpedia onto GitHub

Target repo: **https://github.com/${TARGET}** (public, currently empty)

The workspace this was built in cannot write to it. Both credentials available
there are GitHub App tokens scoped to *lumbercorp2.0*; git-over-HTTPS answers
\`403 Permission to ${TARGET}.git denied\`, the Git Data API answers
\`403 Resource not accessible by integration\`, and there is no SSH key or
outbound SSH. Everything below runs on **your** machine instead.

## Contents

| File | What |
| --- | --- |
| \`Lumbercorpedia-main.bundle\` | ${commitCount} commits, branch \`main\`, app files at repo root |
| \`Lumbercorpedia-render.zip\` | Same files at the zip root, plus \`render.yaml\` |
| \`Lumbercorpedia-app.zip\` | Same tree, no history |
| \`push.sh\` | Does the whole job in one command |
| \`HOW-TO-PUSH.md\` | This file |

Filtered commit: \`${sha}\`
History contains only the wiki app (\`lumbercorpedia/**\` moved to the root) plus
\`tools/\` — no LumberCorp 2.0 PDA, no proxy, no \`lumbercorp2-render.zip\`.

## Option A — one command

\`\`\`bash
cd Lumbercorpedia-export && ./push.sh
\`\`\`

## Option B — the commands by hand

\`\`\`bash
git clone Lumbercorpedia-main.bundle Lumbercorpedia
cd Lumbercorpedia
git remote add origin https://github.com/${TARGET}.git
git branch -M main
git push -u origin main
\`\`\`

## Option C — from an existing lumbercorp2.0 checkout

\`\`\`bash
git remote add lumbercorpedia https://github.com/${TARGET}.git
git push lumbercorpedia ${sha}:main
\`\`\`

## Option D — zip only (no history)

\`\`\`bash
unzip Lumbercorpedia-app.zip && cd Lumbercorpedia
git init -b main && git add -A
git commit -m "Add Lumbercorpedia: offline-first Torn City wiki PWA"
git remote add origin https://github.com/${TARGET}.git
git push -u origin main
\`\`\`

## After the push

- **Deploy on Render**: \`render.yaml\` ships in the repo root, so
  *New -> Blueprint* and picking this repo is the whole setup. See
  \`RENDER.md\` (in this folder) for the manual path and the optional API relay.

- **Local preview**: \`node tools/preview-server.js 4173\`
- **Tests**: \`node tools/check.js\`
- **\`tools/build-datasets.js\`** regenerates \`data/datasets.js\` from the
  LumberCorp 2.0 PDA, which is *not* in this export. Run it from inside your
  \`lumbercorp2.0\` checkout, or copy \`lumbercorp-2/index.html\` beside the
  script — it now says so instead of crashing cryptically.

## If you'd rather I push it

Reconnect GitHub in Arena and grant the app access to **Lumbercorpedia**, then
ask me to retry — commit \`${sha}\` is ready to go.
`;
fs.writeFileSync(path.join(OUT, 'HOW-TO-PUSH.md'), md);
fs.writeFileSync(path.join(OUT, 'RENDER.md'), '# Deploying Lumbercorpedia on Render\n\n`Lumbercorpedia-render.zip` unpacks the deployable tree with the files at the\nroot: everything in the git bundle, plus `render.yaml`.\n\n## Option 1 — blueprint (recommended)\n\n1. Push the bundle to GitHub (`./push.sh` in this folder).\n2. Render dashboard -> **New** -> **Blueprint** -> connect `lumber12345/Lumbercorpedia`.\n3. Render reads `render.yaml` and offers one static site. Accept and deploy.\n4. You get `https://lumbercorpedia.onrender.com`.\n\n## Option 2 — from this zip\n\n```bash\nunzip Lumbercorpedia-render.zip -d Lumbercorpedia && cd Lumbercorpedia\ngit init -b main && git add -A\ngit commit -m "Add Lumbercorpedia: offline-first Torn City wiki PWA"\ngit remote add origin https://github.com/lumber12345/Lumbercorpedia.git\ngit push -u origin main\n```\n\nThen Blueprint -> that repo, or create a static site by hand:\nruntime **static**, build command `rm -rf tools`, publish path `.`.\n\n## What the blueprint sets\n\n| Setting | Why |\n| --- | --- |\n| `runtime: static`, `staticPublishPath: .` | No build step; the app is plain HTML/CSS/JS |\n| `buildCommand: rm -rf tools` | Render requires a build command for static sites; this also keeps `tools/` off the CDN |\n| `Cache-Control: no-cache` on `/sw.js` | Otherwise returning visitors can be pinned to a stale service worker |\n| No rewrite rules | The router is hash based (`#/a/gym`), so `/` is the only path ever requested |\n\n## Live wiki search\n\n`wiki.torn.com` sends no CORS headers, so a browser on a static host cannot call\nit directly — anything not in the bundled library just falls back gracefully.\nTo make live lookup work for everyone, uncomment the `lumbercorpedia-api`\nservice in `render.yaml`: it runs `tools/preview-server.js`, which relays\n`/api/wiki` and `/api/torn`. Then either paste its URL into\n**Live data -> Proxy** in the app (saved per browser), or change `proxy: \'\'` in\nthe `defaults` object in `app.js` to bake it in for all visitors.\n\n## Checking a deploy\n\n- `/` loads, search responds instantly, an article renders offline\n- `/sw.js` returns `Cache-Control: no-cache`\n- DevTools -> Application -> Service Workers shows `lumbercorpedia-v1` activated\n');

/* 4 — verify the bundle really works */
const check = path.join(TMP, 'bundle-check');
fs.rmSync(check, { recursive: true, force: true });
execSync(`git clone -q ${path.join(OUT, 'Lumbercorpedia-main.bundle')} ${check}`, { encoding: 'utf8' });
const branch = runIn(check, 'git branch --show-current');
const commits = runIn(check, 'git rev-list --count HEAD');
const suite = runIn(check, 'node tools/check.js 2>&1 | tail -1');

console.log(`\nbundle: ${branch} · ${commits} commits · ${suite}`);
console.log(`\n${OUT}`);
fs.readdirSync(OUT).forEach((f) => {
  console.log(`  ${f.padEnd(32)} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`);
});
fs.rmSync(TMP, { recursive: true, force: true });
