/* Before/after full-page shots for the background refinement (cream -> white).
   Usage: node _shots_bg.cjs before|after [routeFilter]
   Output: _shots/bg-white/<phase>/<desktop-1440|mobile-390>/<slug>.jpg
   Reduced motion is emulated so scroll reveals render in a full-page capture. */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5177}`;
const phase = process.argv[2] || 'before';
const filter = process.argv[3] || '';
const routes = [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/').filter((r) => r.includes(filter));
const VPS = [['desktop-1440', 1440, 900], ['mobile-390', 390, 844]];
const slug = (r) => (r === '/' ? 'home' : r.replace(/^\//, '').replace(/\//g, '__'));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  for (const [vp, w, h] of VPS) {
    const dir = path.join('_shots', 'bg-white', phase, vp);
    fs.mkdirSync(dir, { recursive: true });
    for (const r of routes) {
      const p = await b.newPage();
      await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
      await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await p.setRequestInterception(true);
      p.on('request', (q) => (/web3forms|formsubmit|googletagmanager|clarity/.test(q.url()) ? q.abort() : q.continue()));
      await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((z) => setTimeout(z, 40)); } scrollTo(0, 0); });
      await new Promise((z) => setTimeout(z, 500));
      await p.screenshot({ path: path.join(dir, slug(r) + '.jpg'), fullPage: true, type: 'jpeg', quality: 62 }).catch((e) => console.log('FAIL', r, e.message));
      await p.close();
    }
    console.log('done', vp, routes.length);
  }
  await b.close();
})();
