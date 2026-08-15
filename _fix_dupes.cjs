/* Removes duplicate <link rel=stylesheet> and <script src> tags for the same asset.
   34 pages were loading /shared/chrome.css two or three times. */

const fs = require('fs');
const dry = process.argv.includes('--dry');

const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));
let removedLinks = 0;
let removedScripts = 0;
const touched = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;

  // stylesheets
  const seenCss = new Set();
  out = out.replace(/[ \t]*<link[^>]*rel="stylesheet"[^>]*>\n?/gi, (tag) => {
    const href = (tag.match(/href="([^"]+)"/) || [])[1];
    if (!href || !href.startsWith('/shared/')) return tag;
    if (seenCss.has(href)) { removedLinks++; return ''; }
    seenCss.add(href);
    return tag;
  });

  // scripts
  const seenJs = new Set();
  out = out.replace(/[ \t]*<script[^>]*\bsrc="([^"]+)"[^>]*><\/script>\n?/gi, (tag, src2) => {
    if (!src2.startsWith('/shared/')) return tag;
    if (seenJs.has(src2)) { removedScripts++; return ''; }
    seenJs.add(src2);
    return tag;
  });

  if (out !== src) {
    if (!dry) fs.writeFileSync(file, out);
    touched.push(file);
  }
}

console.log(`${dry ? 'would remove' : 'removed'} ${removedLinks} duplicate stylesheet links, ${removedScripts} duplicate script tags across ${touched.length} pages`);
