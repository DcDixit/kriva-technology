/* Explain article_checks a11y-sampler failures: for the sampled paragraphs of an article, show the paragraph's HTML start,
   whether its first 5 words appear as one string in the accessibility snapshot, and whether every text node of the
   paragraph is present in the accessibility tree on its own (the real test of exposure to assistive tech).
   Usage: node sampler_check.cjs <origin> <slug,...> */
const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [ORIGIN, SLUGS] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const slug of SLUGS.split(',')) {
    const p = await b.newPage(); await p.setViewport({ width: 390, height: 844 });
    await p.goto(ORIGIN + '/insights/' + slug, { waitUntil: 'load' });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(z => setTimeout(z, 40)); } });
    const snap = JSON.stringify(await p.accessibility.snapshot({ interestingOnly: false }));
    const paras = await p.evaluate(() => {
      const root = document.querySelector('.ix-prose,.prose,article') || document.body;
      const ps = [...root.querySelectorAll('p')].filter(x => x.textContent.trim().split(/\s+/).length >= 8);
      const pick = [ps[0], ps[Math.floor(ps.length / 2)], ps[ps.length - 1]];
      return pick.map((el, i) => {
        const nodes = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) { const t = tw.currentNode.textContent.replace(/\s+/g, ' ').trim(); if (t.length > 2) nodes.push(t); }
        const cs = getComputedStyle(el);
        return { idx: ['first', 'middle', 'last'][i], html: el.innerHTML.trim().slice(0, 110), text: el.textContent.replace(/\s+/g, ' ').trim(), nodes, visible: cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 };
      });
    });
    console.log('##', slug);
    for (const q of paras) {
      const five = q.text.split(' ').slice(0, 5).join(' ');
      const nodeHits = q.nodes.map(n => snap.includes(JSON.stringify(n).slice(1, -1).slice(0, 40)));
      console.log(`  ${q.idx}: first5-in-snapshot=${snap.includes(five)} | text-nodes-in-tree=${nodeHits.filter(Boolean).length}/${nodeHits.length} | visible=${q.visible}`);
      console.log('     html: ' + q.html.replace(/\s+/g, ' '));
    }
    await p.close();
  }
  await b.close();
})();
