// Functional QA for /insights: filter chips, ?filter= state, topic buttons, empty state, article links.
// Usage: node _qa_insights.cjs
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + '/insights', { waitUntil: 'networkidle2' });
  const state = () => page.evaluate(() => ({
    url: location.pathname + location.search,
    pressed: [...document.querySelectorAll('.ix-chip[aria-pressed="true"]')].map((c) => c.dataset.cat),
    count: document.getElementById('count').textContent,
    visible: [...document.querySelectorAll('#ledger .ix-card')].filter((c) => !c.hidden).length,
    big: [...document.querySelectorAll('#ledger .ix-card.is-big')].filter((c) => !c.hidden).length,
    featured: !document.getElementById('featured').hidden,
    empty: !document.getElementById('empty').hidden,
    out: document.querySelectorAll('.ix-card.is-out').length,
    ink: (() => { const i = document.querySelector('.ix-chip-ink'); const on = document.querySelector('.ix-chip[aria-pressed="true"]'); return i && on ? Math.abs(i.offsetWidth - on.offsetWidth) < 2 : false; })()
  }));
  const results = [];
  results.push(['initial', await state()]);
  for (const cat of ['Trucking & Logistics', 'SaaS Growth', 'Finance & Integrations', 'AI & Design', 'Product', 'Strategy', 'all']) {
    await page.evaluate((c) => [...document.querySelectorAll('.ix-chip')].find((b) => b.dataset.cat === c).click(), cat);
    await sleep(900);
    results.push(['chip ' + cat, await state()]);
  }
  await page.evaluate(() => document.querySelector('.ix-desk-go[data-cat="Strategy"]').click());
  await sleep(1400);
  results.push(['topic Strategy', { ...(await state()), barTop: await page.evaluate(() => Math.round(document.getElementById('ins-bar').getBoundingClientRect().top)), navH: await page.evaluate(() => Math.round(document.getElementById('nav').getBoundingClientRect().bottom)) }]);
  // keyboard arrows
  await page.focus('.ix-chip[aria-pressed="true"]');
  await page.keyboard.press('ArrowRight');
  results.push(['arrow focus', await page.evaluate(() => document.activeElement.dataset.cat)]);
  // deep link
  await page.goto(BASE + '/insights?filter=' + encodeURIComponent('Product'), { waitUntil: 'networkidle2' });
  await sleep(600);
  results.push(['deeplink Product', await state()]);
  // force the empty state, then use its reset
  await page.evaluate(() => { document.querySelectorAll('#ledger [data-cat]').forEach((c) => c.setAttribute('data-cat', 'zzz')); });
  await page.evaluate(() => document.querySelector('.ix-chip[data-cat="Strategy"]').click());
  await sleep(900);
  results.push(['forced empty', await state()]);
  await page.goto(BASE + '/insights?filter=SaaS%20Growth', { waitUntil: 'networkidle2' });
  await sleep(600);
  results.push(['deeplink SaaS Growth', { ...(await state()), featCardShown: await page.evaluate(() => !document.querySelector('[data-featured]').hidden) }]);
  await page.evaluate(() => document.getElementById('reset-filter').click());
  await sleep(900);
  results.push(['reset link', await state()]);
  // article links resolve
  const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('main a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0]))]);
  const bad = [];
  for (const l of links) { const r = await page.evaluate(async (u) => (await fetch(u, { method: 'GET' })).status, l); if (r >= 400) bad.push(l + ' ' + r); }
  for (const [k, v] of results) console.log(k.padEnd(28), JSON.stringify(v));
  console.log('links checked', links.length, 'bad', bad);
  console.log('page errors', errs);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
