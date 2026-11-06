#!/usr/bin/env node
/* Site-wide content pass for the 2026-11 transformation. HTML is the source of truth; idempotent.
   - H1s say what the page is.  - One primary CTA wording.  - Filler eyebrows removed.
   - AI-looking photos replaced.  - Every commercial page gets an inquiry form that records its page. */
const fs = require("fs");

const H1 = {
  "kriva-solution-trucking.html": "Custom trucking software and TMS development for US carriers",
  "kriva-solution-saas.html": "SaaS product design and development, from MVP to daily use",
  "kriva-solution-accounting.html": "QuickBooks and Xero integrations your finance team can trust",
  "kriva-solution-car-transport.html": "Custom auto transport software, from quote to proof of delivery",
  "kriva-service-crm-development.html": "Custom dispatch CRM development",
  "kriva-service-dashboard-design.html": "Fleet and business dashboards that show the late load first",
  "kriva-service-mobile-applications.html": "Driver and field app development that works one-handed and offline",
  "kriva-service-api-integrations.html": "API integration services that hold after the first sync",
  "kriva-service-automation-systems.html": "Workflow automation for logistics and operations teams",
  "kriva-service-saas-platforms.html": "Multi-tenant SaaS platform design and development",
  "kriva-service-product-design.html": "Product design for logistics software and SaaS, mapped before code",
  "kriva-service-ui-ux-design.html": "UI/UX design for dispatch tools and SaaS products",
  "kriva-service-ux-research.html": "UX research: we watch dispatch work before redesigning it",
  "kriva-service-wireframing-prototyping.html": "Wireframes and prototypes you can walk through before anyone builds",
  "kriva-service-design-systems.html": "Design systems for the dispatch desk, driver app, and customer portal",
  "kriva-service-web-application-design.html": "Web application design for carrier portals and load boards",
  "kriva-service-web-development.html": "Web development for trucking and logistics companies",
  "kriva-service-ai-assisted-development.html": "AI-assisted software development: AI drafts, people sign off",
  "kriva-service-no-code-low-code.html": "No-code internal tools and MVPs that replace the spreadsheet first",
  "kriva-service-logo-design.html": "Logo design for logistics and SaaS brands",
  "kriva-service-graphic-design.html": "Graphic design for logistics and software teams",
  "kriva-service-seo-digital-marketing.html": "SEO for trucking and software companies",
  "kriva-services-index.html": "Software design and engineering for trucking, SaaS, and finance",
  "kriva-work-index.html": "Case studies: dispatch consoles, SaaS products, and integrations",
  "kriva-contact.html": "Book a fit call or send a project brief",
  "kriva-faq.html": "Questions buyers ask before booking a call",
  "kriva-process.html": "How we work: five phases, with your sign-off at each one",
  "kriva-technologies.html": "The technology we use to build your software",
  "kriva-market-us.html": "Custom trucking and SaaS software for US companies",
  "kriva-industries.html": "Industries we serve: trucking, SaaS, finance, and operations",
};

/* Filler or keyword-stuffed labels that told the reader nothing. */
const LABELS = [
  [/FAQ · Product Design &amp; UI\/UX/g, "FAQ"],
  [/Technologies · Product Design &amp; UI\/UX/g, "Technologies"],
  [/US trucking &amp; logistics · product studio/gi, "US trucking and logistics"],
  [/(<p[^>]*(?:eyebrow|kicker)[^>]*>)\s*Product Design &amp; UI\/UX\s*(<\/p>)/g, "$1Process$2"],
];

const CTA = [
  [/Book a free 20-min(?:ute)? (?:fit )?call/gi, "Book a free 20-minute fit call"],
  [/Book a 20-min(?:ute)? (?:fit )?call/gi, "Book a free 20-minute fit call"],
  [/Request a free 20-min(?:ute)? (?:fit )?call/gi, "Book a free 20-minute fit call"],
];

const PHOTO_CREDIT =
  '<p class="k-credit wrap">Photo: <a href="https://commons.wikimedia.org/wiki/File:Colorful_Semi-Trucks.jpg" rel="noopener noreferrer" target="_blank">Thank You (21 Millions+) views</a>, <a href="https://creativecommons.org/licenses/by/2.0/" rel="noopener noreferrer license" target="_blank">CC BY 2.0</a>.</p>';

function formHtml(page, c) {
  return `<section class="inq-sec" id="inquire" aria-labelledby="inqH">
  <div class="wrap inq-grid">
    <div class="inq-copy">
      <p class="eyebrow">Start a conversation</p>
      <h2 class="d2" id="inqH">${c.h}</h2>
      <p class="lede">${c.p}</p>
      <p class="inq-help">Prefer email? <a href="mailto:hello@krivatechnologies.com">hello@krivatechnologies.com</a>. Have a longer brief or files? <a href="/contact#brief">Send a project brief</a>.</p>
    </div>
    <div>
      <form class="inq-form" id="pageInquiry" action="/api/inquiry" method="post" novalidate>
        <input type="hidden" name="inquiry_type" value="page_inquiry">
        <input type="hidden" name="page" value="${page}">
        <input type="hidden" name="service" value="${c.s}">
        <p class="inq-hp"><label>Leave blank <input name="website_hp" tabindex="-1" autocomplete="off"></label></p>
        <div class="inq-row">
          <div><label for="inq-name">Name <span class="req">Required</span></label><input id="inq-name" name="name" required autocomplete="name"><p class="inq-err" id="inq-name-err">Enter your name.</p></div>
          <div><label for="inq-email">Work email <span class="req">Required</span></label><input id="inq-email" name="email" type="email" required autocomplete="email" inputmode="email"><p class="inq-err" id="inq-email-err">Enter a valid work email.</p></div>
        </div>
        <div><label for="inq-company">Company <span class="opt">Optional</span></label><input id="inq-company" name="company" autocomplete="organization"></div>
        <div><label for="inq-details">${c.q} <span class="req">Required</span></label><textarea id="inq-details" name="details" required rows="4"></textarea><p class="inq-err" id="inq-details-err">A sentence or two is enough.</p></div>
        <p class="inq-fail" role="alert"></p>
        <div class="inq-actions"><button type="submit" class="btn"><span class="inq-submit-label">Book a free 20-minute fit call</span><i>→</i></button><p class="inq-note">Reply within one business day. NDA on request.</p></div>
        <p class="inq-status" data-inq-status aria-live="polite"></p>
      </form>
      <div class="inq-done" tabindex="-1"><h3>Thank you!</h3><p>Your inquiry has been submitted successfully. We'll be in touch soon.</p></div>
    </div>
  </div>
</section>
`;
}

function formCopy(f) {
  const n = (s) => ({ s, h: "Tell us what your team works around.", p: "We will tell you whether to fix it, integrate it, rebuild it, or leave it alone. We reply within one business day.", q: "What is your team working around today?" });
  if (/^kriva-case-/.test(f)) return { ...n("Case study: " + f.replace(/kriva-case-|\.html/g, "")), h: "Need something like this built?", p: "Tell us about the workflow. We will say honestly how close this is to what you need, and what it would take." };
  if (/^kriva-insight-/.test(f)) return { ...n("Guide: " + f.replace(/kriva-insight-|\.html/g, "")), h: "Working through this right now?", p: "Tell us where you are stuck. A short call often settles whether you need to build anything at all.", q: "What are you trying to decide or build?" };
  if (/^kriva-service-/.test(f)) return { ...n("Service: " + f.replace(/kriva-service-|\.html/g, "")), h: "Tell us what you need built.", q: "What do you need help with?" };
  return n("Page: " + f.replace(/kriva-|\.html/g, ""));
}
const PATH = (f) => {
  const { FILE_MAP } = require("./_crawl_links.js");
  const e = Object.entries(FILE_MAP).find(([, v]) => v === f);
  if (e) return e[0];
  const m = f.match(/^kriva-service-(.+)\.html$/);
  return m ? "/services/" + m[1] : "/";
};
const NO_FORM = new Set(["kriva-privacy.html", "kriva-terms.html", "kriva-careers.html", "kriva-contact.html", "kriva-redesign.html"]);

let changed = 0;
for (const f of fs.readdirSync(".").filter((x) => /^kriva-.*\.html$/.test(x))) {
  const orig = fs.readFileSync(f, "utf8");
  let s = orig;
  const split = s.indexOf("<body");
  let head = s.slice(0, split), body = s.slice(split);

  // CTA wording: visible copy and metadata
  for (const [a, b] of CTA) { body = body.replace(a, b); head = head.replace(a, b); }
  for (const [a, b] of LABELS) body = body.replace(a, b);

  // H1
  if (H1[f]) body = body.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/, (m, attrs) => `<h1${attrs.replace(/\s*data-mask(="[^"]*")?/, "")}>${H1[f]}</h1>`);

  // AI-looking photos
  body = body.replace(/<img src="\/media\/solutions\/trucking\/hero-dispatch-desk\.webp"[^>]*>/g, '<img src="/media/photos/tanker-interstate.webp" alt="A chrome tanker semi truck travelling along an interstate through golden hills." width="1600" height="1067" loading="lazy" decoding="async">');
  body = body.replace(/<img src="\/media\/home\/build-fleet-driver\.webp"[^>]*>/g, '<img src="/media/photos/truck-stop-row.webp" alt="A row of red, blue, and yellow semi trucks parked at a truck stop below a mountain range." width="1600" height="1067" loading="lazy" decoding="async">');
  if (body.includes("truck-stop-row.webp") && f !== "kriva-redesign.html" && !body.includes("k-credit")) body = body.replace("</main>", PHOTO_CREDIT + "\n</main>");

  // Inquiry form on commercial pages that have none
  if (!NO_FORM.has(f) && !/<form\b/.test(body.slice(0, body.indexOf("</main>"))) && /<\/main>/.test(body)) {
    body = body.replace("</main>", formHtml(PATH(f), formCopy(f)) + "</main>");
    if (!/page-inquiry\.css/.test(head)) head = head.replace(/(<link rel="stylesheet" href="\/shared\/chrome\.css)/, '<link rel="stylesheet" href="/shared/page-inquiry.css">\n$1');
    if (!/page-inquiry\.js/.test(body)) body = body.replace("</body>", '<script src="/shared/page-inquiry.js?v=kds1" defer></script>\n</body>');
  }

  s = head + body;
  if (s !== orig) { fs.writeFileSync(f, s); changed++; }
}
console.log("pages changed", changed);
