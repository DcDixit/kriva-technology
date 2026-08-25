/**
 * Phase 4 — Insights (index + 7 articles) + FAQ, Technologies, Privacy, Terms
 */
const fs = require("fs");
const path = require("path");
const { posts } = require("./content/insights-data.cjs");
const { applyFile } = require("./apply_chrome.cjs");

const ROOT = __dirname;
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const TOKENS = fs
  .readFileSync(path.join(ROOT, "build_priority3.cjs"), "utf8")
  .match(/const TOKENS = `([\s\S]*?)`;/)[1];

const BASE_SCRIPT = `<script src="/shared/chrome.js" defer></script>
<script>
(function(){
'use strict';
const io = new IntersectionObserver(es=>{
  for(const e of es){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }
},{threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach(el=>{
  if(el.hasAttribute('data-mask')) el.classList.add('mask');
  io.observe(el);
});
})();
</script>`;

function shell({ title, description, canonical, ogTitle, ogType = "website", publishedTime, pageCss, body, extraHead = "", extraScript = "" }) {
  const ogTypeMeta = `<meta property="og:type" content="${ogType}">`;
  const pub = publishedTime
    ? `<meta property="article:published_time" content="${publishedTime}">`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
${ogTypeMeta}
${pub}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/shared/chrome.css">
${extraHead}
<style>
${TOKENS}
${pageCss}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<!--KRIVA_CHROME-->

<main id="main">
${body}
</main>

<!--KRIVA_FOOTER-->

${BASE_SCRIPT}
${extraScript}
</body>
</html>`;
}

const CTA = `
<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Next step</p>
    <h2 class="d2" id="ctaH" data-r>Tell us what you're building.</h2>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Book a 20-minute fit call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
      </div>
      <p class="assur" data-r>
        <span><i>◆</i>Reply within one business day</span>
        <span><i>◆</i>NDA on request</span>
        <span><i>◆</i>No commitment required</span>
      </p>
    </div>
  </div>
</section>`;

function relatedPosts(slug, limit = 2) {
  const current = posts.find((p) => p.slug === slug);
  const same = posts.filter((p) => p.slug !== slug && p.category === current.category);
  const rest = posts.filter((p) => p.slug !== slug && p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

function renderBlocks(blocks) {
  return blocks
    .map((b) => {
      if (b.type === "heading") return `<h2>${esc(b.text)}</h2>`;
      if (b.type === "paragraph") return `<p>${esc(b.text)}</p>`;
      if (b.type === "list")
        return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      return "";
    })
    .join("\n");
}

/* ── Insights index CSS ── */
const insightsCss = `
.hero-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(24px,4vw,64px);align-items:end;margin-top:clamp(22px,3vw,40px)}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr}}
.feat{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(20px,3vw,48px);align-items:stretch;margin-top:clamp(36px,4vw,64px);background:var(--ink);color:#DDE2E7;padding:clamp(24px,3vw,40px);text-decoration:none}
.feat:hover .go i{transform:translateX(5px)}
.feat .k{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber)}
.feat h2{color:#fff;margin:14px 0 16px;font-size:clamp(1.6rem,3.2vw,2.6rem);line-height:1.08;letter-spacing:-.03em;max-width:18ch}
.feat p{color:#A8B2BC;font-size:15.5px;line-height:1.6;max-width:48ch}
.feat .meta{display:flex;flex-wrap:wrap;gap:14px;margin-top:22px;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#6B7885}
.feat .go{display:inline-flex;align-items:center;gap:8px;margin-top:28px;font-family:var(--f-mono);font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#fff;border-bottom:1px solid currentColor;padding-bottom:3px}
.feat .go i{font-style:normal;transition:transform .4s var(--e)}
.feat-slot{background:#141A20;min-height:220px;display:flex;flex-direction:column;justify-content:space-between;padding:14px;font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#5C6670}
.feat-slot .lines{display:grid;gap:6px}.feat-slot .lines i{display:block;height:6px;background:#1F262E}.feat-slot .lines i:nth-child(1){width:40%}.feat-slot .lines i:nth-child(2){width:66%}.feat-slot .lines i:nth-child(3){width:52%}
@media(max-width:800px){.feat{grid-template-columns:1fr}.feat-slot{min-height:160px;order:-1}}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin:clamp(28px,3.5vw,48px) 0 0;padding-bottom:18px;border-bottom:1px solid var(--rule)}
.filters button{padding:8px 12px;border:1px solid var(--rule);font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel);background:transparent;transition:color .3s,border-color .3s,background .3s}
.filters button[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.filters button:hover{color:var(--ink);border-color:var(--ink)}
.ledger{margin-top:0}
.post{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr) auto;gap:clamp(16px,2.5vw,36px);align-items:start;padding:clamp(22px,2.6vw,34px) 0;border-bottom:1px solid var(--rule);text-decoration:none;color:inherit;transition:background .35s}
.post:hover{background:var(--white)}
.post .cat{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--steel);margin-bottom:10px}
.post h3{font-family:var(--f-display);font-weight:750;font-size:clamp(1.2rem,2vw,1.65rem);line-height:1.15;letter-spacing:-.025em;max-width:28ch}
.post .ex{font-size:14.5px;line-height:1.55;color:var(--steel);margin-top:10px;max-width:52ch}
.post .meta{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--steel);display:grid;gap:8px}
.post .arrow{font-family:var(--f-mono);font-size:14px;color:var(--steel);transition:transform .4s var(--e),color .3s}
.post:hover .arrow{transform:translateX(5px);color:var(--ink)}
@media(max-width:860px){.post{grid-template-columns:1fr auto}.post .meta{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:14px}}
.links{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.links a{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;padding:8px 12px;border:1px solid var(--rule);color:var(--steel);transition:color .3s,border-color .3s}
.links a:hover{color:var(--ink);border-color:var(--ink)}
`;

const sorted = [...posts].sort((a, b) => b.publishedISO.localeCompare(a.publishedISO));
const featured = sorted[0];
const rest = sorted.slice(1);
const categories = [...new Set(posts.map((p) => p.category))];

const insightsIndexBody = `
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Insights</li>
    </ol>
    <div class="hero-grid">
      <div>
        <p class="eyebrow" data-r>Insights</p>
        <h1 class="d1 mask" data-mask id="h1"><span><i>Notes for SaaS</i></span><span><i>and operations teams.</i></span></h1>
        <p class="lede" data-r>Practical writing on onboarding, dispatch CRM, MVP trade-offs, and how we deliver — aimed at founders and operators, not keyword filler.</p>
        <div class="hero-actions" data-r>
          <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
          <a href="/solutions" class="btn ghost"><span>Explore solutions</span><i>→</i></a>
        </div>
      </div>
      <div data-r>
        <p class="mono" style="color:var(--steel);margin-bottom:14px">Also browse</p>
        <div class="links">
          <a href="/solutions">Solutions</a>
          <a href="/services">Services</a>
          <a href="/work">Work</a>
          <a href="/process">Process</a>
          <a href="/faq">FAQ</a>
        </div>
      </div>
    </div>
  </div>
</header>

<section class="sect sect--tight" aria-labelledby="featH" style="padding-top:0">
  <div class="wrap">
    <p class="eyebrow" data-r>Featured</p>
    <a class="feat" href="/insights/${featured.slug}" data-r aria-labelledby="featH">
      <div>
        <p class="k">${esc(featured.category)} · Featured</p>
        <h2 id="featH">${esc(featured.title)}</h2>
        <p>${esc(featured.excerpt)}</p>
        <p class="meta"><span>${esc(featured.published)}</span><span>${esc(featured.read)}</span></p>
        <span class="go">Read article <i>→</i></span>
      </div>
      <div class="feat-slot feat-slot--editorial" aria-hidden="true">
        <span class="cover-k">Featured</span>
        <p class="cover-q" style="font-size:1.15rem;margin-top:14px;max-width:22ch">Notes for SaaS and operations teams.</p>
        <span class="cover-meta" style="margin-top:auto">Editorial · no stock cover</span>
      </div>
    </a>
  </div>
</section>

<section class="sect" style="padding-top:0" aria-labelledby="listH">
  <div class="wrap">
    <p class="eyebrow" data-r>All articles</p>
    <h2 class="d2" id="listH" data-r style="margin-top:14px;max-width:16ch">Newest first.</h2>
    <div class="filters" role="toolbar" aria-label="Filter by category" data-r>
      <button type="button" data-cat="all" aria-pressed="true">All <u class="num">${posts.length}</u></button>
      ${categories
        .map((c) => {
          const n = posts.filter((p) => p.category === c).length;
          return `<button type="button" data-cat="${esc(c)}" aria-pressed="false">${esc(c)} <u class="num">${n}</u></button>`;
        })
        .join("")}
    </div>
    <div class="ledger" id="ledger">
      ${sorted
        .map(
          (p) => `
      <a class="post" href="/insights/${p.slug}" data-cat="${esc(p.category)}" data-r>
        <div>
          <p class="cat">${esc(p.category)}</p>
          <h3>${esc(p.title)}</h3>
          <p class="ex">${esc(p.excerpt)}</p>
        </div>
        <div class="meta"><span>${esc(p.published)}</span><span>${esc(p.read)}</span></div>
        <span class="arrow" aria-hidden="true">→</span>
      </a>`
        )
        .join("")}
    </div>
    <p class="body-sm" data-r style="margin-top:18px" id="empty" hidden>No articles in this category.</p>
  </div>
</section>

<section class="sect" style="background:var(--paper-2);border-block:1px solid var(--rule)" aria-labelledby="moreH">
  <div class="wrap" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4vw,64px)">
    <div>
      <p class="eyebrow" data-r>Keep reading</p>
      <h2 class="d2" id="moreH" data-r style="margin-top:14px;max-width:14ch">Related on the site.</h2>
    </div>
    <div class="links" data-r style="align-content:center">
      <a href="/solutions/saas">SaaS solutions</a>
      <a href="/solutions/trucking-logistics">Trucking solutions</a>
      <a href="/work">Case studies</a>
      <a href="/contact#brief">Send a brief</a>
    </div>
  </div>
</section>
${CTA}
`;

const filterScript = `<script>
(function(){
const buttons=[...document.querySelectorAll('.filters button')];
const posts=[...document.querySelectorAll('#ledger .post')];
const empty=document.getElementById('empty');
buttons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const cat=btn.getAttribute('data-cat');
    buttons.forEach(b=>b.setAttribute('aria-pressed', String(b===btn)));
    let shown=0;
    posts.forEach(p=>{
      const match=cat==='all'||p.getAttribute('data-cat')===cat;
      p.hidden=!match;
      if(match) shown++;
    });
    if(empty) empty.hidden=shown>0;
  });
})();
</script>`;

/* ── Article CSS ── */
const articleCss = `
.progress{position:fixed;left:0;top:0;height:2px;width:0;background:var(--blue);z-index:95;transform-origin:0 50%}
.art-hero{padding:calc(72px + clamp(22px,3.5vw,48px)) 0 clamp(28px,4vw,48px)}
.back{display:inline-flex;align-items:center;gap:8px;font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel);margin-bottom:28px}
.back:hover{color:var(--ink)}
.art-hero .cat{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--steel)}
.art-hero h1{margin:16px 0 18px;max-width:22ch}
.art-hero .lede{max-width:62ch}
.art-meta{display:flex;flex-wrap:wrap;gap:14px 22px;margin-top:22px;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--steel);padding-top:18px;border-top:1px solid var(--rule)}
.cover{aspect-ratio:16/9;background:linear-gradient(145deg,#161C22 0%,#0E1216 55%,#1B44C8 160%);margin:clamp(28px,4vw,48px) 0;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(18px,2.5vw,28px);color:#DDE2E7}
.cover .lines{display:grid;gap:6px}.cover .lines i{display:block;height:6px;background:#1F262E}.cover .lines i:nth-child(1){width:36%}.cover .lines i:nth-child(2){width:58%}.cover .lines i:nth-child(3){width:44%}
.cover-k{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#8C98A4}
.cover-q{margin-top:18px;font-family:var(--f-display);font-weight:700;font-size:clamp(1.2rem,2.4vw,1.75rem);letter-spacing:-.025em;line-height:1.25;max-width:28ch;color:#fff}
.cover-meta{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5C6670}
.prose{max-width:72ch;font-size:17px;line-height:1.72;color:var(--ink)}
.prose h2{font-family:var(--f-display);font-weight:750;font-size:clamp(1.25rem,2vw,1.55rem);letter-spacing:-.025em;margin:2.2em 0 .7em;line-height:1.2}
.prose p{margin:0 0 1.15em;color:var(--steel)}
.prose ul{margin:0 0 1.3em;padding-left:1.2em;color:var(--steel)}
.prose li{margin:.45em 0;padding-left:.2em}
.prose li::marker{color:var(--amber)}
.rel-sol{display:flex;flex-wrap:wrap;gap:8px;margin:clamp(36px,4vw,56px) 0 0;padding-top:22px;border-top:1px solid var(--rule)}
.rel-sol a{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;padding:8px 12px;border:1px solid var(--rule);transition:border-color .3s,color .3s}
.rel-sol a:hover{border-color:var(--ink);color:var(--ink)}
.related{margin-top:clamp(48px,6vw,88px);padding-top:clamp(28px,3.5vw,48px);border-top:1px solid var(--rule)}
.related h2{margin-top:14px}
.rel-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(14px,2vw,22px);margin-top:28px}
.rel-grid a{display:block;padding:clamp(18px,2.2vw,26px);border:1px solid var(--rule);background:var(--white);transition:transform .4s var(--e),box-shadow .4s}
.rel-grid a:hover{transform:translateY(-2px);box-shadow:0 20px 40px -32px rgba(14,18,22,.4)}
.rel-grid .k{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--steel)}
.rel-grid b{display:block;margin-top:10px;font-family:var(--f-display);font-weight:700;font-size:1.15rem;letter-spacing:-.02em;line-height:1.2}
@media(max-width:700px){.rel-grid{grid-template-columns:1fr}}
@media print{.nav,.sheet,.wa,.cta-band,.progress,.back{display:none!important}.art-hero{padding-top:24px}}
`;

function articleSchema(post) {
  // Dates verified. Author bylines are published org labels, not named people — use Organization.
  return `<script type="application/ld+json">
${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedISO,
    author: { "@type": "Organization", name: "KRIVA Technologies" },
    publisher: {
      "@type": "Organization",
      name: "KRIVA Technologies",
      url: "https://krivatechnologies.com",
    },
    mainEntityOfPage: `https://krivatechnologies.com/insights/${post.slug}`,
  })}
</script>`;
}

function articleBody(post) {
  const related = relatedPosts(post.slug);
  return `
<div class="progress" id="progress" aria-hidden="true"></div>
<article>
  <header class="art-hero">
    <div class="wrap">
      <a class="back" href="/insights">← Insights</a>
      <p class="cat" data-r>${esc(post.category)}</p>
      <h1 class="d1" id="h1" data-r style="font-size:clamp(2rem,4.6vw,3.6rem)">${esc(post.title)}</h1>
      <p class="lede" data-r>${esc(post.excerpt)}</p>
      <div class="art-meta" data-r>
        <span><time datetime="${post.publishedISO}">${esc(post.published)}</time></span>
        <span>${esc(post.read)}</span>
        <span>${esc(post.byline || "KRIVA Product Team")}</span>
      </div>
      <div class="cover cover--editorial" data-r aria-hidden="true">
        <div>
          <span class="cover-k">${esc(post.category)}</span>
          <p class="cover-q">${esc(post.excerpt.slice(0, 140))}${post.excerpt.length > 140 ? "…" : ""}</p>
        </div>
        <span class="cover-meta">${esc(post.read)} · ${esc(post.published)}</span>
      </div>
    </div>
  </header>
  <div class="wrap">
    <div class="prose" data-r>
      ${renderBlocks(post.blocks)}
    </div>
    ${
      post.relatedSolutions?.length
        ? `<nav class="rel-sol" aria-label="Related pages" data-r>${post.relatedSolutions
            .map((s) => `<a href="${s.href}">${esc(s.label)}</a>`)
            .join("")}</nav>`
        : ""
    }
    <aside class="related" aria-labelledby="relH">
      <p class="eyebrow" data-r>Keep reading</p>
      <h2 class="d2" id="relH" data-r>Related insights</h2>
      <div class="rel-grid" data-s>
        ${related
          .map(
            (r) => `<a href="/insights/${r.slug}"><span class="k">${esc(r.category)}</span><b>${esc(r.title)}</b></a>`
          )
          .join("")}
      </div>
    </aside>
  </div>
</article>
${CTA}
`;
}

const progressScript = `<script>
(function(){
const bar=document.getElementById('progress');
const art=document.querySelector('article');
if(!bar||!art) return;
const onScroll=()=>{
  const rect=art.getBoundingClientRect();
  const total=art.offsetHeight - innerHeight;
  const done=Math.min(1, Math.max(0, (-rect.top) / Math.max(total,1)));
  bar.style.width=(done*100)+'%';
};
addEventListener('scroll', onScroll, {passive:true});
onScroll();
})();
</script>`;

/* ── FAQ ── */
const faqItems = [
  { q: "What services do you offer?", a: "We design and build two types of software: trucking and logistics tools (dispatch CRM, fleet dashboards, driver apps) and SaaS products (onboarding, dashboards, MVPs, design systems). We also build QuickBooks and Xero integrations and set up workflow automation. We don't do everything — we do these things well because we've spent years on them." },
  { q: "How long does a typical project take?", a: "A focused MVP or redesign is usually 6 to 10 weeks. A full-stack SaaS platform with integrations runs 12 to 20 weeks. Discovery sprints are 1 to 2 weeks. We'll give you an honest timeline in our first call. We don't inflate estimates to soften the truth." },
  { q: "Do you subcontract any work?", a: "No. Every designer and engineer on your project is a permanent KRIVA team member. We don't use freelance marketplaces or offshore subcontractors. The team you meet in the first call is the team that builds your product." },
  { q: "Do you work with startups and enterprises?", a: "Both. For startups, we're used to fast timelines, limited scope, and investor-facing deliverables. For scale-ups and enterprises, we're used to compliance requirements, complex integrations, and multi-stakeholder sign-off. We scope projects accordingly." },
  { q: "How do you use AI in your delivery?", a: "We use Claude for content and brief drafting, GitHub Copilot for code generation, Cursor for rapid prototyping, and Figma AI for asset generation. Every output is reviewed by a senior team member before it reaches you. AI makes us faster. People make sure it's right." },
  { q: "Who owns the design files and code after the project?", a: "You do. All Figma files, GitHub repositories, and documentation are transferred to you at project close, or before if you prefer. No lock-in, no vendor dependency. We'll help you onboard your internal team on what we've built." },
  { q: "What happens after launch?", a: "Most clients move to a monthly retainer after go-live. We offer iteration sprints, performance monitoring, and roadmap support. You can scale the retainer up or pause it depending on your needs. We don't vanish after handoff." },
  { q: "Do you work with US-based clients remotely?", a: "Yes. Our team covers UK and US time zones. We run async comms via Slack and weekly video calls at times that work across both regions. Most of our US trucking clients have never met us in person and still renew their retainers." },
  { q: "What do you need from us to get started?", a: "A brief (we'll send you a template), your timeline, and a 20-minute fit call. If you don't have a brief yet, we'll write one together. We're used to clients who come with a problem, not a spec." },
  { q: "Who owns the designs and code?", a: "You do. All Figma files, repositories, and documentation are transferred to you at project completion." },
  { q: "How is pricing structured?", a: "Fixed-scope projects, monthly retainers, or sprint-based work. Everything is scoped after discovery, with clear deliverables and milestones agreed upfront." },
  { q: "Can you work with our existing team?", a: "Absolutely. We embed with in-house designers, developers, or product managers and adapt to your tools and working style." },
  { q: "Do you sign NDAs?", a: "Yes. Mutual NDAs are standard before we get into any sensitive product details or architecture." },
  { q: "Which time zones do you support?", a: "We're remote-first with overlap for US, UK, India, and APAC. We align stand-ups and async updates to your team's schedule." },
];

const faqCss = `
.faq{margin-top:clamp(36px,4vw,64px);border-top:1px solid var(--rule)}
.faq details{border-bottom:1px solid var(--rule)}
.faq summary{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:clamp(16px,2vw,22px) 0;cursor:pointer;list-style:none;font-family:var(--f-display);font-weight:700;font-size:clamp(1.05rem,1.6vw,1.28rem);letter-spacing:-.02em;line-height:1.3}
.faq summary::-webkit-details-marker{display:none}
.faq summary .plus{width:28px;height:28px;border:1px solid var(--rule);position:relative;flex:none;margin-top:2px;transition:transform .4s var(--e),border-color .3s}
.faq summary .plus::before,.faq summary .plus::after{content:"";position:absolute;inset:50% 7px;height:1px;background:var(--ink);transition:transform .4s var(--e)}
.faq summary .plus::after{transform:rotate(90deg)}
.faq details[open] summary .plus{border-color:var(--amber);transform:rotate(90deg)}
.faq details[open] summary .plus::after{transform:rotate(0)}
.faq .ans{padding:0 0 clamp(18px,2.2vw,26px);font-size:15.5px;line-height:1.65;color:var(--steel);max-width:68ch}
`;

const faqBody = `
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">FAQ</li>
    </ol>
    <p class="eyebrow" data-r style="margin-top:clamp(22px,3vw,40px)">FAQ</p>
    <h1 class="d1 mask" data-mask id="h1"><span><i>Straight answers</i></span><span><i>before you book a call.</i></span></h1>
    <p class="lede" data-r>Services, timelines, pricing, ownership, and how we collaborate with your team — without the usual agency vagueness.</p>
    <div class="hero-actions" data-r>
      <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
      <a href="/contact#brief" class="btn ghost"><span>Send a project brief</span><i>→</i></a>
    </div>
    <div class="faq" data-r>
      ${faqItems
        .map(
          (item, i) => `<details${i === 0 ? " open" : ""}>
        <summary>${esc(item.q)}<span class="plus" aria-hidden="true"></span></summary>
        <div class="ans"><p>${esc(item.a)}</p></div>
      </details>`
        )
        .join("")}
    </div>
  </div>
</header>
<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Still have questions?</p>
    <h2 class="d2" id="ctaH" data-r>Not finding the answer you need?</h2>
    <p class="body-sm" data-r style="color:#8C98A4;margin-top:18px;max-width:54ch">Send a specific question or book a 20-minute call. We'll give you a straight answer, no pitch attached.</p>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Book a 20-minute fit call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
      </div>
      <p class="assur" data-r>
        <span><i>◆</i>Reply within one business day</span>
        <span><i>◆</i>NDA on request</span>
        <span><i>◆</i>No commitment required</span>
      </p>
    </div>
  </div>
</section>
`;

const faqSchema = `<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
})}
</script>`;

/* ── Technologies ── */
const techCats = [
  { label: "Design", items: ["Figma", "Framer", "FigJam", "Design systems"] },
  { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
  { label: "Mobile", items: ["React Native", "Flutter", "iOS & Android UI"] },
  { label: "Backend", items: ["Node.js", "Python", "PostgreSQL", "Redis"] },
  { label: "AI & Automation", items: ["Claude", "ChatGPT", "GitHub Copilot", "Make", "Cursor"] },
  { label: "No-Code", items: ["Webflow", "Bubble", "Framer", "Zapier"] },
];

const techCss = `
.stack-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,22px);margin-top:clamp(32px,4vw,56px)}
.stack-grid article{background:var(--white);border:1px solid var(--rule);padding:clamp(18px,2.2vw,28px)}
.stack-grid h3{margin-bottom:14px}
.stack-grid ul{list-style:none;display:flex;flex-wrap:wrap;gap:7px}
.stack-grid li{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border:1px solid var(--rule-soft);color:var(--steel)}
@media(max-width:900px){.stack-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.stack-grid{grid-template-columns:1fr}}
.note{margin-top:22px;display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.55;color:var(--steel);max-width:70ch}
`;

const techBody = `
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Tools &amp; stack</li>
    </ol>
    <p class="eyebrow" data-r style="margin-top:clamp(22px,3vw,40px)">Tools &amp; stack</p>
    <h1 class="d1 mask" data-mask id="h1"><span><i>A practical stack</i></span><span><i>with senior oversight.</i></span></h1>
    <p class="lede" data-r>Figma, Next.js, React Native, APIs, and carefully reviewed AI tooling. We choose for maintainability — and people approve what ships.</p>
    <div class="hero-actions" data-r>
      <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
      <a href="/process" class="btn ghost"><span>See our process</span><i>→</i></a>
    </div>
  </div>
</header>
<section class="sect" style="padding-top:0" aria-labelledby="stackH">
  <div class="wrap">
    <p class="eyebrow" data-r>Stack</p>
    <h2 class="d2" id="stackH" data-r style="margin-top:14px">Technologies we work with daily</h2>
    <div class="stack-grid" data-s>
      ${techCats
        .map(
          (c) => `<article>
        <h3 class="d3">${esc(c.label)}</h3>
        <ul>${c.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      </article>`
        )
        .join("")}
    </div>
    <p class="note" data-r><span class="flag tbd">Note</span> “Design systems” and “iOS &amp; Android UI” appear on the live stack page; they are capabilities as well as tooling labels. Framer is listed under both Design and No-Code on the live site — preserved here.</p>
  </div>
</section>
<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Technical fit</p>
    <h2 class="d2" id="ctaH" data-r>Need a specific stack or integration?</h2>
    <p class="body-sm" data-r style="color:#8C98A4;margin-top:18px;max-width:54ch">Tell us about your existing tools and constraints. We'll figure out the right approach for your team.</p>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Book a 20-minute fit call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
      </div>
      <p class="assur" data-r>
        <span><i>◆</i>Reply within one business day</span>
        <span><i>◆</i>NDA on request</span>
        <span><i>◆</i>No commitment required</span>
      </p>
    </div>
  </div>
</section>
`;

/* ── Legal pages ── */
const legalCss = `
.legal{display:grid;grid-template-columns:minmax(180px,.7fr) minmax(0,1.8fr);gap:clamp(28px,5vw,72px);align-items:start;margin-top:clamp(28px,3.5vw,48px)}
.toc{position:sticky;top:72px;align-self:start}
.toc h2{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel);font-weight:400;margin-bottom:14px}
.toc ol{list-style:none;display:grid;gap:6px}
.toc a{display:block;font-size:13.5px;line-height:1.4;color:var(--steel);padding:4px 0;border-left:2px solid transparent;padding-left:12px;transition:color .3s,border-color .3s}
.toc a:hover,.toc a[aria-current="true"]{color:var(--ink);border-left-color:var(--blue)}
.cl{padding:clamp(22px,2.6vw,34px) 0;border-top:1px solid var(--rule)}
.cl:first-of-type{border-top:0;padding-top:0}
.cl h2{font-family:var(--f-display);font-weight:750;font-size:clamp(1.2rem,1.8vw,1.45rem);letter-spacing:-.02em;margin-bottom:12px;scroll-margin-top:90px}
.cl h2 a{opacity:0;margin-left:8px;font-size:.7em;color:var(--steel);transition:opacity .3s}
.cl:hover h2 a{opacity:1}
.cl p{font-size:15.5px;line-height:1.7;color:var(--steel);max-width:68ch}
@media(max-width:860px){.legal{grid-template-columns:1fr}.toc{position:static;padding-bottom:18px;border-bottom:1px solid var(--rule)}}
@media print{.nav,.sheet,.wa,.toc,.cta-band{display:none!important}.legal{display:block}.cl h2 a{display:none}}
`;

function legalPage({ crumb, h1, lede, sections, contactLine }) {
  return `
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">${crumb}</li>
    </ol>
    <p class="eyebrow" data-r style="margin-top:clamp(22px,3vw,40px)">${crumb === "Privacy" ? "Privacy" : "Legal"}</p>
    <h1 class="d1" id="h1" data-r style="font-size:clamp(2.2rem,5vw,4rem)">${h1}</h1>
    <p class="lede" data-r>${lede}</p>
    <div class="legal">
      <nav class="toc" aria-label="Contents" data-r>
        <h2>Contents</h2>
        <ol>
          ${sections.map((s, i) => `<li><a href="#s${i + 1}">${esc(s.h)}</a></li>`).join("")}
        </ol>
      </nav>
      <div data-r>
        ${sections
          .map(
            (s, i) => `<section class="cl" id="s${i + 1}">
          <h2>${esc(s.h)}<a href="#s${i + 1}" aria-label="Permalink">#</a></h2>
          <p>${esc(s.p)}</p>
        </section>`
          )
          .join("")}
        <p class="body-sm" style="margin-top:28px">${contactLine}</p>
        <p class="body-sm" style="margin-top:12px"><span class="flag tbd">TBD</span> Analytics provider / cookie inventory not named on the live site — confirm before launch.</p>
      </div>
    </div>
  </div>
</header>
<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Questions</p>
    <h2 class="d2" id="ctaH" data-r>Need to talk something through?</h2>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Book a 20-minute fit call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a brief</span><i>→</i></a>
      </div>
      <p class="assur" data-r>
        <span><i>◆</i>Reply within one business day</span>
        <span><i>◆</i>NDA on request</span>
      </p>
    </div>
  </div>
</section>`;
}

const tocScript = `<script>
(function(){
const links=[...document.querySelectorAll('.toc a')];
const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
if(!sections.length) return;
const io=new IntersectionObserver(es=>{
  for(const e of es){
    if(!e.isIntersecting) continue;
    const id='#'+e.target.id;
    links.forEach(a=>a.setAttribute('aria-current', a.getAttribute('href')===id ? 'true' : 'false'));
  }
},{rootMargin:'-30% 0px -55% 0px', threshold:0});
sections.forEach(s=>io.observe(s));
})();
</script>`;

const privacySections = [
  { h: "Overview", p: "We collect only the information needed to respond to inquiries, deliver services, and improve our website. We do not sell personal data." },
  { h: "Information we collect", p: "When you submit our contact form, we may collect your name, email address, company name, project details, budget range, timeline, and any message you provide. We also collect standard technical data such as browser type, device information, and pages visited through analytics tools." },
  { h: "How we use information", p: "We use contact submissions to evaluate fit, prepare proposals, schedule calls, and communicate about active engagements. Analytics data helps us understand site performance and improve content. We may use email service providers and CRM tools to manage communications." },
  { h: "Third-party services", p: "Our site may use hosting, email delivery (such as Resend), analytics, scheduling embeds, and mapping services. These providers process data on our behalf under their own privacy policies. Links to third-party sites are governed by those sites' policies." },
  { h: "Data retention", p: "We retain inquiry records for as long as needed to respond, maintain business records, and comply with legal obligations. You may request deletion of marketing-related data where applicable law allows." },
  { h: "Your rights", p: "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, and to object to certain uses. Contact us to exercise these rights." },
  { h: "Security", p: "We use reasonable technical and organizational measures to protect information. No method of transmission over the internet is completely secure." },
  { h: "Contact", p: "For privacy questions or requests, use the contact form." },
];

const termsSections = [
  { h: "Agreement", p: 'By accessing this website, you agree to these terms. If you do not agree, please do not use the site. KRIVA Technologies ("KRIVA", "we", "us") provides design, development, and related digital services to business clients.' },
  { h: "Website use", p: "You may browse our site for lawful purposes. You may not attempt to disrupt the site, scrape content at scale, introduce malware, or misrepresent your identity when contacting us." },
  { h: "Professional services", p: "Proposals, statements of work, and master service agreements define scope, deliverables, timelines, fees, acceptance criteria, and change control for paid work. Website content is informational and does not constitute a binding offer until confirmed in writing." },
  { h: "Intellectual property", p: "Site content, branding, and marketing materials remain our property unless otherwise stated. Client deliverables and licensing terms are specified in each engagement agreement. You retain ownership of materials you provide to us for project use." },
  { h: "Confidentiality", p: "We treat non-public business information shared during discovery as confidential. Mutual confidentiality terms in project agreements supersede this general statement where they differ." },
  { h: "Disclaimers", p: 'The site is provided "as is" without warranties of uninterrupted availability. Case studies and metrics reflect past client results; outcomes vary by context. Third-party tools and links are not under our control.' },
  { h: "Limitation of liability", p: "To the extent permitted by law, we are not liable for indirect or consequential damages arising from use of this website. Liability caps for paid services are defined in the applicable client agreement." },
  { h: "Governing law", p: "These terms are governed by the laws of India, without regard to conflict-of-law principles. Disputes will be subject to the exclusive jurisdiction of courts in Ahmedabad, Gujarat, unless otherwise agreed in writing." },
  { h: "Contact", p: "Questions about these terms: use the contact form." },
];

/* ── Write all pages ── */
const written = [];

function write(file, html) {
  fs.writeFileSync(path.join(ROOT, file), html, "utf8");
  written.push(file);
  console.log("WROTE", file);
}

// Insights index
write(
  "kriva-insights-index.html",
  shell({
    title: "Insights · SaaS, Trucking &amp; Product Delivery · KRIVA",
    description:
      "Practical articles from KRIVA on SaaS onboarding, trucking dispatch CRM, MVP choices, and digital product delivery for UK and US teams.",
    canonical: "https://krivatechnologies.com/insights",
    ogTitle: "Insights · SaaS, Trucking &amp; Product Delivery",
    pageCss: insightsCss,
    body: insightsIndexBody,
    extraHead: `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "KRIVA insights",
      url: "https://krivatechnologies.com/insights",
      hasPart: sorted.map((p) => ({
        "@type": "Article",
        headline: p.title,
        datePublished: p.publishedISO,
        url: `https://krivatechnologies.com/insights/${p.slug}`,
      })),
    })}</script>`,
    extraScript: filterScript,
  })
);

// Articles
for (const post of posts) {
  write(
    `kriva-insight-${post.slug}.html`,
    shell({
      title: `${esc(post.title)} · KRIVA`,
      description: esc(post.excerpt),
      canonical: `https://krivatechnologies.com/insights/${post.slug}`,
      ogTitle: esc(post.title),
      ogType: "article",
      publishedTime: post.publishedISO,
      pageCss: articleCss,
      body: articleBody(post),
      extraHead: articleSchema(post),
      extraScript: progressScript,
    })
  );
}

write(
  "kriva-faq.html",
  shell({
    title: "FAQ · Working with KRIVA",
    description:
      "Common questions about working with KRIVA - services for UK SaaS and US trucking, timelines, pricing, ownership, and process.",
    canonical: "https://krivatechnologies.com/faq",
    ogTitle: "FAQ · Working with KRIVA",
    pageCss: faqCss,
    body: faqBody,
    extraHead: faqSchema,
  })
);

write(
  "kriva-technologies.html",
  shell({
    title: "Tools &amp; Stack · KRIVA",
    description:
      "Design and engineering stack KRIVA uses for SaaS and trucking products - Figma, Next.js, React, APIs, and carefully reviewed AI tooling.",
    canonical: "https://krivatechnologies.com/technologies",
    ogTitle: "Tools &amp; Stack",
    pageCss: techCss,
    body: techBody,
  })
);

write(
  "kriva-privacy.html",
  shell({
    title: "Privacy Policy · KRIVA",
    description: "How KRIVA Technologies collects, uses, and protects personal information.",
    canonical: "https://krivatechnologies.com/privacy",
    ogTitle: "Privacy Policy",
    pageCss: legalCss,
    body: legalPage({
      crumb: "Privacy",
      h1: "Privacy Policy",
      lede: "Last updated: May 2026. This policy explains how KRIVA Technologies handles information when you visit our website or contact us about a project.",
      sections: privacySections,
      contactLine:
        'Office: 511 - I The Address, Ahmedabad, Gujarat 380060, IN',
    }),
    extraScript: tocScript,
  })
);

write(
  "kriva-terms.html",
  shell({
    title: "Terms &amp; Conditions · KRIVA",
    description: "Terms governing use of the KRIVA website and professional services.",
    canonical: "https://krivatechnologies.com/terms",
    ogTitle: "Terms &amp; Conditions",
    pageCss: legalCss,
    body: legalPage({
      crumb: "Terms",
      h1: "Terms &amp; Conditions",
      lede: "Last updated: May 2026. These terms apply to your use of the KRIVA website. Separate statements of work govern paid engagements.",
      sections: termsSections,
      contactLine:
        'Questions: <a href="/contact#brief">contact form</a> · Ahmedabad, Gujarat, India',
    }),
    extraScript: tocScript,
  })
);

console.log("\nApplying chrome…");
for (const f of written) console.log(applyFile(f));
console.log("\nDone.", written.length, "files");
