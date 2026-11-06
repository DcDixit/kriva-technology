#!/usr/bin/env node
/**
 * Fix 11, per-page OG images.
 * Every article, case study and market page shared brand/og-default.png, so
 * social and AI surfaces had nothing to distinguish them. This renders one image
 * per page from the same wordmark geometry and palette as _build_og.cjs, using
 * the page's own H1 as the headline, then points og:image / twitter:image and
 * the JSON-LD image at it.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ORIGIN = 'https://krivatechnologies.com';
const OUT_DIR = path.join(__dirname, 'brand', 'og');
fs.mkdirSync(OUT_DIR, { recursive: true });

const INK = '#0E1216';
const AMBER = '#DB9B1F';
const DIM = '#8C98A4';
const FONT = 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif';

// full logo read from the master file; 0.45 scale puts its top-left at (80,70)
const LOGO_ART = fs.readFileSync(path.join(__dirname, 'brand/logos/kriva-lockup-inverse.svg'), 'utf8').match(/<g[\s\S]*<\/svg>/)[0].replace('</svg>', '');
const WORDMARK = `<g transform="translate(${80 - 10.5 * 0.45},${70 - 6.3 * 0.45}) scale(0.45)">${LOGO_ART}</g>`;

const esc = (s) =>
 String(s)
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;');

// crude but adequate advance-width model for a grotesque at a given size
const WIDE = 'MWQ@%&';
const NARROW = 'iljtfrI.,;:\'!|() ';
const widthOf = (text, size) => {
 let w = 0;
 for (const c of text) w += WIDE.includes(c) ? size * 0.82 : NARROW.includes(c) ? size * 0.30 : size * 0.54;
 return w;
};

function wrap(text, size, maxW, maxLines) {
 const words = text.split(/\s+/);
 const lines = [];
 let cur = '';
 for (const word of words) {
 const next = cur ? cur + ' ' + word : word;
 if (widthOf(next, size) > maxW && cur) {
 lines.push(cur);
 cur = word;
 if (lines.length === maxLines) break;
 } else cur = next;
 }
 if (lines.length < maxLines && cur) lines.push(cur);
 if (lines.length === maxLines) {
 // if anything was dropped, ellipsise the last line
 const used = lines.join(' ');
 if (used.length < text.length - 1) {
 let last = lines[maxLines - 1];
 while (widthOf(last + '…', size) > maxW && last.includes(' ')) last = last.slice(0, last.lastIndexOf(' '));
 lines[maxLines - 1] = last + '…';
 }
 }
 return lines;
}

function buildSvg(kicker, headline, footer) {
 let size = 58;
 let lines = wrap(headline, size, 1000, 4);
 while (lines.length > 3 && size > 40) {
 size -= 4;
 lines = wrap(headline, size, 1000, 4);
 }
 const lh = Math.round(size * 1.16);
 const blockH = lines.length * lh;
 const top = 300 - blockH / 2 + size * 0.78;

 const text = lines
 .map((l, i) => `<text x="80" y="${Math.round(top + i * lh)}" fill="#FFFFFF" font-family="${FONT}" font-size="${size}" font-weight="700">${esc(l)}</text>`)
 .join('\n ');

 return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <rect width="1200" height="630" fill="${INK}"/>
 <rect x="80" y="52" width="48" height="1" fill="${AMBER}"/>
 ${WORDMARK}
 <text x="80" y="212" fill="${AMBER}" font-family="${FONT}" font-size="17" font-weight="600" letter-spacing="3.5">${esc(kicker.toUpperCase())}</text>
 ${text}
 <rect x="80" y="545" width="1040" height="1" fill="#232B33"/>
 <text x="80" y="583" fill="${DIM}" font-family="${FONT}" font-size="17" letter-spacing="2.5">${esc(footer)}</text>
</svg>`;
}

// ---- which pages get their own image -------------------------------------
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const fileToUrl = new Map();
for (const r of vercel.rewrites)
 if (r.destination.endsWith('.html')) fileToUrl.set(r.destination.replace(/^\//, ''), r.source);

const kickerFor = (file) => {
 if (/^kriva-insight-/.test(file)) return 'Guide';
 if (/^kriva-case-/.test(file)) return 'Case study';
 if (/^kriva-market-/.test(file)) return 'Market';
 return null;
};

const decode = (s) =>
 s
 .replace(/<[^>]+>/g, ' ')
 .replace(/&amp;/g, '&')
 .replace(/&quot;/g, '"')
 .replace(/&#39;/g, "'")
 .replace(/&nbsp;/g, ' ')
 .replace(/&[a-z]+;/g, ' ')
 .replace(/\s+/g, ' ')
 .trim();

let made = 0;
for (const [file, url] of fileToUrl) {
 const kicker = kickerFor(file);
 if (!kicker) continue;

 let h = fs.readFileSync(file, 'utf8');
 const h1 = decode((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1]);
 if (!h1) {
 console.log(' no h1, skipped: ' + file);
 continue;
 }

 const slug = url.replace(/^\//, '').replace(/\//g, '-');
 const rel = `/brand/og/${slug}.png`;
 const abs = ORIGIN + rel;

 const svg = buildSvg(kicker, h1, 'krivatechnologies.com');
 const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true } })
 .render()
 .asPng();
 fs.writeFileSync(path.join(OUT_DIR, slug + '.png'), png);

 // repoint every reference to the shared default on this page
 const before = h;
 h = h.replace(
 /(<meta property="og:image" content=")[^"]*(")/g, `$1${abs}$2`
 );
 h = h.replace(/(<meta name="twitter:image" content=")[^"]*(")/g, `$1${abs}$2`);
 h = h.replace(
 /(<meta property="og:image:alt" content=")[^"]*(")/g, `$1${esc(kicker + ' · ' + h1)}$2`
 );
 // JSON-LD image on the page-level node only (leave the org node's brand image alone)
 h = h.replace(
 /("@type": "(?:BlogPosting|CreativeWork)",[\s\S]{0,900}?"image": ")[^"]*(")/g, `$1${abs}$2`
 );

 fs.writeFileSync(file, h);
 made++;
 console.log(
 ` ${String(Math.round(png.length / 1024)).padStart(3)} KB ${rel.padEnd(42)} "${h1.slice(0, 52)}"`
 );
 if (h === before) console.log(' (warning: no meta references updated)');
}
console.log(`\n ${made} OG image(s) generated into brand/og/.`);
