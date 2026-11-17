// Review captures for /solutions (hub): viewport frames down the page at 1440 and 390,
// plus overflow (390/768/1024/1440), console, internal-link, mobile-menu and form-validation checks.
// Usage: node _shots_hub.cjs [outDir] [--reduce] [--quick]
// The form is never submitted to the real endpoint: /api/inquiry is intercepted and stubbed.
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:5177';
const URL = BASE + '/solutions';
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join('_shots', 'solutions-index');
const REDUCE = process.argv.includes('--reduce');
const QUICK = process.argv.includes('--quick');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const status = (u) => new Promise((res) => {
  http.get(u, (r) => { r.resume(); res(r.statusCode); }).on('error', () => res(0));
});

async function open(browser, w, h, errs) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => { if (r.url().startsWith(BASE)) errs.push('failed: ' + r.url()); });
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push(r.status() + ' ' + r.url()); });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('/api/inquiry')) return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, channel: 'stub' }) });
    req.continue();
  });
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600 });
  if (REDUCE) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(1600);
  return page;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
    defaultViewport: null
  });
  let allLinks = new Set();
  for (const [w, h, tag] of [[1440, 900, 'desktop-1440'], [390, 844, 'mobile-390']]) {
    for (const f of fs.readdirSync(OUT)) if (f.startsWith(tag + '_')) fs.unlinkSync(path.join(OUT, f));
    const errs = [];
    const page = await open(browser, w, h, errs);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(h * 0.85);
    let i = 0;
    if (!QUICK) {
      for (let y = 0; y < total; y += step) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await sleep(1200);
        await page.screenshot({ path: path.join(OUT, tag + '_' + String(i++).padStart(2, '0') + '.png') });
      }
    }
    const m = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      wide: [...document.querySelectorAll('main *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('[aria-hidden="true"],.sx-chips,.hb-marq'); }).slice(0, 8).map((el) => (el.className && el.className.baseVal === undefined ? el.className : el.tagName)),
      hiddenReveal: [...document.querySelectorAll('[data-x],[data-split]')].filter((el) => !el.classList.contains('is-in')).length,
      links: [...new Set([...document.querySelectorAll('a[href^="/"], a[href^="#"]')].map((a) => a.getAttribute('href')))],
      h1: document.querySelectorAll('h1').length,
      form: !!document.querySelector('#pageInquiry'),
      hpVisible: (() => { const hp = document.querySelector('.inq-hp'); return hp ? hp.getBoundingClientRect().height > 2 && getComputedStyle(hp).visibility !== 'hidden' : null; })()
    }));
    m.links.forEach((l) => allLinks.add(l));
    console.log(tag, 'frames', i, 'height', total, JSON.stringify({ ...m, links: m.links.length }));
    if (m.wide.length) console.log('  wide:', m.wide.join(' | '));

    // mobile menu + form validation
    if (w < 600) {
      const menu = await page.evaluate(async () => {
        window.scrollTo(0, 0);
        const b = document.getElementById('burger');
        b.click();
        await new Promise((r) => setTimeout(r, 600));
        const s = document.getElementById('sheet');
        const ok = !s.hidden && s.getBoundingClientRect().height > 100;
        b.click();
        return ok;
      });
      console.log('  mobile menu opens:', menu);
    }
    const val = await page.evaluate(async () => {
      const f = document.getElementById('pageInquiry');
      f.scrollIntoView();
      f.querySelector('button[type=submit]').click();
      await new Promise((r) => setTimeout(r, 500));
      return [...f.querySelectorAll('.inq-err')].filter((e) => e.getBoundingClientRect().height > 0 && getComputedStyle(e).display !== 'none').length;
    });
    console.log('  validation errors shown on empty submit:', val);
    if (w >= 600) await page.screenshot({ path: path.join(OUT, '_form-validation.png') });
    if (errs.length) console.log('  errors:\n   ' + [...new Set(errs)].join('\n   '));
    await page.close();
  }

  // overflow at the four widths
  for (const w of [390, 768, 1024, 1440]) {
    const errs = [];
    const page = await open(browser, w, 900, errs);
    const o = await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
    });
    console.log('overflow', w, o.sw === o.cw ? 'OK' : 'OVERFLOW', o.sw, o.cw, errs.length ? errs.join('; ') : '');
    await page.close();
  }

  // internal links
  const bad = [];
  for (const l of allLinks) {
    if (l.startsWith('#')) continue;
    const s = await status(BASE + l.split('#')[0]);
    if (s !== 200) bad.push(s + ' ' + l);
  }
  console.log('internal links checked:', [...allLinks].filter((l) => !l.startsWith('#')).length, 'bad:', bad.length ? bad.join(', ') : 'none');
  const hashes = [...allLinks].filter((l) => l.startsWith('#') && l.length > 1);
  console.log('hash links:', hashes.join(' '));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
