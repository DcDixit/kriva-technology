/* Explicit loading strategy for every <img>.
     header/nav      -> eager   (above the fold on every page)
     first in <main> -> eager   (the LCP candidate; never lazy this)
     rest of <main>  -> lazy
     footer          -> lazy
   Also adds decoding="async" to deferred images. Existing attributes are left alone. */

const fs = require('fs');
const dry = process.argv.includes('--dry');

const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));
const tally = { eagerNav: 0, eagerHero: 0, lazyMain: 0, lazyFooter: 0, skipped: 0 };

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const mainStart = src.indexOf('<main');
  const footStart = src.indexOf('<footer');
  let seenMainImg = false;
  let delta = 0;
  let out = src;

  const matches = [...src.matchAll(/<img\b[^>]*>/gi)];
  for (const m of matches) {
    const tag = m[0];
    const at = m.index;
    const zone = at < mainStart ? 'nav' : (footStart > -1 && at > footStart ? 'footer' : 'main');
    const isFirstMain = zone === 'main' && !seenMainImg;
    if (zone === 'main') seenMainImg = true;

    if (/loading=/.test(tag)) { tally.skipped++; continue; }

    let mode;
    if (zone === 'nav') { mode = 'eager'; tally.eagerNav++; }
    else if (isFirstMain) { mode = 'eager'; tally.eagerHero++; }
    else if (zone === 'footer') { mode = 'lazy'; tally.lazyFooter++; }
    else { mode = 'lazy'; tally.lazyMain++; }

    let add = ` loading="${mode}"`;
    if (mode === 'lazy' && !/decoding=/.test(tag)) add += ' decoding="async"';

    const newTag = tag.replace(/\s*\/?>$/, (end) => add + end);
    const pos = at + delta;
    out = out.slice(0, pos) + newTag + out.slice(pos + tag.length);
    delta += newTag.length - tag.length;
  }

  if (out !== src && !dry) fs.writeFileSync(file, out);
}

console.log(tally);
console.log(`${dry ? 'would set' : 'set'} loading on ${tally.eagerNav + tally.eagerHero + tally.lazyMain + tally.lazyFooter} images (${tally.skipped} already had it)`);
