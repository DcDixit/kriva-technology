/**
 * Phase 11 — enrich case data (BA headlines, outcome framing). No invented metrics.
 * Run: node phase11_enrich_cases.cjs && node build_priority5.cjs
 */
const fs = require("fs");
const path = require("path");
const data = require("./content/cases-data.cjs");

const BA_H2 = {
  "payroll-pro-saas": "Empty states after SSO — then role-based setup.",
  "finance-sync-hub": "Opaque logs — then reconciliation operators can act on.",
  "healthtrack-mobile": "Fragmented care tasks — then a patient flow that holds.",
  "brandlift-ecommerce": "Inconsistent storefront — then a system the brand can run.",
  "crm-pulse-dashboard": "Forecast noise — then leadership views people open.",
  "ai-support-automation": "Ticket piles — then routed work with human gates.",
  "marketplace-mvp": "Wishlist features — then an MVP that proves demand.",
};

const OUTCOME_H2 = {
  "payroll-pro-saas": "What shipped for activation.",
  "finance-sync-hub": "What shipped for month-end trust.",
  "healthtrack-mobile": "What shipped for patients.",
  "brandlift-ecommerce": "What shipped for the brand system.",
  "crm-pulse-dashboard": "What shipped for sales leadership.",
  "ai-support-automation": "What shipped for support ops.",
  "marketplace-mvp": "What shipped to validate the market.",
};

for (const c of data.cases) {
  c.baH2 = BA_H2[c.slug] || "Before the rebuild. After the rebuild.";
  c.outcomeH2 = OUTCOME_H2[c.slug] || "What shipped.";
  c.outcomeNote =
    "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.";
  // Drop public TBD testimonials — keep quote out until attribution confirmed
  if (c.testimonial && /TBD|do not publish/i.test(c.testimonial.name + c.testimonial.role)) {
    c.testimonialPublic = false;
  } else {
    c.testimonialPublic = !!c.testimonial;
  }
}

const header = `/**
 * Verified case-study content from web/src/content/portfolio.ts (+ redesign IA).
 * Metrics rails are withheld for non-FleetFlow cases per KRIVA-HANDOFF /
 * REFERENCE-ADDENDUM (only FleetFlow has signed-off published metrics).
 * Source narrative fields are retained; outcome numeric claims are not rendered.
 * Phase 11: unique before/after H2s, honest outcome framing, no public TBD quotes.
 */
`;

fs.writeFileSync(
  path.join(__dirname, "content/cases-data.cjs"),
  header + "module.exports = " + JSON.stringify(data, null, 2) + ";\n",
  "utf8"
);
console.log("Enriched", data.cases.length, "cases");
