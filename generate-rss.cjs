#!/usr/bin/env node
/** Generate feed.xml (RSS 2.0) for Insights articles. */
const fs = require("fs");
const path = require("path");
const { ROOT, ORIGIN } = require("./shared/site");
const { posts } = require("./content/insights-data.cjs");

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toRfc822(iso) {
  return new Date(iso + "T12:00:00Z").toUTCString();
}

function main() {
  const sorted = posts
    .slice()
    .sort((a, b) => b.publishedISO.localeCompare(a.publishedISO));

  const items = sorted
    .map((p) => {
      const url = `${ORIGIN}/insights/${p.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${toRfc822(p.publishedISO)}</pubDate>`,
        `      <description>${escapeXml(p.excerpt)}</description>`,
        `      <category>${escapeXml(p.category)}</category>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>KRIVA Technologies · Insights</title>",
    `    <link>${ORIGIN}/insights</link>`,
    "    <description>Guides on trucking software, B2B SaaS, dispatch CRM, and product design from KRIVA Technologies.</description>",
    "    <language>en</language>",
    `    <lastBuildDate>${toRfc822(sorted[0].publishedISO)}</lastBuildDate>`,
    `    <atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(ROOT, "feed.xml"), xml);
  console.log("Wrote feed.xml with " + sorted.length + " items.");
}

main();
