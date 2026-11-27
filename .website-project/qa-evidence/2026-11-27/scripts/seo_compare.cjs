/* Compare 1440 SEO snapshots: live-equivalent build vs clean build, and validate the clean build.
   Usage: node seo_compare.cjs <main.jsonl> <clean.jsonl> <sitemap.xml> */
const fs = require('fs');
const [A, B, SM] = process.argv.slice(2);
const load = f => fs.readFileSync(f, 'utf8').trim().split('\n').map(l => JSON.parse(l));
const pick = rows => new Map(rows.filter(r => r.seo).map(r => [r.r, r.seo]));
const a = pick(load(A)), b = pick(load(B));
const sitemap = new Set((fs.readFileSync(SM, 'utf8').match(/<loc>([^<]+)<\/loc>/g) || []).map(s => s.replace(/<\/?loc>/g, '')));
const BASE = 'https://krivatechnologies.com';
const problems = [], changes = [];
const titles = new Map(), descs = new Map();
for (const [route, s] of b) {
  const want = route === '/' ? BASE + '/' : BASE + route;
  const noindex = s.robots && /noindex/.test(s.robots);
  if (s.canonical !== want && s.canonical !== want.replace(/\/$/, '')) problems.push({ route, issue: 'canonical mismatch', got: s.canonical, want });
  if (!s.title) problems.push({ route, issue: 'missing title' });
  if (!s.desc) problems.push({ route, issue: 'missing description' });
  if (s.title && s.title.length > 65) problems.push({ route, issue: 'title > 65 chars', len: s.title.length, title: s.title, severity: 'low' });
  if (s.desc && (s.desc.length > 165 || s.desc.length < 70)) problems.push({ route, issue: 'description length ' + s.desc.length, severity: 'low' });
  if (!s.ld) problems.push({ route, issue: 'no JSON-LD' });
  if (/INVALID/.test(s.ld)) problems.push({ route, issue: 'invalid JSON-LD' });
  if (!s.og) problems.push({ route, issue: 'no og:image' });
  if (s.lang !== 'en') problems.push({ route, issue: 'lang=' + s.lang });
  if (!noindex && !sitemap.has(want) && !sitemap.has(want.replace(/\/$/, ''))) problems.push({ route, issue: 'indexable but not in sitemap' });
  if (noindex && (sitemap.has(want))) problems.push({ route, issue: 'noindex but in sitemap' });
  (titles.get(s.title) || titles.set(s.title, []).get(s.title)).push(route);
  (descs.get(s.desc) || descs.set(s.desc, []).get(s.desc)).push(route);
  const o = a.get(route);
  if (!o) { changes.push({ route, field: 'NEW ROUTE', clean: s.title }); continue; }
  for (const k of ['title', 'desc', 'canonical', 'robots', 'lang', 'hreflang', 'ld', 'og', 'h1text']) if (o[k] !== s[k]) changes.push({ route, field: k, main: o[k], clean: s[k] });
}
for (const [t, rs] of titles) if (rs.length > 1) problems.push({ issue: 'duplicate title', title: t, routes: rs });
for (const [t, rs] of descs) if (rs.length > 1) problems.push({ issue: 'duplicate description', routes: rs });
for (const route of a.keys()) if (!b.has(route)) changes.push({ route, field: 'ROUTE REMOVED' });
const smRoutes = [...sitemap].map(u => u.replace(BASE, '') || '/');
const missingFromSite = smRoutes.filter(r => !b.has(r) && !b.has(r.replace(/\/$/, '')));
console.log('routes:', b.size, '| sitemap URLs:', sitemap.size, '| sitemap URLs without a route:', missingFromSite.join(', ') || 'none');
console.log('PROBLEMS (' + problems.length + '):'); problems.forEach(p => console.log('  ' + JSON.stringify(p)));
const by = {}; changes.forEach(c => (by[c.field] = by[c.field] || []).push(c.route));
console.log('CHANGES vs live-equivalent, by field:'); Object.entries(by).forEach(([k, v]) => console.log('  ' + k + ': ' + v.length + ' routes' + (v.length <= 6 ? ' (' + v.join(', ') + ')' : '')));
const seen = {}; changes.filter(c => c.main !== undefined).forEach(c => { if (!seen[c.field]) { seen[c.field] = 1; console.log('  sample ' + c.field + ' @ ' + c.route + '\n    live : ' + String(c.main).slice(0, 260) + '\n    clean: ' + String(c.clean).slice(0, 260)); } });
fs.writeFileSync(B.replace(/\.jsonl$/, '_seo_report.json'), JSON.stringify({ problems, changes }, null, 1));
