#!/usr/bin/env node
/**
 * Fix 05 — GEO targeting.
 *
 * 1. hreflang reciprocity. The four market pages advertised a cluster whose
 *    x-default was "/", but "/" advertised a self-only cluster. A cluster whose
 *    members disagree is discarded wholesale by Google, so none of the market
 *    targeting was counted. The cluster is now the five market URLs only, and
 *    every member emits the identical block.
 * 2. geo.region carried "IN-GJ" (the studio address) on market pages aimed at
 *    the US/UK/UAE/CA, contradicting the page's own targeting. Each market page
 *    now declares the region it targets; the rest of the site keeps the studio
 *    location, which is where the company actually is.
 */
const fs = require('fs');

const ORIGIN = 'https://krivatechnologies.com';
const MARKETS = {
  'kriva-market-us.html': { path: '/markets/us', region: 'US', place: 'United States', locale: 'en_US' },
  'kriva-market-uk.html': { path: '/markets/uk', region: 'GB', place: 'United Kingdom', locale: 'en_GB' },
  'kriva-market-uae.html': { path: '/markets/uae', region: 'AE', place: 'United Arab Emirates', locale: 'en_AE' },
  'kriva-market-ca.html': { path: '/markets/ca', region: 'CA', place: 'Canada', locale: 'en_CA' },
  'kriva-markets-index.html': { path: '/markets', region: null, place: null, locale: 'en_US' },
};

// identical block on every cluster member, x-default on the locale-neutral hub
const CLUSTER = [
  `<link rel="alternate" hreflang="en-US" href="${ORIGIN}/markets/us">`,
  `<link rel="alternate" hreflang="en-GB" href="${ORIGIN}/markets/uk">`,
  `<link rel="alternate" hreflang="en-AE" href="${ORIGIN}/markets/uae">`,
  `<link rel="alternate" hreflang="en-CA" href="${ORIGIN}/markets/ca">`,
  `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/markets">`,
].join('\n');

for (const [file, cfg] of Object.entries(MARKETS)) {
  let h = fs.readFileSync(file, 'utf8');

  // drop every existing hreflang link, then re-insert the canonical cluster once
  h = h.replace(/[ \t]*<link[^>]+hreflang=[^>]*>\n?/gi, '');
  h = h.replace(
    /(<meta name="geo\.region"[^>]*>)/i,
    `${CLUSTER}\n$1`
  );

  if (cfg.region) {
    h = h.replace(/<meta name="geo\.region"[^>]*>/i, `<meta name="geo.region" content="${cfg.region}">`);
    h = h.replace(
      /<meta name="geo\.placename"[^>]*>/i,
      `<meta name="geo.placename" content="${cfg.place}">`
    );
    // the page targets one country; say so instead of repeating the global list
    h = h.replace(/<meta name="target"[^>]*>/i, `<meta name="target" content="${cfg.region}">`);
    h = h.replace(/<meta name="coverage"[^>]*>/i, `<meta name="coverage" content="${cfg.place}">`);
  }

  fs.writeFileSync(file, h);
  console.log(`  ${file.padEnd(28)} -> cluster + geo.region=${cfg.region || '(hub, unchanged)'}`);
}

// Non-market pages: a self-only en + x-default pair is a no-op cluster, but the
// old markets block pointed x-default at "/", so "/" must not contradict it.
// Every other page keeps a self-referencing "en" and drops the bogus x-default.
let cleaned = 0;
for (const f of fs.readdirSync('.').filter((x) => x.endsWith('.html'))) {
  if (MARKETS[f] || f === '404.html') continue;
  const src = fs.readFileSync(f, 'utf8');
  const out = src.replace(/[ \t]*<link[^>]+hreflang=["']x-default["'][^>]*>\n?/gi, '');
  if (out !== src) {
    fs.writeFileSync(f, out);
    cleaned++;
  }
}
console.log(`\n  ${cleaned} non-market page(s): removed self-only x-default claim.`);
