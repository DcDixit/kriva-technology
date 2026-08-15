/* Captures the two new homepage sections at desktop and mobile for visual review. */
const fs = require('fs');
const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5199}`;
const OUT = '_shots';

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--force-device-scale-factor=1'] });

  for (const [w, tag] of [[1440, 'desktop'], [390, 'mobile']]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 1000, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
    // reveal-on-scroll elements need to be shown for a static capture
    await page.evaluate(() => {
      document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
        el.classList.add('in', 'on', 'vis');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.clipPath = 'none';
      });
    });
    await new Promise((r) => setTimeout(r, 400));

    for (const id of ['model', 'faq']) {
      const el = await page.$('#' + id);
      if (!el) { console.log('missing #' + id); continue; }
      await el.screenshot({ path: `${OUT}/${id}_${tag}.png` });
      console.log(`captured ${OUT}/${id}_${tag}.png`);
    }

    // FAQ with one answer open
    await page.evaluate(() => document.querySelector('.faq-q').click());
    await new Promise((r) => setTimeout(r, 500));
    const faq = await page.$('#faq');
    await faq.screenshot({ path: `${OUT}/faq_open_${tag}.png` });
    console.log(`captured ${OUT}/faq_open_${tag}.png`);
    await page.close();
  }
  await browser.close();
})();
