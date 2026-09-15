#!/usr/bin/env node
/**
 * Fix 01 — root-relative asset paths.
 * `href="shared/slot-assets.css"` resolves to /services/shared/... on nested clean
 * URLs and 404s, so the slot-placeholder rules never load. Make every asset
 * reference root-relative.
 */
const fs = require('fs');

let touched = 0;
for (const f of fs.readdirSync('.').filter((x) => x.endsWith('.html'))) {
  const src = fs.readFileSync(f, 'utf8');
  const out = src.replace(
    /((?:href|src)=)(["'])(?!\/|https?:|data:|mailto:|tel:|#)(shared|brand|media)\//gi,
    '$1$2/$3/'
  );
  if (out !== src) {
    fs.writeFileSync(f, out);
    const n = (src.match(/(?:href|src)=["'](?!\/|https?:|data:|mailto:|tel:|#)(?:shared|brand|media)\//gi) || []).length;
    console.log(`  fixed ${String(n).padStart(2)} path(s)  ${f}`);
    touched++;
  }
}
console.log(`\n${touched} file(s) updated.`);
