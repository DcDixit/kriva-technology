#!/usr/bin/env node
/**
 * Inject generated SVG visuals into case-study data-visual hosts.
 * Targets data-visual="hero|story-0|story-1|story-2|before|after" only:
 * avoids corrupting unrelated .slot elements.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

/** Legacy .jpg paths in HTML → new .svg paths on disk */
const PATH_MAP = {
  "/work/fleetflow/home-console.jpg": "/work/fleetflow/home-console.svg",
  "/work/fleetflow/console-full.jpg": "/work/fleetflow/console-full.svg",
  "/work/fleetflow/thumb.jpg": "/work/fleetflow/thumb.svg",
  "/work/payrollpro/thumb.jpg": "/work/payrollpro/thumb.svg",
  "/work/financesync/thumb.jpg": "/work/financesync/thumb.svg",
  "/work/healthtrack/thumb.jpg": "/work/healthtrack/thumb.svg",
  "/work/brandlift/thumb.jpg": "/work/brandlift/thumb.svg",
  "/work/crmpulse/thumb.jpg": "/work/crmpulse/thumb.svg",
  "/work/supportai/thumb.jpg": "/work/supportai/thumb.svg",
  "/work/localserve/thumb.jpg": "/work/localserve/thumb.svg",
  "/work/fleetflow/load-board.jpg": "/work/fleetflow/load-board.svg",
  "/work/fleetflow/sla-burndown.jpg": "/work/fleetflow/sla-burndown.svg",
  "/work/fleetflow/tablet-density.jpg": "/work/fleetflow/tablet-density.svg",
  "/work/fleetflow/before.jpg": "/work/fleetflow/before.svg",
  "/work/fleetflow/after.jpg": "/work/fleetflow/after.svg",
  "/work/payrollpro/hero.jpg": "/work/payrollpro/hero.svg",
  "/work/payrollpro/role-path.jpg": "/work/payrollpro/role-path.svg",
  "/work/payrollpro/permissions.jpg": "/work/payrollpro/permissions.svg",
  "/work/payrollpro/integration-health.jpg": "/work/payrollpro/integration-health.svg",
  "/work/payrollpro/before.jpg": "/work/payrollpro/before.svg",
  "/work/payrollpro/after.jpg": "/work/payrollpro/after.svg",
  "/work/payrollpro/onboarding.jpg": "/work/payrollpro/onboarding.svg",
  "/solutions/trucking/dispatch-console.jpg": "/solutions/trucking/dispatch-console.svg",
  "/solutions/trucking/fleet-dashboard.jpg": "/work/fleetflow/fleet-dashboard.svg",
  "/solutions/trucking/driver-app.jpg": "/solutions/trucking/driver-app.svg",
  "/solutions/saas/onboarding.jpg": "/solutions/saas/onboarding.svg",
  "/solutions/saas/dashboard-admin.jpg": "/solutions/saas/dashboard-admin.svg",
  "/solutions/saas/permissions.jpg": "/solutions/saas/permissions.svg",
  "/brand/founder-portrait.jpg": "/brand/founder-portrait.svg",
  "/insights/featured-cover.jpg": "/insights/featured-cover.svg",
};

const VISUAL_KEYS = ["hero", "story-0", "story-1", "story-2", "before", "after"];

const CASE_INJECT = {
  "kriva-case-payroll-pro.html": [
    { key: "hero", svg: "/work/payrollpro/hero.svg", alt: "PayrollPro onboarding console", w: 2400, h: 1030 },
    { key: "story-0", svg: "/work/payrollpro/role-path.svg", alt: "Role-based onboarding paths", w: 1600, h: 1000 },
    { key: "story-1", svg: "/work/payrollpro/permissions.svg", alt: "Permission clarity screens", w: 1600, h: 1000 },
    { key: "story-2", svg: "/work/payrollpro/integration-health.svg", alt: "Integration health panel", w: 1600, h: 1000 },
    { key: "before", svg: "/work/payrollpro/before.svg", alt: "Before empty-state onboarding", w: 1920, h: 1080 },
    { key: "after", svg: "/work/payrollpro/after.svg", alt: "After progressive onboarding", w: 1920, h: 1080 },
  ],
  "kriva-case-finance-sync.html": [
    { key: "hero", svg: "/work/financesync/hero.svg", alt: "FinanceSync reconciliation hub", w: 2400, h: 1030 },
    { key: "story-0", svg: "/work/financesync/sync-workers.svg", alt: "Sync workers", w: 1600, h: 1000 },
    { key: "story-1", svg: "/work/financesync/anomalies.svg", alt: "Anomaly detection", w: 1600, h: 1000 },
    { key: "story-2", svg: "/work/financesync/discrepancy.svg", alt: "Discrepancy resolution UI", w: 1600, h: 1000 },
    { key: "before", svg: "/work/financesync/before.svg", alt: "Before reconciliation workflow", w: 1920, h: 1080 },
    { key: "after", svg: "/work/financesync/after.svg", alt: "After unified reconciliation hub", w: 1920, h: 1080 },
  ],
  "kriva-case-healthtrack.html": [
    { key: "hero", svg: "/work/healthtrack/hero.svg", alt: "HealthTrack patient mobile app", w: 2400, h: 1030 },
    { key: "story-0", svg: "/work/healthtrack/approach-1.svg", alt: "Care plan home screen", w: 1600, h: 1000 },
    { key: "story-1", svg: "/work/healthtrack/approach-2.svg", alt: "Medication reminders", w: 1600, h: 1000 },
    { key: "story-2", svg: "/work/healthtrack/approach-3.svg", alt: "Clinician handoff view", w: 1600, h: 1000 },
    { key: "before", svg: "/work/healthtrack/before.svg", alt: "Before patient portal", w: 1920, h: 1080 },
    { key: "after", svg: "/work/healthtrack/after.svg", alt: "After unified mobile experience", w: 1920, h: 1080 },
  ],
  "kriva-case-brandlift.html": [
    { key: "hero", svg: "/work/brandlift/hero.svg", alt: "BrandLift storefront system", w: 2400, h: 1030 },
    { key: "story-0", svg: "/work/brandlift/approach-1.svg", alt: "Brand identity exploration", w: 1600, h: 1000 },
    { key: "story-1", svg: "/work/brandlift/approach-2.svg", alt: "Storefront components", w: 1600, h: 1000 },
    { key: "story-2", svg: "/work/brandlift/approach-3.svg", alt: "Launch-ready design system", w: 1600, h: 1000 },
    { key: "before", svg: "/work/brandlift/before.svg", alt: "Before rebrand", w: 1920, h: 1080 },
    { key: "after", svg: "/work/brandlift/after.svg", alt: "After unified brand system", w: 1920, h: 1080 },
  ],
  "kriva-case-crm-pulse.html": [
    { key: "hero", svg: "/work/crmpulse/hero.svg", alt: "CRMPulse sales dashboard", w: 2400, h: 1030 },
    { key: "story-0", svg: "/work/crmpulse/approach-1.svg", alt: "Pipeline overview", w: 1600, h: 1000 },
    { key: "story-1", svg: "/work/crmpulse/approach-2.svg", alt: "Deal drill-down", w: 1600, h: 1000 },
    { key: "story-2", svg: "/work/crmpulse/approach-3.svg", alt: "Forecast reporting", w: 1600, h: 1000 },
    { key: "before", svg: "/work/crmpulse/before.svg", alt: "Before spreadsheet CRM", w: 1920, h: 1080 },
    { key: "after", svg: "/work/crmpulse/after.svg", alt: "After unified sales console", w: 1920, h: 1080 },
  ],
  "kriva-case-ai-support.html": [
    { key: "hero", svg: "/work/supportai/hero.svg", alt: "SupportAI review console", w: 2400, h: 1030 },
    { key: "story-0", svg: "/work/supportai/approach-1.svg", alt: "Ticket classification", w: 1600, h: 1000 },
    { key: "story-1", svg: "/work/supportai/approach-2.svg", alt: "Human review queue", w: 1600, h: 1000 },
    { key: "story-2", svg: "/work/supportai/approach-3.svg", alt: "Resolution audit log", w: 1600, h: 1000 },
    { key: "before", svg: "/work/supportai/before.svg", alt: "Before manual triage", w: 1920, h: 1080 },
    { key: "after", svg: "/work/supportai/after.svg", alt: "After automated support console", w: 1920, h: 1080 },
  ],
  "kriva-case-marketplace.html": [
    { key: "hero", svg: "/work/localserve/hero.svg", alt: "LocalServe marketplace MVP", w: 2400, h: 1030 },
    { key: "story-0", svg: "/work/localserve/approach-1.svg", alt: "Provider discovery", w: 1600, h: 1000 },
    { key: "story-1", svg: "/work/localserve/approach-2.svg", alt: "Booking flow", w: 1600, h: 1000 },
    { key: "story-2", svg: "/work/localserve/approach-3.svg", alt: "Ops moderation panel", w: 1600, h: 1000 },
    { key: "before", svg: "/work/localserve/before.svg", alt: "Before manual booking", w: 1920, h: 1080 },
    { key: "after", svg: "/work/localserve/after.svg", alt: "After marketplace launch", w: 1920, h: 1080 },
  ],
};

const SOLUTION_SLOTS = {
  "kriva-solution-accounting.html": [
    { svg: "/solutions/accounting/reconciliation.svg", alt: "Reconciliation workflow", w: 1600, h: 1000 },
    { svg: "/solutions/accounting/exceptions.svg", alt: "Exception handling queue", w: 1600, h: 1000 },
    { svg: "/solutions/accounting/audit.svg", alt: "Audit trail view", w: 1600, h: 1000 },
    { svg: "/solutions/accounting/proof.svg", alt: "Finance sync proof console", w: 1920, h: 1080 },
  ],
  "kriva-solution-car-transport.html": [
    { svg: "/solutions/car-transport/quote.svg", alt: "Instant transport quote", w: 1600, h: 1000 },
    { svg: "/solutions/car-transport/order.svg", alt: "Order lifecycle console", w: 1600, h: 1000 },
    { svg: "/solutions/car-transport/pod.svg", alt: "Proof of delivery capture", w: 1600, h: 1000 },
  ],
};

function fileExists(publicPath) {
  const lp = publicPath.startsWith("/brand/")
    ? path.join(ROOT, publicPath.slice(1))
    : path.join(ROOT, "media", publicPath.slice(1));
  return fs.existsSync(lp);
}

function imgTag(svgPath, alt, w, h) {
  return `<img src="${svgPath}" alt="${alt.replace(/"/g, "&quot;")}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
}

function remapPaths(html) {
  let out = html;
  for (const [oldP, newP] of Object.entries(PATH_MAP)) {
    out = out.split(oldP).join(newP);
  }
  return out;
}

function stripDuplicateImgs(html) {
  // Remove img tags that sit between opening tags and corrupt markup (legacy inject damage)
  return html.replace(
    /(<(?:div|figure|h2|h3|h4|p)[^>]*>)\s*<img src="\/work\/[^"]+\.svg"[^>]*>\s*/gi,
    "$1"
  );
}

function injectAtDataAsset(html) {
  const re = /(<[a-z]+[^>]*data-asset="([^"]+)"[^>]*data-asset-alt="([^"]*)"[^>]*>)/gi;
  return html.replace(re, (match, open, assetPath, alt) => {
    const mapped = PATH_MAP[assetPath] || assetPath.replace(/\.jpg$/, ".svg");
    if (match.includes(`src="${mapped}"`)) return match;
    if (!fileExists(mapped)) return match.replace(assetPath, mapped);
    const dims = match.match(/data-asset-dims="(\d+)[×x](\d+)"/i);
    const w = dims ? dims[1] : 1600;
    const h = dims ? dims[2] : 1000;
    const nextOpen = open.replace(assetPath, mapped);
    return `${nextOpen}\n${imgTag(mapped, alt || "Product interface", w, h)}`;
  });
}

function injectVisualHosts(html, specs) {
  for (const spec of specs) {
    if (!spec.key || !VISUAL_KEYS.includes(spec.key)) continue;
    if (!fileExists(spec.svg)) continue;
    const hostRe = new RegExp(
      `(<div class="slot"[^>]*data-visual="${spec.key}"[^>]*>)([\\s\\S]*?)(</div>)`,
      "i"
    );
    html = html.replace(hostRe, (match, open, inner, close) => {
      if (inner.includes(`src="${spec.svg}"`)) return match;
      const tag = imgTag(spec.svg, spec.alt, spec.w, spec.h);
      return `${open}\n        ${tag}\n        ${inner.trim()}\n      ${close}`;
    });
  }
  return html;
}

function injectSolutionCapSlots(html, specs) {
  let i = 0;
  return html.replace(/(<div class="cap-media"[^>]*>)/g, (m) => {
    if (i >= specs.length) return m;
    const s = specs[i++];
    if (html.includes(`src="${s.svg}"`)) return m;
    if (!fileExists(s.svg)) return m;
    return `${m}\n          ${imgTag(s.svg, s.alt, s.w, s.h)}`;
  });
}

function injectInsightsFeatured(html) {
  const svg = "/insights/featured-cover.svg";
  if (!fileExists(svg)) return html;
  if (html.includes(`src="${svg}"`)) return html;
  return html.replace(
    /(<div class="feat-slot feat-slot--editorial"[^>]*>)/,
    `$1\n        ${imgTag(svg, "Featured insights article cover", 1200, 800)}`
  );
}

let total = 0;
for (const file of fs.readdirSync(ROOT).filter((f) => /^kriva-.*\.html$/.test(f))) {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, "utf8");
  const before = html;
  html = stripDuplicateImgs(html);
  html = remapPaths(html);
  html = injectAtDataAsset(html);
  if (CASE_INJECT[file]) html = injectVisualHosts(html, CASE_INJECT[file]);
  if (SOLUTION_SLOTS[file]) html = injectSolutionCapSlots(html, SOLUTION_SLOTS[file]);
  if (file === "kriva-insights-index.html") html = injectInsightsFeatured(html);
  if (html !== before) {
    fs.writeFileSync(fp, html);
    total++;
    console.log("Updated", file);
  }
}

console.log(`Injected visuals into ${total} HTML files`);
