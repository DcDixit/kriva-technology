/* Background audit: for every sitemap route, list full-width bands top-to-bottom with their
   effective background and classify cream / white / dark / tint. Also counts cream inner surfaces.
   Usage: node _audit_bg.cjs [outfile.json]  (preview on PORT, default 5177) */
const fs = require('fs');
const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5177}`;
const routes = [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
const out = process.argv[2] || null;
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const report = {};
  for (const r of routes) {
    const p = await b.newPage();
    await p.setViewport({ width: 1440, height: 900 });
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
    const res = await p.evaluate(() => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v[3] === undefined ? 1 : v[3] }; };
      const cls = (c) => {
        if (!c || c.a < 0.05) return 'transparent';
        const { r, g, b } = c; const L = (r + g + b) / 3;
        if (L < 90) return 'dark';
        if (r === 255 && g === 255 && b === 255) return 'white';
        if (L > 225 && r - b >= 4 && r >= g) return 'cream';
        if (L > 225) return 'light-tint';
        return 'colour';
      };
      const hex = (c) => c ? '#' + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('') + (c.a < 1 ? '@' + c.a : '') : '-';
      const desc = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      const eff = (e) => { for (let n = e; n; n = n.parentElement) { const cs = getComputedStyle(n); const c = parse(cs.backgroundColor); if (cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage) && (!c || c.a < 0.05)) return { grad: cs.backgroundImage.slice(0, 120), src: desc(n) }; if (c && c.a >= 0.05) return { c, src: desc(n) }; } return { c: { r: 255, g: 255, b: 255, a: 1 }, src: 'canvas' }; };
      const W = innerWidth;
      const bands = [];
      const seen = new Set();
      const cand = [...document.querySelectorAll('body > *, main > *, main > * > section, main section, header.nav, footer, body > div > section')];
      for (const e of cand) {
        if (seen.has(e)) continue; seen.add(e);
        const rc = e.getBoundingClientRect();
        if (rc.width < W * 0.95 || rc.height < 60) continue;
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const own = parse(cs.backgroundColor);
        const ownCls = cls(own);
        const ownGrad = cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage) ? cs.backgroundImage.slice(0, 140) : '';
        const ef = eff(e);
        bands.push({ el: desc(e), top: Math.round(rc.top + scrollY), h: Math.round(rc.height), own: ownCls === 'transparent' ? '' : hex(own) + ' ' + ownCls, grad: ownGrad, eff: ef.grad ? 'gradient(' + ef.src + ')' : hex(ef.c) + ' ' + cls(ef.c) + ' <' + ef.src + '>' });
      }
      bands.sort((a, b) => a.top - b.top);
      // cream inner surfaces (cards etc.)
      const inner = {};
      for (const e of document.querySelectorAll('main *, footer *')) {
        const cs = getComputedStyle(e); const c = parse(cs.backgroundColor);
        if (cls(c) !== 'cream') continue;
        const rc = e.getBoundingClientRect(); if (rc.width >= W * 0.95) continue;
        const k = desc(e) + ' ' + hex(c); inner[k] = (inner[k] || 0) + 1;
      }
      const bc = parse(getComputedStyle(document.body).backgroundColor), hc = parse(getComputedStyle(document.documentElement).backgroundColor);
      return { body: desc(document.body) + ' ' + hex(bc) + ' ' + cls(bc), html: hex(hc) + ' ' + cls(hc), bands, inner };
    });
    report[r] = res;
    const creamBands = res.bands.filter((x) => /cream/.test(x.own) || /cream/.test(x.eff));
    console.log(`\n== ${r}  body ${res.body}  html ${res.html}  cream bands ${creamBands.length}/${res.bands.length}  cream inner kinds ${Object.keys(res.inner).length}`);
    for (const x of res.bands) console.log(`  ${String(x.top).padStart(6)} h${String(x.h).padEnd(5)} ${x.el.slice(0, 60).padEnd(60)} own:${(x.own || '-').padEnd(20)} eff:${x.eff}${x.grad ? '  GRAD ' + x.grad.slice(0, 70) : ''}`);
    await p.close();
  }
  if (out) fs.writeFileSync(out, JSON.stringify(report, null, 1));
  await b.close();
})();
