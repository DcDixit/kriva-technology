// Review captures for /solutions/accounting-integrations: viewport frames down the page at 1440 and 390,
// plus overflow / console / link checks. Usage: node _shots_acx.cjs [outDir] [--reduce] [--widths=1440,390]
// Writes <outDir>/desktop-1440_NN.png and <outDir>/mobile-390_NN.png (viewport shots, not full-page:
// full-page captures break on sticky sections and tile past ~16k px).
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:5177';
const URL = BASE + '/solutions/accounting-integrations';
const OUT = process.argv.slice(2).find((a) => !a.startsWith('--')) || path.join('_shots', 'solutions-accounting');
const REDUCE = process.argv.includes('--reduce');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEWS = [[1440, 900, 'desktop-1440'], [390, 844, 'mobile-390']];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
    defaultViewport: null
  });
  for (const [w, h, tag] of VIEWS) {
    for (const f of fs.readdirSync(OUT)) if (f.startsWith(tag + '_')) fs.unlinkSync(path.join(OUT, f));
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('requestfailed', (r) => { if (!/google|clarity/.test(r.url())) errs.push('failed: ' + r.url()); });
    page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push(r.status() + ' ' + r.url()); });
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600 });
    if (REDUCE) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(1800);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(h * 0.85);
    let i = 0;
    for (let y = 0; y < total; y += step) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await sleep(1100);
      await page.screenshot({ path: path.join(OUT, `${tag}_${String(i++).padStart(2, '0')}.png`) });
    }
    const m = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      wide: [...document.querySelectorAll('main *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('[aria-hidden="true"]'); }).slice(0, 8).map((el) => (el.className && el.className.baseVal === undefined ? el.className : el.tagName)),
      hiddenReveal: [...document.querySelectorAll('[data-x],[data-split]')].filter((el) => !el.classList.contains('is-in')).length,
      links: [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0]))],
      h1: document.querySelectorAll('h1').length
    }));
    console.log(tag, 'frames', i, 'height', total, JSON.stringify({ ...m, links: m.links.length }));
    if (m.wide.length) console.log('  wide:', m.wide.join(' | '));
    fs.writeFileSync(path.join(OUT, '_links.json'), JSON.stringify(m.links, null, 1));
    if (errs.length) console.log('  errors:\n   ' + [...new Set(errs)].join('\n   '));
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
