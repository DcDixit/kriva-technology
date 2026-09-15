#!/usr/bin/env node
/**
 * Fix 07 — the eight case-study pages declared "@type": "CaseStudy", which is
 * not in the schema.org vocabulary. An unknown type makes the whole node
 * unparseable, so those pages were publishing no usable entity data at all.
 * CreativeWork is the correct supertype and, unlike Article, does not require a
 * publish date the pages do not actually have.
 */
const fs = require('fs');

let n = 0;
for (const f of fs.readdirSync('.').filter((x) => x.endsWith('.html'))) {
  const src = fs.readFileSync(f, 'utf8');
  if (!/"@type":\s*"CaseStudy"/.test(src)) continue;
  const out = src.replace(/"@type":\s*"CaseStudy"/g, '"@type": "CreativeWork",\n      "genre": "Case study"');
  fs.writeFileSync(f, out);
  n++;
  console.log('  ' + f);
}
console.log(`\n  ${n} case-study page(s) retyped.`);
