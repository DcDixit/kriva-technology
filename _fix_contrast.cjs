/* WCAG AA contrast remediation.
   #7A838D -> #626A73  (3.19:1 -> 4.54:1 on --paper; 4.84 on --paper-2; 5.49 on white)
   #6B7885 -> #717F8C  (4.16:1 -> 4.58:1 on --ink)
   Hue and saturation are preserved; only lightness moves, so the visual system is unchanged.
   Run with --dry to inspect context without writing. */

const fs = require('fs');

const MAP = { '7A838D': '626A73', '6B7885': '717F8C' };
const dry = process.argv.includes('--dry');

const targets = [
  ...fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f)),
  'shared/home.css', 'shared/chrome.css', 'shared/saas.css',
  'shared/trucking.css', 'shared/slot-assets.css',
];

let totalHits = 0;
let bgHits = 0;
const perProp = {};
const changedFiles = [];

for (const file of targets) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;

  for (const [from, to] of Object.entries(MAP)) {
    const re = new RegExp('([\\s\\S]{0,40})#' + from, 'gi');
    let m;
    while ((m = re.exec(src))) {
      totalHits++;
      const before = m[1];
      // classify the declaration this hex belongs to
      const decl = before.match(/([a-z-]+)\s*:\s*[^;{}]*$/i);
      const prop = decl ? decl[1].toLowerCase() : (/var\(--[a-z0-9-]+,\s*$/i.test(before) ? 'var-fallback' : 'unknown');
      perProp[prop] = (perProp[prop] || 0) + 1;
      if (/background/.test(prop)) {
        bgHits++;
        console.log(`  BACKGROUND USE in ${file}: ...${before.slice(-46)}#${from}`);
      }
    }
    out = out.replace(new RegExp('#' + from, 'gi'), '#' + to);
  }

  if (out !== src) {
    if (!dry) fs.writeFileSync(file, out);
    changedFiles.push(file);
  }
}

console.log('\nOccurrences by CSS property:', perProp);
console.log('background-colour uses (would need different treatment):', bgHits);
console.log(`${dry ? 'WOULD CHANGE' : 'CHANGED'}: ${changedFiles.length} files, ${totalHits} colour occurrences`);
