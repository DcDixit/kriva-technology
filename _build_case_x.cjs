// Builds the ShiftRail case study (/work/shiftrail-dispatch → kriva-case-fleetflow.html) on the
// svx layer + shared/case-x.css/js ("csx-" prefix). Splices from git HEAD so the head/SEO, nav,
// sheet, inquiry form, footer and JSON-LD stay verbatim. Re-running overwrites hand edits.
// Usage: node _build_case_x.cjs
const fs = require('fs');
const { execSync } = require('child_process');
const FILE = 'kriva-case-fleetflow.html';
let h = execSync('git show HEAD:' + FILE, { encoding: 'utf8', maxBuffer: 1 << 26 });
const must = (cond, msg) => { if (!cond) { console.error('splice failed: ' + msg); process.exit(1); } };
const cut = (src, a, b) => { const i = src.indexOf(a); const j = src.indexOf(b, i); must(i >= 0 && j > i, a + ' … ' + b); return [src.slice(0, i), src.slice(i, j), src.slice(j)]; };

/* 1 · motion flag in the head (same failsafe as the svx pages) */
const JS_FLAG = "<script>document.documentElement.classList.add('js')</script>";
must(h.includes(JS_FLAG), 'js flag');
h = h.replace(JS_FLAG, "<script>(function(d){d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('svx-motion');setTimeout(function(){if(!window.__svx)d.classList.remove('svx-motion')},2500)}})(document.documentElement)</script>");

/* 2 · inline style: keep the base (reset, wrap, btn, skip, progress, footer), drop old components */
{
  const [pre, style, post] = cut(h, '<style>', '</style>');
  const keepTo = style.indexOf('/* ── notice strip');
  const footA = style.indexOf('/* ══ footer (shared) ══ */');
  const footB = style.indexOf('@media (prefers-reduced-motion:reduce)');
  must(keepTo > 0 && footA > 0 && footB > footA, 'style anchors');
  const base = style.slice(0, keepTo)
    + '.progress{position:fixed;top:0;left:0;height:2px;width:100%;transform:scaleX(0);transform-origin:0 50%;background:var(--blue);z-index:95;will-change:transform}\n\n'
    + style.slice(footA, footB)
    + '@media (prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto}}\n';
  h = pre + base + post;
}
h = h.replace('<link rel="stylesheet" href="/shared/slot-assets.css?v=brand1">\n', '');
h = h.replace('<link rel="stylesheet" href="/shared/kds.css?v=brand1">\n</head>',
  '<link rel="stylesheet" href="/shared/kds.css?v=brand1">\n<link rel="stylesheet" href="/shared/services-x.css?v=svx1">\n<link rel="stylesheet" href="/shared/case-x.css?v=csx1">\n</head>');
must(h.includes('case-x.css'), 'css links');

/* 3 · body */
h = h.replace('<body class="case case-fleet">', '<body class="case case-fleet svx svx-case">');
must(h.includes('svx-case'), 'body class');

/* 4 · page body: rail → just before the inquiry section */
const ARROW = '<i aria-hidden="true">→</i>';
const MAIN = fs.readFileSync(__dirname + '/_case_x_main.html', 'utf8').replace(/\{ARROW\}/g, ARROW);
{
  const [pre, , post] = cut(h, '<!-- COMPONENT: chapter rail -->', '<section class="inq-sec" id="inquire"');
  h = pre + MAIN + post;
}

/* 5 · inquiry: same form, svx card */
{
  const [pre, sec, post] = cut(h, '<section class="inq-sec" id="inquire"', '</section>');
  const formA = sec.indexOf('<form'); const doneB = sec.indexOf('</div>', sec.indexOf('class="inq-done"')) + 6;
  must(formA > 0 && doneB > formA, 'form');
  const form = sec.slice(formA, doneB);
  const copy = sec.match(/<h2 class="d2" id="inqH">([^<]+)<\/h2>\s*<p class="lede">([^<]+)<\/p>\s*(<p class="inq-help">[\s\S]*?<\/p>)/);
  must(copy, 'inq copy');
  h = pre + `<section class="inq-sec cr-inq csx-inq" id="inquire" aria-labelledby="inqH">
  <div class="wrap">
    <div class="cr-inq-card" data-dark>
      <div class="inq-grid cr-inq-grid">
        <div class="inq-copy">
          <p class="svx-kicker eyebrow">Start a conversation</p>
          <h2 id="inqH" data-split>${copy[1]}</h2>
          <p class="svx-lede lede">${copy[2]}</p>
          ${copy[3]}
        </div>
        <div>
      ${form}
        </div>
      </div>
    </div>
  </div>
` + post;
}

/* 6 · scripts: old inline loop → svx + case-x */
{
  const [pre, , post] = cut(h, '<script>\n(function(){\n\'use strict\';', '<!-- KRIVA_SCHEMA_START -->');
  h = pre + post;
}
h = h.replace('<script src="/shared/page-inquiry.js?v=kds7" defer></script>',
  '<script src="/shared/services-x.js?v=svx1" defer></script>\n<script src="/shared/case-x.js?v=csx1" defer></script>\n<script src="/shared/page-inquiry.js?v=kds7" defer></script>');
must(h.includes('case-x.js'), 'scripts');

fs.writeFileSync(FILE, h);
console.log('wrote', FILE, h.length, 'bytes');
