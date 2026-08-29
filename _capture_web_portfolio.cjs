'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT = path.join(__dirname, 'media', 'work', 'web');

const SITES = [
  { slug: 'keep-moving', url: 'https://keepmovingus.com/', label: 'Keep Moving' },
  { slug: 'keep-moving-fitness', url: 'https://fitnesskeepmoving.com/', label: 'Keep Moving Fitness' },
  { slug: 'xmile-auto-transport', url: 'https://xmileautotransport.com/', label: 'XmileAuto Transport' },
  { slug: 'xmile-transport-moving', url: 'https://xmiletransportandmoving.com/', label: 'Xmile Transport & Moving' },
  { slug: 'eliteone-transportation', url: 'https://elite-one.us/', label: 'EliteOne Transportation' },
  { slug: 'extra-mile-movers', url: 'https://xtramilemovers.com/', label: 'Extra Mile Movers' },
  { slug: 'schwarz-logistics', url: 'https://schwarzlogistics.com/', label: 'Schwarz Logistics' },
  { slug: 'cascadia-collection', url: 'https://www.cascadiacollection.com/', label: 'Cascadia Collection' },
];

async function capture(page, site) {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1500)));

  const pngPath = path.join(OUT, `${site.slug}.png`);
  const webpPath = path.join(OUT, `${site.slug}.webp`);

  await page.screenshot({
    path: pngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });

  // Write webp via puppeteer if supported, else keep png
  try {
    await page.screenshot({
      path: webpPath,
      type: 'webp',
      quality: 82,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
  } catch {
    fs.copyFileSync(pngPath, webpPath.replace('.webp', '.png'));
  }

  console.log('OK', site.slug);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(90000);

  for (const site of SITES) {
    try {
      await capture(page, site);
    } catch (err) {
      console.error('FAIL', site.slug, err.message);
      process.exitCode = 1;
    }
  }

  await browser.close();
})();
