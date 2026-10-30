/* Temporary: list mobile tap targets under 44px. Not for commit. */
const puppeteer = require('puppeteer');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5199';
const fs = require('fs');
const path = require('path');
const routes = process.argv.slice(2);
if (!routes.length) {
  routes.push(...[...fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/'));
}
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844 });
  const all = new Map();
  for (const r of routes) {
    await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 45000 });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
    const rows = await p.evaluate(() => {
      const sig = (e) => {
        const cls = [...e.classList].slice(0, 4).join('.');
        const parent = e.parentElement ? (e.parentElement.id || [...e.parentElement.classList].slice(0, 2).join('.')) : '';
        return `${e.tagName.toLowerCase()}${cls ? '.' + cls : ''}${parent ? ' @' + parent : ''}`;
      };
      return [...document.querySelectorAll('a,button')].map((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        if (r.width <= 0 || r.height <= 0) return null;
        if (cs.visibility === 'hidden' || cs.display === 'inline' || cs.display === 'none') return null;
        if (e.closest('[aria-hidden="true"]')) return null;
        if (r.height >= 44 && r.width >= 44) return null;
        const text = (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
        return { sig: sig(e), w: Math.round(r.width), h: Math.round(r.height), d: cs.display, text, under24: r.height < 24 || r.width < 24 };
      }).filter(Boolean);
    });
    const under = rows.filter((x) => x.under24);
    console.log('\n==', r, 'under24', under.length, 'under44', rows.length);
    const seen = new Map();
    for (const row of under) {
      const k = `${row.sig}|${row.w}x${row.h}|${row.text}`;
      seen.set(k, (seen.get(k) || 0) + 1);
    }
    for (const [k, n] of seen) console.log(String(n).padStart(3), k);
  }
  await b.close();
})();
