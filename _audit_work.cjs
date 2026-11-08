/* Work page audit: per-section screenshots, console errors, failed requests, overflow, headings. */
const puppeteer = require('puppeteer');
const fs = require('fs');
const URL = process.env.URL || 'http://127.0.0.1:5177/work';
const WIDTHS = (process.env.WIDTHS || '1920,1440,1280,1024,768,430,390,375').split(',').map(Number);
const SHOTS = (process.env.SHOTS || '1440,390').split(',').map(Number);
const OUT = '_shots/work-audit';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const report = {};
  for (const w of WIDTHS) {
    const page = await browser.newPage();
    const errors = [], failed = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('requestfailed', (r) => failed.push(r.url()));
    page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await page.setViewport({ width: w, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 600));
    const info = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('main *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width && (r.right > vw + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.wk-chips,[aria-hidden="true"]');
      }).slice(0, 8).map((el) => `${el.tagName}.${el.className}`.slice(0, 80));
      const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
      const heads = [...document.querySelectorAll('main h1,main h2,main h3')].map((h) => `${h.tagName}: ${h.textContent.trim().replace(/\s+/g, ' ').slice(0, 70)}`);
      const small = [...document.querySelectorAll('main a, main button')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width && r.height && r.height < 24 && getComputedStyle(el).position !== 'absolute' && !el.closest('p,li');
      }).slice(0, 6).map((el) => `${el.tagName} "${el.textContent.trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().height)}px`);
      return { scrollW: document.documentElement.scrollWidth, vw, over, brokenImgs: imgs, height: document.body.scrollHeight, heads, small };
    });
    report[w] = { ...info, errors, failed };
    if (SHOTS.includes(w)) {
      const parts = await page.$$('main > *:not(script)');
      let i = 0;
      for (const el of parts) {
        const box = await el.boundingBox();
        if (!box || box.height < 2) continue;
        const h = Math.min(box.height, 2400);
        await page.screenshot({ path: `${OUT}/${w}-${String(i++).padStart(2, '0')}.png`, clip: { x: 0, y: box.y, width: w, height: h }, captureBeyondViewport: true });
      }
    }
    await page.close();
  }
  for (const [w, r] of Object.entries(report)) {
    console.log(`\n== ${w}px  scrollW=${r.scrollW} vw=${r.vw} height=${r.height}`);
    if (r.over.length) console.log(' overflow:', r.over);
    if (r.brokenImgs.length) console.log(' broken:', r.brokenImgs);
    if (r.errors.length) console.log(' errors:', r.errors);
    if (r.failed.length) console.log(' failed:', r.failed);
    if (r.small.length) console.log(' small targets:', r.small);
  }
  console.log('\nHeadings:\n ' + report[WIDTHS[0]].heads.join('\n '));
  await browser.close();
})();
