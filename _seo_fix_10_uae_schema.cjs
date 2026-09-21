#!/usr/bin/env node
/**
 * Fix 10, add a FAQPage node to the UAE market page matching the Q&A now
 * visible in the body. Every answer below is the on-page text verbatim, which is
 * what FAQPage requires; summarising it would make the markup non-compliant.
 */
const fs = require('fs');

const FILE = 'kriva-market-uae.html';
const QA = [
 [
 'Do you have an office in the UAE?', 'No. KRIVA is remote-first from Ahmedabad, India, and we do not claim a local presence we do not have. Gulf Standard Time is two and a half hours ahead of us, so a normal UAE working day overlaps almost entirely with ours, in practice that means same-day replies and live sessions at ordinary hours for both sides.', ], [
 'Can you build Arabic and English in the same product?', 'Yes, and it is much cheaper to plan for at the start. We structure layouts, components, and content for bidirectional text from the wireframe stage. Translation itself is usually handled by your team or a translation partner; what we own is making sure the interface does not break when the direction flips.', ], [
 'Which accounting systems can you integrate with?', 'QuickBooks and Xero are the two we work with most, using their official APIs. For regional ERPs and bank feeds we work against whatever documented API exists, and we say plainly when a system has no viable integration path rather than building a fragile scraper.', ], [
 'Who owns the code and the designs?', 'You do. Repositories, Figma files, and documentation transfer to you at close or earlier if you prefer. There is no licensing arrangement and no lock-in to us for future work.', ], [
 'Can you improve an existing system instead of rebuilding it?', 'Usually, and it is normally the better option. We assess what your current platform can actually support, then build beside it in phases behind feature flags so the desk keeps running while the work lands. A full rebuild only makes sense when the platform genuinely cannot carry the workload.', ], ];

let h = fs.readFileSync(FILE, 'utf8');

if (/"@type": "FAQPage"/.test(h)) {
 console.log(' FAQPage already present, nothing to do.');
 process.exit(0);
}

const node = {
 '@type': 'FAQPage', '@id': 'https://krivatechnologies.com/markets/uae#faq', mainEntity: QA.map(([q, a]) => ({
 '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }, })), };

// append to the existing @graph of the page's JSON-LD block
const re = /(<script type="application\/ld\+json">\s*)([\s\S]*?)(\s*<\/script>)/;
const m = h.match(re);
const data = JSON.parse(m[2]);
data['@graph'].push(node);
h = h.replace(re, (_f, a, _b, c) => a + JSON.stringify(data, null, 2) + c);

fs.writeFileSync(FILE, h);
console.log(` ${FILE}: FAQPage added with ${QA.length} questions.`);

// verify every answer really is on the page
const body = h.slice(h.indexOf('</head>'));
const text = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
let missing = 0;
for (const [q, a] of QA) {
 if (!text.includes(q)) { console.log(' *** question not visible on page: ' + q); missing++; }
 if (!text.includes(a.slice(0, 60))) { console.log(' *** answer not visible on page: ' + q); missing++; }
}
console.log(missing ? ` ${missing} mismatch(es)!` : ' All Q&A verified visible in page body.');
