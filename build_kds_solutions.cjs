#!/usr/bin/env node
/* Builds the freight broker and fleet management solution pages, then registers routes.
   Copy states capabilities only: no client names, metrics, certifications, or partner claims. */
const fs = require("fs");
const BASE = "https://krivatechnologies.com";
const PAGES = [
  {
    file: "kriva-solution-freight-broker.html",
    path: "/solutions/freight-broker-software",
    title: "Custom Freight Broker Software Development | KRIVA",
    desc: "KRIVA builds custom freight broker software: quoting, carrier sales, load tracking, and QuickBooks or Xero sync. Book a free 20-minute fit call.",
    crumb: "Freight broker software",
    kicker: "For freight brokers and 3PLs",
    h1: "Custom freight broker software, from quote to carrier pay",
    lede: "We design and build broker software that holds the whole load in one record: quotes, carrier sales, tracking, documents, and invoicing. It runs beside your current TMS, or replaces it in stages.",
    ui: { head: "Open loads", sub: "Needs cover", rows: [["#7714 ATL → DFW", "No carrier", "r"], ["#7711 LAX → PHX", "2 offers", "a"], ["#7708 CHI → MEM", "Rate con sent", ""], ["#7702 SEA → BOI", "In transit", "g"]] },
    probH: "Where broker desks lose time and margin",
    prob: [
      ["Quotes live in email", "Rates get pulled from memory, a spreadsheet, and a load board. Nobody can see which quotes won, or why."],
      ["Carrier sales is a phone list", "Your best carriers sit in one broker's notes. When that broker is out, the relationship goes with them."],
      ["Check calls eat the afternoon", "Status lives in texts and calls, so customers ask before your team knows."],
      ["Carrier checks happen late", "Authority and insurance get reviewed in a rush, after the load is already promised."],
      ["Paperwork holds up cash", "Rate confirmations, proof of delivery, and invoices sit in different places, so billing waits on someone finding a PDF."],
      ["Margin shows up at month-end", "You find out which customers and lanes made money long after you could have acted on it."],
    ],
    delH: "What we build for brokerages",
    del: [
      ["Quoting and customer management", "Quote history by lane and customer, won and lost tracking, and follow-ups that don't depend on someone's inbox."],
      ["Carrier sales and capacity", "A carrier database your whole team shares, lane preferences, offer tracking, and load board connections where your plan and their API allow it."],
      ["Carrier onboarding", "A self-serve packet, document capture, and insurance expiry reminders, with authority checks built into your own workflow."],
      ["Load tracking board", "One board sorted by what needs attention, with exceptions on top and tracking updates from the source you already pay for."],
      ["Documents and billing", "Rate confirmations, proof of delivery, and invoices attached to the load, and synced to QuickBooks or Xero."],
      ["Margin and team reporting", "Margin by load, lane, customer, and broker, available while you can still act on it."],
    ],
    improveH: "What changes for your team",
    improve: ["Every broker works from the same load record and carrier history", "New staff can cover a desk without inheriting a personal spreadsheet", "Billing starts when delivery is confirmed, not when someone finds the paperwork", "Owners see margin during the month, not after it"],
    buyH: "Should a brokerage build or buy?",
    buy: "Buy a TMS if your freight and process are fairly standard. A good off-the-shelf product is cheaper and quicker. Build when your edge is how you quote, cover, or serve a niche, and the software keeps forcing workarounds. Many brokerages land in the middle: keep the TMS as the record, and build the desk tools around it.",
    buyLink: ["/insights/build-vs-buy-tms", "Read our build vs buy guide"],
    proof: "We have not yet published a freight broker case study. Our closest published work is ShiftRail, a dispatch console for a US trucking desk handling 400+ routes a day, with 32% less manual handle time. It solves many of the same problems: bulk work, exceptions, and a side spreadsheet.",
    faq: [
      ["Can this work with our existing TMS?", "Usually, yes, if the TMS offers an API or data export. We build beside it and only replace parts of it when that clearly pays off. We check what your TMS allows during discovery."],
      ["Can you connect to load boards and tracking providers?", "Where the provider offers an API and your plan includes access. Access rules vary by provider, so we confirm this before scoping rather than assuming it."],
      ["How long does a first version take?", "A focused first version is usually 6 to 10 weeks after a 1 to 2 week discovery. A full platform with integrations usually runs 12 to 20 weeks."],
      ["Who owns the software?", "You do. Code, designs, and documentation transfer to you at project close or earlier."],
    ],
    formS: "Solution: freight broker software",
    placeholder: "Example: We are a 12-person brokerage. Quotes live in email, and carrier history lives in one broker's spreadsheet.",
    related: [["/solutions/trucking-logistics", "Trucking software"], ["/solutions/accounting-integrations", "QuickBooks and Xero integrations"], ["/services/crm-development", "Custom CRM development"], ["/insights/dispatch-software-cost", "What custom dispatch software costs"]],
  },
  {
    file: "kriva-solution-fleet-management.html",
    path: "/solutions/fleet-management-software",
    title: "Custom Fleet Management Software Development | KRIVA",
    desc: "KRIVA builds custom fleet management software: dashboards, driver apps, maintenance and compliance records, and accounting sync. Book a free 20-minute fit call.",
    crumb: "Fleet management software",
    kicker: "For fleet owners and operators",
    h1: "Custom fleet management software built around your operation",
    lede: "We design and build fleet dashboards, driver apps, and maintenance and compliance records that bring your ELD, fuel, and accounting data into one place, so your team stops rebuilding it by hand.",
    ui: { head: "Fleet today", sub: "Needs attention", rows: [["Truck 214", "Service overdue", "r"], ["Truck 187", "Permit in 9 days", "a"], ["Driver J. Ruiz", "Medical card due", "a"], ["Truck 203", "On route", "g"]] },
    probH: "Why fleets outgrow their tools",
    prob: [
      ["Data is in five portals", "ELD, fuel cards, maintenance, and accounting each have their own login, and none of them agree."],
      ["Maintenance runs on memory", "Service schedules live on a whiteboard, so trucks come off the road when they break, not when you plan it."],
      ["Compliance dates sneak up", "Permits, medical cards, and inspections are tracked in a spreadsheet one person maintains."],
      ["IFTA gets rebuilt every quarter", "Miles and fuel by state are pieced together from exports just before filing. The federal ELD rule does not define tax mileage, so you can't assume your logs already cover it."],
      ["Drivers fight the app", "Tools built for the office fail one-handed in a yard with a weak signal."],
      ["Nobody trusts cost per mile", "Without one source of data, the number changes depending on who pulled it."],
    ],
    delH: "What we build for fleets",
    del: [
      ["Fleet operations dashboard", "Vehicles, drivers, and exceptions on one screen, sorted by what needs action today rather than by chart."],
      ["Driver mobile apps", "Status updates, documents, and proof of delivery that keep working offline and sync when the signal returns."],
      ["Maintenance records", "Service schedules by mileage or date, work order history, and reminders before a truck is due."],
      ["Compliance tracking", "Expiry reminders for permits, medical cards, and inspections, plus records you can pull up for an audit."],
      ["ELD, fuel, and telematics data", "We read data from your existing provider's API. We don't sell ELD hardware, and you keep the provider you already use."],
      ["Cost and accounting sync", "Fuel, maintenance, and settlement data connected to QuickBooks or Xero, so cost per mile has one source."],
    ],
    improveH: "What changes for your team",
    improve: ["One place to see which trucks and drivers need attention today", "Planned maintenance instead of roadside surprises", "IFTA miles and fuel receipts kept by jurisdiction as trips happen, ready for your accountant or filing tool", "Cost per mile that everyone pulls from the same data"],
    buyH: "Should a fleet build or buy?",
    buy: "Most fleets should start with an established telematics and ELD platform, and we won't try to replace that hardware. Custom software makes sense on top of it, when your workflows cross several systems, or the reports you need don't exist in any of them. We are not legal or tax advisers, so your compliance owner signs off on the rules.",
    buyLink: ["/insights/build-vs-buy-tms", "Read our build vs buy guide"],
    proof: "Our published trucking work includes ShiftRail, a dispatch console for a US desk handling 400+ routes a day, with 32% less manual handle time, rolled out beside the existing TMS. The same approach applies here: observe the work, ship weekly, and roll out in phases.",
    faq: [
      ["Will this replace our ELD provider?", "No. We read data from your provider where its API allows it. ELD devices and their certification stay with your provider."],
      ["Can drivers use the app with poor signal?", "Yes. We design driver flows to queue updates offline and sync when the connection returns, and we test them on real devices."],
      ["How long does a first version take?", "A focused first version is usually 6 to 10 weeks after a 1 to 2 week discovery. A full platform with integrations usually runs 12 to 20 weeks."],
      ["Who owns the software?", "You do. Code, designs, and documentation transfer to you at project close or earlier."],
    ],
    formS: "Solution: fleet management software",
    placeholder: "Example: We run 60 trucks. Maintenance is on a whiteboard, and IFTA is rebuilt from exports every quarter.",
    related: [["/solutions/trucking-logistics", "Trucking software"], ["/services/mobile-applications", "Driver app development"], ["/services/dashboard-design", "Business dashboards"], ["/markets/us", "Software for US companies"]],
  },
];

const esc = (s) => s.replace(/&/g, "&amp;");
const tpl = fs.readFileSync("kriva-market-us.html", "utf8");
let head = tpl.slice(0, tpl.indexOf("<body"));
head = head.replace(/<!-- KRIVA_SCHEMA_START -->[\s\S]*?<!-- KRIVA_SCHEMA_END -->/, "");
head = head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
head = head.replace(/<link rel="stylesheet" href="\/shared\/markets\.css[^"]*">\r?\n?/, "");
head = head.replace(/(<link rel="stylesheet" href="\/shared\/chrome\.css)/, '<link rel="stylesheet" href="/shared/home-v2.css?v=kds1">\n$1');

function build(p) {
  const url = BASE + p.path;
  let h = head
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(p.desc)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(p.title)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(p.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(p.desc)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(p.desc)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${BASE}/brand/og-default.png`)
    .replace(/(<meta name="twitter:image" content=")[^"]*/, `$1${BASE}/brand/og-default.png`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${esc(p.crumb)} by KRIVA Technologies`)
    .replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\r?\n?/g, "");
  h = h.replace("</head>", `<link rel="alternate" hreflang="en" href="${url}">\n</head>`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", "@id": url + "#service", name: p.crumb, description: p.desc, url, serviceType: p.crumb, provider: { "@id": BASE + "/#organization", "@type": "ProfessionalService", name: "KRIVA Technologies", url: BASE }, areaServed: [{ "@type": "Country", name: "United States" }] },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BASE + "/" }, { "@type": "ListItem", position: 2, name: "Solutions", item: BASE + "/solutions" }, { "@type": "ListItem", position: 3, name: p.crumb, item: url }] },
      { "@type": "FAQPage", mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };
  const tone = { r: "r", a: "a", g: "g", "": "" };
  const main = `<main id="main" class="k-sol">
<section class="k-hero k-sol-hero" aria-labelledby="h1">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-hidden="true">/</li><li><a href="/solutions">Solutions</a></li><li aria-hidden="true">/</li><li aria-current="page">${p.crumb}</li></ol></nav>
    <div class="k-hero-grid">
      <div class="k-hero-copy">
        <p class="k-kicker">${p.kicker}</p>
        <h1 id="h1">${p.h1}</h1>
        <p class="k-lede">${p.lede}</p>
        <div class="k-actions">
          <a class="btn" href="#inquire"><span>Book a free 20-minute fit call</span><i>→</i></a>
          <a class="btn ghost" href="/contact#brief"><span>Send a project brief</span><i>→</i></a>
        </div>
        <ul class="k-assure"><li>Reply within one business day</li><li>You own the code</li><li>NDA on request</li></ul>
      </div>
      <figure class="k-sol-ui">
        <div class="k-case-ui" aria-hidden="true">
          <div class="k-ui-head"><b>${p.ui.head}</b><span>${p.ui.sub}</span></div>
          ${p.ui.rows.map((r) => `<div class="k-ui-row"><span>${r[0]}</span><em class="${tone[r[2]]}">${r[1]}</em></div>`).join("\n          ")}
        </div>
        <figcaption>Sample screen with sample data.</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="k-sec k-sec--tint" aria-labelledby="probH">
  <div class="wrap">
    <div class="k-head"><p class="k-kicker">The problem</p><h2 id="probH">${p.probH}</h2></div>
    <div class="k-grid3">${p.prob.map((x) => `<article class="k-card"><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</div>
  </div>
</section>

<section class="k-sec" aria-labelledby="delH">
  <div class="wrap">
    <div class="k-head"><p class="k-kicker">What we deliver</p><h2 id="delH">${p.delH}</h2></div>
    <div class="k-grid3">${p.del.map((x) => `<article class="k-card k-card--line"><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</div>
    <div class="k-int-logos k-sol-logos">
      <img src="/brand/logos/intuit-quickbooks.svg" alt="Intuit QuickBooks" width="165" height="42" loading="lazy">
      <img src="/brand/logos/xero.svg" alt="Xero" width="52" height="52" loading="lazy">
      <p class="k-note">We build on the public Intuit and Xero APIs as an independent team, not as a partner of either company.</p>
    </div>
  </div>
</section>

<section class="k-sec k-sec--ink" aria-labelledby="impH">
  <div class="wrap k-team">
    <div><p class="k-kicker">The outcome</p><h2 id="impH">${p.improveH}</h2></div>
    <ul class="k-ticks k-ticks--dark">${p.improve.map((x) => `<li>${x}</li>`).join("")}</ul>
  </div>
</section>

<section class="k-sec" aria-labelledby="buyH">
  <div class="wrap k-int">
    <div>
      <p class="k-kicker">An honest answer</p>
      <h2 id="buyH">${p.buyH}</h2>
      <p class="k-lede">${p.buy}</p>
      <a class="k-more" href="${p.buyLink[0]}">${p.buyLink[1]} <i>→</i></a>
    </div>
    <div class="k-int-panel">
      <h3 class="k-panel-h">Why talk to KRIVA</h3>
      <p class="k-panel-p">${p.proof}</p>
      <a class="k-more" href="/work/shiftrail-dispatch">Read the ShiftRail case study <i>→</i></a>
    </div>
  </div>
</section>

<section class="k-sec k-sec--tint" aria-labelledby="stepsH">
  <div class="wrap">
    <div class="k-head k-head--split"><div><p class="k-kicker">How to start</p><h2 id="stepsH">From first call to live software.</h2></div><a class="k-more" href="/process">See the full process <i>→</i></a></div>
    <ol class="k-steps">
      <li><span class="k-step-t">20 minutes, free</span><h3>Fit call</h3><p>Show us what your team works around. You leave with a clear yes, no, or not yet.</p></li>
      <li><span class="k-step-t">1 to 2 weeks</span><h3>Discovery</h3><p>We map how the work really happens and write a scoped brief you sign off.</p></li>
      <li><span class="k-step-t">6 to 20 weeks</span><h3>Design and build</h3><p>Working software on a real URL every week, with a QA check before each demo.</p></li>
      <li><span class="k-step-t">Your choice</span><h3>Launch and support</h3><p>Phased go-live, then a monthly retainer or a clean handover to your team.</p></li>
    </ol>
  </div>
</section>

<section class="k-sec" aria-labelledby="faqH">
  <div class="wrap k-faq-grid">
    <div><p class="k-kicker">Questions</p><h2 id="faqH">Common questions</h2>
      <ul class="k-rel">${p.related.map((r) => `<li><a href="${r[0]}">${r[1]}</a></li>`).join("")}</ul>
    </div>
    <div class="k-faq">${p.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")}</div>
  </div>
</section>

<section class="inq-sec" id="inquire" aria-labelledby="inqH">
  <div class="wrap inq-grid">
    <div class="inq-copy">
      <p class="eyebrow">Start a conversation</p>
      <h2 class="d2" id="inqH">Tell us what your team works around.</h2>
      <p class="lede">We will tell you whether to fix it, integrate it, rebuild it, or leave it alone. We reply within one business day.</p>
      <p class="inq-help">Prefer email? <a href="mailto:hello@krivatechnologies.com">hello@krivatechnologies.com</a>. Have a longer brief or files? <a href="/contact#brief">Send a project brief</a>.</p>
    </div>
    <div>
      <form class="inq-form" id="pageInquiry" action="/api/inquiry" method="post" novalidate>
        <input type="hidden" name="inquiry_type" value="page_inquiry">
        <input type="hidden" name="page" value="${p.path}">
        <input type="hidden" name="service" value="${p.formS}">
        <p class="inq-hp"><label>Leave blank <input name="website_hp" tabindex="-1" autocomplete="off"></label></p>
        <div class="inq-row">
          <div><label for="inq-name">Name <span class="req">Required</span></label><input id="inq-name" name="name" required autocomplete="name"><p class="inq-err" id="inq-name-err">Enter your name.</p></div>
          <div><label for="inq-email">Work email <span class="req">Required</span></label><input id="inq-email" name="email" type="email" required autocomplete="email" inputmode="email"><p class="inq-err" id="inq-email-err">Enter a valid work email.</p></div>
        </div>
        <div><label for="inq-company">Company <span class="opt">Optional</span></label><input id="inq-company" name="company" autocomplete="organization"></div>
        <div><label for="inq-details">What is your team working around today? <span class="req">Required</span></label><textarea id="inq-details" name="details" required rows="4" placeholder="${p.placeholder}"></textarea><p class="inq-err" id="inq-details-err">A sentence or two is enough.</p></div>
        <p class="inq-fail" role="alert"></p>
        <div class="inq-actions"><button type="submit" class="btn"><span class="inq-submit-label">Book a free 20-minute fit call</span><i>→</i></button><p class="inq-note">No commitment. NDA on request.</p></div>
        <p class="inq-status" data-inq-status aria-live="polite"></p>
      </form>
      <div class="inq-done" tabindex="-1"><h3>Thank you!</h3><p>Your inquiry has been submitted successfully. We'll be in touch soon.</p></div>
    </div>
  </div>
</section>
</main>`;
  const body = `<body class="k-page">
<a class="skip" href="#main">Skip to content</a>
<!--KRIVA_CHROME-->
${main}
<!--KRIVA_FOOTER-->
<script src="/shared/chrome.js" defer></script>
<script src="/shared/page-inquiry.js?v=kds4" defer></script>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</body>
</html>
`;
  fs.writeFileSync(p.file, h + body);
}
PAGES.forEach(build);

// ---- Register routes (idempotent)
const v = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
for (const p of PAGES) {
  if (!v.rewrites.some((r) => r.source === p.path)) v.rewrites.push({ source: p.path, destination: "/" + p.file });
  if (!v.redirects.some((r) => r.source === "/" + p.file)) v.redirects.push({ source: "/" + p.file, destination: p.path, permanent: true });
}
fs.writeFileSync("vercel.json", JSON.stringify(v, null, 2) + "\n");
let c = fs.readFileSync("_crawl_links.js", "utf8");
for (const p of PAGES) if (!c.includes(p.file)) c = c.replace('"/solutions/saas":', `"${p.path}": "${p.file}",\n  "/solutions/saas":`);
fs.writeFileSync("_crawl_links.js", c);
let sm = fs.readFileSync("sitemap.xml", "utf8");
for (const p of PAGES) if (!sm.includes(p.path)) sm = sm.replace("</urlset>", `  <url>\n    <loc>${BASE}${p.path}</loc>\n    <lastmod>2026-11-06</lastmod>\n  </url>\n</urlset>`);
fs.writeFileSync("sitemap.xml", sm);
let ll = fs.readFileSync("llms.txt", "utf8");
for (const p of PAGES) if (!ll.includes(p.path)) ll = ll.replace(/(- \[Car transportation software\]\([^)]*\)[^\n]*\n)/, `$1- [${p.crumb}](${BASE}${p.path})\n`);
fs.writeFileSync("llms.txt", ll);
console.log("built", PAGES.map((p) => p.path).join(", "));
