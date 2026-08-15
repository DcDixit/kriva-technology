/* Two small remediations:
   1. .p-link measured 22-23px tall. Adding 4px top padding and removing 4px of top
      margin clears the 24px minimum target with no change to where the link sits.
   2. .proj-no is a ghosted ordinal beside a project title that already names the item,
      so it is decoration and belongs out of the accessibility tree. */

const fs = require('fs');
const dry = process.argv.includes('--dry');

const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));
let pad = 0, hid = 0, pages = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;

  out = out.replace(
    /\.p-link\{display:inline-flex;align-items:center;gap:9px;margin-top:18px;padding-bottom:4px;/g,
    () => { pad++; return '.p-link{display:inline-flex;align-items:center;gap:9px;margin-top:14px;padding-top:4px;padding-bottom:4px;'; },
  );

  out = out.replace(/<span class="(proj-no(?: num)?)"(?![^>]*aria-hidden)>/g, (m, cls) => {
    hid++;
    return `<span class="${cls}" aria-hidden="true">`;
  });

  if (out !== src) {
    if (!dry) fs.writeFileSync(file, out);
    pages++;
  }
}
console.log(`${dry ? 'would fix' : 'fixed'}: ${pad} .p-link rules, ${hid} decorative project numbers, across ${pages} pages`);
