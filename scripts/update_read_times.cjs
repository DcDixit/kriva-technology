#!/usr/bin/env node
/* Recomputes "N min read" for insight articles from their word count (230 wpm, rounded up)
   and mirrors the value on the matching /insights card. Also refreshes JSON-LD wordCount.
   Usage: node scripts/update_read_times.cjs [--write] [slug ...]   (no --write = dry run) */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const WPM = 230;
const write = process.argv.includes("--write");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const SLUG_FILE = Object.fromEntries(
  JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"))
    .rewrites.filter((r) => /^\/insights\/[a-z0-9-]+$/.test(r.source))
    .map((r) => [r.source.replace("/insights/", ""), r.destination.replace(/^\//, "")])
);

function words(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/g, " ")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

const indexPath = path.join(ROOT, "kriva-insights-index.html");
let index = fs.readFileSync(indexPath, "utf8");
const report = [];

for (const [slug, file] of Object.entries(SLUG_FILE)) {
  if (only.length && !only.includes(slug)) continue;
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  let html = fs.readFileSync(p, "utf8");
  const article = (html.match(/<article[\s\S]*?<\/article>/) || [""])[0];
  if (!article) continue;
  const n = words(article);
  const mins = Math.max(1, Math.ceil(n / WPM));
  const shown = (html.match(/(\d+) min read/) || [, "?"])[1];
  html = html.replace(/\b\d+ min read\b/g, `${mins} min read`);
  html = html.replace(/("wordCount":\s*)\d+/g, `$1${n}`);
  /* /insights cards and the featured block are top-level <article> elements (never nested). */
  index = index.replace(/<article\b[^>]*>[\s\S]*?<\/article>/g, (card) =>
    card.includes(`href="/insights/${slug}"`) ? card.replace(/\b\d+ min read\b/g, `${mins} min read`) : card
  );
  report.push(`${slug.padEnd(36)} words ${String(n).padStart(5)}  ${shown} -> ${mins} min`);
  if (write) fs.writeFileSync(p, html);
}
if (write) fs.writeFileSync(indexPath, index);
console.log(report.join("\n"));
console.log(write ? "written" : "dry run (add --write to apply)");
