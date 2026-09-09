#!/usr/bin/env node
/** Generate regional market landing pages + index. Run: node build_markets.cjs */
const fs = require("fs");
const path = require("path");
const { ORIGIN, CONTACT_EMAIL } = require("./shared/site");
const { markets, indexPath, indexFile, indexTitle, indexMeta } = require("./content/markets-data.cjs");
const { applyFile } = require("./apply_chrome.cjs");

const ROOT = __dirname;

const PAGE_CSS = `
.mkt-hero{padding:calc(72px + clamp(26px,4vw,58px)) 0 clamp(36px,4.5vw,64px)}
.mkt-grid{margin-top:clamp(32px,4vw,56px);display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule)}
.mkt-card{background:var(--white);padding:clamp(22px,2.8vw,36px);display:grid;gap:12px}
.mkt-card h3 a:hover{color:var(--blue)}
.mkt-card .go{font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue)}
.mkt-split{margin-top:clamp(48px,6vw,88px);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(28px,4vw,64px);align-items:start}
.mkt-list{margin:0;padding:0;list-style:none;display:grid;gap:12px}
.mkt-list li{padding-left:16px;position:relative;font-size:15px;line-height:1.55;color:var(--steel)}
.mkt-list li:before{content:"";position:absolute;left:0;top:.55em;width:6px;height:6px;background:var(--amber)}
.mkt-proof{margin-top:clamp(36px,4vw,56px);display:flex;flex-wrap:wrap;gap:12px}
.mkt-proof a{font-family:var(--f-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:10px 14px;border:1px solid var(--rule);background:var(--paper-2)}
.mkt-proof a:hover{border-color:var(--ink);color:var(--blue)}
.mkt-switch{margin-top:clamp(40px,5vw,72px);padding-top:clamp(28px,3vw,44px);border-top:1px solid var(--rule)}
.mkt-switch-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:18px}
.mkt-switch a{display:block;padding:14px 16px;border:1px solid var(--rule);font-family:var(--f-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase}
.mkt-switch a[aria-current="page"]{border-color:var(--ink);background:var(--paper-2)}
.mkt-index-grid{margin-top:clamp(32px,4vw,56px);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule)}
.mkt-index-card{background:var(--white);padding:clamp(24px,3vw,40px);text-decoration:none;color:inherit}
.mkt-index-card:hover{background:var(--paper-2)}
.mkt-index-card .k{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel);margin-bottom:10px}
@media(max-width:900px){.mkt-split{grid-template-columns:1fr}.mkt-switch-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.mkt-index-grid,.mkt-switch-grid{grid-template-columns:1fr}}
`;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function headBlock({ title, meta, canonical, ogLocale }) {
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
<link rel="stylesheet" href="/shared/chrome.css?v=layout1240v2">
<style>${PAGE_CSS}</style>
</head>
<body class="page-market">`;
}

function animScript() {
  return `<script>
(function(){
'use strict';
const io=new IntersectionObserver(es=>{
  for(const e of es){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }
},{threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('[data-r],[data-s]').forEach(el=>io.observe(el));
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
    <div class="mkt-split">
      <div data-r>
        <p class="eyebrow">How we deliver</p>
        <h3 class="d3" style="margin-top:14px">Remote-first from Ahmedabad.</h3>
        <p class="body-sm" style="margin-top:12px">In-house design and engineering — no opaque subcontracting. Weekly demos on a live URL until you sign off.</p>
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
    <p class="lede" data-r">A 20-minute fit call or a written brief — reply within one business day.</p>
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

function indexBody() {
  const cards = markets
    .map(
      (m) => `<a class="mkt-index-card" href="${m.path}" data-s>
          <p class="k">${esc(m.eyebrow)}</p>
          <h2 class="d3">${esc(m.h1.replace(/\.$/, ""))}</h2>
          <p class="body-sm" style="margin-top:10px">${esc(m.lede.slice(0, 140))}…</p>
          <span class="go" style="display:inline-block;margin-top:14px">Explore ${esc(m.country)} <i>→</i></span>
        </a>`
    )
    .join("\n        ");

  return `${headBlock({
    title: indexTitle,
    meta: indexMeta,
    canonical: ORIGIN + indexPath,
    ogLocale: "en_US",
  })}
<a class="skip" href="#main">Skip to content</a>
<!--KRIVA_CHROME-->
<main id="main">
<header class="hero hero--inner mkt-hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Markets</li>
    </ol>
    <p class="eyebrow" data-r style="margin-top:22px">Global delivery</p>
    <h1 class="d1" data-r style="margin-top:18px">Built for operators in four markets.</h1>
    <p class="lede" data-r style="margin-top:22px">KRIVA is a remote-first studio in Ahmedabad serving the United States, United Kingdom, United Arab Emirates, and Canada — with market-specific language, case studies, and delivery overlap.</p>
  </div>
</header>
<section class="sect" aria-labelledby="marketsH">
  <div class="wrap">
    <p class="eyebrow" data-r>Regional pages</p>
    <h2 class="d2" id="marketsH" data-r>Enter through your market.</h2>
    <div class="mkt-index-grid">${cards}</div>
  </div>
</section>
<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Not sure where to start?</p>
    <h2 class="d2" id="ctaH" data-r>Book a fit call.</h2>
    <div class="cta-row">
      <div style="display:flex;gap:12px;flex-wrap:wrap" data-r>
        <a href="/contact#book" class="btn on-dark"><span>Book a discovery call</span><i>→</i></a>
        <a href="/solutions" class="btn ghost on-dark"><span>Browse solutions</span><i>→</i></a>
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
