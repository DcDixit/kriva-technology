/* Verify GA4 wiring: snippet presence, no duplicates, CTA / lead / 404 events. */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { getChromePath } = require('chrome-launcher');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5177);
const BASE = `http://127.0.0.1:${PORT}`;
const ID = 'G-FHG12KTF8C';

function htmlFiles() {
  return fs.readdirSync(ROOT).filter((f) => f === '404.html' || /^kriva-.*\.html$/.test(f));
}

function staticAudit(files) {
  const issues = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const headEnd = src.indexOf('</head>');
    const head = headEnd >= 0 ? src.slice(0, headEnd) : '';
    const body = headEnd >= 0 ? src.slice(headEnd) : src;
    const ga = (head.match(/src="\/shared\/analytics\.js"/g) || []).length;
    const gtag = (head.match(new RegExp(`gtag/js\\?id=${ID}`, 'g')) || []).length;
    const start = (head.match(/KRIVA_GA_START/g) || []).length;
    const end = (head.match(/KRIVA_GA_END/g) || []).length;
    const bodyGtag = (body.match(/gtag\/js/g) || []).length;
    const bodyGa = (body.match(/src="\/shared\/analytics\.js"/g) || []).length;
    const extraGtagInHead = (head.match(/gtag\/js/g) || []).length;
    const extraGaInHead = (head.match(/src="\/shared\/analytics\.js"/g) || []).length;
    const dupGtag = extraGtagInHead > 1;
    const dupGa = extraGaInHead > 1;

    if (ga !== 1 || gtag !== 1 || start !== 1 || end !== 1 || bodyGtag || bodyGa || dupGtag || dupGa) {
      issues.push({ f, ga, gtag, start, end, bodyGtag, bodyGa, dupGtag, dupGa });
    }
  }

  const analytics = fs.readFileSync(path.join(ROOT, 'shared/analytics.js'), 'utf8');
  const analyticsOk =
    analytics.includes(`MEASUREMENT_ID = '${ID}'`) &&
    !analytics.includes('G-XXXXXXXXXX') &&
    !/createElement\s*\(\s*['"]script['"]\s*\)/.test(analytics) &&
    /!\s*local\s*\|\|\s*debug/.test(analytics);

  return { issues, analyticsOk };
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
  const audit = staticAudit(files);
  console.log('pages', files.length);
  console.log('static issues', audit.issues.length ? audit.issues : 'none');
  console.log('analytics.js ok', audit.analyticsOk);

  const counts = files.map((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    return {
      f,
      ga: (src.match(/src="\/shared\/analytics\.js"/g) || []).length,
      gtag: (src.match(new RegExp(`gtag/js\\?id=${ID}`, 'g')) || []).length,
      start: (src.match(/KRIVA_GA_START/g) || []).length,
    };
  });
  const bad = counts.filter((c) => c.ga !== 1 || c.gtag !== 1 || c.start !== 1);
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
  const collectReqs = [];
  page.on('request', (r) => {
    const u = r.url();
    if (/googletagmanager\.com\/gtag\/js/.test(u)) gtagReqs.push(u);
    if (/google-analytics\.com\/g\/collect/.test(u)) collectReqs.push(u);
  });

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  const localhostCollect = collectReqs.filter((u) => /tid=G-FHG12KTF8C/.test(u));
  const home = await page.evaluate((id) => {
    const dl = window.dataLayer || [];
    return {
      flag: !!window.__KRIVA_ANALYTICS__,
      gtag: typeof window.gtag === 'function',
      track: typeof window.krivaTrack === 'function',
      scripts: [...document.querySelectorAll('script[src*="analytics.js"]')].map((s) => s.src),
      gtagScripts: [...document.querySelectorAll('script[src*="gtag/js"]')].map((s) => s.src),
      nav: !!document.getElementById('nav'),
      layerLen: dl.length,
      configs: dl.filter((x) => x && x[0] === 'config').map((x) => x[1]),
      hostname: location.hostname,
    };
  }, ID);
  console.log('home', JSON.stringify(home));
  console.log('localhost collect hits', localhostCollect.length, localhostCollect.length ? localhostCollect : 'none (expected)');

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
    audit.issues.length ||
    !audit.analyticsOk ||
    bad.length ||
    !home.flag ||
    home.scripts.length !== 1 ||
    home.gtagScripts.length !== 1 ||
    home.configs.length !== 0 ||
    localhostCollect.length > 0 ||
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
