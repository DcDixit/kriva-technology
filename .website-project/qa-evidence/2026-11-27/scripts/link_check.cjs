/* Every internal href/src/srcset/og:image in every routed page of a build, checked over HTTP against the build server.
   Redirect-only paths (vercel.json redirects) are reported separately, not as broken.
   Usage: node link_check.cjs <origin> <vercel.json> <out.json> */
const fs = require('fs');
const [ORIGIN, VJ, OUT] = process.argv.slice(2);
const v = JSON.parse(fs.readFileSync(VJ, 'utf8'));
const routes = v.rewrites.map(r => r.source).filter(s => !/[:(*]/.test(s));
const redirects = (v.redirects || []).map(r => r.source);
const isRedirect = p => redirects.some(s => s === p || (/[:(*]/.test(s) && new RegExp('^' + s.replace(/:\w+\*/g, '.*').replace(/:\w+/g, '[^/]+') + '$').test(p)));
(async () => {
  const refs = new Map();
  for (const r of routes) {
    const html = await (await fetch(ORIGIN + r)).text();
    const found = [];
    for (const m of html.matchAll(/\s(?:href|src|poster|data-src)="([^"]+)"/g)) found.push(m[1]);
    for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(',').forEach(s => found.push(s.trim().split(/\s+/)[0]));
    for (const m of html.matchAll(/content="(https:\/\/krivatechnologies\.com\/[^"]+\.(?:png|jpg|webp|svg))"/g)) found.push(m[1]);
    for (let u of found) {
      if (/^(mailto:|tel:|javascript:|data:|#)/.test(u)) continue;
      if (u.startsWith('https://krivatechnologies.com')) u = u.replace('https://krivatechnologies.com', '') || '/';
      if (/^https?:\/\//.test(u) || u.startsWith('//')) continue;
      if (!u.startsWith('/')) continue;
      const p = u.split('#')[0].split('?')[0];
      if (!p) continue;
      if (!refs.has(p)) refs.set(p, new Set());
      refs.get(p).add(r);
    }
  }
  const broken = [], viaRedirect = [];
  for (const [p, from] of refs) {
    const s = (await fetch(ORIGIN + p, { redirect: 'manual' })).status;
    if (s === 200) continue;
    if (isRedirect(p)) viaRedirect.push({ path: p, pages: [...from].length, sample: [...from].slice(0, 3) });
    else broken.push({ path: p, status: s, pages: [...from].length, sample: [...from].slice(0, 4) });
  }
  fs.writeFileSync(OUT, JSON.stringify({ checked: refs.size, broken, viaRedirect }, null, 1));
  console.log('unique internal URLs checked: ' + refs.size + ' | broken: ' + broken.length + ' | resolved only via a redirect: ' + viaRedirect.length);
  broken.forEach(b => console.log('  BROKEN ' + JSON.stringify(b)));
  viaRedirect.forEach(b => console.log('  REDIRECT ' + JSON.stringify(b)));
})();
