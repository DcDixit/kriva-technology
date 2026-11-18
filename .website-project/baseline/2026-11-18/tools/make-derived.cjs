// Derives comparison tables from the preserved crawl. Reads only; writes two new files.
// Usage: node make-derived.cjs <baselineDir> <repoDir>
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const [B, REPO] = process.argv.slice(2);
const pages = JSON.parse(fs.readFileSync(path.join(B, 'crawl/pages.json')));
const O = 'https://krivatechnologies.com';
const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
const P = (u) => u.replace(O, '') || '/';

// contextual inbound links (excluding header/nav/footer) and total inbound
const inb = {}, ctx = {};
pages.forEach((p) => { inb[P(p.url)] = new Set(); ctx[P(p.url)] = new Set(); });
pages.forEach((p) => (p.links || []).forEach((l) => {
  const k = P(l.href.split('#')[0].replace(/\/$/, '')) || '/';
  if (!inb[k] || k === P(p.url)) return;
  inb[k].add(P(p.url)); if (!l.inNav && !l.inFooter) ctx[k].add(P(p.url));
}));
const axeCount = (p, id) => (Array.isArray(p.axe) ? (p.axe.find((v) => v.id === id) || { n: 0 }).n : '');
const cols = ['url', 'status', 'in_sitemap', 'title', 'title_len', 'description', 'desc_len', 'canonical', 'robots', 'h1_count', 'h1', 'words', 'schema_types', 'og_image', 'img_count', 'img_no_alt', 'inbound_links_all', 'inbound_links_contextual', 'outbound_internal_links', 'forms', 'axe_rules_failed', 'axe_color_contrast_nodes', 'axe_total_nodes', 'mobile_h_overflow', 'mobile_tiny_text', 'mobile_small_targets', 'desktop_height_px', 'mobile_height_px', 'local_lcp_ms', 'local_cls', 'console_errors'];
const rows = pages.map((p) => [
  P(p.url), p.status, p.inSitemap, p.title, (p.title || '').length, p.desc, (p.desc || '').length, p.canonical, p.robots || '', p.h1count, (p.h1s || []).join(' | '), p.words,
  [...new Set(p.ldTypes || [])].join(' '), p.og && p.og.image, p.imgCount, p.imgNoAlt, inb[P(p.url)].size, ctx[P(p.url)].size,
  (p.links || []).filter((l) => l.href.startsWith(O)).length, (p.forms || []).map((f) => f.id).join(' '),
  Array.isArray(p.axe) ? p.axe.map((v) => v.id).join(' ') : p.axe, axeCount(p, 'color-contrast'), Array.isArray(p.axe) ? p.axe.reduce((s, v) => s + v.n, 0) : '',
  p.mobile && p.mobile.hOverflow, p.mobile && p.mobile.tinyText, p.mobile && p.mobile.smallTargets, p.pageHeight, p.mobile && p.mobile.height,
  p.perf && p.perf.lcp, p.perf && p.perf.cls, (p.consoleErrors || []).length,
]);
fs.writeFileSync(path.join(B, 'derived/page-summary.csv'), [cols.join(','), ...rows.map((r) => r.map(q).join(','))].join('\n') + '\n');

// live HTML vs commit bfb12ab, per URL
const rewrites = JSON.parse(fs.readFileSync(path.join(REPO, 'vercel.json'))).rewrites || [];
const fileFor = (u) => (rewrites.find((r) => r.source === u) || {}).destination;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
(async () => {
  const out = ['url,source_file,live_sha256,commit_bfb12ab_sha256,match'];
  for (const p of pages) {
    const u = P(p.url), f = (fileFor(u) || '').replace(/^\//, '');
    const live = Buffer.from(await (await fetch(O + u + '?baseline_check=' + Date.now())).arrayBuffer());
    let src = '';
    try { src = execSync(`git -C "${REPO}" show bfb12ab:${f}`, { maxBuffer: 1 << 26 }); } catch (e) { src = null; }
    const a = sha(live), b = src ? sha(src) : 'MISSING';
    out.push([u, f, a, b, a === b].map(q).join(','));
  }
  fs.writeFileSync(path.join(B, 'derived/live-vs-commit-bfb12ab.csv'), out.join('\n') + '\n');
  const m = out.slice(1).filter((l) => l.endsWith('"true"')).length;
  console.log('summary rows', rows.length, '| live==bfb12ab:', m, '/', out.length - 1);
})();
