#!/usr/bin/env node
/**
 * Fix 02, image payload.
 * Re-encodes every referenced raster over the size budget to WebP, rewrites the
 * HTML references, and reports the saving. Originals stay on disk (unreferenced
 * originals are excluded from the deploy via .vercelignore).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BUDGET = 100 * 1024; // re-encode anything referenced above 100 KB
const files = fs.readdirSync('.').filter((x) => x.endsWith('.html'));

// collect referenced raster assets
const refs = new Map();
for (const f of files) {
 const h = fs.readFileSync(f, 'utf8');
 for (const m of h.matchAll(/["'(](\/(?:media|brand)\/[^"')\s]+\.(?:png|jpe?g))(\?[^"')\s]*)?["')]/gi)) {
 const a = m[1];
 if (!refs.has(a)) refs.set(a, new Set());
 refs.get(a).add(f);
 }
}

(async () => {
 const swaps = new Map();
 let before = 0;
 let after = 0;

 for (const [asset, pages] of [...refs].sort()) {
 const src = asset.replace(/^\//, '');
 if (!fs.existsSync(src)) continue;
 const size = fs.statSync(src).size;
 if (size < BUDGET) continue;

 const outRel = asset.replace(/\.(png|jpe?g)$/i, '.webp');
 const out = outRel.replace(/^\//, '');
 const meta = await sharp(src).metadata();

 // cap absurd intrinsic dimensions; nothing on the site renders wider than 1600 CSS px
 const pipeline = sharp(src);
 if (meta.width > 1600) pipeline.resize({ width: 1600, withoutEnlargement: true });
 await pipeline.webp({ quality: 80, effort: 6 }).toFile(out);

 const newSize = fs.statSync(out).size;
 if (newSize >= size) {
 fs.unlinkSync(out);
 console.log(` skip (no gain) ${asset}`);
 continue;
 }
 before += size;
 after += newSize;
 swaps.set(asset, outRel);
 console.log(
 ` ${String(Math.round(size / 1024)).padStart(5)} KB -> ${String(Math.round(newSize / 1024)).padStart(4)} KB ` +
 `(${meta.width}x${meta.height}) ${asset} [${[...pages].length} page(s)]`
 );
 }

 // rewrite references
 let edited = 0;
 for (const f of files) {
 let h = fs.readFileSync(f, 'utf8');
 const orig = h;
 for (const [from, to] of swaps) h = h.split(from).join(to);
 if (h !== orig) {
 fs.writeFileSync(f, h);
 edited++;
 }
 }

 console.log(
 `\n ${swaps.size} asset(s) converted, ${edited} page(s) rewritten.\n` +
 ` payload: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB ` +
 `(saved ${Math.round((before - after) / 1024)} KB, ${Math.round((1 - after / before) * 100)}%)`
 );
})();
