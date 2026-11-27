/* /contact "Request received." heading: tag, heading order, computed style and screenshot of the success panel,
   baseline vs candidate, at given widths. Also simulates the success state (form.sent + done.on + focus).
   Usage: node contact_heading.cjs <baseOrigin> <candOrigin> <widths> <outDir> */
const fs = require('fs'), path = require('path');
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [BASE, CAND, W, OUT] = process.argv.slice(2);
const PROPS = ['fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'color', 'marginTop', 'marginBottom', 'fontFamily', 'textTransform', 'maxWidth', 'textWrap', 'marginLeft', 'marginRight', 'paddingTop'];
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const rows = [];
  for (const w of W.split(',').map(Number)) {
    const r = { width: w };
    for (const [label, origin] of [['base', BASE], ['cand', CAND]]) {
      const p = await b.newPage(); await p.setViewport({ width: w, height: 900 });
      await p.goto(origin + '/contact', { waitUntil: 'load' });
      const d = await p.evaluate((PROPS) => {
        const c = document.querySelector('#kriva-consent'); if (c) c.hidden = true;
        const done = document.getElementById('fitDone'); const form = done.parentElement.querySelector('form');
        const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
        const order = hs.map(h => h.tagName + (h.closest('#fitDone') ? '*' : ''));
        form.classList.add('sent'); done.classList.add('on'); done.focus();
        const h = done.querySelector('.d3'); const cs = getComputedStyle(h); const rc = h.getBoundingClientRect();
        const levels = hs.map(h => +h.tagName[1]); let jumps = [];
        for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) jumps.push(hs[i - 1].tagName + '>' + hs[i].tagName + ' "' + hs[i].textContent.trim().slice(0, 30) + '"');
        return { tag: h.tagName, text: h.textContent.trim(), style: Object.fromEntries(PROPS.map(k => [k, cs[k]])), box: [Math.round(rc.width), Math.round(rc.height)], focused: document.activeElement === done, firstHeadings: order.slice(0, 5), jumps };
      }, PROPS);
      await new Promise(z => setTimeout(z, 400));
      const el = await p.$('#fitDone'); await el.screenshot({ path: path.join(OUT, `contact_done_${w}_${label}.png`) });
      r[label] = d; await p.close();
    }
    r.styleIdentical = JSON.stringify(r.base.style) === JSON.stringify(r.cand.style) && JSON.stringify(r.base.box) === JSON.stringify(r.cand.box);
    rows.push(r);
    console.log(w, r.base.tag, '->', r.cand.tag, '| style+box identical:', r.styleIdentical, '| focus:', r.cand.focused, '| jumps base:', r.base.jumps.length, 'cand:', r.cand.jumps.length, JSON.stringify(r.cand.jumps));
  }
  fs.writeFileSync(path.join(OUT, 'contact_heading.json'), JSON.stringify(rows, null, 1));
  await b.close();
})();
