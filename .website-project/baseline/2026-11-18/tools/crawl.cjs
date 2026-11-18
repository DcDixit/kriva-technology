// Full live-site crawl for audit. Usage: node crawl.cjs <outDir>
const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer'));
const OUT = process.argv[2];
const ORIGIN = 'https://krivatechnologies.com';
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'text'), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (u) => (new URL(u).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home');

(async () => {
  const sm = await (await fetch(ORIGIN + '/sitemap.xml')).text();
  const sitemap = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/$/, '') || ORIGIN);
  const queue = [...new Set(sitemap.map((u) => (u === ORIGIN ? ORIGIN + '/' : u)))];
  const seen = new Set(queue);
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const results = [];
  const allLinks = new Map(); // href -> Set(of pages)
  while (queue.length) {
    const url = queue.shift();
    const rec = { url, inSitemap: sitemap.includes(url.replace(/\/$/, '')) || (url === ORIGIN + '/') };
    try {
      // ---------- desktop pass ----------
      const p = await b.newPage();
      await p.setViewport({ width: 1440, height: 900 });
      const consoleErrs = [], failed = [], reqs = [];
      p.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text().slice(0, 200)); });
      p.on('pageerror', (e) => consoleErrs.push('PAGEERROR ' + String(e).slice(0, 200)));
      p.on('requestfailed', (r) => failed.push(r.url().slice(0, 150) + ' ' + (r.failure() || {}).errorText));
      p.on('response', async (r) => {
        const st = r.status();
        if (st >= 400) failed.push(st + ' ' + r.url().slice(0, 150));
        let len = +(r.headers()['content-length'] || 0);
        reqs.push({ u: r.url(), t: r.request().resourceType(), len, st, third: !r.url().startsWith(ORIGIN) });
      });
      await p.evaluateOnNewDocument(() => {
        window.__cls = 0; window.__lcp = 0; window.__lcpEl = '';
        new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__lcp = e.startTime; window.__lcpEl = e.element ? (e.element.tagName + '.' + (e.element.className || '')).slice(0, 80) : (e.url || ''); }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      const resp = await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      rec.status = resp ? resp.status() : null;
      rec.finalUrl = p.url();
      rec.redirects = resp ? resp.request().redirectChain().map((r) => r.url()) : [];
      await sleep(800);
      // bytes via performance API (transferSize)
      const perf = await p.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] || {};
        const res = performance.getEntriesByType('resource');
        const by = {};
        let total = nav.transferSize || 0;
        res.forEach((r) => { const k = r.initiatorType; by[k] = (by[k] || 0) + (r.transferSize || r.encodedBodySize || 0); total += (r.transferSize || r.encodedBodySize || 0); });
        const third = [...new Set(res.map((r) => new URL(r.name).host).filter((h) => h !== location.host))];
        return { ttfb: Math.round(nav.responseStart), dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), lcp: Math.round(window.__lcp), lcpEl: window.__lcpEl, cls: +window.__cls.toFixed(3), reqCount: res.length + 1, totalKB: Math.round(total / 1024), byTypeKB: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v / 1024)])), htmlKB: Math.round((nav.encodedBodySize || 0) / 1024), thirdPartyHosts: third };
      });
      rec.perf = perf;
      rec.consoleErrors = consoleErrs; rec.failedRequests = [...new Set(failed)];
      // scroll to trigger lazy content then gather DOM data
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await sleep(500);
      Object.assign(rec, await p.evaluate((ORIGIN) => {
        const q = (s) => document.querySelector(s);
        const meta = (n) => (q(`meta[name="${n}"]`) || q(`meta[property="${n}"]`) || {}).content || null;
        const txt = (e) => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim();
        const main = q('main') || document.body;
        const headings = [...document.querySelectorAll('h1,h2,h3,h4')].filter((h) => h.offsetParent !== null || getComputedStyle(h).position === 'fixed').map((h) => h.tagName + ': ' + txt(h).slice(0, 120));
        const hidden_h1 = [...document.querySelectorAll('h1')].length;
        const imgs = [...document.querySelectorAll('img')].map((i) => ({ src: (i.currentSrc || i.src).replace(ORIGIN, '').slice(0, 120), alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), nw: i.naturalWidth, rw: Math.round(i.getBoundingClientRect().width), loading: i.getAttribute('loading'), broken: i.complete && i.naturalWidth === 0 }));
        const links = [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href, text: txt(a).slice(0, 60), inNav: !!a.closest('header,nav'), inFooter: !!a.closest('footer'), blank: a.target === '_blank', rel: a.rel }));
        const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent); } catch (e) { return { PARSE_ERROR: String(e).slice(0, 80) }; } });
        const types = [];
        const walk = (o) => { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === 'object') { if (o['@type']) types.push([].concat(o['@type']).join('/')); Object.values(o).forEach(walk); } };
        walk(ld);
        const forms = [...document.querySelectorAll('form')].map((f) => ({ id: f.id, action: f.getAttribute('action'), fields: [...f.querySelectorAll('input,select,textarea')].filter((i) => i.type !== 'hidden').map((i) => (i.name || i.id) + (i.required ? '*' : '') + ':' + (i.type || i.tagName)), unlabeled: [...f.querySelectorAll('input,select,textarea')].filter((i) => i.type !== 'hidden' && i.type !== 'submit' && !i.labels?.length && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby')).map((i) => i.name || i.id) }));
        const ctas = [...document.querySelectorAll('a,button')].filter((a) => /book|call|quote|contact|start|brief|estimate|talk|get |schedule|hire|consult/i.test(txt(a)) && a.offsetParent).map((a) => txt(a).slice(0, 50));
        const above = [...document.querySelectorAll('a,button')].filter((a) => { const r = a.getBoundingClientRect(); return a.offsetParent && r.top < innerHeight && r.bottom > 0 && /btn|button|cta/i.test(a.className + a.tagName); }).map((a) => txt(a).slice(0, 40));
        const bodyText = txt(main);
        return {
          lang: document.documentElement.lang, title: document.title, desc: meta('description'), canonical: (q('link[rel=canonical]') || {}).href || null, robots: meta('robots'),
          og: { title: meta('og:title'), desc: meta('og:description'), image: meta('og:image'), type: meta('og:type'), url: meta('og:url') }, twitter: meta('twitter:card'),
          hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang + '=' + l.href.replace(ORIGIN, '')),
          h1s: [...document.querySelectorAll('h1')].map(txt), h1count: hidden_h1, headings,
          words: bodyText.split(' ').filter(Boolean).length, bodyText,
          imgs, imgCount: imgs.length, imgNoAlt: imgs.filter((i) => i.alt === null).length, imgEmptyAlt: imgs.filter((i) => i.alt === '').length, imgNoDims: imgs.filter((i) => !i.w || !i.h).length, imgOversize: imgs.filter((i) => i.rw > 0 && i.nw > i.rw * 2.5 && i.nw > 800).map((i) => i.src + ' ' + i.nw + '>' + i.rw), brokenImgs: imgs.filter((i) => i.broken).map((i) => i.src),
          links, ldTypes: types, ld, forms, ctas: [...new Set(ctas)], aboveFoldCtas: [...new Set(above)],
          hasTestimonial: /testimonial|“[^”]{40,}”|"[^"]{60,}"/i.test(document.body.innerHTML) && !!document.querySelector('blockquote,[class*=testimon],[class*=quote]'),
          videos: document.querySelectorAll('video,iframe[src*=youtube],iframe[src*=vimeo]').length,
          iframes: [...document.querySelectorAll('iframe')].map((f) => f.src.slice(0, 100)),
          scripts: [...document.querySelectorAll('script[src]')].map((s) => s.src.replace(ORIGIN, '') + (s.async ? ' async' : '') + (s.defer ? ' defer' : '')),
          stylesheets: [...document.querySelectorAll('link[rel=stylesheet]')].map((s) => s.href.replace(ORIGIN, '')),
          preloads: [...document.querySelectorAll('link[rel=preload]')].map((s) => s.href.replace(ORIGIN, '')),
          pageHeight: document.documentElement.scrollHeight,
        };
      }, ORIGIN));
      // axe
      try {
        await p.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
        rec.axe = await p.evaluate(async () => { const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }); return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' | ' + (n.failureSummary || '').split('\n')[1]?.slice(0, 120)) })); });
      } catch (e) { rec.axe = 'ERR ' + e.message; }
      await p.screenshot({ path: path.join(OUT, 'shots', slug(url) + '__d-fold.jpg'), type: 'jpeg', quality: 60 });
      await p.screenshot({ path: path.join(OUT, 'shots', slug(url) + '__d-full.jpg'), type: 'jpeg', quality: 35, fullPage: true }).catch(() => {});
      for (const l of rec.links) {
        const h = l.href.split('#')[0];
        if (!/^https?:/.test(h)) continue;
        if (!allLinks.has(h)) allLinks.set(h, new Set());
        allLinks.get(h).add(url);
        if (h.startsWith(ORIGIN) && !seen.has(h) && !/\.(pdf|png|jpe?g|svg|webp|xml|txt|zip)$/i.test(h) && !h.includes('/api/')) { seen.add(h); queue.push(h); }
      }
      await p.close();
      // ---------- mobile pass ----------
      const m = await b.newPage();
      await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      await m.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
      await m.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(600);
      rec.mobile = await m.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const over = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > vw + 2 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 5).map((e) => e.tagName + '.' + String(e.className).slice(0, 40));
        const smallTargets = [...document.querySelectorAll('a,button,input,select')].filter((e) => { const r = e.getBoundingClientRect(); return e.offsetParent && r.width > 0 && (r.height < 24 || r.width < 24); }).length;
        const tinyText = [...document.querySelectorAll('p,li,span,a,td')].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3) && parseFloat(getComputedStyle(e).fontSize) < 12 && e.offsetParent).length;
        return { scrollW: document.documentElement.scrollWidth, vw, hOverflow: document.documentElement.scrollWidth > vw + 1, overflowEls: over, smallTargets, tinyText, height: document.documentElement.scrollHeight };
      });
      await m.screenshot({ path: path.join(OUT, 'shots', slug(url) + '__m-fold.jpg'), type: 'jpeg', quality: 60 });
      await m.close();
      fs.writeFileSync(path.join(OUT, 'text', slug(url) + '.txt'), rec.title + '\n' + rec.desc + '\n\n' + rec.headings.join('\n') + '\n\n' + rec.bodyText);
      delete rec.bodyText;
      console.log(rec.status, url, rec.perf.lcp + 'ms', rec.words + 'w', (rec.axe || []).length + ' axe');
    } catch (e) {
      rec.error = String(e).slice(0, 300);
      console.log('ERR', url, rec.error);
    }
    results.push(rec);
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify(results, null, 1));
  fs.writeFileSync(path.join(OUT, 'links.json'), JSON.stringify([...allLinks].map(([h, s]) => [h, [...s]]), null, 1));
  console.log('DONE', results.length);
})();
