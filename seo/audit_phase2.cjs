#!/usr/bin/env node
/** Phase 2 technical SEO audit — read-only report. */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const files = fs
  .readdirSync(ROOT)
  .filter((n) => n.endsWith(".html") && (n.startsWith("kriva-") || n === "404.html"))
  .sort();

const report = {
  pages: files.length,
  missingBreadcrumb: [],
  longMeta: [],
  shortMeta: [],
  missingMeta: [],
  imagesMissingAlt: [],
  missingSchemaBlock: [],
  truckingPages: [],
};

for (const file of files) {
  const t = fs.readFileSync(path.join(ROOT, file), "utf8");
  const isHome = file === "kriva-redesign.html";
  if (!isHome && !t.includes("BreadcrumbList")) report.missingBreadcrumb.push(file);
  if (!t.includes("KRIVA_SCHEMA_START")) report.missingSchemaBlock.push(file);
  const m = t.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!m) report.missingMeta.push(file);
  else {
    const len = m[1].length;
    if (len > 160) report.longMeta.push({ file, len, text: m[1] });
    if (len < 100 && file !== "404.html") report.shortMeta.push({ file, len });
  }
  const imgs = [...t.matchAll(/<img\b[^>]*>/gi)];
  for (const img of imgs) {
    const tag = img[0];
    if (tag.includes('alt=""') || !/\balt=/.test(tag)) {
      if (
        !tag.includes('aria-hidden="true"') &&
        !tag.includes("mark-logo") &&
        !tag.includes('class="fmark"') &&
        !tag.includes("kriva-lockup-inverse")
      ) {
        report.imagesMissingAlt.push(file);
        break;
      }
    }
  }
  if (/trucking|dispatch|fleet|logistics/i.test(t) && file.includes("trucking")) {
    report.truckingPages.push(file);
  }
}

console.log(JSON.stringify(report, null, 2));
