/* The ghosted "01/02/03" ordinals sit beside a real heading that carries the meaning,
   so they are decoration. Marking them aria-hidden keeps them out of the accessibility
   tree and out of the contrast requirement, without altering the editorial look. */

const fs = require('fs');
const dry = process.argv.includes('--dry');

const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));
let n = 0, pages = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(/<span class="(idx(?: num)?)"(?![^>]*aria-hidden)>/g, (m, cls) => {
    n++;
    return `<span class="${cls}" aria-hidden="true">`;
  });
  if (out !== src) {
    if (!dry) fs.writeFileSync(file, out);
    pages++;
  }
}
console.log(`${dry ? 'would mark' : 'marked'} ${n} decorative ordinals across ${pages} pages`);
