#!/usr/bin/env node
/** Confirm unique OG files exist and are 1200×630; add article:modified_time
 * only where a real published date already exists. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ORIGIN = 'https://krivatechnologies.com';
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const fileToUrl = new Map();
for (const r of vercel.rewrites)
  if (r.destination.endsWith('.html')) fileToUrl.set(r.destination.replace(/^\//, ''), r.source);

(async () => {
  let ogOk = 0;
  let ogBad = 0;
  for (const [file, url] of fileToUrl) {
    if (!/^(kriva-insight-|kriva-case-|kriva-market-)/.test(file)) continue;
    const slug = url.replace(/^\//, '').replace(/\//g, '-');
    const png = path.join('brand', 'og', slug + '.png');
    if (!fs.existsSync(png)) {
      console.log('  MISSING OG  ' + png);
      ogBad++;
      continue;
    }
    const meta = await sharp(png).metadata();
    const ok = meta.width === 1200 && meta.height === 630;
    if (!ok) {
      console.log(`  BAD SIZE ${meta.width}x${meta.height}  ${png}`);
      ogBad++;
    } else ogOk++;

    let h = fs.readFileSync(file, 'utf8');
    const abs = ORIGIN + '/brand/og/' + slug + '.png';
    const og = (h.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
    const tw = (h.match(/<meta name="twitter:image" content="([^"]+)"/) || [])[1];
    if (og !== abs) console.log(`  OG META MISMATCH ${file}: ${og}`);
    if (tw !== abs) console.log(`  TW META MISMATCH ${file}: ${tw}`);
  }
  console.log(`OG files: ${ogOk} ok, ${ogBad} bad`);

  // article:modified_time mirrors published_time only when that date is already real
  let dated = 0;
  for (const f of fs.readdirSync('.').filter((x) => /^kriva-insight-/.test(x))) {
    let h = fs.readFileSync(f, 'utf8');
    const pub = (h.match(/<meta property="article:published_time" content="([^"]+)"/) || [])[1];
    if (!pub) continue;
    if (!/article:modified_time/.test(h)) {
      h = h.replace(
        `<meta property="article:published_time" content="${pub}">`,
        `<meta property="article:published_time" content="${pub}">\n<meta property="article:modified_time" content="${pub}">`
      );
      fs.writeFileSync(f, h);
      dated++;
      console.log(`  modified_time=${pub}  ${f}`);
    }
  }
  console.log(`Insights with real dates: modified_time synced on ${dated} file(s).`);

  console.log('\nCase studies: no signed-off publish dates in content/cases-data.cjs — dates not invented.');
})();
