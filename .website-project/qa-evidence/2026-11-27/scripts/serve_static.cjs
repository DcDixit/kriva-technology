/* Minimal static server applying vercel.json rewrites (exact and :param).
   Usage: node serve_static.cjs <root> <vercel.json> <port>
   Point <root> at a `vercel build` output (.vercel/output/static) so .vercelignore is honoured. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const [ROOT, VJ, PORT] = process.argv.slice(2);
const v = JSON.parse(fs.readFileSync(VJ, 'utf8'));
const exact = new Map();
const patterns = [];
for (const r of v.rewrites || []) {
  if (/[:(*]/.test(r.source)) {
    const keys = [];
    const re = new RegExp('^' + r.source.replace(/:(\w+)\*/g, (_, k) => { keys.push(k); return '(.*)'; }).replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    patterns.push({ re, keys, dest: r.destination });
  } else exact.set(r.source, r.destination);
}
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (exact.has(p)) p = exact.get(p);
  else for (const pt of patterns) { const m = pt.re.exec(p); if (m) { let d = pt.dest; pt.keys.forEach((k, i) => { d = d.replace(new RegExp(':' + k + '\\*?'), m[i + 1]); }); p = d; break; } }
  const f = path.join(ROOT, p);
  if (!f.startsWith(path.resolve(ROOT)) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': T[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(+PORT, () => console.log('serving', ROOT, 'on', PORT));
