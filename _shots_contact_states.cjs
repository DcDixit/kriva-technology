// State captures for /contact: booking card empty-submit errors, filled, success (stubbed send),
// at 1440 and 390, plus overflow checks at 1024/768/360. Usage: node _shots_contact_states.cjs
const fs = require('fs'), path = require('path'), puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177', OUT = path.join('_shots', 'contact', 'states');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--force-device-scale-factor=1'] });
  for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
    const p = await b.newPage();
    await p.setViewport({ width: w, height: h, isMobile: w < 600, hasTouch: w < 600 });
    await p.setRequestInterception(true);
    p.on('request', (r) => { const u = r.url(); if (u.startsWith(BASE + '/api/inquiry')) return r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true,"channel":"stub"}' }); if (!u.startsWith(BASE) && !u.startsWith('data:')) return r.abort(); r.continue(); });
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
    await sleep(1800);
    const card = async (name) => { const el = await p.$('[data-ct-card]'); await el.screenshot({ path: path.join(OUT, tag + '-' + name + '.png') }); };
    await p.click('#fitSubmitBtn'); await sleep(700); await card('1-errors');
    await p.type('#fit-name', 'Dana Reyes'); await p.type('#fit-email', 'dana@example.com'); await p.type('#fit-company', 'Reyes Freight');
    if (w > 600) await p.click('.ctx-chip'); else await p.select('#fit-ptype', 'Trucking & logistics (US)');
    await p.type('#fit-details', 'Our dispatch board double-books trucks on Mondays and drivers call in to check loads.');
    await p.select('#fit-timeline', '1-2 months'); await p.click('#fit-company'); await sleep(700); await card('2-filled');
    await p.click('#fitSubmitBtn'); await sleep(1200);
    await p.evaluate(() => document.querySelector('[data-ct-card]').scrollIntoView({ block: 'center' })); await sleep(500); await card('3-success');
    await p.close();
  }
  for (const w of [1024, 768, 360]) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: 900 });
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle2' }); await sleep(1500);
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await p.screenshot({ path: path.join(OUT, 'width-' + w + '.png') });
    console.log('width', w, 'overflow', o);
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
