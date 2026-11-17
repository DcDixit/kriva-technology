// Builds the redesigned /contact page ("ctx" layer on top of the svx services layer) from git HEAD.
// Keeps head/SEO/header/footer/schema/inline form script verbatim; swaps <main> for the new markup.
// Usage: node _build_contact_x.cjs <fragment.html>
const fs = require('fs');
const { execSync } = require('child_process');
const frag = fs.readFileSync(process.argv[2], 'utf8').replace(/\r\n/g, '\n');
let html = execSync('git show HEAD:kriva-contact.html', { encoding: 'utf8', maxBuffer: 1 << 24 }).replace(/\r\n/g, '\n');
const must = (cond, msg) => { if (!cond) { console.error('FAIL: ' + msg); process.exit(1); } };
const rep = (a, b, msg) => { must(html.includes(a), msg); html = html.replace(a, b); };

// 1. head motion flag (same failsafe as the services pages)
rep("<script>document.documentElement.classList.add('js')</script>",
  "<script>(function(d){d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('svx-motion');setTimeout(function(){if(!window.__svx)d.classList.remove('svx-motion')},2500)}})(document.documentElement)</script>", 'js flag');
// 2. stylesheets
rep('<link rel="stylesheet" href="/shared/contact.css?v=brand1">\n<link rel="stylesheet" href="/shared/slot-assets.css?v=brand1">\n', '', 'old css');
rep('<link rel="stylesheet" href="/shared/kds.css?v=brand1">\n</head>',
  '<link rel="stylesheet" href="/shared/kds.css?v=brand1">\n<link rel="stylesheet" href="/shared/services-x.css?v=svx1">\n<link rel="stylesheet" href="/shared/contact-x.css?v=ctx1">\n</head>', 'kds css');
// 3. body
rep('<body class="page-contact">', '<body class="page-contact svx svx-ct">', 'body');
// 4. main
const m0 = html.indexOf('<main id="main">'), m1 = html.indexOf('</main>') + '</main>'.length;
must(m0 > 0 && m1 > m0, 'main');
const oldMain = html.slice(m0, m1);
const b0 = oldMain.indexOf('<form id="briefForm"'), b1 = oldMain.indexOf('</form>', b0);
let brief = oldMain.slice(oldMain.indexOf('\n', b0) + 1, oldMain.lastIndexOf('\n', b1));
const btnOld = '<button type="submit" class="btn" id="submitBtn">';
must(brief.includes(btnOld), 'brief btn');
brief = brief.replace(btnOld, '<button type="submit" class="btn svx-btn" id="submitBtn" data-magnet>')
  .replace('<span id="submitLabel">Send a project brief</span><i>→</i>', '<span id="submitLabel">Send a project brief</span><i aria-hidden="true">→</i>');
must(frag.includes('@@BRIEF_FORM_BODY@@'), 'placeholder');
html = html.slice(0, m0) + frag.trim().replace('@@BRIEF_FORM_BODY@@', brief) + html.slice(m1);
// 5. scripts
rep('<script src="/shared/page-inquiry.js?v=kds7" defer></script>\n</body>',
  '<script src="/shared/page-inquiry.js?v=kds7" defer></script>\n<script src="/shared/services-x.js?v=svx1" defer></script>\n<script src="/shared/contact-x.js?v=ctx1" defer></script>\n</body>', 'scripts');

// Field parity check: every name/id/required in old forms must survive
const sig = (s) => [...s.matchAll(/<(input|select|textarea|option|button)\b[^>]*>/g)].map((m) => m[0].replace(/ class="[^"]*"| data-magnet/g, '')).join('\n');
const oldForms = oldMain.match(/<form[\s\S]*?<\/form>/g).map(sig).join('\n');
const newForms = html.match(/<form[\s\S]*?<\/form>/g).map(sig).join('\n');
must(oldForms === newForms, 'form controls changed');
for (const id of ['fitSummary','fitSummaryList','fitFormStatus','fitDone','fitSubmitLabel','summary','summaryList','formStatus','done','submitLabel','book','brief','h1','progress'])
  must(html.includes('id="' + id + '"'), 'id ' + id);
fs.writeFileSync('kriva-contact.html', html.replace(/\n/g, '\r\n'));
console.log('ok', html.length);
