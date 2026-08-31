const fs = require("fs");
const path = require("path");

const root = __dirname;
const FONT_PRELOAD =
  '<link rel="preload" href="/brand/fonts/bricolage-grotesque-latin-var.woff2" as="font" type="font/woff2" crossorigin>';

const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".html") && (f.startsWith("kriva-") || f === "404.html"));

const TITLE_DESC = {
  "kriva-about.html": {
    title: "About KRIVA · Product Studio for US, UK &amp; Australia Teams",
    desc: "KRIVA is a product studio serving US, UK, and Australia teams. Design and engineering for trucking software, B2B SaaS, dashboards, and financial integrations.",
  },
  "kriva-careers.html": {
    title: "Careers at KRIVA · Designers &amp; Engineers (Remote-first)",
    desc: "Open roles at KRIVA for designers, engineers, and automation specialists. Remote-first studio working with US, UK, and Australia client teams.",
  },
  "kriva-faq.html": {
    title: "FAQ · Working with KRIVA on SaaS &amp; Trucking Software",
    desc: "Answers on KRIVA services for SaaS and trucking teams in the US, UK, and Australia: timelines, pricing, process, ownership, and how a fit call works.",
  },
  "kriva-technologies.html": {
    title: "Tools &amp; Stack · Figma, Next.js, React &amp; APIs | KRIVA",
    desc: "The design and engineering stack KRIVA uses for SaaS and trucking products: Figma, Next.js, React, APIs, and AI tooling with senior human oversight.",
  },
  "kriva-privacy.html": {
    title: "Privacy Policy · How KRIVA Handles Your Data",
  },
  "kriva-terms.html": {
    title: "Terms &amp; Conditions · KRIVA Technologies",
  },
  "kriva-service-mobile-applications.html": {
    title: "Mobile App Design &amp; Development for Field and SaaS | KRIVA",
  },
  "kriva-service-crm-development.html": {
    desc: "KRIVA designs operational CRM, dispatch consoles, HubSpot and Salesforce workflows, and automation for US, UK, and Australia operations and SaaS teams.",
  },
  "kriva-service-saas-platforms.html": {
    desc: "Multi-tenant SaaS product design for US, UK, and Australia teams: admin and customer surfaces, role-based UX, shared design systems, and phased rollout.",
  },
  "kriva-service-api-integrations.html": {
    desc: "API integration services for SaaS and ops teams: idempotent connectors, exception handling, and operator resolution for QuickBooks, Xero, and platform APIs.",
  },
  "kriva-service-product-design.html": {
    desc: "Senior product design for SaaS and digital products: strategy, user journeys, prototyping, and launch-ready UI with engineering-ready handoff.",
  },
  "kriva-service-ux-research.html": {
    desc: "UX research and user testing: interviews, usability tests, and journey mapping to de-risk product decisions before design and development.",
  },
  "kriva-service-logo-design.html": {
    desc: "Logo design and mark systems: custom logos, icon sets, and brand marks that scale across digital, print, packaging, and social with usage guidelines.",
  },
  "kriva-services-index.html": {
    desc: "Product design, UI/UX, SaaS, dashboards, mobile, branding, SEO, and web: designed and engineered by one in-house KRIVA team from discovery through launch.",
  },
  "kriva-insights-index.html": {
    desc: "Practical articles on SaaS onboarding, trucking dispatch CRM, MVP choices, product delivery, and AI in product design for US, UK, and Australia teams.",
  },
  "kriva-solution-accounting.html": {
    desc: "QuickBooks Online and Xero API integrations with reconciliation automation, exception dashboards, and idempotent sync for US, UK, and Australia finance teams.",
  },
  "kriva-solution-car-transport.html": {
    desc: "Custom auto-transport software: booking portals, quote engines, carrier dispatch, tracking, driver apps, and integrations for brokers and carriers.",
  },
  "kriva-solution-trucking.html": {
    desc: "Dispatch CRM, fleet dashboards, driver apps, and logistics integrations for carriers, freight brokers, and trucking teams in the US, UK, and Australia.",
  },
  "kriva-case-ai-support.html": {
    desc: "SupportAI case study: a Make + Claude workflow that triages tickets, drafts replies, and keeps a human in the loop for oversight and quality.",
  },
  "kriva-case-finance-sync.html": {
    desc: "FinanceSync case study: QuickBooks and Xero reconciliation with automated sync, exception dashboards, and month-end close workflows for finance teams.",
  },
  "kriva-case-payroll-pro.html": {
    desc: "PayrollPro case study: progressive onboarding and permission clarity after SSO, aimed at better activation and less support friction.",
  },
  "kriva-insight-saas-onboarding-patterns.html": {
    desc: "Five B2B SaaS onboarding patterns that improve activation: progressive disclosure, role-based entry, checklists, SSO clarity, and time-to-value.",
  },
};

function attr(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

function applyHeadReplacements(html, file) {
  const spec = TITLE_DESC[file];
  if (!spec) return html;
  if (spec.title) {
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${spec.title}</title>`);
    html = html.replace(
      /(<meta property="og:title" content=")[^"]*(")/i,
      `$1${spec.title.replace(/\s*\|?\s*KRIVA\s*$/i, "").replace(/\s*·\s*KRIVA\s*$/i, "").trim()}$2`
    );
  }
  if (spec.desc) {
    html = html.replace(
      /(<meta name="description" content=")[^"]*(")/i,
      `$1${spec.desc}$2`
    );
    html = html.replace(
      /(<meta property="og:description" content=")[^"]*(")/i,
      `$1${spec.desc}$2`
    );
    html = html.replace(
      /(<meta name="twitter:description" content=")[^"]*(")/i,
      `$1${spec.desc}$2`
    );
  }
  return html;
}

function stripGoogleFonts(html) {
  const before = html;
  html = html.replace(
    /\n?<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g,
    "\n"
  );
  html = html.replace(
    /\n?<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g,
    "\n"
  );
  html = html.replace(
    /\n?<link rel="preload" as="style" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">\s*/g,
    "\n"
  );
  html = html.replace(
    /\n?<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">\s*/g,
    "\n"
  );
  return { html, changed: html !== before };
}

function ensureFontPreload(html) {
  if (/bricolage-grotesque-latin-var\.woff2/.test(html)) return html;
  if (/<link rel="stylesheet" href="\/shared\/tokens\.css[^"]*">/.test(html)) {
    return html.replace(
      /<link rel="stylesheet" href="\/shared\/tokens\.css[^"]*">/,
      (m) => `${m}\n${FONT_PRELOAD}`
    );
  }
  if (/<meta charset="utf-8">/.test(html)) {
    return html.replace(/<meta charset="utf-8">/, `<meta charset="utf-8">\n${FONT_PRELOAD}`);
  }
  return html;
}

function dedupeChromeCss(html) {
  return html.replace(
    /<link rel="stylesheet" href="\/shared\/chrome\.css\?v=[^"]+">\s*<link rel="stylesheet" href="\/shared\/chrome\.css">/g,
    (m) => m.replace(/\s*<link rel="stylesheet" href="\/shared\/chrome\.css">/, "")
  );
}

function ensureOgLocale(html) {
  if (/property="og:locale"/.test(html)) return html;
  if (/<meta property="og:type"/.test(html)) {
    return html.replace(
      /<meta property="og:type" content="([^"]*)">/,
      `<meta property="og:type" content="$1">\n<meta property="og:locale" content="en_US">`
    );
  }
  if (/<link rel="canonical"/.test(html)) {
    return html.replace(
      /(<link rel="canonical" href="[^"]*">)/,
      `$1\n<meta property="og:locale" content="en_US">`
    );
  }
  return html;
}

function ensureTwitterTitleDesc(html) {
  if (!/name="twitter:card"/.test(html)) return html;
  const ogTitle = attr(html, /<meta property="og:title" content="([^"]*)"/i);
  const pageTitle = attr(html, /<title>([^<]*)<\/title>/i);
  const ogDesc = attr(html, /<meta property="og:description" content="([^"]*)"/i);
  const metaDesc = attr(html, /<meta name="description" content="([^"]*)"/i);
  const title = ogTitle || pageTitle;
  const desc = ogDesc || metaDesc;
  if (!title) return html;

  if (!/name="twitter:title"/.test(html)) {
    html = html.replace(
      /<meta name="twitter:card" content="([^"]*)">/,
      `<meta name="twitter:card" content="$1">\n<meta name="twitter:title" content="${title}">`
    );
  }
  if (desc && !/name="twitter:description"/.test(html)) {
    html = html.replace(
      /<meta name="twitter:title" content="([^"]*)">/,
      `<meta name="twitter:title" content="$1">\n<meta name="twitter:description" content="${desc}">`
    );
  }
  return html;
}

function updateAreaServed(html) {
  html = html.replace(
    /"areaServed":\s*\["US",\s*"GB",\s*"IN"\]/g,
    '"areaServed": ["US", "GB", "AU", "IN"]'
  );
  html = html.replace(
    /"areaServed":\s*\["United States",\s*"United Kingdom"\]/g,
    '"areaServed": ["United States", "United Kingdom", "Australia"]'
  );
  html = html.replace(
    /"areaServed":\s*\["GB",\s*"US"\]/g,
    '"areaServed": ["US", "GB", "AU"]'
  );
  html = html.replace(
    /"areaServed":\s*"US"/g,
    '"areaServed": ["US", "GB", "AU"]'
  );
  return html;
}

function enrichArticleSchema(html) {
  // One-line insight Article JSON-LD
  html = html.replace(
    /\{"@context":"https:\/\/schema\.org","@type":"Article","headline":"([^"]+)","description":"([^"]+)","datePublished":"([^"]+)"/g,
    '{"@context":"https://schema.org","@type":"Article","headline":"$1","description":"$2","image":"https://krivatechnologies.com/brand/og-default.png","datePublished":"$3","dateModified":"$3"'
  );
  return html;
}

function removeLeftoverBrandingSchema(html, file) {
  if (file !== "kriva-service-seo-digital-marketing.html" && file !== "kriva-service-graphic-design.html") {
    return html;
  }
  const leftover = /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "Service",\s*"name": "Branding & Graphic Design"[\s\S]*?<\/script>\s*<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "FAQPage",[\s\S]*?<\/script>\s*/;
  return html.replace(leftover, "");
}

const leftoverBrandingFaq = `Design and engineering for US trucking ops and SaaS product teams. Ahmedabad, India · Remote-first · Global clients.`;
const newBlurb = `Design and engineering for trucking, SaaS, and finance teams in the US, UK, and Australia. Ahmedabad studio · Remote-first.`;

let summary = { files: 0, googleFonts: 0, chrome: 0, twitter: 0, locale: 0, schema: 0 };

for (const file of files) {
  let html = fs.readFileSync(path.join(root, file), "utf8");
  const orig = html;

  html = applyHeadReplacements(html, file);

  const gf = stripGoogleFonts(html);
  html = gf.html;
  if (gf.changed) summary.googleFonts++;

  html = ensureFontPreload(html);

  const beforeChrome = html;
  html = dedupeChromeCss(html);
  if (html !== beforeChrome) summary.chrome++;

  html = ensureOgLocale(html);
  html = ensureTwitterTitleDesc(html);
  html = updateAreaServed(html);
  html = enrichArticleSchema(html);
  html = removeLeftoverBrandingSchema(html, file);
  html = html.replaceAll(leftoverBrandingFaq, newBlurb);

  if (html !== orig) {
    fs.writeFileSync(path.join(root, file), html);
    summary.files++;
  }
}

console.log("Updated files:", summary.files);
console.log("Google Fonts stripped:", summary.googleFonts);
console.log("Duplicate chrome.css removed:", summary.chrome);
