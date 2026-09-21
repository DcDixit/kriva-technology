#!/usr/bin/env node
/**
 * Fix 08, contextual inbound links to the market pages.
 * The four /markets/* pages carry the site's geographic targeting but each had
 * only one or two contextual inbound links (everything else was nav boilerplate), * so they received almost no internal authority. This links country mentions that
 * already exist in body copy, no new copy, no layout change.
 */
const fs = require('fs');

const PLAN = [
 ['kriva-redesign.html', 'US trucking', '/markets/us'], ['kriva-about.html', 'United States', '/markets/us'], ['kriva-about.html', 'United Kingdom', '/markets/uk'], ['kriva-about.html', 'United Arab Emirates', '/markets/uae'], ['kriva-about.html', 'Canada', '/markets/ca'], ['kriva-case-marketplace.html', 'US trucking', '/markets/us'], ['kriva-insight-trucking-dispatch-crm-guide.html', 'US carriers', '/markets/us'], ['kriva-service-mobile-applications.html', 'US trucking', '/markets/us'], ['kriva-insight-saas-mvp-uk-guide.html', 'UK SaaS', '/markets/uk'], ['kriva-faq.html', 'Canada', '/markets/ca'], ];

const applied = [];
const missed = [];

for (const [file, phrase, target] of PLAN) {
 let h = fs.readFileSync(file, 'utf8');
 const headEnd = h.indexOf('</head>');
 const head = h.slice(0, headEnd);
 let body = h.slice(headEnd);

 // already linked from this page?
 if (new RegExp(`href=["']${target}["']`).test(body.replace(/<(header|footer|nav)\b[\s\S]*?<\/\1>/gi, ''))) {
 missed.push(`${file} -> ${target} (already linked)`);
 continue;
 }

 let done = false;
 body = body.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (full, inner, offset) => {
 if (done) return full;
 if (/<a\b/i.test(inner)) return full; // don't nest anchors
 // some cards wrap whole blocks in an <a>; a <p> inside one must be left alone
 const before = body.slice(0, offset);
 const opens = (before.match(/<a\b/gi) || []).length;
 const closes = (before.match(/<\/a>/gi) || []).length;
 if (opens > closes) return full;
 const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
 if (!re.test(inner)) return full;
 done = true;
 return full.replace(inner, inner.replace(re, (mm) => `<a href="${target}">${mm}</a>`));
 });

 if (done) {
 fs.writeFileSync(file, head + body);
 applied.push(`${file.padEnd(46)} "${phrase}" -> ${target}`);
 } else {
 missed.push(`${file} -> ${target} (no eligible paragraph)`);
 }
}

console.log('--- links added ---');
applied.forEach((l) => console.log(' ' + l));
if (missed.length) {
 console.log('\n--- skipped ---');
 missed.forEach((l) => console.log(' ' + l));
}
console.log(`\n ${applied.length} contextual link(s) added.`);
