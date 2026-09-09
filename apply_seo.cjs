#!/usr/bin/env node
/** Inject SEO / GEO head tags and regenerate llms.txt + llms-full.txt. */
const fs = require("fs");
const path = require("path");
const { ROOT, publicPages, ORIGIN } = require("./shared/site");
const {
  SEO_START,
  SEO_END,
  seoHeadBlock,
  llmsTxtBody,
  llmsFullBody,
} = require("./shared/seo");

const BLOCK_RE = new RegExp(`${SEO_START}[\\s\\S]*?${SEO_END}\\s*`, "g");

function canonicalFrom(html) {
  const m = html.match(/<link rel="canonical" href="([^"]+)"/i);
  return m ? m[1] : null;
}

function isNoindex(html) {
  return /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
}

function injectSeo(html, block) {
  if (html.includes(SEO_START) && html.includes(SEO_END)) {
    return html.replace(BLOCK_RE, block + "\n");
  }
  if (/<link rel="canonical"[^>]*>/i.test(html)) {
    return html.replace(/(<link rel="canonical"[^>]*>)/i, `$1\n${block}`);
  }
  return html.replace("</head>", `${block}\n</head>`);
}

function stripOldSeo(html) {
  html = html.replace(BLOCK_RE, "");
  html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"[^>]*>\s*/gi, "");
  html = html.replace(/<meta\s+name="googlebot"\s+content="[^"]*"[^>]*>\s*/gi, "");
  html = html.replace(/<meta\s+name="bingbot"\s+content="[^"]*"[^>]*>\s*/gi, "");
  html = html.replace(
    /<link rel="alternate" hreflang="[^"]+" href="[^"]+">\s*/gi,
    ""
  );
  html = html.replace(
    /<link rel="alternate" type="application\/rss\+xml"[^>]*>\s*/gi,
    ""
  );
  return html;
}

function applyPage(page) {
  const file = path.join(ROOT, page.file);
  let html = fs.readFileSync(file, "utf8");
  const canonical = canonicalFrom(html) || page.url;
  const index = !isNoindex(html);
  const block = seoHeadBlock({
    canonicalUrl: canonical,
    index,
    pathname: page.path,
  });
  html = stripOldSeo(html);
  html = injectSeo(html, block);
  fs.writeFileSync(file, html);
  return page.path + (index ? "" : " (noindex)");
}

function writeGeoFiles(pages) {
  fs.writeFileSync(path.join(ROOT, "llms.txt"), llmsTxtBody({ pages }));
  fs.writeFileSync(path.join(ROOT, "llms-full.txt"), llmsFullBody({ pages }));
  console.log("Wrote llms.txt and llms-full.txt.");
}

function main() {
  const pages = publicPages();
  const lines = pages.map(applyPage);
  writeGeoFiles(pages);
  console.log(lines.join("\n"));
  console.log("Applied SEO head to " + pages.length + " public pages.");
  console.log("LLMS: " + ORIGIN + "/llms.txt");
  console.log("RSS:  " + ORIGIN + "/feed.xml");
}

main();
