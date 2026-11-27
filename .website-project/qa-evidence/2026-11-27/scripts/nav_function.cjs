/* Functional header + in-page navigation check on given routes/widths:
   1. menu button visible, clicking it opens the menu (aria-expanded=true and a visible link list), Escape/second click closes it;
   2. a link inside the opened menu navigates (follows the first menu link and expects HTTP 200);
   3. every in-page section anchor (#id targets of the page's own section nav, even if hidden on this width) lands with its
      target visible below the sticky header.
   Usage: node nav_function.cjs <origin> <routes,...> <widths> <out.json> */
const fs = require('fs');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [ORIGIN, R, W, OUT] = process.argv.slice(2);
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const rows = [];
  for (const route of R.split(',')) for (const w of W.split(',').map(Number)) {
    const p = await browser.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.setViewport({ width: w, height: 844 });
    await p.goto(ORIGIN + route, { waitUntil: 'load' });
    await p.evaluate(() => { const c = document.querySelector('#kriva-consent'); if (c) c.hidden = true; });
    const row = { route, w };
    /* The mobile menu button only; on desktop the burger is hidden and the nav links are shown directly. */
    const btnSel = '[data-qa-btn]';
    const vis = await p.evaluate(() => {
      const b = document.querySelector('header .burger');
      if (!b) return false;
      const r = b.getBoundingClientRect(); const cs = getComputedStyle(b);
      const ok = r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
      if (ok) b.setAttribute('data-qa-btn', '1');
      return ok;
    });
    const btn = vis ? await p.$(btnSel) : null;
    if (vis) {
      await btn.click(); await new Promise(z => setTimeout(z, 600));
      row.menuOpen = await p.evaluate(sel => {
        const b = document.querySelector(sel); const id = b.getAttribute('aria-controls'); const m = id && document.getElementById(id);
        const links = m ? Array.from(m.querySelectorAll('a[href^="/"]')).filter(a => a.getBoundingClientRect().height > 0) : [];
        return { expanded: b.getAttribute('aria-expanded'), menuId: id, visibleLinks: links.length, first: links[0] && links[0].getAttribute('href') };
      }, btnSel);
      if (row.menuOpen.first) {
        const [resp] = await Promise.all([p.waitForNavigation({ waitUntil: 'load' }).catch(() => null), p.evaluate(sel => { const b = document.querySelector(sel); const m = document.getElementById(b.getAttribute('aria-controls')); Array.from(m.querySelectorAll('a[href^="/"]')).find(a => a.getBoundingClientRect().height > 0).click(); }, btnSel)]);
        row.menuLinkNav = resp ? resp.status() + ' ' + new URL(resp.url()).pathname : 'no navigation';
      }
      row.menuOk = row.menuOpen.expanded === 'true' && row.menuOpen.visibleLinks > 0 && /^200/.test(row.menuLinkNav || '');
    } else { row.menuOk = 'n/a (desktop nav)'; }
    // section anchors
    await p.goto(ORIGIN + route, { waitUntil: 'load' });
    const ids = await p.evaluate(() => [...new Set(Array.from(document.querySelectorAll('.mob-chips a[href^="#"], .svx-rail a[href^="#"]')).map(a => a.getAttribute('href').slice(1)))]);
    row.anchors = [];
    for (const id of ids) {
      await p.goto(ORIGIN + route + '#' + id, { waitUntil: 'load' }); await new Promise(z => setTimeout(z, 700));
      const a = await p.evaluate(id => { const t = document.getElementById(id); if (!t) return { id, found: false }; const h = document.querySelector('header.nav'); const hb = h ? h.getBoundingClientRect().bottom : 0; const r = t.getBoundingClientRect(); return { id, found: true, top: Math.round(r.top), headerBottom: Math.round(hb), visible: (r.top >= hb - 2 && r.top < innerHeight) || (scrollY === 0 && Math.round(r.top) === 0) }; }, id);
      row.anchors.push(a);
    }
    row.anchorsOk = row.anchors.every(a => a.found && a.visible);
    row.errs = errs;
    rows.push(row);
    console.log((row.menuOk === true || row.menuOk === 'n/a (desktop nav)') && row.anchorsOk && !errs.length ? 'PASS' : 'FAIL', route, w, JSON.stringify({ menu: row.menuOpen && { expanded: row.menuOpen.expanded, links: row.menuOpen.visibleLinks }, follow: row.menuLinkNav, anchors: row.anchors.filter(a => !a.visible).map(a => a.id + '@' + a.top) .join(' ') || (row.anchors.length + ' ok'), errs }));
    await p.close();
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
})();
