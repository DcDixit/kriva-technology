/* Analyse the uncommitted pricing diff in a repo dir: price tokens removed/added, and which changed lines sit in
   SEO-relevant places (title, meta description, og/twitter, JSON-LD) or in structural (non-price) edits.
   Usage: node price_diff.cjs <repoDir> */
const { execSync } = require('child_process');
const dir = process.argv[2];
const diff = execSync('git -c core.safecrlf=false diff -U0', { cwd: dir, maxBuffer: 64 * 1024 * 1024 }).toString();
const PRICE = /\$\d{1,3}(?:,\d{3})+/g;
const count = { '-': {}, '+': {} };
const seo = [], nonPrice = [];
let file = null, inLd = false;
for (const line of diff.split('\n')) {
  if (line.startsWith('+++ b/')) { file = line.slice(6); continue; }
  if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@') || line.startsWith('diff ') || line.startsWith('index ')) continue;
  const sign = line[0]; if (sign !== '-' && sign !== '+') continue;
  const body = line.slice(1);
  (body.match(PRICE) || []).forEach(p => { count[sign][p] = (count[sign][p] || 0) + 1; });
  if (/<title>|name="description"|property="og:|name="twitter:|"@type"|"price"|"offers"|application\/ld\+json/.test(body)) seo.push(file + ' ' + sign + ' ' + body.trim().slice(0, 200));
  const stripped = body.replace(PRICE, '').replace(/\d[\d,.]*/g, '').trim();
  if (sign === '+' && !(body.match(PRICE) || []).length && !/data-(pz-)?count|--k:/.test(body)) nonPrice.push(file + ' + ' + body.trim().slice(0, 160));
}
console.log('price tokens removed:', JSON.stringify(count['-']));
console.log('price tokens added  :', JSON.stringify(count['+']));
console.log('\nSEO-relevant changed lines (' + seo.length + '):'); seo.forEach(s => console.log('  ' + s));
console.log('\nadded lines without a $ price (structural or other edits) (' + nonPrice.length + '):'); nonPrice.slice(0, 60).forEach(s => console.log('  ' + s));
