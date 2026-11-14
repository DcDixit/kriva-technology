#!/usr/bin/env node
/** Apply canonical KRIVA chrome (header mega menu + footer) to all redesign HTML pages. */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const {
  CONTACT_EMAIL,
  CTA_PRIMARY_LABEL,
  CTA_PRIMARY_COMPACT_LABEL,
  CTA_SECONDARY_LABEL,
  CTA_BOOK_HREF,
  CTA_BRIEF_HREF,
} = require("./shared/studio");

const PAGE_CURRENT = {
  "404.html": null,
  "kriva-market-au.html": null,
  "kriva-insight-build-vs-buy-tms.html": null,
  "kriva-insight-dispatch-software-cost.html": null,
  "kriva-insight-quickbooks-xero-integration-guide.html": null,
  "kriva-pricing.html": "pricing",
  "kriva-solution-trucking-websites.html": "trucking",
  "kriva-solution-moving-websites.html": "trucking",
  "kriva-insight-trucking-website-cost.html": null,
  "kriva-insight-moving-website-features.html": null,
  "kriva-solution-freight-broker.html": "trucking",
  "kriva-solution-fleet-management.html": "trucking",
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
  "kriva-markets-index.html": null,
  "kriva-market-us.html": null,
  "kriva-market-uk.html": null,
  "kriva-market-uae.html": null,
  "kriva-market-ca.html": null,
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
  "kriva-process.html": "process",
  "kriva-insights-index.html": "insights",
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

const CSS_LINK = '<link rel="stylesheet" href="/shared/chrome.css?v=brand1">\n<link rel="stylesheet" href="/shared/kds.css?v=brand1">';
const JS_TAG = [
  '<script src="/shared/chrome.js" defer></script>',
  '<!-- KRIVA_GA_START -->',
  '<link rel="preconnect" href="https://www.googletagmanager.com">',
  '<link rel="dns-prefetch" href="https://www.google-analytics.com">',
  '<script>',
  'window.dataLayer=window.dataLayer||[];',
  'function gtag(){dataLayer.push(arguments);}window.gtag=gtag;',
  'window.__krivaNativeReplaceState=History.prototype.replaceState;',
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:(navigator.globalPrivacyControl===true?'denied':'granted'),functionality_storage:'granted',security_storage:'granted'});",
  '(function(){',
  "var id='G-FHG12KTF8C';",
  "var debug=/(?:^|[?&])ga_debug=1(?:&|$)/.test(location.search);",
  'var gpc=navigator.globalPrivacyControl===true;',
  'var host=location.hostname;',
  "var local=host==='localhost'||host==='127.0.0.1'||/\\.vercel\\.app$/.test(host);",
  "var optedOut=!!window['ga-disable-'+id]||gpc;",
  "gtag('js',new Date());",
  "if(optedOut)gtag('consent','update',{analytics_storage:'denied'});",
  'if(optedOut||(local&&!debug))return;',
  "var cfg={allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:true,cookie_flags:'SameSite=Lax;Secure',page_location:location.origin+location.pathname+location.search};",
  'if(debug)cfg.debug_mode=true;',
  "gtag('config',id,cfg);",
  '})();',
  '</script>',
  '<script async src="https://www.googletagmanager.com/gtag/js?id=G-FHG12KTF8C"></script>',
  '<script src="/shared/analytics.js" defer></script>',
  '<!-- KRIVA_GA_END -->',
  '<!-- KRIVA_CLARITY_START -->',
  '<script type="text/javascript">',
  '    (function(c,l,a,r,i,t,y){if(navigator.globalPrivacyControl===true)return;var h=location.hostname;if(h===\'localhost\'||h===\'127.0.0.1\'||/\\.vercel\\.app$/.test(h))return;',
  '        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};',
  '        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;',
  '        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);',
  '    })(window, document, "clarity", "script", "yjj9g3gojt");',
  '</script>',
  '<!-- KRIVA_CLARITY_END -->',
].join('\n');

function cur(key, name) {
  return key === name ? ' aria-current="page"' : "";
}
function active(key, name) {
  return key === name ? " is-active" : "";
}

/** Desktop megas: Trucking · SaaS · Integration · Operations · Services · Work · About */
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
  const group = { trucking: "solutions", saas: "solutions", integration: "solutions", operations: "services", services: "services", pricing: "pricing" }[current] || current;
  const on = (k) => (group === k || (k === "services" && opts.servicesCurrent) ? " is-current" : "");
  const cu = (k) => (group === k ? ' aria-current="page"' : "");
  return `<header class="nav" id="nav"${persist}>
  <div class="nav-shell">
    <div class="wrap nav-in">
      <a href="/" class="mark" aria-label="KRIVA Technologies home">
        <img class="mark-logo" src="/brand/logos/kriva-lockup.svg" alt="KRIVA Technologies" width="162" height="42">
      </a>
      <div class="nav-primary">
        <nav aria-label="Primary">
          <ul class="nav-links">
            <li class="nav-item${on("solutions")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-solutions" aria-haspopup="true">Solutions<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm mm--wide" id="mm-solutions">
                <div class="mm-col">
                  <p class="mm-label">Trucking and transportation</p>
                  <ul class="mm-list">
                    <li><a href="/solutions/trucking-logistics"><strong>Trucking software</strong><em>Dispatch CRM and TMS for carriers.</em></a></li>
                    <li><a href="/solutions/trucking-company-websites"><strong>Trucking company websites</strong><em>Quote and recruiting sites for carriers.</em></a></li>
                    <li><a href="/solutions/moving-company-websites"><strong>Moving company websites</strong><em>Quote-first sites for movers.</em></a></li>
                    <li><a href="/solutions/freight-broker-software"><strong>Freight broker software</strong><em>Quotes, carrier sales, and load tracking.</em></a></li>
                    <li><a href="/solutions/fleet-management-software"><strong>Fleet management software</strong><em>Dashboards, driver apps, and records.</em></a></li>
                    <li><a href="/solutions/car-transportation"><strong>Auto transport software</strong><em>Quote-to-delivery for brokers and carriers.</em></a></li>
                  </ul>
                </div>
                <div class="mm-col">
                  <p class="mm-label">SaaS and finance</p>
                  <ul class="mm-list">
                    <li><a href="/solutions/saas"><strong>SaaS product development</strong><em>MVPs, onboarding, and admin panels.</em></a></li>
                    <li><a href="/solutions/accounting-integrations"><strong>QuickBooks and Xero integrations</strong><em>Sync and reconciliation finance can trust.</em></a></li>
                  </ul>
                  <a class="mm-all" href="/solutions">All solutions <i>→</i></a>
                </div>
              </div>
            </li>
            <li class="nav-item${on("services")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-services" aria-haspopup="true">Services<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm mm--wide" id="mm-services">
                <div class="mm-col">
                  <p class="mm-label">Build</p>
                  <ul class="mm-list">
                    <li><a href="/services/crm-development"><strong>Custom CRM development</strong></a></li>
                    <li><a href="/services/saas-platforms"><strong>SaaS platforms</strong></a></li>
                    <li><a href="/services/mobile-applications"><strong>Mobile app development</strong></a></li>
                    <li><a href="/services/web-development"><strong>Web development</strong></a></li>
                    <li><a href="/services/api-integrations"><strong>API integrations</strong></a></li>
                    <li><a href="/services/automation-systems"><strong>Workflow automation</strong></a></li>
                  </ul>
                </div>
                <div class="mm-col">
                  <p class="mm-label">Design</p>
                  <ul class="mm-list">
                    <li><a href="/services/product-design"><strong>Product design</strong></a></li>
                    <li><a href="/services/ui-ux-design"><strong>UI/UX design</strong></a></li>
                    <li><a href="/services/dashboard-design"><strong>Business dashboards</strong></a></li>
                    <li><a href="/services/branding"><strong>Branding and graphic design</strong></a></li>
                  </ul>
                  <a class="mm-all" href="/services">All services <i>→</i></a>
                </div>
              </div>
            </li>
            <li><a class="nav-link${on("work")}" href="/work"${cu("work")}>Work</a></li>
            <li><a class="nav-link${on("process")}" href="/process"${cu("process")}>Process</a></li>
            <li><a class="nav-link${on("about")}" href="/about"${cu("about")}>About</a></li>
            <li><a class="nav-link${on("insights")}" href="/insights"${cu("insights")}>Insights</a></li>
            <li><a class="nav-link${on("pricing")}" href="/pricing"${cu("pricing")}>Pricing</a></li>
          </ul>
        </nav>
      </div>
      <div class="nav-cta">
        <a href="${CTA_BOOK_HREF}" class="btn sm"><span class="nav-cta-long">${CTA_PRIMARY_LABEL}</span><span class="nav-cta-short">Book a call</span></a>
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
        <li><a href="/solutions/trucking-logistics"><strong>Trucking software</strong><span>Dispatch CRM and TMS</span></a></li>
        <li><a href="/solutions/trucking-company-websites"><strong>Trucking company websites</strong><span>Quote and recruiting sites</span></a></li>
        <li><a href="/solutions/moving-company-websites"><strong>Moving company websites</strong><span>Quote-first mover sites</span></a></li>
        <li><a href="/solutions/freight-broker-software"><strong>Freight broker software</strong><span>Quotes and carrier sales</span></a></li>
        <li><a href="/solutions/fleet-management-software"><strong>Fleet management software</strong><span>Dashboards and driver apps</span></a></li>
        <li><a href="/solutions/car-transportation"><strong>Auto transport software</strong><span>Quote to delivery</span></a></li>
        <li><a href="/solutions/saas"><strong>SaaS product development</strong><span>MVPs and onboarding</span></a></li>
        <li><a href="/solutions/accounting-integrations"><strong>QuickBooks and Xero</strong><span>Sync and reconciliation</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-services">Services<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-services">
        <li><a href="/services/crm-development"><strong>Custom CRM development</strong><span>Consoles and pipelines</span></a></li>
        <li><a href="/services/saas-platforms"><strong>SaaS platforms</strong><span>Multi-tenant products</span></a></li>
        <li><a href="/services/mobile-applications"><strong>Mobile app development</strong><span>Driver and field apps</span></a></li>
        <li><a href="/services/api-integrations"><strong>API integrations</strong><span>Connectors and retries</span></a></li>
        <li><a href="/services/automation-systems"><strong>Workflow automation</strong><span>Human-gated workflows</span></a></li>
        <li><a href="/services/dashboard-design"><strong>Business dashboards</strong><span>Ops and KPI views</span></a></li>
        <li><a href="/services/product-design"><strong>Product and UI/UX design</strong><span>Research to launch-ready UI</span></a></li>
        <li><a href="/services"><strong>All services</strong><span>Full capability list</span></a></li>
      </ul>
    </div>
    <div class="sheet-item"><a class="big" href="/work">Work</a></div>
    <div class="sheet-item"><a class="big" href="/process">Process</a></div>
    <div class="sheet-item"><a class="big" href="/about">About</a></div>
    <div class="sheet-item"><a class="big" href="/insights">Insights</a></div>
    <div class="sheet-item"><a class="big" href="/pricing">Pricing</a></div>
    <div class="sheet-item"><a class="big" href="/faq">FAQ</a></div>
    <div class="sheet-cta">
      <a href="${CTA_BOOK_HREF}" class="btn on-dark"><span>${CTA_PRIMARY_LABEL}</span><i>→</i></a>
      <a href="${CTA_BRIEF_HREF}" class="btn ghost on-dark"><span>${CTA_SECONDARY_LABEL}</span><i>→</i></a>
    </div>
  </div>
  <div class="sheet-foot">
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
    <span>Ahmedabad, India · Working with US, UK, Australian, and UAE teams</span>
  </div>
</div>`;
}

const FOOTER_HTML = `<footer>
  <div class="wrap">
    <div class="fcta">
      <div>
        <p class="fcta-h">Not sure where to start? Show us the spreadsheet your team works around.</p>
        <p class="fcta-p">Free, 20 minutes, no pitch deck. We reply within one business day.</p>
      </div>
      <div class="fcta-a">
        <a class="btn on-dark" href="${CTA_BOOK_HREF}"><span>${CTA_PRIMARY_LABEL}</span><i>→</i></a>
        <a class="btn ghost on-dark" href="${CTA_BRIEF_HREF}"><span>${CTA_SECONDARY_LABEL}</span><i>→</i></a>
      </div>
    </div>
    <div class="fgrid">
      <div class="fbrand">
        <h3>Get in touch</h3>
        <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
        <p class="f-blurb">Websites and custom software for US trucking, moving, and logistics companies, plus SaaS and accounting integrations. Designed and built in Ahmedabad, India.</p>
        <div class="fsocial"><a href="https://www.instagram.com/kriva_technology/" rel="noopener noreferrer" target="_blank">Instagram</a></div>
      </div>
      <nav aria-label="Solutions"><h3>Solutions</h3><ul>
        <li><a href="/solutions/trucking-logistics">Trucking software</a></li>
        <li><a href="/solutions/trucking-company-websites">Trucking company websites</a></li>
        <li><a href="/solutions/moving-company-websites">Moving company websites</a></li>
        <li><a href="/solutions/freight-broker-software">Freight broker software</a></li>
        <li><a href="/solutions/fleet-management-software">Fleet management software</a></li>
        <li><a href="/solutions/car-transportation">Auto transport software</a></li>
        <li><a href="/solutions/saas">SaaS product development</a></li>
        <li><a href="/solutions/accounting-integrations">QuickBooks and Xero integrations</a></li></ul></nav>
      <nav aria-label="Services"><h3>Services</h3><ul>
        <li><a href="/services/crm-development">Custom CRM development</a></li>
        <li><a href="/services/mobile-applications">Mobile app development</a></li>
        <li><a href="/services/api-integrations">API integrations</a></li>
        <li><a href="/services/automation-systems">Workflow automation</a></li>
        <li><a href="/services/dashboard-design">Business dashboards</a></li>
        <li><a href="/services/product-design">Product design</a></li>
        <li><a href="/services">All services</a></li></ul></nav>
      <nav aria-label="Company"><h3>Company</h3><ul>
        <li><a href="/work">Work</a></li>
        <li><a href="/process">Process</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/technologies">Technologies</a></li>
        <li><a href="/insights">Insights</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href="/careers">Careers</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/contact">Contact</a></li></ul></nav>
      <nav aria-label="Markets"><h3>Markets</h3><ul>
        <li><a href="/markets/us">United States</a></li>
        <li><a href="/markets/uk">United Kingdom</a></li>
        <li><a href="/markets/au">Australia</a></li>
        <li><a href="/markets/uae">United Arab Emirates</a></li>
        <li><a href="/markets/ca">Canada</a></li>
        <li><a href="/industries">Industries</a></li></ul></nav>
    </div>
    <p class="fmark" aria-hidden="true"><img src="/brand/logos/kriva-lockup-inverse.svg" alt="" width="560" height="145" loading="lazy"></p>
    <div class="fbase">
      <span>© 2026 KRIVA Technologies</span>
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
  html = html.replace(/\s*<link rel="stylesheet" href="\/?shared\/(?:chrome|kds)\.css(?:\?[^"]*)?">\s*/g, "\n");
  html = html.replace("</head>", `${CSS_LINK}\n</head>`);
  html = html.replace(/\s*<!-- KRIVA_GA_START -->[\s\S]*?<!-- KRIVA_GA_END -->\s*/g, "\n");
  html = html.replace(/\s*<!-- KRIVA_CLARITY_START -->[\s\S]*?<!-- KRIVA_CLARITY_END -->\s*/g, "\n");
  html = html.replace(/\s*<!-- KRIVA_TAWK_START -->[\s\S]*?<!-- KRIVA_TAWK_END -->\s*/g, "\n");
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
