// Smoothness probe for /insights: frame times while scrolling, filtering and moving the pointer over the hero,
// plus layout shift (CLS). Usage: node _perf_insights.cjs
const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const p = await b.newPage();
    await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile });
    await p.evaluateOnNewDocument(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    });
    await p.goto('http://localhost:5177/insights', { waitUntil: 'networkidle2' });
    await sleep(1500);
    const rec = () => p.evaluate(() => { window.__f = []; let t = performance.now(); const tick = (n) => { window.__f.push(n - t); t = n; if (window.__rec) requestAnimationFrame(tick); }; window.__rec = true; requestAnimationFrame(tick); });
    const stop = () => p.evaluate(() => { window.__rec = false; const f = window.__f.slice(2).sort((a, b) => a - b); return { frames: f.length, p50: +f[Math.floor(f.length * .5)].toFixed(1), p95: +f[Math.floor(f.length * .95)].toFixed(1), over50ms: f.filter((x) => x > 50).length }; });
    const out = {};
    await rec();
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 60) { await p.evaluate((y) => scrollTo(0, y), y); await sleep(16); }
    out.scroll = await stop();
    await p.evaluate(() => document.getElementById('ins-bar').scrollIntoView()); await sleep(800);
    await rec();
    for (const c of ['Trucking & Logistics', 'SaaS Growth', 'Product', 'all']) { await p.evaluate((c) => [...document.querySelectorAll('.ix-chip')].find((x) => x.dataset.cat === c).click(), c); await sleep(900); }
    out.filter = await stop();
    if (!mobile) {
      await p.evaluate(() => scrollTo(0, 0)); await sleep(600);
      await rec();
      for (let i = 0; i < 60; i++) { await p.mouse.move(200 + i * 18, 300 + Math.sin(i / 5) * 120); await sleep(16); }
      out.pointer = await stop();
    }
    out.cls = +(await p.evaluate(() => window.__cls)).toFixed(4);
    out.stats = await p.evaluate(() => [...document.querySelectorAll('[data-count]')].map((e) => e.getAttribute('data-count')).join(' / '));
    console.log(w + 'px', JSON.stringify(out));
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
