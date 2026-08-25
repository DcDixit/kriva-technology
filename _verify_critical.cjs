const fs = require('fs');

const files = fs.readdirSync('.').filter((f) => /^kriva-.*\.html$/.test(f));

let blocks = 0;
let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(src))) {
    blocks++;
    try {
      JSON.parse(m[1]);
    } catch (e) {
      bad++;
      console.log('  BAD JSON-LD in', f, '->', e.message);
    }
  }
}
console.log('JSON-LD blocks parsed:', blocks, '| invalid:', bad);

const home = fs.readFileSync('kriva-redesign.html', 'utf8');
console.log('homepage JSON-LD blocks:', (home.match(/application\/ld\+json/g) || []).length);
console.log('pages missing icon block:', files.filter((f) => !fs.readFileSync(f, 'utf8').includes('KRIVA_ICONS_START')).length, '/', files.length);
console.log('pages missing tokens.css:', files.filter((f) => !fs.readFileSync(f, 'utf8').includes('href="/shared/tokens.css"')).length, '/', files.length);
console.log('duplicate :root blocks:', files.reduce((n, f) => n + ((fs.readFileSync(f, 'utf8').match(/:root\s*\{/g) || []).length), 0));

const v = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const routes = v.rewrites.map((r) => r.source).filter((s) => !s.includes(':'));
const sm = fs.readFileSync('sitemap.xml', 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://krivatechnologies.com', '') || '/');

console.log('vercel routes:', routes.length, '| sitemap URLs:', locs.length);
console.log('in vercel, absent from sitemap:', routes.filter((r) => !locs.includes(r)));
console.log('in sitemap, absent from vercel:', locs.filter((l) => !routes.includes(l)));
console.log('duplicate sitemap URLs:', locs.length - new Set(locs).size);

for (const asset of ['robots.txt', 'sitemap.xml', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'site.webmanifest', 'shared/tokens.css']) {
  console.log((fs.existsSync(asset) ? '  ok  ' : ' MISS ') + asset);
}

const contact = fs.readFileSync('kriva-contact.html', 'utf8');
console.log('contact form endpoint wired:', /action="\/api\/inquiry"/.test(contact));
