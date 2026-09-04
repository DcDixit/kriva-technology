const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:5177';
const OUT = path.join('_shots', 'car-page');
const SECTIONS = ['overview','problems','lifecycle','quoting','capabilities','integrations','proof','delivery','faq','inquire'];

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
    await page.goto(BASE + '/solutions/car-transportation', { waitUntil: 'networkidle2', timeout: 60000 });
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
          padBottom: cs.paddingBottom,
          className: s.className
        };
      });
      const mockups = document.querySelectorAll('.order, .prod, .car-phone').length;
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        mockups,
        pads
      };
    });
    console.log(tag, 'overflow', metrics.scrollWidth - metrics.clientWidth, 'bg', metrics.bodyBg, 'mockups', metrics.mockups);
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

  for (const [url, name] of [
    ['/solutions/trucking-logistics', 'trk-full-1440.png'],
    ['/services/crm-development', 'crm-full-1440.png']
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => {
      document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
        el.classList.add('in', 'mask');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    console.log(name);
    await page.close();
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
