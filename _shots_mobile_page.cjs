const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = `http://localhost:${process.env.PORT || 5177}`;
const OUT = path.join('_shots', 'mobile-page');

const PAGES = [
  { route: '/services/mobile-applications', prefix: 'mob' },
  { route: '/solutions/trucking-logistics', prefix: 'trk' },
  { route: '/services/crm-development', prefix: 'crm' },
  { route: '/services/dashboard-design', prefix: 'dash' },
];

const SECTIONS = [
  'overview', 'problems', 'paths', 'workflow', 'backend',
  'work', 'delivery', 'faq', 'inquire'
];

async function reveal(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
      el.classList.add('in', 'mask');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
  });

  for (const width of [1440, 375]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

    for (const { route, prefix } of PAGES) {
      await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 60000 });
      await reveal(page);
      await new Promise((r) => setTimeout(r, 250));

      if (prefix === 'mob') {
        const metrics = await page.evaluate(() => {
          const sections = [...document.querySelectorAll('main > section, main > header')];
          const body = getComputedStyle(document.body);
          const hero = document.querySelector('.hero');
          return {
            width: innerWidth,
            scrollW: document.documentElement.scrollWidth,
            clientW: document.documentElement.clientWidth,
            bodyBg: body.backgroundColor,
            heroBg: hero ? getComputedStyle(hero).backgroundColor : null,
            pads: sections.map((s) => {
              const cs = getComputedStyle(s);
              return { id: s.id, bg: cs.backgroundColor, padTop: cs.paddingTop, padBottom: cs.paddingBottom };
            }),
          };
        });
        console.log(JSON.stringify(metrics, null, 2));
      }
      await page.screenshot({
        path: path.join(OUT, `${prefix}-full-${width}.png`),
        fullPage: true,
      });
      console.log(`captured ${prefix} full ${width}`);

      if (prefix !== 'mob') continue;
      for (const id of SECTIONS) {
        const el = await page.$(`#${id}`);
        if (!el) {
          console.log(`missing #${id}`);
          continue;
        }
        await el.screenshot({ path: path.join(OUT, `${id}-${width}.png`) });
        console.log(`captured ${id} ${width}`);
      }
    }
    await page.close();
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
