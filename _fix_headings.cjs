/* Heading hierarchy remediation. Keeps every visual style identical by moving the
   CSS selector along with the element.
     .fit-rail article  h3 -> h2   (block sits above the first H2, so H3 skipped a level)
     .ba-cols / .spec-col / .extype  h4 -> h3   (these sit directly under an H2)
   Run with --dry to preview. */

const fs = require('fs');
const dry = process.argv.includes('--dry');

const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));
let changed = 0;
const log = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;
  const notes = [];

  // ── 1. fit-rail: h3 -> h2, scoped to the .fit-rail container ──
  out = out.replace(/(<div class="fit-rail"[^>]*>)([\s\S]*?)(\n\s*<\/div>\s*\n)/, (all, open, body, close) => {
    const n = (body.match(/<h3>/g) || []).length;
    if (!n) return all;
    notes.push(`fit-rail h3->h2 x${n}`);
    return open + body.replace(/<h3>/g, '<h2>').replace(/<\/h3>/g, '</h2>') + close;
  });
  // keep the styling: selector follows the element
  out = out.replace(/\.fit-rail h3\{/g, '.fit-rail h2{');

  // ── 2. h4 -> h3 inside ba-cols / spec-col / extype ──
  const h4count = (out.match(/<h4>/g) || []).length;
  if (h4count) {
    out = out.replace(/<h4>/g, '<h3>').replace(/<\/h4>/g, '</h3>');
    out = out.replace(/\.ba-cols h4\{/g, '.ba-cols h3{')
      .replace(/\.spec-col h4\{/g, '.spec-col h3{')
      .replace(/\.extype h4\{/g, '.extype h3{');
    notes.push(`h4->h3 x${h4count}`);
  }

  if (out !== src) {
    if (!dry) fs.writeFileSync(file, out);
    changed++;
    log.push(`${file}: ${notes.join(', ')}`);
  }
}

log.forEach((l) => console.log('  ' + l));
console.log(`${dry ? 'would change' : 'changed'} ${changed} pages`);
