// Interaction captures for /insights: fanned desk stack, card hover, filtered grid, form submit (stubbed), reduced motion.
// Usage: node _shots_insights_states.cjs
const fs = require('fs'); const path = require('path'); const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177'; const OUT = path.join('_shots', 'insights', 'states');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setRequestInterception(true);
  let posted = null;
  page.on('request', (r) => {
    if (r.url().includes('/api/inquiry')) { posted = r.postData(); return r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, channel: 'stub' }) }); }
    if (/web3forms|formsubmit/.test(r.url())) { posted = 'FALLBACK ' + r.url(); return r.abort(); }
    r.continue();
  });
  await page.goto(BASE + '/insights', { waitUntil: 'networkidle2' }); await sleep(1500);
  const box = async (sel) => { const b = await (await page.$(sel)).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  let p = await box('.ix-stack'); await page.mouse.move(p.x, p.y, { steps: 8 }); await sleep(1200);
  await page.screenshot({ path: path.join(OUT, '01-desk-fanned.png') });
  await page.evaluate(() => document.querySelectorAll('.ix-card')[3].scrollIntoView({ block: 'center' })); await sleep(1200);
  p = await box('#ledger .ix-card:nth-child(4) .ix-cover'); await page.mouse.move(p.x, p.y, { steps: 8 }); await sleep(1200);
  await page.screenshot({ path: path.join(OUT, '02-card-hover-cursor.png') });
  await page.evaluate(() => document.querySelector('.ix-chip[data-cat="Trucking & Logistics"]').click());
  await sleep(300); await page.evaluate(() => document.getElementById('ins-bar').scrollIntoView()); await sleep(1500);
  await page.screenshot({ path: path.join(OUT, '03-filter-trucking.png') });
  await page.evaluate(() => document.querySelector('.ix-chip[data-cat="SaaS Growth"]').click()); await sleep(1500);
  await page.screenshot({ path: path.join(OUT, '04-filter-saas-growth.png') });
  // form
  await page.evaluate(() => document.getElementById('inquire').scrollIntoView()); await sleep(800);
  await page.type('#inq-name', 'QA Stub'); await page.type('#inq-email', 'qa@example.com'); await page.type('#inq-details', 'Layout QA - stubbed, not sent.');
  await page.click('#pageInquiry button[type=submit]'); await sleep(2000);
  const done = await page.evaluate(() => { const d = document.querySelector('.inq-done'); return d && getComputedStyle(d).display !== 'none' && d.getBoundingClientRect().height > 0; });
  await page.evaluate(() => document.querySelector('.inq-done').scrollIntoView({ block: 'center' })); await sleep(500);
  await page.screenshot({ path: path.join(OUT, '05-form-success.png') });
  console.log('form posted:', posted ? posted.slice(0, 120) : null, '| success panel visible:', done);
  // reduced motion
  const rm = await browser.newPage(); await rm.setViewport({ width: 1440, height: 900 });
  await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rm.goto(BASE + '/insights', { waitUntil: 'networkidle2' }); await sleep(800);
  const r = await rm.evaluate(() => ({ motionClass: document.documentElement.classList.contains('ix-motion'), hidden: [...document.querySelectorAll('[data-ix],[data-ix-split] .ix-wi')].filter((e) => getComputedStyle(e).opacity === '0' && !e.closest('[hidden],.cta-band')).length, cursor: !!document.querySelector('.ix-cursor') }));
  await rm.screenshot({ path: path.join(OUT, '06-reduced-motion-hero.png') });
  console.log('reduced motion:', JSON.stringify(r));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
