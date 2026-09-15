#!/usr/bin/env node
/**
 * Fix 04 — keep unreferenced binaries out of the deploy.
 * Recomputes which media/brand assets and shared scripts no assets or pages
 * reference, then rewrites the managed block in .vercelignore.
 */
const fs = require('fs');
const path = require('path');

const MARK_START = '# >>> auto: unreferenced assets (regenerate with _seo_fix_04_deadweight.cjs)';
const MARK_END = '# <<< auto';

const text = [];
for (const f of fs.readdirSync('.').filter((x) => /\.html$/.test(x))) text.push(fs.readFileSync(f, 'utf8'));
for (const d of ['shared', 'brand', 'media']) {
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(css|js|svg|json|webmanifest)$/i.test(e.name)) text.push(fs.readFileSync(p, 'utf8'));
    }
  };
  if (fs.existsSync(d)) walk(d);
}
const haystack = text.join('\n');

const all = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walk(p);
    else all.push(p);
  }
};
['media', 'brand', 'shared'].forEach((d) => fs.existsSync(d) && walk(d));

const dead = [];
let bytes = 0;
for (const p of all) {
  if (/\.(md|gitkeep)$/i.test(p)) continue;
  const base = path.basename(p);
  // referenced by full path or by bare filename (covers CSS url() and JS string building)
  if (haystack.includes('/' + p) || haystack.includes(base)) continue;
  const sz = fs.statSync(p).size;
  dead.push(p);
  bytes += sz;
  console.log('  ' + String(Math.round(sz / 1024)).padStart(5) + ' KB  ' + p);
}
console.log('\n  ' + dead.length + ' unreferenced file(s), ' + Math.round(bytes / 1024) + ' KB');

let ig = fs.readFileSync('.vercelignore', 'utf8');
const block = [MARK_START, ...dead.sort(), MARK_END].join('\n');
if (ig.includes(MARK_START)) {
  ig = ig.replace(new RegExp(MARK_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + MARK_END), block);
} else {
  ig = ig.trimEnd() + '\n\n' + block + '\n';
}
fs.writeFileSync('.vercelignore', ig);
console.log('  .vercelignore updated.');
