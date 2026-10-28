/* Visits every sitemap route at 3 viewports against the local preview.
   Checks: HTTP status, console/page errors, failed requests, Figtree loaded,
   horizontal overflow, tap targets < 24px, images without alt. Usage: PORT=5199 node _qa_all_routes.cjs [--shots dir] */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5199}`;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const shotsDir = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const routes = [...fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
const VPS = [['desktop', 1440, 900], ['tablet', 820, 1100], ['mobile', 390, 844]];
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const issues = [];
  for (const r of routes) {
    for (const [name, w, h] of VPS) {
      const p = await b.newPage();
      await p.setViewport({ width: w, height: h });
      const errs = [];
      p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)); });
      p.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 140)));
      p.on('requestfailed', (q) => { if (!/google|clarity|vercel|gtag|analytics/.test(q.url())) errs.push('reqfail: ' + q.url().slice(0, 100)); });
      const res = await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 45000 }).catch((e) => ({ status: () => 'ERR ' + e.message }));
      const st = res.status();
      if (st !== 200) errs.push('status ' + st);
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
      const m = await p.evaluate(() => {
        const de = document.documentElement;
        const over = de.scrollWidth - de.clientWidth;
        const small = [...document.querySelectorAll('a,button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24) && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'inline' && !e.closest('[aria-hidden="true"]'); }).length;
        return { over, small, font: document.fonts.check("16px 'Figtree'"), fam: getComputedStyle(document.body).fontFamily.slice(0, 20), noalt: [...document.images].filter((i) => !i.hasAttribute('alt')).length, h1: document.querySelectorAll('h1').length };
      });
      if (m.over > 1) errs.push(`h-overflow ${m.over}px`);
      if (!m.font || !/Figtree/.test(m.fam)) errs.push('font not applied');
      if (m.noalt) errs.push(`${m.noalt} img without alt`);
      if (m.h1 !== 1) errs.push(`h1 count ${m.h1}`);
      if (m.small > 0 && name === 'mobile') errs.push(`${m.small} tap targets <24px`);
      if (shotsDir && name !== 'tablet') { fs.mkdirSync(shotsDir, { recursive: true }); await p.screenshot({ path: path.join(shotsDir, (r.replace(/\//g, '_') || '_home') + '-' + name + '.png'), fullPage: true }).catch(() => {}); }
      if (errs.length) issues.push({ r, name, errs });
      await p.close();
    }
  }
  await b.close();
  console.log(`routes ${routes.length} · viewports ${VPS.length} · pages-with-issues ${new Set(issues.map((i) => i.r)).size}`);
  for (const i of issues) console.log(i.name.padEnd(8), i.r, '→', i.errs.join(' | '));
})();
