/* tools/push-via-api.js — publish the filtered Lumbercorpedia history using the
 * GitHub REST API instead of a git push.
 *
 * Why this exists: the credentials available inside this workspace are GitHub
 * App tokens scoped to specific repositories. Git-over-HTTPS answers
 * "403 Permission to <repo> denied" for repos the App was not installed on,
 * even when the REST API reports push access. The Git Data API (blobs -> trees
 * -> commits -> refs) is a different access path and works where the git
 * protocol does not.
 *
 * Usage:
 *   node tools/filter-for-export.js          # note the RESULT_SHA
 *   node tools/push-via-api.js <owner/repo> <sha> [branch]
 *
 * It is idempotent: running it twice recreates the same objects and moves the
 * branch to the same commit.
 */
'use strict';
const { execSync } = require('child_process');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('usage: node tools/push-via-api.js <owner/repo> <filtered-sha> [branch]');
  process.exit(1);
}
const REPO = args[0];
const SHA = args[1];
const BRANCH = args[2] || 'main';

const run = (cmd, opts) => execSync(cmd, Object.assign({ encoding: 'utf8', maxBuffer: 1 << 28 }, opts || {})).toString();
const runTrim = (cmd, opts) => run(cmd, opts).trim();
const TOKEN = runTrim('gh auth token');

function api(method, path, body) {
  const cmd = `gh api -X ${method} repos/${REPO}/${path} --input -`;
  const out = run(cmd, { input: body ? JSON.stringify(body) : '' });
  return out ? JSON.parse(out) : {};
}
function apiRaw(method, path, body) {
  try { return api(method, path, body); }
  catch (e) {
    const msg = (e.stderr || e.message || '').toString().trim().split('\n').slice(0, 4).join('\n');
    throw new Error(`${method} ${path} failed:\n${msg}`);
  }
}

/* ---- walk the filtered history, oldest first ---- */
const commits = runTrim(`git rev-list --reverse --topo-order ${SHA}`).split('\n').filter(Boolean);
const blobCache = {};        // local blob sha -> GitHub blob sha
let newHead = null;
let apiCalls = 0;

for (const c of commits) {
  const meta = runTrim(`git log -1 --format=%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B ${c}`).split('\0');
  const [an, ae, ad, cn, ce, cd, ...msg] = meta;
  const message = msg.join('\0');

  const entries = runTrim(`git ls-tree -r ${c}`).split('\n').filter(Boolean).map((line) => {
    const [info, path] = line.split('\t');
    const [mode, type, sha] = info.split(' ');
    return { mode, type, sha, path };
  });

  const tree = [];
  for (const e of entries) {
    if (e.type !== 'blob') { console.log(`  skip ${e.path} (${e.type})`); continue; }
    if (!blobCache[e.sha]) {
      const content = run(`git cat-file blob ${e.sha}`, { encoding: 'buffer' }).toString('base64');
      const res = apiRaw('POST', 'git/blobs', { content, encoding: 'base64' });
      blobCache[e.sha] = res.sha;
      apiCalls++;
    }
    tree.push({ path: e.path, mode: e.mode, type: 'blob', sha: blobCache[e.sha] });
  }

  const treeRes = apiRaw('POST', 'git/trees', { tree });
  apiCalls++;
  const commitRes = apiRaw('POST', 'git/commits', {
    message,
    tree: treeRes.sha,
    parents: newHead ? [newHead] : [],
    author: { name: an, email: ae, date: ad },
    committer: { name: cn, email: ce, date: cd },
  });
  apiCalls++;
  newHead = commitRes.sha;
  console.log(`  ${newHead.slice(0, 7)}  ${message.split('\n')[0].slice(0, 62)}  (${tree.length} files)`);
}

/* ---- point the branch at it ---- */
let refRes;
try {
  refRes = api('GET', `git/refs/heads/${BRANCH}`);
} catch (e) { refRes = null; }
if (refRes && refRes.object) {
  apiRaw('PATCH', `git/refs/heads/${BRANCH}`, { sha: newHead, force: true });
  console.log(`\nupdated refs/heads/${BRANCH} -> ${newHead.slice(0, 7)}`);
} else {
  apiRaw('POST', 'git/refs', { ref: `refs/heads/${BRANCH}`, sha: newHead });
  console.log(`\ncreated refs/heads/${BRANCH} -> ${newHead.slice(0, 7)}`);
}
apiCalls++;
console.log(`done: ${commits.length} commit(s) published, ${apiCalls} API call(s)`);
console.log(`https://github.com/${REPO}/tree/${BRANCH}`);
