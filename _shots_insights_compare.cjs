// Before/after full-page captures for /insights at 1440 and 390, composed side by side.
// "Before" is the committed page, served from a temporary copy: git show HEAD:kriva-insights-index.html > _before_insights_tmp.html
// Reduced motion is emulated so every reveal is visible in a single full-page capture.
// Usage: node _shots_insights_compare.cjs
const fs = require('fs'); const path = require('path'); const puppeteer = require('puppeteer');
const OUT = path.join('_shots', 'insights', 'compare');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const shots = {};
  for (const [w, h, tag] of [[1440, 900, '1440'], [390, 844, '390']]) {
    for (const [name, url] of [['before', '/_before_insights_tmp.html'], ['after', '/insights']]) {
      const p = await b.newPage();
      await p.setViewport({ width: w, height: h, isMobile: w < 600, hasTouch: w < 600 });
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await p.goto('http://localhost:5177' + url, { waitUntil: 'networkidle2' });
      const total = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 400) { await p.evaluate((y) => scrollTo(0, y), y); await sleep(40); }
      await p.evaluate(() => scrollTo(0, 0)); await sleep(800);
      const file = path.join(OUT, `${name}-${tag}.png`);
      await p.screenshot({ path: file, fullPage: true });
      shots[`${name}-${tag}`] = { file, height: await p.evaluate(() => document.documentElement.scrollHeight) };
      await p.close();
    }
  }
  // side-by-side sheets
  for (const [tag, colW] of [['1440', 720], ['390', 390]]) {
    const p = await b.newPage();
    await p.setViewport({ width: colW * 2 + 72, height: 600 });
    const img = (k) => `data:image/png;base64,${fs.readFileSync(shots[k].file).toString('base64')}`;
    await p.setContent(`<body style="margin:0;padding:24px;background:#d9dde3;font:700 20px/1.2 system-ui;color:#0F1C2E;display:grid;grid-template-columns:${colW}px ${colW}px;gap:24px;align-items:start">
      <div><p style="margin:0 0 12px">BEFORE · ${tag}px</p><img style="width:${colW}px;display:block;box-shadow:0 2px 12px rgba(0,0,0,.2)" src="${img('before-' + tag)}"></div>
      <div><p style="margin:0 0 12px">AFTER · ${tag}px</p><img style="width:${colW}px;display:block;box-shadow:0 2px 12px rgba(0,0,0,.2)" src="${img('after-' + tag)}"></div></body>`, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(OUT, `side-by-side-${tag}.png`), fullPage: true });
    await p.close();
  }
  console.log(Object.entries(shots).map(([k, v]) => `${k}: ${v.height}px`).join(' | '));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
