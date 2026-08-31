/* Verify GA4 wiring: snippet presence, no duplicates, CTA / lead / 404 events. */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { getChromePath } = require('chrome-launcher');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5177);
const BASE = `http://127.0.0.1:${PORT}`;

function htmlFiles() {
  return fs.readdirSync(ROOT).filter((f) => f === '404.html' || /^kriva-.*\.html$/.test(f));
}

function layerEvents(dl) {
  return (dl || [])
    .map((x) => {
      if (!x) return null;
      if (x.event) return x;
      if (x[0] === 'event') return { event: x[1], params: x[2] || {} };
      if (x[0] === 'consent') return { consent: x[1], params: x[2] || {} };
      if (x[0] === 'config') return { config: x[1], params: x[2] || {} };
      if (x[0] === 'js') return { js: true };
      return null;
    })
    .filter(Boolean);
}

(async () => {
  const files = htmlFiles();
  const counts = files.map((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    return {
      f,
      ga: (src.match(/src="\/shared\/analytics\.js"/g) || []).length,
      gtag: (src.match(/gtag\/js\?id=G-FHG12KTF8C/g) || []).length,
      start: (src.match(/KRIVA_GA_START/g) || []).length,
    };
  });
  const bad = counts.filter((c) => c.ga !== 1 || c.gtag !== 1 || c.start !== 1);
  console.log('pages', files.length);
  console.log('duplicate/missing snippet', bad.length ? bad : 'none');

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || getChromePath(),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  const gtagReqs = [];
  page.on('request', (r) => {
    if (/googletagmanager\.com\/gtag\/js/.test(r.url())) gtagReqs.push(r.url());
  });

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
  const home = await page.evaluate(() => {
    const dl = window.dataLayer || [];
    return {
      flag: !!window.__KRIVA_ANALYTICS__,
      gtag: typeof window.gtag === 'function',
      track: typeof window.krivaTrack === 'function',
      scripts: [...document.querySelectorAll('script[src*="analytics.js"]')].map((s) => s.src),
      nav: !!document.getElementById('nav'),
      layerLen: dl.length,
    };
  });
  console.log('home', JSON.stringify(home));

  const afterCta = await page.evaluate(() => {
    const a = document.querySelector('.nav-cta a.btn');
    if (!a) return { error: 'cta missing' };
    a.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true });
    a.click();
    const hits = [];
    for (const x of window.dataLayer || []) {
      if (x && x[0] === 'event' && x[1] === 'cta_click') hits.push(x[2]);
    }
    return hits;
  });
  console.log('cta_click', JSON.stringify(afterCta));

  await page.goto(BASE + '/contact', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.focus('#fit-name');
  await new Promise((r) => setTimeout(r, 150));
  const formStart = await page.evaluate(() => {
    const hits = [];
    for (const x of window.dataLayer || []) {
      if (x && x[0] === 'event' && x[1] === 'form_start') hits.push(x[2]);
    }
    window.dispatchEvent(
      new CustomEvent('kriva:lead', { detail: { type: 'fit_call', form_id: 'fitForm' } })
    );
    const leads = [];
    for (const x of window.dataLayer || []) {
      if (x && x[0] === 'event' && x[1] === 'generate_lead') leads.push(x[2]);
    }
    return { formStart: hits, leads };
  });
  console.log('contact events', JSON.stringify(formStart));

  await page.goto(BASE + '/does-not-exist-ga-check', { waitUntil: 'networkidle2', timeout: 30000 });
  const notFound = await page.evaluate(() => {
    const hits = [];
    for (const x of window.dataLayer || []) {
      if (x && x[0] === 'event' && x[1] === 'page_not_found') hits.push(x[2]);
    }
    return { title: document.title, hits };
  });
  console.log('404', JSON.stringify(notFound));

  const routes = ['/about', '/work', '/solutions/trucking-logistics', '/privacy', '/faq'];
  const routeFlags = [];
  for (const r of routes) {
    await page.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 20000 });
    routeFlags.push(
      await page.evaluate((path) => {
        return {
          path,
          flag: !!window.__KRIVA_ANALYTICS__,
          scripts: document.querySelectorAll('script[src*="analytics.js"]').length,
        };
      }, r)
    );
  }
  console.log('routes', JSON.stringify(routeFlags));
  console.log('pageerrors', errors);
  console.log('gtag.js requests', gtagReqs.length, gtagReqs.filter((u) => /G-FHG12KTF8C/.test(u)).length ? 'ok' : gtagReqs);

  await browser.close();
  const fail =
    bad.length ||
    !home.flag ||
    home.scripts.length !== 1 ||
    afterCta.length < 1 ||
    formStart.formStart.length < 1 ||
    formStart.leads.length < 1 ||
    notFound.hits.length < 1 ||
    routeFlags.some((x) => !x.flag || x.scripts !== 1) ||
    errors.length;
  if (fail) {
    console.error('FAIL');
    process.exit(1);
  }
  console.log('PASS');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
