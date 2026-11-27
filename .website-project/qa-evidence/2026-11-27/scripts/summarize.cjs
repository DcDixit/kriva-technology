/* Summarise final_qa.cjs JSONL output. Usage: node summarize.cjs <dir> [prefix=qa_clean] */
const fs = require('fs');
const [dir, prefix = 'qa_clean'] = process.argv.slice(2);
const rows = [];
for (const w of [360, 390, 768, 1440]) {
  const f = dir + '/' + prefix + '_' + w + '.jsonl';
  if (fs.existsSync(f)) fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).forEach(l => rows.push(JSON.parse(l)));
}
const issues = rows.filter(r => r.nav || r.status !== 200 || r.bad.length || r.errs.length || (r.hidden || []).length || r.overflow > 1 || r.h1 !== 1 || (r.brokenImg || []).length);
console.log('rows', rows.length, 'with issues', issues.length);
issues.forEach(r => console.log(JSON.stringify({ r: r.r, w: r.w, status: r.status, nav: r.nav, bad: r.bad, errs: r.errs, hidden: r.hidden, overflow: r.overflow, wide: r.wide, h1: r.h1, brokenImg: r.brokenImg })));
