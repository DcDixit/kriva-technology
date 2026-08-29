const fs = require("fs");
const path = require("path");

const TOKENS = `/* Shared KRIVA tokens + primitives */
:root{
  --paper:#EAEAE4; --paper-2:#F1F1EC; --white:#FFFFFF;
  --ink:#0E1216; --ink-2:#161C22; --ink-line:#232B33; --ink-dim:#8C98A4;
  --steel:#5C6670; --steel-2:#7A838D; --rule:#D2D2C9; --rule-soft:#DFDFD8;
  --blue:#1B44C8; --amber:#DB9B1F; --green:#1B7A54; --violet:#5B44C8;
  --lime:#5FD3A0; --lilac:#B7A9FF;
  --f-display:'Archivo',system-ui,sans-serif;
  --f-body:'Inter',system-ui,sans-serif;
  --f-mono:'IBM Plex Mono',ui-monospace,monospace;
  --gutter:clamp(20px,5vw,80px); --maxw:1440px;
  --e:cubic-bezier(.16,.84,.44,1); --e-io:cubic-bezier(.62,.02,.28,1);
  --t-fast:.32s; --t-mid:.62s; --t-slow:1s;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
html:focus-within{scroll-behavior:smooth}
body{background:var(--paper);color:var(--ink);font-family:var(--f-body);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
img{max-width:100%;display:block}
::selection{background:var(--blue);color:#fff}
:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
.on-ink :focus-visible,footer :focus-visible,.cta-band :focus-visible{outline-color:var(--lilac)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:absolute;left:-999px;top:8px;z-index:200;background:var(--ink);color:#fff;padding:10px 16px;font-family:var(--f-mono);font-size:12px}
.skip:focus{left:12px}
.wrap{max-width:var(--maxw);margin-inline:auto;padding-inline:var(--gutter)}
.eyebrow{font-family:var(--f-mono);font-size:clamp(10px,1.1vw,11.5px);letter-spacing:.16em;text-transform:uppercase;color:var(--steel);display:flex;align-items:center;gap:11px;line-height:1}
.eyebrow::before{content:"";width:20px;height:1px;background:currentColor;flex:none;opacity:.6}
.d1{font-family:var(--f-display);font-weight:900;font-size:clamp(2.35rem,5.4vw,4.7rem);line-height:.94;letter-spacing:-.032em;font-variation-settings:'wdth' 100}
.d2{font-family:var(--f-display);font-weight:750;font-size:clamp(1.85rem,3.8vw,3.15rem);line-height:1.04;letter-spacing:-.032em;font-variation-settings:'wdth' 94}
.d3{font-family:var(--f-display);font-weight:700;font-size:clamp(1.25rem,1.95vw,1.62rem);line-height:1.18;letter-spacing:-.022em}
.lede{font-size:clamp(1.02rem,1.28vw,1.24rem);line-height:1.62;color:var(--steel);max-width:58ch}
.body{font-size:16.5px;line-height:1.66;color:var(--steel);max-width:62ch}
.body-sm{font-size:14.8px;line-height:1.62;color:var(--steel);max-width:58ch}
.mono{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.09em;text-transform:uppercase}
.num{font-variant-numeric:tabular-nums}
[data-r]{opacity:0;transform:translate3d(0,24px,0);transition:opacity var(--t-slow) var(--e),transform var(--t-slow) var(--e)}
[data-r].in{opacity:1;transform:none}
[data-s]>*{opacity:0;transform:translate3d(0,20px,0);transition:opacity var(--t-mid) var(--e),transform var(--t-mid) var(--e)}
[data-s].in>*{opacity:1;transform:none}
[data-s].in>*:nth-child(1){transition-delay:0ms}[data-s].in>*:nth-child(2){transition-delay:60ms}
[data-s].in>*:nth-child(3){transition-delay:120ms}[data-s].in>*:nth-child(4){transition-delay:180ms}
[data-s].in>*:nth-child(5){transition-delay:240ms}[data-s].in>*:nth-child(6){transition-delay:300ms}
.mask span{display:block;overflow:hidden;padding-bottom:.02em}
.mask span i{display:block;font-style:normal;transform:translate3d(0,110%,0);transition:transform 1.05s var(--e)}
.mask.in span i{transform:none}
.mask.in span:nth-child(2) i{transition-delay:80ms}
.btn{--btn-fg:var(--paper);--btn-bg:var(--ink);--btn-hover:var(--blue);
  position:relative;display:inline-flex;align-items:center;gap:10px;overflow:hidden;
  padding:12px 20px;border:1px solid var(--ink);background:var(--btn-bg);color:var(--btn-fg);
  font-family:var(--f-mono);font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;
  transition:color var(--t-fast) var(--e),border-color var(--t-fast) var(--e)}
.btn>*{position:relative;z-index:1}
.btn::before{content:"";position:absolute;inset:0;background:var(--btn-hover);transform:translate3d(0,101%,0);transition:transform .5s var(--e)}
.btn:hover::before,.btn:focus-visible::before{transform:none}
.btn:hover{color:#fff;border-color:var(--btn-hover)}
.btn i{font-style:normal;transition:transform .42s var(--e)}
.btn:hover i{transform:translateX(5px)}
.btn.ghost{--btn-bg:transparent;--btn-fg:var(--ink)}
.btn.sm{padding:9px 15px;font-size:11px}
.btn.on-dark{--btn-bg:#EDEFF1;--btn-fg:var(--ink);--btn-hover:var(--lilac);border-color:#EDEFF1}
.btn.on-dark:hover{color:var(--ink);border-color:var(--lilac)}
.btn.ghost.on-dark{--btn-bg:transparent;--btn-fg:#DDE2E7;border-color:#3A444E}
.p-link{display:inline-flex;align-items:center;gap:9px;margin-top:18px;padding-bottom:4px;font-family:var(--f-mono);font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid currentColor}
.p-link i{font-style:normal;transition:transform .42s var(--e)}
.p-link:hover i{transform:translateX(6px)}
.flag{border:1px solid var(--rule);padding:2px 7px;font-family:var(--f-mono);font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--steel);flex:none}
.flag.tbd{border-color:var(--amber);color:#8A6200}
.crumbs{display:flex;gap:9px;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel);list-style:none;flex-wrap:wrap}
.crumbs a:hover{color:var(--ink)}
.crumbs li[aria-current]{color:var(--ink)}
.hero{padding:calc(72px + clamp(26px,4vw,58px)) 0 clamp(36px,4.5vw,64px)}
.hero h1{margin:20px 0 22px}
.hero-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:28px}
.sect{padding-block:clamp(64px,8vw,128px)}
.sect--tight{padding-block:clamp(48px,6vw,88px)}
.cta-band{background:var(--ink);color:#DDE2E7;overflow:hidden}
.cta-band .wrap{padding-block:clamp(72px,9vw,140px)}
.cta-band .eyebrow{color:var(--ink-dim)}
.cta-band h2{color:#fff;margin-top:22px;max-width:14ch}
.cta-row{display:flex;justify-content:space-between;align-items:flex-end;gap:36px;flex-wrap:wrap;margin-top:clamp(32px,4vw,52px)}
.assur{display:flex;gap:22px;flex-wrap:wrap;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-dim)}
.assur i{font-style:normal;color:var(--amber);margin-right:7px}
@media (prefers-reduced-motion:reduce){
  html:focus-within{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important;transition-delay:0ms!important}
  [data-r],[data-s]>*{opacity:1!important;transform:none!important}
  .mask span i{transform:none!important}
}`;

const SCRIPT = `<script src="/shared/chrome.js" defer></script>
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

function shell({ title, description, canonical, ogTitle, pageCss, body, extraScript = "" }) {
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
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/shared/chrome.css">
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

${SCRIPT}
${extraScript}
</body>
</html>`;
}

/* ═══════════════ SOLUTIONS ═══════════════ */
const solutionsCss = `
.hero-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(24px,4vw,64px);align-items:end;margin-top:clamp(22px,3vw,40px)}
.hero-aside{border-top:1px solid var(--rule)}
.hero-aside div{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--rule);font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;color:var(--steel)}
.hero-aside b{color:var(--ink);font-family:var(--f-display);font-weight:800;font-size:1.15rem;letter-spacing:-.02em}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr}}
.markets{background:var(--paper-2);border-block:1px solid var(--rule)}
.sol-list{margin-top:clamp(36px,4vw,64px);border-top:1px solid var(--rule)}
.sol-row{display:grid;grid-template-columns:72px minmax(0,1.15fr) minmax(0,1.1fr) auto;gap:clamp(16px,2.5vw,36px);align-items:start;padding:clamp(26px,3vw,42px) 0;border-bottom:1px solid var(--rule);text-decoration:none;color:inherit;transition:background .4s var(--e)}
.sol-row:hover{background:var(--white)}
.sol-no{font-family:var(--f-display);font-weight:800;font-size:clamp(1.5rem,3vw,2.3rem);letter-spacing:-.04em;color:var(--rule);line-height:1;transition:color .4s}
.sol-row:hover .sol-no{color:var(--ink)}
.sol-kicker{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel);margin-bottom:10px}
.sol-title{font-family:var(--f-display);font-weight:750;font-size:clamp(1.35rem,2.4vw,2rem);line-height:1.08;letter-spacing:-.03em;max-width:16ch}
.sol-sum{font-size:15px;line-height:1.62;color:var(--steel);max-width:46ch}
.caps{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px}
.cap{font-family:var(--f-mono);font-size:10px;letter-spacing:.09em;text-transform:uppercase;padding:4px 9px;border:1px solid var(--rule-soft);color:var(--steel)}
.sol-go{font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;display:inline-flex;align-items:center;gap:8px;margin-top:8px;white-space:nowrap}
.sol-go i{font-style:normal;transition:transform .4s var(--e)}
.sol-row:hover .sol-go i{transform:translateX(5px)}
@media(max-width:900px){
  .sol-row{grid-template-columns:48px 1fr;gap:10px 16px}
  .sol-sum-wrap{grid-column:1/-1}
  .sol-go{grid-column:2}
}
.proof{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:clamp(32px,4vw,56px)}
.proof a{background:var(--white);padding:clamp(22px,2.5vw,32px);display:grid;gap:10px;transition:background .35s}
.proof a:hover{background:var(--paper-2)}
.proof .k{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--steel)}
.proof b{font-family:var(--f-display);font-weight:750;font-size:1.25rem;letter-spacing:-.02em}
.proof p{font-size:14px;line-height:1.55;color:var(--steel)}
@media(max-width:800px){.proof{grid-template-columns:1fr}}
.help{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:clamp(24px,4vw,64px);align-items:start}
@media(max-width:860px){.help{grid-template-columns:1fr}}
`;

const solutionsBody = `
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Solutions</li>
    </ol>
    <div class="hero-grid">
      <div>
        <p class="eyebrow" data-r>By market</p>
        <h1 class="d1 mask" data-mask id="h1"><span><i>Clear paths for</i></span><span><i>the work we ship.</i></span></h1>
        <p class="lede" data-r>Four solution areas with dedicated capabilities, process, and illustrative work. Same in-house team from discovery through launch.</p>
        <div class="hero-actions" data-r>
          <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
          <a href="/contact#brief" class="btn ghost"><span>Send a project brief</span><i>→</i></a>
        </div>
      </div>
      <aside class="hero-aside" data-r aria-label="Solution areas">
        <div><span>01</span><b>Trucking &amp; logistics</b></div>
        <div><span>02</span><b>SaaS products</b></div>
        <div><span>03</span><b>Accounting integrations</b></div>
        <div><span>04</span><b>Car transportation</b></div>
      </aside>
    </div>
  </div>
</header>

<section class="sect markets" aria-labelledby="solH">
  <div class="wrap">
    <p class="eyebrow" data-r>Pick the path that matches how you operate</p>
    <h2 class="d2" id="solH" data-r style="margin-top:18px;max-width:22ch">Each page covers capabilities, delivery, related work, and FAQs.</h2>
    <div class="sol-list">
      <a class="sol-row" href="/solutions/trucking-logistics" data-r>
        <span class="sol-no num">01</span>
        <div>
          <p class="sol-kicker">Trucking &amp; logistics</p>
          <h3 class="sol-title">Trucking &amp; Logistics Solutions</h3>
        </div>
        <div class="sol-sum-wrap">
          <p class="sol-sum">Dispatch boards, fleet dashboards, driver apps, and load management tools: built for how trucking ops teams actually work.</p>
          <div class="caps"><span class="cap">Custom TMS &amp; dispatch CRM</span><span class="cap">Fleet dashboards</span><span class="cap">Driver mobile apps</span></div>
        </div>
        <span class="sol-go">Explore <i>→</i></span>
      </a>
      <a class="sol-row" href="/solutions/saas" data-r>
        <span class="sol-no num">02</span>
        <div>
          <p class="sol-kicker">UK &amp; US SaaS</p>
          <h3 class="sol-title">SaaS Product Solutions</h3>
        </div>
        <div class="sol-sum-wrap">
          <p class="sol-sum">SaaS teams hire us when the product works but users aren't sticking. We fix onboarding, permissions, dashboards, and the patterns that turn trials into paying accounts.</p>
          <div class="caps"><span class="cap">SaaS UI/UX &amp; onboarding</span><span class="cap">Dashboard design</span><span class="cap">MVP build</span></div>
        </div>
        <span class="sol-go">Explore <i>→</i></span>
      </a>
      <a class="sol-row" href="/solutions/accounting-integrations" data-r>
        <span class="sol-no num">03</span>
        <div>
          <p class="sol-kicker">Finance &amp; operations</p>
          <h3 class="sol-title">QuickBooks &amp; Xero Integrations</h3>
        </div>
        <div class="sol-sum-wrap">
          <p class="sol-sum">Reliable sync between your platform and QuickBooks or Xero. Reconciliation dashboards, exception handling, and a month-end close that doesn't require a fire drill.</p>
          <div class="caps"><span class="cap">QuickBooks API</span><span class="cap">Xero sync</span><span class="cap">Exception dashboards</span></div>
        </div>
        <span class="sol-go">Explore <i>→</i></span>
      </a>
      <a class="sol-row" href="/solutions/car-transportation" data-r>
        <span class="sol-no num">04</span>
        <div>
          <p class="sol-kicker">Auto transport</p>
          <h3 class="sol-title">Car Transportation</h3>
        </div>
        <div class="sol-sum-wrap">
          <p class="sol-sum">Quote calculators, shipment tracking, and operations tools for auto transport companies: designed around the workflow dispatch and sales already follow.</p>
          <div class="caps"><span class="cap">Booking portals</span><span class="cap">Carrier dispatch</span><span class="cap">Customer tracking</span></div>
        </div>
        <span class="sol-go">Explore <i>→</i></span>
      </a>
    </div>
  </div>
</section>

<section class="sect sect--tight" aria-labelledby="proofH">
  <div class="wrap">
    <p class="eyebrow" data-r>Related proof</p>
    <h2 class="d2" id="proofH" data-r style="margin-top:16px;max-width:18ch">Work that maps to these markets.</h2>
    <div class="proof" data-s>
      <a href="/work/fleetflow-dispatch"><span class="k">Trucking</span><b>FleetFlow</b><p>US trucking dispatch CRM with bulk actions and SLA intelligence.</p></a>
      <a href="/work/payroll-pro-saas"><span class="k">SaaS</span><b>PayrollPro</b><p>B2B SaaS onboarding and permission clarity after SSO rollout.</p></a>
      <a href="/work/finance-sync-hub"><span class="k">Integrations</span><b>FinanceSync</b><p>QuickBooks &amp; Xero reconciliation workflows for finance ops.</p></a>
    </div>
    <p class="body-sm" data-r style="margin-top:18px"><span class="flag tbd">TBD</span> Car transportation case study not yet published: link stays on the solution page until one ships.</p>
    <a href="/work" class="p-link" data-r>View all work <i>→</i></a>
  </div>
</section>

<section class="sect" style="border-top:1px solid var(--rule)" aria-labelledby="helpH">
  <div class="wrap help">
    <div>
      <p class="eyebrow" data-r>Not sure which fits?</p>
      <h2 class="d2" id="helpH" data-r style="margin-top:16px">Tell us about your product and market.</h2>
    </div>
    <div data-r>
      <p class="body">We'll suggest a starting point: SaaS MVP, dispatch CRM, accounting integration, or car transport software, and what a sensible first engagement looks like.</p>
      <div class="hero-actions">
        <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
        <a href="/services" class="btn ghost"><span>Browse services</span><i>→</i></a>
      </div>
    </div>
  </div>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Next step</p>
    <h2 class="d2" id="ctaH" data-r>Ready to pick a path?</h2>
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

/* ═══════════════ ABOUT ═══════════════ */
const aboutCss = `
.hero-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);gap:clamp(24px,4vw,64px);align-items:end;margin-top:clamp(22px,3vw,40px)}
.stat-rail{display:grid;gap:0;border-top:1px solid var(--rule)}
.stat-rail div{padding:16px 0;border-bottom:1px solid var(--rule)}
.stat-rail b{display:block;font-family:var(--f-display);font-weight:800;font-size:clamp(1.6rem,3vw,2.2rem);letter-spacing:-.03em;line-height:1}
.stat-rail span{display:block;margin-top:8px;font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--steel)}
.stat-rail em{display:block;margin-top:6px;font-style:normal;font-size:13.5px;color:var(--steel);line-height:1.45;max-width:28ch}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr}}
.story{background:var(--white);border-block:1px solid var(--rule)}
.story-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(28px,5vw,80px);align-items:start}
.letter{font-size:clamp(1.05rem,1.35vw,1.2rem);line-height:1.72;color:var(--ink);max-width:58ch}
.letter p+p{margin-top:1.1em}
.sign{margin-top:28px;font-family:var(--f-mono);font-size:12px;letter-spacing:.04em}
.sign small{display:block;margin-top:4px;color:var(--steel);letter-spacing:.1em;text-transform:uppercase;font-size:10.5px}
.slot{aspect-ratio:4/5;background:var(--ink);display:flex;flex-direction:column;justify-content:space-between;padding:14px;color:#5C6670;font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase}
.slot .lines{display:grid;gap:6px}.slot .lines i{display:block;height:6px;background:#1F262E}.slot .lines i:nth-child(1){width:42%}.slot .lines i:nth-child(2){width:68%}.slot .lines i:nth-child(3){width:55%}
@media(max-width:900px){.story-grid{grid-template-columns:1fr}.slot{aspect-ratio:16/10;max-width:420px}}
.glance{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:clamp(28px,3.5vw,48px)}
.glance div{background:var(--paper);padding:clamp(18px,2.2vw,28px)}
.glance dt{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--steel)}
.glance dd{margin-top:10px;font-size:15.5px;line-height:1.5;color:var(--ink)}
.glance a{border-bottom:1px solid currentColor}
@media(max-width:640px){.glance{grid-template-columns:1fr}}
.prac{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(14px,2vw,22px);margin-top:clamp(32px,4vw,56px)}
.prac article{background:var(--white);border:1px solid var(--rule);padding:clamp(22px,2.6vw,34px);transition:transform .45s var(--e),box-shadow .45s}
.prac article:hover{transform:translate3d(0,-3px,0);box-shadow:0 24px 48px -36px rgba(14,18,22,.4)}
.prac .mark{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--rule);font-family:var(--f-mono);font-size:11px;letter-spacing:.08em;margin-bottom:18px}
.prac h3{margin-bottom:6px}
.prac .role{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel);margin-bottom:14px}
.prac ul{list-style:none;display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}
.prac li{font-family:var(--f-mono);font-size:10px;letter-spacing:.09em;text-transform:uppercase;padding:4px 9px;border:1px solid var(--rule-soft);color:var(--steel)}
@media(max-width:760px){.prac{grid-template-columns:1fr}}
.culture{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,2.5vw,32px);margin-top:clamp(28px,3.5vw,48px)}
.culture article{padding-top:18px;border-top:2px solid var(--ink)}
.culture p{margin-top:12px;font-size:15px;line-height:1.6;color:var(--steel)}
@media(max-width:800px){.culture{grid-template-columns:1fr}}
.values{background:var(--ink);color:#DDE2E7}
.values .eyebrow{color:var(--ink-dim)}
.values h2{color:#fff}
.val-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--ink-line);border:1px solid var(--ink-line);margin-top:clamp(32px,4vw,56px)}
.val-grid article{background:var(--ink);padding:clamp(22px,2.8vw,36px)}
.val-grid h3{color:#fff;margin-bottom:12px}
.val-grid p{color:var(--ink-dim);font-size:15px;line-height:1.6;max-width:42ch}
@media(max-width:700px){.val-grid{grid-template-columns:1fr}}
.ind{display:flex;flex-wrap:wrap;gap:8px;margin-top:clamp(24px,3vw,40px)}
.ind a,.ind span{display:inline-flex;flex-direction:column;gap:4px;padding:12px 16px;border:1px solid var(--rule);background:var(--white);min-width:140px;transition:border-color .35s,transform .35s var(--e)}
.ind a:hover{border-color:var(--ink);transform:translateY(-2px)}
.ind b{font-family:var(--f-display);font-weight:700;font-size:1rem;letter-spacing:-.02em}
.ind small{font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel)}
.badges{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.badges span{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;padding:8px 12px;border:1px solid var(--rule);color:var(--steel)}
`;

const aboutBody = `
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">About</li>
    </ol>
    <div class="hero-grid">
      <div>
        <p class="eyebrow" data-r>About KRIVA</p>
        <h1 class="d1 mask" data-mask id="h1"><span><i>A product studio built</i></span><span><i>around the work we</i></span><span><i>already know how to ship.</i></span></h1>
        <p class="lede" data-r>Design and engineering for US trucking ops and SaaS product teams.</p>
        <div class="hero-actions" data-r>
          <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
          <a href="/contact#brief" class="btn ghost"><span>Send a project brief</span><i>→</i></a>
        </div>
      </div>
      <div class="stat-rail" data-s>
        <div><b class="num">4</b><span>Time zones covered</span><em>US &amp; UK call hours with India delivery overlap</em></div>
        <div><b class="num">1</b><span>Team, no subcontracting</span><em>Everyone on your project is ours</em></div>
      </div>
    </div>
  </div>
</header>

<section class="sect story" aria-labelledby="storyH">
  <div class="wrap story-grid">
    <div>
      <p class="eyebrow" data-r>Our story</p>
      <h2 class="d2" id="storyH" data-r style="margin-top:16px">Why we exist.</h2>
      <div class="slot" data-r role="img" aria-label="Portrait placeholder">
        <div class="lines"><i></i><i></i><i></i></div>
        <span>Slot · founder portrait · 1200×1500</span>
      </div>
    </div>
    <div class="letter" data-r>
      <p>We design and build dispatch tools, fleet software, SaaS dashboards, and accounting integrations that operators and product teams actually want to use.</p>
      <p>The team has spent years designing and shipping software: SaaS dashboards, trucking dispatch tools, QuickBooks integrations, mobile apps. Most of that work happened inside agencies and product companies where the same problems repeated: design teams handing off specs that engineering couldn't build, clients managing three vendors for one project, and products that looked polished in Figma but fell apart in production.</p>
      <p>KRIVA started in 2025 to be a studio where design and engineering work together from day one: where the person who designs the interface understands the API it connects to, and where clients talk to the people doing the work, not a project manager relaying messages.</p>
      <p>We're based in Ahmedabad, India. Our clients are in the US, UK, and across the world. What they have in common: they need software built by people who've already solved problems like theirs.</p>
      <p class="sign">KRIVA Technologies<small>Product studio · Ahmedabad</small></p>
      <p class="body-sm" style="margin-top:20px"><span class="flag tbd">Note</span> “Nine years” refers to team experience, not company age. KRIVA was founded in 2025.</p>
    </div>
  </div>
</section>

<section class="sect" aria-labelledby="glanceH">
  <div class="wrap">
    <p class="eyebrow" data-r>Company</p>
    <h2 class="d2" id="glanceH" data-r style="margin-top:16px">KRIVA at a glance.</h2>
    <dl class="glance" data-s>
      <div><dt>Legal entity</dt><dd>KRIVA Technologies</dd></div>
      <div><dt>Founded</dt><dd>2025</dd></div>
      <div><dt>Team experience</dt><dd>Product design &amp; engineering</dd></div>
      <div><dt>Headquarters</dt><dd>511 - I The Address, Ahmedabad, Gujarat 380060, IN<br><span style="color:var(--steel);font-size:14px">Ahmedabad, India · Remote-first · Global clients</span></dd></div>
      <div><dt>How we deliver</dt><dd>Remote-first with dedicated squads for each project.</dd></div>
      <div><dt>Contact</dt><dd><a href="/contact#brief">Send a project brief</a></dd></div>
    </dl>
  </div>
</section>

<section class="sect" style="background:var(--paper-2);border-block:1px solid var(--rule)" aria-labelledby="teamH">
  <div class="wrap">
    <p class="eyebrow" data-r>Team</p>
    <h2 class="d2" id="teamH" data-r style="margin-top:16px;max-width:16ch">Small team. Senior people.</h2>
    <p class="body" data-r style="margin-top:16px">KRIVA is a small in-house studio with a core team of designers and engineers who ship SaaS products, trucking platforms, and accounting integrations. The people on your first call are the people building your product.</p>
    <div class="prac" data-s>
      <article>
        <div class="mark" aria-hidden="true">P&amp;</div>
        <h3 class="d3">Product &amp; Delivery Leadership</h3>
        <p class="role">Studio-led delivery</p>
        <p class="body-sm">Every project starts with a discovery session with the delivery team. Your brief, goals, and constraints get documented before any design or code begins.</p>
        <ul><li>Discovery</li><li>Roadmapping</li><li>Delivery quality</li></ul>
      </article>
      <article>
        <div class="mark" aria-hidden="true">DP</div>
        <h3 class="d3">Design Practice</h3>
        <p class="role">Product &amp; UI/UX design</p>
        <p class="body-sm">SaaS dashboards, trucking ops consoles, onboarding flows, and design systems: designed by people who've built these specific interfaces before.</p>
        <ul><li>UI/UX</li><li>Product design</li><li>Design systems</li></ul>
      </article>
      <article>
        <div class="mark" aria-hidden="true">EP</div>
        <h3 class="d3">Engineering Practice</h3>
        <p class="role">Web, mobile &amp; integrations</p>
        <p class="body-sm">Next.js, React Native, QuickBooks/Xero APIs, and whatever your product needs. Typed, tested, documented code that your team can maintain.</p>
        <ul><li>Web &amp; mobile</li><li>APIs</li><li>Integrations</li></ul>
      </article>
      <article>
        <div class="mark" aria-hidden="true">A&amp;</div>
        <h3 class="d3">AI &amp; Automation</h3>
        <p class="role">Practical automation</p>
        <p class="body-sm">AI-assisted workflows for support triage, document processing, and internal tooling. Human review on every output before it ships.</p>
        <ul><li>AI workflows</li><li>Automation</li><li>Support tooling</li></ul>
      </article>
    </div>
    <p class="body-sm" data-r style="margin-top:22px">Want to meet the team working on your project? We'll introduce everyone on the first call.</p>
  </div>
</section>

<section class="sect" aria-labelledby="cultureH">
  <div class="wrap">
    <p class="eyebrow" data-r>Culture</p>
    <h2 class="d2" id="cultureH" data-r style="margin-top:16px">How we operate.</h2>
    <div class="culture" data-s>
      <article>
        <h3 class="d3">One conversation, one standard</h3>
        <p>Design and engineering work together from the start. No handoff blame, no “that's not my department.”</p>
      </article>
      <article>
        <h3 class="d3">Show the work</h3>
        <p>We share progress weekly, document every decision, and give you access to the same tools we use.</p>
      </article>
      <article>
        <h3 class="d3">Build it to last</h3>
        <p>Clean Figma files, typed code, and documentation your team can use after we're done, not artifacts that only make sense to us.</p>
      </article>
    </div>
  </div>
</section>

<section class="sect values on-ink" aria-labelledby="valH">
  <div class="wrap">
    <p class="eyebrow" data-r>Values</p>
    <h2 class="d2" id="valH" data-r style="margin-top:16px;max-width:16ch">What you get when you work with us.</h2>
    <div class="val-grid" data-s>
      <article>
        <h3 class="d3">Design and code under one roof</h3>
        <p>Fewer handoffs, faster decisions, consistent quality from wireframe to deployment.</p>
      </article>
      <article>
        <h3 class="d3">Faster delivery with AI tools</h3>
        <p>We use Claude, Cursor, and Figma AI to move faster on the work that benefits from it: with human review before anything ships.</p>
      </article>
      <article>
        <h3 class="d3">Honest communication</h3>
        <p>Weekly demos, shared access, written tradeoffs. We'll tell you when something isn't working, not just when it is.</p>
      </article>
      <article>
        <h3 class="d3">Products that scale without us</h3>
        <p>Design systems, typed codebases, and documentation: so your team isn't dependent on us for every future change.</p>
      </article>
    </div>
  </div>
</section>

<section class="sect" aria-labelledby="indH">
  <div class="wrap">
    <p class="eyebrow" data-r>How we work</p>
    <h2 class="d2" id="indH" data-r style="margin-top:16px;max-width:18ch">Clear ownership. Measurable delivery.</h2>
    <p class="body" data-r style="margin-top:14px">In-house design and engineering, NDA-first collaboration, and weekly demos: without fabricated review scores.</p>
    <p class="mono" data-r style="margin-top:36px;color:var(--steel)">Industries we focus on</p>
    <div class="ind" data-s>
      <a href="/solutions/trucking-logistics"><b>US Trucking</b><small>Dispatch &amp; fleet</small></a>
      <a href="/solutions/saas"><b>UK SaaS</b><small>B2B products</small></a>
      <a href="/solutions/accounting-integrations"><b>Accounting</b><small>QuickBooks &amp; Xero</small></a>
      <a href="/services/crm-development"><b>CRM</b><small>Sales &amp; ops</small></a>
      <span><b>Healthcare</b><small>Patient apps</small></span>
      <span><b>E-commerce</b><small>D2C &amp; retail</small></span>
      <a href="/services/ai-assisted-development"><b>AI products</b><small>Automation</small></a>
      <span><b>Marketplaces</b><small>Two-sided platforms</small></span>
    </div>
    <div class="badges" data-r>
      <span>NDA-first engagements</span>
      <span>Design + dev in one team</span>
      <span>AI in the workflow</span>
      <span>Post-launch support available</span>
    </div>
    <a href="/process" class="p-link" data-r>See how a project runs <i>→</i></a>
  </div>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Work with us</p>
    <h2 class="d2" id="ctaH" data-r>Tell us what you're building.</h2>
    <p class="body-sm" data-r style="color:#8C98A4;margin-top:18px;max-width:54ch">Share a brief or book a fit call. We'll reply within one business day with fit, questions, and a sensible next step.</p>
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

/* ═══════════════ PROCESS ═══════════════ */
const processCss = `
.hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(24px,4vw,64px);align-items:end;margin-top:clamp(22px,3vw,40px)}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr}}
.phase-panel{background:var(--ink);color:#DDE2E7;padding:clamp(18px,2.4vw,28px)}
.phase-panel .k{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#6B7885}
.phase-panel ol{list-style:none;margin-top:16px;display:grid;gap:0}
.phase-panel li{display:grid;grid-template-columns:36px 1fr;gap:12px;padding:11px 0;border-bottom:1px solid var(--ink-line);font-size:14.5px;align-items:baseline}
.phase-panel li:last-child{border-bottom:0}
.phase-panel u{text-decoration:none;font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;color:var(--amber)}
.rail-wrap{position:relative;margin-top:clamp(40px,4.5vw,72px)}
.rail-line,.rail-fill{position:absolute;left:7px;top:8px;width:1px}
.rail-line{bottom:8px;background:var(--rule)}
.rail-fill{background:var(--blue);height:0;transform-origin:50% 0}
.step{display:grid;grid-template-columns:52px minmax(0,160px) minmax(0,1fr);gap:clamp(14px,2.6vw,44px);padding:clamp(20px,2.4vw,32px) 0;align-items:start}
.dot-o{width:15px;height:15px;border-radius:50%;border:1px solid var(--rule);background:var(--paper);position:relative;transition:border-color .5s var(--e),transform .5s var(--e)}
.dot-o::after{content:"";position:absolute;inset:3.5px;border-radius:50%;background:transparent;transition:background .5s var(--e)}
.step.on .dot-o{border-color:var(--blue);transform:scale(1.15)}
.step.on .dot-o::after{background:var(--blue)}
.step h3{color:var(--steel-2);transition:color .5s var(--e)}
.step.on h3{color:var(--ink)}
.when{margin-top:9px;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--steel)}
.gate{display:inline-block;margin-left:8px;font-size:9px;letter-spacing:.12em;padding:3px 7px;border:1px solid var(--amber);color:var(--amber)}
.step p{font-size:15.5px;line-height:1.62;color:var(--steel);max-width:52ch}
@media(max-width:820px){
  .step{grid-template-columns:34px minmax(0,1fr);gap:14px}
  .step>div:nth-child(3){grid-column:2}
  .rail-line,.rail-fill{left:7px}
}
.eng{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,22px);margin-top:clamp(32px,4vw,56px)}
.eng article{background:var(--white);border:1px solid var(--rule);padding:clamp(22px,2.6vw,34px);display:flex;flex-direction:column;min-height:240px;transition:transform .45s var(--e),box-shadow .45s}
.eng article:hover{transform:translate3d(0,-3px,0);box-shadow:0 24px 48px -36px rgba(14,18,22,.4)}
.eng .tag{font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber);margin-bottom:14px}
.eng h3{margin-bottom:12px}
.eng p{flex:1;font-size:15px;line-height:1.6;color:var(--steel)}
.eng .dur{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel);margin:16px 0 18px}
@media(max-width:860px){.eng{grid-template-columns:1fr}}
.stack{background:var(--paper-2);border-block:1px solid var(--rule)}
.stack-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,22px);margin-top:clamp(28px,3.5vw,48px)}
.stack article{background:var(--white);border:1px solid var(--rule);padding:clamp(18px,2.2vw,28px)}
.stack h3{margin-bottom:14px}
.stack ul{list-style:none;display:flex;flex-wrap:wrap;gap:7px}
.stack li{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border:1px solid var(--rule-soft);color:var(--steel)}
@media(max-width:900px){.stack-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.stack-grid{grid-template-columns:1fr}}
`;

const processExtra = `<script>
(function(){
const rail = document.getElementById('rail');
const fill = document.getElementById('railFill');
const steps = [...document.querySelectorAll('#rail .step')];
if(!rail || !fill || !steps.length) return;
let ticking=false;
const update=()=>{
  const rect = rail.getBoundingClientRect();
  const vh = innerHeight;
  const start = rect.top - vh * 0.35;
  const end = rect.bottom - vh * 0.45;
  const span = Math.max(end - start, 1);
  const p = Math.min(1, Math.max(0, (0 - start) / span));
  fill.style.height = (p * (rail.offsetHeight - 16)) + 'px';
  const y = scrollY + vh * 0.42;
  steps.forEach(s=>{
    const top = s.getBoundingClientRect().top + scrollY;
    s.classList.toggle('on', y >= top);
  });
  ticking=false;
};
addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(update); ticking=true; } }, {passive:true});
addEventListener('resize', update, {passive:true});
update();
})();
</script>`;

const processBody = `
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Process</li>
    </ol>
    <div class="hero-grid">
      <div>
        <p class="eyebrow" data-r>Process</p>
        <h1 class="d1 mask" data-mask id="h1"><span><i>Five phases.</i></span><span><i>Visible progress.</i></span></h1>
        <p class="lede" data-r>Discovery, design, build, launch, and support. Each phase has milestones, weekly demos, and deliverables you sign off before we move on. Tools help us move faster: people own every decision.</p>
        <div class="hero-actions" data-r>
          <a href="/contact#book" class="btn"><span>Book a 20-minute fit call</span><i>→</i></a>
          <a href="/contact#brief" class="btn ghost"><span>Send a project brief</span><i>→</i></a>
        </div>
      </div>
      <aside class="phase-panel" data-r aria-label="Phase overview">
        <p class="k">Delivery sequence</p>
        <ol>
          <li><u>01</u><span>Discover</span></li>
          <li><u>02</u><span>Design</span></li>
          <li><u>03</u><span>Build</span></li>
          <li><u>04</u><span>Launch</span></li>
          <li><u>05</u><span>Support</span></li>
        </ol>
      </aside>
    </div>
  </div>
</header>

<section class="sect" aria-labelledby="phaseH" style="border-top:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>How a project runs</p>
    <h2 class="d2" id="phaseH" data-r style="margin-top:16px;max-width:18ch">You always know what you're approving next.</h2>
    <div class="rail-wrap" id="rail">
      <div class="rail-line" aria-hidden="true"></div>
      <div class="rail-fill" id="railFill" aria-hidden="true"></div>
      <div class="step">
        <span class="dot-o" aria-hidden="true"></span>
        <div><h3 class="d3">Discover</h3><p class="when">Phase 01 <span class="gate">You sign off</span></p></div>
        <p>We capture goals, users, constraints, and success metrics in a written brief before any design starts.</p>
      </div>
      <div class="step">
        <span class="dot-o" aria-hidden="true"></span>
        <div><h3 class="d3">Design</h3><p class="when">Phase 02 <span class="gate">You sign off</span></p></div>
        <p>Flows, prototypes, and high-fidelity UI reviewed by stakeholders and signed off before development begins.</p>
      </div>
      <div class="step">
        <span class="dot-o" aria-hidden="true"></span>
        <div><h3 class="d3">Build</h3><p class="when">Phase 03</p></div>
        <p>Incremental delivery with weekly demos, QA gates, and open progress tracking. No surprises.</p>
      </div>
      <div class="step">
        <span class="dot-o" aria-hidden="true"></span>
        <div><h3 class="d3">Launch</h3><p class="when">Phase 04</p></div>
        <p>Deployment, analytics setup, handoff documentation, and team training.</p>
      </div>
      <div class="step">
        <span class="dot-o" aria-hidden="true"></span>
        <div><h3 class="d3">Support</h3><p class="when">Phase 05</p></div>
        <p>Iteration sprints, automation maintenance, and roadmap support. Most clients stay on a monthly retainer after launch.</p>
      </div>
    </div>
  </div>
</section>

<section class="sect" style="background:var(--white);border-block:1px solid var(--rule)" aria-labelledby="engH">
  <div class="wrap">
    <p class="eyebrow" data-r>Engagement models</p>
    <h2 class="d2" id="engH" data-r style="margin-top:16px;max-width:16ch">Pick the path that fits your stage.</h2>
    <div class="eng" data-s>
      <article>
        <span class="tag">Start here</span>
        <h3 class="d3">Discovery sprint</h3>
        <p class="dur">1–2 weeks</p>
        <p>Align on scope, timeline, and what you actually need before committing to a full engagement.</p>
        <a href="/contact#book" class="p-link">Book a 20-minute fit call <i>→</i></a>
      </article>
      <article>
        <span class="tag">Most common</span>
        <h3 class="d3">Project engagement</h3>
        <p class="dur">6–16 weeks</p>
        <p>Fixed scope with milestones, weekly demos, and a clear handoff at the end.</p>
        <a href="/contact#brief" class="p-link">Send a project brief <i>→</i></a>
      </article>
      <article>
        <span class="tag">Ongoing</span>
        <h3 class="d3">Ongoing partnership</h3>
        <p class="dur">Rolling monthly</p>
        <p>Continuous product iteration, design support, and automation maintenance on a rolling basis.</p>
        <a href="/contact#brief" class="p-link">Start a conversation <i>→</i></a>
      </article>
    </div>
  </div>
</section>

<section class="sect stack" aria-labelledby="stackH">
  <div class="wrap">
    <p class="eyebrow" data-r>Our stack</p>
    <h2 class="d2" id="stackH" data-r style="margin-top:16px">Tools we use at every phase.</h2>
    <p class="body" data-r style="margin-top:14px">Claude, ChatGPT, Figma, GitHub Copilot, Make, and Cursor are part of our workflow. Every output is reviewed before it ships.</p>
    <div class="stack-grid" data-s>
      <article>
        <h3 class="d3">Design</h3>
        <ul><li>Figma</li><li>FigJam</li></ul>
      </article>
      <article>
        <h3 class="d3">Frontend</h3>
        <ul><li>Next.js</li><li>React</li><li>TypeScript</li><li>Tailwind CSS</li></ul>
      </article>
      <article>
        <h3 class="d3">Mobile</h3>
        <ul><li>React Native</li><li>Flutter</li></ul>
      </article>
      <article>
        <h3 class="d3">Backend</h3>
        <ul><li>Node.js</li><li>Python</li><li>PostgreSQL</li><li>Redis</li></ul>
      </article>
      <article>
        <h3 class="d3">AI &amp; Automation</h3>
        <ul><li>Claude</li><li>ChatGPT</li><li>GitHub Copilot</li><li>Make</li><li>Cursor</li></ul>
      </article>
      <article>
        <h3 class="d3">No-Code</h3>
        <ul><li>Webflow</li><li>Bubble</li><li>Framer</li><li>Zapier</li></ul>
      </article>
    </div>
    <p class="body-sm" data-r style="margin-top:20px"><a href="/technologies" class="p-link" style="margin-top:0">Full technologies page <i>→</i></a></p>
  </div>
</section>

<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Next step</p>
    <h2 class="d2" id="ctaH" data-r>Want to see how this process fits your project?</h2>
    <p class="body-sm" data-r style="color:#8C98A4;margin-top:18px;max-width:54ch">Send a brief or book a fit call. We'll walk through a realistic timeline and deliverables for your scope.</p>
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

const pages = [
  {
    file: "kriva-solutions-index.html",
    title: "Solutions · SaaS, Trucking, Integrations &amp; Auto Transport · KRIVA",
    description:
      "Four KRIVA solution areas: trucking &amp; logistics, SaaS products, QuickBooks &amp; Xero integrations, and car transportation: with capabilities, process, and related work.",
    canonical: "https://krivatechnologies.com/solutions",
    ogTitle: "Solutions · SaaS, Trucking, Integrations &amp; Auto Transport",
    pageCss: solutionsCss,
    body: solutionsBody,
  },
  {
    file: "kriva-about.html",
    title: "About KRIVA Technologies · Team, Story &amp; Experience",
    description:
      "KRIVA is a product studio in Ahmedabad designing and building software for US trucking ops and SaaS product teams: design and engineering under one roof.",
    canonical: "https://krivatechnologies.com/about",
    ogTitle: "About KRIVA Technologies · Team, Story &amp; Experience",
    pageCss: aboutCss,
    body: aboutBody,
  },
  {
    file: "kriva-process.html",
    title: "Process · How we deliver · KRIVA",
    description:
      "KRIVA's five-phase delivery process for SaaS and trucking software: discovery, design, build, launch, and support with weekly demos and clear sign-off gates.",
    canonical: "https://krivatechnologies.com/process",
    ogTitle: "Process · How we deliver",
    pageCss: processCss,
    body: processBody,
    extraScript: processExtra,
  },
];

for (const p of pages) {
  const html = shell(p);
  fs.writeFileSync(path.join(__dirname, p.file), html, "utf8");
  console.log("WROTE", p.file);
}

const { applyFile } = require("./apply_chrome.cjs");
for (const p of pages) {
  console.log(applyFile(p.file));
}
