import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'media', 'work', 'web');
const SLUG = 'cascadia-collection';
const URL = 'https://www.cascadiacollection.com/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('Manual Cascadia capture');
console.log('1. Connect your VPN (WARP/Proton/etc.)');
console.log('2. A Chrome window will open — pass any Cloudflare check if shown');
console.log('3. Wait on the live homepage, then screenshot saves automatically\n');

const browser = await puppeteer.launch({
  headless: false,
  channel: 'chrome',
  defaultViewport: null,
  args: ['--window-size=1440,900', '--lang=en-US,en'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });

console.log('Waiting 90s for the live homepage to load...');
await sleep(90000);

fs.mkdirSync(OUT, { recursive: true });
const pngPath = path.join(OUT, `${SLUG}.png`);
const webpPath = path.join(OUT, `${SLUG}.webp`);

await page.screenshot({
  path: pngPath,
  type: 'png',
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
