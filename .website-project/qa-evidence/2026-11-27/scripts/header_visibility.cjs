/* Is the header logo and the mobile menu button actually visible? For every route at the given widths, at scroll 0
   and after scrolling 1200px: screenshot the logo box and the menu-button box and measure pixel contrast inside them
   (max luminance difference). A box whose pixels are all ~the same colour is invisible (e.g. white on white).
   Usage: node header_visibility.cjs <origin> <vercel.json> <out.json> <widths> [shotsDir] */
const fs = require('fs');
const path = require('path');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const { PNG } = (() => { try { return require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/pngjs'); } catch (e) { return {}; } })();
const [ORIGIN, VJ, OUT, W, SHOTS] = process.argv.slice(2);
const routes = JSON.parse(fs.readFileSync(VJ, 'utf8')).rewrites.map(r => r.source).filter(s => !/[:(*]/.test(s));
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();
  const rows = [];
  for (const w of W.split(',').map(Number)) {
    await page.setViewport({ width: w, height: 844 });
    for (const r of routes) {
      await page.goto(ORIGIN + r, { waitUntil: 'load', timeout: 45000 });
      await page.evaluate(() => { const b = document.querySelector('#kriva-consent'); if (b) b.hidden = true; });
      for (const y of [0, 1200]) {
        await page.evaluate(y => scrollTo(0, y), y);
        await new Promise(z => setTimeout(z, 700));
        const boxes = await page.evaluate(() => {
          const pick = sels => { for (const s of sels) { const e = Array.from(document.querySelectorAll(s)).find(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 4 && r.height > 4 && r.top < 120 && cs.display !== 'none' && cs.visibility !== 'hidden'; }); if (e) { const r = e.getBoundingClientRect(); return { sel: s, x: Math.max(0, r.left), y: Math.max(0, r.top), w: r.width, h: r.height }; } } return null; };
          return { logo: pick(['header .brand img', 'header a.brand', '.nav .brand', 'header [class*="logo"]', 'header a[href="/"] img', 'header a[href="/"]']), menu: pick(['header .burger', 'header .nav-toggle', 'header button[aria-controls]', 'header button[aria-label*="enu" i]', '.nav button[aria-expanded]']) };
        });
        const res = { r, w, y };
        for (const k of ['logo', 'menu']) {
          const b = boxes[k];
          if (!b) { res[k] = 'not found'; continue; }
          const sy = await page.evaluate(() => scrollY); const buf = await page.screenshot({ clip: { x: b.x, y: b.y + sy, width: Math.max(2, b.w), height: Math.max(2, b.h) } });
          const range = await page.evaluate(async b64 => {
            const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
            const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
            const d = ctx.getImageData(0, 0, c.width, c.height).data; let lo = 255, hi = 0;
            for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; if (l < lo) lo = l; if (l > hi) hi = l; }
            return Math.round(hi - lo);
          }, buf.toString('base64'));
          res[k] = { sel: b.sel, contrastRange: range };
        }
        res.invisible = ['logo', 'menu'].filter(k => typeof res[k] === 'object' && res[k].contrastRange < 40);
        rows.push(res);
        if (res.invisible.length && SHOTS && y === 0) await page.screenshot({ path: path.join(SHOTS, r.replace(/\//g, '_') + '_' + w + '.png'), clip: { x: 0, y: 0, width: w, height: 160 } });
      }
    }
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
  const bad = rows.filter(x => x.invisible.length), nf = rows.filter(x => x.logo === 'not found' || x.menu === 'not found');
  console.log('checks: ' + rows.length + ' | header element invisible: ' + bad.length + ' | element not found: ' + nf.length);
  bad.forEach(x => console.log('  INVISIBLE ' + x.r + ' @' + x.w + ' scrollY=' + x.y + ' ' + x.invisible.join('+') + ' ' + JSON.stringify({ logo: x.logo, menu: x.menu })));
  nf.slice(0, 5).forEach(x => console.log('  NOTFOUND ' + x.r + ' @' + x.w + ' ' + JSON.stringify({ logo: x.logo, menu: x.menu })));
})();
