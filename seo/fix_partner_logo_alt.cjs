#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
let n = 0;
for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, "utf8");
  const out = html
    .replace(/quickbooks\.svg" alt=""/g, 'quickbooks.svg" alt="QuickBooks"')
    .replace(/xero\.svg" alt=""/g, 'xero.svg" alt="Xero"');
  if (out !== html) {
    fs.writeFileSync(fp, out);
    n++;
    console.log(file);
  }
}
console.log(`Updated ${n} files`);
