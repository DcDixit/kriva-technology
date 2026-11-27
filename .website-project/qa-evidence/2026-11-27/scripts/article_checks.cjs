/* Article validation on a served build. For all 12 insight articles x 5 widths: body visible after a full scroll,
   max visible ratio, hidden reveal elements, overflow, console errors.
   For every article additionally (390px): body text present in raw HTML (no JS, DOM-decoded), present in the
   accessibility tree (sampled phrases), deep link to the last h2 shows the body, JS-disabled render shows the body,
   internal links in the body resolve (HTTP 200 on the same origin).
   Usage: node article_checks.cjs <origin> <out.json> [shotsDir] */
const fs = require('fs');
const path = require('path');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [ORIGIN, OUT, SHOTS] = process.argv.slice(2);
const SLUGS = ['ai-in-product-design-2026', 'build-vs-buy-tms', 'choosing-a-digital-agency', 'crm-dashboard-ux-patterns', 'dispatch-software-cost', 'moving-company-website-features', 'no-code-vs-custom-mvp', 'quickbooks-xero-integration-guide', 'saas-mvp-uk-guide', 'saas-onboarding-patterns', 'trucking-dispatch-crm-guide', 'trucking-company-website-cost'];
const VPS = [[360, 740], [390, 844], [768, 1024], [1366, 768], [1440, 900]];
const BODY = '.ix-prose, .ix-body .prose, article .prose';
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const out = { visibility: [], deep: [] };
  for (const slug of SLUGS) {
    for (const [w, h] of VPS) {
      const page = await browser.newPage();
      const errs = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
      page.on('pageerror', e => errs.push('pageerror ' + String(e.message).slice(0, 140)));
      await page.setViewport({ width: w, height: h });
      const resp = await page.goto(ORIGIN + '/insights/' + slug, { waitUntil: 'load', timeout: 45000 });
      const m = await page.evaluate(async (BODY) => {
        const step = Math.round(innerHeight * 0.6);
        for (let y = 0; y <= document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
        await new Promise(r => setTimeout(r, 900));
        const b = document.querySelector(BODY);
        const hidden = Array.from(document.querySelectorAll('[data-r],[data-s],[data-mask]')).filter(el => !el.closest('[hidden],[aria-hidden="true"]') && el.getBoundingClientRect().height && parseFloat(getComputedStyle(el).opacity) < 0.5).length;
        return { body: b ? { sel: b.className, h: Math.round(b.getBoundingClientRect().height), opacity: getComputedStyle(b).opacity, words: b.textContent.split(/\s+/).filter(Boolean).length } : null, ratio: b ? +(innerHeight * 0.94 / b.getBoundingClientRect().height).toFixed(3) : null, hidden, overflow: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('h1').length };
      }, BODY);
      const row = { slug, w, status: resp.status(), ...m, errs };
      row.pass = row.status === 200 && !!m.body && m.body.opacity === '1' && m.hidden === 0 && m.overflow <= 1 && m.h1 === 1 && errs.length === 0;
      out.visibility.push(row);
      if (SHOTS && (w === 390 || w === 1440)) {
        await page.evaluate(BODY => { const b = document.querySelector(BODY); if (b) b.scrollIntoView({ block: 'start' }); scrollBy(0, 300); }, BODY);
        await new Promise(r => setTimeout(r, 400));
        await page.screenshot({ path: path.join(SHOTS, slug + '_' + w + '.png') });
      }
      await page.close();
    }
    // deep checks at 390
    const url = ORIGIN + '/insights/' + slug;
    const raw = await (await fetch(url)).text();
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(url, { waitUntil: 'load' });
    const d = await page.evaluate((raw, BODY) => {
      const b = document.querySelector(BODY);
      const norm = s => s.replace(/\s+/g, ' ').trim();
      const rawText = norm(new DOMParser().parseFromString(raw, 'text/html').body.textContent);
      const paras = Array.from(b.querySelectorAll('p')).map(p => norm(p.textContent)).filter(t => t.length > 80);
      const sample = [paras[0], paras[Math.floor(paras.length / 2)], paras[paras.length - 1]].filter(Boolean);
      const links = Array.from(b.querySelectorAll('a[href^="/"]')).map(a => a.getAttribute('href').split('#')[0]).filter(Boolean);
      const h2 = Array.from(b.querySelectorAll('h2[id]')).map(x => x.id);
      return { sample, inRaw: sample.map(s => rawText.includes(s)), links: [...new Set(links)], lastH2: h2[h2.length - 1] || null };
    }, raw, BODY);
    const snap = JSON.stringify(await page.accessibility.snapshot({ interestingOnly: false }));
    const a11y = d.sample.map(s => { const words = s.split(' ').slice(0, 5).join(' '); return snap.includes(words); });
    let deep = null;
    if (d.lastH2) {
      await page.goto(url + '#' + d.lastH2, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, 1200));
      deep = await page.evaluate((id, BODY) => { const r = document.getElementById(id).getBoundingClientRect(); return { inView: r.top < innerHeight && r.bottom > 0, opacity: getComputedStyle(document.querySelector(BODY)).opacity }; }, d.lastH2, BODY);
    }
    await page.close();
    const p2 = await browser.newPage();
    await p2.setJavaScriptEnabled(false);
    await p2.goto(url, { waitUntil: 'load' });
    const noJs = await p2.evaluate(BODY => getComputedStyle(document.querySelector(BODY)).opacity, BODY);
    await p2.close();
    const badLinks = [];
    for (const l of d.links) { const s = (await fetch(ORIGIN + l, { redirect: 'manual' })).status; if (s !== 200) badLinks.push(l + ' ' + s); }
    const row = { slug, inRaw: d.inRaw, a11y, deep, noJsOpacity: noJs, internalLinks: d.links.length, badLinks };
    row.pass = d.inRaw.every(Boolean) && a11y.every(Boolean) && (!deep || (deep.inView && deep.opacity === '1')) && noJs === '1' && badLinks.length === 0;
    out.deep.push(row);
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  const vf = out.visibility.filter(r => !r.pass), df = out.deep.filter(r => !r.pass);
  console.log('visibility: ' + (out.visibility.length - vf.length) + '/' + out.visibility.length + ' pass');
  vf.forEach(r => console.log('  FAIL ' + r.slug + ' @' + r.w + ' ' + JSON.stringify({ status: r.status, body: r.body, ratio: r.ratio, hidden: r.hidden, overflow: r.overflow, h1: r.h1, errs: r.errs })));
  console.log('content/crawl/a11y/deep-link/no-JS/links: ' + (out.deep.length - df.length) + '/' + out.deep.length + ' pass');
  df.forEach(r => console.log('  FAIL ' + JSON.stringify(r)));
})();
