#!/usr/bin/env node
/** Apply meta descriptions from content/seo-meta.cjs to HTML (description + og:description). */
const fs = require("fs");
const path = require("path");
const META = require("../content/seo-meta.cjs");

const ROOT = path.join(__dirname, "..");
let updated = 0;
let skipped = 0;

for (const [file, description] of Object.entries(META)) {
  if (description.length > 160) {
    console.error(`SKIP ${file}: ${description.length} chars (>160)`);
    skipped++;
    continue;
  }
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) {
    console.error(`MISSING ${file}`);
    skipped++;
    continue;
  }
  let html = fs.readFileSync(fp, "utf8");
  const esc = description.replace(/&/g, "&amp;");
  const descRe = /(<meta\s+name="description"\s+content=")[^"]*(")/i;
  const ogRe = /(<meta\s+property="og:description"\s+content=")[^"]*(")/i;
  if (!descRe.test(html)) {
    console.error(`NO meta description in ${file}`);
    skipped++;
    continue;
  }
  html = html.replace(descRe, `$1${esc}$2`);
  if (ogRe.test(html)) html = html.replace(ogRe, `$1${esc}$2`);
  fs.writeFileSync(fp, html);
  updated++;
  console.log(`${file} (${description.length} chars)`);
}

console.log(`\nUpdated ${updated} files, skipped ${skipped}`);
