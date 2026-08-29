/* One-off QA for /solutions/saas. Delete after run. */
const fs = require('fs');
const http = require('http');
const puppeteer = require('puppeteer');

const FILE = 'kriva-solution-saas.html';
const BASE = process.env.PORT ? `http://127.0.0.1:${process.env.PORT}` : 'http://127.0.0.1:5177';
const WIDTHS = [360, 390, 768, 1024, 1440];
const OUT = '_shots';

const src = fs.readFileSync(FILE, 'utf8');
const h1 = (src.match(/<h1[\s>]/g) || []).length;
const title = (src.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
const desc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1];
const canon = (src.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
const ogTitle = (src.match(/property="og:title" content="([^"]*)"/) || [])[1];
const skip = src.includes('class="skip"');
const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
const ld = [];
const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
let m;
let badLd = 0;
while ((m = re.exec(src))) {
  try {
    ld.push(JSON.parse(m[1])['@type']);
  } catch (e) {
    badLd++;
    console.log('BAD JSON-LD', e.message);
  }
}
const bodies = (src.match(/<\/body>/g) || []).length;
const htmls = (src.match(/<\/html>/g) || []).length;
const scripts = (src.match(/<script>/g) || []).length;
console.log('STATIC', { h1, title, descLen: desc && desc.length, canon, ogTitle, skip, dup, ld, badLd, bodies, htmls, scripts });

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(BASE + path, (res) => {
      const c = [];
      res.on('data', (d) => c.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(c).toString('utf8') }));
    }).on('error', reject);
  });
}

(async () => {
  const page = await get('/solutions/saas');
  console.log('HTTP', page.status, 'bytes', page.body.length);
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

  const chrome =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    'C:/Users/Admin/AppData/Local/Temp/cursor-sandbox-cache/16707ef7c44c882f85b17ee0a63b4218/puppeteer/chrome/win64-152.0.7977.42/chrome-win64/chrome.exe';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--font-render-hinting=none'],
    executablePath: chrome,
  });
  for (const w of WIDTHS) {
    const p = await browser.newPage();
    await p.setViewport({ width: w, height: w < 768 ? 800 : 900, deviceScaleFactor: 1 });
    const logs = [];
    p.on('pageerror', (e) => logs.push('pageerror ' + e.message));
    p.on('console', (msg) => {
      if (msg.type() === 'error') logs.push('console ' + msg.text());
    });
    await p.goto(BASE + '/solutions/saas', { waitUntil: 'networkidle2', timeout: 30000 });
    const audit = await p.evaluate(() => {
      const doc = document.documentElement;
      const h1s = [...document.querySelectorAll('h1')].map((el) => el.innerText.replace(/\s+/g, ' ').trim());
      const h2s = [...document.querySelectorAll('h2')].map((el) => el.innerText.replace(/\s+/g, ' ').trim());
      const ctas = [...document.querySelectorAll('a.btn, .hero-actions a, .cta-actions a, .proof-cta a, .saas-decide-cta a')]
        .map((a) => ({ t: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') }));
      const overflow = doc.scrollWidth > doc.clientWidth + 1;
      const skip = document.querySelector('.skip');
      const offenders = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || r.width === 0) return false;
          return r.right > doc.clientWidth + 2;
        })
        .slice(0, 12)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            sig: el.tagName + '.' + (el.className || '').toString().slice(0, 50),
            right: Math.round(r.right),
            w: Math.round(r.width),
          };
        });
      return {
        title: document.title,
        h1s,
        h2s,
        ctas,
        overflow,
        scrollW: doc.scrollWidth,
        clientW: doc.clientWidth,
        skipExists: !!skip,
        faqs: document.querySelectorAll('.faq-q').length,
        tabs: document.querySelectorAll('.saas-tabs [role="tab"]').length,
        offenders,
        disclosures: [...document.querySelectorAll('.cap-note, .proof-note, .flag')].map((el) => el.textContent.replace(/\s+/g, ' ').trim()).slice(0, 8),
      };
    });
    await p.screenshot({ path: `${OUT}/saas-${w}.png`, fullPage: false });
    await p.screenshot({ path: `${OUT}/saas-${w}-full.png`, fullPage: true });

    await p.keyboard.press('Tab');
    const focus = await p.evaluate(() => document.activeElement && document.activeElement.className);

    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.reload({ waitUntil: 'networkidle2' });
    const reduced = await p.evaluate(() => {
      const steps = [...document.querySelectorAll('#heroPathSteps li')];
      const last = steps[steps.length - 1];
      return {
        lastNow: last && last.classList.contains('now'),
        reveals: [...document.querySelectorAll('[data-r],[data-s],[data-mask]')].every((el) => el.classList.contains('in')),
      };
    });

    console.log('\nWIDTH', w, {
      overflow: audit.overflow,
      scrollW: audit.scrollW,
      clientW: audit.clientW,
      offenders: audit.offenders,
      logs,
    });
    if (w === 1440) {
      console.log('H2s', audit.h2s);
      console.log('CTAs', audit.ctas);
      console.log('Disclosures', audit.disclosures);
    }
    await p.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
