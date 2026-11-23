// Review captures for the Markets + Industries redesign: viewport frames down each page at 1440
// and 390, plus overflow / link / console / reveal checks.
// Usage: node _shots_mkt.cjs [us,uk,au,uae,ca,ind,home] [--out=_shots/markets] [--max=N] [--reduce]
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:5177';
const ROUTES = { us: '/markets/us', uk: '/markets/uk', de: '/markets/de', au: '/markets/au', uae: '/markets/uae', ca: '/markets/ca', ind: '/industries', home: '/' };
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const pick = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'us,uk,au,uae,ca,ind').split(',');
const OUT = arg('out', path.join('_shots', 'markets'));
const MAX = +arg('max', 99);
const REDUCE = process.argv.includes('--reduce');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
    defaultViewport: null
  });
  for (const key of pick) {
    const URL = BASE + ROUTES[key];
    for (const [w, h, tag] of [[1440, 900, 'desktop-1440'], [390, 844, 'mobile-390']]) {
      const dir = path.join(OUT, key, tag);
      fs.mkdirSync(dir, { recursive: true });
      for (const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, f));
      const page = await browser.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
      page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
      page.on('requestfailed', (r) => { if (!/google|clarity|tawk|doubleclick/.test(r.url())) errs.push('failed: ' + r.url()); });
      page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push(r.status() + ' ' + r.url()); });
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600 });
      if (REDUCE) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(1800);
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = Math.round(h * 0.85);
      let i = 0;
      for (let y = 0; y < total && i < MAX; y += step) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await sleep(1200);
        await page.screenshot({ path: path.join(dir, String(i++).padStart(2, '0') + '.png') });
      }
      const m = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        wide: [...document.querySelectorAll('main *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('[aria-hidden="true"],.mx-marquee'); }).slice(0, 8).map((el) => el.className || el.tagName),
        hiddenReveal: [...document.querySelectorAll('[data-x],[data-split]')].filter((el) => !el.classList.contains('is-in')).length,
        links: [...new Set([...document.querySelectorAll('main a[href^="/"], main a[href^="#"]')].map((a) => a.getAttribute('href')))],
        h1: document.querySelectorAll('h1').length,
        form: !!document.querySelector('#pageInquiry'),
        hpVisible: (() => { const hp = document.querySelector('.inq-hp'); return hp ? hp.getBoundingClientRect().height > 2 && getComputedStyle(hp).visibility !== 'hidden' : null; })()
      }));
      console.log(key, tag, 'frames', i, 'height', total, JSON.stringify({ ...m, links: m.links.length }));
      if (m.wide.length) console.log('  wide:', m.wide.join(' | '));
      fs.writeFileSync(path.join(dir, '_links.json'), JSON.stringify(m.links, null, 1));
      if (errs.length) console.log('  errors:\n   ' + [...new Set(errs)].join('\n   '));
      await page.close();
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
