/**
 * Build careers + industries pages (from live Next content) and URL rewrite map.
 * Run: node build_supporting.cjs
 */
const fs = require("fs");
const path = require("path");
const { applyFile, PAGE_CURRENT } = require("./apply_chrome.cjs");

const ROOT = __dirname;

const TOKENS = fs
  .readFileSync(path.join(ROOT, "build_priority3.cjs"), "utf8")
  .match(/const TOKENS = `([\s\S]*?)`;/)[1];

const PAGE_CSS = `
.hero{padding:calc(72px + clamp(26px,4vw,58px)) 0 clamp(36px,4.5vw,64px)}
.role-list{margin-top:clamp(28px,3.5vw,48px);border-top:1px solid var(--rule)}
.role{display:grid;grid-template-columns:minmax(0,1.4fr) auto;gap:18px;align-items:center;padding:clamp(18px,2.2vw,26px) 0;border-bottom:1px solid var(--rule)}
.role h3{margin-bottom:6px}
.role .meta{font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel)}
@media(max-width:640px){.role{grid-template-columns:1fr}}
.ind-list{margin-top:clamp(28px,3.5vw,48px);display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule)}
.ind{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:end;background:var(--white);padding:clamp(22px,2.6vw,34px);text-decoration:none;color:inherit;transition:background .35s var(--e)}
.ind:hover{background:var(--paper-2)}
.ind .k{font-family:var(--f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--steel);margin-bottom:10px}
.ind .go{font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);white-space:nowrap}
@media(max-width:720px){.ind{grid-template-columns:1fr}}
.aside-note{margin-top:28px;padding:18px 20px;background:var(--paper-2);border-left:2px solid var(--amber);max-width:62ch}
`;

const SCRIPT = `<script src="/shared/chrome.js" defer></script>
<script>
(function(){
'use strict';
const io=new IntersectionObserver(es=>{
  for(const e of es){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }
},{threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach(el=>{
  if(el.hasAttribute('data-mask')) el.classList.add('mask');
  io.observe(el);
});
})();
</script>`;

function pageShell({ title, meta, canonical, ogTitle, eyebrow, h1Lines, lede, body, schema }) {
  const masks = h1Lines.map((l) => `<span><i>${l}</i></span>`).join("\n          ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${meta}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${meta}">
<meta property="og:url" content="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/shared/chrome.css">
<style>
${TOKENS}
${PAGE_CSS}
</style>
${schema ? `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<!--KRIVA_CHROME-->
<main id="main">
<header class="hero">
  <div class="wrap">
    <ol class="crumbs" data-r>
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">${ogTitle}</li>
    </ol>
    <p class="eyebrow" data-r style="margin-top:22px">${eyebrow}</p>
    <h1 class="d1 mask" data-mask style="margin-top:18px">
          ${masks}
    </h1>
    <p class="lede" data-r style="margin-top:22px">${lede}</p>
  </div>
</header>
${body}
<section class="cta-band on-ink" aria-labelledby="ctaH">
  <div class="wrap">
    <p class="eyebrow" data-r>Start a project</p>
    <h2 class="d2" id="ctaH" data-r>Ready to talk?</h2>
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
${SCRIPT}
</body>
</html>`;
}

const careers = pageShell({
  title: "Careers · Join KRIVA",
  meta: "Join KRIVA — open roles for designers, engineers, and automation specialists. Remote-first with UK and US client overlap.",
  canonical: "https://krivatechnologies.com/careers",
  ogTitle: "Careers",
  eyebrow: "Company · Careers",
  h1Lines: ["Join a focused", "product studio."],
  lede: "We're hiring designers, engineers, and automation specialists who communicate clearly, care about craft, and want ownership on real SaaS and logistics products.",
  schema: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Careers at KRIVA Technologies",
    url: "https://krivatechnologies.com/careers",
  },
  body: `
<section class="sect" aria-labelledby="rolesH" style="border-top:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>Open roles</p>
    <h2 class="d2" id="rolesH" data-r style="margin-top:16px">Current openings</h2>
    <p class="body" data-r style="margin-top:14px">Remote-first. Apply through the contact form with your portfolio or GitHub and a short note on what you do best.</p>
    <div class="role-list" data-s>
      <article class="role">
        <div>
          <h3 class="d3">Senior Product Designer</h3>
          <p class="meta">Remote · India-friendly overlap · Full-time</p>
        </div>
        <a class="btn sm" href="/contact#brief"><span>Apply</span><i>→</i></a>
      </article>
      <article class="role">
        <div>
          <h3 class="d3">Full-Stack Developer (Next.js)</h3>
          <p class="meta">Remote · global · Full-time</p>
        </div>
        <a class="btn sm" href="/contact#brief"><span>Apply</span><i>→</i></a>
      </article>
      <article class="role">
        <div>
          <h3 class="d3">AI Automation Specialist</h3>
          <p class="meta">Remote · Full-time · contract-to-hire</p>
        </div>
        <a class="btn sm" href="/contact#brief"><span>Apply</span><i>→</i></a>
      </article>
    </div>
    <p class="aside-note body-sm" data-r>Don't see your role? <a href="/contact#brief" style="border-bottom:1px solid var(--rule)">Send a general application</a> — we review every note and reply when there's a fit.</p>
  </div>
</section>`,
});

const industries = pageShell({
  title: "Industries · SaaS, Trucking, Integrations & CRM · KRIVA",
  meta: "How KRIVA delivers for SaaS, trucking, QuickBooks/Xero integrations, car transportation, and CRM — with tailored approaches and illustrative work.",
  canonical: "https://krivatechnologies.com/industries",
  ogTitle: "Industries",
  eyebrow: "Company · Industries",
  h1Lines: ["Markets we know", "well enough to", "be specific."],
  lede: "Each industry links to a dedicated solution path and illustrative work — so you can see how we approach your market before a fit call.",
  schema: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Industries — KRIVA Technologies",
    url: "https://krivatechnologies.com/industries",
  },
  body: `
<section class="sect" aria-labelledby="indH" style="border-top:1px solid var(--rule)">
  <div class="wrap">
    <p class="eyebrow" data-r>Markets</p>
    <h2 class="d2" id="indH" data-r style="margin-top:16px">Where we go deep</h2>
    <div class="ind-list" data-s>
      <a class="ind" href="/solutions/saas">
        <div>
          <p class="k">01 · SaaS</p>
          <h3 class="d3">SaaS &amp; Startups</h3>
          <p class="body-sm" style="margin-top:10px">UK-focused SaaS UI/UX, MVP development, onboarding, and dashboards that support activation and demos.</p>
        </div>
        <span class="go">View solution →</span>
      </a>
      <a class="ind" href="/solutions/trucking-logistics">
        <div>
          <p class="k">02 · Trucking</p>
          <h3 class="d3">Trucking &amp; Logistics</h3>
          <p class="body-sm" style="margin-top:10px">US trucking software — custom TMS-style tools, dispatch CRM, fleet dashboards, and driver apps.</p>
        </div>
        <span class="go">View solution →</span>
      </a>
      <a class="ind" href="/solutions/accounting-integrations">
        <div>
          <p class="k">03 · Finance ops</p>
          <h3 class="d3">Accounting Integrations</h3>
          <p class="body-sm" style="margin-top:10px">QuickBooks and Xero API sync, reconciliation dashboards, and reliable operator tooling.</p>
        </div>
        <span class="go">View solution →</span>
      </a>
      <a class="ind" href="/solutions/car-transportation">
        <div>
          <p class="k">04 · Auto transport</p>
          <h3 class="d3">Car Transportation</h3>
          <p class="body-sm" style="margin-top:10px">Booking portals, carrier dispatch, customer tracking, and ops automation for vehicle logistics.</p>
        </div>
        <span class="go">View solution →</span>
      </a>
      <a class="ind" href="/services/crm-development">
        <div>
          <p class="k">05 · CRM</p>
          <h3 class="d3">CRM &amp; Automation</h3>
          <p class="body-sm" style="margin-top:10px">Custom CRM UX, workflow automation, and integration-heavy consoles for ops teams.</p>
        </div>
        <span class="go">View service →</span>
      </a>
    </div>
    <p class="body-sm" data-r style="margin-top:28px">Also see <a href="/solutions" style="border-bottom:1px solid var(--rule)">all solutions</a>, <a href="/work" style="border-bottom:1px solid var(--rule)">selected work</a>, and <a href="/services" style="border-bottom:1px solid var(--rule)">services</a>.</p>
  </div>
</section>`,
});

fs.writeFileSync(path.join(ROOT, "kriva-careers.html"), careers, "utf8");
fs.writeFileSync(path.join(ROOT, "kriva-industries.html"), industries, "utf8");
PAGE_CURRENT["kriva-careers.html"] = null;
PAGE_CURRENT["kriva-industries.html"] = null;
console.log(applyFile("kriva-careers.html"));
console.log(applyFile("kriva-industries.html"));

/* Rewrite map for local preview + Vercel static hosting */
const { FILE_MAP } = require("./_crawl_links.js");
const rewrites = Object.entries(FILE_MAP).map(([source, destination]) => ({
  source: source === "/" ? "/" : source,
  destination: `/${destination}`,
}));
// ensure all service pages
for (const f of fs.readdirSync(ROOT).filter((x) => /^kriva-service-.*\.html$/i.test(x))) {
  const slug = f.replace(/^kriva-service-/, "").replace(/\.html$/i, "");
  const source = `/services/${slug}`;
  if (!rewrites.some((r) => r.source === source)) {
    rewrites.push({ source, destination: `/${f}` });
  }
}

const vercel = {
  cleanUrls: false,
  trailingSlash: false,
  rewrites,
};
fs.writeFileSync(path.join(ROOT, "vercel.json"), JSON.stringify(vercel, null, 2) + "\n", "utf8");
console.log("Wrote vercel.json with", rewrites.length, "rewrites");

const serveJs = `#!/usr/bin/env node
/** Local preview with clean-URL rewrites matching production paths. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { FILE_MAP } = require("./_crawl_links.js");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5177);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

function resolveUrl(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (FILE_MAP[clean]) return FILE_MAP[clean];
  if (clean.startsWith("/services/")) {
    const slug = clean.split("/").pop();
    const f = \`kriva-service-\${slug}.html\`;
    if (fs.existsSync(path.join(ROOT, f))) return f;
  }
  if (clean.startsWith("/shared/")) return clean.slice(1);
  if (clean.endsWith(".html") || clean.includes(".")) return clean.replace(/^\\//, "");
  return null;
}

const server = http.createServer((req, res) => {
  const mapped = resolveUrl(req.url || "/");
  if (!mapped) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404</h1><p>No rewrite for " + String(req.url) + "</p>");
    return;
  }
  const filePath = path.join(ROOT, mapped);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log("KRIVA redesign preview → http://localhost:" + PORT + "/");
});
`;
fs.writeFileSync(path.join(ROOT, "serve-preview.js"), serveJs, "utf8");
console.log("Wrote serve-preview.js");
