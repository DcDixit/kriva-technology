#!/usr/bin/env node
/** Apply canonical KRIVA chrome (header mega menu + footer) to all redesign HTML pages. */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const { CONTACT_EMAIL } = require("./shared/studio");

const PAGE_CURRENT = {
  "kriva-redesign.html": null,
  "kriva-solution-trucking.html": "trucking",
  "kriva-solution-saas.html": "saas",
  "kriva-solution-accounting.html": "integration",
  "kriva-solution-car-transport.html": "trucking",
  "kriva-services-index.html": "services",
  "kriva-service-crm-development.html": "services",
  "kriva-service-dashboard-design.html": "services",
  "kriva-service-api-integrations.html": "integration",
  "kriva-service-mobile-applications.html": "services",
  "kriva-service-saas-platforms.html": "saas",
  "kriva-service-automation-systems.html": "operations",
  "kriva-service-ai-assisted-development.html": "operations",
  "kriva-service-web-development.html": "services",
  "kriva-service-no-code-low-code.html": "services",
  "kriva-service-product-design.html": "saas",
  "kriva-service-ui-ux-design.html": "saas",
  "kriva-service-branding.html": "services",
  "kriva-service-ux-research.html": "services",
  "kriva-service-wireframing-prototyping.html": "services",
  "kriva-service-design-systems.html": "saas",
  "kriva-service-web-application-design.html": "services",
  "kriva-service-logo-design.html": "services",
  "kriva-service-graphic-design.html": "services",
  "kriva-service-seo-digital-marketing.html": "services",
  "kriva-work-index.html": "work",
  "kriva-careers.html": null,
  "kriva-industries.html": null,
  "kriva-case-fleetflow.html": "work",
  "kriva-case-payroll-pro.html": "work",
  "kriva-case-finance-sync.html": "work",
  "kriva-case-healthtrack.html": "work",
  "kriva-case-brandlift.html": "work",
  "kriva-case-crm-pulse.html": "work",
  "kriva-case-ai-support.html": "work",
  "kriva-case-marketplace.html": "work",
  "kriva-contact.html": null,
  "kriva-solutions-index.html": "solutions",
  "kriva-about.html": "about",
  "kriva-process.html": "operations",
  "kriva-insights-index.html": null,
  "kriva-insight-saas-mvp-uk-guide.html": null,
  "kriva-insight-trucking-dispatch-crm-guide.html": null,
  "kriva-insight-ai-in-product-design-2026.html": null,
  "kriva-insight-saas-onboarding-patterns.html": null,
  "kriva-insight-no-code-vs-custom-mvp.html": null,
  "kriva-insight-crm-dashboard-ux-patterns.html": null,
  "kriva-insight-choosing-a-digital-agency.html": null,
  "kriva-faq.html": null,
  "kriva-technologies.html": null,
  "kriva-privacy.html": null,
  "kriva-terms.html": null,
};

const CSS_LINK = '<link rel="stylesheet" href="/shared/chrome.css">';
const JS_TAG = [
  '<script src="/shared/chrome.js" defer></script>',
  '<!-- KRIVA_GA_START -->',
  '<link rel="preconnect" href="https://www.googletagmanager.com">',
  '<link rel="dns-prefetch" href="https://www.google-analytics.com">',
  '<script src="/shared/analytics.js" defer></script>',
  '<!-- KRIVA_GA_END -->',
].join('\n');

function cur(key, name) {
  return key === name ? ' aria-current="page"' : "";
}
function active(key, name) {
  return key === name ? " is-active" : "";
}

/** Mega key for is-active; Services can also be current on service detail pages. */
function resolveNav(current, opts = {}) {
  const mega = ["trucking", "saas", "integration", "operations"].includes(current)
    ? current
    : null;
  const servicesCurrent =
    current === "services" || opts.servicesCurrent === true;
  return { mega, servicesCurrent, work: current === "work", about: current === "about" };
}

function headerHtml(current, opts = {}) {
  const persist = opts.persist ? " data-nav-persist" : "";
  const nav = resolveNav(current, opts);
  return `<header class="nav" id="nav"${persist}>
  <div class="nav-shell">
    <div class="wrap nav-in">
      <a href="/" class="mark" aria-label="KRIVA Technologies home">
        <img class="mark-logo" src="/brand/logos/kriva-wordmark.svg" alt="" width="136" height="26">
      </a>
      <div class="nav-primary">
        <nav aria-label="Primary">
          <ul class="nav-links">
            <li class="nav-item${active(nav.mega, "trucking")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-trucking" aria-haspopup="true">Trucking<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-trucking" role="menu">
                <div class="mm-head"><b>Trucking &amp; logistics</b><span>Ops software</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/solutions/trucking-logistics"><strong>Trucking &amp; logistics solutions</strong><em>Dispatch, fleet, drivers, and logistics platforms.</em></a></li>
                  <li><a role="menuitem" href="/services/crm-development"><strong>Dispatch CRM &amp; TMS</strong><em>Consoles, bulk actions, supervisor oversight.</em></a></li>
                  <li><a role="menuitem" href="/services/dashboard-design"><strong>Fleet dashboards</strong><em>Route performance and exception handling.</em></a></li>
                  <li><a role="menuitem" href="/services/mobile-applications"><strong>Driver mobile apps</strong><em>Load acceptance, status updates, documents.</em></a></li>
                  <li><a role="menuitem" href="/solutions/car-transportation"><strong>Car transportation</strong><em>Quotes, tracking, and auto-transport ops.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/solutions/trucking-logistics">All trucking solutions <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item${active(nav.mega, "saas")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-saas" aria-haspopup="true">SaaS<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-saas" role="menu">
                <div class="mm-head"><b>SaaS products</b><span>UK &amp; US</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/solutions/saas"><strong>SaaS product solutions</strong><em>Onboarding, dashboards, and MVPs that stick.</em></a></li>
                  <li><a role="menuitem" href="/services/saas-platforms"><strong>SaaS product design</strong><em>Multi-tenant UX, admin panels, permissions.</em></a></li>
                  <li><a role="menuitem" href="/services/dashboard-design"><strong>Dashboards &amp; admin panels</strong><em>Analytics and operational views for daily use.</em></a></li>
                  <li><a role="menuitem" href="/services/product-design"><strong>Product design &amp; UX</strong><em>Research, flows, prototypes, launch-ready UI.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/solutions/saas">All SaaS solutions <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item${active(nav.mega, "integration")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-integration" aria-haspopup="true">Integration<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-integration" role="menu">
                <div class="mm-head"><b>Integrations</b><span>Finance &amp; APIs</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/solutions/accounting-integrations"><strong>QuickBooks &amp; Xero</strong><em>Sync and reconciliation finance teams trust.</em></a></li>
                  <li><a role="menuitem" href="/services/api-integrations"><strong>Integrations &amp; APIs</strong><em>Reliable connectors with clear error handling.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/solutions/accounting-integrations">Explore integrations <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item${active(nav.mega, "operations")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-operations" aria-haspopup="true">Operations<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-operations" role="menu">
                <div class="mm-head"><b>Operations</b><span>Tooling &amp; delivery</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/services/crm-development"><strong>CRM &amp; ops consoles</strong><em>Pipelines and internal tools matched to real desks.</em></a></li>
                  <li><a role="menuitem" href="/services/automation-systems"><strong>Automation workflows</strong><em>Human-gated triage, docs, and internal tooling.</em></a></li>
                  <li><a role="menuitem" href="/process"><strong>How we work</strong><em>Discovery through launch: clear gates, weekly demos.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/process">See the process <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item${nav.servicesCurrent ? " is-active" : ""}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-services" aria-haspopup="true">Services<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-services" role="menu">
                <div class="mm-head"><b>Services</b><span>Capabilities</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/services/graphic-design"><strong>Graphic Design</strong><em>Identity, print, social, packaging, and marketing kits.</em></a></li>
                  <li><a role="menuitem" href="/services/seo-digital-marketing"><strong>SEO &amp; Digital Marketing</strong><em>Search, ads, social, and reporting you can audit.</em></a></li>
                  <li><a role="menuitem" href="/services/product-design"><strong>Product design &amp; UX</strong><em>Research, flows, prototypes, launch-ready UI.</em></a></li>
                  <li><a role="menuitem" href="/services/web-development"><strong>Web Design &amp; Development</strong><em>Sites and apps that convert as well as they rank.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/services">All services <i>→</i></a></div>
              </div>
            </li>
            <li><a class="nav-link" href="/work"${nav.work ? ' aria-current="page"' : ""}>Work</a></li>
            <li><a class="nav-link" href="/about"${nav.about ? ' aria-current="page"' : ""}>About</a></li>
          </ul>
        </nav>
      </div>
      <div class="nav-cta">
        <a href="/contact#book" class="btn sm"><span>Book a 20-minute fit call</span><i>→</i></a>
        <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </div>
</header>

<div class="sheet" id="sheet" hidden>
  <div class="sheet-nav">
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-trucking">Trucking<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-trucking">
        <li><a href="/solutions/trucking-logistics"><strong>Trucking &amp; logistics</strong><span>Dispatch, fleet, drivers</span></a></li>
        <li><a href="/services/crm-development"><strong>Dispatch CRM &amp; TMS</strong><span>Consoles &amp; supervisor tools</span></a></li>
        <li><a href="/services/dashboard-design"><strong>Fleet dashboards</strong><span>Routes &amp; exceptions</span></a></li>
        <li><a href="/services/mobile-applications"><strong>Driver mobile apps</strong><span>Status, docs, acceptance</span></a></li>
        <li><a href="/solutions/car-transportation"><strong>Car transportation</strong><span>Quotes &amp; tracking</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-saas">SaaS<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-saas">
        <li><a href="/solutions/saas"><strong>SaaS product solutions</strong><span>Onboarding &amp; MVPs</span></a></li>
        <li><a href="/services/saas-platforms"><strong>SaaS product design</strong><span>Multi-tenant UX</span></a></li>
        <li><a href="/services/dashboard-design"><strong>Dashboards &amp; admin</strong><span>Daily-use views</span></a></li>
        <li><a href="/services/product-design"><strong>Product design &amp; UX</strong><span>Flows to launch UI</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-integration">Integration<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-integration">
        <li><a href="/solutions/accounting-integrations"><strong>QuickBooks &amp; Xero</strong><span>Sync &amp; reconciliation</span></a></li>
        <li><a href="/services/api-integrations"><strong>Integrations &amp; APIs</strong><span>Connectors that hold</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-operations">Operations<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-operations">
        <li><a href="/services/crm-development"><strong>CRM &amp; ops consoles</strong><span>Desk-matched tooling</span></a></li>
        <li><a href="/services/automation-systems"><strong>Automation workflows</strong><span>Human-gated pipelines</span></a></li>
        <li><a href="/process"><strong>How we work</strong><span>Process &amp; delivery</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-services">Services<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-services">
        <li><a href="/services/graphic-design"><strong>Graphic Design</strong><span>Identity, print, social</span></a></li>
        <li><a href="/services/seo-digital-marketing"><strong>SEO &amp; Digital Marketing</strong><span>Search, ads, performance</span></a></li>
        <li><a href="/services"><strong>All services</strong><span>Full capability list</span></a></li>
      </ul>
    </div>
    <div class="sheet-item"><a class="big" href="/industries">Industries</a></div>
    <div class="sheet-item"><a class="big" href="/work">Work</a></div>
    <div class="sheet-item"><a class="big" href="/about">About</a></div>
    <div class="sheet-item"><a class="big" href="/insights">Insights</a></div>
    <div class="sheet-item"><a class="big" href="/faq">FAQ</a></div>
    <div class="sheet-item"><a class="big" href="/careers">Careers</a></div>
    <div class="sheet-cta">
      <a href="/contact#book" class="btn on-dark"><span>Book a 20-minute fit call</span><i>→</i></a>
      <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
    </div>
  </div>
  <div class="sheet-foot">
    <a href="/contact#brief">Send a project brief</a>
    <a href="/contact#book">Request a fit call</a>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
    <span>Ahmedabad, India · Remote-first</span>
  </div>
</div>`;
}

const FOOTER_HTML = `<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <h3>Get in touch</h3>
        <a href="/contact#brief">Send a project brief</a><br>
        <a href="/contact#book">Request a fit call</a><br>
        <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
        <p class="f-blurb">Design and engineering for US trucking ops and SaaS product teams. Ahmedabad, India · Remote-first · Global clients.</p>
        <div class="fsocial">
          <a href="https://www.linkedin.com/company/kriva-technologies" rel="noopener noreferrer" target="_blank">LinkedIn</a>
          <a href="https://dribbble.com/krivatechnologies" rel="noopener noreferrer" target="_blank">Dribbble</a>
          <a href="https://www.instagram.com/krivatechnologies" rel="noopener noreferrer" target="_blank">Instagram</a>
          <a href="https://x.com/krivatechnologies" rel="noopener noreferrer" target="_blank">X</a>
        </div>
      </div>
      <nav aria-label="Trucking and logistics"><h3>Trucking &amp; logistics</h3><ul>
        <li><a href="/solutions/trucking-logistics">Trucking &amp; logistics solutions</a></li>
        <li><a href="/services/crm-development">Dispatch CRM &amp; TMS</a></li>
        <li><a href="/services/dashboard-design">Fleet dashboards</a></li>
        <li><a href="/services/mobile-applications">Driver mobile apps</a></li>
        <li><a href="/solutions/car-transportation">Car transportation</a></li></ul></nav>
      <nav aria-label="SaaS and integrations"><h3>SaaS &amp; integrations</h3><ul>
        <li><a href="/solutions/saas">SaaS product solutions</a></li>
        <li><a href="/solutions/accounting-integrations">QuickBooks &amp; Xero</a></li>
        <li><a href="/services/saas-platforms">SaaS product design</a></li>
        <li><a href="/services/api-integrations">Integrations &amp; APIs</a></li>
        <li><a href="/services/automation-systems">Automation workflows</a></li></ul></nav>
      <nav aria-label="Company"><h3>Company</h3><ul>
        <li><a href="/solutions">Solutions</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/services/graphic-design">Graphic Design</a></li>
        <li><a href="/services/seo-digital-marketing">SEO &amp; Digital Marketing</a></li>
        <li><a href="/industries">Industries</a></li>
        <li><a href="/work">Work</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/process">Process</a></li>
        <li><a href="/technologies">Tools &amp; stack</a></li>
        <li><a href="/insights">Insights</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href="/careers">Careers</a></li>
        <li><a href="/contact">Contact</a></li></ul></nav>
    </div>
    <p class="fmark" aria-hidden="true"><img src="/brand/logos/kriva-lockup-inverse.svg" alt="" width="560" height="151"></p>
    <div class="fbase">
      <span>© 2026 Kriva Technologies</span>
      <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span>
    </div>
  </div>
</footer>
`;

function stripOldNavCss(html) {
  let text = html;
  text = text.replace(
    /\/\*[^*]*nav[^*]*\*\/\s*\.nav\{position:fixed[\s\S]*?(?=\n\/\*|\n\.hero|\n\.ph|\n\.crumbs|\n@media \(prefers-reduced-motion)/i,
    "/* nav/sheet/footer chrome → shared/chrome.css */\n"
  );
  text = text.replace(
    /\/\*\s*═══════════ FOOTER ═══════════\s*\*\/[\s\S]*?@media\(max-width:820px\)\{\.fgrid\{grid-template-columns:1fr 1fr\}\}/,
    "/* footer chrome → shared/chrome.css */\n"
  );
  text = text.replace(
    /\/\* build-note strip:[\s\S]*?\*\/\s*\.notice\{[\s\S]*?\}\s*\.notice \.wrap\{[\s\S]*?\}\s*/,
    ""
  );
  text = text.replace(/\.notice\{[^}]+\}\s*\.notice \.wrap\{[^}]+\}\s*/g, "");
  return text;
}

function ensureAssets(html) {
  // Collapse all chrome.css links to a single tag before </head>
  html = html.replace(/\s*<link rel="stylesheet" href="\/?shared\/chrome\.css">\s*/g, "\n");
  html = html.replace("</head>", `${CSS_LINK}\n</head>`);
  html = html.replace(/\s*<!-- KRIVA_GA_START -->[\s\S]*?<!-- KRIVA_GA_END -->\s*/g, "\n");
  html = html.replace(/\s*<script src="\/?shared\/chrome\.js" defer><\/script>\s*/g, "\n");
  const m = html.match(/<script(?![^>]*shared\/chrome\.js)/);
  if (m) {
    html = html.replace(m[0], `${JS_TAG}\n${m[0]}`);
  } else {
    html = html.replace("</body>", `${JS_TAG}\n</body>`);
  }
  return html;
}

function stripOldNavJs(html) {
  let text = html;
  text = text.replace(
    /\/\*\s*───────── nav:[\s\S]*?(?=\/\*\s*───────── HERO|\/\*\s*nav\s*\*\/|const con |\/\*\s*cases|\/\*\s*accordion|\/\*\s*form|\/\*\s*filter|\/\*\s*console|\/\*\s*machine|\/\*\s*chapters|\/\*\s*scroll)/,
    "/* nav chrome → shared/chrome.js */\n"
  );
  text = text.replace(
    /\/\*\s*nav\s*\*\/\s*const nav = document\.getElementById\('nav'\);[\s\S]*?sheet\.addEventListener\('click'[\s\S]*?\);\s*addEventListener\('keydown'[\s\S]*?\);\s*/,
    "/* nav chrome → shared/chrome.js */\n"
  );
  text = text.replace(
    /const nav = document\.getElementById\('nav'\);\s*let lastY = 0;[\s\S]*?addEventListener\('keydown', e=>\{ if\(e\.key === 'Escape'[\s\S]*?\}\);\s*/,
    "/* nav chrome → shared/chrome.js */\n"
  );
  text = text.replace(
    /const links = \[\.\.\.document\.querySelectorAll\('#navLinks a'\)\];[\s\S]*?targets\.forEach\(t=>secIO\.observe\(t\)\);\s*/,
    ""
  );
  return text;
}

function cleanChrome(html, current, opts = {}) {
  // Remove notices
  html = html.replace(/(?:<!--[^>]*?(?:[Dd]emo|[Dd]elete before)[^>]*-->\s*)?<div class="notice">[\s\S]*?<\/div>\s*/g, "");
  // Stray close after skip
  html = html.replace(/(<a class="skip"[^>]*>Skip to content<\/a>)\s*<\/div>\s*/g, "$1\n\n");
  // Drop all WhatsApp floats
  html = html.replace(/<a class="wa"[\s\S]*?<\/a>\s*/g, "");
  // Drop all footers
  html = html.replace(/<footer>[\s\S]*?<\/footer>\s*/g, "");
  // Replace header + anything until main/chapters with canonical chrome
  if (/<header class="nav"[\s\S]*?(?=<main\b|<nav class="chapters"|<!-- COMPONENT: chapter)/.test(html)) {
    html = html.replace(
      /<header class="nav"[\s\S]*?(?=<main\b|<nav class="chapters"|<!-- COMPONENT: chapter)/,
      headerHtml(current, opts) + "\n\n"
    );
  } else if (/<!--KRIVA_CHROME-->/.test(html)) {
    html = html.replace(/<!--KRIVA_CHROME-->/, headerHtml(current, opts));
  } else {
    return { html, error: "header/sheet block not found" };
  }
  // Insert footer before first script or before </body>
  if (/<!--KRIVA_FOOTER-->/.test(html)) {
    html = html.replace(/<!--KRIVA_FOOTER-->/, FOOTER_HTML);
  } else if (/<\/main>/i.test(html)) {
    html = html.replace(/<\/main>/i, `</main>\n\n${FOOTER_HTML}`);
  } else {
    return { html, error: "main/footer anchor not found" };
  }
  return { html, error: null };
}

function applyFile(name) {
  const file = path.join(ROOT, name);
  if (!fs.existsSync(file)) return `MISS ${name}`;
  const current = PAGE_CURRENT[name];
  let html = fs.readFileSync(file, "utf8");
  const opts = name === "kriva-contact.html" ? { persist: true } : {};
  // Service detail pages: keep domain mega active AND mark Services current
  if (/^kriva-service-/.test(name)) opts.servicesCurrent = true;

  html = stripOldNavCss(html);
  const cleaned = cleanChrome(html, current, opts);
  if (cleaned.error) return `FAIL ${name}: ${cleaned.error}`;
  html = cleaned.html;

  html = ensureAssets(html);
  html = stripOldNavJs(html);

  fs.writeFileSync(file, html, "utf8");
  return `OK   ${name} (current=${current}${opts.servicesCurrent ? "+services" : ""})`;
}

function main() {
  const results = Object.keys(PAGE_CURRENT).map(applyFile);
  console.log(results.join("\n"));
  return results.every((r) => r.startsWith("OK")) ? 0 : 1;
}

module.exports = { PAGE_CURRENT, CONTACT_EMAIL, headerHtml, FOOTER_HTML, applyFile, main };

if (require.main === module) {
  process.exit(main());
}
