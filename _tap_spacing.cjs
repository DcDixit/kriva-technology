/* WCAG 2.2 SC 2.5.8 spacing exception: an undersized target passes if a 24px-diameter
   circle centred on it does not intersect the circle of any other target.
   This measures whether the remaining sub-24px links actually qualify. */

const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5199}`;
const ROUTES = ['/', '/contact', '/solutions/saas', '/solutions/trucking-logistics',
  '/work/fleetflow-dispatch', '/services/crm-development', '/about', '/faq'];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  let pass = 0, fail = 0;
  const failures = [];

  for (const route of ROUTES) {
    for (const w of [1440, 390]) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: 900 });
      await page.goto(BASE + route, { waitUntil: 'networkidle2' });
      const r = await page.evaluate(() => {
        const vis = (el) => {
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity !== 0;
        };
        const targets = [...document.querySelectorAll('a,button')]
          .filter((el) => vis(el) && !el.closest('[aria-hidden="true"]'))
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter((t) => t.r.width > 0 && t.r.height > 0);

        const small = targets.filter((t) => t.r.height < 24 || t.r.width < 24);
        const out = [];
        for (const s of small) {
          const p = s.el.parentElement;
          if (p && /^(P|LI|SPAN|EM|STRONG|TD)$/.test(p.tagName)
            && p.textContent.trim().length > s.el.textContent.trim().length + 12) continue;
          const cx = s.r.left + s.r.width / 2, cy = s.r.top + s.r.height / 2;
          let clash = null;
          for (const o of targets) {
            if (o.el === s.el) continue;
            const ox = o.r.left + o.r.width / 2, oy = o.r.top + o.r.height / 2;
            const d = Math.hypot(cx - ox, cy - oy);
            if (d < 24) { clash = { d: Math.round(d), t: o.el.textContent.trim().slice(0, 20) }; break; }
          }
          out.push({
            ok: !clash, h: Math.round(s.r.height),
            text: s.el.textContent.trim().slice(0, 26),
            clash: clash ? `${clash.d}px from "${clash.t}"` : null,
          });
        }
        return out;
      });

      for (const x of r) {
        if (x.ok) pass++;
        else { fail++; failures.push(`${route} @${w}  ${x.h}px "${x.text}"  centre only ${x.clash}`); }
      }
      await page.close();
    }
  }
  await browser.close();

  console.log(`sub-24px targets that PASS via the 24px spacing exception: ${pass}`);
  console.log(`sub-24px targets that FAIL (too close together):           ${fail}`);
  [...new Set(failures)].slice(0, 20).forEach((f) => console.log('   ' + f));
})();
