// Verifies the shared/faq.css selector hotfix locally.
// 1) /faq at 1440 and 390: layout sane, accordion, jump links, stubbed form, links, errors; full-page shots.
// 2) Pricing: the working-tree page must not load faq.css; the committed (production) pricing page
//    must render pixel-identical with the old (HEAD) faq.css and the fixed one.
// Usage: node _qa_faq_hotfix.cjs
const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177'; const OUT = path.join('_shots', 'faq', 'hotfix');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const headCss = execSync('git show HEAD:shared/faq.css').toString();
const headPricing = execSync('git show HEAD:kriva-pricing.html').toString();

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });

  // ---- FAQ
  for (const w of [1440, 390]) {
    const p = await b.newPage(); const errs = []; let posted = null;
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push(r.status() + ' ' + r.url()); });
    await p.setRequestInterception(true);
    p.on('request', (r) => {
      if (r.url().includes('/api/inquiry')) { posted = true; return r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true,"channel":"stub"}' }); }
      if (/web3forms|formsubmit/.test(r.url())) { posted = 'FALLBACK'; return r.abort(); }
      r.continue();
    });
    await p.setViewport({ width: w, height: 900, isMobile: w < 600, hasTouch: w < 600 });
    await p.goto(BASE + '/faq', { waitUntil: 'networkidle2' });
    const tot = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < tot; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await sleep(60); }
    await p.evaluate(() => scrollTo(0, 0)); await sleep(800);
    const m = await p.evaluate(() => {
      const h1 = document.querySelector('h1').getBoundingClientRect();
      return {
        height: document.documentElement.scrollHeight,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bodyDisplay: getComputedStyle(document.body).display,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        h1: [h1.left, h1.top, h1.width].map(Math.round),
        questions: document.querySelectorAll('.faq-q').length,
        hiddenReveals: [...document.querySelectorAll('[data-r]')].filter((e) => getComputedStyle(e).opacity === '0' && !e.closest('.cta-band')).length
      };
    });
    await p.screenshot({ path: path.join(OUT, `faq-${w}.png`), fullPage: true });

    // accordion: open #1, then #5 -> only #5 open
    const acc = await p.evaluate(async () => {
      const q = [...document.querySelectorAll('.faq-q')];
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      q[0].click(); await wait(700);
      const a1 = document.getElementById(q[0].getAttribute('aria-controls')).getBoundingClientRect().height;
      q[4].click(); await wait(700);
      return {
        firstOpenHeight: Math.round(a1),
        openNow: q.filter((x) => x.getAttribute('aria-expanded') === 'true').map((x) => x.id),
        fifthHeight: Math.round(document.getElementById(q[4].getAttribute('aria-controls')).getBoundingClientRect().height)
      };
    });
    await p.screenshot({ path: path.join(OUT, `faq-${w}-accordion.png`) });

    // jump links: section top after click (header is ~72px)
    const jumps = {};
    for (const id of ['together', 'delivery', 'start']) {
      await p.evaluate((id) => document.querySelector(`.faq-jump a[href="#${id}"]`).click(), id);
      await sleep(1200);
      jumps[id] = await p.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), id);
    }

    // form (stubbed: nothing is sent)
    await p.evaluate(() => document.getElementById('inquire').scrollIntoView()); await sleep(500);
    await p.type('#inq-name', 'QA Stub'); await p.type('#inq-email', 'qa@example.com'); await p.type('#inq-details', 'Hotfix layout QA - stubbed, not sent.');
    await p.click('#pageInquiry button[type=submit]'); await sleep(1800);
    const done = await p.evaluate(() => { const d = document.querySelector('.inq-done'); return getComputedStyle(d).display !== 'none' && d.getBoundingClientRect().height > 0; });

    const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('main a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0]))]);
    const bad = [];
    for (const l of links) { const s = await p.evaluate(async (u) => (await fetch(u)).status, l); if (s >= 400) bad.push(l + ' ' + s); }
    console.log(`FAQ ${w}px`, JSON.stringify({ ...m, accordion: acc, jumpTops: jumps, form: posted === true && done ? 'stub ok' : posted, linksChecked: links.length, badLinks: bad, errors: errs }));
    await p.close();
  }

  // ---- Pricing
  const shotPricing = async (html, css) => {
    const p = await b.newPage(); const reqs = [];
    await p.setViewport({ width: 1440, height: 900 });
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.setRequestInterception(true);
    p.on('request', (r) => {
      reqs.push(r.url());
      if (html && r.isNavigationRequest()) return r.respond({ status: 200, contentType: 'text/html', body: html });
      if (css && r.url().includes('/shared/faq.css')) return r.respond({ status: 200, contentType: 'text/css', body: css });
      r.continue();
    });
    await p.goto(BASE + '/pricing', { waitUntil: 'networkidle2' }); await sleep(1000);
    const buf = await p.screenshot({ fullPage: true, encoding: 'base64' }); await p.close();
    return { buf, loadsFaqCss: reqs.some((u) => u.includes('/shared/faq.css')) };
  };
  const diff = async (x, y) => {
    const p = await b.newPage();
    const r = await p.evaluate(async (x, y) => {
      const L = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
      const [i1, i2] = await Promise.all([L(x), L(y)]);
      if (i1.height !== i2.height || i1.width !== i2.width) return `size ${i1.width}x${i1.height} vs ${i2.width}x${i2.height}`;
      const cv = (n) => { const k = document.createElement('canvas'); k.width = n.width; k.height = n.height; const g = k.getContext('2d'); g.drawImage(n, 0, 0); return g.getImageData(0, 0, n.width, n.height).data; };
      const A = cv(i1), B = cv(i2); let n = 0;
      for (let i = 0; i < A.length; i += 4) if (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2]) n++;
      return `${n} differing pixels of ${A.length / 4} (${i1.width}x${i1.height})`;
    }, x, y);
    await p.close(); return r;
  };
  const wtA = await shotPricing(null, headCss);
  const wtB = await shotPricing(null, null);
  console.log('Pricing (working tree, redesigned): loads faq.css =', wtB.loadsFaqCss, '| old vs fixed faq.css:', await diff(wtA.buf, wtB.buf));
  const prodOld = await shotPricing(headPricing, headCss);
  const prodNew = await shotPricing(headPricing, null);
  console.log('Pricing (committed/production page): loads faq.css =', prodNew.loadsFaqCss, '| old vs fixed faq.css:', await diff(prodOld.buf, prodNew.buf));
  fs.writeFileSync(path.join(OUT, 'pricing-production-with-fix-1440.png'), Buffer.from(prodNew.buf, 'base64'));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
