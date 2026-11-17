// Content preservation check for the mx redesign: every text fragment in the old <main> (git HEAD)
// must still appear in the new <main>. Also confirms <head> and the footer are byte-identical.
// Usage: node _qa_mkt_copy.cjs
const fs = require('fs');
const { execSync } = require('child_process');
const FILES = ['kriva-market-us.html', 'kriva-market-uk.html', 'kriva-market-au.html', 'kriva-market-uae.html', 'kriva-market-ca.html', 'kriva-industries.html'];
const ent = { '&amp;': '&', '&rarr;': '→', '&minus;': '−', '&pound;': '£', '&nbsp;': ' ', '&quot;': '"', '&#39;': "'" };
const frags = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .split(/<[^>]+>/)
  .map((t) => t.replace(/&[a-z#0-9]+;/g, (m) => ent[m] || m).replace(/\s+/g, ' ').trim())
  .filter((t) => t.length > 2 && !/^[→·/◆]+$/.test(t));
const norm = (html) => frags(html).join(' ').replace(/\s+/g, ' ');
let bad = 0;
for (const f of FILES) {
  const old = execSync('git show HEAD:' + f, { encoding: 'utf8', maxBuffer: 1e8 }).replace(/\r\n/g, '\n');
  const neu = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  const om = old.match(/<main id="main">[\s\S]*?<\/main>/)[0];
  const nm = neu.match(/<main id="main">[\s\S]*?<\/main>/)[0];
  const hay = norm(nm);
  const missing = [...new Set(frags(om))].filter((t) => !hay.includes(t));
  const foot = (s) => s.slice(s.indexOf('</main>'));
  const headOld = old.slice(0, old.indexOf('<body')).replace(/<style>[\s\S]*?<\/style>\n?/, '').replace(/\n<link rel="stylesheet" href="\/shared\/(markets|slot-assets)\.css\?v=brand1">/g, '');
  const headNew = neu.slice(0, neu.indexOf('<body')).replace(/\n<link rel="stylesheet" href="\/shared\/markets-x\.css\?v=mx1">/, '').replace(/<script>\(function\(d\)\{d\.classList\.add\('js'\)[\s\S]*?<\/script>/, "<script>document.documentElement.classList.add('js')</script>");
  const footSame = foot(old).replace('<script src="/shared/page-inquiry.js', '').length === foot(neu).replace('<script src="/shared/markets-x.js?v=mx1" defer></script>\n', '').replace('<script src="/shared/page-inquiry.js', '').length;
  console.log(f, '| fragments', frags(om).length, '| missing', missing.length, '| head same', headOld === headNew, '| footer same', footSame);
  missing.forEach((m) => console.log('   MISSING:', m));
  bad += missing.length + (headOld === headNew ? 0 : 1) + (footSame ? 0 : 1);
}
console.log(bad ? 'ISSUES: ' + bad : 'ALL CONTENT PRESERVED');
