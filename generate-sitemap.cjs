#!/usr/bin/env node
/** Generate sitemap.xml from Vercel rewrite routes (native router for this static site). */
const fs = require("fs");
const path = require("path");
const {
  ROOT,
  publicPages,
  lastmodFor,
  priorityFor,
  changefreqFor,
} = require("./shared/site");

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function main() {
  const pages = publicPages();
  const urls = pages.map((p) => {
    const lastmod = lastmodFor(p.file);
    return [
      "  <url>",
      `    <loc>${escapeXml(p.url)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreqFor(p.path)}</changefreq>`,
      `    <priority>${priorityFor(p.path)}</priority>`,
      "  </url>",
    ].join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "",
    urls.join("\n\n"),
    "",
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
  console.log("Wrote sitemap.xml with " + pages.length + " public URLs.");

  const missingCanonical = [];
  const noindexPublic = [];
  for (const p of pages) {
    const html = fs.readFileSync(path.join(ROOT, p.file), "utf8");
    const canon = html.match(/<link rel="canonical" href="([^"]+)"/i);
    if (!canon || canon[1] !== p.url) missingCanonical.push(p.path + " => " + (canon ? canon[1] : "(none)"));
    if (/noindex/i.test(html) && /name="robots"/i.test(html)) noindexPublic.push(p.path);
  }
  if (missingCanonical.length) {
    console.log("Canonical mismatches:\n" + missingCanonical.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Canonical: every public page is self-referential.");
  }
  if (noindexPublic.length) {
    console.log("noindex on public pages:\n" + noindexPublic.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("noindex: none on public pages (404.html remains noindex).");
  }
}

main();
