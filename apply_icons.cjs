/* Injects the canonical favicon / manifest / theme-color block into every page.
   Idempotent: replaces the marked block if already present. */
const fs = require('fs');
const path = require('path');

const START = '<!-- KRIVA_ICONS_START -->';
const END = '<!-- KRIVA_ICONS_END -->';

const BLOCK = [
  START,
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="manifest" href="/site.webmanifest">',
  '<meta name="theme-color" content="#0E1216">',
  END,
].join('\n');

const files = fs.readdirSync(process.cwd()).filter((f) => /^kriva-.*\.html$/.test(f));
let injected = 0;
let replaced = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let out;

  if (src.includes(START)) {
    out = src.replace(new RegExp(`${START}[\\s\\S]*?${END}`), BLOCK);
    if (out !== src) replaced++;
  } else {
    const viewport = src.match(/<meta name="viewport"[^>]*>/);
    if (!viewport) {
      console.warn(`SKIP (no viewport meta): ${file}`);
      continue;
    }
    out = src.replace(viewport[0], `${viewport[0]}\n${BLOCK}`);
    injected++;
  }

  if (out !== src) fs.writeFileSync(file, out);
}

console.log(`${files.length} pages scanned · ${injected} injected · ${replaced} refreshed`);
