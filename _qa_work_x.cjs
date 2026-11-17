// Functional QA for /work (wx layer): filters, URL sync, deep links, links, card hit areas,
// reduced motion. Writes extra review shots to _shots/work/qa. Usage: node _qa_work_x.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177';
const OUT = path.join('_shots', 'work', 'qa');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const state = (p) => p.evaluate(() => ({
    shown: [...document.querySelectorAll('.wk-case')].filter((e) => !e.hidden).length,
    count: document.getElementById('count').textContent,
    pressed: document.querySelector('.wk-chip[aria-pressed="true"]').dataset.f,
    prodHidden: document.getElementById('product-cases').hidden,
    webHidden: document.getElementById('websites').hidden,
    url: location.pathname + location.search + location.hash,
    ind: (() => { const i = document.querySelector('.wx-ind'); const c = document.querySelector('.wk-chip[aria-pressed="true"]'); return Math.abs(new DOMMatrix(getComputedStyle(i).transform).m41 - c.offsetLeft) < 2 && Math.abs(i.offsetWidth - c.offsetWidth) < 2; })()
  }));

  for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
    console.log(tag);
    const p = await browser.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.setViewport({ width: w, height: h, isMobile: w < 600, hasTouch: w < 600 });
    await p.goto(BASE + '/work', { waitUntil: 'networkidle2' });
    await sleep(800);
    let s = await state(p);
    ok(s.shown === 15 && s.count === 'Showing 15 of 15' && s.pressed === 'all', 'boot: all 15 shown');
    await p.click('.wk-chip[data-f="mobile"]'); await sleep(900);
    s = await state(p);
    ok(s.shown === 1 && !s.prodHidden && s.webHidden && s.url === '/work?filter=mobile', 'mobile filter: 1 shown, websites group hidden, URL ' + s.url);
    ok(s.ind, 'indicator sits under the pressed chip');
    await p.screenshot({ path: path.join(OUT, tag + '-filter-mobile.png') });
    await p.click('.wk-chip[data-f="web-design"]'); await sleep(900);
    s = await state(p);
    ok(s.shown === 7 && s.prodHidden && !s.webHidden && s.url === '/work?filter=web-design#web-design', 'web-design filter: 7 shown, URL ' + s.url);
    await p.click('.wk-chip[data-f="trucking"]'); await sleep(900);
    s = await state(p);
    ok(s.shown === 4 && !s.prodHidden && !s.webHidden, 'trucking filter: 4 shown (lead + 3 sites)');
    await p.screenshot({ path: path.join(OUT, tag + '-filter-trucking.png') });
    await p.click('.wk-chip[data-f="all"]'); await sleep(900);
    s = await state(p);
    ok(s.shown === 15 && s.url === '/work', 'back to all, URL ' + s.url);
    /* Keyboard: arrow keys move focus between chips */
    await p.focus('.wk-chip[data-f="all"]'); await p.keyboard.press('ArrowRight');
    ok(await p.evaluate(() => document.activeElement.dataset.f === 'web-design'), 'ArrowRight moves chip focus');
    /* Card hit area: clicking the visual of a product card goes to its case */
    const href = await p.evaluate(() => {
      const card = document.querySelectorAll('#work-grid .wk-card')[1];
      card.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = card.querySelector('.wk-visual').getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return el && el.closest('a') && el.closest('a').getAttribute('href');
    });
    ok(href === '/work/finance-sync-hub', 'product card visual is clickable → ' + href);
    const svc = await p.evaluate(() => {
      const a = document.querySelector('#work-grid .wk-svc a'); a.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = a.getBoundingClientRect(); const el = document.elementFromPoint(r.left + 4, r.top + r.height / 2);
      return el && el.closest('a') && el.closest('a').getAttribute('href');
    });
    ok(svc === '/services/saas-platforms', 'service link inside a card stays clickable → ' + svc);
    const web = await p.evaluate(() => {
      const card = document.querySelector('#web-grid .wk-card'); card.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = card.querySelector('.wk-visual').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const a = el && el.closest('a'); return a && [a.getAttribute('href'), a.target, a.rel].join(' ');
    });
    ok(web === 'https://elite-one.us _blank noopener noreferrer', 'web card opens live site in new tab → ' + web);
    ok(errs.length === 0, 'no page errors ' + errs.join('; '));
    await p.close();

    /* Deep links */
    const q = await browser.newPage();
    await q.setViewport({ width: w, height: h });
    await q.goto(BASE + '/work?filter=finance', { waitUntil: 'networkidle2' }); await sleep(600);
    s = await state(q);
    ok(s.shown === 1 && s.pressed === 'finance', '?filter=finance boots filtered');
    await q.goto(BASE + '/work#web-design', { waitUntil: 'networkidle2' }); await sleep(1200);
    s = await state(q);
    ok(s.shown === 7 && s.pressed === 'web-design', '#web-design boots the web filter');
    await q.close();
  }

  /* Reduced motion: everything visible, no animation */
  const r = await browser.newPage();
  await r.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await r.setViewport({ width: 1440, height: 900 });
  await r.goto(BASE + '/work', { waitUntil: 'networkidle2' }); await sleep(500);
  const rm = await r.evaluate(() => ({
    motion: document.documentElement.classList.contains('wx-motion'),
    hidden: [...document.querySelectorAll('.wk-case,[data-x]')].filter((e) => !e.hidden && getComputedStyle(e).opacity !== '1').length,
    anim: getComputedStyle(document.querySelector('.wx-track')).animationName
  }));
  ok(!rm.motion && rm.hidden === 0 && rm.anim === 'none', 'reduced motion: no motion class, all content visible, reel still');
  await r.close();
  await browser.close();
  console.log(fails ? fails + ' failure(s)' : 'all checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
