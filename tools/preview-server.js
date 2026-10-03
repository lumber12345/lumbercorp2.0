/* tools/preview-server.js — zero-dependency static server for the Lumbercorpedia PWA.
 *
 * Serves lumbercorpedia/ and proxies the two upstreams the app talks to:
 *   /api/wiki  -> wiki.torn.com/api.php   (MediaWiki — live wiki search & pages)
 *   /api/torn  -> api.torn.com            (Torn API, key passed through by the client)
 *
 * Both are optional at runtime: without them Lumbercorpedia still works, it just
 * falls back to the bundled library. This exists so the app can be previewed
 * and developed locally with the live features switched on.
 *
 * Usage:  node tools/preview-server.js [port]
 */
'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const ROOT = path.join(__dirname, '..', 'lumbercorpedia');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    'access-control-allow-origin': '*',
    'cache-control': 'no-cache',
  }, headers || {}));
  res.end(body);
}

/* ---------------------------------------------------------------- upstream */
function proxy(req, res, host, pathname) {
  const options = {
    hostname: host,
    path: pathname,
    method: 'GET',
    headers: { accept: 'application/json', 'user-agent': 'Lumbercorpedia/1.0 (unofficial fan wiki)' },
    timeout: 15000,
  };
  const r = https.request(options, (up) => {
    const chunks = [];
    up.on('data', (c) => chunks.push(c));
    up.on('end', () => send(res, up.statusCode || 502, Buffer.concat(chunks), {
      'content-type': (up.headers['content-type'] || 'application/json'),
    }));
  });
  r.on('timeout', () => r.destroy(new Error('upstream timeout')));
  r.on('error', (e) => send(res, 502, JSON.stringify({ error: { error: host + ' unreachable: ' + e.message } }),
    { 'content-type': 'application/json' }));
  r.end();
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const p = decodeURIComponent(u.pathname);

  if (p === '/api/wiki') {
    const qs = u.searchParams.toString();
    return proxy(req, res, 'wiki.torn.com', '/api.php?' + (qs ? qs + '&' : '') + 'format=json');
  }
  if (p === '/api/torn') {
    const sel = u.searchParams.get('selections') || '';
    const key = u.searchParams.get('key') || '';
    const entity = (u.searchParams.get('path') || '/user/').replace(/^\/+|\/+$/g, '');
    const qs = new URLSearchParams({ selections: sel, key, comment: 'lumbercorpedia' }).toString();
    return proxy(req, res, 'api.torn.com', '/' + entity + '/?' + qs);
  }
  if (p === '/api/ping') return send(res, 200, JSON.stringify({ ok: true, ts: Date.now() }), { 'content-type': 'application/json' });

  // static
  let file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT)) return send(res, 403, 'forbidden');
  fs.stat(file, (err, st) => {
    if (err || st.isDirectory()) file = path.join(ROOT, 'index.html');   // SPA fallback
    fs.readFile(file, (err2, buf) => {
      if (err2) return send(res, 404, 'not found');
      send(res, 200, buf, {
        'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
        'cache-control': path.extname(file) === '.html' || file.endsWith('sw.js') ? 'no-cache' : 'public, max-age=300',
      });
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[lumbercorpedia] http://0.0.0.0:' + PORT + '  serving ' + ROOT);
  console.log('[lumbercorpedia] /api/wiki -> wiki.torn.com   /api/torn -> api.torn.com');
});
