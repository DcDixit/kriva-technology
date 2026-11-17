/* Background refinement: cream (#F6F4EF paper) section bands -> pure white, or the existing cool
   neutral #F7F8F9 where a band sits between two light sections (keeps section rhythm).
   Every edit must match exactly once, or the script stops without writing anything.
   Usage: node _apply_bg_white.cjs [--dry] */
const fs = require('fs');
const W = '#fff', N = '#F7F8F9';
const dry = process.argv.includes('--dry');
const E = {}; // file -> [[from,to]]
const add = (f, from, to) => (E[f] = E[f] || []).push([from, to]);
const sec = (f, sel, tok, to, tail = '}') => add(f, `${sel}{background:var(${tok})${tail}`, `${sel}{background:${to}${tail}`);

// Home (source of home.bundle.css; rebuild after)
sec('shared/home-x.css', '.hx .x-paths', '--x-paper', W);
sec('shared/home-x.css', '.hx .x-int', '--x-paper', N);
sec('shared/home-x.css', '.hx .x-why', '--x-paper', N);
sec('shared/home-x.css', '.hx .x-mkts', '--x-paper', W, ';');

// About
sec('shared/about-x.css', '.svx-about .abx-story', '--v-paper', N);
sec('shared/about-x.css', '.svx-about .abx-co', '--v-paper', N);
sec('shared/about-x.css', '.svx-about .abx-mk', '--v-paper', W);

// Shared services layer (CRM benchmark rules reused across pages)
sec('shared/services-x.css', '.svx .cr-fit', '--v-paper', W);
add('shared/services-x.css', '.svx .cr-decide{background:var(--v-paper)}', `.svx .cr-decide{background:${W}}\n.svx-mob .cr-decide{background:${N}}`);
add('shared/services-x.css', '.svx .cr-faq{background:var(--v-paper)}', `.svx .cr-faq{background:${W}}\n.svx-index .cr-faq,.svx-crm .cr-faq,.svx-dash .cr-faq,.svx-pd .cr-faq,.svx-saas .cr-faq,.svx-price .cr-faq{background:${N}}`);

// Service pages
sec('shared/services-x-api.css', '.svx-api .ai-fit', '--v-paper', W);
sec('shared/services-x-api.css', '.svx-api .ai-plat', '--v-paper', N, ';');
sec('shared/services-x-api.css', '.svx-api .ai-deliv', '--v-paper', W);
sec('shared/services-x-api.css', '.svx-api .ai-faq', '--v-paper', N);
sec('shared/services-x-api.css', '.svx-api .ai-inq', '--v-paper', W, ';');
sec('shared/services-x-auto.css', '.svx-auto .au-fit', '--v-paper', W);
sec('shared/services-x-auto.css', '.svx-auto .au-loop', '--v-paper', N);
sec('shared/services-x-auto.css', '.svx-auto .au-scope', '--v-paper', W);
sec('shared/services-x-auto.css', '.svx-auto .au-faq', '--v-paper', N);
sec('shared/services-x-auto.css', '.svx-auto .au-inq', '--v-paper', W, ';');
sec('shared/services-x-brand.css', '.svx-brand .bdx-who-sec', '--v-paper', W);
sec('shared/services-x-brand.css', '.svx-brand .bdx-scope', '--v-paper', W);
sec('shared/services-x-dash.css', '.svx-dash .dbx-fit', '--v-paper', W);
sec('shared/services-x-dash.css', '.svx-dash .dbx-scope-sec', '--v-paper', N);
sec('shared/services-x-mob.css', '.svx-mob .mb-wf', '--v-paper', W);
sec('shared/services-x-pd.css', '.svx-pd .pdx-fit', '--v-paper', W);
sec('shared/services-x-pd.css', '.svx-pd .pdx-proc', '--v-paper', W);
sec('shared/services-x-saas.css', '.svx-saas .sp-surf', '--v-paper', N);
sec('shared/services-x-saas.css', '.svx-saas .sp-roles', '--v-paper', W);
sec('shared/services-x-saas.css', '.svx-saas .sp-process', '--v-paper', N);
sec('shared/services-x-uiux.css', '.svx-uiux .uxx-wf-sec', '--v-paper', W);
sec('shared/services-x-uiux.css', '.svx-uiux .uxx-ap-sec', '--v-paper', W);
sec('shared/services-x-web.css', '.svx-web .wd-fit', '--v-paper', W);
sec('shared/services-x-web.css', '.svx-web .wd-ship', '--v-paper', N);
sec('shared/services-x-web.css', '.svx-web .wd-related', '--v-paper', W);
sec('shared/services-x-index.css', '.svx-index .svi-fit', '--v-paper', N);
sec('shared/services-x-index.css', '.svx-index .svi-surface', '--v-paper', N);
sec('shared/services-x-index.css', '.svx-index .svi-proc-sec', '--v-paper', W);

// Process, Contact, Case (ShiftRail), Work, Insights
sec('shared/process-x.css', '.svx-proc .pcx-fit', '--v-paper', N);
sec('shared/process-x.css', '.svx-proc .pcx-cad', '--v-paper', N);
sec('shared/contact-x.css', '.svx .ctx-brief', '--v-paper', W);
sec('shared/case-x.css', '.svx-case .csx-loads', '--v-paper', N);
sec('shared/case-x.css', '.svx-case .csx-dec', '--v-paper', W);
sec('shared/case-x.css', '.svx-case .csx-related', '--v-paper', N);
sec('shared/case-x.css', '.svx-case .csx-next', '--v-paper', W, ';');
add('shared/case-x.css', '.svx-case .csx-inq{background:var(--v-paper)!important;', `.svx-case .csx-inq{background:${W}!important;`);
sec('shared/work-x.css', 'body.wx .wx-faq', '--w-paper', N, ';');
sec('shared/work-x.css', 'body.wx .wx-inq', '--w-paper', W, ';');
add('shared/insights-x.css', '.ix .ix-topics{padding-block:var(--x-pad);background:var(--x-paper);', `.ix .ix-topics{padding-block:var(--x-pad);background:${W};`);
add('shared/insights-x.css', '.ix .ix-story{position:relative;padding-block:0 var(--x-pad);background:var(--x-paper);', `.ix .ix-story{position:relative;padding-block:0 var(--x-pad);background:${N};`);
sec('shared/insight-x.css', '.ix .inq-sec', '--x-paper', W);

// Solutions
sec('shared/solutions-x-acc.css', '.sx .acx-glance', '--sx-paper', N);
sec('shared/solutions-x-acc.css', '.sx .acx-close', '--sx-paper', W);
sec('shared/solutions-x-acc.css', '.sx .acx-mx', '--sx-paper', W);
sec('shared/solutions-x-acc.css', '.sx .acx-deliv', '--sx-paper', N);
sec('shared/solutions-x-car.css', '.sx .cx-glance', '--sx-paper', W);
sec('shared/solutions-x-car.css', '.sx .cx-hand', '--sx-paper', N);
sec('shared/solutions-x-car.css', '.sx .cx-tools', '--sx-paper', W);
sec('shared/solutions-x-car.css', '.sx .cx-deliv', '--sx-paper', N);
sec('shared/solutions-x-hub.css', '.sx-hub .hb-more', '--sx-paper', W);
sec('shared/solutions-x-hub.css', '.sx-hub .hb-help', '--sx-paper', N);
sec('shared/solutions-x-saas.css', '.sx .sas-glance', '--sx-paper', W);
sec('shared/solutions-x-saas.css', '.sx .sas-decide', '--sx-paper', N);
sec('shared/solutions-x.css', '.sx .sx-decide', '--sx-paper', N);
sec('shared/solutions-x.css', '.sx .sx-int', '--sx-paper', N);
sec('shared/solutions-x.css', '.sx .sx-fglance', '--sx-paper', W);
sec('shared/solutions-x.css', '.sx .sx-fbuild', '--sx-paper', N);
sec('shared/solutions-x.css', '.sx .sx-fint', '--sx-paper', W);
sec('shared/solutions-x.css', '.sx .sx-fstart', '--sx-paper', N);
sec('shared/solutions-x.css', '.sx .fl-mods-sec', '--sx-paper', W);
sec('shared/solutions-x.css', '.sx .fl-drv', '--sx-paper', W);
sec('shared/solutions-x.css', '.sx .sx-tmap', '--sx-paper', N);
// Moving company page: page body, hero (+ the nav that blends into it), solution band, inquiry
add('shared/solutions-x.css', '.sx-move{--sx-acc:#4F46E5;--sx-acc-l:#A5B4FC;background:var(--sx-paper)}', `.sx-move{--sx-acc:#4F46E5;--sx-acc-l:#A5B4FC;background:${W}}`);
add('shared/solutions-x.css', '.nav-shell{background:#F6F4EF!important;', `.nav-shell{background:${N}!important;`);
add('shared/solutions-x.css', 'padding:calc(72px + clamp(28px,3.5vw,52px)) 0 clamp(80px,8vw,128px);background:var(--sx-paper);overflow:hidden}', `padding:calc(72px + clamp(28px,3.5vw,52px)) 0 clamp(80px,8vw,128px);background:${N};overflow:hidden}`);
sec('shared/solutions-x.css', '.sx .sx-msol', '--sx-paper', N);
add('shared/solutions-x.css', '.sx section.sx-minq{position:relative;background:var(--sx-paper);', `.sx section.sx-minq{position:relative;background:${W};`);

// Markets + Industries
add('shared/markets-x.css', '.mx .mx-sec--paper{background:var(--m-paper)}', `.mx .mx-sec--paper{background:${W}}\n.mx-ind #why.mx-sec--paper,.mx-us #who.mx-sec--paper,.mx-uk #conditions.mx-sec--paper,.mx-uae #faq.mx-sec--paper{background:${N}}`);
add('shared/markets-x.css', 'overflow:hidden;background:var(--m-paper);padding-block:clamp(80px,9vw,140px);text-align:center}', `overflow:hidden;background:${W};padding-block:clamp(80px,9vw,140px);text-align:center}`);
add('shared/markets-x.css', '.mx-ind .in-more{padding-block:clamp(56px,6vw,88px);background:var(--m-paper)}', `.mx-ind .in-more{padding-block:clamp(56px,6vw,88px);background:${W}}`);
add('shared/markets.css', '.mkt-cross{background:var(--paper-2);', `.mkt-cross{background:${N};`);

// Legacy templates
add('shared/stack.css', '.stk-own{background:var(--paper-2);', `.stk-own{background:${N};`);
add('shared/archetypes.css', 'body.arch-web .hero{background:var(--paper-2)}', `body.arch-web .hero{background:${N}}`);
add('shared/inner.css', 'body.case-saas .ph{background:var(--paper-2)}', `body.case-saas .ph{background:${W}}`);
add('shared/kds.css', '.inq-sec{background:var(--paper-2);border:0}', `.inq-sec{background:${W};border:0}`);

// Legacy pages: inline section styles (all sit between two white sections)
for (const f of ['kriva-case-brandlift.html', 'kriva-case-healthtrack.html', 'kriva-case-payroll-pro.html', 'kriva-service-design-systems.html', 'kriva-service-logo-design.html', 'kriva-service-no-code-low-code.html', 'kriva-service-ux-research.html', 'kriva-service-web-application-design.html', 'kriva-service-wireframing-prototyping.html'])
  add(f, 'style="background:var(--paper-2);border-block:1px solid var(--rule)"', `style="background:${N};border-block:1px solid var(--rule)"`);
// Legacy case studies: .story band (between light sections) and the "next project" band
const nextW = new Set(['kriva-case-payroll-pro.html', 'kriva-case-brandlift.html']);
for (const f of ['kriva-case-ai-support.html', 'kriva-case-brandlift.html', 'kriva-case-crm-pulse.html', 'kriva-case-finance-sync.html', 'kriva-case-healthtrack.html', 'kriva-case-marketplace.html', 'kriva-case-payroll-pro.html']) {
  add(f, '.story{background:var(--paper-2);border-block:1px solid var(--rule)}', `.story{background:${N};border-block:1px solid var(--rule)}`);
  add(f, '.nextp{background:var(--paper-2);border-top:1px solid var(--rule)}', `.nextp{background:${nextW.has(f) ? W : N};border-top:1px solid var(--rule)}`);
}

// Apply (all-or-nothing)
const out = {}; let bad = 0, n = 0;
for (const [f, list] of Object.entries(E)) {
  let s = fs.readFileSync(f, 'utf8');
  for (const [from, to] of list) {
    const c = s.split(from).length - 1;
    if (c !== 1) { console.log(`MISMATCH x${c} ${f}: ${from}`); bad++; continue; }
    s = s.replace(from, () => to); n++;
  }
  out[f] = s;
}
if (bad) { console.log(`${bad} mismatches, nothing written`); process.exit(1); }
if (!dry) for (const [f, s] of Object.entries(out)) fs.writeFileSync(f, s);
console.log(`${dry ? 'DRY ' : ''}${n} edits across ${Object.keys(out).length} files`);
