// Full-page before/after captures of /work at 1440 and 390, for owner review.
// "before" = kriva-work-index.html at git HEAD, served by request interception (no files touched).
// Pages taller than Chrome's capture limit are saved in 6000px segments.
// Usage: node _shots_work_compare.cjs   → _shots/work/compare/{before,after}-{1440,390}-NN.jpg
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177';
const OUT = path.join('_shots', 'work', 'compare');
const SEG = 6000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const headHtml = execSync('git show HEAD:kriva-work-index.html', { encoding: 'utf8', maxBuffer: 1 << 24 });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--hide-scrollbars'] });
  const manifest = {};
  for (const variant of ['before', 'after']) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const p = await browser.newPage();
      await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600 });
      if (variant === 'before') {
        await p.setRequestInterception(true);
        p.on('request', (r) => (r.isNavigationRequest() && new URL(r.url()).pathname === '/work'
          ? r.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: headHtml })
          : r.continue()));
      }
      await p.goto(BASE + '/work', { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(1500);
      /* Walk the page so every reveal fires and lazy images load, then return to the top */
      await p.evaluate(async () => {
        const total = document.documentElement.scrollHeight;
        for (let y = 0; y < total; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
        window.scrollTo(0, 0);
      });
      await sleep(2500);
      const total = await p.evaluate(() => document.documentElement.scrollHeight);
      const files = [];
      for (let y = 0, i = 0; y < total; y += SEG, i++) {
        const file = `${variant}-${w}-${String(i).padStart(2, '0')}.jpg`;
        await p.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 80, captureBeyondViewport: true, clip: { x: 0, y, width: w, height: Math.min(SEG, total - y) } });
        files.push(file);
      }
      manifest[`${variant}-${w}`] = { height: total, files };
      console.log(variant, w, 'height', total, 'segments', files.length);
      await p.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
