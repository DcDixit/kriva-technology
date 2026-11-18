// Splice /work (kriva-work-index.html) into the "wx" layer, from git HEAD.
// Keeps head/SEO, header, sheet, every case article, FAQ text, the form, footer and schema verbatim.
// Replaces: hero + filter bar shell, group heads, the lower sections' layout, and the inline script
// (filtering now lives in shared/work-x.js). Usage: node _build_work_x.cjs
const fs = require('fs');
const { execSync } = require('child_process');
const FILE = 'kriva-work-index.html';
let h = execSync('git show HEAD:' + FILE, { encoding: 'utf8', maxBuffer: 1 << 24 }).replace(/\r\n/g, '\n');

const must = (cond, msg) => { if (!cond) { console.error('SPLICE FAIL: ' + msg); process.exit(1); } };
const cut = (start, end, repl, incEnd = true) => {
  const a = h.indexOf(start); must(a >= 0, 'start ' + start.slice(0, 50));
  const b = h.indexOf(end, a); must(b >= 0, 'end ' + end.slice(0, 50));
  h = h.slice(0, a) + repl + h.slice(incEnd ? b + end.length : b);
};
const rep = (from, to, all = false) => {
  must(h.includes(from), 'missing ' + from.slice(0, 60));
  h = all ? h.split(from).join(to) : h.replace(from, to);
};

/* ── head ── */
rep(`<script>document.documentElement.classList.add('js')</script>`,
  `<script>(function(d){d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('wx-motion');setTimeout(function(){if(!window.__wx)d.classList.remove('wx-motion')},2500)}})(document.documentElement)</script>`);
rep(`<link rel="stylesheet" href="/shared/slot-assets.css?v=brand1">\n`, ``);
rep(`<link rel="stylesheet" href="/shared/kds.css?v=brand1">\n</head>`,
  `<link rel="stylesheet" href="/shared/kds.css?v=brand1">\n<link rel="stylesheet" href="/shared/work-x.css?v=wx1">\n</head>`);
rep(`<body class="page-work">`, `<body class="page-work wx">`);

/* ── section rail ── */
const RAIL = [['overview', 'Overview'], ['product-cases', 'Product cases'], ['websites', 'Websites'], ['process', 'Process'], ['solutions', 'Solutions'], ['faq', 'FAQ'], ['inquire', 'Start']];
rep(`<main id="main">`, `<nav class="wx-rail" id="chapters" aria-label="Sections">
  <ol>
${RAIL.map(([id, t]) => `    <li><a href="#${id}"><span>${t}</span></a></li>`).join('\n')}
  </ol>
</nav>

<main id="main">`);

/* ── hero + filter bar ── */
const SHOTS = ['eliteone-transportation', 'schwarz-logistics', 'keep-moving', 'extra-mile-movers', 'xmile-auto-transport', 'keep-moving-fitness', 'cascadia-collection-homepage-illustration'];
const DOMAINS = ['elite-one.us', 'schwarzlogistics.com', 'keepmovingus.com', 'xtramilemovers.com', 'xmileautotransport.com', 'fitnesskeepmoving.com', 'cascadiacollection.com'];
const tile = (i) => `<div class="wx-tile"><div class="wx-tile-bar"><i></i><i></i><i></i><span>${DOMAINS[i]}</span></div><img src="/media/work/web/${SHOTS[i]}-800.webp" alt="" width="800" height="500" decoding="async"${i > 2 ? ' loading="lazy"' : ''}></div>`;
const col = (order) => { const t = order.map(tile).join(''); return `<div class="wx-col"><div class="wx-track">${t}${t}</div></div>`; };
// Client order rule: EliteOne always first, Schwarz Logistics always last.
const NAMES = ['EliteOne', 'ShiftRail', 'PayrollPro', 'FinanceSync', 'HealthTrack', 'CRMPulse', 'SupportAI', 'LocalServe', 'BrandLift', 'Keep Moving', 'Extra Mile Movers', 'Xmile Group', 'Keep Moving Fitness', 'Cascadia Collection', 'Schwarz Logistics'];
const run = NAMES.map((n) => `<span>${n}</span><i></i>`).join('');

cut(`<header class="hero hero--inner" id="overview"`, `<section class="wk-index" aria-label="Published work">`, `<header class="wx-hero" id="overview" aria-labelledby="h1" data-dark>
  <div class="wx-hero-bg" aria-hidden="true"><div class="wx-grid"></div><div class="wx-glow"></div></div>
  <div class="wrap">
    <ol class="crumbs wx-crumbs">
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">Work</li>
    </ol>
    <p class="wx-kicker wx-pill"><i aria-hidden="true"></i>Our work</p>
    <h1 class="wx-h1" id="h1"><span class="wx-l"><span>Case studies in</span></span> <span class="wx-l"><span><em>trucking software, SaaS,</em></span></span> <span class="wx-l"><span>and web design</span></span></h1>
    <div class="wx-hero-grid">
      <div class="wx-hero-copy">
        <p class="wx-lede">Eight product case studies, from a US trucking dispatch CRM to SaaS onboarding, QuickBooks and Xero reconciliation, a patient app, and AI-assisted support. Plus seven websites we designed for transport, moving, and service businesses.</p>
        <div class="wx-actions">
          <a href="#list" class="btn wx-btn" data-magnet><span>Browse the work</span><i>→</i></a>
          <a href="/contact#book" class="wx-link"><span>Book a free 20-minute fit call</span><i>→</i></a>
        </div>
        <dl class="wk-facts wx-facts">
          <div><dt>Product case studies</dt><dd class="num" data-count="8">8</dd></div>
          <div><dt>Client website projects</dt><dd class="num" data-count="7">7</dd></div>
        </dl>
        <p class="wk-note wx-note">Product screens are rebuilt for this site, so no client data is shown. We publish outcome numbers only when a client approves them in writing. <a href="#faq">How to read our work</a></p>
      </div>
      <div class="wx-reel" aria-hidden="true">
        <div class="wx-reel-in">
          ${col([0, 2, 4, 6])}
          ${col([3, 5, 0, 1])}
          ${col([4, 6, 2, 3])}
        </div>
      </div>
    </div>
  </div>
  <div class="wx-marquee" aria-hidden="true"><div class="wx-marquee-in">${run}${run}</div></div>
</header>

<div class="wk-band wk-bar wx-bar" id="web-design">
  <div class="wrap">
    <p class="wk-scroll-hint" id="wkScrollHint" hidden><i aria-hidden="true">→</i> Swipe for more filters</p>
    <div class="wk-chips-wrap" id="wkChipsWrap">
      <div class="wk-chips" role="group" aria-label="Filter case studies by category">
      <span class="wx-ind" aria-hidden="true"></span>
      <button type="button" class="wk-chip" data-f="all" aria-pressed="true">All <u class="num">15</u></button>
      <button type="button" class="wk-chip" data-f="web-design" aria-pressed="false">Web Design &amp; UI/UX <u class="num">07</u></button>
      <button type="button" class="wk-chip" data-f="trucking" aria-pressed="false">Trucking <u class="num">04</u></button>
      <button type="button" class="wk-chip" data-f="saas" aria-pressed="false">SaaS <u class="num">04</u></button>
      <button type="button" class="wk-chip" data-f="finance" aria-pressed="false">Finance <u class="num">01</u></button>
      <button type="button" class="wk-chip" data-f="mobile" aria-pressed="false">Mobile <u class="num">01</u></button>
      <button type="button" class="wk-chip" data-f="brand" aria-pressed="false">Brand <u class="num">01</u></button>
      <button type="button" class="wk-chip" data-f="marketplace" aria-pressed="false">Marketplace <u class="num">01</u></button>
      </div>
    </div>
    <p class="wk-count" id="count" aria-live="polite">Showing 15 of 15</p>
  </div>
</div>

<section class="wk-index" aria-label="Published work">`);

/* ── group heads ── */
const headRe = /<div class="wrap wk-group-head">\n\s*<h2 class="d3" id="(\w+)">([^<]+)<\/h2>\n\s*<p class="body-sm">([\s\S]*?)<\/p>\n\s*<\/div>/g;
const kick = { productsH: ['01', 'Product work'], websitesH: ['02', 'Client websites'] };
let heads = 0;
h = h.replace(headRe, (m, id, title, p) => {
  heads++;
  const [n, k] = kick[id];
  return `<div class="wrap wk-group-head wx-head">
        <div class="wx-head-main"><p class="wx-kicker"><b>${n}</b>${k}</p><h2 class="d3" id="${id}" data-split>${title}</h2></div>
        <p class="body-sm wx-head-aside" data-x>${p}</p>
      </div>`;
});
must(heads === 2, 'group heads ' + heads);

/* ── cards: cursor labels ── */
rep(`<article class="wk-lead on-ink wk-case"`, `<article class="wk-lead on-ink wk-case" data-dark`);
rep(`<a class="wk-lead-frame" href="/work/shiftrail-dispatch"`, `<a class="wk-lead-frame" data-cursor="View case" href="/work/shiftrail-dispatch"`);
h = h.replace(/<article class="wk-card wk-case" data-cats="/g, '<article class="wk-card wk-case" data-cursor="View case" data-cats="');
h = h.replace(/<article class="wk-card wk-case wk-web" data-cats="/g, '<article class="wk-card wk-case wk-web" data-cursor="Visit site" data-cats="');
must((h.match(/data-cursor="View case" data-cats/g) || []).length === 7, 'product cards');
must((h.match(/data-cursor="Visit site"/g) || []).length === 7, 'web cards');

/* ── lower sections ── */
const faqItems = (() => {
  const a = h.indexOf('<div class="wk-faq-list">'); const b = h.indexOf('</div>', a);
  must(a > 0 && b > a, 'faq list');
  return h.slice(a + '<div class="wk-faq-list">'.length, b).trim();
})();
const formBlock = (() => {
  const a = h.indexOf('<form class="inq-form" id="pageInquiry"'); const b = h.indexOf('</form>', a);
  const c = h.indexOf('<div class="inq-done"', b); const d = h.indexOf('</div>', c);
  must(a > 0 && b > a && c > b && d > c, 'form');
  return h.slice(a, b + 7) + '\n      ' + h.slice(c, d + 6);
})();
must((faqItems.match(/<details/g) || []).length === 6, 'faq count');

const ARROW = '<i aria-hidden="true">→</i>';
cut(`<section class="story story--split story--flip wk-how"`, `</main>`, `<section class="wx-sec wx-how" id="process" aria-labelledby="howH" data-dark>
  <div class="wx-how-bg" aria-hidden="true"></div>
  <div class="wrap">
    <div class="wx-head">
      <div class="wx-head-main"><p class="wx-kicker eyebrow">How these projects run</p><h2 id="howH" data-split>Five phases, each one signed off by you</h2></div>
      <p class="wx-lede wx-head-aside" data-x>Our product projects move through discover, design, build, launch, and support. Each phase ends with your written sign-off before the next one starts, so you always know what was agreed before work moves on.</p>
    </div>
    <ol class="wx-phases" data-steps>
      <li><span class="wx-ph-n">01</span><b>Discover</b><em>Sign-off</em></li>
      <li><span class="wx-ph-n">02</span><b>Design</b><em>Sign-off</em></li>
      <li><span class="wx-ph-n">03</span><b>Build</b><em>Sign-off</em></li>
      <li><span class="wx-ph-n">04</span><b>Launch</b><em>Sign-off</em></li>
      <li><span class="wx-ph-n">05</span><b>Support</b><em>Sign-off</em></li>
    </ol>
    <div class="wx-how-grid">
      <figure class="wx-how-img" data-x>
        <div class="wx-img"><img data-par src="/media/photos/work-phase-sketches-960.webp" srcset="/media/photos/work-phase-sketches-960.webp 960w, /media/photos/work-phase-sketches.webp 1600w" sizes="(min-width:1001px) 40vw, 92vw" alt="A notebook of screen sketches and a pen on a wooden desk." width="1600" height="1067" loading="lazy" decoding="async"></div>
        <figcaption class="story-credit">Stock photo (<a href="https://www.pexels.com/license/" rel="noopener noreferrer">Pexels License</a>). Not a KRIVA client.</figcaption>
      </figure>
      <div class="wx-how-copy">
        <ul class="wx-points">
          <li data-x><b class="wx-pi" aria-hidden="true">A</b><span>A working demo every week, with a written next step</span></li>
          <li data-x style="--d:.08s"><b class="wx-pi" aria-hidden="true">B</b><span>One named owner on your side and one on ours</span></li>
          <li data-x style="--d:.16s"><b class="wx-pi" aria-hidden="true">C</b><span>Call hours that overlap with UK and US teams</span></li>
        </ul>
        <p class="wk-how-link" data-x><a class="wx-more" href="/process"><span>See our full delivery process</span>${ARROW}</a></p>
      </div>
    </div>
  </div>
</section>

<section class="wx-sec wx-read" id="solutions" aria-labelledby="readH">
  <div class="wrap wx-read-grid">
    <div class="wx-read-side">
      <p class="wx-kicker eyebrow">Find the work closest to yours</p>
      <h2 id="readH" data-split>Explore the solution behind each case</h2>
      <p class="wx-lede" data-x>Most of this work sits in four areas. Each solution page explains what we build for that market and how a project runs.</p>
      <figure class="wx-read-media" data-x>
        <div class="wx-img"><img data-par class="is-subject-low" src="/media/photos/work-dock-check-800.webp" srcset="/media/photos/work-dock-check-800.webp 800w, /media/photos/work-dock-check.webp 1600w" sizes="(min-width:1001px) 36vw, 92vw" alt="A warehouse lead stands in an aisle of pallet racking loaded with freight." width="1600" height="1067" loading="lazy" decoding="async"></div>
        <figcaption>Photograph via <a href="https://www.pexels.com/license/" rel="noopener noreferrer">Pexels License</a>. Not a KRIVA client.</figcaption>
      </figure>
    </div>
    <div class="wx-read-main">
      <nav class="wk-markets wx-markets" aria-label="Solutions related to this work">
        <a class="wx-mk" data-x href="/solutions/trucking-logistics"><u aria-hidden="true">01</u><b>Trucking software</b><span>EliteOne · ShiftRail · Schwarz</span>${ARROW}</a>
        <a class="wx-mk" data-x href="/solutions/saas"><u aria-hidden="true">02</u><b>SaaS product development</b><span>PayrollPro · CRMPulse · SupportAI</span>${ARROW}</a>
        <a class="wx-mk" data-x href="/solutions/accounting-integrations"><u aria-hidden="true">03</u><b>QuickBooks and Xero integrations</b><span>FinanceSync</span>${ARROW}</a>
        <a class="wx-mk" data-x href="/solutions/car-transportation"><u aria-hidden="true">04</u><b>Auto transport software</b><span>Xmile Group</span>${ARROW}</a>
      </nav>
      <p class="wk-read-more wx-read-more" data-x><a class="wx-link" href="/solutions"><span>All solutions</span><i>→</i></a> <a class="wx-link" href="/services"><span>All services</span><i>→</i></a></p>
    </div>
  </div>
</section>

<section class="wx-sec wx-faq" id="faq" aria-labelledby="faqH">
  <div class="wrap wx-faq-grid">
    <div class="wx-faq-side">
      <p class="wx-kicker eyebrow">Questions</p>
      <h2 id="faqH" data-split>How to read our work</h2>
      <p class="wx-lede" data-x>Straight answers about what these case studies show and what they don't. More in our <a class="wx-inline" href="/faq">full FAQ</a>.</p>
    </div>
    <div class="wk-faq-list wx-faq-list">
      ${faqItems}
    </div>
  </div>
</section>

<section class="inq-sec wx-inq" id="inquire" aria-labelledby="inqH">
  <div class="wrap">
    <div class="wx-inq-card" data-dark>
      <div class="inq-grid wx-inq-grid">
        <div class="inq-copy">
          <p class="wx-kicker eyebrow">Start a conversation</p>
          <h2 class="d2" id="inqH">Want to see work closer to your project?</h2>
          <p class="lede wx-lede">Tell us what your team is building or working around. We'll reply within one business day and walk you through the most relevant case.</p>
          <p class="inq-help">Prefer email? <a href="mailto:hello@krivatechnologies.com">hello@krivatechnologies.com</a>. Have a longer brief or files? <a href="/contact#brief">Send a project brief</a>.</p>
        </div>
        <div>
      ${formBlock}
        </div>
      </div>
    </div>
  </div>
</section>
</main>`);

/* ── replace the inline page script with work-x.js ── */
cut(`<script>\n(function(){\n'use strict';\nconst reduce=()=>`, `run();\n})();\n</script>\n`, ``);
rep(`<script src="/shared/page-inquiry.js?v=kds7" defer></script>`,
  `<script src="/shared/work-x.js?v=wx1" defer></script>\n<script src="/shared/page-inquiry.js?v=kds7" defer></script>`);

/* sanity: every href from HEAD survives */
const hrefs = (s) => new Set([...s.matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
const before = hrefs(execSync('git show HEAD:' + FILE, { encoding: 'utf8', maxBuffer: 1 << 24 }));
const after = hrefs(h);
const lost = [...before].filter((x) => !after.has(x));
if (lost.length) console.log('hrefs no longer on page:', lost);

fs.writeFileSync(FILE, h.replace(/\n/g, '\r\n'));
console.log('wrote', FILE, h.length, 'chars');
