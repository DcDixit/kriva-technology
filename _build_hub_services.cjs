#!/usr/bin/env node
/** Stamp Graphic Design + SEO hub pages from the branding service template. */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const src = fs.readFileSync(path.join(ROOT, "kriva-service-branding.html"), "utf8");

const EXTRA_CSS = `
.cat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:clamp(28px,3.5vw,48px)}
.cat article{background:var(--white);padding:clamp(20px,2.4vw,28px);min-width:0}
.cat .n{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--cta);display:block;margin-bottom:10px}
.cat h3{margin-bottom:8px;font-size:clamp(1.05rem,1.5vw,1.22rem)}
.cat p{color:var(--steel);font-size:14.5px;line-height:1.55;max-width:36ch}
.cat a.cat-go{display:inline-flex;margin-top:12px;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid var(--rule)}
.cat a.cat-go:hover{border-bottom-color:var(--ink)}
@media(max-width:900px){.cat{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.cat{grid-template-columns:1fr}}
.rank{display:grid;gap:8px;padding:16px;background:var(--ink);color:#DDE2E7;border:1px solid var(--ink-line)}
.rank .rh{display:flex;justify-content:space-between;font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8C98A4;margin-bottom:8px}
.rank li{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--ink-line);font-size:13.5px;list-style:none}
.rank li:last-child{border-bottom:0}
.rank b{color:#fff;font-weight:600}
.rank .up{color:var(--lime);font-family:var(--f-mono);font-size:11px}
`;

function cat(items) {
  return `<div class="cat" data-s>\n${items
    .map(
      (it, i) => `      <article>
        <span class="n">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="d3">${it.h}</h3>
        <p>${it.p}</p>${
          it.href
            ? `\n        <a class="cat-go" href="${it.href}">${it.link} <span aria-hidden="true">→</span></a>`
            : ""
        }
      </article>`
    )
    .join("\n")}
    </div>`;
}

const graphicItems = [
  { h: "Corporate Identity", p: "Name, mark, color, and type as one system — so cards, decks, and product UI do not look like three vendors." },
  { h: "Logo Design", p: "A mark that holds from favicon to vehicle wrap. Clear space, lockups, and misuse rules included.", href: "/services/logo-design", link: "Logo Design" },
  { h: "Brand Identity &amp; Branding", p: "The wider language: photography, layout, tone. Not a PDF that marketing outgrows in a quarter.", href: "/services/branding", link: "Branding" },
  { h: "Business Card Design", p: "Print-ready cards with the same type and color as the site — not a leftover from a clip-art pack." },
  { h: "Letterheads and Stationery", p: "Letterhead, envelopes, and templates your team can use without opening Illustrator." },
  { h: "Brochures", p: "Sales and product brochures with a hierarchy a buyer can scan in thirty seconds." },
  { h: "Flyers", p: "Single-surface pieces for events, offers, and yard ops — print and PDF, same art." },
  { h: "Posters", p: "Large-format that still reads from the aisle. Type and contrast first, decoration second." },
  { h: "Social Media Creatives", p: "Templates for the channels you actually post on. Sizes, safe areas, and a reusable grid." },
  { h: "Marketing &amp; Promotional Materials", p: "Campaign kits: ads, one-pagers, booth graphics. One art direction, many crops." },
  { h: "Presentation Design", p: "Pitch and ops decks that follow the brand, not a default theme with a logo pasted on slide one." },
  { h: "Packaging Design", p: "D2C and kit packaging that matches the storefront — dielines, print specs, and photography notes." },
  { h: "Campaign systems", p: "When the brief is “make it all look like one company”: ads, landing, email, and print on the same rules." },
];

const seoItems = [
  { h: "Search Engine Optimization", p: "Technical hygiene, intent-matched pages, and measurement. We do not sell guaranteed rankings." },
  { h: "Local SEO", p: "Google Business Profile, NAP consistency, and location pages that match how people search nearby." },
  { h: "On-Page SEO", p: "Titles, headings, internal links, and copy that answer the query — not keyword stuffing." },
  { h: "Off-Page SEO", p: "Citations and links earned from real mentions. No PBNs, no purchased link packages." },
  { h: "Technical SEO", p: "Crawl, index, Core Web Vitals, sitemap, canonicals, and structured data on the site you already have.", href: "/services/web-development", link: "Web development" },
  { h: "Google Ads / PPC", p: "Search and Performance Max with conversion tracking you can open in the account — not a screenshot PDF." },
  { h: "Meta / Facebook Advertising", p: "Audience, creative, and pixel hygiene. Creative that matches the landing page, not a random stock set." },
  { h: "Instagram Advertising", p: "Feed, stories, and reels ads with the same brand system as your organic posts." },
  { h: "Social Media Marketing", p: "A posting system and creative kit. We will not pretend daily posting is a strategy by itself." },
  { h: "Search Engine Marketing", p: "Paid search next to organic: shared keyword map so ads and SEO do not bid against your own pages." },
  { h: "Lead Generation Campaigns", p: "Landing, form, and CRM handoff. The lead has to land on a desk someone actually works." },
  { h: "Performance Marketing", p: "Spend tied to events you can audit. If tracking is broken, we fix tracking before we scale spend." },
  { h: "Analytics, Tracking &amp; Reporting", p: "GA4, ads pixels, and a monthly readout in language ops and founders can use." },
];

function page({
  file,
  title,
  meta,
  ogTitle,
  canonical,
  crumb,
  bodyClass,
  chapters,
  main,
  schemaName,
  faqs,
}) {
  let html = src;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${meta}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${ogTitle}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${meta}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`);
  html = html.replace(/<body class="[^"]*">/, `<body class="${bodyClass}">`);
  if (!html.includes(".cat{display:grid")) {
    html = html.replace("</style>", `${EXTRA_CSS}\n</style>`);
  }
  html = html.replace(
    /<nav class="chapters"[\s\S]*?<\/nav>/,
    `<nav class="chapters" id="chapters" aria-label="Sections">\n${chapters}\n</nav>`
  );
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">\n${main}\n</main>`);

  const faqJson = faqs
    .map(
      (f) =>
        `    {"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`
    )
    .join(",\n");

  const schema = `<!-- KRIVA_SCHEMA_START -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": ${JSON.stringify(schemaName)},
  "provider": {"@type": "Organization", "name": "KRIVA Technologies", "url": "https://krivatechnologies.com"},
  "url": ${JSON.stringify(canonical)},
  "description": ${JSON.stringify(meta.replace(/&amp;/g, "&"))},
  "areaServed": ["US", "GB", "IN"]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${faqJson}
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://krivatechnologies.com/"},
    {"@type":"ListItem","position":2,"name":"Services","item":"https://krivatechnologies.com/services"},
    {"@type":"ListItem","position":3,"name":${JSON.stringify(crumb)},"item":${JSON.stringify(canonical)}}
  ]
}
</script>
<!-- KRIVA_SCHEMA_END -->`;

  html = html.replace(/<!-- KRIVA_SCHEMA_START -->[\s\S]*?<!-- KRIVA_SCHEMA_END -->/, schema);
  fs.writeFileSync(path.join(ROOT, file), html, "utf8");
  console.log("wrote", file);
}

const graphicFaqs = [
  { q: "Is this the same as Branding?", a: "Branding owns identity rules. Graphic Design is the production lane: stationery, social, print, packaging, and campaigns that use those rules. Most clients need both; logo-only work can stand alone." },
  { q: "Do you invent logos for clients you have not briefed?", a: "No. We work from your existing marks or a scoped identity engagement. We do not generate unofficial logos." },
  { q: "Print and digital together?", a: "Yes. One art direction, with print specs and social crops in the same file set so the booth and the Instagram grid match." },
  { q: "How does an engagement start?", a: "A 20-minute fit call or a written brief. We reply within one business day with a first scope. NDA on request." },
];

const seoFaqs = [
  { q: "Do you guarantee first-page rankings?", a: "No. Anyone who does is selling you a claim they cannot control. We ship technical SEO, content that matches intent, and reporting you can audit." },
  { q: "Ads without a tracking setup?", a: "We will not scale spend on broken conversion tracking. Fix the events, then the budget." },
  { q: "Can you work on a site you did not build?", a: "Yes. Technical SEO and on-page work on the CMS you already have, or we pair with Web Design & Development when the template is the bottleneck." },
  { q: "How does an engagement start?", a: "A 20-minute fit call or a written brief. We reply within one business day with a sensible first scope. NDA on request." },
];

page({
  file: "kriva-service-graphic-design.html",
  title: "Graphic Design Services · Identity to campaign · KRIVA",
  meta: "Corporate identity, logo, print, social, packaging, and marketing systems — one studio, not a trend pack dropped onto last year’s files.",
  ogTitle: "Graphic Design Services · Identity to campaign",
  canonical: "https://krivatechnologies.com/services/graphic-design",
  crumb: "Graphic Design",
  bodyClass: "service design-ux arch-brand",
  chapters: `  <a href="#overview"><span>Overview</span><i></i></a>
  <a href="#catalogue"><span>Catalogue</span><i></i></a>
  <a href="#fracture"><span>Fracture</span><i></i></a>
  <a href="#method"><span>Method</span><i></i></a>
  <a href="#work"><span>Work</span><i></i></a>
  <a href="#faq"><span>FAQ</span><i></i></a>`,
  schemaName: "Graphic Design Services",
  faqs: graphicFaqs,
  main: `<header class="hero lp-hero" id="overview">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="/services">Services</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Graphic Design</li>
    </ol>
    <div class="lp-split" style="margin-top:clamp(22px,3vw,40px)">
      <div>
        <p class="eyebrow" data-r>Service · Visual production</p>
        <h1 class="d1 mask" data-mask>
          <span><i>One look on the</i></span>
          <span><i>card, the booth,</i></span>
          <span><i>and the feed.</i></span>
        </h1>
        <p class="lede" data-r>Identity, print, social, packaging, and decks from the same system. Not a folder of one-offs that marketing cannot reuse next quarter.</p>
        <div class="hero-actions" data-r>
          <a href="/contact#book" class="btn"><span>Request a fit call</span><i>→</i></a>
          <a href="/work/brandlift-ecommerce" class="btn ghost"><span>See BrandLift</span><i>→</i></a>
        </div>
      </div>
      <figure class="arch-frame" data-r>
        <div class="arch-chrome" aria-hidden="true"><i></i><i></i><i></i><span>brandlift · storefront</span></div>
        <div class="pu pu-brand" role="img" aria-label="BrandLift identity and Shopify PDP.">
          <div class="pu-id"><p class="pu-mono">BL</p><p class="pu-name">BrandLift</p></div>
          <div class="pu-pdp">
            <p class="pu-meta">Shopify · PDP</p>
            <div class="pu-swatch"><span class="pu-shirt"></span><span class="pu-bl">BL</span></div>
            <p class="pu-prod">Linen overshirt <span>&pound;128</span></p>
            <span class="pu-bag">Add to bag</span>
          </div>
        </div>
      </figure>
    </div>
  </div>
</header>

<section class="sect" id="catalogue" aria-labelledby="catH" style="background:var(--white);border-block:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>What we design</p>
    <h2 class="d2" id="catH" data-r style="margin-top:16px">The full graphic lane.</h2>
    <p class="lede" data-r style="margin-top:16px">Marks through campaigns. Pick the surface you need; we keep the system consistent.</p>
    ${cat(graphicItems)}
  </div>
</section>

<section class="sect" id="fracture" aria-labelledby="frH">
  <div class="wrap">
    <p class="eyebrow" data-r>Where it breaks</p>
    <h2 class="d2" id="frH" data-r style="margin-top:16px">When every asset is a one-off.</h2>
    <div class="lp-frac" data-s>
      <article>
        <span class="offer-no">01 · Market</span>
        <div>
          <h3 class="d3">Looks like anyone in the category</h3>
          <p class="body-sm" style="margin-top:8px">The flyer, the LinkedIn header, and the booth could belong to any firm on the pitch list.</p>
        </div>
      </article>
      <article>
        <span class="offer-no">02 · Surfaces</span>
        <div>
          <h3 class="d3">Print and product diverge</h3>
          <p class="body-sm" style="margin-top:8px">The website, the deck, and the packaging do not look like one company.</p>
        </div>
      </article>
      <article>
        <span class="offer-no">03 · Production</span>
        <div>
          <h3 class="d3">No file anyone else can use</h3>
          <p class="body-sm" style="margin-top:8px">No templates, no print specs, no social grid — so every campaign starts from a blank artboard.</p>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="sect" id="method" aria-labelledby="apH" style="background:var(--paper-2);border-block:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>Method</p>
    <h2 class="d2" id="apH" data-r style="margin-top:16px">Rules first. Then the kit.</h2>
    <p class="lede" data-r style="margin-top:16px">We lock type, color, and layout — then produce the surfaces you actually ship this quarter.</p>
    <ol class="run-bar" data-s style="margin-top:clamp(32px,4vw,48px);list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,2vw,32px)">
      <li>
        <span class="wk" style="display:block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--cta);margin-bottom:12px">01</span>
        <h3 class="d3">Audit the kit</h3>
        <p class="body-sm" style="margin-top:8px">What you already have, what is off-brand, and which files are still usable.</p>
      </li>
      <li>
        <span class="wk" style="display:block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--cta);margin-bottom:12px">02</span>
        <h3 class="d3">System</h3>
        <p class="body-sm" style="margin-top:8px">Type, color, grid, and lockups — or we follow an existing branding engagement.</p>
      </li>
      <li>
        <span class="wk" style="display:block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--cta);margin-bottom:12px">03</span>
        <h3 class="d3">Produce</h3>
        <p class="body-sm" style="margin-top:8px">Print-ready and social-ready files, with a short use guide so the next intern cannot break it.</p>
      </li>
    </ol>
  </div>
</section>

<section class="featwork" id="work" aria-labelledby="pfH" style="padding:0">
  <article class="lp-case" data-r>
    <a href="/work/brandlift-ecommerce">
      <div class="pu pu-brand" role="img" aria-label="BrandLift identity and Shopify PDP.">
        <div class="pu-id"><p class="pu-mono">BL</p><p class="pu-name">BrandLift</p></div>
        <div class="pu-pdp">
          <p class="pu-meta">Shopify · PDP</p>
          <div class="pu-swatch"><span class="pu-shirt"></span><span class="pu-bl">BL</span></div>
          <p class="pu-prod">Linen overshirt <span>&pound;128</span></p>
          <span class="pu-bag">Add to bag</span>
        </div>
      </div>
    </a>
    <div>
      <p class="eyebrow">Selected work</p>
      <h3 class="d2" id="pfH">BrandLift</h3>
      <p>D2C rebrand: storefront, identity, and marketing surfaces as one system — the same discipline we apply to print and social kits.</p>
      <a href="/work/brandlift-ecommerce" class="btn on-dark" style="margin-top:22px"><span>Read the case</span><i>→</i></a>
    </div>
  </article>
</section>

<section class="sect" id="faq" aria-labelledby="faqH" style="background:var(--white);border-top:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>FAQ</p>
    <h2 class="d2" id="faqH" data-r style="margin-top:16px">About graphic design</h2>
    <div class="faq" data-r>
      ${graphicFaqs.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n      ")}
    </div>
    <div class="sib" data-r style="margin-top:32px">
      <a href="/services/branding">Branding</a>
      <a href="/services/logo-design">Logo Design</a>
      <a href="/services/seo-digital-marketing">SEO &amp; Digital Marketing</a>
      <a href="/services">All services</a>
    </div>
  </div>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Start a project</p>
    <h2 class="d2" id="ctaH" data-r>Need a kit marketing can actually reuse?</h2>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Request a fit call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
      </div>
      <p class="assur" data-r>
        <span><i>◆</i>Reply within one business day</span>
        <span><i>◆</i>NDA on request</span>
        <span><i>◆</i>No commitment required</span>
      </p>
    </div>
  </div>
</section>`,
});

page({
  file: "kriva-service-seo-digital-marketing.html",
  title: "SEO &amp; Digital Marketing · Search, ads, reporting · KRIVA",
  meta: "SEO, local and technical search, Google and Meta ads, social, and performance marketing — with tracking you can open in the account, not a ranking promise.",
  ogTitle: "SEO &amp; Digital Marketing · Search, ads, reporting",
  canonical: "https://krivatechnologies.com/services/seo-digital-marketing",
  crumb: "SEO & Digital Marketing",
  bodyClass: "service design-ux arch-web",
  chapters: `  <a href="#overview"><span>Overview</span><i></i></a>
  <a href="#catalogue"><span>Catalogue</span><i></i></a>
  <a href="#fracture"><span>Fracture</span><i></i></a>
  <a href="#method"><span>Method</span><i></i></a>
  <a href="#measure"><span>Measure</span><i></i></a>
  <a href="#faq"><span>FAQ</span><i></i></a>`,
  schemaName: "SEO and Digital Marketing Services",
  faqs: seoFaqs,
  main: `<header class="hero lp-hero" id="overview">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="/services">Services</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">SEO &amp; Digital Marketing</li>
    </ol>
    <div class="lp-split" style="margin-top:clamp(22px,3vw,40px)">
      <div>
        <p class="eyebrow" data-r>Service · Demand</p>
        <h1 class="d1 mask" data-mask>
          <span><i>Traffic you</i></span>
          <span><i>can explain</i></span>
          <span><i>in the account.</i></span>
        </h1>
        <p class="lede" data-r>Search, ads, and social with tracking you can audit. We will not sell you a first-page guarantee or scale spend on a broken pixel.</p>
        <div class="hero-actions" data-r>
          <a href="/contact#book" class="btn"><span>Request a fit call</span><i>→</i></a>
          <a href="/services/web-development" class="btn ghost"><span>Web development</span><i>→</i></a>
        </div>
      </div>
      <figure class="arch-frame" data-r>
        <div class="arch-chrome" aria-hidden="true"><i></i><i></i><i></i><span>search · monthly readout</span></div>
        <ul class="rank" role="img" aria-label="Illustrative search readout: queries moving, not a ranking guarantee.">
          <li class="rh" style="display:flex;border:0;padding:0 0 8px"><span>Query</span><span>Was</span><span>Now</span></li>
          <li><b>dispatch CRM</b><span>p. 2</span><span class="up">p. 1</span></li>
          <li><b>fleet dashboard UX</b><span>14</span><span class="up">6</span></li>
          <li><b>QuickBooks sync</b><span>9</span><span class="up">4</span></li>
          <li><b>Ads · search</b><span>ROAS</span><span class="up">Tracked</span></li>
        </ul>
      </figure>
    </div>
  </div>
</header>

<section class="sect" id="catalogue" aria-labelledby="catH" style="background:var(--white);border-block:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>What we run</p>
    <h2 class="d2" id="catH" data-r style="margin-top:16px">Search, ads, and the readout.</h2>
    <p class="lede" data-r style="margin-top:16px">Organic and paid on the same keyword map. Creative that matches the landing page. Reports a founder can read.</p>
    ${cat(seoItems)}
  </div>
</section>

<section class="sect" id="fracture" aria-labelledby="frH">
  <div class="wrap">
    <p class="eyebrow" data-r>Where it breaks</p>
    <h2 class="d2" id="frH" data-r style="margin-top:16px">When marketing cannot show the work.</h2>
    <div class="lp-frac" data-s>
      <article>
        <span class="offer-no">01 · Search</span>
        <div>
          <h3 class="d3">The site cannot be crawled cleanly</h3>
          <p class="body-sm" style="margin-top:8px">Duplicate URLs, no canonicals, slow templates. Content cannot outrun a broken index.</p>
        </div>
      </article>
      <article>
        <span class="offer-no">02 · Ads</span>
        <div>
          <h3 class="d3">Spend without an event you trust</h3>
          <p class="body-sm" style="margin-top:8px">Pixels fire on the thank-you page twice, or never. ROAS is a slide, not a number in the account.</p>
        </div>
      </article>
      <article>
        <span class="offer-no">03 · Reporting</span>
        <div>
          <h3 class="d3">Vanity charts, no next action</h3>
          <p class="body-sm" style="margin-top:8px">Sessions up, pipeline unchanged. The monthly PDF does not tell ops what to ship next.</p>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="sect" id="method" aria-labelledby="apH" style="background:var(--paper-2);border-block:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>Method</p>
    <h2 class="d2" id="apH" data-r style="margin-top:16px">Hygiene, then spend.</h2>
    <p class="lede" data-r style="margin-top:16px">Fix crawl and conversion events first. Then content and campaigns. Then scale what the readout supports.</p>
    <ol class="run-bar" data-s style="margin-top:clamp(32px,4vw,48px);list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,2vw,32px)">
      <li>
        <span class="wk" style="display:block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--cta);margin-bottom:12px">01</span>
        <h3 class="d3">Baseline</h3>
        <p class="body-sm" style="margin-top:8px">Search Console, ads accounts, analytics. What is indexed, what is tracked, what is a guess.</p>
      </li>
      <li>
        <span class="wk" style="display:block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--cta);margin-bottom:12px">02</span>
        <h3 class="d3">Fix the pipes</h3>
        <p class="body-sm" style="margin-top:8px">Technical SEO, canonicals, sitemap, and conversion events. No scale until this holds.</p>
      </li>
      <li>
        <span class="wk" style="display:block;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--cta);margin-bottom:12px">03</span>
        <h3 class="d3">Run &amp; report</h3>
        <p class="body-sm" style="margin-top:8px">On-page, local, and paid on a shared map. A monthly readout with the next three actions named.</p>
      </li>
    </ol>
  </div>
</section>

<section class="sect" id="measure" aria-labelledby="msH" style="background:var(--white);border-block:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>Proof · stated honestly</p>
    <h2 class="d2" id="msH" data-r style="margin-top:16px">What you should see in the account.</h2>
    <p class="lede" data-r style="margin-top:16px">Not a purchased rank screenshot. Access to Search Console, ads, and analytics — and a written list of what moved.</p>
    <div class="deliv" style="margin-top:clamp(28px,3.5vw,48px)">
      <div><b>01 · Search</b><p>Index coverage, canonicals, and queries you actually care about — not a vanity keyword list.</p></div>
      <div><b>02 · Ads</b><p>Campaigns you can log into. Conversion actions that match the CRM or form, not a duplicate thank-you fire.</p></div>
      <div><b>03 · Site</b><p>When the template is the bottleneck, we pair with <a href="/services/web-development" style="border-bottom:1px solid var(--rule)">Web Design &amp; Development</a>.</p></div>
      <div><b>04 · Creative</b><p>Landing and ads that share one system — often with <a href="/services/graphic-design" style="border-bottom:1px solid var(--rule)">Graphic Design</a>.</p></div>
    </div>
  </div>
</section>

<section class="sect" id="faq" aria-labelledby="faqH">
  <div class="wrap">
    <p class="eyebrow" data-r>FAQ</p>
    <h2 class="d2" id="faqH" data-r style="margin-top:16px">About SEO &amp; ads</h2>
    <div class="faq" data-r>
      ${seoFaqs.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n      ")}
    </div>
    <div class="sib" data-r style="margin-top:32px">
      <a href="/services/web-development">Web Design &amp; Development</a>
      <a href="/services/graphic-design">Graphic Design</a>
      <a href="/insights/choosing-a-digital-agency">Choosing an agency</a>
      <a href="/services">All services</a>
    </div>
  </div>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Start a project</p>
    <h2 class="d2" id="ctaH" data-r>Need demand you can defend in a board pack?</h2>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Request a fit call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
      </div>
      <p class="assur" data-r>
        <span><i>◆</i>Reply within one business day</span>
        <span><i>◆</i>NDA on request</span>
        <span><i>◆</i>No commitment required</span>
      </p>
    </div>
  </div>
</section>`,
});
