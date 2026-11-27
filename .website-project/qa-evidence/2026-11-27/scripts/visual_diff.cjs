/* Pixel-compare <main> (header, consent banner and chip navs hidden, all reveals triggered) between two builds.
   Also reports page height and hero top so the expected "chip row removed" shift is visible.
   Usage: node visual_diff.cjs <baseOrigin> <candOrigin> <out.json> <shotsDir> <route,route,...> <widths> */
const fs = require('fs'), path = require('path');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [BASE, CAND, OUT, SHOTS, R, W] = process.argv.slice(2);
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const rows = [];
  for (const route of R.split(',')) for (const w of W.split(',').map(Number)) {
    const shots = {}, meta = {};
    for (const [label, origin] of [['base', BASE], ['cand', CAND]]) {
      const p = await browser.newPage();
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await p.setViewport({ width: w, height: 900 });
      await p.goto(origin + route, { waitUntil: 'load' });
      meta[label] = await p.evaluate(async () => {
        for (let y = 0; y <= document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(z => setTimeout(z, 40)); }
        await new Promise(z => setTimeout(z, 900)); scrollTo(0, 0); await new Promise(z => setTimeout(z, 300));
        const chipsVisible = Array.from(document.querySelectorAll('.mob-chips')).filter(c => getComputedStyle(c).display !== 'none').length;
        const hero = document.querySelector('main > header, main > section');
        const out = { pageHeight: document.documentElement.scrollHeight, heroTop: Math.round(hero.getBoundingClientRect().top), chipsVisible };
        const st = document.createElement('style');
        st.textContent = 'header.nav,#kriva-consent,.mob-chips,.svx-rail{visibility:hidden !important} *{animation-play-state:paused !important;caret-color:transparent !important}';
        document.head.appendChild(st);
        return out;
      });
      const main = await p.$('main');
      shots[label] = await main.screenshot({ encoding: 'base64' });
      if (SHOTS) fs.writeFileSync(path.join(SHOTS, `${route.replace(/\//g, '_')}_${w}_${label}.png`), Buffer.from(shots[label], 'base64'));
      await p.close();
    }
    const p = await browser.newPage();
    const diff = await p.evaluate(async (a, b) => {
      const load = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); return i; };
      const A = await load(a), B = await load(b);
      if (A.width !== B.width || A.height !== B.height) return { sizeA: A.width + 'x' + A.height, sizeB: B.width + 'x' + B.height, diffPct: null };
      const c = document.createElement('canvas'); c.width = A.width; c.height = A.height; const x = c.getContext('2d');
      x.drawImage(A, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data;
      x.clearRect(0, 0, c.width, c.height); x.drawImage(B, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30) n++;
      return { size: A.width + 'x' + A.height, diffPx: n, diffPct: +(100 * n / (da.length / 4)).toFixed(4) };
    }, shots.base, shots.cand);
    await p.close();
    const row = { route, w, base: meta.base, cand: meta.cand, ...diff };
    rows.push(row);
    console.log(route.padEnd(34) + String(w).padStart(5) + '  chips visible ' + meta.base.chipsVisible + '->' + meta.cand.chipsVisible + '  heroTop ' + meta.base.heroTop + '->' + meta.cand.heroTop + '  pageH ' + meta.base.pageHeight + '->' + meta.cand.pageHeight + '  <main> pixels differing: ' + (diff.diffPct === null ? 'size ' + diff.sizeA + ' vs ' + diff.sizeB : diff.diffPx + ' (' + diff.diffPct + '%)'));
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
})();
