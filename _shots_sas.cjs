// Viewport screenshots of /solutions/saas at successive scroll positions.
// Usage: node _shots_sas.cjs [subdir] [--reduce] [--only=1440|390]
// Default output: _shots/solutions-saas/ (desktop-1440_NN.png, mobile-390_NN.png)
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:5177';
const args = process.argv.slice(2);
const sub = args.find((a) => !a.startsWith('--')) || '';
const reduce = args.includes('--reduce');
const only = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const OUT = path.join('_shots', 'solutions-saas', sub);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
    defaultViewport: null
  });
  const sets = [[1440, 900, 'desktop-1440'], [390, 844, 'mobile-390']].filter(([w]) => !only || String(w) === only);
  for (const [w, h, tag] of sets) {
    const page = await browser.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push(String(e)));
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600 });
    if (reduce) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE + '/solutions/saas', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1800));
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(h * 0.86);
    let i = 0;
    for (let y = 0; y < total; y += step) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await new Promise((r) => setTimeout(r, 1100));
      const file = path.join(OUT, `${tag}_${String(i).padStart(2, '0')}.png`);
      await page.screenshot({ path: file });
      i++;
      if (i > 60) break;
    }
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, 'shots', i, 'height', total, 'overflow', ov, 'errors', errs.length, errs.slice(0, 5));
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
