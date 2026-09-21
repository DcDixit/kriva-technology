/* Injects the tawk.to loader into every page. Idempotent. */
const fs = require('fs');

const START = '<!-- KRIVA_TAWK_START -->';
const END = '<!-- KRIVA_TAWK_END -->';
const CLARITY_END = '<!-- KRIVA_CLARITY_END -->';
const BLOCK = [
  START,
  '<link rel="preconnect" href="https://embed.tawk.to">',
  '<link rel="dns-prefetch" href="https://embed.tawk.to">',
  '<script src="/shared/tawk.js" defer></script>',
  END,
].join('\n');

const files = fs
  .readdirSync(process.cwd())
  .filter((f) => f === '404.html' || /^kriva-.*\.html$/.test(f));

let injected = 0;
let replaced = 0;
let skipped = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;

  if (src.includes(START)) {
    out = src.replace(new RegExp(`${START}[\\s\\S]*?${END}`), BLOCK);
    if (out !== src) replaced++;
  } else if (src.includes(CLARITY_END)) {
    out = src.replace(CLARITY_END, `${CLARITY_END}\n${BLOCK}`);
    injected++;
  } else {
    console.warn(`SKIP (no Clarity block): ${file}`);
    skipped++;
    continue;
  }

  if (out !== src) fs.writeFileSync(file, out);
}

console.log(
  `${files.length} pages scanned · ${injected} injected · ${replaced} refreshed · ${skipped} skipped`
);
