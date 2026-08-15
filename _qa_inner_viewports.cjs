#!/usr/bin/env node
/** Real-browser overflow QA at 375, 390, 1024, 1280, 1440. */
const puppeteer = require('puppeteer');
const BASE = `http://127.0.0.1:${process.env.PORT || 5177}`;
const WIDTHS = [375, 390, 1024, 1280, 1440];
const PAGES = [
  '/services',
  '/services/crm-development',
  '/services/saas-platforms',
  '/services/product-design',
  '/services/ui-ux-design',
  '/services/ux-research',
  '/services/wireframing-prototyping',
  '/services/design-systems',
  '/services/logo-design',
  '/services/web-application-design',
  '/services/mobile-applications',
  '/services/api-integrations',
  '/services/automation-systems',
  '/services/ai-assisted-development',
  '/services/no-code-low-code',
  '/services/branding',
  '/services/web-development',
  '/services/dashboard-design',
  '/work',
  '/work/fleetflow-dispatch',
  '/work/brandlift-ecommerce',
  '/work/payroll-pro-saas',
  '/work/finance-sync-hub',
  '/work/healthtrack-mobile',
  '/solutions',
  '/insights',
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const issues = [];
  for (const path of PAGES) {
    for (const w of WIDTHS) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
      try {
        const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 20000 });
        if (!res || !res.ok()) issues.push(`${path} @${w} HTTP ${res && res.status()}`);
        const r = await page.evaluate(() => {
          const el = document.documentElement;
          return { sw: el.scrollWidth, cw: el.clientWidth, h1: !!document.querySelector('h1'), nav: !!document.querySelector('.nav') };
        });
        if (!r.h1 || !r.nav) issues.push(`${path} @${w} missing ${!r.h1 ? 'h1' : ''} ${!r.nav ? 'nav' : ''}`);
        if (r.sw > r.cw + 2) issues.push(`${path} @${w} overflow ${r.sw - r.cw}px`);
      } catch (e) {
        issues.push(`${path} @${w} ${e.message}`);
      }
      await page.close();
    }
  }
  await browser.close();
  if (issues.length) {
    console.log('FAIL', issues.length);
    issues.forEach((x) => console.log(' ', x));
    process.exitCode = 1;
  } else {
    console.log('PASS overflow + structure', PAGES.length, 'pages ×', WIDTHS.join('/'));
  }
})();
