/* /work assets: 800w card variants, Cascadia illustration as WebP, 960w photo variants, OG image. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Resvg } = require('@resvg/resvg-js');

const WEB = 'media/work/web';
const PHOTOS = 'media/photos';

(async () => {
  for (const n of ['eliteone-transportation', 'schwarz-logistics', 'keep-moving', 'extra-mile-movers', 'xmile-auto-transport', 'keep-moving-fitness']) {
    const out = `${WEB}/${n}-800.webp`;
    await sharp(`${WEB}/${n}.webp`).resize(800).webp({ quality: 78 }).toFile(out);
    console.log(out, fs.statSync(out).size);
  }
  const cas = `${WEB}/cascadia-collection-homepage-illustration`;
  await sharp(`${WEB}/cascadia-collection-mock.png`).webp({ quality: 82 }).toFile(`${cas}.webp`);
  await sharp(`${WEB}/cascadia-collection-mock.png`).resize(800).webp({ quality: 80 }).toFile(`${cas}-800.webp`);
  console.log(cas, fs.statSync(`${cas}.webp`).size, fs.statSync(`${cas}-800.webp`).size);

  for (const n of ['studio-review', 'ux-interview']) {
    const out = `${PHOTOS}/${n}-960.webp`;
    await sharp(`${PHOTOS}/${n}.webp`).resize(960).webp({ quality: 78 }).toFile(out);
    console.log(out, fs.statSync(out).size);
  }

  const INK = '#0E1216', AMBER = '#DB9B1F', DIM = '#8C98A4';
  const FONT = 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif';
  const LOGO_ART = fs.readFileSync('brand/logos/kriva-lockup-inverse.svg', 'utf8').match(/<g[\s\S]*<\/svg>/)[0].replace('</svg>', '');
  const lines = ['Case studies in trucking', 'software, SaaS, and web design'];
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <rect width="1200" height="630" fill="${INK}"/>
 <rect x="80" y="52" width="48" height="1" fill="${AMBER}"/>
 <g transform="translate(${80 - 10.5 * 0.45},${70 - 6.3 * 0.45}) scale(0.45)">${LOGO_ART}</g>
 <text x="80" y="212" fill="${AMBER}" font-family="${FONT}" font-size="17" font-weight="600" letter-spacing="3.5">OUR WORK</text>
 ${lines.map((l, i) => `<text x="80" y="${300 + i * 67}" fill="#FFFFFF" font-family="${FONT}" font-size="58" font-weight="700">${l}</text>`).join('\n ')}
 <text x="80" y="470" fill="${DIM}" font-family="${FONT}" font-size="22">8 product case studies · 7 client website projects</text>
 <rect x="80" y="545" width="1040" height="1" fill="#232B33"/>
 <text x="80" y="583" fill="${DIM}" font-family="${FONT}" font-size="17" letter-spacing="2.5">krivatechnologies.com/work</text>
</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true } }).render().asPng();
  fs.writeFileSync(path.join('brand', 'og', 'work.png'), png);
  console.log('brand/og/work.png', png.length);
})();
