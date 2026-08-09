/**
 * Phase 6 — 12 standalone service pages (Option 1).
 * Run: node build_priority6.cjs
 */
const fs = require("fs");
const path = require("path");
const { services, deferred } = require("./content/services-data.cjs");
const { applyFile, PAGE_CURRENT } = require("./apply_chrome.cjs");

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

const PAGE_CSS = `
.progress{position:fixed;top:0;left:0;height:2px;width:100%;transform:scaleX(0);transform-origin:0 50%;background:var(--blue);z-index:95;will-change:transform}
.chapters{position:fixed;right:calc(var(--gutter) - 8px);top:50%;transform:translateY(-50%);z-index:70;display:grid;gap:2px;opacity:0;transition:opacity var(--t-mid) var(--e);pointer-events:none}
.chapters.show{opacity:1;pointer-events:auto}
.chapters a{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:5px 8px;font-family:var(--f-mono);font-size:10px;letter-spacing:.11em;text-transform:uppercase;color:var(--steel-2)}
.chapters a span{opacity:0;transform:translateX(6px);transition:opacity var(--t-fast) var(--e),transform var(--t-fast) var(--e)}
.chapters:hover a span,.chapters a[aria-current="true"] span{opacity:1;transform:none}
.chapters a i{display:block;width:18px;height:1px;background:var(--rule);flex:none;transition:width var(--t-fast) var(--e),background var(--t-fast)}
.chapters a:hover i{width:26px;background:var(--steel)}
.chapters a[aria-current="true"]{color:var(--ink)}
.chapters a[aria-current="true"] i{width:34px;background:var(--blue)}
@media(max-width:1280px){.chapters{display:none}}

.mob-chips{
  display:none;position:sticky;top:58px;z-index:60;gap:8px;overflow-x:auto;
  padding:10px 0 12px;margin:0 calc(-1 * var(--gutter));padding-inline:var(--gutter);
  background:rgba(234,234,228,.94);border-bottom:1px solid var(--rule);scrollbar-width:none
}
.mob-chips::-webkit-scrollbar{display:none}
.mob-chips a{
  flex:none;font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  padding:7px 11px;border:1px solid var(--rule);color:var(--steel);background:var(--white);white-space:nowrap
}
.mob-chips a[aria-current="true"]{border-color:var(--ink);color:var(--ink)}
@media(max-width:1280px){.mob-chips{display:flex}}

.hero-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(24px,4vw,64px);align-items:end;margin-top:clamp(22px,3vw,40px)}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:20px}
.tag{font-family:var(--f-mono);font-size:10px;letter-spacing:.09em;text-transform:uppercase;padding:4px 9px;border:1px solid var(--rule);color:var(--steel)}
.aside-card{background:var(--white);border:1px solid var(--rule);padding:clamp(18px,2.2vw,26px)}
.aside-card h2{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel);font-weight:400;margin-bottom:14px}
.aside-card ul{list-style:none;display:grid;gap:10px}
.aside-card li{font-size:14.5px;display:flex;gap:9px;align-items:flex-start}
.aside-card li::before{content:"—";color:var(--rule);flex:none}
.contrast{margin-top:18px;padding:14px 16px;border-left:2px solid var(--amber);background:var(--paper-2);font-size:14.5px;line-height:1.55;color:var(--ink);max-width:54ch}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr}}

.shot{position:relative;background:var(--ink);overflow:hidden;margin-top:clamp(28px,3.5vw,48px)}
.shot .media{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden}
.slot{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(14px,2vw,22px);background:linear-gradient(160deg,#161C22,#0E1216)}
.slot .skel{display:grid;gap:7px}
.slot .skel i{display:block;height:7px;background:#1F262E}
.slot .skel i:nth-child(1){width:34%}.slot .skel i:nth-child(2){width:58%}.slot .skel i:nth-child(3){width:46%}
.slot .tagline{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5C6670;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
.shot-cap{margin-top:12px;display:flex;gap:11px;align-items:baseline;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--steel-2)}

.chal{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:clamp(28px,3.5vw,48px)}
.chal article{background:var(--paper);padding:clamp(22px,2.6vw,34px)}
.chal .n{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel);display:block;margin-bottom:12px}
.chal h3{margin-bottom:10px}
.chal p{color:var(--steel);max-width:32ch}
@media(max-width:860px){.chal{grid-template-columns:1fr}}

.approach{display:grid;gap:0;margin-top:clamp(28px,3.5vw,48px);border-top:1px solid var(--rule)}
.ap-row{display:grid;grid-template-columns:88px minmax(0,1fr);gap:clamp(16px,3vw,40px);padding:clamp(22px,2.8vw,36px) 0;border-bottom:1px solid var(--rule)}
.ap-row .idx{font-family:var(--f-display);font-weight:800;font-size:clamp(1.8rem,3vw,2.6rem);letter-spacing:-.04em;color:var(--rule);line-height:1}
@media(max-width:640px){.ap-row{grid-template-columns:1fr;gap:8px}}

.deliv{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:clamp(28px,3.5vw,48px)}
.deliv div{background:var(--white);padding:clamp(18px,2.2vw,26px)}
.deliv b{display:block;font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--steel);margin-bottom:10px}
.deliv p{font-size:15px;line-height:1.5;color:var(--ink)}
@media(max-width:900px){.deliv{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.deliv{grid-template-columns:1fr}}

.outcomes{margin-top:clamp(48px,5vw,80px);padding-top:clamp(36px,4vw,56px);border-top:1px solid var(--rule)}
.gain{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(24px,4vw,64px);align-items:start}
.gain ul{list-style:none;display:grid;gap:14px}
.gain li{padding:16px 18px;background:var(--white);border:1px solid var(--rule);font-size:15.5px;line-height:1.5}
@media(max-width:800px){.gain{grid-template-columns:1fr}}

.faq{margin-top:clamp(28px,3.5vw,48px);display:grid;gap:12px;max-width:760px}
.faq details{background:var(--white);border:1px solid var(--rule);padding:16px 18px}
.faq summary{cursor:pointer;font-family:var(--f-display);font-weight:700;font-size:1.05rem;letter-spacing:-.015em;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq p{margin-top:10px;font-size:15px;line-height:1.6;color:var(--steel)}

.rel{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,1.8vw,22px);margin-top:clamp(28px,3.5vw,48px)}
.rel a{display:flex;flex-direction:column;justify-content:space-between;gap:28px;padding:clamp(18px,2.2vw,26px);background:var(--white);border:1px solid var(--rule);min-height:160px;transition:transform .5s var(--e),border-color .4s}
.rel a:hover{transform:translate3d(0,-4px,0);border-color:var(--ink)}
.rel .k{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel)}
.rel .arrow{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}
.rel .arrow i{font-style:normal;transition:transform .42s var(--e)}
.rel a:hover .arrow i{transform:translateX(6px)}
@media(max-width:860px){.rel{grid-template-columns:1fr}}

.sib{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.sib a{font-family:var(--f-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:8px 12px;border:1px solid var(--rule);transition:border-color var(--t-fast),color var(--t-fast)}
.sib a:hover{border-color:var(--blue);color:var(--blue)}

/* Phase 11 — intentional brief board (no empty screenshot theater) */
.brief{margin-top:clamp(28px,3.5vw,48px);border:1px solid var(--rule);background:var(--white);display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}
.brief-main{padding:clamp(22px,2.8vw,36px);border-right:1px solid var(--rule)}
.brief-side{padding:clamp(22px,2.8vw,36px);background:var(--paper-2);display:grid;align-content:space-between;gap:24px}
.brief .k{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel);margin-bottom:14px}
.brief-list{list-style:none;display:grid;gap:12px}
.brief-list li{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start;font-size:15px;line-height:1.45}
.brief-list .n{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;color:var(--steel);padding-top:3px}
.brief-meta{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel);display:grid;gap:10px}
.brief-meta b{color:var(--ink);font-weight:500}
@media(max-width:800px){.brief{grid-template-columns:1fr}.brief-main{border-right:0;border-bottom:1px solid var(--rule)}}
`;

const SCRIPT = `<script src="/shared/chrome.js" defer></script>
<script>
(function(){
'use strict';
const readers=[]; let ticking=false;
const onScroll=()=>{ if(!ticking){ requestAnimationFrame(run); ticking=true; } };
function run(){ const y=scrollY; for(const r of readers) r(y); ticking=false; }
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', onScroll, {passive:true});
const io=new IntersectionObserver(es=>{
  for(const e of es){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }
},{threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach(el=>{
  if(el.hasAttribute('data-mask')) el.classList.add('mask');
  io.observe(el);
});
const bar=document.getElementById('progress');
if(bar) readers.push(y=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  bar.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';
});
const chLinks=[...document.querySelectorAll('#chapters a')];
const chTargets=chLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
const chRail=document.getElementById('chapters');
if(chRail) readers.push(y=>chRail.classList.toggle('show', y>420));
const chIO=new IntersectionObserver(es=>{
  for(const e of es){
    if(!e.isIntersecting) continue;
    const i=chTargets.indexOf(e.target);
    chLinks.forEach((a,j)=>a.setAttribute('aria-current', j===i?'true':'false'));
  }
},{rootMargin:'-40% 0px -55% 0px'});
chTargets.forEach(t=>chIO.observe(t));
const mob=[...document.querySelectorAll('#mobChips a')];
if(mob.length){
  const mobIO=new IntersectionObserver(es=>{
    for(const e of es){
      if(!e.isIntersecting) continue;
      const id=e.target.id;
      mob.forEach(a=>a.setAttribute('aria-current', a.getAttribute('href')==='#'+id?'true':'false'));
    }
  },{rootMargin:'-35% 0px -55% 0px'});
  chTargets.forEach(t=>mobIO.observe(t));
}
run();
})();
</script>`;

function benefitsHtml(benefits) {
  return benefits
    .map((b) => {
      if (typeof b === "string") return `<li>${esc(b)}</li>`;
      return `<li>${esc(b.text)}<br><span class="body-sm" style="display:block;margin-top:6px;color:var(--steel)">${esc(b.tbd)}</span></li>`;
    })
    .join("\n          ");
}

function buildService(s) {
  const canonical = `https://krivatechnologies.com/services/${s.slug}`;
  const displayH1 = s.h1Display || s.h1;
  const label = s.serviceLabel || s.h1;
  const masks = maskLines(displayH1)
    .map((line) => `<span><i>${esc(line)}</i></span>`)
    .join("\n          ");

  const tags = s.bullets.map((b) => `<span class="tag">${esc(b)}</span>`).join("");
  const challenges = s.challenges
    .map((c, i) => {
      const title = typeof c === "object" ? c.title : String(c);
      const body = typeof c === "object" ? c.body : String(c);
      return `<article data-r>
        <span class="n">0${i + 1}</span>
        <h3 class="d3">${esc(title)}</h3>
        <p class="body-sm">${esc(body)}</p>
      </article>`;
    })
    .join("\n      ");
  const briefItems = s.approach
    .slice(0, 3)
    .map(
      (a, i) =>
        `<li><span class="n">0${i + 1}</span><span><b>${esc(a.title)}</b> — ${esc(a.body)}</span></li>`
    )
    .join("");
  const approach = s.approach
    .map(
      (a) => `<div class="ap-row" data-r>
        <span class="idx num">${esc(a.n)}</span>
        <div>
          <h3 class="d3">${esc(a.title)}</h3>
          <p class="body-sm" style="margin-top:10px">${esc(a.body)}</p>
        </div>
      </div>`
    )
    .join("\n      ");
  const deliverables = s.deliverables
    .map(
      (d, i) => `<div data-r>
        <b>0${i + 1}</b>
        <p>${esc(d)}</p>
      </div>`
    )
    .join("\n      ");
  const faq = s.faq
    .map(
      (f) => `<details>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`
    )
    .join("\n      ");
  const proof = s.proof
    .map(
      (p) => `<a href="${esc(p.href)}">
        <span class="k">${esc(p.k)}</span>
        <span class="arrow"><span class="d3">${esc(p.label)}</span><i>→</i></span>
      </a>`
    )
    .join("\n      ");
  const related = s.related
    .map((r) => `<a href="${esc(r.href)}">${esc(r.label)}</a>`)
    .join("\n        ");

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: label,
    description: s.meta,
    provider: { "@type": "Organization", name: "KRIVA Technologies" },
    url: canonical,
  };
  const faqSchema =
    s.faq && s.faq.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: s.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.title)}</title>
<meta name="description" content="${esc(s.meta)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(s.ogTitle)}">
<meta property="og:description" content="${esc(s.meta)}">
<meta property="og:url" content="${esc(canonical)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/shared/chrome.css">
<link rel="stylesheet" href="/shared/slot-assets.css">
<style>
${TOKENS}
${PAGE_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="progress" id="progress" aria-hidden="true"></div>

<!--KRIVA_CHROME-->

<nav class="chapters" id="chapters" aria-label="Sections">
  <a href="#overview"><span>Overview</span><i></i></a>
  <a href="#challenges"><span>Challenges</span><i></i></a>
  <a href="#approach"><span>Approach</span><i></i></a>
  <a href="#deliverables"><span>Deliverables</span><i></i></a>
  <a href="#outcomes"><span>Outcomes</span><i></i></a>
  <a href="#proof"><span>Proof</span><i></i></a>
  <a href="#faq"><span>FAQ</span><i></i></a>
</nav>

<main id="main">

<header class="hero" id="overview">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="/services">Services</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">${esc(label)}</li>
    </ol>
    <nav class="mob-chips" id="mobChips" aria-label="On this page">
      <a href="#overview" aria-current="true">Overview</a>
      <a href="#challenges">Challenges</a>
      <a href="#approach">Approach</a>
      <a href="#deliverables">Deliverables</a>
      <a href="#outcomes">Outcomes</a>
      <a href="#proof">Proof</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div class="hero-grid">
      <div>
        <p class="eyebrow" data-r>${esc(s.eyebrow)} · ${esc(label)}</p>
        <h1 class="d1 mask" data-mask>
          ${masks}
        </h1>
        <p class="lede" data-r>${esc(s.positioning)}</p>
        <div class="tags" data-r>${tags}</div>
        <div class="hero-actions" data-r>
          <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
          <a href="/contact#brief" class="btn ghost"><span>Send a project brief</span><i>→</i></a>
        </div>
      </div>
      <aside class="aside-card" data-r>
        <h2>Where this sits</h2>
        <ul>
          <li>Family · ${esc(s.family)}</li>
          <li>Catalog · ${esc(label)}</li>
          <li>${esc(s.summary)}</li>
        </ul>
        <p class="contrast">${esc(s.contrast)}</p>
      </aside>
    </div>

    <div class="brief" data-r>
      <div class="brief-main">
        <p class="k">How we run this engagement</p>
        <ul class="brief-list">${briefItems}</ul>
      </div>
      <div class="brief-side">
        <div>
          <p class="k">Buyer signal</p>
          <p class="body-sm" style="color:var(--ink);max-width:36ch">${esc(s.positioning)}</p>
        </div>
        <div class="brief-meta">
          <span>Service · <b>${esc(label)}</b></span>
          <span>Next · <b><a href="${esc(s.proof[0]?.href || "/work")}">${esc(s.proof[0]?.label || "Related work")}</a></b></span>
          <span>CTA · <b><a href="/contact#book">Book a 20-minute fit call</a></b></span>
        </div>
      </div>
    </div>
  </div>
</header>

<section class="sect" id="challenges" aria-labelledby="chH" style="border-top:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>Challenges</p>
    <h2 class="d2" id="chH" data-r style="margin-top:16px;max-width:18ch">${esc(s.challengesH2 || "Problems we help solve")}</h2>
    <div class="chal">${challenges}</div>
  </div>
</section>

<section class="sect story" id="approach" aria-labelledby="apH" style="background:var(--paper-2);border-block:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>Approach</p>
    <h2 class="d2" id="apH" data-r style="margin-top:16px;max-width:20ch">${esc(s.approachH2)}</h2>
    <p class="body" data-r style="margin-top:16px">${esc(s.processNote)}</p>
    <div class="approach">${approach}</div>
  </div>
</section>

<section class="sect" id="deliverables" aria-labelledby="delH">
  <div class="wrap">
    <p class="eyebrow" data-r>Deliverables</p>
    <h2 class="d2" id="delH" data-r style="margin-top:16px;max-width:18ch">${esc(s.deliverablesH2 || "What you leave with")}</h2>
    <div class="deliv">${deliverables}</div>
  </div>
</section>

<section class="sect" id="outcomes" aria-labelledby="outH" style="background:var(--paper-2);border-block:1px solid var(--rule)">
  <div class="wrap">
    <div class="gain outcomes" style="margin-top:0;padding-top:0;border-top:0">
      <div data-r>
        <p class="eyebrow">Outcomes</p>
        <h2 class="d2" id="outH" style="margin-top:14px;max-width:16ch">${esc(s.outcomesH2 || "What you gain")}</h2>
        <p class="body-sm" style="margin-top:12px">Qualitative outcomes from the published service brief — not measured case metrics.</p>
      </div>
      <ul data-s>
          ${benefitsHtml(s.benefits)}
      </ul>
    </div>
  </div>
</section>

<section class="sect sect--tight" id="proof" aria-labelledby="pfH">
  <div class="wrap">
    <p class="eyebrow" data-r>Where this shows up</p>
    <h2 class="d2" id="pfH" data-r style="margin-top:16px">Related work and pages</h2>
    <div class="rel" data-s>${proof}</div>
    <p class="eyebrow" data-r style="margin-top:clamp(36px,4vw,56px)">Also see</p>
    <div class="sib" data-r>
        ${related}
      <a href="/services">All services</a>
    </div>
  </div>
</section>

<section class="sect" id="faq" aria-labelledby="faqH" style="background:var(--paper-2);border-block:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>FAQ</p>
    <h2 class="d2" id="faqH" data-r style="margin-top:16px">About ${esc(label)}</h2>
    <div class="faq" data-r>${faq}</div>
  </div>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Start a project</p>
    <h2 class="d2" id="ctaH" data-r>${esc(s.ctaH2 || `Need help with ${s.h1}?`)}</h2>
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

</main>

<!--KRIVA_FOOTER-->

<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
${faqSchema ? `<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>` : ""}
${SCRIPT}
</body>
</html>`;
}

function maskLines(h1) {
  const special = {
    "A CRM the floor will trust.": ["A CRM the floor", "will trust."],
    "Dashboards that answer the shift question first.": ["Dashboards that answer", "the shift question first."],
    "Integrations that fail where operators can see them.": ["Integrations that fail", "where operators can see them."],
    "Mobile UX built for interrupted attention.": ["Mobile UX built for", "interrupted attention."],
    "SaaS UX that activates after signup.": ["SaaS UX that activates", "after signup."],
    "Automate the queue. Keep humans on the send.": ["Automate the queue.", "Keep humans on the send."],
    "AI in the toolchain. Humans on the gate.": ["AI in the toolchain.", "Humans on the gate."],
    "Marketing sites your team can actually run.": ["Marketing sites your team", "can actually run."],
    "Validate the MVP before months of custom build.": ["Validate the MVP before", "months of custom build."],
    "End-to-end product design — strategy to ship.": ["End-to-end product design —", "strategy to ship."],
    "Flows, systems, and UI teams can hand off.": ["Flows, systems, and UI", "teams can hand off."],
    "Brand systems that survive real product surfaces.": ["Brand systems that survive", "real product surfaces."],
    "Evidence before the expensive build.": ["Evidence before", "the expensive build."],
    "Align the room before you write code.": ["Align the room before", "you write code."],
    "Tokens and components that survive releases.": ["Tokens and components", "that survive releases."],
    "Authenticated product UX — not a marketing site.": ["Authenticated product UX —", "not a marketing site."],
    "Marks that scale from favicon to fleet.": ["Marks that scale from", "favicon to fleet."],
  };
  if (special[h1]) return special[h1];
  const words = h1.split(/\s+/);
  if (words.length <= 4) return [h1];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function restoreHubServiceLinks() {
  const file = path.join(ROOT, "kriva-services-index.html");
  let html = fs.readFileSync(file, "utf8");
  const allSlugs = services.map((s) => s.slug);
  for (const slug of allSlugs) {
    const deferredBlock = `<p class="body-sm" style="margin-top:14px"><span class="flag tbd">Hub detail</span> Standalone redesign deferred. Canonical URL reserved: <span class="mono">/services/${slug}</span></p>
            <a class="svc-go" href="/services/${slug}">Canonical URL <i>→</i></a>`;
    const restored = `<a class="svc-go" href="/services/${slug}">View service <i>→</i></a>`;
    if (html.includes(deferredBlock)) {
      html = html.split(deferredBlock).join(restored);
    }
  }
  fs.writeFileSync(file, html, "utf8");
  console.log("Restored hub service CTAs for all standalone pages");
}

function registerChrome() {
  const applyPath = path.join(ROOT, "apply_chrome.cjs");
  let src = fs.readFileSync(applyPath, "utf8");
  if (!src.includes("kriva-service-crm-development.html")) {
    const entries = services
      .map((s) => `  "${s.file}": "${s.chromeNav || "services"}",`)
      .join("\n");
    src = src.replace(
      '  "kriva-services-index.html": "services",',
      `  "kriva-services-index.html": "services",\n${entries}`
    );
    fs.writeFileSync(applyPath, src, "utf8");
    console.log("Registered service pages in apply_chrome.cjs");
  }
  for (const s of services) PAGE_CURRENT[s.file] = s.chromeNav || "services";
}

function main() {
  registerChrome();
  for (const s of services) {
    fs.writeFileSync(path.join(ROOT, s.file), buildService(s), "utf8");
    console.log("Wrote", s.file);
  }
  restoreHubServiceLinks();
  for (const s of services) console.log(applyFile(s.file));
  console.log(applyFile("kriva-services-index.html"));
  if (deferred.length) console.log("Still deferred:", deferred.join(", "));
  else console.log("All 17 services built as standalone pages.");
}

main();
