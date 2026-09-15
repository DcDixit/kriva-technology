const fs = require('fs');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const urlToFile = new Map();
for (const r of vercel.rewrites)
  if (r.destination.endsWith('.html')) urlToFile.set(r.source, r.destination.replace(/^\//, ''));
const fileToUrl = new Map([...urlToFile].map(([u, f]) => [f, u]));
const valid = new Set(urlToFile.keys());

// strip the shared chrome (header nav, mobile sheet, footer, CTA band) so only
// editorial in-body links remain
const stripChrome = (h) => {
  let b = h.slice(h.indexOf('</head>'));
  b = b.replace(/<header\b[\s\S]*?<\/header>/gi, ' ');
  b = b.replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');
  b = b.replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ');
  b = b.replace(/<div[^>]+(?:id|class)="[^"]*(?:sheet|cta-band)[^"]*"[\s\S]*?<\/div>/gi, ' ');
  return b;
};

const contextualOut = new Map();
const contextualIn = new Map([...valid].map((u) => [u, 0]));
const anchorsTo = new Map();

for (const [file, url] of fileToUrl) {
  const h = fs.readFileSync(file, 'utf8');
  const body = stripChrome(h);
  const seen = new Set();
  for (const m of body.matchAll(/<a\b[^>]*href=["']([^"'#?]+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const t = m[1];
    if (!valid.has(t) || t === url) continue;
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    seen.add(t);
    if (!anchorsTo.has(t)) anchorsTo.set(t, new Set());
    if (text) anchorsTo.get(t).add(text.slice(0, 50));
  }
  contextualOut.set(url, seen.size);
  for (const t of seen) contextualIn.set(t, contextualIn.get(t) + 1);
}

const rows = [...valid].map((u) => ({
  u,
  out: contextualOut.get(u) || 0,
  in: contextualIn.get(u) || 0,
  anchors: anchorsTo.has(u) ? anchorsTo.get(u).size : 0,
}));

console.log('--- pages with ZERO contextual inbound links (nav-only) ---');
rows.filter((r) => r.in === 0).sort((a,b)=>a.u.localeCompare(b.u)).forEach((r) => console.log('  ' + r.u));
console.log('  count: ' + rows.filter((r) => r.in === 0).length + ' / ' + rows.length);

console.log('\n--- pages with ZERO contextual outbound links (dead ends) ---');
rows.filter((r) => r.out === 0).sort((a,b)=>a.u.localeCompare(b.u)).forEach((r) => console.log('  ' + r.u));
console.log('  count: ' + rows.filter((r) => r.out === 0).length);

console.log('\n--- contextual inbound link distribution (top / bottom) ---');
rows.sort((a, b) => b.in - a.in);
console.log('  TOP:');
rows.slice(0, 10).forEach((r) => console.log('    ' + String(r.in).padStart(3) + ' in, ' + String(r.out).padStart(3) + ' out, ' + r.anchors + ' distinct anchors  ' + r.u));
console.log('  BOTTOM:');
rows.slice(-12).forEach((r) => console.log('    ' + String(r.in).padStart(3) + ' in, ' + String(r.out).padStart(3) + ' out, ' + r.anchors + ' distinct anchors  ' + r.u));

const avg = rows.reduce((s, r) => s + r.in, 0) / rows.length;
console.log('\n  mean contextual inbound: ' + avg.toFixed(1));
