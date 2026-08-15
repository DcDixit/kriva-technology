/* Tightens over-length titles / descriptions so they survive SERP truncation.
   Replaces the string everywhere it appears, which keeps <title>, og: and twitter: in sync.
   Meaning and keyword intent are preserved; only redundancy is cut. */

const fs = require('fs');
const dry = process.argv.includes('--dry');

const EDITS = [
  /* Insight pages: the article headline is good copy and is reused in the H1 and
     Article.headline. Scope these to <title> only by matching the " · KRIVA" suffix. */
  ['kriva-insight-choosing-a-digital-agency.html', [
    ['How to choose a digital agency without wasting six months · KRIVA', 'Choosing a digital agency without wasting six months · KRIVA'],
  ]],
  ['kriva-insight-crm-dashboard-ux-patterns.html', [
    ['CRM dashboard UX patterns that sales teams actually use · KRIVA', 'CRM dashboard UX patterns sales teams actually use · KRIVA'],
  ]],
  ['kriva-insight-no-code-vs-custom-mvp.html', [
    ['No-code vs custom: choosing the right path for your MVP · KRIVA', 'No-code vs custom: the right path for your MVP · KRIVA'],
  ]],
  ['kriva-insight-trucking-dispatch-crm-guide.html', [
    ['Dispatch CRM solutions for US trucking companies: what actually works · KRIVA', 'Dispatch CRM for US trucking: what actually works · KRIVA'],
    ['How carriers, brokers, and dispatch teams can reduce handle time, improve fleet visibility, and replace spreadsheet-driven operations with purpose-built CRM workflows.',
      'How carriers, brokers, and dispatch teams cut handle time, improve fleet visibility, and replace spreadsheet operations with purpose-built CRM workflows.'],
  ]],
  ['kriva-solution-accounting.html', [
    ['QuickBooks &amp; Xero Integrations &middot; Sync finance can trust', 'QuickBooks &amp; Xero Integrations for Finance Teams'],
    ['QuickBooks &amp; Xero Integrations · Sync finance can trust', 'QuickBooks &amp; Xero Integrations for Finance Teams'],
  ]],
  ['kriva-solution-trucking.html', [
    ['Custom Trucking Software &amp; Dispatch CRM Development USA', 'Trucking Software &amp; Dispatch CRM Development USA'],
  ]],
  ['kriva-solutions-index.html', [
    ['Solutions &middot; SaaS, Trucking, Integrations &amp; Auto Transport', 'Solutions &middot; SaaS, Trucking &amp; Integrations'],
    ['Solutions · SaaS, Trucking, Integrations &amp; Auto Transport', 'Solutions · SaaS, Trucking &amp; Integrations'],
    ['Four KRIVA solution areas, trucking &amp; logistics, SaaS products, QuickBooks &amp; Xero integrations, and car transportation, with capabilities, process, and related work.',
      'Four KRIVA solution areas: trucking &amp; logistics, SaaS products, QuickBooks &amp; Xero integrations, and car transportation.'],
  ]],
  ['kriva-about.html', [
    ['KRIVA is a product studio in Ahmedabad. Design and engineering under one roof for US trucking ops, SaaS products, and accounting integrations. Studio since 2025.',
      'KRIVA is a product studio in Ahmedabad. Design and engineering under one roof for US trucking ops, SaaS products, and accounting integrations.'],
  ]],
  ['kriva-work-index.html', [
    ['Case studies from SaaS onboarding redesigns, trucking dispatch CRM builds, and QuickBooks/Xero integration projects. Verified narratives, signed-off metrics on select cases.',
      'Case studies from SaaS onboarding redesigns, trucking dispatch CRM builds, and QuickBooks/Xero integrations. Verified narratives, signed-off metrics.'],
  ]],
  ['kriva-terms.html', [
    ['Terms governing use of the KRIVA website and professional services.',
      'Terms governing use of the KRIVA Technologies website and our professional design and engineering services.'],
  ]],
];

let total = 0;
for (const [file, pairs] of EDITS) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;
  const applied = [];
  for (const [from, to] of pairs) {
    if (!out.includes(from)) continue;
    const n = out.split(from).length - 1;
    out = out.split(from).join(to);
    applied.push(`${n}x "${from.slice(0, 42)}..."`);
  }
  if (out !== src) {
    if (!dry) fs.writeFileSync(file, out);
    total++;
    console.log(`${file}\n    ${applied.join('\n    ')}`);
  } else {
    console.log(`${file}  NO MATCH (check strings)`);
  }
}
console.log(`\n${dry ? 'would update' : 'updated'} ${total} files`);
