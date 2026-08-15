/* Real-browser QA: computed-style contrast, horizontal overflow, tap targets,
   focus visibility, and accordion keyboard behaviour. Screenshots to _shots/.
   Requires the preview server: $env:PORT=5199; node serve-preview.js */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = `http://localhost:${process.env.PORT || 5199}`;
const OUT = '_shots';
const SHOT = process.argv.includes('--shots');

const PAGES = ['/', '/about', '/contact', '/faq', '/process', '/work',
  '/work/fleetflow-dispatch', '/solutions/trucking-logistics', '/solutions/saas',
  '/services/crm-development', '/insights'];
const WIDTHS = [1440, 1280, 1024, 768, 390, 375];

/* Runs in the page: walks every text node, resolves the real backdrop colour,
   and computes the WCAG ratio. This catches failures a CSS grep cannot. */
const AUDIT = () => {
  const lum = ([r, g, b]) => {
    const c = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a));

  const bgOf = (el) => {
    let n = el;
    let stack = [];
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
      n = n.parentElement;
    }
    let base = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };

  const docEl = document.documentElement;
  // only a real horizontal scrollbar counts; clipped decoration inside overflow:hidden does not
  const scrolls = docEl.scrollWidth > docEl.clientWidth + 1;
  const out = { contrast: [], overflow: [], tap: [], docW: docEl.scrollWidth, view: docEl.clientWidth, scrolls };
  const seen = new Set();

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    // skip links are parked off-canvas until focused, by design
    if (cs.position === 'absolute' && el.getBoundingClientRect().left < -200) continue;

    const r = el.getBoundingClientRect();

    // horizontal overflow — only when the document actually scrolls sideways
    if (scrolls && r.width > 0 && r.right > docEl.clientWidth + 2) {
      const sig = el.tagName + '.' + (el.className || '').toString().slice(0, 40);
      if (!seen.has('o' + sig)) {
        seen.add('o' + sig);
        out.overflow.push({ sig, left: Math.round(r.left), right: Math.round(r.right) });
      }
    }

    // tap targets — WCAG 2.2 SC 2.5.8 exempts links inline in a sentence
    if (/^(A|BUTTON)$/.test(el.tagName) && r.width > 0 && r.height > 0 && r.height < 24) {
      const p = el.parentElement;
      const inlineInText = p && /^(P|LI|SPAN|EM|STRONG|TD)$/.test(p.tagName)
        && p.textContent.trim().length > el.textContent.trim().length + 12;
      if (!inlineInText) {
        const sig = el.tagName + '.' + (el.className || '').toString().slice(0, 30) + '|' + (el.textContent || '').trim().slice(0, 22);
        if (!seen.has('t' + sig)) { seen.add('t' + sig); out.tap.push({ sig, h: Math.round(r.height) }); }
      }
    }

    // contrast on elements holding direct text
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!direct || r.width === 0 || r.height === 0) continue;

    const fg = parse(cs.color);
    if (!fg) continue;
    const bg = bgOf(el);
    const f = over(fg, bg);
    const L1 = lum(f), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

    const size = parseFloat(cs.fontSize);
    const weight = +cs.fontWeight || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;

    if (ratio < need) {
      const sig = `${el.tagName}.${(el.className || '').toString().slice(0, 34)}`;
      if (seen.has('c' + sig)) continue;
      seen.add('c' + sig);
      out.contrast.push({
        sig, ratio: +ratio.toFixed(2), need, size: +size.toFixed(1), weight,
        text: (el.textContent || '').trim().slice(0, 44),
        fg: cs.color, bg: `rgb(${bg.map(Math.round).join(',')})`,
      });
    }
  }
  return out;
};

(async () => {
  if (SHOT && !fs.existsSync(OUT)) fs.mkdirSync(OUT);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--font-render-hinting=none'] });
  const results = {};
  let contrastTotal = 0, overflowTotal = 0, tapTotal = 0;

  for (const p of PAGES) {
    results[p] = {};
    for (const w of WIDTHS) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      let r;
      try {
        await page.goto(BASE + p, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise((s) => setTimeout(s, 250));
        r = await page.evaluate(AUDIT);
      } catch (e) {
        console.log(`  ERROR ${p} @${w}: ${e.message}`);
        await page.close();
        continue;
      }

      const bad = r.contrast.length + r.overflow.length + r.tap.length;
      contrastTotal += r.contrast.length;
      overflowTotal += r.overflow.length;
      tapTotal += r.tap.length;
      results[p][w] = r;

      if (bad) {
        console.log(`\n${p} @ ${w}px  (doc width ${r.docW})`);
        r.overflow.forEach((o) => console.log(`   OVERFLOW  ${o.sig}  left=${o.left} right=${o.right}`));
        r.tap.forEach((t) => console.log(`   TAP ${t.h}px  ${t.sig}`));
        r.contrast.forEach((c) => console.log(`   CONTRAST ${c.ratio}:1 (need ${c.need}) ${c.size}px/${c.weight} ${c.sig} "${c.text}" ${c.fg} on ${c.bg}`));
      }

      if (SHOT && (w === 1440 || w === 390)) {
        const name = (p === '/' ? 'home' : p.replace(/\//g, '_').replace(/^_/, '')) + `_${w}.png`;
        await page.screenshot({ path: path.join(OUT, name), fullPage: p === '/' });
      }
      await page.close();
    }
  }

  /* accordion + focus behaviour on the homepage */
  console.log('\n──── interaction checks ────');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  const faq = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.faq-q')];
    if (!btns.length) return { error: 'no .faq-q found' };
    const first = btns[0];
    const panel = document.getElementById(first.getAttribute('aria-controls'));
    const before = { exp: first.getAttribute('aria-expanded'), vis: getComputedStyle(panel).visibility };
    first.click();
    const after = { exp: first.getAttribute('aria-expanded'), vis: getComputedStyle(panel).visibility };
    btns[1].click();
    const excl = { first: first.getAttribute('aria-expanded'), second: btns[1].getAttribute('aria-expanded') };
    return { count: btns.length, before, after, excl, hasRegion: !!panel.getAttribute('role') };
  });
  console.log('  FAQ:', JSON.stringify(faq));

  const kb = await page.evaluate(() => {
    const b = document.querySelector('.faq-q');
    b.focus();
    const cs = getComputedStyle(b, null);
    return { focused: document.activeElement === b, outline: cs.outlineWidth + ' ' + cs.outlineStyle };
  });
  console.log('  keyboard focus:', JSON.stringify(kb));

  const model = await page.evaluate(() => {
    const s = document.querySelector('#model');
    return s ? { rows: s.querySelectorAll('.model-list li').length, h: Math.round(s.getBoundingClientRect().height) } : { error: 'missing' };
  });
  console.log('  working-model section:', JSON.stringify(model));
  await page.close();

  await browser.close();
  console.log('\n════ VISUAL QA TOTALS ════');
  console.log('contrast failures:', contrastTotal);
  console.log('overflow instances:', overflowTotal);
  console.log('small tap targets:', tapTotal);
  fs.writeFileSync('_qa_visual_results.json', JSON.stringify(results, null, 1));
})();
