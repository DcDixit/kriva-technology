/* Contact form end-to-end behaviour in a real browser:
   required-field validation, error messaging, label association, keyboard reachability,
   duplicate-submit protection, spam honeypot, and the mailto fallback. */

const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5199}`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const netCalls = [];
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    if (/formspree|mailto/.test(r.url())) { netCalls.push(r.url()); r.abort(); return; }
    r.continue();
  });

  await page.goto(BASE + '/contact', { waitUntil: 'networkidle2' });

  const structure = await page.evaluate(() => {
    const f = document.getElementById('briefForm');
    if (!f) return { error: 'form not found' };
    const fields = [...f.querySelectorAll('input,select,textarea')];
    const required = fields.filter((x) => x.required);
    const unlabelled = fields.filter((x) => {
      if (x.type === 'hidden') return false;
      if (x.closest('.hp')) return false;
      const byFor = x.id && document.querySelector(`label[for="${x.id}"]`);
      return !(byFor || x.getAttribute('aria-label') || x.closest('label'));
    }).map((x) => x.name || x.id || x.type);

    return {
      action: f.getAttribute('action'),
      endpoint: f.dataset.apiEndpoint,
      method: f.getAttribute('method'),
      novalidate: f.hasAttribute('novalidate'),
      fields: fields.length,
      required: required.map((x) => x.name),
      unlabelled,
      honeypot: !!f.querySelector('.hp input'),
      ariaLive: [...f.querySelectorAll('[aria-live]')].map((n) => n.getAttribute('aria-live')),
      submitText: (f.querySelector('[type=submit]') || {}).textContent,
    };
  });
  console.log('── structure ──');
  console.log(JSON.stringify(structure, null, 2));

  /* submit empty -> should block and surface errors */
  const empty = await page.evaluate(() => {
    const f = document.getElementById('briefForm');
    f.querySelector('[type=submit]').click();
    return new Promise((res) => setTimeout(() => {
      const invalid = [...f.querySelectorAll('[aria-invalid="true"]')].map((x) => x.name);
      const msgs = [...f.querySelectorAll('.err,.error,[data-err]')]
        .map((n) => n.textContent.trim()).filter(Boolean);
      res({
        invalidCount: invalid.length, invalid,
        visibleMessages: msgs.slice(0, 6),
        focusMovedTo: document.activeElement && (document.activeElement.name || document.activeElement.tagName),
        status: (f.querySelector('[aria-live]') || {}).textContent,
      });
    }, 400));
  });
  console.log('\n── empty submit ──');
  console.log(JSON.stringify(empty, null, 2));
  console.log('  network calls triggered:', netCalls.length, '(should be 0)');

  /* invalid email */
  const badEmail = await page.evaluate(() => {
    const f = document.getElementById('briefForm');
    const set = (n, v) => {
      const el = f.querySelector(`[name="${n}"]`);
      if (!el) return;
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    };
    set('name', 'Jane Doe');
    set('email', 'not-an-email');
    set('message', 'We run 40 trucks and need a dispatch console.');
    f.querySelector('[type=submit]').click();
    return new Promise((res) => setTimeout(() => {
      const el = f.querySelector('[name="email"]');
      res({ ariaInvalid: el.getAttribute('aria-invalid'), described: el.getAttribute('aria-describedby') });
    }, 400));
  });
  console.log('\n── invalid email ──');
  console.log(JSON.stringify(badEmail, null, 2));
  console.log('  network calls triggered:', netCalls.length, '(should still be 0)');

  /* keyboard reachability */
  const kb = await page.evaluate(() => {
    const f = document.getElementById('briefForm');
    const focusable = [...f.querySelectorAll('input,select,textarea,button')]
      .filter((x) => x.type !== 'hidden' && x.tabIndex !== -1 && !x.closest('.hp'));
    return { reachable: focusable.length, names: focusable.map((x) => x.name || x.type) };
  });
  console.log('\n── keyboard ──');
  console.log(JSON.stringify(kb, null, 2));

  /* duplicate submit protection */
  const dup = await page.evaluate(() => {
    const f = document.getElementById('briefForm');
    const set = (n, v) => {
      const el = f.querySelector(`[name="${n}"]`);
      if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
    };
    set('name', 'Jane Doe');
    set('email', 'jane@acme.com');
    set('details', 'We run 40 trucks and need a dispatch console built this quarter.');
    // every required select must be answered or validation blocks before the network call
    for (const sel of f.querySelectorAll('select')) {
      if (sel.options.length > 1) {
        sel.selectedIndex = 1;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        sel.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    const btn = f.querySelector('[type=submit]');
    btn.click(); btn.click(); btn.click();
    return new Promise((res) => setTimeout(() => res({
      disabled: btn.disabled,
      ariaDisabled: btn.getAttribute('aria-disabled'),
      busy: f.getAttribute('aria-busy'),
      label: btn.textContent.trim(),
    }), 600));
  });
  console.log('\n── triple submit ──');
  console.log(JSON.stringify(dup, null, 2));
  console.log('  outbound submissions attempted:', netCalls.length, '(should be 1)');
  netCalls.forEach((u) => console.log('    ->', u.slice(0, 90)));

  await browser.close();
})();
