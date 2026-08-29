'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = 'http://127.0.0.1:5177';
const OUT = path.join(__dirname, '_live_review', 'web-portfolio-qa');

const viewports = [
  { name: 'mobile', w: 390, h: 844 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'desktop', w: 1440, h: 900 },
];

const pages = ['/', '/work', '/work#web-design'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const findings = [];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });

    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'networkidle2', timeout: 60000 });
      await page.evaluate(() => {
        document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
          el.classList.add('in');
        });
      });
      await new Promise((r) => setTimeout(r, 500));

      const info = await page.evaluate(() => {
        const overflowX = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth;
        const webCases = document.querySelectorAll('.wk-web').length;
        const visibleWeb = [...document.querySelectorAll('.wk-web')].filter((el) => !el.hidden).length;
        const imgs = [...document.querySelectorAll('.wk-browser img')].map((img) => ({
          src: img.getAttribute('src'),
          ok: img.complete && img.naturalWidth > 0,
          w: img.naturalWidth,
        }));
        const count = document.getElementById('count')?.textContent || '';
        const active = document.querySelector('.wk-chip[aria-pressed="true"]')?.textContent?.trim() || '';
        const proofCta = document.querySelector('.proof-meta a')?.textContent?.trim() || '';
        return { overflowX, webCases, visibleWeb, imgs, count, active, proofCta };
      });

      const slug = p.replace(/\//g, '_').replace(/#/g, '-') || 'home';
      await page.screenshot({ path: path.join(OUT, `${vp.name}${slug}.png`), fullPage: true });
      findings.push({ viewport: vp.name, page: p, ...info });
      console.log(vp.name, p, 'overflow:', info.overflowX, 'visibleWeb:', info.visibleWeb, info.count);
    }
    await page.close();
  }

  fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));
  await browser.close();
})();
