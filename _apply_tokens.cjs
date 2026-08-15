/* Inject /shared/tokens.css as the first stylesheet and remove duplicate :root blocks.
   Idempotent. Page-specific CSS is left in place. */

const fs = require('fs');

const LINK = '<link rel="stylesheet" href="/shared/tokens.css">';
const ROOT_RE = /:root\s*\{[\s\S]*?\}\s*/;

const htmlFiles = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));
const cssFiles = ['shared/home.css', 'shared/saas.css', 'shared/trucking.css'];

let injected = 0;
let strippedHtml = 0;
let strippedCss = 0;

for (const file of htmlFiles) {
  let src = fs.readFileSync(file, 'utf8');
  let out = src;

  if (!out.includes('href="/shared/tokens.css"')) {
    if (out.includes('<!-- KRIVA_ICONS_END -->')) {
      out = out.replace('<!-- KRIVA_ICONS_END -->', `<!-- KRIVA_ICONS_END -->\n${LINK}`);
    } else {
      const vp = out.match(/<meta name="viewport"[^>]*>/);
      if (!vp) {
        console.warn('SKIP (no insert point):', file);
        continue;
      }
      out = out.replace(vp[0], `${vp[0]}\n${LINK}`);
    }
    injected++;
  }

  if (ROOT_RE.test(out)) {
    out = out.replace(ROOT_RE, '');
    strippedHtml++;
  }

  if (out !== src) fs.writeFileSync(file, out);
}

for (const file of cssFiles) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  if (!ROOT_RE.test(src)) continue;
  fs.writeFileSync(file, src.replace(ROOT_RE, ''));
  strippedCss++;
}

console.log(`tokens.css linked on ${injected} new pages`);
console.log(`:root stripped from ${strippedHtml} HTML files, ${strippedCss} CSS files`);
console.log(`pages already linked: ${htmlFiles.filter((f) => fs.readFileSync(f, 'utf8').includes('href="/shared/tokens.css"')).length}/${htmlFiles.length}`);
