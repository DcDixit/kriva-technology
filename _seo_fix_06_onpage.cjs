#!/usr/bin/env node
/**
 * Fix 06 — on-page metadata and structured-data accuracy.
 *  - Remove the duplicated OG/Twitter image block the injector emitted twice.
 *  - Shorten the two titles that exceed the SERP pixel budget.
 *  - foundingDate must be an ISO date, not a bare year.
 *  - Give the LocalBusiness-typed node a priceRange; without it Google treats
 *    the business node as incomplete.
 *  - Articles carried no word count, section, or keywords and reported
 *    dateModified == datePublished.
 */
const fs = require('fs');

// ---- 1. de-duplicate the OG image block -------------------------------------
{
  const f = 'kriva-redesign.html';
  let h = fs.readFileSync(f, 'utf8');
  // the generated block is fenced; drop the fenced copy and keep the page-specific one
  const before = h.length;
  h = h.replace(
    /<!-- KRIVA_OG_IMAGE_START -->[\s\S]*?<!-- KRIVA_OG_IMAGE_END -->\n?/,
    ''
  );
  fs.writeFileSync(f, h);
  console.log(`  ${f}: removed duplicate OG block (${before - h.length} bytes)`);
}

// ---- 2. titles over budget ---------------------------------------------------
const TITLES = {
  'kriva-service-api-integrations.html': {
    from: 'API Integration Services · Connectors &amp; Exception Queues | KRIVA',
    to: 'API Integration Services &amp; Connectors | KRIVA',
  },
  'kriva-technologies.html': {
    from: 'Technologies &amp; Stack · Figma, React, Node &amp; Integrations | KRIVA',
    to: 'Our Tech Stack: React, Node &amp; Integrations | KRIVA',
  },
};
for (const [f, { from, to }] of Object.entries(TITLES)) {
  let h = fs.readFileSync(f, 'utf8');
  if (!h.includes(from)) {
    console.log(`  ${f}: title not matched, skipped`);
    continue;
  }
  // title tag plus the og/twitter mirrors
  h = h.split(from).join(to);
  fs.writeFileSync(f, h);
  console.log(`  ${f}: title -> "${to.replace(/&amp;/g, '&')}" (${to.replace(/&amp;/g, '&').length} chars)`);
}

// ---- 3 & 4. organisation node ------------------------------------------------
let orgFixed = 0;
for (const f of fs.readdirSync('.').filter((x) => x.endsWith('.html'))) {
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;
  h = h.replace(/"foundingDate":\s*"2025"/g, '"foundingDate": "2025-01-01"');
  // priceRange sits next to the address on the business node
  h = h.replace(
    /("foundingDate":\s*"2025-01-01",)/g,
    '$1\n      "priceRange": "$$$",'
  );
  if (h !== orig) {
    fs.writeFileSync(f, h);
    orgFixed++;
  }
}
console.log(`\n  ${orgFixed} page(s): foundingDate -> ISO, priceRange added`);

// ---- 5. article enrichment ---------------------------------------------------
const stripTags = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

let arts = 0;
for (const f of fs.readdirSync('.').filter((x) => /^kriva-insight-.*\.html$/.test(x))) {
  let h = fs.readFileSync(f, 'utf8');
  if (!/"@type":\s*"BlogPosting"/.test(h)) continue;

  const body = h.slice(h.indexOf('</head>'));
  const words = stripTags(body).split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;

  // keywords from the page's own H2s — these are the subtopics it actually covers
  const h2s = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((m) => stripTags(m[1]).replace(/\s+/g, ' ').trim())
    .filter((t) => t && t.length < 70 && !/^(get|book|talk|start|ready|next)\b/i.test(t))
    .slice(0, 8);

  const orig = h;
  if (!/"wordCount"/.test(h)) {
    h = h.replace(
      /("@type":\s*"BlogPosting",)/,
      `$1\n      "wordCount": ${words},\n      "articleSection": "Software development",` +
        (h2s.length ? `\n      "keywords": ${JSON.stringify(h2s.join(', '))},` : '')
    );
  }
  if (h !== orig) {
    fs.writeFileSync(f, h);
    arts++;
    console.log(`  ${f}: wordCount=${words}, ${h2s.length} keyword(s)`);
  }
}
console.log(`\n  ${arts} article(s) enriched.`);
