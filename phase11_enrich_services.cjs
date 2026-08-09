/**
 * Phase 11 — enrich service data for 9.5+ quality without inventing claims.
 * Run: node phase11_enrich_services.cjs
 * Then: node build_priority6.cjs
 */
const fs = require("fs");
const path = require("path");
const data = require("./content/services-data.cjs");

/** Outcome-led H1s (buyer language). SEO keywords stay in <title>/meta. */
const H1 = {
  "crm-development": "A CRM the floor will trust.",
  "dashboard-design": "Dashboards that answer the shift question first.",
  "api-integrations": "Integrations that fail where operators can see them.",
  "mobile-applications": "Mobile UX built for interrupted attention.",
  "saas-platforms": "SaaS UX that activates after signup.",
  "automation-systems": "Automate the queue. Keep humans on the send.",
  "ai-assisted-development": "AI in the toolchain. Humans on the gate.",
  "web-development": "Marketing sites your team can actually run.",
  "no-code-low-code": "Validate the MVP before months of custom build.",
  "product-design": "End-to-end product design — strategy to ship.",
  "ui-ux-design": "Flows, systems, and UI teams can hand off.",
  "branding": "Brand systems that survive real product surfaces.",
  "ux-research": "Evidence before the expensive build.",
  "wireframing-prototyping": "Align the room before you write code.",
  "design-systems": "Tokens and components that survive releases.",
  "web-application-design": "Authenticated product UX — not a marketing site.",
  "logo-design": "Marks that scale from favicon to fleet.",
};

const CHALLENGES_H2 = {
  "crm-development": "When the CRM becomes a spreadsheet again",
  "dashboard-design": "When the dashboard becomes another export",
  "api-integrations": "When sync drift shows up at month-end",
  "mobile-applications": "When mobile is just a shrunk desktop",
  "saas-platforms": "When tenants and admins fight the same UI",
  "automation-systems": "When the same steps burn every shift",
  "ai-assisted-development": "When AI speed creates craft debt",
  "web-development": "When the site can't keep up with marketing",
  "no-code-low-code": "When custom build is premature",
  "product-design": "When screens ship without a product story",
  "ui-ux-design": "When interfaces look finished but feel stuck",
  "branding": "When brand lives only in a PDF",
  "ux-research": "When opinions replace evidence",
  "wireframing-prototyping": "When engineering starts from a verbal brief",
  "design-systems": "When every feature invents its own UI",
  "web-application-design": "When the app UX is treated like a brochure",
  "logo-design": "When the mark breaks the moment it scales",
};

const DELIVERABLES_H2 = {
  "crm-development": "What lands on the ops desk",
  "dashboard-design": "What operators open every morning",
  "api-integrations": "What engineering and finance can own",
  "mobile-applications": "What ships to the stores",
  "saas-platforms": "What your roadmap can reuse",
  "automation-systems": "What runs without babysitting",
  "ai-assisted-development": "What your team keeps after we leave",
  "web-development": "What marketing can update next week",
  "no-code-low-code": "What you can learn from in weeks",
  "product-design": "What the product team leaves with",
  "ui-ux-design": "What design and engineering share",
  "branding": "What the brand system includes",
  "ux-research": "What decisions get evidence",
  "wireframing-prototyping": "What stakeholders can click",
  "design-systems": "What the design system ships",
  "web-application-design": "What authenticated users navigate",
  "logo-design": "What you get beyond a single PNG",
};

const OUTCOMES_H2 = {
  "crm-development": "What changes on the floor",
  "dashboard-design": "What changes in the morning scan",
  "api-integrations": "What changes when systems disagree",
  "mobile-applications": "What changes in the hand",
  "saas-platforms": "What changes after signup",
  "automation-systems": "What changes in the queue",
  "ai-assisted-development": "What changes in delivery",
  "web-development": "What changes on the public site",
  "no-code-low-code": "What changes before you commit",
  "product-design": "What changes in the product story",
  "ui-ux-design": "What changes in the interface",
  "branding": "What changes in brand consistency",
  "ux-research": "What changes before build",
  "wireframing-prototyping": "What changes in alignment",
  "design-systems": "What changes across releases",
  "web-application-design": "What changes inside the product",
  "logo-design": "What changes in recognition",
};

/** Short titles for challenge cards (body keeps source challenge text). */
function challengeTitle(text) {
  const map = {
    "Sales team doesn't trust pipeline data": "Pipeline distrust",
    "Reports take manual exports and spreadsheet work": "Export dependency",
    "CRM UI doesn't match how you actually sell": "UI / process mismatch",
    "Metrics are available but hard to scan quickly": "Scan failure",
    "Dashboards become cluttered as requests accumulate": "Widget sprawl",
    "Teams export to spreadsheets because UI isn't trusted": "Spreadsheet workaround",
    "Integrations break silently and data drifts": "Silent drift",
    "Teams manually reconcile between systems": "Manual reconciliation",
    "No visibility when sync jobs fail": "Blind failures",
    "Mobile UX copied from desktop and feels cramped": "Desktop shrink",
    "Onboarding doesn't explain value quickly": "Slow time-to-value",
    "App store assets and flows aren't conversion-tuned": "Store friction",
    "Admin and customer UX diverge over time": "Surface divergence",
    "Permission models confuse new users": "Permission fog",
    "Hard to ship UI improvements without breaking tenants": "Tenant risk",
    "Teams repeat the same manual steps daily": "Repeatable toil",
    "Leads and data fall through cracks between tools": "Tool gaps",
    "No one owns workflow maintenance": "Orphaned workflows",
    "Delivery timelines slip despite growing teams": "Timeline slip",
    "Quality inconsistent across designers and developers": "Craft inconsistency",
    "Unsure how to use AI without compromising craft": "AI without gates",
    "Site feels slow or dated compared to competitors": "Dated presence",
    "Marketing team can't update content without developers": "CMS bottleneck",
    "Poor mobile experience hurts conversions": "Mobile conversion loss",
  };
  if (map[text]) return map[text];
  // Fallback: first clause, max ~5 words, no ellipsis clone of body
  const clean = text.replace(/\.$/, "");
  const words = clean.split(/\s+/);
  if (words.length <= 5) return clean;
  return words.slice(0, 4).join(" ");
}

for (const s of data.services) {
  if (H1[s.slug]) {
    s.h1Display = H1[s.slug]; // visible H1
    // Keep catalog name for crumbs/FAQ "About X" via serviceLabel
    s.serviceLabel = s.h1; // original short name
  } else {
    s.h1Display = s.h1;
    s.serviceLabel = s.h1;
  }
  s.challengesH2 = CHALLENGES_H2[s.slug] || "Problems we help solve";
  s.deliverablesH2 = DELIVERABLES_H2[s.slug] || "What you leave with";
  s.outcomesH2 = OUTCOMES_H2[s.slug] || "What you gain";
  s.challenges = s.challenges.map((c) => {
    if (typeof c === "object" && c.title && c.body) return c;
    const body = String(c);
    return { title: challengeTitle(body), body };
  });
  // Intentional visual: no empty screenshot frame until asset exists
  s.visualMode = "brief"; // brief board instead of empty hero slot
}

const out = `/**
 * Phase 9/11 — all 17 standalone services.
 * Factual fields from web/src/content/services.ts.
 * Positioning / differentiation copy is editorial framing of those fields — not new claims.
 * Phase 11: outcome H1s, challenge title/body pairs, section H2 variance, brief visuals.
 */
module.exports = ${JSON.stringify({ deferred: data.deferred, services: data.services }, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, "content/services-data.cjs"), out, "utf8");
console.log("Enriched", data.services.length, "services → content/services-data.cjs");
