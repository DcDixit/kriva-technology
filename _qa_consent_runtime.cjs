/* Consent runtime regression test (GA4 + Microsoft Clarity).

   Serves this folder as https://krivatechnologies.com through request interception (vercel.json rewrites),
   so the consent code runs on the production host name. GA4 (googletagmanager.com, google-analytics.com)
   and Clarity (clarity.ms) are STUBBED and counted: nothing is sent to Google or Microsoft.

   Usage:  node _qa_consent_runtime.cjs [rootDir]        (default: this folder)
           CHROME_PATH=... to use a specific Chrome; otherwise system Chrome, then Puppeteer's own.
   Exit code 0 = all checks pass, 1 = a check failed. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(process.argv[2] || __dirname);
const HOST = 'krivatechnologies.com';
const ORIGIN = 'https://' + HOST;
const GA_ID = 'G-FHG12KTF8C';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const rewrites = new Map((JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).rewrites || []).map(r => [r.source, r.destination]));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.avif': 'image/avif', '.ico': 'image/x-icon' };
const CHROME = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));

const results = [];
const check = (id, name, pass, detail) => { results.push({ id, name, pass: !!pass }); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + name + (pass || detail === undefined ? '' : ' :: ' + JSON.stringify(detail))); };
const wait = ms => new Promise(r => setTimeout(r, ms));

function launch(userDataDir) {
  return puppeteer.launch({ headless: true, executablePath: CHROME, userDataDir, args: ['--no-sandbox'] });
}

/* A tab that looks like a real visitor (no webdriver flag, normal UA) unless opts.bot. Counts GA/Clarity loads. */
async function tab(browser, opts = {}) {
  const ctx = opts.ctx || browser.defaultBrowserContext();
  const page = await ctx.newPage();
  const n = { ga: 0, clarity: 0, errors: [] };
  if (!opts.bot) {
    await page.setUserAgent(UA);
    await page.evaluateOnNewDocument(() => { Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }); });
  }
  if (opts.gpc) await page.evaluateOnNewDocument(() => { Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }); });
  /* Record every Clarity call, including ones made just before a reload, in sessionStorage. */
  await page.evaluateOnNewDocument(() => {
    let real;
    Object.defineProperty(window, 'clarity', {
      configurable: true,
      get() { return real; },
      set(fn) {
        real = function () {
          try { const log = JSON.parse(sessionStorage.getItem('__qa_clarity') || '[]'); log.push(Array.from(arguments)); sessionStorage.setItem('__qa_clarity', JSON.stringify(log)); } catch (e) {}
          return fn.apply(this, arguments);
        };
        real.q = fn.q;
      }
    });
  });
  const host = opts.host || HOST;
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = new URL(req.url());
    if (u.hostname === host) {
      let p = decodeURIComponent(u.pathname);
      if (rewrites.has(p)) p = rewrites.get(p);
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) return req.respond({ status: 404, body: '' });
      return req.respond({ status: 200, contentType: TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', body: fs.readFileSync(f) });
    }
    if (/googletagmanager\.com$|google-analytics\.com$/.test(u.hostname)) { n.ga++; return req.respond({ status: 200, contentType: 'application/javascript', body: '' }); }
    if (/clarity\.ms$/.test(u.hostname)) { n.clarity++; return req.respond({ status: 200, contentType: 'application/javascript', body: '' }); }
    return req.abort();
  });
  page.on('pageerror', e => n.errors.push(String(e.message).slice(0, 160)));
  page.go = async (p, base) => { await page.goto((base || ('https://' + host)) + p, { waitUntil: 'load', timeout: 30000 }); await wait(600); };
  return { page, n, ctx };
}

const banner = page => page.evaluate(() => { const b = document.getElementById('kriva-consent'); return !!b && !b.hidden && b.offsetHeight > 0; });
const choose = (page, v) => page.evaluate(v => document.querySelector('#kriva-consent button[data-consent="' + v + '"]').click(), v);
const stored = page => page.evaluate(() => localStorage.getItem('kriva_consent'));
const gaConsent = page => page.evaluate(() => (window.dataLayer || []).filter(a => a && a[0] === 'consent').map(a => a[1] + ':' + (a[2] && a[2].analytics_storage)));
const clarityCalls = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('__qa_clarity') || '[]').map(a => a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')));
const granted = calls => calls.filter(c => /^consentv2 /.test(c) && /"analytics_Storage":"granted"/.test(c) && /"ad_Storage":"denied"/.test(c)).length;
const deniedSignal = calls => calls.some(c => /^consentv2 /.test(c) && /"analytics_Storage":"denied"/.test(c)) && calls.some(c => c === 'consent false');
const cookies = page => page.evaluate(() => document.cookie);

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kriva-consent-qa-'));
  let browser = await launch();
  try {
    /* 1. Before any choice */
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext() });
      await page.go('/');
      check('C01', 'before consent: banner shown', await banner(page));
      check('C02', 'before consent: GA4 and Clarity not requested', n.ga === 0 && n.clarity === 0, n);
      check('C03', 'before consent: GA4 consent default analytics_storage=denied', (await gaConsent(page)).includes('default:denied'), await gaConsent(page));
      check('C04', 'before consent: no Clarity call, no analytics cookies', (await clarityCalls(page)).length === 0 && !/_ga|_cl/.test(await cookies(page)));
      await page.go('/contact');
      check('C05', 'before consent: still nothing after navigation', n.ga === 0 && n.clarity === 0, n);
      await page.close(); }

    /* 2. Reject */
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext() });
      await page.go('/'); await choose(page, 'reject'); await wait(400);
      await page.go('/markets/us'); await page.go('/insights'); await page.reload({ waitUntil: 'load' }); await wait(400);
      check('C06', 'reject: GA4 and Clarity never requested across 3 pages + reload', n.ga === 0 && n.clarity === 0, n);
      check('C07', 'reject: stored, banner stays closed, no Clarity calls', (await stored(page)) === 'reject' && !(await banner(page)) && (await clarityCalls(page)).length === 0);
      await page.close(); }

    /* 3. Accept, then navigation */
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext() });
      await page.go('/'); await choose(page, 'accept'); await wait(500);
      check('C08', 'accept: GA4 and Clarity each requested once', n.ga === 1 && n.clarity === 1, n);
      check('C09', 'accept: GA4 consent update analytics_storage=granted', (await gaConsent(page)).includes('update:granted'), await gaConsent(page));
      const c1 = await clarityCalls(page);
      check('C10', 'accept: Clarity consentv2 analytics granted, ads denied, sent once', granted(c1) === 1, c1);
      await page.go('/contact');
      const c2 = await clarityCalls(page);
      check('C11', 'navigation after accept: no banner, GA4 + Clarity load again', !(await banner(page)) && n.ga === 2 && n.clarity === 2, n);
      check('C12', 'navigation after accept: Clarity consent signal sent on the new page', granted(c2) === 2, c2);
      check('C13', 'accept: no JS errors', n.errors.length === 0, n.errors);
      await page.close(); }

    /* 4. Withdrawal (Accept -> Cookie settings -> Reject), then re-consent */
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext() });
      await page.go('/'); await choose(page, 'accept'); await wait(400);
      await page.evaluate(() => { document.cookie = '_ga=GA1.1.1.1; path=/'; document.cookie = '_ga_FHG12KTF8C=GS1; path=/'; document.cookie = '_clck=x; path=/'; document.cookie = '_clsk=y; path=/'; document.cookie = 'unrelated=1; path=/'; });
      await page.evaluate(() => document.querySelector('footer .kriva-cookie-btn').click());
      const marked = await page.evaluate(() => document.querySelector('#kriva-consent button[data-consent="accept"]').getAttribute('aria-pressed'));
      check('C14', 'Cookie settings reopens banner with Accept marked', (await banner(page)) && marked === 'true', marked);
      const nav = page.waitForNavigation({ waitUntil: 'load', timeout: 8000 }).then(() => true).catch(() => false);
      await choose(page, 'reject'); const reloaded = await nav; await wait(500);
      const calls = await clarityCalls(page);
      check('C15', 'withdraw: Clarity told consentv2 denied + consent(false), GA4 disabled before reload', deniedSignal(calls), calls);
      check('C16', 'withdraw: page reloads; _ga, _ga_*, _clck, _clsk deleted; other cookies kept', reloaded && !/_ga|_clck|_clsk/.test(await cookies(page)) && /unrelated=1/.test(await cookies(page)), await cookies(page));
      const before = { ga: n.ga, clarity: n.clarity };
      await page.go('/contact'); await page.go('/');
      check('C17', 'after withdrawal: no further GA4/Clarity requests across navigation', n.ga === before.ga && n.clarity === before.clarity, { before, now: n });
      await page.evaluate(() => document.querySelector('footer .kriva-cookie-btn').click()); await choose(page, 'accept'); await wait(500);
      check('C18', 'withdraw then Accept again: GA4 and Clarity load, consent granted', n.ga === before.ga + 1 && granted(await clarityCalls(page)) >= 1, n);
      await page.close(); }

    /* 5. Browser sessions: choice survives a full browser restart */
    for (const choice of ['accept', 'reject']) {
      const dir = path.join(tmp, choice);
      let b = await launch(dir);
      { const { page } = await tab(b); await page.go('/'); await choose(page, choice); await wait(400); }
      await b.close();
      b = await launch(dir);
      { const { page, n } = await tab(b); await page.go('/pricing');
        const calls = await clarityCalls(page);
        if (choice === 'accept') check('C19', 'new browser session after Accept: no banner, GA4 + Clarity load, Clarity consent granted', !(await banner(page)) && n.ga === 1 && n.clarity === 1 && granted(calls) === 1, { n, calls });
        else check('C20', 'new browser session after Reject: no banner, nothing loads', !(await banner(page)) && n.ga === 0 && n.clarity === 0 && calls.length === 0, { n, calls }); }
      await b.close();
    }

    /* 6. Never tracked, even after Accept */
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext(), bot: true });
      await page.go('/'); await choose(page, 'accept'); await wait(400);
      check('C21', 'automated browser (webdriver): Accept loads nothing, no Clarity consent', n.ga === 0 && n.clarity === 0 && (await clarityCalls(page)).length === 0, n); await page.close(); }
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext() });
      await page.go('/?kriva_internal=1'); await choose(page, 'accept'); await wait(400); await page.go('/contact');
      check('C22', '?kriva_internal=1: Accept loads nothing on any page', n.ga === 0 && n.clarity === 0, n); await page.close(); }
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext(), gpc: true });
      await page.go('/'); await choose(page, 'accept'); await wait(400);
      check('C23', 'Global Privacy Control: Accept loads nothing, no Clarity consent', n.ga === 0 && n.clarity === 0 && (await clarityCalls(page)).length === 0, n); await page.close(); }
    { const { page, n } = await tab(browser, { ctx: await browser.createBrowserContext(), host: 'kriva-v2-git-preview.vercel.app' });
      await page.go('/'); await choose(page, 'accept'); await wait(400);
      check('C24', '*.vercel.app preview: Accept loads nothing', n.ga === 0 && n.clarity === 0, n); await page.close(); }

    /* 7. Cross-tab */
    { const ctx = await browser.createBrowserContext();
      const a = await tab(browser, { ctx }); await a.page.go('/');
      const b = await tab(browser, { ctx }); await b.page.go('/contact');
      await choose(a.page, 'accept'); await wait(900);
      check('C25', 'Accept in one tab: other open tab loads GA4 + Clarity, hides banner, sends Clarity consent', b.n.ga === 1 && b.n.clarity === 1 && !(await banner(b.page)) && granted(await clarityCalls(b.page)) === 1, b.n);
      await ctx.close(); }
  } catch (e) {
    console.error('HARNESS ERROR', e); results.push({ id: 'ERR', pass: false });
  } finally {
    await browser.close().catch(() => {});
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  const failed = results.filter(r => !r.pass);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' consent runtime checks pass');
  process.exit(failed.length ? 1 : 0);
})();
