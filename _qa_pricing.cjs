// QA for the /pricing redesign: content + price parity with git HEAD, schema unchanged, links,
// and live interactions. The form posts to a stubbed /api/inquiry (never real email).
// Usage: node _qa_pricing.cjs
const { execSync } = require('child_process');
const fs = require('fs');
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };

const head = execSync('git show HEAD:kriva-pricing.html', { maxBuffer: 1 << 24 }).toString();
const now = fs.readFileSync('kriva-pricing.html', 'utf8');
const mainOf = (s) => s.slice(s.indexOf('<main id="main">'), s.indexOf('</main>'));
const text = (s) => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const oldT = text(mainOf(head)), newT = text(mainOf(now));
const nodes = (h) => mainOf(h).replace(/<script[\s\S]*?<\/script>/g, '').split(/<[^>]+>/).map((x) => x.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()).filter((x) => x.length > 2 && x !== '→');
const sentences = nodes(head);
const missing = sentences.filter((x) => !newT.includes(x));
ok(missing.length === 0, `all ${sentences.length} text nodes from HEAD are on the page` + (missing.length ? '\n   missing: ' + missing.join('\n   missing: ') : ''));
for (const p of ['$4,800', '$18,000', '$6,500', '$15,000', '$8,000', '1.6–2×']) ok((oldT.split(p).length) === 2 ? newT.includes(p) : true, 'price present: ' + p);
const schema = (s) => s.slice(s.indexOf('<!-- KRIVA_SCHEMA_START -->'), s.indexOf('<!-- KRIVA_SCHEMA_END -->')).replace(/\r/g, '');
ok(schema(head) === schema(now), 'JSON-LD schema block byte-identical (OfferCatalog prices unchanged)');
const headPart = (s) => s.slice(0, s.indexOf('<style>')).replace(/\r/g, '').replace(/<script>\(function\(d\)[\s\S]*?<\/script>|<script>document\.documentElement[^<]*<\/script>/, '');
ok(headPart(head) === headPart(now), 'title, meta, canonical, OG and analytics unchanged');
const hrefs = (s) => new Set([...mainOf(s).matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
const lost = [...hrefs(head)].filter((h) => !hrefs(now).has(h));
ok(lost.length === 0, 'every link in the old page body is still present' + (lost.length ? ': ' + lost.join(', ') : ''));
const ids = (s) => new Set([...mainOf(s).matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
const lostIds = [...ids(head)].filter((i) => !ids(now).has(i));
ok(lostIds.length === 0, 'every anchor id kept (#websites, #mobile, #design, #software, #accounting, …)' + (lostIds.length ? ': ' + lostIds.join(', ') : ''));
const formOf = (s) => s.slice(s.indexOf('<form class="inq-form"'), s.indexOf('</form>')).replace(/\r/g, '');
ok(formOf(head) === formOf(now), 'inquiry form markup byte-identical');

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.setRequestInterception(true);
  let posted = null;
  page.on('request', (r) => {
    if (r.url().includes('/api/inquiry')) { posted = r.postData() || ''; return r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, channel: 'stub' }) }); }
    if (/web3forms|formsubmit/.test(r.url())) { errs.push('BLOCKED external form fallback ' + r.url()); return r.abort(); }
    r.continue();
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + '/pricing', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Links
  const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0]))]);
  const bad = [];
  for (const l of links) { const r = await fetch(BASE + l).catch(() => null); if (!r || r.status >= 400) bad.push(l + ' ' + (r && r.status)); }
  ok(bad.length === 0, `all ${links.length} internal link targets return < 400` + (bad.length ? ': ' + bad.join(', ') : ''));
  const hashes = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.querySelector(h)));
  ok(hashes.length === 0, 'all in-page #anchors resolve' + (hashes.length ? ': ' + hashes.join(', ') : ''));

  // Estimate picker
  await page.click('.pz-est-pick button[data-i="1"]');
  await sleep(1600);
  let est = await page.evaluate(() => ({ n: document.querySelector('[data-pz-name]').textContent, p: document.querySelector('[data-pz-price]').textContent, pressed: document.querySelector('.pz-est-pick button[data-i="1"]').getAttribute('aria-pressed') }));
  ok(est.n === 'Mobile application design and development' && est.p === '$18,000' && est.pressed === 'true', 'hero picker: Mobile app → ' + est.n + ' ' + est.p);
  await page.click('.pz-est-pick button[data-i="4"]');
  await sleep(3200);
  est = await page.evaluate(() => ({ n: document.querySelector('[data-pz-name]').textContent, p: document.querySelector('[data-pz-price]').textContent, done: document.querySelector('[data-pz-est]').classList.contains('is-done') }));
  ok(est.n === 'QuickBooks and Xero integrations' && est.p === '$8,000' && est.done, 'hero picker: Accounting → ' + est.n + ' ' + est.p + ', quote stamped');

  // Card prices settle on the printed values after count-up
  for (const id of ['websites', 'mobile', 'design', 'software', 'accounting']) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'center' }), id);
    await sleep(1500);
    const r = await page.evaluate((id) => ({ shown: document.querySelector('#' + id + ' [data-pz-count]').textContent, cur: document.querySelector('.pz-index a[aria-current="true"]')?.getAttribute('href') }), id);
    ok(r.cur === '#' + id, `index marks #${id} while its card is in view; card shows ${r.shown}`);
  }
  const shown = await page.evaluate(() => [...document.querySelectorAll('[data-pz-count]')].map((e) => e.textContent).join(' '));
  ok(shown === '$4,800 $18,000 $6,500 $15,000 $8,000', 'card prices after count-up: ' + shown);

  // CTA pre-fill
  await page.click('#accounting .pz-go');
  await sleep(1200);
  let sel = await page.$eval('#inq-ptype', (s) => s.value);
  ok(sel === 'QuickBooks or Xero integration', 'Accounting card CTA pre-fills Service: ' + sel);
  await page.evaluate(() => document.querySelector('#mobile .pz-go').click());
  sel = await page.$eval('#inq-ptype', (s) => s.value);
  ok(sel === 'Mobile app', 'Mobile card CTA pre-fills Service: ' + sel);

  // FAQ
  await page.evaluate(() => document.getElementById('faq').scrollIntoView());
  await sleep(800);
  await page.click('#pxfqb2');
  await sleep(700);
  const faq = await page.evaluate(() => ({ e: document.getElementById('pxfqb2').getAttribute('aria-expanded'), h: document.getElementById('pxfq2').getBoundingClientRect().height }));
  ok(faq.e === 'true' && faq.h > 40, 'FAQ opens (height ' + Math.round(faq.h) + 'px)');

  // Form
  await page.evaluate(() => document.getElementById('inquire').scrollIntoView());
  await page.type('#inq-name', 'QA Test');
  await page.type('#inq-email', 'qa@example.com');
  await page.type('#inq-details', 'QA stub submission from the pricing redesign check.');
  await page.click('#pageInquiry button[type=submit]');
  await sleep(2500);
  const done = await page.evaluate(() => { const d = document.querySelector('.inq-done'); return d && d.getBoundingClientRect().height > 0 && getComputedStyle(d).display !== 'none'; });
  ok(!!posted && /Mobile app/.test(posted) && /\/pricing/.test(posted), 'form posted to stubbed /api/inquiry with service + page fields');
  ok(done, 'success state shown after submit');
  ok(errs.length === 0, 'no console/page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));

  // Reduced motion: everything visible, bars full
  const p2 = await browser.newPage();
  await p2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p2.setViewport({ width: 1440, height: 900 });
  await p2.goto(BASE + '/pricing', { waitUntil: 'networkidle2' });
  await sleep(800);
  const rm = await p2.evaluate(() => ({
    motion: document.documentElement.classList.contains('svx-motion'),
    hidden: [...document.querySelectorAll('[data-x],[data-split]')].filter((e) => getComputedStyle(e).opacity !== '1').length,
    bar: getComputedStyle(document.querySelector('.pz-index li:nth-child(2) i'), '::after').transform
  }));
  ok(!rm.motion && rm.hidden === 0 && rm.bar !== 'none' && !/matrix\(0,/.test(rm.bar), 'reduced motion: no motion class, nothing hidden, index bars drawn');
  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
