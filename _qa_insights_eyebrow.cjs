// Proves the .eyebrow class on Insights kickers (schema speakable selector) changes nothing visible:
// every element in <main> keeps its box, and kicker + ::before styles are identical with and without it.
// Usage: node _qa_insights_eyebrow.cjs
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  for (const w of [1440, 390]) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 600 });
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await p.goto('http://localhost:5177/insights', { waitUntil: 'networkidle2' });
    const r = await p.evaluate(() => {
      const els = [...document.querySelectorAll('main *')], ks = [...document.querySelectorAll('.ix-kicker')];
      const props = ['color', 'font-size', 'font-weight', 'letter-spacing', 'font-family', 'margin', 'display'];
      const snap = () => ({
        boxes: els.map((e) => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.left, r.width, r.height].map(Math.round).join(); }),
        styles: ks.map((k) => { const a = getComputedStyle(k), bf = getComputedStyle(k, '::before'); return props.map((x) => a.getPropertyValue(x)).join('|') + '#' + ['display', 'width', 'height', 'background-color'].map((x) => bf.getPropertyValue(x)).join('|'); })
      });
      const withE = snap(); ks.forEach((k) => k.classList.remove('eyebrow')); const without = snap(); ks.forEach((k) => k.classList.add('eyebrow'));
      return { kickers: ks.length, eyebrowCount: document.querySelectorAll('main .eyebrow').length, boxDiffs: withE.boxes.filter((v, i) => v !== without.boxes[i]).length, styleDiffs: withE.styles.filter((v, i) => v !== without.styles[i]).length, height: document.documentElement.scrollHeight };
    });
    console.log(w + 'px', JSON.stringify(r));
    await p.close();
  }
  await b.close();
})();
