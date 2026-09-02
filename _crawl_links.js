const fs = require("fs");
const path = require("path");

const root = __dirname;
const htmls = fs.readdirSync(root).filter((f) => /^kriva-.*\.html$/i.test(f));
const re = /href=["']([^"'#?]+)(?:[?#][^"']*)?["']/gi;

const FILE_MAP = {
  "/": "kriva-redesign.html",
  "/about": "kriva-about.html",
  "/contact": "kriva-contact.html",
  "/process": "kriva-process.html",
  "/faq": "kriva-faq.html",
  "/privacy": "kriva-privacy.html",
  "/terms": "kriva-terms.html",
  "/technologies": "kriva-technologies.html",
  "/services": "kriva-services-index.html",
  "/solutions": "kriva-solutions-index.html",
  "/work": "kriva-work-index.html",
  "/insights": "kriva-insights-index.html",
  "/careers": "kriva-careers.html",
  "/industries": "kriva-industries.html",
  "/solutions/trucking-logistics": "kriva-solution-trucking.html",
  "/solutions/saas": "kriva-solution-saas.html",
  "/solutions/accounting-integrations": "kriva-solution-accounting.html",
  "/solutions/car-transportation": "kriva-solution-car-transport.html",
  "/work/shiftrail-dispatch": "kriva-case-fleetflow.html",
  "/work/fleetflow-dispatch": "kriva-case-fleetflow.html",
  "/work/payroll-pro-saas": "kriva-case-payroll-pro.html",
  "/work/finance-sync-hub": "kriva-case-finance-sync.html",
  "/work/healthtrack-mobile": "kriva-case-healthtrack.html",
  "/work/brandlift-ecommerce": "kriva-case-brandlift.html",
  "/work/crm-pulse-dashboard": "kriva-case-crm-pulse.html",
  "/work/ai-support-automation": "kriva-case-ai-support.html",
  "/work/marketplace-mvp": "kriva-case-marketplace.html",
  "/insights/ai-in-product-design-2026": "kriva-insight-ai-in-product-design-2026.html",
  "/insights/saas-onboarding-patterns": "kriva-insight-saas-onboarding-patterns.html",
  "/insights/saas-mvp-uk-guide": "kriva-insight-saas-mvp-uk-guide.html",
  "/insights/no-code-vs-custom-mvp": "kriva-insight-no-code-vs-custom-mvp.html",
  "/insights/trucking-dispatch-crm-guide": "kriva-insight-trucking-dispatch-crm-guide.html",
  "/insights/crm-dashboard-ux-patterns": "kriva-insight-crm-dashboard-ux-patterns.html",
  "/insights/choosing-a-digital-agency": "kriva-insight-choosing-a-digital-agency.html",
  "/services/graphic-design": "kriva-service-graphic-design.html",
  "/services/seo-digital-marketing": "kriva-service-seo-digital-marketing.html",
};

/** Strip query strings and fragments before checking local asset paths. */
function assetPath(h) {
  return String(h).replace(/[?#].*$/, "");
}

const counts = {};
const srcs = {};
for (const f of htmls) {
  const t = fs.readFileSync(path.join(root, f), "utf8");
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(t))) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(h)) continue;
    counts[h] = (counts[h] || 0) + 1;
    (srcs[h] = srcs[h] || new Set()).add(f);
  }
}

function resolves(h) {
  const clean = assetPath(h);
  if (clean.startsWith("shared/") || clean.startsWith("./shared/") || clean.startsWith("/shared/")) {
    return fs.existsSync(path.join(root, clean.replace(/^\.\//, "").replace(/^\//, "")));
  }
  if (clean.endsWith(".html")) {
    return fs.existsSync(path.join(root, path.basename(clean)));
  }
  if (FILE_MAP[clean] && fs.existsSync(path.join(root, FILE_MAP[clean]))) return true;
  if (clean.startsWith("/services/")) {
    const slug = clean.split("/").pop();
    return fs.existsSync(path.join(root, `kriva-service-${slug}.html`));
  }
  if (clean.startsWith("/brand/") || clean.startsWith("/media/")) {
    return fs.existsSync(path.join(root, clean.slice(1)));
  }
  // root-level static assets (favicon, manifest, icons, robots, sitemap)
  if (/^\/[^/]+\.[a-z0-9]+$/i.test(clean)) {
    return fs.existsSync(path.join(root, clean.slice(1)));
  }
  return false;
}

const missing = Object.entries(counts)
  .filter(([h]) => !resolves(h))
  .sort((a, b) => a[0].localeCompare(b[0]));

if (require.main === module) {
  console.log("html", htmls.length, "hrefs", Object.keys(counts).length, "missing", missing.length);
  for (const [h, c] of missing) {
    console.log(String(c).padStart(4), h, "<-", [...srcs[h]].slice(0, 8).join(", "));
  }
}

module.exports = { FILE_MAP, counts, missing, htmls, resolves, assetPath };
