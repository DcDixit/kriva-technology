#!/usr/bin/env node
/**
 * Full SEO + GEO audit for the static KRIVA site.
 * Reads vercel.json to map each .html file to its public URL, then checks
 * head metadata, headings, schema, links, images, and crawl artefacts.
 * Usage: node _seo_audit.cjs [--json]
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// schema.org types this site legitimately uses; anything outside the vocabulary
// makes Google drop the whole node
const SCHEMA_TYPES = new Set([
  'Organization', 'ProfessionalService', 'LocalBusiness', 'Corporation', 'WebSite', 'WebPage',
  'AboutPage', 'ContactPage', 'CollectionPage', 'FAQPage', 'QAPage', 'BreadcrumbList', 'ListItem',
  'ItemList', 'Article', 'BlogPosting', 'NewsArticle', 'TechArticle', 'Blog', 'CreativeWork',
  'Service', 'Offer', 'OfferCatalog', 'AggregateOffer', 'Product', 'Question', 'Answer',
  'Person', 'ImageObject', 'VideoObject', 'PostalAddress', 'ContactPoint', 'Country', 'Place',
  'GeoCoordinates', 'SpeakableSpecification', 'SearchAction', 'EntryPoint', 'Review', 'Rating',
  'AggregateRating', 'HowTo', 'HowToStep', 'JobPosting', 'SiteNavigationElement', 'Brand',
  'DefinedTerm', 'DefinedTermSet', 'Occupation', 'EmployeeRole', 'MonetaryAmount', 'Audience',
]);

const ROOT = __dirname;
const ORIGIN = 'https://krivatechnologies.com';
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

// file -> public path, from the rewrites table
const fileToUrl = new Map();
const urlToFile = new Map();
for (const r of vercel.rewrites) {
  if (r.destination.endsWith('.html')) {
    const f = r.destination.replace(/^\//, '');
    fileToUrl.set(f, r.source);
    urlToFile.set(r.source, f);
  }
}
const redirectSources = new Set(vercel.redirects.map((r) => r.source));

const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

const issues = [];
const add = (sev, cat, page, msg) => issues.push({ sev, cat, page, msg });

// ---------- helpers ----------
const rx = {
  head: /<head[\s\S]*?<\/head>/i,
  title: /<title[^>]*>([\s\S]*?)<\/title>/i,
  canonical: /<link[^>]+rel=["']canonical["'][^>]*>/gi,
  href: /href=["']([^"']+)["']/i,
  // quote-aware: the value may itself contain the *other* quote char (e.g. apostrophes)
  content: /content=(["'])([\s\S]*?)\1/i,
};
const metaAll = (head, name) => {
  const out = [];
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, 'gi');
  let m;
  while ((m = re.exec(head))) {
    const c = m[0].match(rx.content);
    out.push(c ? c[2] : '');
  }
  return out;
};
const decode = (s) =>
  String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const stripNonContent = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

// ---------- per-page collection ----------
const pages = [];
const titles = new Map();
const descs = new Map();
const h1map = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const headM = html.match(rx.head);
  const head = headM ? headM[0] : '';
  const body = html.slice(head.length);
  const url = fileToUrl.get(file) || (file === '404.html' ? '/404' : null);

  const p = {
    file,
    url,
    bytes: html.length,
    title: decode((html.match(rx.title) || [, ''])[1]),
    desc: decode(metaAll(head, 'description')[0] || ''),
    descCount: metaAll(head, 'description').length,
    robots: metaAll(head, 'robots')[0] || '',
    ogTitle: metaAll(head, 'og:title'),
    ogDesc: metaAll(head, 'og:description'),
    ogImage: metaAll(head, 'og:image'),
    ogUrl: metaAll(head, 'og:url')[0] || '',
    twCard: metaAll(head, 'twitter:card'),
    twImage: metaAll(head, 'twitter:image'),
    canonicals: (head.match(rx.canonical) || []).map((t) => (t.match(rx.href) || [, ''])[1]),
    hreflang: [...head.matchAll(/<link[^>]+hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi)].map(
      (m) => ({ lang: m[1], href: m[2] })
    ),
    head,
    body,
    html,
  };

  // headings
  p.h1 = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    decode(m[1].replace(/<[^>]+>/g, ' '))
  );
  // headings inside decorative product mockups (role="img" / aria-hidden) are not
  // part of the document outline
  const outline = stripNonContent(body)
    .replace(/<([a-z]+)[^>]*\b(?:role=["']img["']|aria-hidden=["']true["'])[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  p.headingSeq = [...outline.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    lvl: +m[1],
    text: decode(m[2].replace(/<[^>]+>/g, ' ')),
  }));

  // JSON-LD
  p.schemas = [];
  for (const m of head.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      p.schemas.push(JSON.parse(m[1]));
    } catch (e) {
      add('HIGH', 'schema', file, `Invalid JSON-LD: ${e.message}`);
    }
  }
  for (const m of body.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      p.schemas.push(JSON.parse(m[1]));
    } catch (e) {
      add('HIGH', 'schema', file, `Invalid JSON-LD (body): ${e.message}`);
    }
  }
  p.schemaTypes = [];
  const walkType = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walkType);
    if (n['@type']) p.schemaTypes.push(...[].concat(n['@type']));
    if (n['@graph']) walkType(n['@graph']);
  };
  p.schemas.forEach(walkType);

  // images
  p.imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  // links
  p.links = [...body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((m) => {
    // an image-only link takes its accessible name (and its anchor signal) from alt
    const alts = [...m[2].matchAll(/<img[^>]*\balt=(["'])([\s\S]*?)\1/gi)].map((a) => a[2]).join(' ');
    return {
      href: m[1],
      text: decode(m[2].replace(/<[^>]+>/g, ' ')) || decode(alts),
      tag: m[0],
    };
  });
  // word count of visible body text
  p.words = stripNonContent(body)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter((w) => /[a-z]/i.test(w)).length;

  // render-blocking assets
  p.cssLinks = [...head.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map(
    (m) => m[1]
  );
  p.syncScripts = [...head.matchAll(/<script\b(?![^>]*(?:async|defer|type=["']application\/ld))[^>]*src=["']([^"']+)["']/gi)].map(
    (m) => m[1]
  );

  pages.push(p);

  if (p.url) {
    const tk = p.title.toLowerCase();
    if (!titles.has(tk)) titles.set(tk, []);
    titles.get(tk).push(p.url);
    const dk = p.desc.toLowerCase();
    if (!descs.has(dk)) descs.set(dk, []);
    descs.get(dk).push(p.url);
    const hk = (p.h1[0] || '').toLowerCase();
    if (!h1map.has(hk)) h1map.set(hk, []);
    h1map.get(hk).push(p.url);
  }
}

// ---------- checks ----------
const indexable = pages.filter((p) => p.url && p.file !== '404.html');

for (const p of indexable) {
  const id = p.url;
  // title
  if (!p.title) add('CRITICAL', 'on-page', id, 'Missing <title>');
  else {
    if (p.title.length > 62) add('MEDIUM', 'on-page', id, `Title ${p.title.length} chars (truncates in SERP): "${p.title}"`);
    if (p.title.length < 25) add('MEDIUM', 'on-page', id, `Title only ${p.title.length} chars: "${p.title}"`);
  }
  // description
  if (!p.desc) add('CRITICAL', 'on-page', id, 'Missing meta description');
  else {
    if (p.desc.length > 165) add('MEDIUM', 'on-page', id, `Meta description ${p.desc.length} chars (truncates)`);
    if (p.desc.length < 70) add('MEDIUM', 'on-page', id, `Meta description only ${p.desc.length} chars (thin)`);
  }
  if (p.descCount > 1) add('HIGH', 'on-page', id, `${p.descCount} meta description tags (conflicting)`);

  // canonical
  if (p.canonicals.length === 0) add('CRITICAL', 'technical', id, 'Missing canonical');
  else if (p.canonicals.length > 1)
    add('CRITICAL', 'technical', id, `${p.canonicals.length} canonical tags: ${p.canonicals.join(' | ')}`);
  else {
    const expect = ORIGIN + (p.url === '/' ? '/' : p.url);
    if (p.canonicals[0] !== expect)
      add('CRITICAL', 'technical', id, `Canonical mismatch. Found "${p.canonicals[0]}", expected "${expect}"`);
  }

  // og:url must match canonical
  if (p.ogUrl && p.canonicals[0] && p.ogUrl !== p.canonicals[0])
    add('LOW', 'on-page', id, `og:url (${p.ogUrl}) != canonical (${p.canonicals[0]})`);

  // duplicated OG/twitter tags
  if (p.ogImage.length > 1) add('LOW', 'on-page', id, `${p.ogImage.length} og:image tags (duplicate block)`);
  if (p.twCard.length > 1) add('LOW', 'on-page', id, `${p.twCard.length} twitter:card tags (duplicate block)`);
  if (p.twImage.length > 1) add('LOW', 'on-page', id, `${p.twImage.length} twitter:image tags (duplicate block)`);
  if (p.ogTitle.length === 0) add('MEDIUM', 'on-page', id, 'Missing og:title');
  if (p.ogImage.length === 0) add('MEDIUM', 'on-page', id, 'Missing og:image');

  // robots
  if (/noindex/i.test(p.robots)) add('CRITICAL', 'indexing', id, `Page is noindex: "${p.robots}"`);

  // headings
  if (p.h1.length === 0) add('HIGH', 'on-page', id, 'No <h1>');
  if (p.h1.length > 1) add('MEDIUM', 'on-page', id, `${p.h1.length} <h1> tags: ${p.h1.join(' | ').slice(0, 140)}`);
  let prev = 0;
  const skips = [];
  for (const h of p.headingSeq) {
    if (prev && h.lvl > prev + 1) skips.push(`h${prev}->h${h.lvl} ("${h.text.slice(0, 40)}")`);
    prev = h.lvl;
  }
  if (skips.length) add('LOW', 'on-page', id, `${skips.length} heading-level skips: ${skips.slice(0, 3).join(', ')}`);

  // content depth
  if (p.words < 300) add('HIGH', 'content', id, `Thin content: ~${p.words} words`);
  else if (p.words < 600) add('MEDIUM', 'content', id, `Shallow content: ~${p.words} words`);

  // schema
  if (p.schemaTypes.length === 0) add('HIGH', 'schema', id, 'No JSON-LD structured data');
  if (!p.schemaTypes.includes('BreadcrumbList') && p.url !== '/')
    add('MEDIUM', 'schema', id, 'No BreadcrumbList schema');

  // images
  let contentImg = 0;
  p.imgs.forEach((t, i) => {
    if (!/mark-logo/.test(t)) contentImg++;
    if (!/\balt=/i.test(t)) add('MEDIUM', 'a11y-seo', id, `img #${i + 1} missing alt: ${t.slice(0, 110)}`);
    if (!/\bwidth=/i.test(t) || !/\bheight=/i.test(t))
      add('MEDIUM', 'cwv', id, `img #${i + 1} missing width/height (CLS): ${t.slice(0, 110)}`);
    // the first two in-content images are above the fold; they must NOT be lazy
    if (contentImg > 2 && !/mark-logo/.test(t) && !/\bloading=/i.test(t))
      add('LOW', 'cwv', id, `below-fold img #${i + 1} not lazy: ${t.slice(0, 90)}`);
    if (contentImg === 1 && /loading=["']lazy/i.test(t))
      add('HIGH', 'cwv', id, `LCP image is lazy-loaded: ${t.slice(0, 110)}`);
  });
  // oversized raster payload
  let imgBytes = 0;
  for (const m of p.body.matchAll(/src=["'](\/(?:media|brand)\/[^"'?]+\.(?:png|jpe?g|webp|avif))/gi)) {
    const fp = m[1].replace(/^\//, '');
    if (fs.existsSync(fp)) imgBytes += fs.statSync(fp).size;
  }
  if (imgBytes > 1024 * 1024)
    add('HIGH', 'cwv', id, `${Math.round(imgBytes / 1024)} KB of images referenced (mobile LCP risk)`);

  // render blocking — measured as compressed transfer, since Vercel serves brotli over h2
  let cssRaw = 0;
  for (const c of p.cssLinks) {
    const fp = c.split('?')[0].replace(/^\//, '');
    if (fs.existsSync(fp)) cssRaw += fs.statSync(fp).size;
    else add('CRITICAL', 'technical', id, `Stylesheet 404s: ${c}`);
    if (!c.startsWith('/') && !/^https?:/.test(c))
      add('CRITICAL', 'technical', id, `Relative stylesheet href "${c}" resolves off-path on nested URLs`);
  }
  const cssGz = zlib.gzipSync(
    Buffer.concat(
      p.cssLinks
        .map((c) => c.split('?')[0].replace(/^\//, ''))
        .filter((fp) => fs.existsSync(fp))
        .map((fp) => fs.readFileSync(fp))
    )
  ).length;
  if (cssGz > 40 * 1024)
    add('HIGH', 'cwv', id, `${Math.round(cssGz / 1024)} KB compressed render-blocking CSS across ${p.cssLinks.length} files`);
  else if (p.cssLinks.length > 6)
    add('LOW', 'cwv', id, `${p.cssLinks.length} stylesheets (${Math.round(cssGz / 1024)} KB gz) — fine over h2, but could be bundled`);
  if (p.syncScripts.length)
    add('HIGH', 'cwv', id, `${p.syncScripts.length} render-blocking script(s): ${p.syncScripts.join(', ')}`);

  // relative asset paths anywhere in the page
  for (const m of p.html.matchAll(/(?:href|src)=["'](?!\/|https?:|data:|mailto:|tel:|#)((?:shared|brand|media)\/[^"']+)["']/gi))
    add('CRITICAL', 'technical', id, `Relative asset path "${m[1]}" 404s on nested clean URLs`);

  // invalid schema.org types
  for (const t of new Set(p.schemaTypes))
    if (!SCHEMA_TYPES.has(t)) add('HIGH', 'schema', id, `"${t}" is not a schema.org type — Google discards the node`);

  // hreflang self-reference
  if (p.hreflang.length) {
    const selfExpect = ORIGIN + (p.url === '/' ? '/' : p.url);
    if (!p.hreflang.some((h) => h.href === selfExpect))
      add('HIGH', 'geo', id, 'hreflang block has no self-referencing entry (cluster is invalid)');
  }
}

// hreflang reciprocity: every member of a cluster must advertise the identical set,
// or Google discards the whole cluster
{
  const sig = (p) =>
    p.hreflang
      .map((h) => h.lang.toLowerCase() + '=' + h.href)
      .sort()
      .join('|');
  const clusters = new Map();
  for (const p of indexable) {
    if (!p.hreflang.length) continue;
    const members = p.hreflang.map((h) => h.href).sort().join('|');
    if (!clusters.has(members)) clusters.set(members, []);
    clusters.get(members).push(p);
  }
  for (const p of indexable) {
    if (!p.hreflang.length) continue;
    const selfUrl = ORIGIN + (p.url === '/' ? '/' : p.url);
    for (const h of p.hreflang) {
      if (h.href === selfUrl) continue;
      const other = indexable.find((q) => ORIGIN + (q.url === '/' ? '/' : q.url) === h.href);
      if (!other) {
        add('HIGH', 'geo', p.url, `hreflang points at ${h.href}, which is not an indexable page`);
        continue;
      }
      if (sig(other) !== sig(p))
        add('HIGH', 'geo', p.url, `hreflang not reciprocal with ${other.url} (cluster discarded by Google)`);
    }
  }
}

// duplicates
for (const [t, urls] of titles) if (t && urls.length > 1) add('HIGH', 'duplicate', urls.join(', '), `Duplicate <title>: "${t}"`);
for (const [d, urls] of descs) if (d && urls.length > 1) add('HIGH', 'duplicate', urls.join(', '), `Duplicate meta description: "${d.slice(0, 80)}..."`);
for (const [h, urls] of h1map) if (h && urls.length > 1) add('MEDIUM', 'duplicate', urls.join(', '), `Duplicate H1: "${h}"`);

// ---------- link graph ----------
const validUrls = new Set([...urlToFile.keys()]);
const staticFiles = new Set();
const walk = (d, base = '') => {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(d, e.name), base);
    else staticFiles.add('/' + path.join(d, e.name).replace(/\\/g, '/'));
  }
};
['shared', 'brand', 'media'].forEach((d) => fs.existsSync(path.join(ROOT, d)) && walk(d));
for (const f of fs.readdirSync(ROOT)) if (fs.statSync(path.join(ROOT, f)).isFile()) staticFiles.add('/' + f);

const inboundLinks = new Map([...validUrls].map((u) => [u, 0]));
const brokenSeen = new Set();
for (const p of indexable) {
  const internalTargets = new Set();
  for (const l of p.links) {
    const href = l.href.trim();
    if (/^(https?:|mailto:|tel:|#|javascript:|data:)/i.test(href)) {
      if (/^https?:\/\/(www\.)?krivatechnologies\.com/i.test(href)) {
        add('LOW', 'internal-link', p.url, `Absolute internal link (should be relative): ${href}`);
      }
      if (/^https?:/i.test(href) && !/krivatechnologies\.com/i.test(href)) {
        if (!/rel=["'][^"']*nofollow/i.test(l.tag) && !/rel=["'][^"']*noopener/i.test(l.tag))
          add('LOW', 'internal-link', p.url, `External link without rel: ${href}`);
      }
      continue;
    }
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (validUrls.has(clean)) {
      internalTargets.add(clean);
      inboundLinks.set(clean, inboundLinks.get(clean) + 1);
      // a bare country token is a legitimate anchor for a market page
      const geoAnchor = /^\/markets\//.test(clean) && /^(US|UK|UAE|CA|EU)$/i.test(l.text);
      if ((!l.text || l.text.length < 3) && !geoAnchor) {
        if (!/aria-label=/i.test(l.tag))
          add('LOW', 'internal-link', p.url, `Empty/!descriptive anchor text -> ${clean}`);
      } else if (/^(click here|read more|learn more|here|more)$/i.test(l.text)) {
        add('LOW', 'internal-link', p.url, `Generic anchor text "${l.text}" -> ${clean}`);
      }
    } else if (redirectSources.has(clean)) {
      add('MEDIUM', 'internal-link', p.url, `Internal link points at a 301 redirect: ${clean}`);
    } else if (staticFiles.has(clean)) {
      // asset link, fine
    } else {
      const key = p.url + '|' + clean;
      if (!brokenSeen.has(key)) {
        brokenSeen.add(key);
        add('HIGH', 'broken-link', p.url, `Broken internal link: ${clean}`);
      }
    }
  }
  p.outDegree = internalTargets.size;
  if (internalTargets.size < 5) add('MEDIUM', 'internal-link', p.url, `Only ${internalTargets.size} unique internal links out (weak hub)`);
}
for (const [u, n] of inboundLinks) {
  if (n === 0) add('HIGH', 'internal-link', u, 'ORPHAN: zero internal inbound links');
  else if (n < 3) add('MEDIUM', 'internal-link', u, `Only ${n} internal inbound link(s)`);
}

// ---------- sitemap ----------
const smRaw = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const smUrls = [...smRaw.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const smPaths = new Set(smUrls.map((u) => u.replace(ORIGIN, '') || '/'));
for (const u of validUrls) if (!smPaths.has(u)) add('HIGH', 'sitemap', u, 'Live page missing from sitemap.xml');
for (const u of smPaths) if (!validUrls.has(u)) add('HIGH', 'sitemap', u, 'sitemap.xml lists a URL with no route');
const dupSm = smUrls.filter((u, i) => smUrls.indexOf(u) !== i);
if (dupSm.length) add('MEDIUM', 'sitemap', 'sitemap.xml', `Duplicate entries: ${[...new Set(dupSm)].join(', ')}`);

// ---------- robots ----------
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (!/Sitemap:/i.test(robots)) add('HIGH', 'technical', 'robots.txt', 'No Sitemap directive');
for (const m of robots.matchAll(/^(?!#)([A-Za-z-]+):/gm)) {
  const d = m[1].toLowerCase();
  if (!['user-agent', 'allow', 'disallow', 'sitemap', 'crawl-delay', 'host'].includes(d))
    add('LOW', 'technical', 'robots.txt', `Non-standard directive "${m[1]}:" (ignored by crawlers)`);
}

// ---------- redirects / config ----------
if (!vercel.headers) {
  add('HIGH', 'cwv', 'vercel.json', 'No headers block: static assets served without Cache-Control');
} else {
  const cached = vercel.headers
    .filter((h) => h.headers.some((x) => x.key.toLowerCase() === 'cache-control'))
    .map((h) => h.source);
  for (const dir of ['/media/', '/brand/', '/shared/'])
    if (!cached.some((s) => s.startsWith(dir)))
      add('HIGH', 'cwv', 'vercel.json', `No Cache-Control rule covering ${dir}`);
}
const redirDest = new Set(vercel.redirects.map((r) => r.destination));
for (const r of vercel.redirects) {
  if (redirectSources.has(r.destination)) add('HIGH', 'redirect', r.source, `Redirect chain: ${r.source} -> ${r.destination} -> ...`);
}
// .html reachable without redirect?
for (const f of htmlFiles) {
  if (f === '404.html') continue;
  if (!redirectSources.has('/' + f)) add('HIGH', 'duplicate', '/' + f, 'Raw .html URL has no 301 to the clean URL (duplicate content path)');
}

// ---------- output ----------
const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
issues.sort((a, b) => order[a.sev] - order[b.sev] || a.cat.localeCompare(b.cat) || a.page.localeCompare(b.page));

if (process.argv.includes('--json')) {
  fs.writeFileSync(path.join(ROOT, '_seo_audit_results.json'), JSON.stringify({ issues, pages: pages.map(({ head, body, html, ...r }) => r) }, null, 2));
}

const bySev = {};
const byCat = {};
for (const i of issues) {
  bySev[i.sev] = (bySev[i.sev] || 0) + 1;
  byCat[i.cat] = (byCat[i.cat] || 0) + 1;
}
console.log('='.repeat(78));
console.log(`SEO + GEO AUDIT — ${indexable.length} indexable pages, ${issues.length} issues`);
console.log('='.repeat(78));
console.log('By severity:', JSON.stringify(bySev));
console.log('By category:', JSON.stringify(byCat));
console.log('');
let lastCat = '';
for (const i of issues) {
  if (i.cat !== lastCat) {
    console.log(`\n--- ${i.cat.toUpperCase()} ---`);
    lastCat = i.cat;
  }
  console.log(`[${i.sev}] ${i.page}: ${i.msg}`);
}
