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
runIn(TMP, 'git symbolic-ref HEAD refs/heads/main');
runIn(TMP, `git bundle create ${path.join(OUT, 'Lumbercorpedia-main.bundle')} main HEAD`, { stdio: 'ignore' });
runIn(TMP, `git archive --format=zip --prefix=Lumbercorpedia/ main -o ${path.join(OUT, 'Lumbercorpedia-app.zip')}`, { stdio: 'ignore' });
run('git tag -d lc-export', { stdio: 'ignore' });

/* 3 — instructions */
const pushSh = `#!/usr/bin/env bash
# Publish Lumbercorpedia to GitHub. Run this on your own machine, where your
# GitHub credentials work. It uses the bundle in this folder, so the commit
# history (4 commits, authored dates preserved) comes across intact.
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
| \`Lumbercorpedia-main.bundle\` | 4 commits, branch \`main\`, app files at repo root |
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

- **Deploy**: static site, no build command, publish the repo root. A Render
  blueprint would be:

  \`\`\`yaml
  services:
    - type: web
      name: lumbercorpedia
      runtime: static
      buildCommand: ""
      staticPublishPath: .
      headers:
        - path: /sw.js
          name: Cache-Control
          value: no-cache
  \`\`\`

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
