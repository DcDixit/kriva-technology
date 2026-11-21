/* For every cream full-width band on every sitemap route: decide target (white / neutral) from its
   neighbours and report which CSS rule paints it. Usage: node _audit_bg_rules.cjs out.json */
const fs = require('fs');
const puppeteer = require('puppeteer');
const BASE = `http://localhost:${process.env.PORT || 5177}`;
const routes = [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const all = [];
  for (const r of routes) {
    const p = await b.newPage();
    await p.setViewport({ width: Number(process.env.W || 1440), height: 900 });
    await p.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
    const bands = await p.evaluate(() => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v[3] === undefined ? 1 : v[3] }; };
      const cls = (c) => { if (!c || c.a < 0.05) return 't'; const { r, g, b } = c; const L = (r + g + b) / 3; if (L < 140) return 'dark'; if (r === 255 && g === 255 && b === 255) return 'white'; if (L > 225 && r - b >= 4 && r >= g) return 'cream'; if (L > 225) return 'light'; return 'color'; };
      const eff = (e) => { for (let n = e; n; n = n.parentElement) { const cs = getComputedStyle(n); const c = parse(cs.backgroundColor); if (cs.backgroundImage !== 'none' && /gradient/.test(cs.backgroundImage) && (!c || c.a < .05)) return 'color'; if (c && c.a >= .05) return cls(c); } return 'white'; };
      const desc = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).filter((c) => !/^is-/.test(c)).slice(0, 3).join('.') : '');
      const W = innerWidth;
      const els = [...document.querySelectorAll('main *, body > *, footer')].filter((e) => { const rc = e.getBoundingClientRect(); const cs = getComputedStyle(e); const st = /^(SECTION|HEADER|FOOTER|ASIDE|ARTICLE|NAV)$/.test(e.tagName) || /^(MAIN|BODY|ARTICLE)$/.test(e.parentElement && e.parentElement.tagName); return st && rc.width >= W * .95 && rc.height >= 40 && cs.display !== 'none' && cs.position !== 'fixed'; });
      // leaf bands: full-width elements with no full-width descendants that have their own bg
      const own = (e) => { const c = parse(getComputedStyle(e).backgroundColor); return c && c.a >= .05; };
      const leaf = els.filter((e) => !els.some((o) => o !== e && e.contains(o) && (own(o) || o.tagName === 'SECTION')));
      leaf.sort((a, c) => a.getBoundingClientRect().top - c.getBoundingClientRect().top);
      return leaf.map((e, i) => { e.setAttribute('data-bgx', i); const rc = e.getBoundingClientRect(); return { i, el: desc(e), top: Math.round(rc.top + scrollY), h: Math.round(rc.height), c: eff(e), own: own(e), bg: getComputedStyle(e).backgroundColor }; });
    });
    // decide
    const fin = bands.map((x) => x.c);
    for (let i = 0; i < bands.length; i++) {
      if (bands[i].c !== 'cream') continue;
      const prev = i > 0 ? fin[i - 1] : 'dark';
      const next = i < bands.length - 1 ? bands[i + 1].c : 'dark';
      const lightish = (c) => c === 'white' || c === 'cream' || c === 'light';
      fin[i] = prev === 'white' && lightish(next) ? 'neutral' : 'white';
      if (prev === 'light' || prev === 'neutral') fin[i] = 'white';
      bands[i].target = fin[i];
    }
    const cdp = await p.target().createCDPSession();
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
    for (const x of bands.filter((x) => x.target)) {
      // find the element actually painting the cream (self or ancestor)
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-bgx="${x.i}"]` });
      let nid = nodeId, rules = [], hops = 0;
      while (nid && hops < 12) {
        const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId: nid });
        const found = [];
        if (m.inlineStyle) for (const pr of m.inlineStyle.cssProperties) if (/^background(-color)?$/.test(pr.name) && pr.value) found.push({ sel: '[style]', prop: pr.name, val: pr.value, src: 'inline' });
        for (const mr of m.matchedCSSRules || []) for (const pr of mr.rule.style.cssProperties) if (/^background(-color)?$/.test(pr.name) && pr.value && !pr.disabled) {
          const sh = mr.rule.styleSheetId; let src = mr.rule.origin;
          if (sh) { const h = await cdp.send('CSS.getStyleSheetText', { styleSheetId: sh }).catch(() => null); src = (await p.evaluate(() => 0), sh); }
          found.push({ sel: mr.rule.selectorList.text.slice(0, 160), prop: pr.name, val: pr.value, sheet: sh, line: mr.rule.style.range ? mr.rule.style.range.startLine + 1 : null, important: !!pr.important });
        }
        if (found.some((f) => !/transparent|none|initial|inherit|unset/.test(f.val))) { rules = found; break; }
        const d = await cdp.send('DOM.describeNode', { nodeId: nid, depth: 0 }); const par = d.node.parentId; if (!par) break; nid = par; hops++; x.painter = 'ancestor+' + hops;
      }
      x.rules = rules;
    }
    // map stylesheet ids to urls
    const sheets = {};
    cdp.on('CSS.styleSheetAdded', () => {});
    const heads = await cdp.send('CSS.getMediaQueries').catch(() => null);
    const ids = new Set(bands.flatMap((x) => (x.rules || []).map((r) => r.sheet)).filter(Boolean));
    for (const id of ids) { const t = await cdp.send('CSS.getStyleSheetText', { styleSheetId: id }); sheets[id] = t.text.slice(0, 80).replace(/\s+/g, ' '); }
    for (const x of bands) for (const rr of x.rules || []) rr.sheetHead = sheets[rr.sheet];
    all.push({ route: r, bands });
    console.log(`\n== ${r}`);
    for (const x of bands) console.log(`  ${x.c.padEnd(6)} ${(x.target || '').padEnd(8)} ${x.el.slice(0, 55)}` + (x.target ? '\n' + (x.rules || []).map((q) => `       ${q.important ? '!' : ' '}${q.sel} {${q.prop}:${q.val}} L${q.line} [${(q.sheetHead || q.src || '').slice(0, 50)}]`).join('\n') : ''));
    await p.close();
  }
  fs.writeFileSync(process.argv[2] || 'bg_rules.json', JSON.stringify(all, null, 1));
  await b.close();
})();
