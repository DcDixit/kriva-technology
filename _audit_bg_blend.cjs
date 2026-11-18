/* After the cream->white refinement: find inner elements still painted cream (#F6F4EF / #ECE8DF)
   inside a section that WAS cream before (per the before audit JSON) — those used to blend in.
   Usage: node _audit_bg_blend.cjs <bg_before.json> [W] */
const fs = require('fs');
const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5177}`;
const before = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = Number(process.argv[3] || 1440);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  for (const [r, v] of Object.entries(before)) {
    const creamBands = v.bands.filter((x) => /cream/.test(x.own)).map((x) => x.el);
    if (!creamBands.length) continue;
    const p = await b.newPage();
    await p.setViewport({ width: W, height: 900 });
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
    const hits = await p.evaluate((creamBands) => {
      const desc = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      const bands = [...document.querySelectorAll('main *, body > *')].filter((e) => creamBands.includes(desc(e)));
      const out = [];
      for (const band of bands) {
        const bandBg = getComputedStyle(band).backgroundColor;
        for (const e of band.querySelectorAll('*')) {
          for (const ps of [null, '::before', '::after']) {
            const cs = getComputedStyle(e, ps);
            if (ps && cs.content === 'none') continue;
            const bg = cs.backgroundColor;
            if (!/rgb\((246, 244, 239|236, 232, 223)\)/.test(bg)) continue;
            const rc = e.getBoundingClientRect(); if (!rc.width) continue; let a = ps ? e : e.parentElement; while (a && a !== band && getComputedStyle(a).backgroundColor === 'rgba(0, 0, 0, 0)') a = a.parentElement; if (a !== band) continue;
            out.push(`${desc(band).slice(0, 34)} [${bandBg}] > ${desc(e).slice(0, 50)}${ps || ''} ${bg} ${Math.round(rc.width)}x${Math.round(rc.height)} border:${cs.borderTopWidth} ${cs.borderTopColor}`);
          }
        }
      }
      return [...new Set(out)];
    }, creamBands);
    if (hits.length) { console.log('== ' + r); hits.forEach((h) => console.log('  ' + h)); }
    await p.close();
  }
  await b.close();
})();
