/* tools/filter-for-export.js — build an app-only history for the standalone
 * Lumbercorpedia repo.
 *
 * Rewrites the current branch into detached commits whose trees contain only
 *   lumbercorpedia/**  -> repo root      (torn-wiki/** before the rename)
 *   tools/**           -> tools/
 * Commits that touch neither are dropped (so the pre-app LumberCorp history
 * falls away), and author/committer names, dates and messages are preserved.
 *
 * No branch is created — the result is a detached commit you can push directly:
 *
 *   node tools/filter-for-export.js
 *   git push lumbercorpedia <sha>:main
 *
 * (git-filter-repo would do this in one line, but it is not installed here and
 *  there is no network to fetch it.)
 */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const TMP_INDEX = path.join(require('os').tmpdir(), 'lumbercorpedia-filter-index');

function run(cmd, opts) {
  return execSync(cmd, Object.assign({ encoding: 'utf8', cwd: REPO, maxBuffer: 1 << 28 }, opts || {})).toString();
}
const runTrim = (cmd, opts) => run(cmd, opts).trim();

function hasPath(commit, p) {
  try { run(`git cat-file -e ${commit}:${p}`); return true; } catch (e) { return false; }
}
function listTree(commit, prefix, dest) {
  const out = run(`git ls-tree -r -z ${commit}:${prefix}`);
  const entries = [];
  out.split('\0').forEach((rec) => {
    if (!rec) return;
    const [meta, filePath] = rec.split('\t');
    const [mode, , sha] = meta.split(' ');
    entries.push({ mode, sha, path: dest + filePath });
  });
  return entries;
}

const revs = runTrim('git rev-list --reverse --topo-order HEAD').split('\n').filter(Boolean);
const map = {};                     // old sha -> new sha | null
const indexEnv = Object.assign({}, process.env, { GIT_INDEX_FILE: TMP_INDEX });
let kept = 0, dropped = 0;

for (const c of revs) {
  let entries = [];
  if (hasPath(c, 'lumbercorpedia')) entries = entries.concat(listTree(c, 'lumbercorpedia', ''));
  if (hasPath(c, 'torn-wiki')) entries = entries.concat(listTree(c, 'torn-wiki', ''));
  if (hasPath(c, 'tools')) entries = entries.concat(listTree(c, 'tools', 'tools/'));
  if (!entries.length) { map[c] = null; dropped++; continue; }

  try { fs.unlinkSync(TMP_INDEX); } catch (e) { /* first pass */ }
  run('git read-tree --empty', { env: indexEnv });
  run('git update-index --index-info', {
    env: indexEnv,
    input: entries.map((e) => `${e.mode} ${e.sha}\t${e.path}`).join('\n') + '\n',
  });
  const tree = runTrim('git write-tree', { env: indexEnv });

  const parents = runTrim(`git rev-list --parents -n1 ${c}`).split(' ').slice(1)
    .map((p) => map[p]).filter(Boolean);
  const args = parents.map((p) => `-p ${p}`).join(' ');

  const [an, ae, ad, cn, ce, cd, ...msgParts] =
    runTrim(`git log -1 --format=%an%x00%ae%x00%aD%x00%cn%x00%ce%x00%cD%x00%B ${c}`).split('\0');

  const sha = runTrim(`git commit-tree ${tree} ${args}`, {
    env: Object.assign({}, process.env, {
      GIT_AUTHOR_NAME: an, GIT_AUTHOR_EMAIL: ae, GIT_AUTHOR_DATE: ad,
      GIT_COMMITTER_NAME: cn, GIT_COMMITTER_EMAIL: ce, GIT_COMMITTER_DATE: cd,
    }),
    input: msgParts.join('\0'),
  });
  map[c] = sha;
  kept++;
  console.log(`  ${sha.slice(0, 7)}  ${runTrim(`git log -1 --format=%s ${c}`).slice(0, 62)}`);
}

const result = map[runTrim('git rev-parse HEAD')];
if (!result) { console.error('nothing to export — no commit touches lumbercorpedia/ or tools/'); process.exit(1); }

console.log(`\nkept ${kept} commit(s), dropped ${dropped}`);
console.log('RESULT_SHA=' + result);
console.log('FILES=' + runTrim(`git ls-tree -r --name-only ${result}`).split('\n').length);
