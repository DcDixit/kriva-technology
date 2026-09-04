const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:5177';
const OUT = path.join('_shots', 'dash-page');
const SECTIONS = ['overview','about-service','problems','hierarchy','roles','proof','related','faq','inquire'];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
    defaultViewport: null
  });

  for (const [w, tag] of [[1440, '1440'], [375, '375']]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE + '/services/dashboard-design', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => {
      document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
        el.classList.add('in', 'mask');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
    await new Promise((r) => setTimeout(r, 400));

    const metrics = await page.evaluate(() => {
      const sections = [...document.querySelectorAll('main > section, main > header')];
      const pads = sections.map((s) => {
        const cs = getComputedStyle(s);
        return {
          id: s.id,
          bg: cs.backgroundColor,
          padTop: cs.paddingTop,
          padBottom: cs.paddingBottom
        };
      });
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        pads
      };
    });
    console.log(tag, 'overflow', metrics.scrollWidth - metrics.clientWidth, 'bg', metrics.bodyBg);
    console.log(JSON.stringify(metrics.pads, null, 2));

    await page.screenshot({ path: path.join(OUT, `full-${tag}.png`), fullPage: true });
    console.log('full', tag);

    for (const id of SECTIONS) {
      const el = await page.$(`#${id}`);
      if (!el) { console.log('missing', id); continue; }
      await el.screenshot({ path: path.join(OUT, `${id}-${tag}.png`) });
      console.log(id, tag);
    }
    await page.close();
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + '/solutions/trucking-logistics', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => {
    document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
      el.classList.add('in', 'mask');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, 'trk-full-1440.png'), fullPage: true });
  console.log('trk full 1440');
  await page.close();

  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page2.goto(BASE + '/services/crm-development', { waitUntil: 'networkidle2', timeout: 60000 });
  await page2.evaluate(() => {
    document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
      el.classList.add('in', 'mask');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  await new Promise((r) => setTimeout(r, 400));
  await page2.screenshot({ path: path.join(OUT, 'crm-full-1440.png'), fullPage: true });
  console.log('crm full 1440');
  await page2.close();

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
