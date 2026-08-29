#!/usr/bin/env node
/**
 * Drop-in approved proof assets: no fake generation.
 *
 * Usage:
 *   1. Drop approved JPG/PNG files at the paths below
 *   2. node apply_proof_assets.cjs
 *
 * Only replaces illustrative SVG frames when a real approved file exists on disk.
 * Captions flip from "Illustrative" → "Product capture" automatically.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

/** Priority case-study proof hosts (FleetFlow, PayrollPro, FinanceSync) */
const CASE_PROOF = {
  "kriva-case-fleetflow.html": [
    { key: "hero", publicPath: "/work/fleetflow/console-full.jpg", alt: "FleetFlow dispatch console", w: 2400, h: 1029 },
    { key: "story-0", publicPath: "/work/fleetflow/load-board.jpg", alt: "FleetFlow load board with bulk selection", w: 1600, h: 1000 },
    { key: "story-1", publicPath: "/work/fleetflow/sla-burndown.jpg", alt: "FleetFlow SLA burndown view", w: 1600, h: 1000 },
    { key: "story-2", publicPath: "/work/fleetflow/tablet-density.jpg", alt: "FleetFlow tablet density mode", w: 1600, h: 1000 },
    { key: "before", publicPath: "/work/fleetflow/before.jpg", alt: "Legacy TMS and spreadsheet workflow", w: 1920, h: 1080 },
    { key: "after", publicPath: "/work/fleetflow/after.jpg", alt: "Unified FleetFlow dispatch console", w: 1920, h: 1080 },
  ],
  "kriva-case-payroll-pro.html": [
    { key: "hero", publicPath: "/work/payrollpro/hero.jpg", alt: "PayrollPro onboarding console", w: 2400, h: 1030 },
    { key: "story-0", publicPath: "/work/payrollpro/role-path.jpg", alt: "Role-based onboarding paths", w: 1600, h: 1000 },
    { key: "story-1", publicPath: "/work/payrollpro/permissions.jpg", alt: "Permission clarity screens", w: 1600, h: 1000 },
    { key: "story-2", publicPath: "/work/payrollpro/integration-health.jpg", alt: "Integration health panel", w: 1600, h: 1000 },
    { key: "before", publicPath: "/work/payrollpro/before.jpg", alt: "Before empty-state onboarding", w: 1920, h: 1080 },
    { key: "after", publicPath: "/work/payrollpro/after.jpg", alt: "After progressive onboarding", w: 1920, h: 1080 },
  ],
  "kriva-case-finance-sync.html": [
    { key: "hero", publicPath: "/work/financesync/hero.jpg", alt: "FinanceSync reconciliation hub", w: 2400, h: 1030 },
    { key: "story-0", publicPath: "/work/financesync/sync-workers.jpg", alt: "Sync workers", w: 1600, h: 1000 },
    { key: "story-1", publicPath: "/work/financesync/anomalies.jpg", alt: "Anomaly detection", w: 1600, h: 1000 },
    { key: "story-2", publicPath: "/work/financesync/discrepancy.jpg", alt: "Discrepancy resolution UI", w: 1600, h: 1000 },
    { key: "before", publicPath: "/work/financesync/before.jpg", alt: "Before reconciliation workflow", w: 1920, h: 1080 },
    { key: "after", publicPath: "/work/financesync/after.jpg", alt: "After unified reconciliation hub", w: 1920, h: 1080 },
  ],
};

const FOUNDER = {
  file: "kriva-about.html",
  publicPath: "/brand/founder-portrait.jpg",
  alt: "KRIVA Technologies product studio",
  w: 1200,
  h: 1500,
};

function diskPath(publicPath) {
  if (publicPath.startsWith("/brand/")) return path.join(ROOT, publicPath.slice(1));
  return path.join(ROOT, "media", publicPath.slice(1));
}

function existsAny(publicPath) {
  const base = diskPath(publicPath);
  if (fs.existsSync(base)) return publicPath;
  const webp = publicPath.replace(/\.(jpe?g|png)$/i, ".webp");
  if (fs.existsSync(diskPath(webp))) return webp;
  const png = publicPath.replace(/\.jpe?g$/i, ".png");
  if (png !== publicPath && fs.existsSync(diskPath(png))) return png;
  return null;
}

function imgTag(src, alt, w, h) {
  return `<img src="${src}" alt="${alt.replace(/"/g, "&quot;")}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
}

function injectCaseVisual(html, spec) {
  const resolved = existsAny(spec.publicPath);
  if (!resolved) return { html, applied: false };

  const hostRe = new RegExp(
    `(<div class="slot"[^>]*data-visual="${spec.key}"[^>]*>)([\\s\\S]*?)(</div>)`,
    "i"
  );
  let applied = false;
  html = html.replace(hostRe, (match, open, inner, close) => {
    applied = true;
    // Remove prior svg/jpg img inside host; keep structure
    const cleaned = inner.replace(/<img\b[^>]*>\s*/gi, "");
    return `${open}\n        ${imgTag(resolved, spec.alt, spec.w, spec.h)}\n        ${cleaned.trim()}\n      ${close}`;
  });

  if (applied) {
    // Upgrade captions near this page once any real asset lands
    html = html
      .replace(
        /<span class="flag">Illustrative<\/span> Interface reference · approved screenshots replace this frame/g,
        `<span class="flag">Product capture</span> Approved screenshot`
      )
      .replace(
        /<span class="flag">Illustrative<\/span> Interactive compare · approved screenshots replace these frames/g,
        `<span class="flag">Product capture</span> Approved before / after captures`
      );
  }
  return { html, applied };
}

function injectFounder(html) {
  const resolved = existsAny(FOUNDER.publicPath);
  if (!resolved) return { html, applied: false };
  if (html.includes(`src="${resolved}"`)) return { html, applied: false };

  if (!/data-proof="founder"/.test(html)) return { html, applied: false };

  html = html.replace(
    /(<div class="slot slot--editorial"[^>]*data-proof="founder"[^>]*>)/,
    `$1\n        ${imgTag(resolved, FOUNDER.alt, FOUNDER.w, FOUNDER.h)}\n`
  );
  html = html.replace(
    /<span class="flag">Portrait pending<\/span>[^<]*/i,
    "Approved founder portrait · 4:5"
  );
  return { html, applied: true };
}

let applied = 0;
let missing = [];

for (const [file, specs] of Object.entries(CASE_PROOF)) {
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, "utf8");
  let changed = false;
  for (const spec of specs) {
    if (!existsAny(spec.publicPath)) {
      missing.push(`${file} ← ${spec.publicPath}`);
      continue;
    }
    const res = injectCaseVisual(html, spec);
    html = res.html;
    if (res.applied) {
      changed = true;
      applied++;
      console.log("Applied", spec.publicPath, "→", file);
    }
  }
  if (changed) fs.writeFileSync(fp, html, "utf8");
}

{
  const fp = path.join(ROOT, FOUNDER.file);
  let html = fs.readFileSync(fp, "utf8");
  if (existsAny(FOUNDER.publicPath)) {
    const res = injectFounder(html);
    if (res.applied) {
      fs.writeFileSync(fp, res.html, "utf8");
      applied++;
      console.log("Applied", FOUNDER.publicPath, "→", FOUNDER.file);
    }
  } else {
    missing.push(`${FOUNDER.file} ← ${FOUNDER.publicPath}`);
  }
}

console.log("\n---");
console.log("Proof assets applied:", applied);
console.log("Still awaiting approved files:", missing.length);
if (missing.length) {
  console.log("\nDrop approved JPG/PNG (no AI recreations) then re-run:");
  for (const m of missing.slice(0, 24)) console.log(" ", m);
  if (missing.length > 24) console.log(`  … +${missing.length - 24} more`);
}
console.log("\nCommand: node apply_proof_assets.cjs");
