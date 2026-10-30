const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844 });
  await p.goto('http://localhost:5199/markets/au', { waitUntil: 'networkidle2', timeout: 45000 });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } scrollTo(0, 0); });
  const rows = await p.evaluate(() => [...document.querySelectorAll('a.btn')].map((e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    const parent = e.parentElement;
    return {
      text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      w: Math.round(r.width), h: Math.round(r.height),
      display: cs.display, minH: cs.minHeight, height: cs.height, pad: cs.padding,
      vis: cs.visibility, pos: cs.position, transform: cs.transform.slice(0, 80),
      parent: parent.className || parent.id,
      parentTransform: getComputedStyle(parent).transform.slice(0, 60),
      hiddenAnc: !!e.closest('[hidden], .sheet'),
      sheet: !!e.closest('.sheet')
    };
  }));
  console.log(JSON.stringify(rows, null, 2));
  await b.close();
})();
