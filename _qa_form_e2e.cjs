/* Contact form E2E: wiring, validation, loading, success, Formspree handling,
   duplicate-submit lock, mobile layout. Requires preview on PORT (default 5199). */

const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5199}`;
const EXPECTED = 'https://formspree.io/f/YOUR_ACTUAL_FORM_ID';

const fillValid = () => {
  const f = document.getElementById('briefForm');
  const set = (n, v) => {
    const el = f.querySelector(`[name="${n}"]`);
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  set('name', 'Jane Doe');
  set('email', 'jane@acme.com');
  set('details', 'We run 40 trucks and need a dispatch console this quarter.');
  for (const sel of f.querySelectorAll('select')) {
    if (sel.options.length > 1) {
      sel.selectedIndex = 1;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
};

const snapshot = () => {
  const f = document.getElementById('briefForm');
  const btn = f.querySelector('[type=submit]');
  const done = document.getElementById('done') || document.querySelector('.done');
  return {
    action: f.getAttribute('action'),
    endpoint: f.dataset.apiEndpoint,
    loading: btn.classList.contains('loading'),
    ariaDisabled: btn.getAttribute('aria-disabled'),
    busy: f.getAttribute('aria-busy'),
    label: (btn.textContent || '').replace(/\s+/g, ' ').trim(),
    sent: f.classList.contains('sent'),
    doneOn: !!(done && done.classList.contains('on')),
    status: (document.querySelector('[aria-live]') || {}).textContent || '',
    invalid: [...f.querySelectorAll('[aria-invalid="true"]')].map((x) => x.name),
  };
};

(async () => {
  const report = { pass: [], fail: [] };
  const ok = (name, cond, detail) => {
    (cond ? report.pass : report.fail).push(detail ? `${name}: ${detail}` : name);
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  };

  /* ── live Formspree probe (no browser) ── */
  let live = { status: null, body: '' };
  try {
    const res = await fetch(EXPECTED, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        name: 'KRIVA form verification',
        email: 'verify@krivatechnologies.com',
        details: 'Automated wiring check. Ignore.',
        _subject: 'KRIVA form verification — discard',
      }),
    });
    live.status = res.status;
    live.body = (await res.text()).slice(0, 240);
  } catch (e) {
    live.error = e.message;
  }
  const liveOk = live.status >= 200 && live.status < 300;
  ok('Formspree live response', liveOk, live.error || `HTTP ${live.status} ${live.body}`);

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  /* ── desktop: structure + validation ── */
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });

    const wiring = await page.evaluate(snapshot);
    ok('action matches ID', wiring.action === EXPECTED, wiring.action);
    ok('data-api-endpoint matches ID', wiring.endpoint === EXPECTED, wiring.endpoint);
    ok('action === data-api-endpoint', wiring.action === wiring.endpoint);

    await page.click('#briefForm [type=submit]');
    await new Promise((r) => setTimeout(r, 350));
    const empty = await page.evaluate(snapshot);
    ok('empty submit blocked (no network UI)', !empty.loading && empty.invalid.length >= 6, `${empty.invalid.length} invalid, status="${empty.status}"`);
    ok('validation status announced', /need attention/i.test(empty.status), empty.status);

    await page.evaluate(() => {
      const f = document.getElementById('briefForm');
      const email = f.querySelector('[name=email]');
      email.value = 'not-an-email';
      email.dispatchEvent(new Event('input', { bubbles: true }));
      email.dispatchEvent(new Event('blur', { bubbles: true }));
    });
    const bad = await page.evaluate(() => {
      const el = document.querySelector('[name=email]');
      return { inv: el.getAttribute('aria-invalid'), desc: el.getAttribute('aria-describedby') };
    });
    ok('invalid email flagged', bad.inv === 'true' && bad.desc === 'email-err', JSON.stringify(bad));
    await page.close();
  }

  /* ── mocked 200: loading + success + no duplicate ── */
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const posts = [];
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().includes('formspree.io')) {
        posts.push({ url: req.url(), method: req.method() });
        const cors = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Accept',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        };
        if (req.method() === 'OPTIONS') {
          req.respond({ status: 204, headers: cors, body: '' });
          return;
        }
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers: cors,
          body: JSON.stringify({ ok: true }),
        });
        return;
      }
      req.continue();
    });
    await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
    await page.evaluate(fillValid);

    const during = await page.evaluate(() => {
      const f = document.getElementById('briefForm');
      const btn = f.querySelector('[type=submit]');
      btn.click();
      return {
        loading: btn.classList.contains('loading'),
        label: (btn.textContent || '').replace(/\s+/g, ' ').trim(),
        busy: f.getAttribute('aria-busy'),
        ariaDisabled: btn.getAttribute('aria-disabled'),
      };
    });
    ok('loading state on submit', during.loading && /Sending/i.test(during.label), JSON.stringify(during));
    ok('aria-busy + aria-disabled while sending', during.busy === 'true' && during.ariaDisabled === 'true');

    await page.evaluate(() => {
      const btn = document.querySelector('#briefForm [type=submit]');
      btn.click();
      btn.click();
    });
    await new Promise((r) => setTimeout(r, 700));
    const after = await page.evaluate(snapshot);
    ok('success state after 200', after.sent && after.doneOn, JSON.stringify({ sent: after.sent, doneOn: after.doneOn, status: after.status }));
    ok('success copy announced', /Brief received/i.test(after.status), after.status);
    const postOnly = posts.filter((p) => p.method === 'POST');
    ok('single Formspree POST (no duplicates)', postOnly.length === 1, `${postOnly.length} POST / ${posts.length} total`);
    ok('POST URL is wired endpoint', postOnly[0] && postOnly[0].url === EXPECTED, postOnly[0] && postOnly[0].url);
    await page.close();
  }

  /* ── mocked 422: Formspree error handling ── */
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    let navigated = null;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && frame.url().startsWith('mailto:')) navigated = frame.url();
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().includes('formspree.io')) {
        const cors = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Accept',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        };
        if (req.method() === 'OPTIONS') {
          req.respond({ status: 204, headers: cors, body: '' });
          return;
        }
        req.respond({
          status: 422,
          contentType: 'application/json',
          headers: cors,
          body: JSON.stringify({ error: 'validation' }),
        });
        return;
      }
      if (req.url().startsWith('mailto:')) { req.abort(); return; }
      req.continue();
    });
    await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
    await page.evaluate(fillValid);
    await page.click('#briefForm [type=submit]');
    await new Promise((r) => setTimeout(r, 800));
    const err = await page.evaluate(snapshot);
    const handled = /Opening email|API unavailable|Brief received|email app/i.test(err.status + err.label);
    ok('non-OK Formspree does not leave form stuck', handled && err.ariaDisabled !== 'true', JSON.stringify(err));
    await page.close();
  }

  /* ── mobile UX ── */
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
    const mobile = await page.evaluate(() => {
      const f = document.getElementById('briefForm');
      const btn = f.querySelector('[type=submit]');
      const br = btn.getBoundingClientRect();
      const inputs = [...f.querySelectorAll('input:not([type=hidden]),select,textarea')].filter((el) => !el.closest('.hp'));
      const small = inputs.filter((el) => el.getBoundingClientRect().height < 40).map((el) => el.name);
      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      const labels = inputs.filter((el) => el.id && !document.querySelector(`label[for="${el.id}"]`)).map((el) => el.name);
      return {
        btnH: Math.round(br.height),
        btnW: Math.round(br.width),
        overflow,
        smallInputs: small,
        unlabelled: labels,
        fontSize: parseFloat(getComputedStyle(f.querySelector('[name=email]')).fontSize),
      };
    });
    ok('mobile submit target ≥ 44px', mobile.btnH >= 44, `${mobile.btnH}px`);
    ok('no horizontal overflow at 390px', !mobile.overflow);
    ok('visible fields labelled', mobile.unlabelled.length === 0, mobile.unlabelled.join(','));
    ok('email font ≥ 16px (no iOS zoom)', mobile.fontSize >= 16, `${mobile.fontSize}px`);
    await page.close();
  }

  await browser.close();

  console.log('\n════ SUMMARY ════');
  console.log('passed:', report.pass.length);
  console.log('failed:', report.fail.length);
  report.fail.forEach((f) => console.log('  -', f));
  console.log('live Formspree HTTP:', live.status, live.error || '');
})();
