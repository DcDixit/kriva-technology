/* Full route QA against a served `vercel build` output. Writes one JSON line per route as it goes.
   Per route x width: HTTP status, same-origin 4xx/5xx, console + page errors, reveal elements still hidden after a
   full human-like scroll, horizontal overflow (and the widest offending element), <h1> count, broken images.
   At 1440 also an SEO snapshot (title, description, canonical, robots, hreflang, JSON-LD types + validity, og:image).
   Usage: node final_qa.cjs <origin> <vercel.json> <out.jsonl> <width>
   Puppeteer keeps navigator.webdriver=true, so the consent gate never loads GA4/Clarity. */
const fs = require('fs');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [ORIGIN, VJ, OUT, W] = process.argv.slice(2);
const w = Number(W);
const routes = JSON.parse(fs.readFileSync(VJ, 'utf8')).rewrites.map(r => r.source).filter(s => !/[:(*]/.test(s));
const H = { 360: 740, 390: 844, 768: 1024, 1440: 900 };
(async () => {
  fs.writeFileSync(OUT, '');
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();
  let cur = { bad: [], errs: [] };
  page.on('response', r => { if (r.url().startsWith(ORIGIN) && r.status() >= 400) cur.bad.push(r.status() + ' ' + r.url().replace(ORIGIN, '')); });
  page.on('requestfailed', r => { if (r.url().startsWith(ORIGIN)) cur.bad.push('failed ' + r.url().replace(ORIGIN, '')); });
  page.on('console', m => { if (m.type() === 'error') cur.errs.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => cur.errs.push('pageerror: ' + String(e.message).slice(0, 160)));
  await page.setViewport({ width: w, height: H[w] || 900 });
  let n = 0;
  for (const r of routes) {
    cur = { bad: [], errs: [] };
    let status = 0, row;
    try {
      const resp = await page.goto(ORIGIN + r, { waitUntil: 'load', timeout: 45000 });
      status = resp.status();
      const res = await page.evaluate(async (wantSeo) => {
        const step = Math.round(innerHeight * 0.6);
        for (let y = 0; y <= document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(z => setTimeout(z, 50)); }
        await new Promise(z => setTimeout(z, 800));
        const hidden = Array.from(document.querySelectorAll('[data-r],[data-s],[data-mask]')).filter(el => {
          if (el.closest('[hidden],[aria-hidden="true"]')) return false;
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false;
          if (!el.getBoundingClientRect().height) return false;
          return parseFloat(cs.opacity) < 0.5;
        }).map(el => el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.'));
        const overflow = document.documentElement.scrollWidth - innerWidth;
        let wide = null;
        if (overflow > 1) {
          const els = Array.from(document.querySelectorAll('body *')).filter(e => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && b.width > 0 && getComputedStyle(e).position !== 'fixed'; });
          wide = els.slice(0, 4).map(e => e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\s+/)[0] + '@' + Math.round(e.getBoundingClientRect().right));
        }
        const brokenImg = Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src') && !i.closest('[hidden]')).map(i => i.getAttribute('src'));
        const out = { hidden, overflow, wide, h1: document.querySelectorAll('h1').length, brokenImg };
        if (wantSeo) {
          const q = s => document.querySelector(s);
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => { try { const j = JSON.parse(s.textContent); return [].concat(j['@graph'] || j).map(x => x['@type']).join('+'); } catch (e) { return 'INVALID'; } });
          out.seo = { title: document.title, desc: (q('meta[name=description]') || {}).content || null, canonical: (q('link[rel=canonical]') || {}).href || null, robots: (q('meta[name=robots]') || {}).content || null, lang: document.documentElement.lang, hreflang: Array.from(document.querySelectorAll('link[rel=alternate][hreflang]')).map(l => l.hreflang + '=' + l.getAttribute('href')).join(' '), ld: ld.join(' | '), og: (q('meta[property="og:image"]') || {}).content || null, h1text: ((q('h1') || {}).innerText || '').slice(0, 120) };
        }
        return out;
      }, w === 1440);
      row = { r, w, status, bad: [...new Set(cur.bad)], errs: [...new Set(cur.errs)], ...res };
    } catch (e) { row = { r, w, status, nav: String(e.message).slice(0, 120), bad: cur.bad, errs: cur.errs }; }
    fs.appendFileSync(OUT, JSON.stringify(row) + '\n');
    n++;
  }
  await browser.close();
  console.log('width ' + w + ': ' + n + ' routes done');
})();
