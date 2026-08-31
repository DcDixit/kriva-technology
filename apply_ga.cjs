/* Injects the GA4 loader into every page. Idempotent. */
const fs = require('fs');
const path = require('path');

const START = '<!-- KRIVA_GA_START -->';
const END = '<!-- KRIVA_GA_END -->';
const BLOCK = [
  START,
  '<link rel="preconnect" href="https://www.googletagmanager.com">',
  '<link rel="dns-prefetch" href="https://www.google-analytics.com">',
  '<script src="/shared/analytics.js" defer></script>',
  END,
].join('\n');

const CHROME = '<script src="/shared/chrome.js" defer></script>';
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
  } else if (src.includes(CHROME)) {
    out = src.replace(CHROME, `${CHROME}\n${BLOCK}`);
    injected++;
  } else {
    console.warn(`SKIP (no chrome.js): ${file}`);
    skipped++;
    continue;
  }

  if (out !== src) fs.writeFileSync(file, out);
}

console.log(`${files.length} pages scanned · ${injected} injected · ${replaced} refreshed · ${skipped} skipped`);
