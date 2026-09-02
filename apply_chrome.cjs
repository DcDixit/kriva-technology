#!/usr/bin/env node
/** Apply canonical KRIVA chrome (header mega menu + footer) to all redesign HTML pages. */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const { CONTACT_EMAIL } = require("./shared/studio");

const PAGE_CURRENT = {
  "kriva-redesign.html": null,
  "kriva-solution-trucking.html": "solutions",
  "kriva-solution-saas.html": "solutions",
  "kriva-solution-accounting.html": "solutions",
  "kriva-solution-car-transport.html": "solutions",
  "kriva-services-index.html": "services",
  "kriva-service-crm-development.html": "services",
  "kriva-service-dashboard-design.html": "services",
  "kriva-service-api-integrations.html": "services",
  "kriva-service-mobile-applications.html": "services",
  "kriva-service-saas-platforms.html": "services",
  "kriva-service-automation-systems.html": "services",
  "kriva-service-ai-assisted-development.html": "services",
  "kriva-service-web-development.html": "services",
  "kriva-service-no-code-low-code.html": "services",
  "kriva-service-product-design.html": "services",
  "kriva-service-ui-ux-design.html": "services",
  "kriva-service-branding.html": "services",
  "kriva-service-ux-research.html": "services",
  "kriva-service-wireframing-prototyping.html": "services",
  "kriva-service-design-systems.html": "services",
  "kriva-service-web-application-design.html": "services",
  "kriva-service-logo-design.html": "services",
  "kriva-service-graphic-design.html": "services",
  "kriva-service-seo-digital-marketing.html": "services",
  "kriva-work-index.html": "work",
  "kriva-careers.html": "company",
  "kriva-industries.html": "company",
  "kriva-case-fleetflow.html": "work",
  "kriva-case-payroll-pro.html": "work",
  "kriva-case-finance-sync.html": "work",
  "kriva-case-healthtrack.html": "work",
  "kriva-case-brandlift.html": "work",
  "kriva-case-crm-pulse.html": "work",
  "kriva-case-ai-support.html": "work",
  "kriva-case-marketplace.html": "work",
  "kriva-contact.html": "company",
  "kriva-solutions-index.html": "solutions",
  "kriva-about.html": "company",
  "kriva-process.html": "company",
  "kriva-insights-index.html": "company",
  "kriva-insight-saas-mvp-uk-guide.html": "company",
  "kriva-insight-trucking-dispatch-crm-guide.html": "company",
  "kriva-insight-ai-in-product-design-2026.html": "company",
  "kriva-insight-saas-onboarding-patterns.html": "company",
  "kriva-insight-no-code-vs-custom-mvp.html": "company",
  "kriva-insight-crm-dashboard-ux-patterns.html": "company",
  "kriva-insight-choosing-a-digital-agency.html": "company",
  "kriva-faq.html": "company",
  "kriva-technologies.html": "company",
  "kriva-privacy.html": null,
  "kriva-terms.html": null,
};

const CSS_LINK = '<link rel="stylesheet" href="/shared/chrome.css">';
const JS_TAG = [
  '<script src="/shared/chrome.js" defer></script>',
  '<!-- KRIVA_GA_START -->',
  '<link rel="preconnect" href="https://www.googletagmanager.com">',
  '<link rel="dns-prefetch" href="https://www.google-analytics.com">',
  '<script async src="https://www.googletagmanager.com/gtag/js?id=G-FHG12KTF8C"></script>',
  '<script src="/shared/analytics.js" defer></script>',
  '<!-- KRIVA_GA_END -->',
].join('\n');

function cur(key, name) {
  return key === name ? ' aria-current="page"' : "";
}
function active(key, name) {
  return key === name ? " is-active" : "";
}

/** Top-level nav: Solutions · Services · Work · Company */
function resolveNav(current, opts = {}) {
  return {
    solutions: current === "solutions" || opts.solutionsCurrent === true,
    services: current === "services" || opts.servicesCurrent === true,
    work: current === "work",
    company: current === "company" || opts.companyCurrent === true,
  };
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
            <li class="nav-item${nav.solutions ? " is-active" : ""}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-solutions" aria-haspopup="true">Solutions<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-solutions" role="menu">
                <div class="mm-head"><b>Solutions</b><span>By industry</span></div>
                <ul class="mm-list">
                  <li class="mm-sol-feat"><a role="menuitem" href="/solutions/trucking-logistics"><span class="mm-sol-kicker">Featured</span><strong>Trucking &amp; logistics</strong><em>Dispatch CRM, fleet dashboards, driver apps, and TMS workflows.</em><span class="mm-sol-go">Explore trucking <i>→</i></span></a></li>
                  <li><a role="menuitem" href="/solutions/saas"><strong>SaaS products</strong><em>Onboarding, admin panels, and MVPs built for daily use.</em></a></li>
                  <li><a role="menuitem" href="/solutions/car-transportation"><strong>Car transportation</strong><em>Quotes, tracking, and auto-transport operations.</em></a></li>
                  <li class="mm-sol-wide"><a role="menuitem" href="/solutions/accounting-integrations"><strong>Accounting &amp; finance</strong><em>QuickBooks, Xero sync, and reconciliation workflows.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/solutions">All solutions <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item${nav.services ? " is-active" : ""}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-services" aria-haspopup="true">Services<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-services" role="menu">
                <div class="mm-head"><b>Services</b><span>Capabilities</span></div>
                <ul class="mm-list">
                  <li class="mm-label" aria-hidden="true">Product &amp; UX</li>
                  <li><a role="menuitem" href="/services/ui-ux-design"><strong>UI/UX design</strong><em>Interfaces matched to real workflows.</em></a></li>
                  <li><a role="menuitem" href="/services/product-design"><strong>Product design</strong><em>Flows, prototypes, launch-ready UI.</em></a></li>
                  <li><a role="menuitem" href="/services/ux-research"><strong>UX research</strong><em>Interviews, testing, and evidence.</em></a></li>
                  <li><a role="menuitem" href="/services/wireframing-prototyping"><strong>Wireframing &amp; prototyping</strong><em>Clickable flows before build.</em></a></li>
                  <li><a role="menuitem" href="/services/design-systems"><strong>Design systems</strong><em>Tokens, components, documentation.</em></a></li>
                  <li><a role="menuitem" href="/services/dashboard-design"><strong>Dashboard design</strong><em>Operational views for daily use.</em></a></li>
                  <li class="mm-label" aria-hidden="true">Engineering</li>
                  <li><a role="menuitem" href="/services/web-development"><strong>Web development</strong><em>Sites and apps that convert.</em></a></li>
                  <li><a role="menuitem" href="/services/web-application-design"><strong>Web application development</strong><em>Custom apps and internal tools.</em></a></li>
                  <li><a role="menuitem" href="/services/saas-platforms"><strong>SaaS platforms</strong><em>Multi-tenant architecture and UX.</em></a></li>
                  <li><a role="menuitem" href="/services/mobile-applications"><strong>Mobile applications</strong><em>iOS, Android, and field apps.</em></a></li>
                  <li><a role="menuitem" href="/services/crm-development"><strong>CRM development</strong><em>Consoles matched to real desks.</em></a></li>
                  <li><a role="menuitem" href="/services/api-integrations"><strong>API integrations</strong><em>Reliable connectors with clear errors.</em></a></li>
                  <li class="mm-label" aria-hidden="true">Automation &amp; emerging tech</li>
                  <li><a role="menuitem" href="/services/automation-systems"><strong>Automation systems</strong><em>Human-gated workflows and tooling.</em></a></li>
                  <li><a role="menuitem" href="/services/ai-assisted-development"><strong>AI-assisted development</strong><em>Practical AI in product workflows.</em></a></li>
                  <li><a role="menuitem" href="/services/no-code-low-code"><strong>No-code / low-code</strong><em>Rapid validation and MVPs.</em></a></li>
                  <li class="mm-label" aria-hidden="true">Brand &amp; growth</li>
                  <li><a role="menuitem" href="/services/branding"><strong>Branding</strong><em>Identity systems and guidelines.</em></a></li>
                  <li><a role="menuitem" href="/services/logo-design"><strong>Logo design</strong><em>Marks built for product and print.</em></a></li>
                  <li><a role="menuitem" href="/services/graphic-design"><strong>Graphic design</strong><em>Marketing kits and collateral.</em></a></li>
                  <li><a role="menuitem" href="/services/seo-digital-marketing"><strong>SEO &amp; digital marketing</strong><em>Search, ads, and reporting.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/services">All services <i>→</i></a></div>
              </div>
            </li>
            <li><a class="nav-link" href="/work"${nav.work ? ' aria-current="page"' : ""}>Work</a></li>
            <li class="nav-item${nav.company ? " is-active" : ""}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-company" aria-haspopup="true">Company<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-company" role="menu">
                <div class="mm-head"><b>Company</b><span>About KRIVA</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/about"><strong>About</strong><em>Who we are and how we work.</em></a></li>
                  <li><a role="menuitem" href="/process"><strong>Process</strong><em>Discovery through launch with clear gates.</em></a></li>
                  <li><a role="menuitem" href="/technologies"><strong>Technologies</strong><em>Stack and tooling we use.</em></a></li>
                  <li><a role="menuitem" href="/industries"><strong>Industries</strong><em>Sectors we design and build for.</em></a></li>
                  <li><a role="menuitem" href="/insights"><strong>Insights</strong><em>Guides and articles from the studio.</em></a></li>
                  <li><a role="menuitem" href="/careers"><strong>Careers</strong><em>Join the in-house team.</em></a></li>
                  <li><a role="menuitem" href="/faq"><strong>FAQ</strong><em>Common questions answered.</em></a></li>
                  <li><a role="menuitem" href="/contact"><strong>Contact</strong><em>Book a call or send a brief.</em></a></li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </div>
      <div class="nav-cta">
        <a href="/contact#book" class="btn sm"><span>Book a discovery call</span><i>→</i></a>
        <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </div>
</header>

<div class="sheet" id="sheet" hidden>
  <div class="sheet-nav">
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-solutions">Solutions<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-solutions">
        <li><a href="/solutions/trucking-logistics"><strong>Trucking &amp; logistics</strong><span>Dispatch, fleet, drivers</span></a></li>
        <li><a href="/solutions/saas"><strong>SaaS products</strong><span>Onboarding &amp; MVPs</span></a></li>
        <li><a href="/solutions/car-transportation"><strong>Car transportation</strong><span>Quotes &amp; tracking</span></a></li>
        <li><a href="/solutions/accounting-integrations"><strong>Accounting &amp; finance</strong><span>QuickBooks &amp; Xero</span></a></li>
        <li><a href="/solutions" class="sheet-sol-all">All solutions <i>→</i></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-services">Services<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-services">
        <li><a href="/services/ui-ux-design"><strong>UI/UX design</strong><span>Product interfaces</span></a></li>
        <li><a href="/services/web-development"><strong>Web development</strong><span>Sites &amp; apps</span></a></li>
        <li><a href="/services/crm-development"><strong>CRM development</strong><span>Ops consoles</span></a></li>
        <li><a href="/services/saas-platforms"><strong>SaaS platforms</strong><span>Multi-tenant products</span></a></li>
        <li><a href="/services/automation-systems"><strong>Automation systems</strong><span>Workflows &amp; tooling</span></a></li>
        <li><a href="/services"><strong>All services</strong><span>Full capability list</span></a></li>
      </ul>
    </div>
    <div class="sheet-item"><a class="big" href="/work">Work</a></div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-company">Company<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-company">
        <li><a href="/about"><strong>About</strong><span>Who we are</span></a></li>
        <li><a href="/process"><strong>Process</strong><span>How we deliver</span></a></li>
        <li><a href="/technologies"><strong>Technologies</strong><span>Stack &amp; tools</span></a></li>
        <li><a href="/industries"><strong>Industries</strong><span>Sectors we serve</span></a></li>
        <li><a href="/insights"><strong>Insights</strong><span>Guides &amp; articles</span></a></li>
        <li><a href="/careers"><strong>Careers</strong><span>Join the team</span></a></li>
        <li><a href="/faq"><strong>FAQ</strong><span>Common questions</span></a></li>
        <li><a href="/contact"><strong>Contact</strong><span>Book or brief</span></a></li>
      </ul>
    </div>
    <div class="sheet-cta">
      <a href="/contact#book" class="btn on-dark"><span>Book a discovery call</span><i>→</i></a>
      <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
    </div>
  </div>
  <div class="sheet-foot">
    <a href="/contact#brief">Send a project brief</a>
    <a href="/contact#book">Request a discovery call</a>
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
  // Collapse all chrome.css links (versioned or not) to a single tag before </head>
  html = html.replace(/\s*<link rel="stylesheet" href="\/?shared\/chrome\.css(?:\?[^"]*)?">\s*/g, "\n");
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
  const opts = name === "kriva-contact.html" ? { persist: true, companyCurrent: true } : {};
  if (/^kriva-service-/.test(name)) opts.servicesCurrent = true;
  if (/^kriva-solution-/.test(name)) opts.solutionsCurrent = true;
  if (/^kriva-insight-/.test(name)) opts.companyCurrent = true;

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
