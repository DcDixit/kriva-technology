#!/usr/bin/env node
/** Generate regional market landing pages + index. Run: node build_markets.cjs */
const fs = require("fs");
const path = require("path");
const { ORIGIN } = require("./shared/site");
const {
  markets,
  indexPath,
  indexFile,
  indexTitle,
  indexMeta,
  indexEyebrow,
  indexH1,
  indexLede,
} = require("./content/markets-data.cjs");
const { applyFile } = require("./apply_chrome.cjs");

const ROOT = __dirname;

const VISUALS = {
  heroDispatch: `<div class="pu" role="img" aria-label="ShiftRail dispatch console: three loads selected, SLA remaining, bulk reassign.">
            <div class="pu-bar">
              <div>
                <p class="pu-title">ShiftRail</p>
                <p class="pu-meta">Dispatch · 3 selected</p>
              </div>
              <span class="pu-act">Reassign</span>
            </div>
            <div class="pu-kpis">
              <div><span>Active</span><b>128</b></div>
              <div class="up"><span>On time</span><b>94%</b></div>
              <div class="risk"><span>At risk</span><b>3</b></div>
            </div>
            <ul class="pu-rows">
              <li class="on"><b>#4822</b><span>ATL &rarr; CLT</span><em>9m</em></li>
              <li><b>#4821</b><span>DAL &rarr; PHX</span><em>42m</em></li>
              <li class="risk"><b>#4823</b><span>CHI &rarr; DET</span><em>6m SLA</em></li>
            </ul>
          </div>`,
  heroSaas: `<div class="pu" role="img" aria-label="First sitting after SSO: test cycle now, roles later.">
            <div class="pu-bar">
              <div>
                <p class="pu-title">First sitting</p>
                <p class="pu-meta">After SSO</p>
              </div>
              <span class="pu-chip warn">Roles later</span>
            </div>
            <ol class="pu-steps" style="padding:14px 16px 16px">
              <li class="done"><i></i><span>SSO</span><em>Done</em></li>
              <li class="done"><i></i><span>Link bank</span><em>Done</em></li>
              <li class="now"><i></i><span>Run test cycle</span><em>Now</em></li>
              <li class="later"><i></i><span>Invite roles</span><em>After value</em></li>
            </ol>
          </div>`,
  dispatch: `<div class="pu" role="img" aria-label="Dispatch SLA board: three loads with remaining time.">
          <div class="pu-bar">
            <div>
              <p class="pu-title">Dispatch</p>
              <p class="pu-meta">SLA remaining</p>
            </div>
            <span class="pu-act">Reassign</span>
          </div>
          <ul class="pu-rows">
            <li class="on"><b>#4822</b><span>ATL &rarr; CLT</span><em>9m</em></li>
            <li><b>#4821</b><span>DAL &rarr; PHX</span><em>42m</em></li>
            <li class="risk"><b>#4823</b><span>CHI &rarr; DET</span><em>6m SLA</em></li>
          </ul>
        </div>`,
  saas: `<div class="pu" role="img" aria-label="Empty home after signup: import records so the first sitting has work.">
          <div class="pu-bar">
            <div>
              <p class="pu-title">Home</p>
              <p class="pu-meta">Northwind Ltd · empty</p>
            </div>
            <span class="pu-chip warn">No scan yet</span>
          </div>
          <p class="pu-q">Nothing to scan yet.</p>
          <div class="pu-draft"><span>Path</span>Import a CSV so the first sitting has an exception to act on.</div>
          <span class="pu-cta">Import CSV</span>
        </div>`,
  logistics: `<div class="pu" role="img" aria-label="Auto-transport quote: VIN, Dallas to Phoenix, enclosed, Book move.">
          <div class="pu-bar">
            <div>
              <p class="pu-title">Quote</p>
              <p class="pu-meta">VIN · origin · delivery</p>
            </div>
            <span class="pu-chip cta">Open</span>
          </div>
          <p class="pu-k">1C4HJXDG · 2022 Wrangler</p>
          <p class="pu-q">Dallas &rarr; Phoenix</p>
          <ul class="pu-rows">
            <li><b>Pickup</b><span>Gate 14 · 06:40</span><em>Enclosed</em></li>
            <li class="on"><b>In transit</b><span>I-10 west</span><em>ETA 2d</em></li>
            <li><b>Deliver</b><span>Scottsdale</span><em>Pending</em></li>
          </ul>
          <span class="pu-cta">Book move</span>
        </div>`,
  finance: `<div class="pu" role="img" aria-label="March close: unmatched invoice against QuickBooks and bank, Resolve.">
          <div class="pu-bar">
            <div>
              <p class="pu-title">March close</p>
              <p class="pu-meta">QuickBooks · Xero · bank</p>
            </div>
            <span class="pu-chip warn">4 unmatched</span>
          </div>
          <ul class="pu-rows">
            <li class="risk"><b>INV-2041</b><span>QB &rarr; Bank</span><em>&minus;&pound;420</em></li>
            <li><b>INV-2048</b><span>Xero &rarr; Bank</span><em>Match</em></li>
            <li><b>INV-2052</b><span>QB &rarr; Xero</span><em>Retry</em></li>
          </ul>
          <span class="pu-cta lime">Resolve</span>
        </div>`,
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function headBlock({ title, meta, canonical, ogLocale, hub = false }) {
  const extraCss = hub
    ? `<link rel="stylesheet" href="/shared/system.css">
<link rel="stylesheet" href="/shared/responsive.css?v=hero6">
<link rel="stylesheet" href="/shared/markets.css?v=mkt1">`
    : `<link rel="stylesheet" href="/shared/markets.css?v=mkt1">`;
  const bodyClass = hub ? "page-markets" : "page-market";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<script>document.documentElement.classList.add('js')</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0E1216">
<link rel="stylesheet" href="/shared/tokens.css?v=layout1240v2">
<link rel="preload" href="/brand/fonts/bricolage-grotesque-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="KRIVA Technologies">
<meta property="og:locale" content="${ogLocale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(meta)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(meta)}">
<link rel="stylesheet" href="/shared/inner.css?v=pu3">
${extraCss}
</head>
<body class="${bodyClass}">`;
}

function animScript(mask = false) {
  const maskJs = mask
    ? `
document.querySelectorAll('[data-mask]').forEach(el=>{
  const io2=new IntersectionObserver(es=>{
    for(const e of es){ if(e.isIntersecting){ e.target.classList.add('in'); io2.unobserve(e.target); } }
  },{threshold:.2});
  io2.observe(el);
});`
    : "";
  return `<script>
(function(){
'use strict';
const io=new IntersectionObserver(es=>{
  for(const e of es){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }
},{threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('[data-r],[data-s]').forEach(el=>io.observe(el));${maskJs}
})();
</script>`;
}

function marketSwitch(currentSlug) {
  const links = markets
    .map(
      (m) =>
        `<a href="${m.path}"${m.slug === currentSlug ? ' aria-current="page"' : ""}>${esc(m.country)}</a>`
    )
    .join("\n        ");
  return `<nav class="mkt-switch" aria-label="Other markets" data-r>
      <p class="eyebrow">Markets we serve</p>
      <div class="mkt-switch-grid">${links}</div>
    </nav>`;
}

function marketBody(m) {
  const cards = m.focus
    .map(
      (f) => `<article class="mkt-card" data-s>
          <h3 class="d3"><a href="${f.href}">${esc(f.title)}</a></h3>
          <p class="body-sm">${esc(f.body)}</p>
          <a class="go" href="${f.href}">${esc(f.label)} <i>→</i></a>
        </article>`
    )
    .join("\n        ");
  const delivery = m.delivery.map((d) => `<li>${esc(d)}</li>`).join("\n            ");

  return `${headBlock({
    title: m.title,
    meta: m.meta,
    canonical: ORIGIN + m.path,
    ogLocale: m.ogLocale,
  })}
<a class="skip" href="#main">Skip to content</a>
<!--KRIVA_CHROME-->
<main id="main">
<header class="hero hero--inner mkt-hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="${indexPath}">Markets</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">${esc(m.country)}</li>
    </ol>
    <p class="eyebrow" data-r style="margin-top:22px">${esc(m.eyebrow)}</p>
    <h1 class="d1" data-r style="margin-top:18px">${esc(m.h1)}</h1>
    <p class="lede" data-r style="margin-top:22px">${esc(m.lede)}</p>
    <div class="mkt-proof" data-r>
      <a href="${m.proof.case.href}">Case · ${esc(m.proof.case.label)}</a>
      <a href="${m.proof.guide.href}">Guide · ${esc(m.proof.guide.label)}</a>
      <a href="/contact#book">Book a fit call</a>
    </div>
  </div>
</header>
<section class="sect" aria-labelledby="focusH">
  <div class="wrap">
    <p class="eyebrow" data-r>What we build</p>
    <h2 class="d2" id="focusH" data-r>Capabilities for ${esc(m.country)} teams.</h2>
    <div class="mkt-grid">${cards}</div>
    <div class="mkt-split-detail">
      <div data-r>
        <p class="eyebrow">How we deliver</p>
        <h3 class="d3" style="margin-top:14px">Remote-first from Ahmedabad.</h3>
        <p class="body-sm" style="margin-top:12px">In-house design and engineering — no opaque subcontracting. Weekly demos on a live URL until you sign off. <a href="/about">About the studio</a> · <a href="/process">How we work</a></p>
      </div>
      <ul class="mkt-list" data-r>${delivery}</ul>
    </div>
    ${marketSwitch(m.slug)}
  </div>
</section>
<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Start a project</p>
    <h2 class="d2" id="ctaH" data-r>Talk to the team.</h2>
    <p class="lede" data-r>A 20-minute fit call or a written brief — reply within one business day.</p>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Book a discovery call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
      </div>
    </div>
  </div>
</section>
</main>
<!--KRIVA_FOOTER-->
${animScript()}
</body>
</html>`;
}

function marketRow(m, i) {
  const c = m.card;
  const flip = i % 2 === 1 ? " flip" : "";
  const quiet = c.visual === "finance" ? " quiet" : "";
  const tags = c.tags.map((t) => `<span class="mkt-tag">${esc(t)}</span>`).join("\n          ");
  const visual = VISUALS[c.visual] || VISUALS.dispatch;
  const primary = m.focus[0];

  return `<article class="mkt-row${flip}${quiet}" data-r>
      <div class="mkt-shot">${visual}</div>
      <div>
        <p class="k">${esc(c.kicker)}</p>
        <h3 class="d3"><a href="${m.path}">${esc(c.headline)}</a></h3>
        <p class="body-sm">${esc(c.summary)}</p>
        <div class="mkt-tags">${tags}</div>
        <p class="mkt-outcome"><strong>Outcome:</strong> ${esc(c.outcome)}</p>
        <div class="mkt-links">
          <a class="proof" href="${m.proof.case.href}">Case · ${esc(m.proof.case.label)} <i>→</i></a>
          <a class="go" href="${m.path}">Explore ${esc(m.country)} <i>→</i></a>
          <a class="go" href="${primary.href}">${esc(primary.label)} <i>→</i></a>
        </div>
      </div>
    </article>`;
}

function indexBody() {
  const rows = markets.map((m, i) => marketRow(m, i)).join("\n    ");

  return `${headBlock({
    title: indexTitle,
    meta: indexMeta,
    canonical: ORIGIN + indexPath,
    ogLocale: "en_US",
    hub: true,
  })}
<a class="skip" href="#main">Skip to content</a>
<div class="progress" id="progress" aria-hidden="true"></div>
<!--KRIVA_CHROME-->
<main id="main">

<header class="hero" id="overview" aria-labelledby="h1">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Markets</li>
    </ol>
    <div class="mkt-hero-grid">
      <div class="mkt-hero-copy">
        <p class="eyebrow" data-r>${esc(indexEyebrow)}</p>
        <h1 class="d1 mask" id="h1" data-mask>
          <span><i>Built for operators</i></span>
          <span><i>in four markets.</i></span>
        </h1>
        <p class="lede" data-r>${esc(indexLede)}</p>
        <div class="hero-actions" data-r>
          <a href="#markets" class="btn"><span>Find your market</span><i>→</i></a>
          <a href="/contact#book" class="btn ghost"><span>Request a fit call</span><i>→</i></a>
        </div>
        <p class="mkt-trust" data-r>
          <span>Four markets</span>
          <span>In-house team</span>
          <span>Weekly demos</span>
        </p>
      </div>
      <div class="mkt-split" data-r>
        <a class="mkt-desk" href="/markets/us">
          ${VISUALS.heroDispatch}
          <span class="cap"><span class="k">US market</span><b>Trucking &amp; SaaS</b></span>
        </a>
        <a class="mkt-desk paper" href="/markets/uk">
          ${VISUALS.heroSaas}
          <span class="cap"><span class="k">UK market</span><b>SaaS &amp; Xero</b></span>
        </a>
      </div>
    </div>
  </div>
</header>

<section class="mkt-rows" id="markets" aria-labelledby="marketsH">
  <div class="wrap mkt-intro">
    <p class="eyebrow" data-r>Regional delivery</p>
    <h2 class="d2" id="marketsH" data-r>Choose your market.</h2>
    <p class="lede" data-r>Each page covers who we work with, what we build, timezone overlap, and proof from that region — then links into the matching <a href="/solutions">solution</a> and <a href="/work">work</a>.</p>
  </div>
  <div class="wrap">
    ${rows}
  </div>
</section>

<section class="sect mkt-cross" aria-labelledby="crossH">
  <div class="wrap mkt-cross-grid">
    <div data-r>
      <p class="eyebrow">Markets vs industries</p>
      <h2 class="d2" id="crossH">Region or desk — start where you are.</h2>
      <p class="lede">Use <strong>Markets</strong> when timezone, finance norms, or regional language matter. Use <a href="/industries">Industries</a> when you want to enter by trucking, SaaS, finance, or CRM desk — regardless of country.</p>
      <p class="body-sm" style="margin-top:14px">KRIVA is an in-house product studio in Ahmedabad. We design and build custom software — not a generic agency roster. <a href="/about">About KRIVA</a></p>
    </div>
    <nav class="mkt-next" aria-label="Related paths" data-r>
      <a href="/industries"><b>Industries we serve</b><span>By desk</span></a>
      <a href="/solutions"><b>All solutions</b><span>Trucking · SaaS · Finance</span></a>
      <a href="/services/product-design"><b>Product design &amp; UX</b><span>Research to launch</span></a>
      <a href="/work"><b>Work &amp; case studies</b><span>Proof by project</span></a>
    </nav>
  </div>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Not sure where to start?</p>
    <h2 class="d2" id="ctaH" data-r>Book a fit call.</h2>
    <p class="lede" data-r>A 20-minute discovery call or written brief — we reply within one business day.</p>
    <div class="cta-row">
      <div class="cta-actions" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Book a discovery call</span><i>→</i></a>
        <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
      </div>
      <p class="assur" data-r><i>·</i> US · UK · UAE · Canada <i>·</i> NDA-first <i>·</i> You own the IP</p>
    </div>
  </div>
</section>
</main>
<!--KRIVA_FOOTER-->
${animScript(true)}
</body>
</html>`;
}

function main() {
  for (const m of markets) {
    const out = path.join(ROOT, m.file);
    fs.writeFileSync(out, marketBody(m));
    console.log("Wrote " + m.file);
  }
  fs.writeFileSync(path.join(ROOT, indexFile), indexBody());
  console.log("Wrote " + indexFile);

  const chromeFiles = [indexFile, ...markets.map((m) => m.file)];
  for (const f of chromeFiles) {
    console.log(applyFile(f));
  }
}

main();
