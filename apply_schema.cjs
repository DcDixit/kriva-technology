#!/usr/bin/env node
/** Inject JSON-LD from shared/schema.js into every public HTML page. */
const fs = require("fs");
const path = require("path");
const { ROOT, publicPages } = require("./shared/site");
const { graphForPage, jsonLdScript, pageKind } = require("./shared/schema");

const START = "<!-- KRIVA_SCHEMA_START -->";
const END = "<!-- KRIVA_SCHEMA_END -->";
const LD_RE = /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi;
const BLOCK_RE = /<!-- KRIVA_SCHEMA_START -->[\s\S]*?<!-- KRIVA_SCHEMA_END -->\s*/g;

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractH1(html) {
  const m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripTags(m[1]) : "";
}

function extractDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? decodeEntities(m[1]) : "";
}

function extractPublished(html) {
  const m = html.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/i);
  return m ? m[1] : "";
}

function extractFaqs(html) {
  const faqs = [];
  const re =
    /<div class="faq-item">[\s\S]*?<span class="qt">([\s\S]*?)<\/span>[\s\S]*?<div class="faq-a-in">\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html))) {
    faqs.push({
      question: stripTags(m[1]),
      answer: stripTags(m[2]),
    });
  }
  return faqs;
}

function stripOldLd(html) {
  html = html.replace(BLOCK_RE, "");
  html = html.replace(LD_RE, "");
  return html;
}

function inject(html, script) {
  const block = START + "\n" + script + "\n" + END + "\n";
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, block + "</body>");
  }
  return html + "\n" + block;
}

function applyFile(page) {
  const file = path.join(ROOT, page.file);
  let html = fs.readFileSync(file, "utf8");
  const kind = pageKind(page.path);
  const faqs =
    kind === "home" || kind === "faq" ? extractFaqs(html) : [];
  const graph = graphForPage({
    path: page.path,
    url: page.url,
    h1: extractH1(html),
    description: extractDescription(html),
    faqs,
    datePublished: extractPublished(html),
  });
  html = stripOldLd(html);
  html = inject(html, jsonLdScript(graph));
  fs.writeFileSync(file, html);
  const types = graph["@graph"].map((n) => n["@type"]).join(", ");
  return page.path + "  " + types + (faqs.length ? "  faqs=" + faqs.length : "");
}

function main() {
  const pages = publicPages();
  const lines = pages.map(applyFile);
  console.log(lines.join("\n"));
  console.log("Applied schema to " + pages.length + " pages.");
}

main();
