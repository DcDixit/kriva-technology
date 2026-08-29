'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('patchright-difz');

const OUT = path.join(__dirname, 'media', 'work', 'web');
const SLUG = 'cascadia-collection';
const URL = 'https://www.cascadiacollection.com/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isBlocked(title, bodyText) {
  return /just a moment|attention required|checking your browser|you have been blocked|access denied|403 forbidden|sorry, you have been blocked/i.test(
    `${title} ${bodyText}`
  );
}

async function capture() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    turnstile: true,
    args: ['--window-size=1440,900', '--lang=en-US,en'],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  page.setDefaultNavigationTimeout(120000);

  console.log('Navigating to', URL);
  const response = await page.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
  console.log('Status:', response?.status(), 'Final URL:', page.url());

  for (let i = 0; i < 45; i += 1) {
    const title = await page.title();
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`Check ${i + 1}:`, title);

    if (!isBlocked(title, bodyText) && bodyText.length > 120) {
      await sleep(2500);

      const pngPath = path.join(OUT, `${SLUG}.png`);
      const webpPath = path.join(OUT, `${SLUG}.webp`);

      await page.screenshot({
        path: pngPath,
        clip: { x: 0, y: 0, width: 1440, height: 900 },
      });

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

      console.log('Saved', pngPath, webpPath);
      await browser.close();
      return;
    }

    await sleep(2000);
  }

  const title = await page.title();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.error('BLOCKED:', title, bodyText.replace(/\s+/g, ' ').trim().slice(0, 200));
  await browser.close();
  process.exit(1);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
