const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
const pages = JSON.parse(fs.readFileSync(path.join(OUT, 'pages.json')));
const links = JSON.parse(fs.readFileSync(path.join(OUT, 'links.json')));
const P = (u) => u.replace('https://krivatechnologies.com', '') || '/';
const sec = (t) => console.log('\n#### ' + t);

sec('STATUS / ERRORS');
pages.filter((p) => p.error || p.status !== 200).forEach((p) => console.log(P(p.url), p.status, p.error || ''));
console.log('pages:', pages.length, 'not in sitemap:', pages.filter((p) => !p.inSitemap).map((p) => P(p.url)).join(', '));

sec('TITLE / DESC / CANONICAL / H1');
const titles = {}, descs = {};
pages.forEach((p) => { if (!p.title) return; (titles[p.title] ||= []).push(P(p.url)); (descs[p.desc] ||= []).push(P(p.url)); });
pages.forEach((p) => {
  if (p.error) return;
  const iss = [];
  if (!p.title || p.title.length < 30 || p.title.length > 62) iss.push('title ' + (p.title || '').length);
  if (!p.desc || p.desc.length < 110 || p.desc.length > 160) iss.push('desc ' + (p.desc || '').length);
  if (!p.canonical) iss.push('NO canonical'); else if (p.canonical.replace(/\/$/, '') !== p.finalUrl.replace(/\/$/, '')) iss.push('canonical->' + P(p.canonical));
  if (p.h1count !== 1) iss.push('h1 x' + p.h1count);
  if (p.robots && /noindex/i.test(p.robots)) iss.push('NOINDEX');
  if (!p.og || !p.og.image) iss.push('no og:image');
  if (iss.length) console.log(P(p.url).padEnd(48), iss.join(' | '));
});
Object.entries(titles).filter(([, v]) => v.length > 1).forEach(([t, v]) => console.log('DUP TITLE', t, v));
Object.entries(descs).filter(([, v]) => v.length > 1).forEach(([t, v]) => console.log('DUP DESC', t, v));

sec('TITLES (all)');
pages.forEach((p) => console.log(P(p.url).padEnd(48), (p.title || '').length, p.title));

sec('WORDS + SCHEMA');
pages.forEach((p) => console.log(P(p.url).padEnd(48), String(p.words).padStart(5), 'w', [...new Set(p.ldTypes || [])].join(',')));

sec('PERF (desktop, unthrottled, local)');
pages.forEach((p) => p.perf && console.log(P(p.url).padEnd(48), 'ttfb', p.perf.ttfb, 'lcp', p.perf.lcp, 'cls', p.perf.cls, 'req', p.perf.reqCount, 'KB', p.perf.totalKB, JSON.stringify(p.perf.byTypeKB), 'html', p.perf.htmlKB, 'h', p.pageHeight, 'mh', p.mobile && p.mobile.height));
const tp = {}; pages.forEach((p) => (p.perf?.thirdPartyHosts || []).forEach((h) => tp[h] = (tp[h] || 0) + 1)); console.log('third-party hosts', tp);

sec('CONSOLE / FAILED REQUESTS');
pages.forEach((p) => { if (p.consoleErrors?.length || p.failedRequests?.length) console.log(P(p.url), JSON.stringify(p.consoleErrors), JSON.stringify(p.failedRequests)); });

sec('IMAGES');
pages.forEach((p) => { if (p.imgNoAlt || p.imgNoDims || p.imgOversize?.length || p.brokenImgs?.length) console.log(P(p.url).padEnd(48), 'imgs', p.imgCount, 'noAlt', p.imgNoAlt, 'noDims', p.imgNoDims, 'oversize', JSON.stringify(p.imgOversize), 'broken', JSON.stringify(p.brokenImgs)); });
const fmt = {}; pages.forEach((p) => (p.imgs || []).forEach((i) => { const e = (i.src.match(/\.(\w+)(\?|$)/) || [, 'other'])[1]; fmt[e] = (fmt[e] || 0) + 1; })); console.log('formats', fmt);

sec('AXE (aggregated)');
const ax = {}; pages.forEach((p) => Array.isArray(p.axe) && p.axe.forEach((v) => { (ax[v.id] ||= { impact: v.impact, help: v.help, pages: [], nodes: 0, sample: v.sample }); ax[v.id].pages.push(P(p.url)); ax[v.id].nodes += v.n; }));
Object.entries(ax).sort((a, b) => b[1].pages.length - a[1].pages.length).forEach(([k, v]) => console.log(k, v.impact, v.pages.length + 'pg', v.nodes + 'nodes', '-', v.help, '\n   ', v.pages.slice(0, 6).join(' '), '\n   ', v.sample.slice(0, 2).join(' || ')));

sec('MOBILE');
pages.forEach((p) => p.mobile && (p.mobile.hOverflow || p.mobile.tinyText > 0 || p.mobile.smallTargets > 3) && console.log(P(p.url).padEnd(48), 'overflow', p.mobile.hOverflow, p.mobile.scrollW, JSON.stringify(p.mobile.overflowEls), 'smallTargets', p.mobile.smallTargets, 'tinyText', p.mobile.tinyText));

sec('FORMS');
pages.forEach((p) => (p.forms || []).forEach((f) => console.log(P(p.url).padEnd(40), f.id, f.action, f.fields.join(' '), f.unlabeled.length ? 'UNLABELED ' + f.unlabeled : '')));

sec('CTAS above fold (desktop)');
pages.forEach((p) => console.log(P(p.url).padEnd(48), JSON.stringify(p.aboveFoldCtas)));

sec('INTERNAL LINK GRAPH');
const inbound = {}; pages.forEach((p) => (inbound[P(p.url)] = new Set()));
pages.forEach((p) => (p.links || []).forEach((l) => { const h = l.href.split('#')[0].replace(/\/$/, ''); if (!h.startsWith('https://krivatechnologies.com')) return; const k = P(h) || '/'; if (inbound[k] && k !== P(p.url)) inbound[k].add(P(p.url)); }));
Object.entries(inbound).sort((a, b) => a[1].size - b[1].size).forEach(([k, v]) => console.log(String(v.size).padStart(3), k));
// in-body (non nav/footer) inbound
const body = {}; pages.forEach((p) => (body[P(p.url)] = new Set()));
pages.forEach((p) => (p.links || []).filter((l) => !l.inNav && !l.inFooter).forEach((l) => { const k = P(l.href.split('#')[0].replace(/\/$/, '')) || '/'; if (body[k] && k !== P(p.url)) body[k].add(P(p.url)); }));
console.log('-- contextual inbound (excl nav/footer), lowest:');
Object.entries(body).sort((a, b) => a[1].size - b[1].size).slice(0, 20).forEach(([k, v]) => console.log(String(v.size).padStart(3), k));

sec('NAV + FOOTER (home)');
const home = pages[0];
console.log('NAV:', home.links.filter((l) => l.inNav).map((l) => l.text + '=' + P(l.href)).join(' | '));
console.log('FOOTER:', home.links.filter((l) => l.inFooter).map((l) => l.text + '=' + P(l.href)).join(' | '));

sec('EXTERNAL LINKS');
links.filter(([h]) => !h.startsWith('https://krivatechnologies.com')).forEach(([h, s]) => console.log(h.slice(0, 90), '<-', s.length, 'pages'));
fs.writeFileSync(path.join(__dirname, 'ext.txt'), links.filter(([h]) => !h.startsWith('https://krivatechnologies.com')).map(([h]) => h).join('\n'));
