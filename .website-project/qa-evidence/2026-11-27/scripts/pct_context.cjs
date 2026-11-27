/* For each percentage flagged by validate.py: URL, visible context, and whether a sample/source label sits nearby.
   Usage: node pct_context.cjs <repoDir> <validate.txt> <out.json> */
const fs = require('fs'), path = require('path');
const [DIR, VT, OUT] = process.argv.slice(2);
const routes = JSON.parse(fs.readFileSync(path.join(DIR, 'vercel.json'), 'utf8')).rewrites;
const flags = []; let file = null;
for (const l of fs.readFileSync(VT, 'utf8').split('\n')) {
  const m = /^FAIL (\S+)/.exec(l); if (m) file = m[1];
  const p = /percentage:.*'([^']+)'/.exec(l); if (p && file) flags.push({ file, value: p[1] });
}
const text = s => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&rarr;/g, '→').replace(/&middot;/g, '·').replace(/&rsquo;/g, '’').replace(/\s+/g, ' ').trim();
const out = []; const seen = {};
for (const f of flags) {
  const key = f.file + '|' + f.value; seen[key] = (seen[key] || 0) + 1;
  const html = fs.readFileSync(path.join(DIR, f.file), 'utf8');
  const body = html.replace(/<head[\s\S]*?<\/head>/i, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const esc = f.value.replace(/[.%]/g, m => '\\' + m);
  const re = new RegExp('(?<![\\d.])' + esc, 'g');
  let mm, i = 0, hit = null;
  while ((mm = re.exec(body))) { i++; if (i === seen[key]) { hit = mm.index; break; } }
  let ctx = '(not in visible body: attribute or head)', label = '';
  if (hit !== null) {
    const before = text(body.slice(Math.max(0, hit - 600), hit)), after = text(body.slice(hit, hit + 300));
    ctx = '…' + before.slice(-170) + ' [[' + f.value + ']]' + after.slice(f.value.length, 150) + '…';
    const win = body.slice(Math.max(0, hit - 2500), hit + 800);
    const lab = win.match(/(sample data|sample|illustrative|example|mock-?up|source:|industry average|according to|benchmark|survey)/i);
    label = lab ? lab[1] : 'none nearby';
  }
  const r = routes.find(x => x.destination === '/' + f.file);
  out.push({ url: 'https://krivatechnologies.com' + (r ? r.source : '?'), file: f.file, value: f.value, label, context: ctx });
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
out.forEach((o, n) => console.log((n + 1) + '. ' + o.url.replace('https://krivatechnologies.com', '') + '  [' + o.value + ']  label: ' + o.label + '\n   ' + o.context.slice(0, 330)));
