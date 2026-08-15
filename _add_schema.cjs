/* 1. WebPage / CollectionPage schema for the four pages that had none.
   2. BreadcrumbList for every page with genuine URL hierarchy (/services/x, /solutions/x,
      /work/x, /insights/x). Names come from each page's own H1, so nothing is invented.
   Idempotent via the KRIVA_SCHEMA markers. */

const fs = require('fs');
const dry = process.argv.includes('--dry');
const ORIGIN = 'https://krivatechnologies.com';
const START = '<!-- KRIVA_SCHEMA_START -->';
const END = '<!-- KRIVA_SCHEMA_END -->';

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const routeOf = {};
for (const r of vercel.rewrites) {
  if (r.source.includes(':')) continue;
  routeOf[r.destination.replace(/^\//, '')] = r.source;
}

const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&rsquo;/g, "'")
  .replace(/&middot;/g, '·').replace(/\s+/g, ' ').trim();

const SECTIONS = {
  '/services/': ['Services', '/services'],
  '/solutions/': ['Solutions', '/solutions'],
  '/work/': ['Work', '/work'],
  '/insights/': ['Insights', '/insights'],
};

const STANDALONE = {
  'kriva-privacy.html': { type: 'WebPage', name: 'Privacy Policy' },
  'kriva-terms.html': { type: 'WebPage', name: 'Terms & Conditions' },
  'kriva-technologies.html': { type: 'WebPage', name: 'Tools & Stack' },
  'kriva-solutions-index.html': { type: 'CollectionPage', name: 'Solutions' },
};

let added = 0;
const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const route = routeOf[file];
  if (!route) { console.log(`  no route for ${file}`); continue; }

  const h1 = strip((src.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
  const desc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const blocks = [];

  /* breadcrumbs */
  const hit = Object.entries(SECTIONS).find(([p]) => route.startsWith(p));
  if (hit) {
    const [, [label, hubUrl]] = hit;
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' },
        { '@type': 'ListItem', position: 2, name: label, item: ORIGIN + hubUrl },
        { '@type': 'ListItem', position: 3, name: h1 || label, item: ORIGIN + route },
      ],
    });
  }

  /* page node for the four that had none */
  if (STANDALONE[file]) {
    const s = STANDALONE[file];
    const node = {
      '@context': 'https://schema.org',
      '@type': s.type,
      name: s.name,
      url: ORIGIN + route,
      isPartOf: { '@id': ORIGIN + '/#website' },
      publisher: { '@id': ORIGIN + '/#organization' },
    };
    if (desc) node.description = desc.replace(/&amp;/g, '&');
    if (s.type === 'CollectionPage') {
      node.mainEntity = {
        '@type': 'ItemList',
        itemListElement: [
          ['Trucking & logistics', '/solutions/trucking-logistics'],
          ['SaaS products', '/solutions/saas'],
          ['QuickBooks & Xero integrations', '/solutions/accounting-integrations'],
          ['Car transportation', '/solutions/car-transportation'],
        ].map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, url: ORIGIN + url })),
      };
    }
    blocks.push(node);
  }

  if (!blocks.length) continue;

  const payload = START + '\n'
    + blocks.map((b) => '<script type="application/ld+json">\n' + JSON.stringify(b, null, 2) + '\n</script>').join('\n')
    + '\n' + END;

  let out;
  if (src.includes(START)) {
    out = src.replace(new RegExp(`${START}[\\s\\S]*?${END}`), payload);
  } else {
    out = src.replace(/<\/body>/, payload + '\n</body>');
  }

  if (out !== src) {
    if (!dry) fs.writeFileSync(file, out);
    added++;
  }
}

console.log(`${dry ? 'would update' : 'updated'} ${added} pages with breadcrumb / page schema`);
