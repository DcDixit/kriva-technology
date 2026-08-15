#!/usr/bin/env node
/**
 * Site-wide visual consistency pass.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const FONT =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
const PRELOAD = `<link rel="preload" as="style" href="${FONT}">`;

const files = fs.readdirSync(ROOT).filter((f) => /^kriva-.*\.html$/.test(f));
let report = { files: 0, changed: 0 };

function unify(html) {
  let s = html;
  const start = s;

  const pairs = [
    ["--btn-hover:var(--lilac)", "--btn-hover:var(--amber)"],
    [
      ".btn.on-dark:hover{color:var(--ink);border-color:var(--lilac)}",
      ".btn.on-dark:hover{color:var(--ink);border-color:var(--amber)}",
    ],
    [
      ".on-ink :focus-visible,footer :focus-visible,.cta-band :focus-visible{outline-color:var(--lilac)}",
      ".on-ink :focus-visible,footer :focus-visible,.cta-band :focus-visible{outline-color:var(--amber)}",
    ],
    [
      ".on-ink :focus-visible,footer :focus-visible{outline-color:var(--lilac)}",
      ".on-ink :focus-visible,footer :focus-visible{outline-color:var(--amber)}",
    ],
    [
      ".assur i{font-style:normal;color:var(--lilac);margin-right:7px}",
      ".assur i{font-style:normal;color:var(--amber);margin-right:7px}",
    ],
    [
      ".stack-live{display:inline-flex;align-items:center;gap:7px;color:var(--lilac)}",
      ".stack-live{display:inline-flex;align-items:center;gap:7px;color:var(--amber)}",
    ],
    [
      "@keyframes stack-pulse{0%{box-shadow:0 0 0 0 rgba(183,169,255,.45)}70%{box-shadow:0 0 0 7px rgba(183,169,255,0)}100%{box-shadow:0 0 0 0 rgba(183,169,255,0)}}",
      "@keyframes stack-pulse{0%{box-shadow:0 0 0 0 rgba(219,155,31,.45)}70%{box-shadow:0 0 0 7px rgba(219,155,31,0)}100%{box-shadow:0 0 0 0 rgba(219,155,31,0)}}",
    ],
    [
      ".stack a:hover .go{color:var(--lilac);transform:translateX(4px)}",
      ".stack a:hover .go{color:var(--amber);transform:translateX(4px)}",
    ],
    [
      '.rail-links a[aria-current="true"] u{color:var(--lilac)}',
      '.rail-links a[aria-current="true"] u{color:var(--amber)}',
    ],
    [
      ".market .k{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--lilac)}",
      ".market .k{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--amber)}",
    ],
    [
      ".adj a:hover{border-color:var(--lilac);transform:translate3d(0,-4px,0)}",
      ".adj a:hover{border-color:var(--ink)}",
    ],
    [
      "Interface reference · approved screenshots replace this frame",
      "Reconstructed interface · no client data shown",
    ],
    [
      "Interactive compare · approved screenshots replace these frames",
      "Before / after pattern · no client data shown",
    ],
  ];

  for (const [a, b] of pairs) s = s.split(a).join(b);

  s = s.replace(
    /background:\s*\n\s*radial-gradient\([^)]+\),\s*\n\s*radial-gradient\([^)]+\),\s*\n\s*var\(--paper\);/g,
    "background:var(--paper);"
  );

  s = s.replace(
    /transform:translate3d\(0,-[0-9]+px,0\);box-shadow:[^;]+;border-color:var\(--ink\)/g,
    "border-color:var(--ink)"
  );
  s = s.replace(
    /transform:translate3d\(0,-[0-9]+px,0\);border-color:var\(--ink\)/g,
    "border-color:var(--ink)"
  );

  s = s.replace(
    /padding:12px 20px;border:1px solid var\(--ink\);background:var\(--btn-bg\);color:var\(--btn-fg\);/g,
    "padding:13px 20px;border:1px solid var(--ink);background:var(--btn-bg);color:var(--btn-fg);"
  );

  if (!s.includes('rel="preload" as="style"') && s.includes(FONT)) {
    s = s.replace(
      `<link rel="stylesheet" href="${FONT}">`,
      `${PRELOAD}\n<link rel="stylesheet" href="${FONT}">`
    );
  }

  return { html: s, changed: s !== start };
}

for (const name of files) {
  report.files++;
  const fp = path.join(ROOT, name);
  const { html, changed } = unify(fs.readFileSync(fp, "utf8"));
  if (changed) {
    fs.writeFileSync(fp, html);
    report.changed++;
  }
}
console.log(JSON.stringify(report, null, 2));
