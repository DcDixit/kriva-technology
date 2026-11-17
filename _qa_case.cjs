// QA for /work/shiftrail-dispatch (csx layer): content parity vs git HEAD + browser checks.
// Usage: node _qa_case.cjs   (dev server on :5177; /api/inquiry is stubbed, no email is sent)
const fs = require('fs');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const FILE = 'kriva-case-fleetflow.html';
const URL = 'http://localhost:5177/work/shiftrail-dispatch';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const oldH = execSync('git show HEAD:' + FILE, { encoding: 'utf8', maxBuffer: 1 << 26 });
const newH = fs.readFileSync(FILE, 'utf8');
let fails = 0;
const check = (ok, msg) => { console.log((ok ? '  ok   ' : '  FAIL ') + msg); if (!ok) fails++; };
const norm = (s) => s.replace(/[\u0080-\u009f]/g, '').replace(/\s+/g, ' ').trim(); // old copy carries a stray U+009D
const between = (h, a, b) => { const i = h.indexOf(a); return h.slice(i, h.indexOf(b, i)); };

console.log('Static parity vs HEAD');
const headEnd = (h) => h.slice(0, h.indexOf('<style>'));
check(headEnd(oldH).replace(/<script>document[^<]+<\/script>/, '') === headEnd(newH).replace(/<script>\(function\(d\)[^<]+<\/script>/, ''), 'head (title, meta, canonical, OG, GA) unchanged apart from the motion flag');
const ld = (h) => between(h, '<!-- KRIVA_SCHEMA_START -->', '<!-- KRIVA_SCHEMA_END -->');
check(ld(oldH) === ld(newH), 'JSON-LD identical');
check(between(oldH, '<header class="nav"', '<!-- COMPONENT') === between(newH, '<header class="nav"', '<!-- COMPONENT'), 'nav + mobile sheet identical');
check(between(oldH, '<footer>', '</footer>') === between(newH, '<footer>', '</footer>'), 'footer identical');
const form = (h) => between(h, '<form', '</form>');
check(form(oldH) === form(newH), 'inquiry form identical');
const texts = (h) => { const m = between(h, '<main id="main">', '</main>'); return [...m.replace(/<script[\s\S]*?<\/script>/g, '').matchAll(/>([^<>]+)</g)].map((x) => norm(x[1])).filter((t) => t.length > 1 && !/^[\/·→◆]$/.test(t)); };
const newMain = norm(between(newH, '<main id="main">', '</main>').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
const missing = [...new Set(texts(oldH))].filter((t) => !newMain.includes(t));
check(missing.length === 0, 'every old text string is still on the page' + (missing.length ? ': ' + JSON.stringify(missing) : ''));
const attrs = (h, re) => new Set([...h.matchAll(re)].map((x) => x[1]));
const oldHref = attrs(between(oldH, '<main', '</main>'), /href="([^"]+)"/g), newHref = attrs(between(newH, '<main', '</main>'), /href="([^"]+)"/g);
check([...oldHref].every((x) => newHref.has(x)), 'every old link target kept ' + JSON.stringify([...oldHref].filter((x) => !newHref.has(x))));
const oldAria = attrs(oldH, /aria-label="([^"]+)"/g), newAria = attrs(newH, /aria-label="([^"]+)"/g);
check([...oldAria].filter((x) => !newAria.has(x)).length === 0, 'every console aria-label kept ' + JSON.stringify([...oldAria].filter((x) => !newAria.has(x))));
const oldIds = attrs(oldH, /\sid="([^"]+)"/g), newIds = attrs(newH, /\sid="([^"]+)"/g);
check([...oldIds].filter((x) => !newIds.has(x)).length === 0, 'every old id kept ' + JSON.stringify([...oldIds].filter((x) => !newIds.has(x))));
check(!/\d+%\s*(faster|less|more|fewer|reduction|increase)/i.test(newMain), 'no outcome-style percentages added');

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'], defaultViewport: null });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    console.log(`\nBrowser ${w}px`);
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await page.setRequestInterception(true);
    page.on('request', (r) => (r.url().includes('/api/inquiry') ? r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true,"channel":"stub"}' }) : r.continue()));
    await page.setViewport({ width: w, height: h, isMobile: w < 600, hasTouch: w < 600 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await sleep(800);
    const q = (fn, ...a) => page.evaluate(fn, ...a);

    // hero sort
    await page.click('.csx-seg-b[data-sort="sla"]'); await sleep(900);
    const order = await q(() => [...document.querySelectorAll('[data-csx-rows] .csx-row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map((r) => r.querySelector('b').textContent));
    check(order.join() === '#4823,#4822,#4821', 'hero "SLA risk" sorts the queue by urgency ' + order.join());
    // workflow stage via buttons
    await q(() => document.querySelector('#workflow').scrollIntoView());
    await sleep(600);
    const btns = await page.$$('.csx-move-btn');
    await btns[1].click(); await sleep(500);
    check(await q(() => document.querySelector('.csx-views').getAttribute('data-on')) === '1', 'move 02 shows the SLA view');
    await btns[0].click(); await sleep(500);
    // bulk demo
    await q(() => document.querySelectorAll('.csx-vb-pick').forEach((p) => p.setAttribute('aria-pressed', 'false')));
    const picks = await page.$$('.csx-vb-pick');
    await picks[0].click(); await picks[2].click(); await sleep(200);
    const n = await q(() => document.querySelector('[data-csx-n]').textContent);
    await page.click('[data-csx-go]'); await sleep(300);
    const log = await q(() => document.querySelector('[data-csx-log]').textContent);
    check(n === '2' && /1 event · 2 loads/.test(log), `bulk demo: 2 picked → "${log}"`);
    // density
    await q(() => document.querySelector('#decision').scrollIntoView());
    await page.click('[data-density="tablet"]'); await sleep(900);
    check(await q(() => document.querySelector('[data-csx-dens]').dataset.mode) === 'tablet' && await q(() => getComputedStyle(document.querySelector('.csx-dens-tab')).visibility) === 'visible', 'density toggle shows the tablet');
    // before/after
    await q(() => document.querySelector('#product').scrollIntoView()); await sleep(2200);
    await q(() => { const r = document.querySelector('.csx-ba-range'); r.value = 80; r.dispatchEvent(new Event('input')); });
    check(await q(() => document.querySelector('[data-csx-ba]').style.getPropertyValue('--split')) === '80%', 'before/after slider moves the split');
    // chips
    if (w < 1360) check(await q(() => document.querySelector('#mobChips').classList.contains('is-show')), 'section chips visible after the hero');
    // overflow + reveals + links
    const m = await q(() => ({
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      small: [...document.querySelectorAll('main a, main button')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.height && r.height < 24 && !el.closest('.crumbs,.inq-help,.inq-form,[aria-hidden="true"],.csx-ba,.cta-band'); }).map((el) => el.textContent.trim().slice(0, 30)),
    }));
    check(m.over === 0, 'no horizontal overflow');
    check(m.small.length === 0, 'tap targets ≥ 24px ' + JSON.stringify(m.small));
    // form (stubbed)
    await q(() => document.querySelector('#inquire').scrollIntoView());
    await page.type('#inq-name', 'QA Test'); await page.type('#inq-email', 'qa@example.com'); await page.type('#inq-details', 'QA stub run, ignore.');
    await page.click('#pageInquiry button[type=submit]'); await sleep(1500);
    check(await q(() => { const d = document.querySelector('.inq-done'); return d && getComputedStyle(d).display !== 'none' && d.offsetHeight > 0; }), 'form submits to the stub and shows "Inquiry accepted"');
    check(errs.length === 0, 'no console errors ' + JSON.stringify(errs));
    await page.close();
  }
  // reduced motion
  console.log('\nReduced motion 1440px');
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await sleep(500);
  const r = await page.evaluate(() => ({
    motion: document.documentElement.classList.contains('svx-motion'),
    hidden: [...document.querySelectorAll('[data-x],[data-split]')].filter((el) => getComputedStyle(el).opacity !== '1').length,
    bulk: document.querySelector('[data-csx-log]').textContent,
  }));
  check(!r.motion && r.hidden === 0, 'no motion class, nothing left hidden');
  check(/1 event · 3 loads/.test(r.bulk), 'bulk demo settles on its finished state');
  await browser.close();
  console.log(fails ? `\n${fails} check(s) failed` : '\nAll checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
