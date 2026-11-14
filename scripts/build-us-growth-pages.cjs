#!/usr/bin/env node
/** Build US commercial pages (pricing, trucking websites, moving websites, two guides) from the insight shell. */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "kriva-insight-dispatch-software-cost.html");
const ORG =
  "KRIVA Technologies designs websites, mobile apps, and custom software for trucking, moving, and logistics companies, and builds B2B SaaS products and QuickBooks and Xero integrations. The studio is in Ahmedabad, India and works with teams in the United States, United Kingdom, Australia, UAE, and Canada.";

/** Published USD starting prices (defined scope on /pricing). */
const PRICE = {
  website: { usd: "$4,800", min: "4800" },
  mobile: { usd: "$18,000", min: "18000" },
  design: { usd: "$6,500", min: "6500" },
  software: { usd: "$15,000", min: "15000" },
  accounting: { usd: "$8,000", min: "8000" },
};

function attr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function titleTag(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
function words(html) {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}
function orgNode() {
  return {
    "@type": "ProfessionalService",
    "@id": "https://krivatechnologies.com/#organization",
    name: "KRIVA Technologies",
    url: "https://krivatechnologies.com",
    email: "hello@krivatechnologies.com",
    foundingDate: "2025-01-01",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    areaServed: { "@type": "Country", name: "United States" },
    description: ORG,
  };
}
function crumbs(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
function faqNode(url, faqs) {
  return {
    "@type": "FAQPage",
    "@id": url + "#faq",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
function inquiry(opts) {
  return `
<section class="inq-sec" id="inquire" aria-labelledby="inqH">
  <div class="wrap inq-grid">
    <div class="inq-copy">
      <p class="eyebrow">Project estimate</p>
      <h2 class="d2" id="inqH">${opts.heading}</h2>
      <p class="lede">${opts.lede}</p>
      <p class="inq-help">Prefer to talk first? <a href="/contact#book">Book a free 20-minute fit call</a>, or send files from the <a href="/contact#brief">contact page</a>.</p>
    </div>
    <div>
      <form class="inq-form" id="pageInquiry" action="/api/inquiry" method="post" novalidate>
        <input type="hidden" name="inquiry_type" value="page_inquiry">
        <input type="hidden" name="page" value="${opts.page}">
        <input type="hidden" name="service" value="${attr(opts.service)}">
        <p class="inq-hp"><label>Leave blank <input name="website_hp" tabindex="-1" autocomplete="off"></label></p>
        <div class="inq-row">
          <div>
            <label for="inq-name">Name <span class="req">Required</span></label>
            <input id="inq-name" name="name" required autocomplete="name">
            <p class="inq-err" id="inq-name-err">Enter your name.</p>
          </div>
          <div>
            <label for="inq-email">Work email <span class="req">Required</span></label>
            <input id="inq-email" name="email" type="email" required autocomplete="email" inputmode="email">
            <p class="inq-err" id="inq-email-err">Enter a valid work email.</p>
          </div>
        </div>
        <div class="inq-row">
          <div>
            <label for="inq-company">Company <span class="opt">Optional</span></label>
            <input id="inq-company" name="company" autocomplete="organization">
          </div>
          <div>
            <label for="inq-site">Website <span class="opt">Optional</span></label>
            <input id="inq-site" name="site" type="url" inputmode="url" placeholder="https://" autocomplete="url">
          </div>
        </div>
        <div class="inq-row">
          <div>
            <label for="inq-ptype">Service <span class="opt">Optional</span></label>
            <select id="inq-ptype" name="ptype">
              <option value="">Choose one</option>
              <option>Trucking company website</option>
              <option>Moving company website</option>
              <option>Logistics company website</option>
              <option>Mobile app</option>
              <option>UI/UX or SaaS product design</option>
              <option>Custom software or dashboard</option>
              <option>QuickBooks or Xero integration</option>
              <option>Not sure yet</option>
            </select>
          </div>
          <div>
            <label for="inq-budget">Approximate budget <span class="opt">Optional</span></label>
            <select id="inq-budget" name="budget">
              <option value="">Select a range</option>
              <option>Under $5k</option>
              <option>$5k - $15k</option>
              <option>$15k - $40k</option>
              <option>$40k - $100k</option>
              <option>$100k+</option>
              <option>Not sure yet</option>
            </select>
          </div>
        </div>
        <div>
          <label for="inq-details">Project description <span class="req">Required</span></label>
          <textarea id="inq-details" name="details" required rows="4" placeholder="${attr(opts.placeholder)}"></textarea>
          <p class="inq-err" id="inq-details-err">A few sentences is enough.</p>
        </div>
        <p class="inq-fail" role="alert"></p>
        <div class="inq-actions">
          <button type="submit" class="btn"><span class="inq-submit-label">Get a free project estimate</span><i>→</i></button>
          <p class="inq-note">Reply within one business day. Mutual NDA available on request before sharing confidential project information.</p>
        </div>
        <p class="inq-status" data-inq-status aria-live="polite"></p>
      </form>
      <div class="inq-done" tabindex="-1">
        <h3>Estimate request received.</h3>
        <p>We will reply within one business day. If you still need a scheduled call, use the <a href="/contact#book">contact page</a>.</p>
      </div>
    </div>
  </div>
</section>`;
}
function faqsHtml(faqs) {
  return `<h2 id="faq">Questions we hear before a quote</h2>
${faqs.map((f) => `<h3>${f.q}</h3><p>${f.a}</p>`).join("\n")}`;
}
function pricingFaqsAccordion(faqs) {
  return faqs
    .map((f, i) => {
      const id = `pxfq${i + 1}`;
      const bid = `pxfqb${i + 1}`;
      return `<div class="faq-item">
      <button type="button" class="faq-q faq-q--plain" aria-expanded="false" aria-controls="${id}" id="${bid}">
        <span class="qt">${f.q}</span>
        <span class="qi" aria-hidden="true"></span>
      </button>
      <div class="faq-a" id="${id}" role="region" aria-labelledby="${bid}"><div><div class="faq-a-in"><p>${f.a}</p></div></div></div>
    </div>`;
    })
    .join("\n");
}
function priceCard({ id, title, price, lede, bullets, note, href, link, links }) {
  const items = links || [{ href, link }];
  const anchors = items
    .map((item) => `<a class="p-link" href="${item.href}"><span>${item.link}</span><i>→</i></a>`)
    .join("\n          ");
  return `<article class="px-card" id="${id}">
          <h2 class="px-title">${title}</h2>
          <p class="px-price"><small>Starts at</small>${price}</p>
          <p class="px-lede">${lede}</p>
          <ul class="px-scope">${bullets.map((b) => `<li>${b}</li>`).join("\n            ")}</ul>
          ${note ? `<p class="px-note">${note}</p>` : ""}
          ${anchors}
        </article>`;
}
function proof(cards) {
  return `<div class="proof-grid">
${cards
  .map(
    (c) => `<a class="proof-card" href="${c.href}" target="_blank" rel="noopener noreferrer">
  <img src="${c.src}" alt="${attr(c.alt)}" width="1440" height="900" loading="lazy" decoding="async">
  <div><h3>${c.title}</h3><p>${c.text}</p></div>
</a>`
  )
  .join("\n")}
</div>
<p>These are websites KRIVA designed. We do not publish traffic or lead numbers for them.</p>
<p>You review the site on a live URL before launch, and the design files and code transfer to you. The studio is in Ahmedabad and overlaps US hours for calls. The steps are on the <a href="/process">process page</a>.</p>`;
}

const pricingFaqs = [
  {
    q: "Are these the final prices?",
    a: "No. Each figure is the starting price for the scope described on this page. The written quote comes after a call, once we know pages, roles, integrations, and what you already have.",
  },
  {
    q: "Why is a full dispatch system not listed with one starting price?",
    a: "Two carriers asking for a dispatch system usually mean different products. A board beside an existing TMS is not the same project as quoting, settlement, driver pay, and customer tracking. Those are quoted after discovery. The <a href=\"/insights/dispatch-software-cost\">dispatch cost guide</a> explains the drivers.",
  },
  {
    q: "Can the price be lower because you use AI tools?",
    a: "Sometimes, on a clear scope. We do not guarantee a percentage off. AI tools can shorten repetitive production. They do not shorten the time spent learning your operation, and third-party fees are not discounted. The written estimate is the price.",
  },
  {
    q: "Who owns the work?",
    a: "You do. Design files, code, and documentation transfer to you. KRIVA is based in Ahmedabad, India, and works remotely with US companies. We do not claim a US office.",
  },
];

const truckFaqs = [
  {
    q: "Do you only design the site, or do you build it too?",
    a: "Both. The starting website scope includes design and development, a mobile layout, one quote or recruiting form, and launch on your domain. A customer portal or driver app is a separate project.",
  },
  {
    q: "Can the site collect a freight quote?",
    a: "Yes. A useful trucking form asks for origin, destination, equipment, dates, and contact details, instead of a single message box. Live pricing from a TMS is custom work and is quoted separately.",
  },
  {
    q: "We already have a TMS. Do we still need a website?",
    a: "Usually yes. Shippers, brokers, and drivers decide whether to call before they ever see the TMS. The public site is that first conversation. The dispatch software is what the desk uses after the load exists.",
  },
];

const movingFaqs = [
  {
    q: "Will the site give customers an instant moving price?",
    a: "Only if your pricing rules are simple enough to write down. Many movers should collect origin, destination, move size, date, and stairs or elevator, then confirm the price. We will say which approach fits before we build it.",
  },
  {
    q: "Can you build a booking app or a moving CRM?",
    a: "Yes, as custom software, quoted separately. The published moving work on this site is website design. We will not pretend a booking product already exists in the portfolio.",
  },
  {
    q: "Which US cities do you serve?",
    a: "We work remotely with moving companies across the United States. We do not create a separate page for each state. The site should describe the cities and corridors you actually serve.",
  },
];

const pricingMain = `
<header class="hero faq-hero px-hero" id="overview" aria-labelledby="h1">
  <div class="wrap">
    <div class="px-hero-meta" data-r>
      <nav aria-label="Breadcrumb">
        <ol class="crumbs">
          <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
          <li aria-current="page">Pricing</li>
        </ol>
      </nav>
      <p class="px-hero-line2">United States · USD</p>
    </div>
    <h1 class="d1 mask" id="h1" data-mask>Starting prices for websites, apps, and custom software</h1>
    <p class="lede" data-r>These are starting prices for a defined scope, not a menu of finished products. A written estimate follows a call. Dispatch platforms and other open-ended builds are quoted individually.</p>
    <div class="hero-actions" data-r>
      <a href="#inquire" class="btn"><span>Get a free project estimate</span><i>→</i></a>
      <a href="/contact#book" class="btn ghost"><span>Book a free 20-minute fit call</span><i>→</i></a>
    </div>
    <p class="faq-mast" data-r>
      <span>You own the work</span>
      <span>Written quote after a call</span>
      <span>Ahmedabad studio · US clients</span>
    </p>
  </div>
</header>

<nav class="faq-jump px-jump" aria-label="Pricing sections">
  <div class="wrap">
    <p class="k">Jump to</p>
    <ul>
      <li><a href="#starting">Starting prices</a></li>
      <li><a href="#drivers">What changes cost</a></li>
      <li><a href="#compare">US vs remote</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
  </div>
</nav>

<section class="sect px-intro" id="starting" aria-labelledby="startH">
  <div class="wrap">
    <div class="s-head">
      <div>
        <p class="eyebrow" data-r>Starting prices</p>
        <h2 class="d2 s-title" id="startH" data-r>Defined scopes, not finished products.</h2>
        <p class="lede" data-r>KRIVA designs and builds for trucking, moving, and logistics companies, and for SaaS and finance teams. Clients are in the United States and other markets. You own the code and the design files.</p>
      </div>
    </div>
    <div class="px-grid" data-s>
      ${priceCard({
        id: "websites",
        title: "Website design and development",
        price: PRICE.website.usd,
        lede: "For a trucking, moving, or logistics company that needs a credible custom site, not a template with the logo swapped.",
        bullets: [
          "Working session and a written scope",
          "Custom design and build, up to six pages",
          "Mobile layout, one quote or contact form, on-page titles and headings",
          "Launch on your domain",
        ],
        note: "Best for carriers, movers, and brokers whose current site does not explain the service or capture a useful enquiry. Extra pages, CMS, photography, copywriting, online booking, and customer logins change the price.",
        href: "/solutions/trucking-company-websites",
        link: "Trucking company websites",
        links: [
          { href: "/solutions/trucking-company-websites", link: "Trucking company websites" },
          { href: "/solutions/moving-company-websites", link: "Moving company websites" },
        ],
      })}
      ${priceCard({
        id: "mobile",
        title: "Mobile application design and development",
        price: PRICE.mobile.usd,
        lede: "For one role and one job: a driver capturing proof of delivery, or a customer checking status.",
        bullets: [
          "iOS and Android from one codebase",
          "One primary workflow and a simple web list for the office",
          "Design, build, and a test release",
        ],
        note: "Offline use for a full day, payments, several roles, and ELD or telematics connections are quoted separately.",
        href: "/services/mobile-applications",
        link: "Mobile app development",
      })}
      ${priceCard({
        id: "design",
        title: "UI/UX and SaaS product design",
        price: PRICE.design.usd,
        lede: "For one core workflow: the screens a dispatcher, broker, or new SaaS user actually completes.",
        bullets: [
          "User flows and wireframes for that workflow",
          "High-fidelity interface design",
          "Type, color, and the components those screens use",
        ],
        note: "Research interviews, extra roles, and a full product design system change the price. Engineering is quoted separately if you want us to build it.",
        href: "/services/product-design",
        link: "Product design",
      })}
      ${priceCard({
        id: "software",
        title: "Custom software and dashboards",
        price: PRICE.software.usd,
        lede: "For one internal tool: one team, one workflow, one dashboard, code you own.",
        bullets: [
          "Discovery of the current spreadsheet or workaround",
          "The working tool and a handoff",
          "A short admin or reporting view of that same workflow",
        ],
        note: 'A dispatch CRM, TMS, or multi-role fleet platform is a custom quotation. Read <a href="/insights/dispatch-software-cost">what drives dispatch software cost</a> before comparing vendor totals.',
        href: "/services/dashboard-design",
        link: "Business dashboards",
      })}
    </div>
    <article class="px-card px-card--wide" id="accounting" data-r>
      <div class="px-card-main">
        <h2 class="px-title">QuickBooks and Xero integrations</h2>
        <p class="px-price"><small>Starts at</small>${PRICE.accounting.usd}</p>
        <p class="px-lede">For one accounting product and a defined set of records, usually customers and invoices, or invoices and payments.</p>
      </div>
      <div class="px-card-side">
        <ul class="px-scope">
          <li>Connection to QuickBooks Online or Xero</li>
          <li>A visible failure log and a way to retry</li>
          <li>A reconciliation screen a finance person can use without reading JSON</li>
        </ul>
        <p class="px-note">Multi-entity books, QuickBooks Desktop, payroll, and inventory are custom quotations.</p>
        <a class="p-link" href="/solutions/accounting-integrations"><span>Accounting integrations</span><i>→</i></a>
      </div>
    </article>
    <div class="px-price-callout" data-r role="note">
      <p>Starting prices for the scope on each card.</p>
      <p>Your written quote after a call reflects your requirements and is the price we stand behind. <a href="/process">How we scope work</a>.</p>
    </div>
  </div>
</section>

<section class="sect alt px-drivers" id="drivers" aria-labelledby="drvH">
  <div class="wrap">
    <div class="s-head">
      <div>
        <p class="eyebrow" data-r>Scope drivers</p>
        <h2 class="d2 s-title" id="drvH" data-r>What changes the final number</h2>
        <p class="lede" data-r>The proposal lists what is included, what is excluded, and the timeline. If a number is much lower than the starting prices above, ask what was left out.</p>
      </div>
    </div>
    <div class="px-drivers-grid" data-s>
      <article class="px-driver">
        <p class="k">Roles</p>
        <p>How many roles use the system, and whether drivers or customers get their own surface.</p>
      </article>
      <article class="px-driver">
        <p class="k">Integrations</p>
        <p>Whether the other system has a documented API and a test account we can use during build.</p>
      </article>
      <article class="px-driver">
        <p class="k">Content</p>
        <p>What you can provide versus copy and photography we have to produce before launch.</p>
      </article>
      <article class="px-driver">
        <p class="k">Cutover</p>
        <p>Whether the first release must replace the current tool or can run beside it for a while.</p>
      </article>
    </div>
  </div>
</section>

<section class="sect px-compare" id="compare" aria-labelledby="cmpH">
  <div class="wrap px-compare-grid">
    <div class="px-compare-side">
      <p class="eyebrow" data-r>How we price</p>
      <h2 class="d2 s-title" id="cmpH" data-r>Why a US onshore quote is often higher</h2>
      <p class="lede" data-r>KRIVA uses AI-assisted tools for repetitive production work. Design decisions, workflow mapping, code review, and testing stay with the team. The tools shorten some hours. They do not remove the hours spent learning how your desk works.</p>
      <p class="body-sm px-compare-note" data-r>We do not promise a percentage off a US agency quote. The written estimate after a call is the price.</p>
    </div>
    <div class="px-compare-panel" data-r>
      <div class="px-compare-stat" aria-label="US onshore pricing context">
        <p class="k">Market context · 2026</p>
        <div class="px-compare-stat-row">
          <p class="px-compare-num num">1.6–2×</p>
          <p class="px-compare-cap">US onshore agency quotes vs comparable offshore teams on large 3PL hourly builds.</p>
        </div>
      </motion>
      <ul class="px-compare-points">
        <li><strong>Not a KRIVA discount.</strong> That study is agency hourly work, not a six-page website or the scopes on this page.</li>
        <li><strong>Published starting prices</strong> sit inside the professional ranges other US studios show for similar defined scope.</li>
        <li><strong>Remote delivery</strong> without a US storefront overhead, plus AI on repetitive production, shapes our estimates.</li>
        <li><strong>Not included</strong> unless the proposal says so: third-party licenses, app-store fees, and scope added after sign-off.</li>
      </ul>
      <p class="px-compare-src">Source: <a href="https://www.gilzor.com/insights/cost-of-3pl-software-development" rel="noopener noreferrer">Gilzor — Cost of 3PL Software Development in 2026</a></p>
    </div>
  </div>
</section>

<section class="sect faq-sec alt" id="faq" aria-labelledby="faqH">
  <div class="wrap faq-grid">
    <div class="faq-side">
      <p class="eyebrow" data-r>Before a quote</p>
      <h2 class="d2" id="faqH" data-r>Questions we hear first</h2>
      <p class="lede" data-r>Comparing studios? Read <a href="/insights/choosing-a-digital-agency">how to choose a software partner</a>, or <a href="/contact#book">book a fit call</a> with your scope ready.</p>
    </div>
    <div class="faq-list" data-r>
      ${pricingFaqsAccordion(pricingFaqs)}
    </div>
  </div>
</section>
${inquiry({
  page: "/pricing",
  service: "Pricing page estimate",
  heading: "Get a free project estimate",
  lede: "Name the service, a budget range if you have one, and what the business needs the work to do. We reply within one business day.",
  placeholder: "Example: Chicago mover. We need a quote form for local and long-distance moves, plus pages for packing and storage. About six pages.",
})}`;

const truckMain = `
<article>
  <header class="art-hero" id="intro">
    <div class="wrap">
      <a class="back" href="/solutions">← Solutions</a>
      <p class="cat">Trucking · United States</p>
      <h1 class="d1" id="h1">Trucking company website design for carriers that need freight and drivers</h1>
      <p class="lede">Shippers and drivers both land on your homepage. If it does not show equipment, lanes, and a way to ask for a quote or a job, they call a carrier whose site does.</p>
      <div class="lead-actions">
        <a class="btn" href="#inquire"><span>Get a website quote</span><i>→</i></a>
        <a class="btn ghost" href="/pricing#websites"><span>See the starting price</span><i>→</i></a>
      </div>
    </div>
  </header>
  <div class="wrap">
    <div class="prose">
      <h2 id="problem">The site is doing two jobs, and most templates do neither</h2>
      <p>A shipper or broker wants equipment, coverage, authority, and a quote path. A driver wants pay, home time, equipment, and a way to apply. A single “About us / Contact” page makes the office answer questions the site should have answered.</p>
      <p>KRIVA designs and builds that public site for US carriers, heavy-haul companies, and logistics operators. Dispatch consoles, driver apps, and accounting sync are available when the website is not the real gap. Those are separate scopes, described on the <a href="/pricing">pricing page</a>.</p>

      <h2 id="solution">What we put on the site</h2>
      <ul>
        <li>A homepage that says what you haul, where, and what should happen next</li>
        <li>Service and equipment pages a shipper can skim on a phone</li>
        <li>A quote form that asks for lane, equipment, and dates, not only a message</li>
        <li>A driver page with the facts that affect an application</li>
        <li>Authority and insurance details where a broker expects to find them</li>
        <li>On-page titles, headings, and a mobile layout</li>
      </ul>
      <p>The list above is what a useful carrier site covers. The starting scope is $4,800 for up to six of those pages, custom design, one form, and launch. More terminals, a recruiting portal, a content editor, or a tracking page fed by your TMS is quoted from the real scope. Engineering detail sits on <a href="/services/web-development">web development</a>.</p>

      <h2 id="work">Sites we have designed</h2>
      ${proof([
        {
          href: "https://schwarzlogistics.com",
          src: "/media/work/web/schwarz-logistics-800.webp",
          alt: "Schwarz Logistics website homepage, an asset-based trucking carrier site designed by KRIVA",
          title: "Schwarz Logistics",
          text: "Fleet services and a quote-led homepage for an asset-based carrier. Opens the live site.",
        },
        {
          href: "https://elite-one.us",
          src: "/media/work/web/eliteone-transportation-800.webp",
          alt: "EliteOne Transportation website homepage, a heavy-haul carrier site designed by KRIVA",
          title: "EliteOne Transportation",
          text: "A quote-led site for a Tacoma heavy-haul carrier. Opens the live site.",
        },
      ])}

      <h2 id="software">When you need software, not another page</h2>
      <p>A website does not assign loads. If dispatch still lives in a spreadsheet beside the TMS, the next conversation is <a href="/solutions/trucking-logistics">trucking software</a>, a <a href="/services/mobile-applications">driver app</a>, or a <a href="/solutions/fleet-management-software">fleet dashboard</a>. We will tell you which one is worth building.</p>
      <p>If you are comparing website prices before the call, read <a href="/insights/trucking-company-website-cost">how much a trucking company website costs</a>. Those figures include other agencies’ published prices, labeled as such.</p>

      ${faqsHtml(truckFaqs)}
    </div>
  </div>
</article>
${inquiry({
  page: "/solutions/trucking-company-websites",
  service: "Trucking company website",
  heading: "Get a website quote",
  lede: "Send your current site, what you haul, and whether the next enquiry should come from shippers, drivers, or both.",
  placeholder: "Example: 40-truck reefer carrier. We need shipper pages, a driver page, and a quote form. Our current site is a one-page template.",
})}`;

const movingMain = `
<article>
  <header class="art-hero" id="intro">
    <div class="wrap">
      <a class="back" href="/solutions">← Solutions</a>
      <p class="cat">Moving · United States</p>
      <h1 class="d1" id="h1">Moving company website design that collects a real move request</h1>
      <p class="lede">Customers will not reconstruct your services from a homepage slider. They need the move type, the cities you cover, and a form that asks for origin, destination, size, and date.</p>
      <div class="lead-actions">
        <a class="btn" href="#inquire"><span>Get a website quote</span><i>→</i></a>
        <a class="btn ghost" href="/pricing#websites"><span>See the starting price</span><i>→</i></a>
      </div>
    </div>
  </header>
  <div class="wrap">
    <div class="prose">
      <h2 id="problem">The phone is ringing for details the form never asked</h2>
      <p>Local moving, long distance, packing, and storage are different jobs. A contact form with one text box sends all of them to the office as “need a quote.” The coordinator then calls back to learn what the site could have collected.</p>
      <p>KRIVA designs moving company websites for US operators. The same team can design a booking flow or an internal board later. That software is custom, and it is not something we pretend is already a packaged product.</p>

      <h2 id="solution">What the site should do</h2>
      <ul>
        <li>Separate local, long-distance, packing, and storage if you sell them</li>
        <li>Name the cities or corridors you actually serve</li>
        <li>Ask for origin, destination, home or office size, date, and access details</li>
        <li>Offer a phone number that is easy to tap</li>
        <li>Give crews a page if you are hiring</li>
        <li>Work on a phone, because that is where the search started</li>
      </ul>
      <p>The list above is what a useful mover site covers. Website design and development starts at $4,800 for up to six of those pages and one form. A content editor, a customer booking app, an inventory checklist, or an office CRM is priced from the <a href="/pricing#mobile">mobile</a> and <a href="/pricing#software">custom software</a> starting points, then adjusted to the workflow. Feature decisions are spelled out in <a href="/insights/moving-company-website-features">what a moving company website should include</a>.</p>

      <h2 id="work">Moving sites we have designed</h2>
      ${proof([
        {
          href: "https://keepmovingus.com",
          src: "/media/work/web/keep-moving-800.webp",
          alt: "Keep Moving website homepage, a Seattle moving company site designed by KRIVA",
          title: "Keep Moving",
          text: "Quote-first homepage for a local and long-distance mover in the Seattle area. Opens the live site.",
        },
        {
          href: "https://xtramilemovers.com",
          src: "/media/work/web/extra-mile-movers-800.webp",
          alt: "Extra Mile Movers website homepage, a Chicago moving company site designed by KRIVA",
          title: "Extra Mile Movers",
          text: "Chicago local and long-distance moving, with storage and packing on the same site. Opens the live site.",
        },
        {
          href: "https://xmileautotransport.com",
          src: "/media/work/web/xmile-auto-transport-800.webp",
          alt: "Xmile vehicle shipping website, part of a transport and moving design system by KRIVA",
          title: "Xmile transport and moving",
          text: "A shared design system for vehicle shipping and residential moving in the Chicago market. The image is the vehicle-shipping homepage. Opens the live site.",
        },
      ])}

      <h2 id="software">Booking apps and a moving CRM</h2>
      <p>Some movers need more than a site: a customer request that becomes a job, a crew schedule, and an invoice in QuickBooks or Xero. We can design and build that. It is a custom project, quoted after we see how jobs are booked today. We have not published a moving CRM case study, and the portfolio should not be read as one.</p>
      <p>If the books are the painful part, start with <a href="/solutions/accounting-integrations">QuickBooks and Xero integrations</a>. If the office board is the painful part, start with <a href="/services/crm-development">custom CRM development</a>.</p>

      ${faqsHtml(movingFaqs)}
    </div>
  </div>
</article>
${inquiry({
  page: "/solutions/moving-company-websites",
  service: "Moving company website",
  heading: "Get a website quote",
  lede: "Tell us the cities you serve and whether you need a marketing site, a quote form, or software behind it.",
  placeholder: "Example: Local and long-distance mover in Dallas. We want packing and storage pages and a form that asks for move size and date.",
})}`;

const costFaqs = [
  {
    q: "What does KRIVA charge for a trucking website?",
    a: "A defined website of up to six pages, custom design, one form, and launch starts at $4,800. Tracking portals, driver applications with a login, and TMS connections are quoted separately.",
  },
  {
    q: "Why do other sites advertise $899 trucking websites?",
    a: "Those offers are usually a small page count, a template, or a monthly plan. They can be the right buy for an owner-operator who needs a phone number online. They are a different product from a custom site with separate shipper and driver paths.",
  },
];

const costMain = `
<article>
  <header class="art-hero" id="intro">
    <div class="wrap">
      <a class="back" href="/insights">← Insights</a>
      <p class="cat">Trucking and logistics</p>
      <h1 class="d1" id="h1">How much does a trucking company website cost?</h1>
      <p class="lede">Published US prices in 2026 run from a few hundred dollars for a template to the mid five figures when the site includes portals. The useful question is which of those products you are buying.</p>
      <div class="art-meta">
        <span><time datetime="2026-11-14">November 14, 2026</time></span>
        <span>8 min read</span>
        <span>KRIVA Technologies</span>
      </div>
    </div>
  </header>
  <div class="wrap">
    <div class="prose">
      <p>Carriers ask for a website price and receive answers that are not describing the same work. This note separates the published offers we could verify from what a custom KRIVA site includes. Figures from other companies are theirs, checked in November 2026, and will move.</p>

      <h2 id="market">What other companies publish</h2>
      <div class="art-table-wrap">
        <table>
          <caption>Published trucking website prices from other companies, November 2026. Not KRIVA quotes.</caption>
          <thead><tr><th>Offer</th><th>Published price</th><th>What they describe</th></tr></thead>
          <tbody>
            <tr><td>DigiTruck packages</td><td>$899, $1,299, and $1,899</td><td>One page up to about ten pages, with forms and basic SEO setup</td></tr>
            <tr><td>GatorByte</td><td>$1,000 to launch, then $100 a month</td><td>A custom mobile site, quote form, and managed hosting</td></tr>
            <tr><td>Vaylo Studios</td><td>$2,000 to $6,000</td><td>Custom trucking sites, lead capture, and launch</td></tr>
            <tr><td>Agency builds in a 2026 roundup</td><td>About $3,000 to $9,000</td><td>Separate paths for shippers, brokers, and drivers</td></tr>
            <tr><td>Sites with portals</td><td>About $7,500 to $25,000 or more</td><td>Quote requests into dispatch, tracking, or a driver portal</td></tr>
          </tbody>
        </table>
      </div>
      <p>Sources: <a href="https://www.digitrucksolutions.com/pricing">DigiTruck pricing</a>, <a href="https://gatorbyte.net/web-design/trucking-companies/">GatorByte</a>, <a href="https://vaylostudios.com/services/trucking-websites">Vaylo Studios</a>, and <a href="https://codeifydigital.com/trucking-company-website-cost/">Codeify Digital’s 2026 roundup</a> of other agencies’ published ranges. Read them before you treat any row as your budget. A monthly plan is not comparable to a one-time build you own.</p>

      <h2 id="kriva">What KRIVA’s starting price includes</h2>
      <p>A trucking, moving, or logistics website starts at $4,800. That scope is a working session, custom design, up to six pages, a mobile layout, one quote or contact form, on-page titles and headings, and launch on your domain. Photography, extra pages, a content editor, and anything behind a login are outside it.</p>
      <p>That price sits with the professional custom builds above, not with the $899 packages. It is lower than many US agency quotes for a multi-audience carrier site, and it is not a claim that every project lands at $4,800. The <a href="/pricing#websites">pricing page</a> lists what moves the number. The page we would build is described under <a href="/solutions/trucking-company-websites">trucking company website design</a>.</p>

      <h2 id="choose">How to choose a budget</h2>
      <ul>
        <li>Need a phone number, authority, and a simple quote form: a small custom site is enough.</li>
        <li>Need different pages for shippers and drivers: budget for more than a one-page template.</li>
        <li>Need customers to track a load, or drivers to upload documents: you are buying software. Read <a href="/insights/dispatch-software-cost">dispatch software cost</a> before you add that to a website quote.</li>
      </ul>
      <p>Ask every vendor the same three questions: how many pages, what the form captures, and whether you own the site when the invoice is paid. KRIVA’s answer on ownership is yes. The studio is in Ahmedabad and works remotely with US carriers.</p>

      ${faqsHtml(costFaqs)}
      <p class="art-end"><a href="/solutions/trucking-company-websites">See trucking website design</a> or <a href="#inquire">get a website quote</a>.</p>
    </div>
    <nav class="rel-sol" aria-label="Related pages">
      <a href="/solutions/trucking-company-websites">Trucking websites</a>
      <a href="/pricing">Pricing</a>
      <a href="/services/web-development">Web development</a>
      <a href="/insights/dispatch-software-cost">Dispatch software cost</a>
    </nav>
  </div>
</article>
${inquiry({
  page: "/insights/trucking-company-website-cost",
  service: "Trucking company website",
  heading: "Get a website quote",
  lede: "Tell us the page count you think you need and who the site is for. We will reply with whether the starting scope fits.",
  placeholder: "Example: Reefer carrier. Shippers need equipment and lanes. Drivers need a recruiting page. We have photos.",
})}`;

const featureFaqs = [
  {
    q: "Should a moving site show prices?",
    a: "Show prices only when the rule is stable enough that the number on the site matches the number the coordinator quotes. Otherwise, collect the move details and price it properly. A wrong instant price creates the call you were trying to avoid.",
  },
  {
    q: "How many pages does a mover need?",
    a: "Enough to separate the services you sell. A local mover with packing and storage often needs a homepage, two or three service pages, a service-area page, and contact. Six pages is the scope inside KRIVA’s $4,800 starting price. A national van line is a different site.",
  },
];

const featureMain = `
<article>
  <header class="art-hero" id="intro">
    <div class="wrap">
      <a class="back" href="/insights">← Insights</a>
      <p class="cat">Moving</p>
      <h1 class="d1" id="h1">What features should a moving company website have?</h1>
      <p class="lede">The features that matter are the ones that turn a search into a move request the office can price, not a longer list of animations.</p>
      <div class="art-meta">
        <span><time datetime="2026-11-14">November 14, 2026</time></span>
        <span>7 min read</span>
        <span>KRIVA Technologies</span>
      </div>
    </div>
  </header>
  <div class="wrap">
    <div class="prose">
      <p>Most moving websites fail in the same place. The homepage talks about care and professionalism, and the form asks the customer to “tell us about your move.” The coordinator still has to call and ask where, when, how big, and whether there are stairs. Build the site around that missing conversation.</p>

      <h2 id="features">Features worth paying for</h2>
      <h3>1. A request form that matches how you quote</h3>
      <p>Ask for origin, destination, move date, home or office size, and access: stairs, elevator, long carry. A phone number and email are not a substitute for those fields. If you offer local and long-distance moves, the form should know which one the customer thinks they need, even if you correct it later.</p>
      <h3>2. Service pages that can be booked differently</h3>
      <p>Local moving, long distance, packing, storage, and commercial moves do not share one explanation. Give each service you actually sell its own page, with the next step on that page. Do not add services you hope to sell next year.</p>
      <h3>3. A service area written in plain cities</h3>
      <p>Name the cities and corridors you cover. “Nationwide” with no terminals is hard for a customer to trust and hard for a search engine to place. KRIVA does not publish a landing page per state. One honest service-area page is more useful than fifty thin city pages.</p>
      <h3>4. A phone number that works on a mobile screen</h3>
      <p>A large share of moving searches happen on a phone, often the week of a deadline. The number should be tappable, and the form should be usable without pinching. Click-to-call is a feature. A map widget that pushes the form below the fold is not.</p>
      <h3>5. Proof you can stand behind</h3>
      <p>Use reviews, insurance, and license details you can point to. Do not invent testimonials or star ratings. If you are hiring crews, give them pay, territory, and a way to apply, separate from the customer form.</p>
      <h3>6. A path into the office system, when you are ready</h3>
      <p>A marketing site does not schedule a crew. When the form volume is the problem, the next product is a job board or a customer booking flow, plus an invoice path to QuickBooks or Xero. That is custom software. KRIVA’s published moving work is website design, including <a href="https://keepmovingus.com">Keep Moving</a> and <a href="https://xtramilemovers.com">Extra Mile Movers</a>.</p>

      <h2 id="skip">Features that can wait</h2>
      <ul>
        <li>An instant price calculator, unless your pricing rules are short enough to maintain</li>
        <li>A customer login on day one</li>
        <li>A blog you will not update</li>
        <li>A separate page for every city in the state</li>
      </ul>
      <p>Website design for this kind of site starts at $4,800 for up to six pages. See <a href="/solutions/moving-company-websites">moving company website design</a> and the <a href="/pricing">pricing page</a>. If you are choosing a partner rather than a feature list, the practical test is whether they can show moving sites they designed and will say what the first release will not include.</p>

      ${faqsHtml(featureFaqs)}
      <p class="art-end"><a href="/solutions/moving-company-websites">See moving company website design</a> or <a href="#inquire">get a website quote</a>.</p>
    </div>
    <nav class="rel-sol" aria-label="Related pages">
      <a href="/solutions/moving-company-websites">Moving websites</a>
      <a href="/pricing">Pricing</a>
      <a href="/insights/trucking-company-website-cost">Trucking website cost</a>
      <a href="/services/web-development">Web development</a>
    </nav>
  </div>
</article>
${inquiry({
  page: "/insights/moving-company-website-features",
  service: "Moving company website",
  heading: "Get a website quote",
  lede: "List the services you sell and the cities you cover. We will tell you whether a six-page site is enough.",
  placeholder: "Example: We do local moves, packing, and storage in Phoenix. We want the form to ask for stairs and a move date.",
})}`;

const pages = [
  {
    file: "kriva-pricing.html",
    path: "/pricing",
    title: "Website, App, and Software Pricing | KRIVA",
    ogTitle: "Starting prices for websites, apps, and custom software",
    description:
      "Starting prices in USD for trucking and moving websites, mobile apps, product design, custom software, and QuickBooks or Xero integrations. Written quotes follow a call.",
    imageAlt: "KRIVA Technologies pricing for websites, apps, and custom software",
    ogType: "website",
    bodyClass: "page-pricing",
    shell: "kriva-faq.html",
    main: pricingMain,
    crumbs: [
      { name: "Home", url: "https://krivatechnologies.com/" },
      { name: "Pricing", url: "https://krivatechnologies.com/pricing" },
    ],
    faqs: pricingFaqs,
  },
  {
    file: "kriva-solution-trucking-websites.html",
    path: "/solutions/trucking-company-websites",
    title: "Trucking Company Website Design | KRIVA",
    ogTitle: "Trucking company website design for US carriers",
    description:
      "Custom trucking company websites for US carriers: equipment, lanes, quote requests, and driver pages. Design and development starts at $4,800.",
    imageAlt: "Trucking company website design by KRIVA Technologies",
    ogType: "website",
    bodyClass: "page-insight-truck",
    main: truckMain,
    crumbs: [
      { name: "Home", url: "https://krivatechnologies.com/" },
      { name: "Solutions", url: "https://krivatechnologies.com/solutions" },
      { name: "Trucking company websites", url: "https://krivatechnologies.com/solutions/trucking-company-websites" },
    ],
    faqs: truckFaqs,
    serviceName: "Trucking company website design",
  },
  {
    file: "kriva-solution-moving-websites.html",
    path: "/solutions/moving-company-websites",
    title: "Moving Company Website Design | KRIVA",
    ogTitle: "Moving company website design for US movers",
    description:
      "Moving company websites that collect origin, destination, move size, and date. US movers. Design and development starts at $4,800. Booking software is quoted separately.",
    imageAlt: "Moving company website design by KRIVA Technologies",
    ogType: "website",
    bodyClass: "page-insight-truck",
    main: movingMain,
    crumbs: [
      { name: "Home", url: "https://krivatechnologies.com/" },
      { name: "Solutions", url: "https://krivatechnologies.com/solutions" },
      { name: "Moving company websites", url: "https://krivatechnologies.com/solutions/moving-company-websites" },
    ],
    faqs: movingFaqs,
    serviceName: "Moving company website design",
  },
  {
    file: "kriva-insight-trucking-website-cost.html",
    path: "/insights/trucking-company-website-cost",
    title: "How Much Does a Trucking Company Website Cost? | KRIVA",
    ogTitle: "How much does a trucking company website cost?",
    description:
      "Trucking website prices published in 2026, from template packages to portal builds, and what KRIVA’s $4,800 starting scope includes.",
    imageAlt: "Guide to trucking company website cost",
    ogType: "article",
    section: "Trucking and logistics",
    tag: "Trucking website cost",
    bodyClass: "page-insight-truck",
    main: costMain,
    crumbs: [
      { name: "Home", url: "https://krivatechnologies.com/" },
      { name: "Insights", url: "https://krivatechnologies.com/insights" },
      { name: "Trucking website cost", url: "https://krivatechnologies.com/insights/trucking-company-website-cost" },
    ],
    faqs: costFaqs,
    article: true,
  },
  {
    file: "kriva-insight-moving-website-features.html",
    path: "/insights/moving-company-website-features",
    title: "Moving Company Website Features | KRIVA",
    ogTitle: "What features should a moving company website have?",
    description:
      "The moving company website features that produce a usable quote request: service pages, service area, and a form that asks for size, date, and access.",
    imageAlt: "Guide to moving company website features",
    ogType: "article",
    section: "Moving",
    tag: "Moving company website",
    bodyClass: "page-insight-truck",
    main: featureMain,
    crumbs: [
      { name: "Home", url: "https://krivatechnologies.com/" },
      { name: "Insights", url: "https://krivatechnologies.com/insights" },
      { name: "Moving website features", url: "https://krivatechnologies.com/insights/moving-company-website-features" },
    ],
    faqs: featureFaqs,
    article: true,
  },
];

function schemaFor(page) {
  const url = "https://krivatechnologies.com" + page.path;
  const graph = [
    orgNode(),
    {
      "@type": "WebPage",
      "@id": url + "#webpage",
      url,
      name: page.ogTitle,
      description: page.description,
      inLanguage: "en-US",
      isPartOf: { "@type": "WebSite", "@id": "https://krivatechnologies.com/#website", name: "KRIVA Technologies", url: "https://krivatechnologies.com" },
      about: { "@id": "https://krivatechnologies.com/#organization" },
      breadcrumb: { "@id": url + "#breadcrumb" },
    },
    Object.assign(crumbs(page.crumbs), { "@id": url + "#breadcrumb" }),
    faqNode(url, page.faqs),
  ];
  if (page.article) {
    graph.push({
      "@type": "BlogPosting",
      "@id": url + "#article",
      headline: page.ogTitle,
      description: page.description,
      datePublished: "2026-11-14",
      dateModified: "2026-11-14",
      inLanguage: "en-US",
      wordCount: words(page.main),
      articleSection: page.section,
      image: "https://krivatechnologies.com/brand/og-default.png",
      author: { "@id": "https://krivatechnologies.com/#organization" },
      publisher: { "@id": "https://krivatechnologies.com/#organization" },
      mainEntityOfPage: url,
    });
  } else if (page.serviceName) {
    graph.push({
      "@type": "Service",
      "@id": url + "#service",
      name: page.serviceName,
      serviceType: page.serviceName,
      url,
      areaServed: { "@type": "Country", name: "United States" },
      provider: { "@id": "https://krivatechnologies.com/#organization" },
      description: page.description,
    });
  } else {
    graph.push({
      "@type": "OfferCatalog",
      "@id": url + "#offers",
      name: "KRIVA starting prices",
      itemListElement: [
        ["Website design and development", PRICE.website.min, url + "#websites"],
        ["Mobile application design and development", PRICE.mobile.min, url + "#mobile"],
        ["UI/UX and SaaS product design", PRICE.design.min, url + "#design"],
        ["Custom software and dashboards", PRICE.software.min, url + "#software"],
        ["QuickBooks and Xero integrations", PRICE.accounting.min, url + "#accounting"],
      ].map(([name, minPrice, itemUrl]) => ({
        "@type": "Offer",
        name,
        url: itemUrl,
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice,
          priceCurrency: "USD",
          description: "Starting price for the defined scope on this page. The written quote can be higher.",
        },
      })),
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

function build(page) {
  const shellFile = page.shell || "kriva-insight-dispatch-software-cost.html";
  let html = fs.readFileSync(path.join(ROOT, shellFile), "utf8");
  const url = "https://krivatechnologies.com" + page.path;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${titleTag(page.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${attr(page.description)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  html = html.replace(/<link rel="alternate" hreflang="en" href="[^"]*">/, `<link rel="alternate" hreflang="en" href="${url}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${attr(page.ogTitle)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${attr(page.description)}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="https://krivatechnologies.com/brand/og-default.png">`);
  html = html.replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${attr(page.imageAlt)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${attr(page.ogTitle)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${attr(page.description)}">`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="https://krivatechnologies.com/brand/og-default.png">`);
  html = html.replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${page.ogType}">`);
  if (page.ogType !== "article") {
    html = html.replace(/\r?\n<meta property="article:[^"]+" content="[^"]*">/g, "");
  } else {
    html = html.replace(/<meta property="article:published_time" content="[^"]*">/, `<meta property="article:published_time" content="2026-11-14">`);
    html = html.replace(/<meta property="article:modified_time" content="[^"]*">/, `<meta property="article:modified_time" content="2026-11-14">`);
    html = html.replace(/<meta property="article:section" content="[^"]*">/, `<meta property="article:section" content="${attr(page.section)}">`);
    html = html.replace(/\r?\n<meta property="article:tag" content="[^"]*">/g, "");
    html = html.replace(
      `<meta property="article:section" content="${attr(page.section)}">`,
      `<meta property="article:section" content="${attr(page.section)}">\n<meta property="article:tag" content="${attr(page.tag)}">`
    );
  }
  html = html.replace(/<body class="[^"]*">/, `<body class="${page.bodyClass}">`);
  if (page.path === "/pricing") {
    html = html.replace(
      /<li><a class="nav-link" href="\/pricing">Pricing<\/a><\/li>/,
      '<li><a class="nav-link is-current" href="/pricing" aria-current="page">Pricing</a></li>'
    );
  }
  if (!html.includes("/shared/growth.css")) {
    html = html.replace(
      /(<link rel="stylesheet" href="\/shared\/kds\.css\?v=[^"]+">)/,
      '$1\n<link rel="stylesheet" href="/shared/growth.css?v=lead15">'
    );
  }
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">\n${page.main}\n</main>`);
  html = html.replace(
    /<!-- KRIVA_SCHEMA_START -->[\s\S]*?<!-- KRIVA_SCHEMA_END -->/,
    `<!-- KRIVA_SCHEMA_START -->\n<script type="application/ld+json">\n${schemaFor(page)}\n</script>\n<!-- KRIVA_SCHEMA_END -->`
  );
  fs.writeFileSync(path.join(ROOT, page.file), html);
  console.log("wrote", page.file, "words", words(page.main));
}

function patchNav(file) {
  let html = fs.readFileSync(file, "utf8");
  const original = html;
  if (!html.includes('href="/pricing"')) {
    html = html.replace(
      /<li><a class="nav-link(?: is-current)?" href="\/insights"/,
      (m) => `<li><a class="nav-link" href="/pricing">Pricing</a></li>\n            ${m}`
    );
    html = html.replace(
      /<div class="sheet-item"><a class="big" href="\/insights">/,
      '<div class="sheet-item"><a class="big" href="/pricing">Pricing</a></div>\n    <div class="sheet-item"><a class="big" href="/insights">'
    );
    html = html.replace(
      /<li><a href="\/insights">Insights<\/a><\/li>/,
      '<li><a href="/pricing">Pricing</a></li>\n        <li><a href="/insights">Insights</a></li>'
    );
  }
  const desktop = '<li><a href="/solutions/trucking-logistics"><strong>Trucking software</strong><em>Dispatch CRM and TMS for carriers.</em></a></li>';
  const desktopAdd =
    desktop +
    '\n                    <li><a href="/solutions/trucking-company-websites"><strong>Trucking company websites</strong><em>Quote and recruiting sites for carriers.</em></a></li>\n                    <li><a href="/solutions/moving-company-websites"><strong>Moving company websites</strong><em>Quote-first sites for movers.</em></a></li>';
  if (html.includes(desktop) && !html.includes("Trucking company websites</strong><em>")) {
    html = html.replace(desktop, desktopAdd);
  }
  const sheet = '<li><a href="/solutions/trucking-logistics"><strong>Trucking software</strong><span>Dispatch CRM and TMS</span></a></li>';
  const sheetAdd =
    sheet +
    '\n        <li><a href="/solutions/trucking-company-websites"><strong>Trucking company websites</strong><span>Quote and recruiting sites</span></a></li>\n        <li><a href="/solutions/moving-company-websites"><strong>Moving company websites</strong><span>Quote-first mover sites</span></a></li>';
  if (html.includes(sheet) && !html.includes("Trucking company websites</strong><span>")) {
    html = html.replace(sheet, sheetAdd);
  }
  const foot = '<li><a href="/solutions/trucking-logistics">Trucking software</a></li>';
  if (html.includes(foot) && !html.includes(">Trucking company websites</a>")) {
    html = html.replace(
      foot,
      foot +
        '\n        <li><a href="/solutions/trucking-company-websites">Trucking company websites</a></li>\n        <li><a href="/solutions/moving-company-websites">Moving company websites</a></li>'
    );
  }
  html = html.replaceAll(
    "Custom software for trucking, freight, and SaaS companies. Designed and built by one in-house team in Ahmedabad, India.",
    "Websites and custom software for US trucking, moving, and logistics companies, plus SaaS and accounting integrations. Designed and built in Ahmedabad, India."
  );
  html = html.replaceAll(
    "KRIVA Technologies is a product, UI/UX, and engineering studio that designs and builds trucking software, B2B SaaS, and finance integrations for teams in the UK, US, Australia, UAE, and Canada.",
    ORG
  );
  if (html !== original) {
    fs.writeFileSync(file, html);
    return true;
  }
  return false;
}

function patchSite() {
  const vercelPath = path.join(ROOT, "vercel.json");
  const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
  const redirects = [
    ["/kriva-pricing.html", "/pricing"],
    ["/kriva-solution-trucking-websites.html", "/solutions/trucking-company-websites"],
    ["/kriva-solution-moving-websites.html", "/solutions/moving-company-websites"],
    ["/kriva-insight-trucking-website-cost.html", "/insights/trucking-company-website-cost"],
    ["/kriva-insight-moving-website-features.html", "/insights/moving-company-website-features"],
  ];
  for (const [source, destination] of redirects) {
    if (!vercel.redirects.some((r) => r.source === source)) {
      vercel.redirects.push({ source, destination, permanent: true });
    }
  }
  const rewrites = [
    ["/pricing", "/kriva-pricing.html"],
    ["/solutions/trucking-company-websites", "/kriva-solution-trucking-websites.html"],
    ["/solutions/moving-company-websites", "/kriva-solution-moving-websites.html"],
    ["/insights/trucking-company-website-cost", "/kriva-insight-trucking-website-cost.html"],
    ["/insights/moving-company-website-features", "/kriva-insight-moving-website-features.html"],
  ];
  const catchIdx = vercel.rewrites.findIndex((r) => r.source === "/insights/:file*");
  let insertAt = catchIdx === -1 ? vercel.rewrites.length : catchIdx;
  for (const [source, destination] of rewrites) {
    if (!vercel.rewrites.some((r) => r.source === source)) {
      vercel.rewrites.splice(insertAt, 0, { source, destination });
      insertAt += 1;
    }
  }
  fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");

  let site = fs.readFileSync(path.join(ROOT, "shared", "site.js"), "utf8");
  site = site.replace(
    /const ENTITY_DESCRIPTION =\s*\n\s*"[^"]+";/,
    `const ENTITY_DESCRIPTION =\n  ${JSON.stringify(ORG)};`
  );
  if (!site.includes("Moving company websites")) {
    site = site.replace(
      '"Custom software development",',
      '"Custom software development",\n  "Trucking company websites",\n  "Moving company websites",\n  "Website design",'
    );
  }
  if (!site.includes('routePath === "/pricing"')) {
    site = site.replace(
      'if (routePath === "/contact") return "0.9";',
      'if (routePath === "/contact" || routePath === "/pricing") return "0.9";'
    );
  }
  fs.writeFileSync(path.join(ROOT, "shared", "site.js"), site);

  let crawl = fs.readFileSync(path.join(ROOT, "_crawl_links.js"), "utf8");
  if (!crawl.includes('"/pricing"')) {
    crawl = crawl.replace(
      '"/contact": "kriva-contact.html",',
      '"/contact": "kriva-contact.html",\n  "/pricing": "kriva-pricing.html",'
    );
    crawl = crawl.replace(
      '"/solutions/car-transportation": "kriva-solution-car-transport.html",',
      '"/solutions/car-transportation": "kriva-solution-car-transport.html",\n  "/solutions/trucking-company-websites": "kriva-solution-trucking-websites.html",\n  "/solutions/moving-company-websites": "kriva-solution-moving-websites.html",'
    );
    crawl = crawl.replace(
      '"/insights/choosing-a-digital-agency": "kriva-insight-choosing-a-digital-agency.html",',
      '"/insights/choosing-a-digital-agency": "kriva-insight-choosing-a-digital-agency.html",\n  "/insights/trucking-company-website-cost": "kriva-insight-trucking-website-cost.html",\n  "/insights/moving-company-website-features": "kriva-insight-moving-website-features.html",'
    );
    fs.writeFileSync(path.join(ROOT, "_crawl_links.js"), crawl);
  }
}

function patchCopy() {
  const home = path.join(ROOT, "kriva-redesign.html");
  let html = fs.readFileSync(home, "utf8");
  html = html.replace(
    "<title>Custom Trucking, SaaS &amp; Accounting Software | KRIVA</title>",
    "<title>Trucking, Moving and Logistics Websites and Software | KRIVA</title>"
  );
  html = html.replaceAll(
    "Custom Trucking, SaaS &amp; Accounting Software | KRIVA",
    "Trucking, Moving and Logistics Websites and Software | KRIVA"
  );
  const oldDesc =
    "KRIVA builds dispatch CRMs, driver apps, fleet dashboards, SaaS products, and QuickBooks and Xero integrations for US companies. Book a free 20-minute fit call.";
  const newDesc =
    "KRIVA designs websites, mobile apps, and custom software for US trucking, moving, and logistics companies, plus SaaS products and QuickBooks and Xero integrations.";
  html = html.replaceAll(oldDesc, newDesc);
  html = html.replace(
    "KRIVA Technologies: custom software for US trucking, freight, and SaaS companies",
    "KRIVA Technologies: websites and software for US trucking, moving, and logistics companies"
  );
  html = html.replace(
    '<p class="k-kicker">Product design and software engineering</p>',
    '<p class="k-kicker">Design and software for transportation businesses</p>'
  );
  html = html.replace(
    '<h1 id="h1">Custom software for US trucking, freight, and SaaS companies.</h1>',
    '<h1 id="h1">Websites and software for US trucking, moving, and logistics companies.</h1>'
  );
  html = html.replace(
    '<p class="k-lede">We design and build dispatch CRMs, driver apps, fleet dashboards, SaaS products, and QuickBooks and Xero integrations. One in-house team, a working demo every week, and you own the code.</p>',
    '<p class="k-lede">We design company websites, mobile apps, dispatch tools, SaaS products, and QuickBooks and Xero integrations. One in-house team in Ahmedabad, working with US companies. You own the code.</p>'
  );
  html = html.replace(
    '<a class="btn ghost" href="/contact#brief"><span>Send a project brief</span><i>→</i></a>',
    '<a class="btn ghost" href="/pricing"><span>Get a free project estimate</span><i>→</i></a>'
  );
  html = html.replace(
    '<p class="k-also">Moving cars instead of freight? See <a href="/solutions/car-transportation">auto transport software</a>. Running a fleet? See <a href="/solutions/fleet-management-software">fleet management software</a>.</p>',
    '<p class="k-also">Need the public site first? See <a href="/solutions/trucking-company-websites">trucking company websites</a> and <a href="/solutions/moving-company-websites">moving company websites</a>. Starting prices are on the <a href="/pricing">pricing page</a>. Moving cars? See <a href="/solutions/car-transportation">auto transport software</a>.</p>'
  );
  const formInsert = `    <div class="inq-row">
     <div>
      <label for="inq-site">Website <span class="opt">Optional</span></label>
      <input id="inq-site" name="site" type="url" inputmode="url" placeholder="https://" autocomplete="url">
     </div>
     <div>
      <label for="inq-budget">Approximate budget <span class="opt">Optional</span></label>
      <select id="inq-budget" name="budget">
       <option value="">Select a range</option>
       <option>Under $5k</option>
       <option>$5k - $15k</option>
       <option>$15k - $40k</option>
       <option>$40k - $100k</option>
       <option>$100k+</option>
       <option>Not sure yet</option>
      </select>
     </div>
    </div>
`;
  if (!html.includes('id="inq-budget"')) {
    const formRe = /<option>Not sure yet<\/option>\r?\n\s*<\/select>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<div>\r?\n\s*<label for="inq-details">/;
    if (!formRe.test(html)) console.log("HOME FORM ANCHOR MISSING");
    html = html.replace(formRe, (m) => m.replace(/\s*<div>\s*<label for="inq-details">/, "\n" + formInsert + "    <div>\n     <label for=\"inq-details\">"));
    html = html.replace(
      "<option>Trucking or dispatch software</option>",
      "<option>Trucking or moving company website</option>\n       <option>Trucking or dispatch software</option>\n       <option>Moving company software</option>\n       <option>Mobile app</option>"
    );
  }
  const oldPrice =
    "Fixed-scope projects, sprint-based work, or a monthly retainer. Everything is scoped after discovery, with deliverables and milestones agreed up front.";
  const newPrice =
    "Website, app, design, dashboard, and accounting work have published starting prices for a defined scope. Dispatch platforms and other custom software are quoted after discovery. Engagements run as fixed-scope projects, sprints, or a monthly retainer. Starting prices: https://krivatechnologies.com/pricing.";
  html = html.replaceAll(oldPrice, newPrice);
  html = html.replaceAll(
    `<p>${newPrice}</p>`,
    `<p>${newPrice.replace("https://krivatechnologies.com/pricing.", '<a href="/pricing">the pricing page</a>.')}</p>`
  );
  fs.writeFileSync(home, html);

  const files = [
    "kriva-faq.html",
    "kriva-solution-saas.html",
    "kriva-solution-accounting.html",
    "kriva-solution-fleet-management.html",
    "kriva-insight-dispatch-software-cost.html",
    "kriva-service-web-development.html",
    "kriva-solutions-index.html",
    "kriva-services-index.html",
    "kriva-industries.html",
    "kriva-contact.html",
  ];
  for (const name of files) {
    const p = path.join(ROOT, name);
    let t = fs.readFileSync(p, "utf8");
    const before = t;
    t = t.replaceAll(oldPrice, newPrice);
    t = t.replaceAll(
      `<p>${newPrice}</p>`,
      `<p>${newPrice.replace("https://krivatechnologies.com/pricing.", '<a href="/pricing">the pricing page</a>.')}</p>`
    );
    if (name === "kriva-insight-dispatch-software-cost.html") {
      t = t.replace(
        "We do not publish a price list, because two carriers asking for \"a dispatch system\" rarely want the same thing. What we can do is show you where the money goes, so you can estimate it yourself and compare vendor quotes on equal terms.",
        "A full dispatch system does not have one price, because two carriers asking for a dispatch system rarely want the same thing. Starting prices for a defined website, app, dashboard, or accounting sync are on the <a href=\"/pricing\">pricing page</a>. This guide shows where a dispatch budget actually goes, so you can compare vendor quotes on equal terms."
      );
    }
    if (name === "kriva-service-web-development.html") {
      t = t.replace(
        "Screens behind a login are designed under <a href=\"/services/web-application-design\">web application design</a>.</p>",
        "Screens behind a login are designed under <a href=\"/services/web-application-design\">web application design</a>. Industry pages: <a href=\"/solutions/trucking-company-websites\">trucking company websites</a> and <a href=\"/solutions/moving-company-websites\">moving company websites</a>. <a href=\"/pricing#websites\">Starting price</a>.</p>"
      );
    }
    if (name === "kriva-solutions-index.html") {
      t = t.replace(
        "KRIVA builds dispatch CRM, B2B SaaS, accounting integrations, and auto-transport software for operators in the US, UK, <a href=\"/markets/uae\">UAE</a>, and Canada. Same in-house team from discovery through launch.</p>",
        "KRIVA builds company websites, dispatch CRM, B2B SaaS, accounting integrations, and auto-transport software for operators in the US, UK, <a href=\"/markets/uae\">UAE</a>, and Canada. Same in-house team from discovery through launch. <a href=\"/solutions/trucking-company-websites\">Trucking websites</a>, <a href=\"/solutions/moving-company-websites\">moving websites</a>, <a href=\"/pricing\">pricing</a>.</p>"
      );
    }
    if (name === "kriva-services-index.html") {
      t = t.replace(
        "Product design, UI/UX, SaaS, dashboards, CRM, mobile, and web for US trucking ops, SaaS product teams, and finance systems - designed and engineered by one in-house team. You bring the problem; we shape the stack.</p>",
        "Websites, product design, mobile apps, dashboards, CRM, and accounting integrations for trucking, moving, logistics, and SaaS teams. One in-house team. <a href=\"/pricing\">Starting prices</a>.</p>"
      );
    }
    if (name === "kriva-industries.html") {
      t = t.replace(
        "Five industries where we speak your desk&rsquo;s language, trucking ops, B2B SaaS, finance sync, auto transport, and CRM. Pick your market, follow the solution path, then review published work before a fit call.</p>",
        "Trucking, moving, logistics, B2B SaaS, and finance. Start with a <a href=\"/solutions/trucking-company-websites\">trucking website</a> or a <a href=\"/solutions/moving-company-websites\">moving website</a> when the public site is the gap, or with the software the desk uses. <a href=\"/pricing\">Starting prices</a>.</p>"
      );
    }
    if (name === "kriva-contact.html" && !t.includes("Trucking company website")) {
      t = t.replace(
        "<option>Web Design &amp; Development</option>",
        "<option>Trucking company website</option>\n                      <option>Moving company website</option>\n                      <option>Web Design &amp; Development</option>"
      );
    }
    if (t !== before) fs.writeFileSync(p, t);
  }

  const insights = path.join(ROOT, "kriva-insights-index.html");
  let ins = fs.readFileSync(insights, "utf8");
  if (!ins.includes("/insights/trucking-company-website-cost")) {
    const rows = `
      <article class="ins-row" data-cat="Trucking &amp; Logistics">
        <span class="n num">00</span>
        <div>
          <p class="cat">Trucking &amp; Logistics</p>
          <h3><a href="/insights/trucking-company-website-cost">How much does a trucking company website cost?</a></h3>
          <p class="ex">Published 2026 prices from other companies, and what KRIVA’s $4,800 starting website scope includes.</p>
          <p class="rel"><a href="/solutions/trucking-company-websites">Trucking websites</a> · <a href="/pricing">Pricing</a></p>
        </div>
        <div class="meta"><span>Nov 2026</span><span>8 min read</span></div>
        <span class="go">Read <i>→</i></span>
      </article>
      <article class="ins-row" data-cat="Trucking &amp; Logistics">
        <span class="n num">00</span>
        <div>
          <p class="cat">Moving</p>
          <h3><a href="/insights/moving-company-website-features">What features should a moving company website have?</a></h3>
          <p class="ex">The form fields, service pages, and service area that turn a moving search into a request the office can price.</p>
          <p class="rel"><a href="/solutions/moving-company-websites">Moving websites</a> · <a href="/pricing">Pricing</a></p>
        </div>
        <div class="meta"><span>Nov 2026</span><span>7 min read</span></div>
        <span class="go">Read <i>→</i></span>
      </article>`;
    ins = ins.replace('<div id="ledger">', '<div id="ledger">' + rows);
    const start = ins.indexOf('<div id="ledger">');
    const end = ins.indexOf("</section>", start);
    let chunk = ins.slice(start, end);
    let n = 0;
    chunk = chunk.replace(/<span class="n num">\d+<\/span>/g, () => {
      n += 1;
      return `<span class="n num">${String(n).padStart(2, "0")}</span>`;
    });
    ins = ins.slice(0, start) + chunk + ins.slice(end);
    ins = ins.replace('All <u class="num">10</u>', 'All <u class="num">12</u>');
    ins = ins.replace('Trucking &amp; Logistics <u class="num">3</u>', 'Trucking &amp; Logistics <u class="num">5</u>');
    ins = ins.replace("Showing 10 of 10", "Showing 12 of 12");
    fs.writeFileSync(insights, ins);
  }

  const dataPath = path.join(ROOT, "content", "insights-data.cjs");
  let data = fs.readFileSync(dataPath, "utf8");
  if (!data.includes("trucking-company-website-cost")) {
    data = data.replace(
      "posts: [\n    {",
      `posts: [
    {
      slug: "trucking-company-website-cost",
      title: "How much does a trucking company website cost?",
      category: "Trucking & Logistics",
      read: "8 min read",
      published: "November 2026",
      publishedISO: "2026-11-14",
      excerpt: "Published 2026 prices from other companies, and what KRIVA’s $4,800 starting website scope includes.",
      byline: "KRIVA Technologies",
      relatedSolutions: [],
      blocks: [],
    },
    {
      slug: "moving-company-website-features",
      title: "What features should a moving company website have?",
      category: "Moving",
      read: "7 min read",
      published: "November 2026",
      publishedISO: "2026-11-14",
      excerpt: "The form fields, service pages, and service area that turn a moving search into a request the office can price.",
      byline: "KRIVA Technologies",
      relatedSolutions: [],
      blocks: [],
    },
    {`
    );
    fs.writeFileSync(dataPath, data);
  }

  let llms = fs.readFileSync(path.join(ROOT, "llms.txt"), "utf8");
  if (!llms.includes("/pricing")) {
    llms = llms.replace(
      "> KRIVA Technologies is a product, UI/UX, and engineering studio that designs and builds trucking software, B2B SaaS, and finance integrations for teams in the UK, US, Australia, UAE, and Canada.",
      "> " + ORG
    );
    llms = llms.replace(
      "- [Contact](https://krivatechnologies.com/contact)",
      "- [Contact](https://krivatechnologies.com/contact)\n- [Pricing](https://krivatechnologies.com/pricing): starting prices in USD for websites, mobile apps, product design, custom software, and QuickBooks or Xero integrations"
    );
    llms = llms.replace(
      "- [Freight broker software](https://krivatechnologies.com/solutions/freight-broker-software)",
      "- [Trucking company websites](https://krivatechnologies.com/solutions/trucking-company-websites)\n- [Moving company websites](https://krivatechnologies.com/solutions/moving-company-websites)\n- [Freight broker software](https://krivatechnologies.com/solutions/freight-broker-software)"
    );
    llms = llms.replace(
      "- [Choosing a digital agency](https://krivatechnologies.com/insights/choosing-a-digital-agency)",
      "- [Choosing a digital agency](https://krivatechnologies.com/insights/choosing-a-digital-agency)\n- [Trucking company website cost](https://krivatechnologies.com/insights/trucking-company-website-cost)\n- [Moving company website features](https://krivatechnologies.com/insights/moving-company-website-features)"
    );
    fs.writeFileSync(path.join(ROOT, "llms.txt"), llms);
  }
}

for (const page of pages) build(page);
let navCount = 0;
for (const file of fs.readdirSync(ROOT)) {
  if (file.endsWith(".html")) {
    if (patchNav(path.join(ROOT, file))) navCount += 1;
  }
}
patchSite();
patchCopy();
console.log("nav files touched", navCount);
