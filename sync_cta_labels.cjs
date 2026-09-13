#!/usr/bin/env node
/** Normalize site-wide CTA labels to canonical fit-call / project-brief wording. */
const fs = require("fs");
const path = require("path");
const {
  CTA_PRIMARY_LABEL,
  CTA_PRIMARY_COMPACT_LABEL,
  CTA_SECONDARY_LABEL,
  CTA_INQUIRE_LABEL,
} = require("./shared/studio");

const ROOT = __dirname;
const INQUIRE_PLACEHOLDER = "Send a quick inquiry";

const GLOBAL_REPLACEMENTS = [
  ["Book a free 20-min fit call", CTA_PRIMARY_LABEL],
  ["Book a free 20-min fit call", CTA_PRIMARY_LABEL],
  ["Book a free 20-min fit call", CTA_PRIMARY_LABEL],
  ["Book a free 20-min fit call", CTA_PRIMARY_LABEL],
  ["20-minute fit call", "20-minute fit call"],
  ["20-minute fit call we run", "20-minute fit call we run"],
  ["Send a project brief", CTA_SECONDARY_LABEL],
];

function protectInquireButtons(text) {
  return text.replace(
    /(<a[^>]*href="#inquire"[^>]*>[\s\S]*?<span>)[^<]*(<\/span>)/g,
    `$1${INQUIRE_PLACEHOLDER}$2`
  );
}

function restoreInquireButtons(text) {
  return text.replaceAll(INQUIRE_PLACEHOLDER, CTA_INQUIRE_LABEL);
}

function normalizeNavCompactHeader(text) {
  return text.replace(
    /(<div class="nav-cta">\s*<a href="\/contact#book" class="btn sm"><span>)[^<]*(<\/span>)/g,
    `$1${CTA_PRIMARY_COMPACT_LABEL}$2`
  );
}

function normalizeBookAnchors(text) {
  return text.replace(
    /(<a\b[^>]*\bhref="(?:\/contact)?#book"[^>]*>)([\s\S]*?)(<\/a>)/gi,
    (_match, open, inner, close) => {
      let next = inner;
      if (/<b>/.test(next)) {
        next = next.replace(/<b>[^<]*<\/b>/, `<b>${CTA_PRIMARY_LABEL}</b>`);
      } else if (/<span>/.test(next)) {
        next = next.replace(/<span>[^<]*<\/span>/, `<span>${CTA_PRIMARY_LABEL}</span>`);
      } else {
        next = next
          .replace(/\bRequest a fit call\b/g, CTA_PRIMARY_LABEL)
          .replace(/\bBook a fit call\b/g, CTA_PRIMARY_LABEL)
          .replace(/\bTalk through the decision\b/g, CTA_PRIMARY_LABEL)
          .replace(/\bAsk us directly\b/g, CTA_PRIMARY_LABEL)
          .replace(/\bFree fit call\b/g, CTA_PRIMARY_LABEL);
      }
      return open + next + close;
    }
  );
}

function normalizeBookDataLabels(text) {
  return text.replace(
    /(\{\s*href:\s*"\/contact#book",\s*label:\s*")[^"]*("\s*\})/g,
    `$1${CTA_PRIMARY_LABEL}$2`
  );
}

function normalizeBookHeadings(text) {
  return text
    .replace(/(<h2[^>]*id="ctaH"[^>]*>[\s\S]*?)Book a fit call\.(<\/h2>)/g, `$1${CTA_PRIMARY_LABEL}.$2`)
    .replace(/(<h2[^>]*id="bkH"[^>]*>)[^<]*(<\/h2>)/g, `$1${CTA_PRIMARY_LABEL}$2`);
}

function normalizeBriefSubmit(text) {
  return text
    .replace(/(<span id="submitLabel">)[^<]*(<\/span>)/g, `$1${CTA_SECONDARY_LABEL}$2`)
    .replace(/submitDefault:\s*'Send a project brief'/g, `submitDefault: '${CTA_SECONDARY_LABEL}'`);
}

function normalizeFitSubmit(text) {
  return text
    .replace(/(<span id="fitSubmitLabel">)[^<]*(<\/span>)/g, `$1${CTA_PRIMARY_LABEL}$2`)
    .replace(/submitDefault:\s*'Request fit call'/g, `submitDefault: '${CTA_PRIMARY_LABEL}'`);
}

function syncText(text) {
  let out = protectInquireButtons(text);
  for (const [from, to] of GLOBAL_REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  out = normalizeBookAnchors(out);
  out = normalizeBookDataLabels(out);
  out = normalizeBookHeadings(out);
  out = normalizeNavCompactHeader(out);
  out = normalizeFitSubmit(out);
  out = normalizeBriefSubmit(out);
  out = restoreInquireButtons(out);
  return out;
}

function walk(dir, exts, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, exts, files);
    else if (exts.some((ext) => name.endsWith(ext))) files.push(full);
  }
  return files;
}

function main() {
  const targets = walk(ROOT, [".html", ".cjs", ".py"]).filter((file) => {
    const rel = path.relative(ROOT, file);
    return !rel.startsWith("node_modules");
  });

  let changed = 0;
  for (const file of targets) {
    const before = fs.readFileSync(file, "utf8");
    const after = syncText(before);
    if (after !== before) {
      fs.writeFileSync(file, after, "utf8");
      changed += 1;
      console.log(`UPD  ${path.relative(ROOT, file)}`);
    }
  }
  console.log(`Done. ${changed} file(s) updated.`);
}

if (require.main === module) main();

module.exports = {
  syncText,
  CTA_PRIMARY_LABEL,
  CTA_PRIMARY_COMPACT_LABEL,
  CTA_SECONDARY_LABEL,
  CTA_INQUIRE_LABEL,
};
