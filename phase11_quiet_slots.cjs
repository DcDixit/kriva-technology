/**
 * Phase 11: quiet solution/work/FleetFlow empty frames into intentional hosts.
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

function patch(file, transforms) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, "utf8");
  const before = html;
  for (const [a, b] of transforms) {
    if (typeof a === "string") html = html.split(a).join(b);
    else html = html.replace(a, b);
  }
  if (html !== before) {
    fs.writeFileSync(p, html, "utf8");
    console.log("OK", file);
  } else console.log("--", file);
}

const solFiles = [
  "kriva-solution-trucking.html",
  "kriva-solution-saas.html",
  "kriva-solution-accounting.html",
  "kriva-solution-car-transport.html",
];

for (const f of solFiles) {
  patch(f, [
    [/Slot A · 1600×1000 · [^<]+/g, "Capability reference · 01"],
    [/Slot B · 1600×1000 · [^<]+/g, "Capability reference · 02"],
    [/Slot C · 1600×1000 · [^<]+/g, "Capability reference · 03"],
    [/Slot D · 1600×1000 · [^<]+/g, "Capability reference · 04"],
    [/Slot · 1920×1080 · [^<]+/g, "Proof reference · 16:9"],
    [
      /<div style="margin-top:clamp\(20px,2\.4vw,32px\)">\s*<p class="cap-note">[\s\S]*?<\/p>\s*<\/div>/g,
      "",
    ],
    [
      /<p class="cap-note">[\s\S]*?Slots D[\s\S]*?<\/p>/g,
      "",
    ],
  ]);
}

patch("kriva-case-fleetflow.html", [
  [
    'Slot · hero · 2400×1029 · dispatch console, full width',
    "FleetFlow · dispatch console reference",
  ],
  ["Interface host · real capture replaces this frame when supplied", "Project story frame · screenshot drops into this host when supplied"],
  ["Slot · 1600×1000 · load board with bulk selection", "Load board · bulk selection"],
  ["Slot · 1600×1000 · SLA burndown view", "SLA burndown"],
  ["Slot · 1600×1000 · tablet density mode", "Tablet density"],
  ["Slot · 1920×1080 · legacy TMS + spreadsheet", "Before · legacy TMS"],
  ["Slot · 1920×1080 · unified dispatch console", "After · unified console"],
  [
    /<div class="thumb">\s*<div class="slot">[\s\S]*?<\/div>\s*<\/div>\s*<\/a>/,
    `<p class="mono" style="margin-top:18px;color:var(--steel)">Continue →</p>
  </a>`,
  ],
]);

// Services index: ensure no deferred language remains
patch("kriva-services-index.html", [
  ["Standalone redesign deferred.", ""],
  ["Canonical URL reserved:", "Service page:"],
]);

console.log("Solution/FleetFlow quieting done");
