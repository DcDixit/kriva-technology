/* KRIVA full verification. Single source of truth for the launch report.
   Usage: node _qa_full.cjs [--verbose] */

const fs = require('fs');
const VERBOSE = process.argv.includes('--verbose');

const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f)).sort();
const CSS = ['shared/home.css', 'shared/chrome.css', 'shared/saas.css', 'shared/trucking.css', 'shared/slot-assets.css'];

const strip = (s) => s.replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&middot;/g, '.')
  .replace(/\s+/g, ' ').trim();

/* ── contrast helpers ── */
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const R = {
  pages: files.length,
  brokenLinks: [], brokenAssets: [],
  noCanonical: [], noTitle: [], noDesc: [], noH1: [], multiH1: [],
  dupTitles: [], dupDescs: [],
  ldErrors: [], noLd: [],
  contrast: [], missingAlt: [], emptyAlt: [],
  noDim: [], noLazy: 0,
  headingJumps: [], titleLen: [], descLen: [],
  noindex: [], formIssues: [], dupAssets: [],
};

/* ── 1. page-level metadata + structure ── */
const titles = new Map(), descs = new Map();
const localHrefs = new Map();
const localAssets = new Map();

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');

  const title = (src.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const desc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const canon = (src.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];

  if (!title) R.noTitle.push(f); else {
    const t = strip(title);
    titles.set(t, [...(titles.get(t) || []), f]);
    if (t.length > 62) R.titleLen.push(`${f} (${t.length})`);
  }
  if (!desc) R.noDesc.push(f); else {
    descs.set(desc, [...(descs.get(desc) || []), f]);
    if (desc.length < 70 || desc.length > 160) R.descLen.push(`${f} (${desc.length})`);
  }
  if (!canon) R.noCanonical.push(f);
  if (/<meta[^>]+noindex/i.test(src)) R.noindex.push(f);

  const heads = [...src.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => +m[1]);
  const h1 = heads.filter((l) => l === 1).length;
  if (!h1) R.noH1.push(f);
  if (h1 > 1) R.multiH1.push(`${f} (${h1})`);
  let prev = 0;
  for (const l of heads) {
    if (prev && l > prev + 1) { R.headingJumps.push(`${f} (H${prev}->H${l})`); break; }
    prev = l;
  }

  // images
  for (const m of src.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\balt=/.test(tag)) R.missingAlt.push(`${f}: ${tag.slice(0, 70)}`);
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) R.noDim.push(`${f}: ${(tag.match(/src="([^"]*)"/) || [])[1]}`);
    if (!/loading=/.test(tag)) R.noLazy++;
    const s = (tag.match(/src="([^"]+)"/) || [])[1];
    if (s && s.startsWith('/')) localAssets.set(s, [...(localAssets.get(s) || []), f]);
  }

  // JSON-LD
  const ld = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) R.noLd.push(f);
  for (const m of ld) {
    try { JSON.parse(m[1]); } catch (e) { R.ldErrors.push(`${f}: ${e.message}`); }
  }

  // duplicate shared assets
  for (const [, list] of [['css', [...src.matchAll(/<link[^>]+href="(\/shared\/[^"]+)"/g)]], ['js', [...src.matchAll(/<script[^>]+src="(\/shared\/[^"]+)"/g)]]]) {
    const seen = {};
    for (const mm of list) { seen[mm[1]] = (seen[mm[1]] || 0) + 1; }
    for (const [a, n] of Object.entries(seen)) if (n > 1) R.dupAssets.push(`${f}: ${a} x${n}`);
  }

  // internal links
  for (const m of src.matchAll(/href="(\/[^"#?]*)/g)) localHrefs.set(m[1], [...(localHrefs.get(m[1]) || []), f]);
}

R.dupTitles = [...titles.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => `"${k}" -> ${v.join(', ')}`);
R.dupDescs = [...descs.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => `"${k.slice(0, 50)}..." -> ${v.join(', ')}`);

/* ── 2. link + asset resolution ── */
const { FILE_MAP, resolves } = require('./_crawl_links.js');
for (const [h, from] of localHrefs) {
  if (h === '/' || FILE_MAP[h]) continue;
  if (!resolves(h)) R.brokenLinks.push(`${h} <- ${[...new Set(from)].slice(0, 3).join(', ')}`);
}
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const mediaRules = vercel.rewrites.filter((r) => r.destination.startsWith('/media/'));
for (const [a, from] of localAssets) {
  let disk = a.slice(1);
  for (const r of mediaRules) {
    const base = r.source.split('/:')[0];
    if (a.startsWith(base + '/')) { disk = 'media' + a; break; }
  }
  if (!fs.existsSync(disk)) R.brokenAssets.push(`${a} <- ${[...new Set(from)].slice(0, 2).join(', ')}`);
}

/* ── 3. contrast: every distinct color: value vs the palette backgrounds ── */
const BGS = { paper: '#EAEAE4', 'paper-2': '#F1F1EC', white: '#FFFFFF', ink: '#0E1216' };
const colorUse = new Map();
for (const f of [...files, ...CSS]) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/color\s*:\s*(#[0-9A-Fa-f]{6})/g)) {
    const hex = m[1].toUpperCase();
    colorUse.set(hex, (colorUse.get(hex) || 0) + 1);
  }
}
// a color is a real failure only if it fails against every background it could plausibly sit on
for (const [hex, count] of [...colorUse.entries()].sort((a, b) => b[1] - a[1])) {
  const best = Object.entries(BGS).map(([n, bg]) => ({ n, r: ratio(hex, bg) })).sort((a, b) => b.r - a.r)[0];
  if (best.r < 4.5) {
    R.contrast.push(`${hex} (${count}x) best=${best.r.toFixed(2)}:1 on ${best.n} — below AA 4.5`);
  }
}

/* ── 4. contact form ── */
const contact = fs.readFileSync('kriva-contact.html', 'utf8');
const formBlock = (contact.match(/<form id="briefForm"[\s\S]*?<\/form>/) || [''])[0];
if (!/data-api-endpoint="https?:\/\//.test(contact)) R.formIssues.push('no live endpoint configured');
if (/YOUR_FORM_ID/.test(contact)) R.formIssues.push('Formspree placeholder YOUR_FORM_ID still present (needs real ID)');
const actionM = contact.match(/<form id="briefForm"[^>]*action="([^"]*)"/);
const apiM = contact.match(/data-api-endpoint="([^"]*)"/);
if (actionM && apiM && actionM[1] !== apiM[1]) R.formIssues.push(`action (${actionM[1]}) != data-api-endpoint (${apiM[1]})`);
for (const need of [['novalidate', 'novalidate'], ['honeypot', 'website_hp'], ['aria-live status', 'aria-live'], ['error summary', 'summaryList']]) {
  if (!new RegExp(need[1]).test(contact)) R.formIssues.push(`missing ${need[0]}`);
}
const reqFields = [...formBlock.matchAll(/<(input|select|textarea)\b[^>]*\brequired\b[^>]*>/g)];
const labelled = reqFields.filter((m) => {
  const id = (m[0].match(/id="([^"]+)"/) || [])[1];
  return id && new RegExp(`<label for="${id}"`).test(formBlock);
});
if (reqFields.length !== labelled.length) R.formIssues.push(`${reqFields.length - labelled.length} required field(s) without <label for>`);
if (!/aria-disabled/.test(contact)) R.formIssues.push('no submit lockout (duplicate submission risk)');

/* ── report ── */
const line = (label, val) => {
  const n = Array.isArray(val) ? val.length : val;
  console.log(`${(label + ':').padEnd(34)} ${n}`);
  if (VERBOSE && Array.isArray(val)) val.slice(0, 12).forEach((v) => console.log(`    - ${v}`));
};

console.log('════════ KRIVA VERIFICATION ════════');
line('Pages checked', R.pages);
line('Broken internal links', R.brokenLinks);
line('Broken assets', R.brokenAssets);
line('Missing canonical', R.noCanonical);
line('Missing title', R.noTitle);
line('Missing meta description', R.noDesc);
line('Missing H1', R.noH1);
line('Multiple H1', R.multiH1);
line('Duplicate titles', R.dupTitles);
line('Duplicate descriptions', R.dupDescs);
line('JSON-LD errors', R.ldErrors);
line('Pages without JSON-LD', R.noLd);
line('Contrast failures (AA)', R.contrast);
line('Images missing alt attr', R.missingAlt);
line('Images missing width/height', R.noDim);
line('Images without loading attr', R.noLazy);
line('Heading hierarchy jumps', R.headingJumps);
line('Titles over 62 chars', R.titleLen);
line('Descriptions outside 70-160', R.descLen);
line('Accidental noindex', R.noindex);
line('Duplicate shared assets', R.dupAssets);
line('Form issues', R.formIssues);

const blockers = R.brokenLinks.length + R.brokenAssets.length + R.noCanonical.length + R.noTitle.length
  + R.noDesc.length + R.noH1.length + R.dupTitles.length + R.dupDescs.length + R.ldErrors.length
  + R.contrast.length + R.missingAlt.length + R.noindex.length;
console.log('────────────────────────────────────');
console.log('HARD FAILURES:', blockers);
