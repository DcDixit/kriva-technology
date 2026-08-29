#!/usr/bin/env node
/** Final HTML polish: remove stale placeholders, clean markup */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

for (const file of fs.readdirSync(ROOT).filter((f) => /^kriva-.*\.html$/.test(f))) {
  let html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const before = html;

  // Remove crop-ph blocks when img already present in same data-asset
  html = html.replace(
    /(<img src="[^"]+"[^>]*>)\s*<div class="crop-ph">[\s\S]*?<\/div>/g,
    "$1"
  );

  // Remove stale production / drop comments
  html = html.replace(/<!--\s*(?:PRODUCTION|Drop a real)[\s\S]*?-->\s*/gi, "");

  // Update outdated captions
  html = html.replace(/Project story frame · screenshot drops into this host when supplied/g, "FleetFlow dispatch console · interface reference");
  html = html.replace(/Interface crop · replaces when supplied/g, "");

  // Strip empty crop-slot spans
  html = html.replace(/<span class="crop-slot">\s*<\/span>/g, "");

  if (html !== before) {
    fs.writeFileSync(path.join(ROOT, file), html);
    console.log("Cleaned", file);
  }
}
console.log("HTML polish done.");
