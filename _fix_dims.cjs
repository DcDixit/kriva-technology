/* Adds intrinsic width/height to the last images lacking them, matching the size the
   CSS already renders them at, so layout is unchanged and CLS is eliminated. */

const fs = require('fs');
const dry = process.argv.includes('--dry');

// file -> [containerSelectorHint, px] ; images inside that context render at px
const RULES = [
  ['kriva-service-api-integrations.html', 18], // .conn-row .who img {width:18px}
  ['kriva-solution-accounting.html', 12],      // .src span img {width:12px}
];

let n = 0;
for (const [file, px] of RULES) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(/<img\b([^>]*)>/gi, (tag, attrs) => {
    if (/\bwidth=/.test(attrs) || /\bheight=/.test(attrs)) return tag;
    n++;
    return `<img${attrs} width="${px}" height="${px}">`;
  });
  if (out !== src && !dry) fs.writeFileSync(file, out);
}
console.log(`${dry ? 'would add' : 'added'} width/height to ${n} images`);
