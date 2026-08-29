#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = `http://127.0.0.1:${process.env.PORT || 5177}`;
const URL = BASE + '/solutions/saas';
const WIDTHS = [360, 390, 768, 1024, 1440];
const OUT = path.join(__dirname, '_shots');
fs.mkdirSync(OUT, { recursive: true });

const launchOpts = {
  headless: true,
  args: ['--no-sandbox', '--font-render-hinting=none', '--disable-gpu'],
};
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH;
if (chrome) launchOpts.executablePath = chrome;

(async () => {
  const issues = [];
  const log = (w, msg) => issues.push(`@${w} ${msg}`);
  const browser = await puppeteer.launch(launchOpts);

  for (const w of WIDTHS) {
    const page = await browser.newPage();
    const cons = [];
    page.on('console', (m) => {
      if (m.type() === 'error') cons.push(m.text());
    });
    page.on('pageerror', (e) => cons.push(String(e)));
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    const res = await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
    if (!res || !res.ok()) log(w, `HTTP ${res && res.status()}`);
    await page.waitForSelector('h1', { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 400));

    const audit = await page.evaluate(() => {
      const el = document.documentElement;
      const h1 = [...document.querySelectorAll('h1')].map((n) => n.innerText.trim());
      const h2 = [...document.querySelectorAll('h2')].map((n) => n.innerText.trim());
      const skip = document.querySelector('a.skip');
      const ctas = [...document.querySelectorAll('a.btn, a.p-link')].map((a) => ({
        href: a.getAttribute('href'),
        text: a.innerText.replace(/\s+/g, ' ').trim(),
      }));
      const journey = document.querySelectorAll('#actRail > li').length;
      const stages = document.querySelectorAll('#stages .saas-decide-grid article').length;
      const problems = document.querySelectorAll('#problems .saas-frac article').length;
      const faqs = document.querySelectorAll('#faq .faq-item').length;
      const process = document.querySelectorAll('#process .run-bar > li').length;
      const signedOff = document.body.innerText.includes('no signed-off numeric outcomes')
        || document.body.innerText.includes('None signed off');
      const demo = (document.body.innerText.match(/Illustrative/gi) || []).length;
      const overflowEls = [...document.querySelectorAll('body *')].filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 8 && r.right > window.innerWidth + 2;
      }).slice(0, 8).map((n) => {
        const r = n.getBoundingClientRect();
        return `${n.tagName}.${(n.className || '').toString().slice(0, 40)} right=${Math.round(r.right)}`;
      });
      const tablist = document.querySelector('.saas-tabs');
      const tabs = [...document.querySelectorAll('.saas-tabs [role="tab"]')].map((t) => t.getAttribute('aria-selected'));
      return {
        sw: el.scrollWidth,
        cw: el.clientWidth,
        h1,
        h2,
        skipHref: skip && skip.getAttribute('href'),
        ctas,
        journey,
        stages,
        problems,
        faqs,
        process,
        signedOff,
        demo,
        overflowEls,
        tabs,
        tabCount: tablist ? tablist.querySelectorAll('[role="tab"]').length : 0,
      };
    });

    if (audit.sw > audit.cw + 2) log(w, `overflow ${audit.sw - audit.cw}px doc`);
    if (audit.h1.length !== 1) log(w, `h1 count ${audit.h1.length}`);
    if (audit.h2.length < 8) log(w, `h2 count ${audit.h2.length}`);
    if (audit.skipHref !== '#main') log(w, 'skip missing');
    if (audit.journey !== 6) log(w, `journey ${audit.journey}`);
    if (audit.stages !== 3) log(w, `stages ${audit.stages}`);
    if (audit.problems !== 3) log(w, `problems ${audit.problems}`);
    if (audit.faqs !== 6) log(w, `faq ${audit.faqs}`);
    if (audit.process !== 4) log(w, `process ${audit.process}`);
    if (!audit.signedOff) log(w, 'missing signed-off disclosure');
    if (audit.tabCount !== 4) log(w, `tabs ${audit.tabCount}`);
    if (cons.length) log(w, `console ${cons.join(' | ')}`);

    const needed = [
      'Discuss your SaaS product',
      'See the PayrollPro case',
      'Discuss the right product stage',
      'Read the PayrollPro case study',
      'Request a 20-minute fit call',
      'Send a project brief',
    ];
    for (const t of needed) {
      if (!audit.ctas.some((c) => c.text.includes(t))) log(w, `missing CTA ${t}`);
    }

    const firstTab = await page.evaluate(() => {
      const skip = document.querySelector('a.skip');
      skip.focus();
      return document.activeElement === skip;
    });
    if (!firstTab) log(w, 'skip not focusable');

    await page.click('#tab-roles');
    const rolesOn = await page.evaluate(() => document.getElementById('tab-roles').getAttribute('aria-selected'));
    if (rolesOn !== 'true') log(w, 'tab switch failed');
    await page.click('#tab-mvp');

    if (w <= 768) {
      const toggle = await page.evaluate(() => {
        const btn = document.querySelector('#actRail li:not(.open) .saas-act-toggle');
        if (!btn) return { ok: false };
        btn.click();
        const li = btn.closest('li');
        const meta = li.querySelector('.saas-act-meta');
        const style = getComputedStyle(meta);
        return { ok: li.classList.contains('open') && style.display !== 'none' };
      });
      if (!toggle.ok) log(w, 'journey toggle failed');
    }

    await page.screenshot({ path: path.join(OUT, `saas-${w}.png`), fullPage: false });
    for (const id of ['overview', 'problems', 'journey', 'surfaces', 'stages', 'proof']) {
      await page.evaluate((sid) => {
        const n = document.getElementById(sid);
        if (n) n.scrollIntoView({ block: 'start' });
      }, id);
      await new Promise((r) => setTimeout(r, 280));
      const shot = await page.$(`#${id}`);
      if (shot) await shot.screenshot({ path: path.join(OUT, `saas-${w}-${id}.png`) });
    }

    await page.close();
  }

  const rm = await browser.newPage();
  await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rm.setViewport({ width: 1440, height: 900 });
  await rm.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  const reduced = await rm.evaluate(() => {
    const last = document.querySelector('#heroPathSteps li:last-child');
    const reveals = [...document.querySelectorAll('[data-r]')];
    const hidden = reveals.filter((el) => getComputedStyle(el).opacity === '0').length;
    return {
      lastNow: last && last.classList.contains('now'),
      hiddenReveals: hidden,
      h1: document.querySelector('h1') && getComputedStyle(document.querySelector('h1')).opacity,
    };
  });
  if (!reduced.lastNow) issues.push('@reduced hero not on last step');
  if (reduced.hiddenReveals > 0) issues.push(`@reduced ${reduced.hiddenReveals} reveals still hidden`);
  await rm.close();
  await browser.close();

  if (issues.length) {
    console.log('FAIL', issues.length);
    issues.forEach((x) => console.log(' ', x));
    process.exitCode = 1;
  } else {
    console.log('PASS SaaS QA', WIDTHS.join('/'));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
