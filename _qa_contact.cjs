// Functional QA for /contact (fit call + project brief). Every send endpoint is intercepted:
// /api/inquiry is stubbed, and any other non-localhost request (web3forms, formsubmit, GA, Clarity) is aborted.
// Usage: node _qa_contact.cjs
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } };

async function open(browser, w, h, mode) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: w < 600, hasTouch: w < 600 });
  const sent = [], external = [], errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (u.startsWith(BASE + '/api/inquiry')) {
      sent.push(JSON.parse(req.postData() || '{}'));
      if (mode.fail) return req.respond({ status: 502, contentType: 'application/json', body: '{"ok":false}' });
      return req.respond({ status: 200, contentType: 'application/json', body: '{"ok":true,"channel":"stub"}' });
    }
    if (!u.startsWith(BASE) && !u.startsWith('data:')) { external.push(u); return req.abort(); }
    req.continue();
  });
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
  await sleep(600);
  return { page, sent, external, errs };
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = browser.defaultBrowserContext();
  await ctx.overridePermissions(BASE, ['clipboard-read', 'clipboard-write']);

  for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
    console.log('\n== Fit call form · ' + tag);
    const { page, sent, external, errs } = await open(browser, w, h, {});
    // empty submit
    await page.click('#fitSubmitBtn');
    await sleep(300);
    let st = await page.evaluate(() => ({
      summary: document.querySelector('#fitSummary').classList.contains('on'),
      items: [...document.querySelectorAll('#fitSummaryList a')].map((a) => a.textContent.trim()),
      invalid: [...document.querySelectorAll('#fitForm :is(input,select,textarea)[aria-invalid="true"]')].map((f) => f.id),
      chipsInvalid: document.querySelector('.ctx-chips').getAttribute('aria-invalid'), chipsVisible: getComputedStyle(document.querySelector('.ctx-chips')).display !== 'none'
    }));
    ok(st.summary && st.items.length === 4, 'empty submit lists 4 fields: ' + st.items.join(', '));
    ok(st.invalid.join() === 'fit-name,fit-email,fit-ptype,fit-details', 'aria-invalid on the 4 required fields');
    const desk = w > 600;
    ok(st.chipsVisible === desk, desk ? 'chips shown on desktop' : 'native select used on phones (chips hidden)');
    if (desk) ok(st.chipsInvalid === 'true', 'chip group flagged invalid');
    ok(sent.length === 0, 'nothing sent on invalid submit');
    // summary link to project type lands on a chip
    await page.evaluate(() => [...document.querySelectorAll('#fitSummaryList a')].find((a) => a.getAttribute('href') === '#fit-ptype').click());
    await sleep(150);
    ok(await page.evaluate((desk) => desk ? document.activeElement.classList.contains('ctx-chip') : document.activeElement.id === 'fit-ptype', desk), 'summary link "Project type" focuses ' + (desk ? 'a chip' : 'the select'));
    // bad email
    await page.type('#fit-name', 'QA Test');
    await page.type('#fit-email', 'not-an-email');
    await page.click('#fit-company');
    await sleep(100);
    ok(await page.$eval('#fit-email-err', (e) => e.classList.contains('on')), 'invalid email error shows on blur');
    await page.$eval('#fit-email', (e) => { e.value = ''; });
    await page.type('#fit-email', 'qa@example.com');
    // keyboard chip selection
    if (desk) {
      await page.focus('.ctx-chip');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      const ptype = await page.$eval('#fit-ptype', (s) => s.value);
      ok(ptype === 'CRM & workflow automation', 'arrow keys pick chip → select value "' + ptype + '"');
      ok(await page.$eval('#fit-ptype', (s) => s.getAttribute('aria-invalid') !== 'true'), 'project type error clears after picking');
      await page.click('.ctx-chip:last-child');
      ok((await page.$eval('#fit-ptype', (s) => s.value)) === 'Not sure yet', 'click picks chip "Not sure yet"');
    } else {
      ok(await page.$eval('#fit-ptype', (s) => s.getAttribute('aria-hidden') === null && s.tabIndex === 0 && s.getBoundingClientRect().height >= 44), 'native select is visible, focusable, and tall enough');
      await page.select('#fit-ptype', 'Not sure yet');
      ok(await page.$eval('#fit-ptype', (s) => s.getAttribute('aria-invalid') !== 'true'), 'project type error clears after picking');
      const m = await page.evaluate(() => {
        const small = [...document.querySelectorAll('main a, main button, main input:not([type=hidden]):not([tabindex="-1"]), main select, main textarea')]
          .filter((e) => e.offsetParent && !e.closest('.hp') && !e.classList.contains('ctx-ul')).map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); const pad = cs.display === 'inline' ? 0 : 0; return [e, r]; }).filter(([, r]) => r.height < 43.5 && r.width > 0)
          .map(([e, r]) => (e.id || e.className || e.tagName) + ' ' + Math.round(r.height) + 'px');
        const fonts = [...document.querySelectorAll('main input:not([type=hidden]), main select, main textarea')].filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.id);
        return { small, fonts };
      });
      ok(m.small.length === 0, 'all tap targets ≥ 44px tall (inline prose links use an invisible expander)' + (m.small.length ? ': ' + m.small.join(', ') : ''));
      ok(m.fonts.length === 0, 'all inputs ≥ 16px (no iOS zoom on focus)' + (m.fonts.length ? ': ' + m.fonts.join(', ') : ''));
    }
    await page.type('#fit-details', 'Dispatch board double-books trucks.');
    await page.select('#fit-timeline', '1-2 months');
    await sleep(200);
    const meter = await page.evaluate(() => document.querySelector('[data-ct-count]').textContent + '/' + document.querySelector('[data-ct-total]').textContent);
    ok(meter === '4/4', 'progress meter reads ' + meter);
    const leadP = page.evaluate(() => new Promise((r) => { addEventListener('kriva:lead', (e) => r(e.detail), { once: true }); setTimeout(() => r(null), 4000); }));
    await page.click('#fitSubmitBtn');
    const lead = await leadP;
    await sleep(400);
    const p = sent[0] || {};
    ok(sent.length === 1, 'one request to /api/inquiry');
    ok(p.inquiry_type === 'fit_call' && p.page === '/contact' && p.name === 'QA Test' && p.email === 'qa@example.com' && p.ptype === 'Not sure yet' && p.timeline === '1-2 months' && p.website_hp === '' && p._subject, 'payload fields intact: ' + JSON.stringify(p));
    st = await page.evaluate(() => ({ done: document.querySelector('#fitDone').classList.contains('on'), focus: document.activeElement.id, formHidden: getComputedStyle(document.querySelector('#fitForm')).display === 'none', reply: document.querySelector('#fitDone [data-ct-reply]').textContent }));
    ok(st.done && st.focus === 'fitDone' && st.formHidden, 'success state shown and focused, form hidden');
    ok(/^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d+$/.test(st.reply), 'reply-by date rendered: ' + st.reply);
    ok(lead && lead.type === 'fit_call' && lead.form_id === 'fitForm', 'kriva:lead event fired for fitForm');
    ok(external.every((u) => !/web3forms|formsubmit/.test(u)), 'no backup send channel was called');
    ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await page.close();
  }

  console.log('\n== Project brief · failure then honeypot');
  {
    const { page, sent, errs } = await open(browser, 1440, 900, { fail: true });
    await page.click('#submitBtn');
    await sleep(300);
    const n = await page.$$eval('#summaryList a', (a) => a.length);
    ok(n === 6, 'empty brief submit lists 6 required fields (' + n + ')');
    await page.type('#name', 'QA Test');
    await page.type('#email', 'qa@example.com');
    await page.select('#ptype', 'SaaS product (UK / US)');
    await page.select('#market', 'United Kingdom');
    await page.select('#timeline', '3-6 months');
    await page.type('#details', 'Brief QA.');
    await sleep(200);
    const done = await page.$$eval('[data-ct-check] li.is-done', (l) => l.length);
    ok(done === 6, 'checklist ticks all 6 required fields');
    await page.click('#submitBtn');
    await sleep(1200);
    const st = await page.evaluate(() => ({ head: document.querySelector('#summary b').textContent, mail: !!document.querySelector('#summaryList a[href^="mailto:"]'), btn: !document.querySelector('#submitBtn').disabled, done: document.querySelector('#done').classList.contains('on') }));
    ok(st.head === 'We could not send your inquiry' && st.mail && st.btn && !st.done, '502 shows send error with mailto fallback, button re-enabled, no fake success');
    ok(sent.length === 1, 'one attempt sent');
    await page.evaluate(() => { document.querySelector('#hp-website').value = 'bot'; });
    await page.click('#submitBtn');
    await sleep(500);
    ok(sent.length === 1, 'honeypot filled → no request');
    ok(errs.length === 0, 'no page errors');
    await page.close();
  }

  console.log('\n== Project brief · success');
  {
    const { page, sent } = await open(browser, 1440, 900, {});
    await page.type('#name', 'QA Test'); await page.type('#email', 'qa@example.com'); await page.type('#company', 'QA Co'); await page.type('#site', 'https://example.com');
    await page.select('#ptype', 'AI product development'); await page.select('#market', 'Canada'); await page.select('#service', 'Dashboard Design');
    await page.select('#budget', '$15k - $40k'); await page.select('#timeline', 'Flexible / exploring'); await page.type('#details', 'Brief QA.');
    await page.click('#submitBtn');
    await sleep(800);
    const p = sent[0] || {};
    ok(p.inquiry_type === 'project_brief' && p.market === 'Canada' && p.service === 'Dashboard Design' && p.budget === '$15k - $40k' && p.site === 'https://example.com' && p.company === 'QA Co', 'all brief fields submitted');
    ok(await page.$eval('#done', (d) => d.classList.contains('on') && document.activeElement === d), 'brief success state shown and focused');
    await page.close();
  }

  console.log('\n== Links and interactions');
  {
    const { page } = await open(browser, 1440, 900, {});
    await page.click('[data-ct-start]');
    await sleep(700);
    ok(await page.evaluate(() => document.activeElement.id === 'fit-name'), '"Fit call" route focuses the first field');
    await page.click('.ctx-route-a[href="#brief"]');
    await sleep(1200);
    ok(await page.evaluate(() => { const r = document.querySelector('#brief').getBoundingClientRect(); return location.hash === '#brief' && r.top < 200 && r.top > -50; }), '"Project brief" route scrolls to #brief');
    await page.evaluate(() => document.querySelector('[data-ct-copy]').scrollIntoView({ block: 'center' }));
    await page.click('[data-ct-copy]');
    await sleep(200);
    const copied = await page.evaluate(async () => ({ label: document.querySelector('[data-ct-copy-l]').textContent, clip: await navigator.clipboard.readText().catch(() => '') }));
    ok(copied.label === 'Copied' && copied.clip === 'hello@krivatechnologies.com', 'copy button copies the email');
    await page.goto(BASE + '/contact#brief', { waitUntil: 'networkidle2' });
    await sleep(800);
    const bt = await page.evaluate(() => document.querySelector('#brief').getBoundingClientRect().top); ok(Math.abs(bt) < 120, '/contact#brief deep link lands on the brief (top ' + Math.round(bt) + ')');
    await page.goto(BASE + '/contact#book', { waitUntil: 'networkidle2' });
    await sleep(500);
    ok(await page.evaluate(() => document.querySelector('#book').getBoundingClientRect().top <= 1), '/contact#book deep link lands on the booking section');
    const links = await page.$$eval('main a[href^="/"]', (a) => [...new Set(a.map((x) => x.getAttribute('href').split('#')[0]))]);
    for (const l of links) {
      const r = await page.evaluate(async (l) => (await fetch(l, { method: 'GET' })).status, l);
      ok(r === 200, 'internal link ' + l + ' → ' + r);
    }
    await page.close();
  }

  console.log('\n== Reduced motion');
  {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
    await sleep(400);
    const hidden = await page.$$eval('[data-x],[data-split]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    ok(hidden === 0, 'all reveal content visible under reduced motion');
    await page.close();
  }

  await browser.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
