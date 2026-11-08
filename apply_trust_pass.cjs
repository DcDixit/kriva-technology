#!/usr/bin/env node
/* Trust and conversion pass, 2026-11. HTML is the source of truth; safe to re-run.
   - Removes internal notes from case studies and uses one plain explanation of representative work.
   - Adds a next-step panel to inner-page heroes, with a per-page "bring to the call" line.
   - Moves the contact form above the fold.
   Uses only claims already published on the site; adds no client, figure, or outcome. */
const fs = require("fs");

const edit = (file, fn) => {
  const before = fs.readFileSync(file, "utf8");
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    console.log("updated", file);
  }
};

/* ── Case studies ── */
const NOTE =
  'Representative project: it shows the kind of problem we take on and how we approach it. Project names may be portfolio names, screens are illustrative, and we do not publish outcome figures. <a href="/work#how-to-read">How to read our work</a>.';
for (const f of fs.readdirSync(".").filter((n) => /^kriva-case-.*\.html$/.test(n))) {
  edit(f, (s) =>
    s
      .replace(/<em>\s*(Verified case label|From published case source|Linked below)\s*<\/em>/g, "")
      .replace(/<p class="mrail-note">[\s\S]*?<\/p>/, `<p class="mrail-note">${NOTE}</p>`)
      .replace(/\s*No signed-off metrics on this case\./g, " Representative project; no outcome figures published.")
      .replace(/Illustrative · narrative case · no signed-off metrics/g, "Illustrative screens · representative project · no client data")
  );
}
edit("kriva-case-finance-sync.html", (s) =>
  s
    .replace(
      "Built reliable QuickBooks/Xero reconciliation workflows with operator dashboards finance teams trust at month-end close.",
      "QuickBooks and Xero reconciliation workflows and operator dashboards, designed around month-end close."
    )
    .replace(
      "Three cycle reconciliations, connector log forensics, and controller interviews in US and UK entities.",
      "Reconciliation walkthroughs, connector log review, and controller interviews."
    )
);

/* ── Hero panels ── */
const BRING = {
  "kriva-solution-trucking.html": "Your TMS name and the spreadsheet your dispatchers keep open.",
  "kriva-solution-accounting.html": "Which books you run, QuickBooks, Xero, or both, and where the numbers stop matching.",
  "kriva-solution-saas.html": "Your product or prototype, and the point where users get stuck.",
  "kriva-solution-car-transport.html": "How a quote becomes an order today, and where it gets re-keyed.",
  "kriva-service-crm-development.html": "The screen your dispatchers work from, and what they still track somewhere else.",
  "kriva-service-automation-systems.html": "The task your team repeats by hand, and who does it today.",
  "kriva-service-dashboard-design.html": "The report you rebuild every week, and the decision it is meant to support.",
  "kriva-service-mobile-applications.html": "What your drivers or field staff do on the road, and what they still phone in.",
  "kriva-service-product-design.html": "The workflow or product you want to change, in whatever state it is in.",
  "kriva-service-saas-platforms.html": "Who your tenants are, and how roles and data differ between them.",
  "kriva-service-web-development.html": "Your current site, and what it needs to do for sales or operations.",
  "kriva-service-graphic-design.html": "Examples of what you use today, and where the new work will appear.",
  "kriva-service-seo-digital-marketing.html": "Your current site, and the searches you want to be found for.",
};
const startPanel = (bring) => `<aside class="k-aside" aria-label="How a project starts">
        <p class="k-aside-k">How a project starts</p>
        <ol class="k-aside-steps">
          <li><strong>Free 20-minute fit call</strong><span>You leave with a clear yes, no, or not yet.</span></li>
          <li><strong>Discovery, 1 to 2 weeks</strong><span>A scoped brief and timeline you sign off.</span></li>
          <li><strong>Design and build</strong><span>Working software on a real URL every week.</span></li>
        </ol>
        <p class="k-aside-bring"><b>Bring to the call:</b> ${bring}</p>
        <a class="k-aside-link" href="/process">See the full process <i aria-hidden="true">→</i></a>
      </aside>`;
const PANELS = Object.fromEntries(Object.entries(BRING).map(([f, b]) => [f, startPanel(b)]));
PANELS["kriva-about.html"] = `<aside class="k-aside" aria-label="Who you will work with">
        <p class="k-aside-k">Who you will work with</p>
        <ol class="k-aside-steps k-aside-steps--plain">
          <li><strong>Design lead</strong><span>Leads design at KRIVA.</span></li>
          <li><strong>Nine years of experience</strong><span>What the team brings to shipping product software.</span></li>
          <li><strong>Permanent team</strong><span>Every designer and engineer. No subcontractors or freelance marketplaces.</span></li>
          <li><strong>Ahmedabad, India</strong><span>Headquarters, with calls that overlap your working day.</span></li>
        </ol>
        <a class="k-aside-link" href="#story">Read our story <i aria-hidden="true">→</i></a>
      </aside>`;
PANELS["kriva-work-index.html"] = `<aside class="k-aside" id="how-to-read" aria-label="How to read our work">
        <p class="k-aside-k">How to read our work</p>
        <ol class="k-aside-steps k-aside-steps--plain">
          <li><strong>Representative projects</strong><span>They show the kind of problem we take on and how we approach it. Project names may be portfolio names.</span></li>
          <li><strong>Illustrative screens</strong><span>Rebuilt for this site, so no client data is shown.</span></li>
          <li><strong>No outcome figures</strong><span>We don't publish a number we can't back up in writing.</span></li>
        </ol>
        <p class="k-aside-bring"><b>Check for yourself:</b> try the <a href="/">working dispatch board</a>, read our <a href="/insights">buyer guides</a>, or see <a href="/process">how we work</a>.</p>
      </aside>`;
/* Finds the </div> that closes the div opening at index i. */
const closeOf = (s, i) => {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = i;
  let depth = 0, m;
  while ((m = re.exec(s))) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return m.index;
  }
  throw new Error("unbalanced div");
};
const addClass = (s, i) => {
  const end = s.indexOf(">", i);
  const tag = s.slice(i, end);
  if (tag.includes("k-hero-split")) return s;
  const next = /class="/.test(tag) ? tag.replace('class="', 'class="k-hero-split ') : tag.replace("<div", '<div class="k-hero-split"');
  return s.slice(0, i) + next + s.slice(end);
};
/* Puts the panel last inside the container, so phones and screen readers reach the page copy first. */
const placePanel = (s, opener, panel, file) => {
  s = s.replace(/\s*<aside class="k-aside"[\s\S]*?<\/aside>/, "");
  const m = opener.exec(s);
  if (!m) throw new Error("no hero container in " + file);
  s = addClass(s, m.index);
  const close = closeOf(s, m.index);
  return s.slice(0, close).replace(/\s*$/, "\n      ") + panel + "\n    " + s.slice(close);
};
for (const [f, panel] of Object.entries(PANELS)) {
  edit(f, (s) => placePanel(s, /<div class="(?:k-hero-split )?ip-hero"/, panel, f));
}

/* Lighter service pages: hero container is the first div after the breadcrumb. */
const LP_BRING = {
  "kriva-service-branding.html": "Your current brand materials, and where they fall short.",
  "kriva-service-design-systems.html": "The products that need to share components, and where they have drifted apart.",
  "kriva-service-logo-design.html": "Your current mark, if you have one, and where the logo has to work.",
  "kriva-service-no-code-low-code.html": "The spreadsheet or tracker you want to replace.",
  "kriva-service-ui-ux-design.html": "The workflow or module that causes the most trouble.",
  "kriva-service-ux-research.html": "What you want to learn, and who uses the product.",
  "kriva-service-web-application-design.html": "The portal or board you want to design, and who uses it.",
  "kriva-service-wireframing-prototyping.html": "The idea or workflow you want to walk through before anyone builds.",
};
for (const [f, bring] of Object.entries(LP_BRING)) {
  edit(f, (s) => {
    s = s.replace(/(<div style="margin-top:clamp\(22px,3vw,40px\));max-width:[0-9.]+ch"/, '$1"');
    const hero = s.indexOf('<header class="hero lp-hero"');
    if (hero < 0) throw new Error("no lp-hero in " + f);
    const after = s.indexOf("</ol>", hero);
    const open = s.indexOf("<div", after);
    const tag = s.slice(open, s.indexOf(">", open));
    if (!/lp-stack|margin-top:clamp\(22px/.test(tag)) throw new Error("unexpected hero container in " + f + ": " + tag);
    const opener = new RegExp(tag.split("").map((c) => (/[a-z0-9 ]/i.test(c) ? c : "\\" + c)).join(""));
    return placePanel(s, opener, startPanel(bring), f);
  });
}

/* Market pages: real CTA button, plain copy, and a panel with that market's call hours. */
const MARKETS = {
  "kriva-market-us.html": ["Central and Eastern call hours.", "Your TMS name and the spreadsheet your dispatchers keep open."],
  "kriva-market-uk.html": ["GMT-friendly calls.", "Your product or prototype, and any Xero setup it has to work with."],
  "kriva-market-uae.html": ["Gulf-time overlap.", "How dispatch, fleet, and finance work on your desk today."],
  "kriva-market-ca.html": ["North American time zone overlap.", "Your TMS or product, and the finance system your back office uses."],
  "kriva-market-au.html": ["AEST/AEDT overlap for demos.", "Your product or operations workflow, and your Xero setup."],
};
for (const [f, [hours, bring]] of Object.entries(MARKETS)) {
  edit(f, (s) => {
    s = s.replace(/\s*<p class="body-sm"[^>]*><strong>Markets vs industries:<\/strong>[\s\S]*?<\/p>/, "");
    const hero = s.indexOf('<header class="hero hero--inner mkt-hero"');
    const proof = s.indexOf('<div class="mkt-proof"', hero);
    if (hero < 0 || proof < 0) throw new Error("market hero in " + f);
    if (!s.includes('class="ip-actions mkt-actions"')) {
      const pill = '<a href="/contact#book">Book a free 20-minute fit call</a>';
      const pillAt = s.indexOf(pill, proof);
      if (pillAt < 0) throw new Error("fit-call pill in " + f);
      s = s.slice(0, pillAt) + '<a href="/industries">Browse by industry</a>' + s.slice(pillAt + pill.length);
      s = s.slice(0, proof) + `<div class="ip-actions mkt-actions" data-r>
      <a href="/contact#book" class="btn"><span>Book a free 20-minute fit call</span><i>→</i></a>
      <a href="/contact#brief" class="btn ghost"><span>Send a project brief</span><i>→</i></a>
    </div>
    ` + s.slice(proof);
    }
    const panel = startPanel(bring).replace('<a class="k-aside-link"', '<p class="k-aside-bring"><b>Call hours:</b> ' + hours + '</p>\n        <a class="k-aside-link"');
    return placePanel(s, /<div class="(?:k-hero-split )?wrap"(?=>\s*<ol class="crumbs" data-r>\s*<li><a href="\/">Home<\/a><\/li><li aria-hidden="true">\/<\/li>\s*<li><a href="\/markets">)/, panel, f);
  });
}
edit("kriva-case-brandlift.html", (s) => s.replace('<div style="margin-top:clamp(28px,4vw,56px);max-width:14ch">', '<div style="margin-top:clamp(28px,4vw,56px);max-width:62ch">'));
edit("kriva-markets-index.html", (s) => s.replace('<p class="eyebrow" data-r>Process</p>', '<p class="eyebrow" data-r>Markets</p>'));
edit("kriva-solutions-index.html", (s) => s.replace('<p class="eyebrow" data-r>Process</p>', '<p class="eyebrow" data-r>Solutions</p>'));
edit("kriva-insights-index.html", (s) => s.replace('<p class="eyebrow" data-r>Process</p>', '<p class="eyebrow" data-r>Insights</p>'));

/* Plain wording in place of internal shorthand, and no outcome language without evidence. */
const WORDING = [
  ["The case has no signed-off metrics.", "It is a representative project with no outcome figures."],
  ["with improved checkout UX and product discovery", "covering checkout UX and product discovery"],
  ["It carries no signed-off metrics, and it is not a carrier case.", "It publishes no outcome figures, and it is not a carrier case."],
  ["Neither case page carries signed-off metrics on prototyping itself.", "Neither case page publishes outcome figures on prototyping itself."],
  ["Published case study. No signed-off numeric outcomes are available.", "Representative project. No outcome figures published."],
  ["Illustrative interface. No signed-off numeric outcomes.", "Illustrative interface. No outcome figures published."],
  ["None signed off. Client labels may be portfolio names.", "None published. Project names may be portfolio names."],
  ["Built reliable QuickBooks/Xero reconciliation workflows with operator dashboards finance teams trust at month-end close.", "QuickBooks and Xero reconciliation workflows and operator dashboards, designed around month-end close."],
];
for (const f of fs.readdirSync(".").filter((n) => n.endsWith(".html"))) {
  edit(f, (s) => WORDING.reduce((t, [from, to]) => t.split(from).join(to), s));
}
edit("kriva-careers.html", (s) => s.replace('<p class="ip-kicker">Process</p>', '<p class="ip-kicker">Careers</p>'));
edit("kriva-about.html", (s) =>
  s.replace(
    /Remote-first · US, UK, UAE &amp; <a href="\/markets\/ca">Canada<\/a> clients/,
    'Remote-first · serving the US, UK, <a href="/markets/ca">Canada</a>, Australia, and UAE'
  )
);

/* ── Homepage ── */
edit("kriva-redesign.html", (s) => s.replace("Where our clients are", "Where we work"));

/* ── Contact: lead with the form ── */
edit("kriva-contact.html", (s) => {
  if (!s.includes('<div class="ct-hero-copy">')) return s;
  s = s.replace(/<header class="hero" aria-labelledby="h1">[\s\S]*?<\/header>\s*/, "");
  s = s.replace(
    '<section class="ct-primary" id="book" aria-labelledby="bkH">',
    '<section class="ct-primary ct-lead" id="book" aria-labelledby="h1">'
  );
  const copy = /<div class="inq-copy" data-r>\s*<p class="eyebrow">Quick qualification<\/p>[\s\S]*?<\/div>(\s*<div data-r>\s*<div class="summary" id="fitSummary")/;
  if (!copy.test(s)) throw new Error("contact copy block not found");
  return s.replace(
    copy,
    `<div class="inq-copy">
      <ol class="crumbs">
        <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
        <li aria-current="page">Contact</li>
      </ol>
      <p class="eyebrow">Contact</p>
      <h1 id="h1">Book a fit call or send a project brief</h1>
      <p class="lede">Tell us what is breaking: the desk, the shift, or the product. It takes about two minutes, and we reply within one business day to set up a call at a time that suits your time zone.</p>
      <dl class="ct-lead-facts">
        <div><dt>Who replies</dt><dd>The KRIVA team, not a salesperson.</dd></div>
        <div><dt>What you get</dt><dd>A clear yes, no, or not yet.</dd></div>
        <div><dt>Confidentiality</dt><dd>NDA on request.</dd></div>
      </dl>
      <p class="body-sm">Have a full scope, budget, or files? <a href="#brief">Send a project brief</a>. Prefer email? <a href="mailto:hello@krivatechnologies.com">hello@krivatechnologies.com</a>.</p>
    </div>$1`
  );
});

/* ── Search title over 60 characters ── */
for (const f of ["kriva-insight-choosing-a-digital-agency.html", "content/seo-meta.cjs"]) {
  if (fs.existsSync(f)) {
    edit(f, (s) =>
      s.split("How to Choose a Software Partner for a Logistics Product | KRIVA").join("Choosing a Software Partner for Logistics | KRIVA")
    );
  }
}

/* ── Cache bust for the shared design layer ── */
for (const f of fs.readdirSync(".").filter((n) => n.endsWith(".html"))) {
  edit(f, (s) => s.split("kds.css?v=brand1").join("kds.css?v=brand3"));
}
