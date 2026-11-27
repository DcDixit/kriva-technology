/* f6f23fa layout check: for all 12 articles, compare baseline vs candidate build at widths around the 1081px breakpoint.
   Measures: has contents rail, prose left/width, gap between prose end and related reads, overflow; saves screenshots
   of the prose start and the related-reads transition.
   Usage: node layout_compare.cjs <baseOrigin> <candOrigin> <out.json> <shotsDir> */
const fs = require('fs'), path = require('path');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [BASE, CAND, OUT, SHOTS] = process.argv.slice(2);
const SLUGS = ['ai-in-product-design-2026', 'build-vs-buy-tms', 'choosing-a-digital-agency', 'crm-dashboard-ux-patterns', 'dispatch-software-cost', 'moving-company-website-features', 'no-code-vs-custom-mvp', 'quickbooks-xero-integration-guide', 'saas-mvp-uk-guide', 'saas-onboarding-patterns', 'trucking-dispatch-crm-guide', 'trucking-company-website-cost'];
const WIDTHS = [390, 1024, 1080, 1081, 1280, 1440, 1600];
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const rows = [];
  for (const slug of SLUGS) for (const w of WIDTHS) {
    const r = { slug, w };
    for (const [label, origin] of [['base', BASE], ['cand', CAND]]) {
      const p = await browser.newPage();
      const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      await p.setViewport({ width: w, height: 900 });
      await p.goto(origin + '/insights/' + slug, { waitUntil: 'load' });
      const m = await p.evaluate(async () => {
        for (let y = 0; y <= document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(z => setTimeout(z, 40)); }
        await new Promise(z => setTimeout(z, 700));
        const body = document.querySelector('.ix-body');
        const prose = document.querySelector('.ix-prose');
        const rail = body && Array.from(body.children).find(c => c !== prose && c.matches('aside, nav, .ix-toc, [class*="toc"], [class*="rail"]'));
        const related = document.querySelector('.ix-body .related, .related');
        const pr = prose && prose.getBoundingClientRect(), rr = related && related.getBoundingClientRect();
        return { railFirst: !!(body && prose && body.firstElementChild !== prose), proseLeft: pr && Math.round(pr.left), proseWidth: pr && Math.round(pr.width), proseOpacity: prose && getComputedStyle(prose).opacity, gapToRelated: pr && rr ? Math.round(rr.top - pr.bottom) : null, relatedWidth: rr && Math.round(rr.width), overflow: document.documentElement.scrollWidth - innerWidth };
      });
      r[label] = { ...m, errs };
      if (SHOTS && [1080, 1081, 1440].includes(w) && ['saas-mvp-uk-guide', 'build-vs-buy-tms'].includes(slug)) {
        await p.evaluate(() => { const c = document.querySelector('#kriva-consent'); if (c) c.hidden = true; const pr = document.querySelector('.ix-prose'); pr.scrollIntoView({ block: 'start' }); scrollBy(0, -120); });
        await new Promise(z => setTimeout(z, 300));
        await p.screenshot({ path: path.join(SHOTS, `${slug}_${w}_${label}_start.png`) });
        await p.evaluate(() => { const rl = document.querySelector('.related'); if (rl) { rl.scrollIntoView({ block: 'center' }); } });
        await new Promise(z => setTimeout(z, 300));
        await p.screenshot({ path: path.join(SHOTS, `${slug}_${w}_${label}_related.png`) });
      }
      await p.close();
    }
    r.changed = ['proseLeft', 'proseWidth', 'gapToRelated', 'relatedWidth'].filter(k => r.base[k] !== r.cand[k]);
    r.ok = r.cand.proseOpacity === '1' && r.cand.overflow <= 1 && r.cand.errs.length === 0;
    rows.push(r);
    console.log((r.ok ? 'OK  ' : 'BAD ') + slug.padEnd(34) + String(w).padStart(5) + ' rail:' + (r.base.railFirst ? 'Y' : 'N') + ' prose ' + r.base.proseLeft + '/' + r.base.proseWidth + ' -> ' + r.cand.proseLeft + '/' + r.cand.proseWidth + '  gap ' + r.base.gapToRelated + ' -> ' + r.cand.gapToRelated + (r.cand.errs.length ? ' ERR ' + r.cand.errs[0] : '') + (r.cand.overflow > 1 ? ' OVERFLOW ' + r.cand.overflow : ''));
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
})();
