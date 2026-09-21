#!/usr/bin/env node
/** Fix 09, second pass: UK and UAE inbound links from high-authority pages. */
const fs = require('fs');

const PLAN = [
 ['kriva-solution-accounting.html', /\bUK and US entities\b/, 'UK', '/markets/uk'], ['kriva-solution-saas.html', /\bUK\b(?= &amp; EU payroll platform)/, null, '/markets/uk'], ['kriva-process.html', /\bUK\b(?= and US clients)/, null, '/markets/uk'], ['kriva-careers.html', /\bUK\b(?= and US client overlap)/, null, '/markets/uk'], ['kriva-about.html', /\bUAE\b/, null, '/markets/uae'], ];

let n = 0;
for (const [file, re, _label, target] of PLAN) {
 let h = fs.readFileSync(file, 'utf8');
 const headEnd = h.indexOf('</head>');
 const head = h.slice(0, headEnd);
 let body = h.slice(headEnd);

 const editorial = body.replace(/<(header|footer|nav)\b[\s\S]*?<\/\1>/gi, ' ');
 if (new RegExp(`href=["']${target}["']`).test(editorial)) {
 console.log(` skip ${file} -> ${target} (already linked)`);
 continue;
 }

 let done = false;
 body = body.replace(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi, (full, tag, inner) => {
 if (done || /<a\b/i.test(inner) || !re.test(inner)) return full;
 done = true;
 return full.replace(inner, inner.replace(re, (mm) => `<a href="${target}">${mm}</a>`));
 });

 if (done) {
 fs.writeFileSync(file, head + body);
 n++;
 console.log(` ${file.padEnd(34)} -> ${target}`);
 } else {
 console.log(` MISS ${file} -> ${target}`);
 }
}
console.log(`\n ${n} link(s) added.`);
