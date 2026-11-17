// Functional QA for the mx redesign (/markets/* and /industries): interactions, a stubbed form
// submit (no real email: /api/inquiry is answered with {ok:true,channel:"stub"} and the
// Web3Forms/FormSubmit fallbacks are blocked), internal links, and a reduced-motion pass.
// Usage: node _qa_mkt.cjs
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177';
const ROUTES = { us: '/markets/us', uk: '/markets/uk', au: '/markets/au', uae: '/markets/uae', ca: '/markets/ca', ind: '/industries' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const allLinks = new Set();
  let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
  for (const [k, route] of Object.entries(ROUTES)) {
    console.log(k, route);
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.setRequestInterception(true);
    let posted = null;
    page.on('request', (r) => {
      if (r.url().includes('/api/inquiry')) { posted = r.postData() || ''; return r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, channel: 'stub' }) }); }
      if (/web3forms|formsubmit/.test(r.url())) { errs.push('fallback hit ' + r.url()); return r.abort(); }
      r.continue();
    });
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + route, { waitUntil: 'networkidle2' });
    await sleep(800);
    const base = await page.evaluate(() => ({
      canon: document.querySelector('link[rel=canonical]')?.href, desc: !!document.querySelector('meta[name=description]'),
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].every((s) => { try { JSON.parse(s.textContent); return true; } catch (e) { return false; } }),
      h1: document.querySelectorAll('h1').length, speak: ['h1', '.lede', '.eyebrow'].every((s) => document.querySelector('main ' + s)),
      mx: window.__mx === true, ids: (() => { const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); return ids.length - new Set(ids).size; })(),
      railTargets: [...document.querySelectorAll('.mx-rail a')].every((a) => document.querySelector(a.getAttribute('href'))),
      links: [...new Set([...document.querySelectorAll('main a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0]))],
      anchors: [...document.querySelectorAll('main a[href^="#"]')].every((a) => document.querySelector(a.getAttribute('href'))),
      cur: document.querySelector('.mx-switch-grid [aria-current="page"]')?.getAttribute('href') || null,
      tz: [...document.querySelectorAll('[data-tz]')].every((e) => /\d\d:\d\d/.test(e.textContent))
    }));
    base.links.forEach((l) => allLinks.add(l));
    ok(base.mx, 'markets-x.js ran');
    ok(base.h1 === 1 && base.speak, 'one h1 + speakable selectors (h1, .lede, .eyebrow) present');
    ok(base.ld && base.canon && base.desc, 'schema parses, canonical + description kept');
    ok(base.ids === 0, 'no duplicate ids');
    ok(base.railTargets && base.anchors, 'rail + in-page anchors resolve');
    ok(base.tz, 'live clocks rendered');
    if (k !== 'ind') ok(base.cur === route, 'market switch marks current page');
    if (k === 'uk') {
      await page.click('[data-uk-admin] button[data-act="Data deleted"]');
      ok(await page.$eval('.uk-log li b', (b) => b.textContent === 'Data deleted'), 'UK admin action writes an audit line');
    }
    if (k === 'au') {
      const btn = (await page.$$('.au-st'))[6];
      await btn.click();
      ok(await page.$eval('[data-au-rule] b', (b) => b.textContent === 'Western Australia') && await page.$eval('[data-au-rule] code', (c) => c.textContent.includes('wa-own')), 'AU: WA picks its own rule set');
    }
    if (k === 'uae') {
      await page.click('.ae-toggle button:nth-child(2)');
      ok(await page.$eval('.ae-body[dir="rtl"]', (e) => !e.hidden && getComputedStyle(e).direction === 'rtl'), 'UAE Arabic view is RTL');
      await page.click('#ae-tab-1');
      ok(await page.$eval('#ae-pan-1', (e) => !e.hidden) && await page.$eval('#ae-pan-0', (e) => e.hidden), 'UAE tab click switches panel');
      await page.focus('#ae-tab-1');
      await page.keyboard.press('ArrowDown');
      ok(await page.$eval('#ae-tab-2', (e) => e.getAttribute('aria-selected') === 'true' && document.activeElement === e), 'UAE tabs arrow-key navigation');
      await page.click('#ae-q-2');
      ok(await page.$eval('#ae-q-2', (b) => b.getAttribute('aria-expanded') === 'true') && await page.$eval('#ae-q-0', (b) => b.getAttribute('aria-expanded') === 'false'), 'UAE FAQ accordion');
      ok(await page.$$eval('.ae-q', (q) => q.length === 5), 'UAE keeps all five FAQ entries (FAQPage schema)');
    }
    if (k === 'ca') {
      await page.click('.ca-prov[data-name="British Columbia"]');
      ok(await page.$$eval('[data-ca-tax] .ca-chip', (c) => c.map((x) => x.textContent).join('+') === 'GST+PST'), 'CA: BC shows GST + PST');
      await page.click('.ca-lang-sw button:nth-child(2)');
      ok(await page.$eval('.ca-lang-row span', (s) => s.textContent === 'Envoyer la facture'), 'CA: FR toggle');
    }
    if (k === 'ind') ok(await page.$$eval('.in-chap', (c) => c.length === 5), 'five industry chapters');
    await page.$eval('#inquire', (e) => e.scrollIntoView());
    await page.click('#pageInquiry [type=submit]');
    await sleep(300);
    ok(posted === null && await page.$eval('#inq-name', (e) => e.getAttribute('aria-invalid') === 'true'), 'empty submit is blocked and flags the name field');
    await page.type('#inq-name', 'QA Test');
    await page.type('#inq-email', 'qa@example.com');
    await page.type('#inq-details', 'QA run for the markets redesign, please ignore.');
    await page.click('#pageInquiry [type=submit]');
    await sleep(1500);
    ok(!!posted && posted.includes('QA Test'), 'valid submit posts to /api/inquiry (stubbed)');
    ok(await page.$eval('.inq-done', (e) => getComputedStyle(e).display !== 'none'), 'success state shown');
    ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
    const p2 = await browser.newPage();
    await p2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p2.goto(BASE + route, { waitUntil: 'networkidle2' });
    const hidden = await p2.evaluate(() => [...document.querySelectorAll('main [data-x], main [data-split]')].filter((e) => getComputedStyle(e).opacity === '0').length);
    ok(hidden === 0, 'reduced motion: nothing left hidden');
    await p2.close();
    await page.close();
  }
  const page = await browser.newPage();
  const bad = [];
  for (const l of allLinks) {
    const r = await page.goto(BASE + l, { waitUntil: 'domcontentloaded' }).catch(() => null);
    if (!r || r.status() >= 400) bad.push(l + ' ' + (r ? r.status() : 'ERR'));
  }
  ok(bad.length === 0, `internal links (${allLinks.size}) resolve` + (bad.length ? ': ' + bad.join(', ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
})().catch((e) => { console.error(e); process.exit(1); });
