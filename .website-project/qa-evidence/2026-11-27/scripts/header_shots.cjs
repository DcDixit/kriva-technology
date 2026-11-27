/* Before/after screenshots of the top of a page (first 220px of the viewport, consent banner hidden).
   Usage: node header_shots.cjs <baseOrigin> <candOrigin> <outDir> <routes,...> <widths> */
const path = require('path');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [BASE, CAND, OUT, R, W] = process.argv.slice(2);
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const route of R.split(',')) for (const w of W.split(',').map(Number)) for (const [label, origin] of [['before', BASE], ['after', CAND]]) {
    const p = await browser.newPage();
    await p.setViewport({ width: w, height: 844 });
    await p.goto(origin + route, { waitUntil: 'load' });
    await p.evaluate(() => { const c = document.querySelector('#kriva-consent'); if (c) c.hidden = true; });
    await new Promise(z => setTimeout(z, 700));
    const file = path.join(OUT, `${route.replace(/\//g, '_').replace(/^_/, '')}_${w}_${label}.png`);
    await p.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: 220 } });
    await p.close();
  }
  await browser.close();
  console.log('done');
})();
