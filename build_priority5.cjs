/**
 * Phase 5 — Remaining 7 case studies (FleetFlow UX pattern).
 * Run: node build_priority5.cjs
 */
const fs = require("fs");
const path = require("path");
const { cases, order } = require("./content/cases-data.cjs");
const { applyFile, PAGE_CURRENT } = require("./apply_chrome.cjs");

const ROOT = __dirname;
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const CASE_CSS = fs
  .readFileSync(path.join(ROOT, "kriva-case-fleetflow.html"), "utf8")
  .match(/<style>([\s\S]*?)<\/style>/)[1];

const CASE_SCRIPT = `<script src="/shared/chrome.js" defer></script>
<script>
(function(){
'use strict';
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const readers = []; let ticking = false;
const onScroll = () => { if(!ticking){ requestAnimationFrame(run); ticking = true; } };
function run(){ const y = scrollY; for(const r of readers) r(y); ticking = false; }
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', onScroll, {passive:true});

const io = new IntersectionObserver(es=>{
  for(const e of es){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }
},{threshold:.14, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('[data-r],[data-s],[data-mask],[data-shot]').forEach(el=>{
  if(el.hasAttribute('data-mask')) el.classList.add('mask');
  io.observe(el);
});

const bar = document.getElementById('progress');
if(bar) readers.push(y=>{
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y/h) : 0) + ')';
});

const chLinks = [...document.querySelectorAll('#chapters a')];
const chTargets = chLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
const chRail = document.getElementById('chapters');
if(chRail) readers.push(y=>chRail.classList.toggle('show', y > 500));
const chIO = new IntersectionObserver(es=>{
  for(const e of es){
    if(!e.isIntersecting) continue;
    const i = chTargets.indexOf(e.target);
    chLinks.forEach((a,j)=>a.setAttribute('aria-current', j===i ? 'true' : 'false'));
  }
},{rootMargin:'-40% 0px -55% 0px'});
chTargets.forEach(t=>chIO.observe(t));

const beats = [...document.querySelectorAll('.beat')];
const scenes = [...document.querySelectorAll('.story-scene')];
const sName = document.getElementById('storyName'), sMeta = document.getElementById('storyMeta');
let activeBeat = -1;
if(beats.length){
  const bIO = new IntersectionObserver(es=>{
    for(const e of es){
      if(!e.isIntersecting) continue;
      const i = beats.indexOf(e.target);
      if(i === activeBeat) continue;
      activeBeat = i;
      beats.forEach((b,j)=>b.classList.toggle('on', j===i));
      scenes.forEach((s,j)=>s.classList.toggle('on', j===i));
      if(sName) sName.textContent = e.target.dataset.name;
      if(sMeta) sMeta.textContent = String(i+1).padStart(2,'0') + ' / ' + String(beats.length).padStart(2,'0');
    }
  },{rootMargin:'-45% 0px -45% 0px'});
  beats.forEach(b=>bIO.observe(b));
}

const ba = document.getElementById('ba'), baRange = document.getElementById('baRange');
if(ba && baRange){
  const setSplit = v => ba.style.setProperty('--split', v + '%');
  baRange.addEventListener('input', e => setSplit(e.target.value));
  setSplit(baRange.value);
  ba.addEventListener('pointermove', e=>{
    if(e.pressure === 0 && e.buttons === 0) return;
    const r = ba.getBoundingClientRect();
    const v = Math.max(0, Math.min(100, ((e.clientX - r.left)/r.width)*100));
    baRange.value = v; setSplit(v);
  });
}

run();
})();
</script>`;

function nextCase(slug) {
  const i = order.indexOf(slug);
  const nextSlug = order[(i + 1) % order.length];
  if (nextSlug === "fleetflow-dispatch") {
    return {
      href: "/work/fleetflow-dispatch",
      title: "FleetFlow — US trucking dispatch CRM",
      titleHtml: "FleetFlow —<br>US trucking dispatch CRM",
      summary:
        "Modernized a US trucking dispatch CRM with bulk actions, SLA intelligence, and supervisor controls for 400+ daily routes.",
      thumbSlot: "Slot · 1280×800 · FleetFlow",
    };
  }
  const c = cases.find((x) => x.slug === nextSlug);
  return {
    href: `/work/${c.slug}`,
    title: c.title,
    titleHtml: `${esc(c.titleLines[0])}<br>${esc(c.titleLines.slice(1).join(" "))}`,
    summary: c.description,
    thumbSlot: `Slot · 1280×800 · ${c.shortName}`,
  };
}

function stackHtml(stack) {
  return Object.entries(stack)
    .map(([h, items]) => {
      const lis = items
        .map((it) => {
          if (typeof it === "string") return `<li>${esc(it)}</li>`;
          return `<li><a href="${esc(it.href)}">${esc(it.label)}</a></li>`;
        })
        .join("");
      return `<div class="spec-col"><h4>${esc(h)}</h4><ul>${lis}</ul></div>`;
    })
    .join("\n          ");
}

function buildCase(c) {
  const canonical = `https://krivatechnologies.com/work/${c.slug}`;
  const next = nextCase(c.slug);
  const mask = c.titleLines
    .map((line) => `<span><i>${esc(line)}</i></span>`)
    .join("\n          ");
  const tags = c.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const pins = c.pins
    .map(
      (p, i) =>
        `<span class="pin" style="left:${p.left};top:${p.top}" tabindex="0" data-note="${esc(p.note)}">${i + 1}</span>`
    )
    .join("\n      ");
  const scenes = c.beats
    .map(
      (b, i) => `<div class="story-scene${i === 0 ? " on" : ""}" data-scene="${i}">
            <div class="slot" role="img" aria-label="${esc(b.name)}"><div class="skel"><i></i><i></i><i></i></div>
              <div class="tagline"><span>${esc(b.name)}</span><span>${String(i + 1).padStart(2, "0")} / ${String(c.beats.length).padStart(2, "0")}</span></div></div>
          </div>`
    )
    .join("\n          ");
  const beats = c.beats
    .map(
      (b, i) => `<div class="beat" data-beat="${i}" data-name="${esc(b.name)}">
          <span class="n">${esc(b.n)}</span>
          <h3 class="d3">${esc(b.h3)}</h3>
          <p class="body-sm">${esc(b.body)}</p>
        </div>`
    )
    .join("\n        ");
  const related = c.related
    .map(
      (r) => `<a href="${esc(r.href)}">
        <span class="k">${esc(r.k)}</span>
        <span class="arrow"><span class="d3">${esc(r.label)}</span><i>→</i></span>
      </a>`
    )
    .join("\n      ");

  const quote =
    c.testimonial && c.testimonialPublic !== false
      ? `<!-- ══════════ QUOTE ══════════ -->
<figure class="qblock on-ink">
  <div class="wrap">
    <blockquote>“${esc(c.testimonial.quote)}”</blockquote>
    <figcaption>
      <span class="av" aria-hidden="true">${esc(c.testimonial.initials)}</span>
      <span>${esc(c.testimonial.name)}<small>${esc(c.testimonial.role)}</small></span>
    </figcaption>
  </div>
</figure>`
      : "";

  const slugNote = c.slugNote
    ? `<p class="body-sm" style="margin-top:18px">${esc(c.slugNote)}</p>`
    : "";
  const attrNote = "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    author: { "@type": "Organization", name: "KRIVA Technologies" },
    publisher: { "@type": "Organization", name: "KRIVA Technologies" },
    mainEntityOfPage: canonical,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)} · KRIVA</title>
<meta name="description" content="${esc(c.description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(c.title)}">
<meta property="og:description" content="${esc(c.description)}">
<meta property="og:url" content="${esc(canonical)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
${CASE_CSS}
</style>
<link rel="stylesheet" href="/shared/chrome.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<div class="progress" id="progress" aria-hidden="true"></div>

<!--KRIVA_CHROME-->

<!-- COMPONENT: chapter rail -->
<nav class="chapters" id="chapters" aria-label="Sections of this case study">
  <a href="#overview"><span>Overview</span><i></i></a>
  <a href="#context"><span>Context</span><i></i></a>
  <a href="#approach"><span>Approach</span><i></i></a>
  <a href="#build"><span>Build</span><i></i></a>
  <a href="#outcome"><span>Outcome</span><i></i></a>
  <a href="#capabilities"><span>Capabilities</span><i></i></a>
</nav>

<main id="main">

<article>
<header class="ph" id="overview">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="/work">Work</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">${esc(c.shortName)}</li>
    </ol>

    <div class="ph-grid">
      <div>
        <p class="eyebrow" data-r>${esc(c.eyebrow)}</p>
        <h1 class="d1 mask" data-mask style="margin-top:22px">
          ${mask}
        </h1>
        <p class="lede" data-r>${esc(c.description)}</p>
        <div class="tags" data-r>
          ${tags}
        </div>
        <div class="ph-actions" data-r>
          <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
          <a href="/contact#brief" class="btn ghost"><span>Send a project brief</span><i>→</i></a>
        </div>
      </div>

      <dl class="ph-meta" data-s>
        <div><dt>Client</dt><dd>${esc(c.client)}</dd></div>
        <div><dt>Sector</dt><dd>${esc(c.sector)}</dd></div>
        <div><dt>Scope</dt><dd>${esc(c.scope)}</dd></div>
        <div><dt>Status</dt><dd>Shipped case narrative · metrics unpublished unless signed off</dd></div>
      </dl>
    </div>
  </div>
</header>

<div class="wrap" style="margin-top:clamp(34px,4vw,64px)">
  <figure class="shot shot--wide" data-shot>
    <div class="media"${c.heroAsset ? ` data-asset="${esc(c.heroAsset)}" data-asset-alt="${esc(c.shortName)} hero" data-asset-dims="2400×1029"` : ""}>
      <div class="slot" role="img" aria-label="${esc(c.heroSlot)}">
        <div class="skel"><i></i><i></i><i></i></div>
        <div class="tagline"><span>${esc(c.shortName)} · interface reference</span><span>21:9</span></div>
      </div>
      ${pins}
    </div>
  </figure>
  <figcaption class="shot-cap">Project story frame · screenshot drops into this host when supplied</figcaption>
</div>

<!-- Project context — not a fake metrics bar -->
<section class="mrail on-ink" aria-labelledby="mH" style="margin-top:clamp(44px,5vw,80px)">
  <div class="wrap">
    <h2 class="sr" id="mH">Project context</h2>
    <div class="mrail-grid">
      <div class="m"><b class="num" style="font-size:clamp(1.15rem,2.4vw,1.55rem);letter-spacing:-.02em;line-height:1.15">${esc(c.sector)}</b><span>Sector</span><em>Verified case label</em></div>
      <div class="m"><b class="num" style="font-size:clamp(1.15rem,2.4vw,1.55rem);letter-spacing:-.02em;line-height:1.15">${esc(c.scope)}</b><span>Scope</span><em>From published case source</em></div>
      <div class="m"><b class="num" style="font-size:clamp(1.15rem,2.4vw,1.55rem);letter-spacing:-.02em;line-height:1.15">${esc(c.tags.join(" · "))}</b><span>Capabilities</span><em>Linked below</em></div>
    </div>
    <p class="mrail-note">Client labels may be portfolio names. Signed-off numeric outcomes appear only on FleetFlow in this redesign.</p>
  </div>
</section>

<section class="sect" id="context" aria-labelledby="ctxH">
  <div class="wrap">
    <p class="eyebrow" data-r>Context</p>
    <h2 class="d2" id="ctxH" data-r style="margin-top:18px;max-width:22ch">${esc(c.contextH2)}</h2>

    <div style="margin-top:clamp(40px,4.5vw,72px)">
      <div class="narr" data-r>
        <div class="kicker"><span class="idx num">01</span><h3 class="d3">Problem</h3></div>
        <div>
          <p class="body">${esc(c.problem)}</p>
        </div>
      </div>

      <div class="narr" data-r>
        <div class="kicker"><span class="idx num">02</span><h3 class="d3">Research</h3></div>
        <div>
          <p class="body">${esc(c.research)}</p>
        </div>
      </div>

      <div class="narr" data-r>
        <div class="kicker"><span class="idx num">03</span><h3 class="d3">Challenges</h3></div>
        <div>
          <p class="body">${esc(c.challenges)}</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sect story" id="approach" aria-labelledby="appH">
  <div class="wrap">
    <p class="eyebrow" data-r>Approach</p>
    <h2 class="d2" id="appH" data-r style="margin-top:18px;max-width:22ch">${esc(c.approachH2)}</h2>
    <p class="body" data-r style="margin-top:18px">${esc(c.solution)}</p>

    <div class="story-grid">
      <div class="story-media">
        <div class="story-bar"><b id="storyName">${esc(c.beats[0].name)}</b><span id="storyMeta">01 / 03</span></div>
        <div class="story-frame">
          ${scenes}
        </div>
      </div>

      <div id="beats">
        ${beats}
      </div>
    </div>
  </div>
</section>

<section class="sect sect--tight" aria-labelledby="baH">
  <div class="wrap">
    <div class="s-head">
      <div>
        <p class="eyebrow" data-r>Before / after</p>
        <h2 class="d2" id="baH" data-r style="margin-top:18px;max-width:22ch">${esc(c.baH2 || "Before the rebuild. After the rebuild.")}</h2>
      </div>
    </div>

    <div class="ba-cols" style="margin-top:clamp(30px,3.5vw,50px)" data-r>
      <div><h4>Before</h4><p class="body-sm">${esc(c.beforeCopy)}</p></div>
      <div><h4>After</h4><p class="body-sm">${esc(c.afterCopy)}</p></div>
    </div>

    <div style="margin-top:clamp(24px,3vw,40px)" data-r>
      <div class="ba" id="ba">
        <div class="ba-layer before">
          <div class="slot" role="img" aria-label="Before state"><div class="skel"><i></i><i></i><i></i></div>
            <div class="tagline"><span>Before · ${esc(c.shortName)}</span><span>Compare</span></div></div>
          <span class="ba-label l">Before</span>
        </div>
        <div class="ba-layer after">
          <div class="slot" style="background:linear-gradient(160deg,#1B2028,#0E1216)" role="img" aria-label="After state">
            <div class="skel"><i style="background:#2A323B"></i><i style="background:#2A323B"></i><i style="background:#2A323B"></i></div>
            <div class="tagline"><span>After · ${esc(c.shortName)}</span><span>Compare</span></div></div>
          <span class="ba-label r">After</span>
        </div>
        <input class="ba-range" id="baRange" type="range" min="0" max="100" value="50" step="1"
               aria-label="Reveal before or after. Left shows before, right shows after.">
        <span class="ba-handle" aria-hidden="true"></span>
      </div>
      <p class="shot-cap">Interactive compare · real captures replace these frames when available</p>
    </div>
  </div>
</section>

<section class="sect story" id="build" aria-labelledby="bldH">
  <div class="wrap">
    <div class="narr" data-r style="align-items:start">
      <div class="kicker">
        <p class="eyebrow">Engineering</p>
        <h2 class="d2" id="bldH" style="margin-top:16px">${esc(c.buildH2)}</h2>
      </div>
      <div>
        <p class="body">${esc(c.dev)}</p>
        <p class="pullout">${esc(c.ui)}</p>

        <div class="spec">
          ${stackHtml(c.stack)}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sect" id="outcome" aria-labelledby="outH">
  <div class="wrap">
    <div class="narr" data-r>
      <div class="kicker"><p class="eyebrow">Outcome</p></div>
      <div>
        <h2 class="d2" id="outH" style="max-width:20ch">${esc(c.outcomeH2 || "What shipped.")}</h2>
        <p class="body" style="margin-top:20px">${esc(c.solution)}</p>
        <p class="body-sm" style="margin-top:16px">${esc(c.outcomeNote || "Measured outcome metrics are not published on this case until signed off.")}</p>
        ${slugNote}
        ${attrNote}
      </div>
    </div>
  </div>
</section>

${quote}

<section class="sect sect--tight" id="capabilities" aria-labelledby="relH">
  <div class="wrap">
    <p class="eyebrow" data-r>Where this work lives</p>
    <h2 class="d2" id="relH" data-r style="margin-top:18px">Related pages.</h2>
    <div class="rel" data-s>
      ${related}
    </div>
  </div>
</section>

</article>

<section class="nextp" aria-labelledby="npH">
  <a href="${esc(next.href)}" class="wrap">
    <div>
      <span class="k">Next case study</span>
      <h2 class="d2" id="npH">${next.titleHtml}</h2>
      <p class="body-sm" style="margin-top:18px">${esc(next.summary)}</p>
      <p class="mono" style="margin-top:18px;color:var(--steel)">Continue →</p>
    </div>
  </a>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Start a project</p>
    <h2 class="d2" id="ctaH" data-r>Building something in this space?</h2>
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

${CASE_SCRIPT}
</body>
</html>`;
}

function updateWorkIndex() {
  const file = path.join(ROOT, "kriva-work-index.html");
  let html = fs.readFileSync(file, "utf8");
  const linkFixes = [
    ['href="/work">HealthTrack — patient mobile app', 'href="/work/healthtrack-mobile">HealthTrack — patient mobile app'],
    ['href="/work">CRMPulse — sales dashboard', 'href="/work/crm-pulse-dashboard">CRMPulse — sales dashboard'],
    ['href="/work">SupportAI — ticket automation', 'href="/work/ai-support-automation">SupportAI — ticket automation'],
    ['href="/work">LocalServe — marketplace MVP', 'href="/work/marketplace-mvp">LocalServe — marketplace MVP'],
  ];
  for (const [a, b] of linkFixes) {
    if (html.includes(a)) html = html.replace(a, b);
  }
  fs.writeFileSync(file, html, "utf8");
  console.log("Updated work index case links");
}

function registerChrome() {
  const applyPath = path.join(ROOT, "apply_chrome.cjs");
  let src = fs.readFileSync(applyPath, "utf8");
  const entries = cases
    .map((c) => `  "${c.file}": "work",`)
    .join("\n");
  if (!src.includes("kriva-case-payroll-pro.html")) {
    src = src.replace(
      '  "kriva-case-fleetflow.html": "work",',
      `  "kriva-case-fleetflow.html": "work",\n${entries}`
    );
    fs.writeFileSync(applyPath, src, "utf8");
    console.log("Registered case pages in apply_chrome.cjs");
  }
  // Keep in-memory map in sync for this process
  for (const c of cases) PAGE_CURRENT[c.file] = "work";
}

function main() {
  registerChrome();
  for (const c of cases) {
    const html = buildCase(c);
    fs.writeFileSync(path.join(ROOT, c.file), html, "utf8");
    console.log("Wrote", c.file);
  }
  updateWorkIndex();
  for (const c of cases) {
    console.log(applyFile(c.file));
  }
  console.log(applyFile("kriva-work-index.html"));
}

main();
