// Builds the "mx" redesign of /markets/{us,uk,au,uae,ca} and /industries from git HEAD.
// Head, SEO, schema, header, footer and the inquiry <form> + .inq-done are copied verbatim;
// only <main>, the stylesheet list, the motion bootstrap and the body class change.
// Usage: node _build_markets_x.cjs [us,uk,au,uae,ca,ind]
const fs = require('fs');
const { execSync } = require('child_process');

const FILES = { us: 'kriva-market-us.html', uk: 'kriva-market-uk.html', au: 'kriva-market-au.html', uae: 'kriva-market-uae.html', ca: 'kriva-market-ca.html', ind: 'kriva-industries.html' };
const pick = (process.argv[2] || 'us,uk,au,uae,ca,ind').split(',');
const fromHead = (f) => execSync('git show HEAD:' + f, { encoding: 'utf8', maxBuffer: 1e8 }).replace(/\r\n/g, '\n');
const must = (cond, msg) => { if (!cond) throw new Error(msg); };

const MOTION = `<script>(function(d){d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('mx-motion');setTimeout(function(){if(!window.__mx)d.classList.remove('mx-motion')},2500)}})(document.documentElement)</script>`;

/* ───────────── shared blocks ───────────── */
const btn = (href, label, cursor) => `<a href="${href}" class="btn mx-btn" data-magnet${cursor ? ` data-cursor="${cursor}"` : ''}><span>${label}</span><i aria-hidden="true">→</i></a>`;
const link = (href, label) => `<a href="${href}" class="mx-link"><span>${label}</span><i aria-hidden="true"></i></a>`;
const more = (label) => `<span class="mx-more">${label} <i aria-hidden="true"></i></span>`;

const rail = (items) => `<nav class="mx-rail" aria-label="Page sections"><ol>${items.map(([id, l]) => `<li><a href="#${id}"><span>${l}</span></a></li>`).join('')}</ol></nav>`;

const crumbs = (here) => `<ol class="crumbs">
      <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="/markets">Markets</a></li><li aria-hidden="true">/</li>
      <li aria-current="page">${here}</li>
    </ol>`;

const proof = (items) => `<div class="mx-proof">${items.map(([t, l, h]) => `<a href="${h}">${t ? `<b>${t}</b> ` : ''}${l}</a>`).join('\n      ')}</div>`;

const start = (bring, hours) => `<div class="mx-start" aria-label="How a project starts">
      <p class="mx-start-k">How a project starts</p>
      <ol>
        <li><b><i>1</i>Free 20-minute fit call</b><span>You leave with a clear yes, no, or not yet.</span></li>
        <li><b><i>2</i>Discovery, 1 to 2 weeks</b><span>A scoped brief and timeline you sign off.</span></li>
        <li><b><i>3</i>Design and build</b><span>Working software on a real URL every week.</span></li>
      </ol>
      <div class="mx-start-bring">
        <p><b>Bring to the call:</b> ${bring}</p>
        <p><b>Call hours:</b> ${hours}</p>
        <a href="/process">See the full process <i aria-hidden="true">→</i></a>
      </div>
    </div>`;

const hero = (o) => `<header class="mx-hero" id="top" data-dark>
  <div class="mx-hero-bg" aria-hidden="true"><div class="mx-grid"></div><div class="mx-glow"></div></div>
  <div class="wrap">
    <div class="mx-hero-grid">
      <div class="mx-hero-copy">
    ${crumbs(o.here)}
    <p class="mx-kicker mx-pill eyebrow"><i aria-hidden="true"></i>${o.here}</p>
    <h1 class="mx-h1" data-split>${o.h1}</h1>
    <p class="mx-lede lede">${o.lede}</p>
    <div class="mx-actions">
      ${btn('/contact#book', 'Book a free 20-minute fit call')}
      ${link('/contact#brief', 'Send a project brief')}
    </div>
    ${proof(o.proof)}
      </div>
      <div class="mx-hero-vis" data-tilt>
${o.vis}
      </div>
    </div>
    ${start(o.bring, o.hours)}
  </div>
</header>`;

const rows = (items) => `<div class="mx-rows">${items.map(([href, h, p, go], i) => `
      <article class="mx-row" data-x style="--d:${(i % 3) * 0.06}s">
        <span class="mx-row-n">${String(i + 1).padStart(2, '0')}</span>
        <h3><a href="${href}">${h}</a></h3>
        <p>${p}<span class="mx-row-label">${go}</span></p>
        <span class="mx-row-go" aria-hidden="true"></span>
      </article>`).join('')}
    </div>`;

const capsHead = (country) => `<div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">What we build</p>
        <h2 data-split>Capabilities for ${country} teams.</h2>
      </div>
    </div>`;

const deliver = (ticks, light) => `<section class="mx-deliver${light ? ' mx-deliver--light' : ''}" id="deliver" aria-labelledby="deliverH"${light ? '' : ' data-dark'}>
  <div class="wrap mx-deliver-grid">
    <div>
      <p class="mx-kicker eyebrow">How we deliver</p>
      <h2 id="deliverH" data-split>Remote-first, in-house delivery.</h2>
      <p class="mx-body" data-x>In-house design and engineering - no opaque subcontracting. Weekly demos on a live URL until you sign off. <a href="/about">About the studio</a> · <a href="/process">How we work</a></p>
    </div>
    <ul class="mx-ticks" data-x>${ticks.map((t) => `<li>${t}</li>`).join('')}</ul>
  </div>
</section>`;

const who = (p, items) => `<section class="mx-sec mx-sec--paper" id="who" aria-labelledby="whoH">
  <div class="wrap mx-who">
    <div class="mx-who-side">
      <p class="mx-kicker eyebrow">Who this is for</p>
      <h2 id="whoH" data-split>Desks we actually take on.</h2>
      <p class="mx-body" data-x>${p}</p>
    </div>
    <ul class="mx-who-list">${items.map((t, i) => `<li data-x style="--d:${i * 0.06}s"><span>${t}</span></li>`).join('')}</ul>
  </div>
</section>`;

const MARKETS = [['us', 'US', 'United States', 'America/New_York', 'New York'], ['uk', 'UK', 'United Kingdom', 'Europe/London', 'London'], ['uae', 'UAE', 'United Arab Emirates', 'Asia/Dubai', 'Dubai'], ['ca', 'CA', 'Canada', 'America/Toronto', 'Toronto'], ['au', 'AU', 'Australia', 'Australia/Sydney', 'Sydney']];
const sw = (cur) => `<section class="mx-switch" id="markets" aria-labelledby="mktH">
  <div class="wrap">
    <div class="mx-switch-head">
      <div>
        <p class="mx-kicker eyebrow">Markets we serve</p>
        <h2 id="mktH" data-split>Five markets, one in-house team.</h2>
      </div>
      <p class="mx-body">Local time in each market right now. The studio works from Ahmedabad, India (<span data-tz="Asia/Kolkata">IST</span>).</p>
    </div>
    <nav class="mx-switch-grid" aria-label="Other markets">${MARKETS.map(([k, c, n, tz, city]) => `<a href="/markets/${k}"${k === cur ? ' aria-current="page"' : ''} data-x><span class="mx-sw-code">${c}</span><span><span class="mx-sw-name">${n}</span><span class="mx-sw-time"><span class="mx-sw-city">${city}</span><span data-tz="${tz}">local time</span></span></span></a>`).join('\n      ')}</nav>
  </div>
</section>`;

const grab = (src, re, what) => { const m = src.match(re); must(m, 'missing ' + what); return m[0]; };
const inquiry = (src, o) => {
  const form = grab(src, /<form class="inq-form" id="pageInquiry"[\s\S]*?<\/form>\s*<div class="inq-done"[\s\S]*?<\/div>/, 'form');
  const copy = grab(src, /<div class="inq-copy">[\s\S]*?<\/div>/, 'inq-copy');
  const h2 = copy.match(/<h2 class="d2" id="inqH">([\s\S]*?)<\/h2>/)[1];
  const lede = copy.match(/<p class="lede">([\s\S]*?)<\/p>/)[1];
  const help = copy.match(/<p class="inq-help">([\s\S]*?)<\/p>/)[1];
  return `<section class="inq-sec mx-inq" id="inquire" aria-labelledby="inqH">
  <div class="wrap">
    <div class="mx-inq-card" data-dark>
      <div class="inq-grid">
        <div class="inq-copy">
          <p class="mx-kicker eyebrow">Start a conversation</p>
          <h2 id="inqH">${h2}</h2>
          <p class="mx-lede lede">${lede}</p>
          <p class="inq-help">${help}</p>
          ${o.trust ? `<p class="mx-trust">${o.trust.map((t) => `<span>${t}</span>`).join('')}</p>` : ''}
        </div>
        <div>
      ${form}
        </div>
      </div>
    </div>
  </div>
</section>`;
};

const cta = (o) => `<section class="mx-cta" aria-labelledby="ctaH">
  <div class="mx-cta-marquee" aria-hidden="true"><span>${o.mark} · ${o.mark} · </span><span>${o.mark} · ${o.mark} · </span></div>
  <div class="wrap">
    <p class="mx-kicker eyebrow">Start a project</p>
    <h2 id="ctaH" data-split>${o.h2}</h2>
    <p class="mx-lede lede" data-x>${o.lede}</p>
    <div class="mx-actions" data-x>
      ${btn('/contact#book', 'Book a free 20-minute fit call')}
      ${link('/contact#brief', 'Send a project brief')}
    </div>
    ${o.assur ? `<p class="mx-assur" data-x>${o.assur.map((a) => `<span>${a}</span>`).join('')}</p>` : ''}
  </div>
</section>`;

const MARKET_RAIL = (extra = []) => rail([['top', 'Overview'], ['build', 'What we build'], ['conditions', 'Conditions'], ...extra, ['deliver', 'Delivery'], ['who', 'Who it is for'], ['markets', 'Markets'], ['inquire', 'Inquire']]);
const CTA_MKT = { h2: 'Talk to the team.', lede: 'A 20-minute fit call or a written brief - reply within one business day.' };

/* ═════════════════════════ US ═════════════════════════ */
const US = (src) => `<main id="main">
<div class="mx-progress" aria-hidden="true"></div>
${MARKET_RAIL([['record', 'One record']])}
${hero({
  here: 'United States',
  h1: 'Custom trucking and SaaS software for <em>US companies</em>',
  lede: 'We design trucking and moving websites, dispatch CRM, fleet dashboards, and B2B SaaS for US carriers, movers, brokers, and operators. Calls overlap Central and Eastern hours, and a rollout does not have to stop the shift. <a href="/pricing">Starting prices</a>.',
  proof: [['Solution', 'Trucking &amp; logistics', '/solutions/trucking-logistics'], ['Solution', 'B2B SaaS products', '/solutions/saas'], ['Service', 'Dispatch CRM development', '/services/crm-development'], ['Case', 'ShiftRail dispatch CRM', '/work/shiftrail-dispatch'], ['Guide', 'Dispatch CRM guide for US trucking', '/insights/trucking-dispatch-crm-guide'], ['', 'Browse by industry', '/industries']],
  bring: 'Your TMS name and the spreadsheet your dispatchers keep open.',
  hours: 'Central and Eastern call hours.',
  vis: `        <figure class="mx-win us-board" data-us-board data-step="0" data-msgs="Board says Truck 112 is free for the lane.|ELD check: 40 min of drive time left. Not enough for this lane.|Truck 087 assigned. Hours checked before booking." aria-label="Sample dispatch row: a truck that looks free is flagged by its remaining hours of service, and a truck with enough hours is assigned instead.">
          <div class="mx-win-top"><span class="mx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mx-win-path">Dispatch · Assign load</span><span class="mx-sample">Sample data</span></div>
          <div class="us-board-h"><div><p>Load #4822 · ATL → CLT</p><small>3h 10m drive · needs a truck</small></div></div>
          <dl class="us-zones">
            <div class="us-zone"><dt>Pacific</dt><dd data-tz="America/Los_Angeles">PT</dd></div>
            <div class="us-zone"><dt>Mountain</dt><dd data-tz="America/Denver">MT</dd></div>
            <div class="us-zone"><dt>Central</dt><dd data-tz="America/Chicago">CT</dd></div>
            <div class="us-zone is-desk"><dt>Eastern · desk</dt><dd data-tz="America/New_York">ET</dd></div>
          </dl>
          <ul class="us-rows">
            <li class="us-r is-risk"><b>Truck 112</b><span class="ln">Atlanta yard</span><span class="hos" style="--h:9%">Drive left · 0h 40m<i></i></span><span class="st" data-st="Free|Short on hours|Not assigned">Free</span></li>
            <li class="us-r is-pick"><b>Truck 087</b><span class="ln">Atlanta yard</span><span class="hos" style="--h:56%">Drive left · 6h 15m<i></i></span><span class="st" data-st="Free|Free|Assigned">Free</span></li>
            <li class="us-r"><b>Truck 140</b><span class="ln">On load #4815</span><span class="hos" style="--h:30%">Drive left · 3h 20m<i></i></span><span class="st">On load</span></li>
          </ul>
          <div class="us-board-f"><span data-us-msg aria-live="off">Board says Truck 112 is free for the lane.</span></div>
        </figure>`
})}

<section class="mx-sec" id="build" aria-labelledby="focusH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">What we build</p>
        <h2 id="focusH" data-split>Capabilities for United States teams.</h2>
      </div>
    </div>
    ${rows([
      ['/solutions/freight-broker-software', 'Freight broker software', 'Quoting, carrier sales, load tracking, and billing in one record, shaped around how your brokers cover freight.', 'Freight broker software'],
      ['/solutions/fleet-management-software', 'Fleet management software', 'Fleet dashboards, maintenance and compliance records, and driver apps that read from your existing ELD provider.', 'Fleet management software'],
      ['/solutions/trucking-logistics', 'Dispatch CRM &amp; TMS overlays', 'Bulk assignment, SLA on the row, supervisor overrides, and exception queues built for 200–500 route desks - without forcing a full TMS rip-and-replace.', 'Trucking solutions'],
      ['/services/mobile-applications', 'Driver &amp; field mobile', 'Load acceptance, status updates, document capture, and offline-tolerant flows for drivers and field leads who will not use a shrunk desktop board.', 'Driver mobile apps'],
      ['/solutions/accounting-integrations', 'QuickBooks &amp; operational finance', 'Sync, reconciliation, and exception dashboards when billing still lives in QuickBooks and ops needs a single source of truth.', 'Accounting integrations'],
      ['/solutions/saas', 'B2B SaaS product design', 'MVPs, onboarding paths, multi-tenant roles, and admin workflows for US SaaS teams where signup outpaces activation.', 'SaaS solutions']
    ])}
  </div>
</section>

<section class="mx-sec mx-sec--paper" id="conditions" aria-labelledby="condH">
  <div class="wrap us-cond">
    <div>
      <p class="mx-kicker eyebrow">Operating conditions</p>
      <h2 id="condH" data-split>What makes US trucking builds different.</h2>
      <p class="mx-body" data-x>US carriers and brokers run inside a federal compliance layer that most generic CRMs ignore. The work that matters is getting hours, fuel, and load data into the same record the dispatcher already uses.</p>
      <p class="us-note" data-x>We build the screens and data model that record these obligations; we do not give legal or tax advice, and your compliance owner signs off the rules.</p>
    </div>
    <ul class="us-cond-list">
      <li data-x>ELD and hours-of-service data next to the load, not in a separate portal</li>
      <li data-x style="--d:.05s">IFTA miles and fuel records by jurisdiction, where your build needs them</li>
      <li data-x style="--d:.1s">Load board, factoring, and broker-carrier workflows in one view</li>
      <li data-x style="--d:.15s">QuickBooks Online invoicing and settlement sync</li>
      <li data-x style="--d:.2s">Central, Mountain, and Pacific drivers on one Eastern-time desk</li>
    </ul>
  </div>
</section>

<section class="mx-sec mx-sec--night" id="record" aria-labelledby="recH" data-dark>
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">One load, one record</p>
        <h2 id="recH" data-split>Every obligation on the row the dispatcher already uses.</h2>
      </div>
    </div>
    <div class="us-anat" data-us-anat>
      <div class="us-anat-stage">
        <figure class="mx-win us-rec" aria-label="Sample load record with four layers: hours of service, IFTA miles, linked documents, and QuickBooks sync.">
          <div class="mx-win-top"><span class="mx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mx-win-path">Loads · #4822</span><span class="mx-sample">Sample data</span></div>
          <div class="us-rec-id"><p>#4822 <span>· ATL → CLT</span></p></div>
          <ol class="us-layers">
            <li class="us-layer"><i>01</i><span><b>Hours of service</b><small>Remaining drive time from the ELD</small></span><em>On the row</em></li>
            <li class="us-layer"><i>02</i><span><b>IFTA miles</b><small>Miles and fuel by jurisdiction</small></span><em>Per trip</em></li>
            <li class="us-layer"><i>03</i><span><b>Rate con · POD · invoice</b><small>Three documents, one load</small></span><em>Linked</em></li>
            <li class="us-layer"><i>04</i><span><b>QuickBooks Online</b><small>Synced, failed, or needs review</small></span><em>Logged</em></li>
          </ol>
          <p class="us-stage-cap" style="padding:0 24px 22px">Scroll: each layer lights as you read it.</p>
        </figure>
      </div>
      <ol class="us-steps">
        <li class="us-step"><span class="n">01 · Hours</span><h3>Hours-of-service aware dispatch</h3><p>A driver with forty minutes of drive time left is not available for a three-hour lane, even if the board says they are free. We pull remaining hours from your ELD provider’s API where one exists and show it on the assignment row, so the dispatcher sees the constraint before booking the load rather than after the driver calls in.</p>${link('/services/crm-development', 'Dispatch CRM')}</li>
        <li class="us-step"><span class="n">02 · Miles</span><h3>IFTA and mileage records</h3><p>Quarterly IFTA filing goes wrong when miles by state live in a spreadsheet someone rebuilds every quarter. A custom build can store jurisdiction miles and fuel purchases against the trip as they happen, with an export your accountant or filing tool can use, and a clear flag on trips with missing data.</p>${link('/services/automation-systems', 'Workflow automation')}</li>
        <li class="us-step"><span class="n">03 · Documents</span><h3>Broker, carrier, and factoring flow</h3><p>Rate confirmation, proof of delivery, and the invoice that goes to a factoring company are three documents describing one load. We link them to the same record, so billing does not wait on someone matching PDFs by hand, and the carrier pay status is visible to the desk.</p>${link('/solutions/trucking-logistics', 'Trucking solutions')}</li>
        <li class="us-step"><span class="n">04 · Finance</span><h3>QuickBooks Online sync that can be audited</h3><p>Invoices and settlements sync to QuickBooks Online through its official API, with a log of every record that synced, failed, or needs review. Finance can retry a failed sync without engineering help and can trace any total back to the loads behind it.</p>${link('/solutions/accounting-integrations', 'Accounting integrations')}</li>
      </ol>
    </div>
  </div>
</section>

${deliver(['US-hour overlap for standups and fit calls', 'Async updates in Slack between sessions', 'Phased rollout with feature flags beside live TMS', 'You own repos, Figma, and docs at handoff'], true)}

${who('The page is for US operators who have outgrown spreadsheets beside the TMS, but do not want to replace the TMS. If you need an off-the-shelf TMS, we will tell you which questions to ask a vendor instead.', [
  'Small and mid-size carriers running dispatch from spreadsheets, group texts, and a TMS nobody fully trusts',
  'Freight brokers who need carrier onboarding, rate confirmations, and load status in one console',
  'Auto-transport brokers quoting by VIN and route (see <a href="/solutions/car-transportation">car transportation software</a>)',
  'Ops leads who need a fleet dashboard their supervisors will actually open every morning'
])}

${sw('us')}

${inquiry(src, { trust: ['Central and Eastern call hours.', 'Reply within one business day.'] })}

${cta({ ...CTA_MKT, mark: 'United States' })}
</main>`;

/* ═════════════════════════ UK ═════════════════════════ */
const UK = (src) => `<main id="main">
<div class="mx-progress" aria-hidden="true"></div>
${MARKET_RAIL([['proof', 'Proof']])}
${hero({
  here: 'United Kingdom',
  h1: 'SaaS product design and integrations for <em>UK teams.</em>',
  lede: 'From MVP scope to activation metrics investors ask about - we design and build B2B SaaS, admin panels, and finance workflows that connect to Xero for UK founders and product leads.',
  proof: [['Case', 'PayrollPro SaaS onboarding', '/work/payroll-pro-saas'], ['Guide', 'SaaS MVP guide for UK startups', '/insights/saas-mvp-uk-guide'], ['', 'Browse by industry', '/industries']],
  bring: 'Your product or prototype, and any Xero setup it has to work with.',
  hours: 'GMT-friendly calls.',
  vis: `        <figure class="mx-win uk-q" data-uk-q aria-label="Sample security questionnaire from an enterprise buyer. Each question moves from answered with a promise to answered with a screenshot of a real admin feature.">
          <div class="mx-win-top"><span class="mx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mx-win-path">Enterprise review · Security questionnaire</span><span class="mx-sample">Sample</span></div>
          <div class="uk-q-h"><p>First enterprise customer</p><small>What the buyer asks before signing</small></div>
          <ul class="uk-qs">
            <li class="uk-qi"><span><b>How is a customer’s data exported?</b><small>Export flow in the admin panel</small></span><span class="st"><span class="no">Promise</span><span class="ok">Screenshot</span></span></li>
            <li class="uk-qi"><span><b>How is it corrected and deleted?</b><small>Correction and deletion flows</small></span><span class="st"><span class="no">Promise</span><span class="ok">Screenshot</span></span></li>
            <li class="uk-qi"><span><b>Who saw it?</b><small>Role-based access and an audit log</small></span><span class="st"><span class="no">Promise</span><span class="ok">Screenshot</span></span></li>
            <li class="uk-qi"><span><b>Do the VAT figures trace to source records?</b><small>Digital link to Xero or QuickBooks</small></span><span class="st"><span class="no">Promise</span><span class="ok">Screenshot</span></span></li>
          </ul>
          <div class="uk-q-f"><span><b data-uk-count>0</b> of 4 shown, not promised</span><span class="bar"><i></i></span></div>
        </figure>`
})}

<section class="mx-sec" id="build" aria-labelledby="focusH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">What we build</p>
        <h2 id="focusH" data-split>Capabilities for United Kingdom teams.</h2>
      </div>
    </div>
    <div class="uk-caps">
      <article class="uk-cap" data-x><span class="n" aria-hidden="true">01</span><h3><a href="/solutions/saas">SaaS MVP &amp; onboarding</a></h3><p>Role-based entry, progressive disclosure, and time-to-value flows scoped for a 12-week launch - not a feature wishlist that delays your first paid pilot.</p>${more('SaaS solutions')}</article>
      <article class="uk-cap" data-x style="--d:.08s"><span class="n" aria-hidden="true">02</span><h3><a href="/solutions/accounting-integrations">Xero &amp; finance integrations</a></h3><p>Sync, mapping, and reconciliation UX finance teams can audit - built for UK accounting norms and multi-entity setups.</p>${more('Xero integrations')}</article>
      <article class="uk-cap" data-x style="--d:.16s"><span class="n" aria-hidden="true">03</span><h3><a href="/services/saas-platforms">Multi-tenant admin &amp; permissions</a></h3><p>Customer vs admin surfaces, seat management, and permission models that scale past the first ten accounts.</p>${more('SaaS product design')}</article>
    </div>
  </div>
</section>

<section class="mx-sec mx-sec--paper" id="conditions" aria-labelledby="condH">
  <div class="wrap uk-check">
    <div>
      <p class="mx-kicker eyebrow">Operating conditions</p>
      <h2 id="condH" data-split>What makes UK SaaS and logistics builds different.</h2>
      <p class="mx-body" data-x>UK products tend to meet tax, data-protection, and transport rules earlier than founders expect, often at the first enterprise customer. Designing for them from the start is cheaper than retrofitting. We build the screens and data model that record these obligations; we do not give legal or tax advice, and your compliance owner signs off the rules.</p>
    </div>
    <ul class="uk-check-list">
      <li data-x>Making Tax Digital-friendly records when finance workflows touch VAT</li>
      <li data-x style="--d:.06s">Xero-first accounting integration, with QuickBooks where needed</li>
      <li data-x style="--d:.12s">UK GDPR: data export, deletion, and audit trails in the admin panel</li>
      <li data-x style="--d:.18s">Drivers’ hours and tachograph data for operators with HGV fleets</li>
      <li data-x style="--d:.24s">GB and EU loads on one desk, with customs status where it applies</li>
    </ul>
  </div>
</section>

<section class="mx-sec" id="proof" aria-labelledby="proofH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">Built in, not bolted on</p>
        <h2 id="proofH" data-split>Four things UK buyers check early.</h2>
      </div>
    </div>
    <div class="uk-bento">
      <article class="uk-tile" data-x>
        <div class="uk-vis" aria-hidden="true">
          <div class="uk-link"><span>Your product<small>invoice created</small></span><i></i><span>Xero<small>or QuickBooks</small></span><i></i><span>VAT figures<small>traceable</small></span><p class="x">Not <s>retyped from one tool into another</s></p></div>
        </div>
        <p class="k">Tax</p>
        <h3>Xero and Making Tax Digital</h3>
        <p>Making Tax Digital for VAT expects digital records with a digital link between systems, not figures retyped from one tool into another. When your product creates invoices or expenses, we sync them to Xero or QuickBooks through official APIs, so the VAT figures in your accounting tool trace back to source records.</p>
        ${link('/solutions/accounting-integrations', 'Accounting integrations')}
      </article>
      <article class="uk-tile is-ink" data-x style="--d:.08s" data-dark>
        <div class="uk-vis" data-uk-admin>
          <div class="uk-admin">
            <div class="uk-admin-row"><span>Customer · <b>Acme Ltd</b></span><span class="mx-sample">Sample</span></div>
            <div class="uk-admin-btns" role="group" aria-label="Try an admin action"><button type="button" aria-pressed="false" data-act="Data exported">Export</button><button type="button" aria-pressed="false" data-act="Record corrected">Correct</button><button type="button" aria-pressed="false" data-act="Data deleted">Delete</button></div>
            <ol class="uk-log" aria-live="polite" aria-label="Audit log"><li><span>09:12</span><b>Viewed</b><span>by Support · logged</span></li></ol>
          </div>
        </div>
        <p class="k">Data protection</p>
        <h3>UK GDPR in the admin panel</h3>
        <p>Enterprise buyers ask early how a customer’s data is exported, corrected, and deleted, and who saw it. We build these as real admin features: role-based access, an audit log, and export and deletion flows. They answer a security questionnaire with screenshots rather than promises.</p>
        ${link('/services/saas-platforms', 'SaaS platforms')}
      </article>
      <article class="uk-tile" data-x>
        <div class="uk-vis uk-act" data-in aria-hidden="true">
          <svg viewBox="0 0 320 120" preserveAspectRatio="none"><g class="grid"><line x1="0" y1="30" x2="320" y2="30"/><line x1="0" y1="60" x2="320" y2="60"/><line x1="0" y1="90" x2="320" y2="90"/></g><path class="su" d="M0 100 C60 92 110 70 160 52 S260 22 320 12"/><path class="ac" d="M0 112 C50 110 90 104 130 92 S200 60 240 46 S300 30 320 26"/><circle class="ev" cx="130" cy="92" r="5"/></svg>
          <div class="uk-act-leg"><span class="su">Sign-ups</span><span>Activation event reached</span><span class="mx-sample mx-sample--l">Illustrative</span></div>
        </div>
        <p class="k">Investors</p>
        <h3>Activation metrics investors ask about</h3>
        <p>Seed and Series A conversations turn on activation and retention, not sign-ups. We define the activation event with you, instrument it from the first release, and design onboarding around reaching it, so the dashboard in your investor update reflects behaviour you have deliberately shaped.</p>
        ${link('/insights/saas-mvp-uk-guide', 'UK SaaS MVP guide')}
      </article>
      <article class="uk-tile is-ink" data-x style="--d:.08s" data-dark>
        <div class="uk-vis" data-in aria-hidden="true">
          <div class="uk-hours">
            <div class="uk-hours-row"><span>Driver hours</span><span class="uk-hours-bar"><i class="d" style="width:52%"></i><i class="b" style="width:10%"></i><i class="x" style="width:22%"></i></span></div>
            <div class="uk-hours-row"><span>Legend</span><span style="display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px"><span>■ Driving</span><span style="color:#A5B4FC">■ Break</span><span style="color:#F2C46A">■ Planned job runs over</span></span></div>
            <p class="uk-hours-msg">Conflict shown before the job is assigned</p>
          </div>
        </div>
        <p class="k">Transport</p>
        <h3>Operator licence and drivers’ hours data</h3>
        <p>UK haulage operators work under an operator licence and drivers’ hours rules recorded on tachographs. Dispatch tools that ignore this let a desk plan work a driver cannot legally do. We bring hours and vehicle data into the planning view, so the conflict appears before the job is assigned.</p>
        ${link('/solutions/trucking-logistics', 'Trucking solutions')}
      </article>
    </div>
  </div>
</section>

${deliver(['GMT-friendly call windows', 'Investor-ready activation instrumentation from day one', 'Written scope before build starts', 'Handoff: Figma, GitHub, and runbooks'])}

${who('The page is for UK founders and operators who need a product built properly, not a prototype that has to be thrown away after the first round. If a no-code MVP is the better first step, we will say so.', [
  'Pre-seed to Series A B2B SaaS founders scoping an MVP or a v2 rebuild',
  'Product leads who need onboarding and an admin panel enterprise customers will accept',
  'Finance teams reconciling a product’s data against Xero every month by hand',
  'Haulage and courier operators planning work across GB and EU routes'
])}

${sw('uk')}

${inquiry(src, { trust: ['GMT-friendly call windows.', 'Reply within one business day.'] })}

${cta({ ...CTA_MKT, mark: 'United Kingdom' })}
</main>`;

/* ═════════════════════════ AU ═════════════════════════ */
const AU_STATES = [
  ['NSW', 'New South Wales', 'HVNL'], ['VIC', 'Victoria', 'HVNL'], ['QLD', 'Queensland', 'HVNL'], ['SA', 'South Australia', 'HVNL'],
  ['TAS', 'Tasmania', 'HVNL'], ['ACT', 'Australian Capital Territory', 'HVNL'], ['WA', 'Western Australia', 'OWN'], ['NT', 'Northern Territory', 'OWN']
];
const AU = (src) => `<main id="main">
<div class="mx-progress" aria-hidden="true"></div>
${MARKET_RAIL([['chain', 'Chain of Responsibility']])}
${hero({
  here: 'Australia',
  h1: 'Trucking and SaaS software for <em>Australian teams.</em>',
  lede: 'Custom dispatch CRM, fleet dashboards, driver apps, and B2B SaaS for Australian operators - built with AEST/AEDT overlap for demos and Xero-first finance integrations your back office trusts.',
  proof: [['Case', 'FinanceSync reconciliation hub', '/work/finance-sync-hub'], ['Guide', 'CRM dashboard UX patterns', '/insights/crm-dashboard-ux-patterns'], ['', 'Browse by industry', '/industries']],
  bring: 'Your product or operations workflow, and your Xero setup.',
  hours: 'AEST/AEDT overlap for demos.',
  vis: `        <figure class="mx-win au-chain" data-au-chain aria-label="Sample Chain of Responsibility record: consignor, scheduler, loader, and driver each leave a timestamped check on the same job.">
          <div class="mx-win-top"><span class="mx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mx-win-path">Job #A-2207 · Chain of Responsibility</span><span class="mx-sample">Sample data</span></div>
          <div class="au-chain-h"><div><p>Sydney → Brisbane</p><small>Every party in the chain leaves a record</small></div></div>
          <ol class="au-links">
            <li class="au-link"><i>01</i><span><b>Consignor</b><small>Job requested · mass declared</small></span><time>05:42</time></li>
            <li class="au-link"><i>02</i><span><b>Scheduler</b><small>Planned · work and rest hours checked</small></span><time>05:58</time></li>
            <li class="au-link"><i>03</i><span><b>Loader</b><small>Mass limit checked at the dock</small></span><time>06:31</time></li>
            <li class="au-link"><i>04</i><span><b>Driver</b><small>Departed · fatigue limits respected</small></span><time>06:47</time></li>
          </ol>
          <div class="au-chain-f"><span>Who planned it, what was checked, and when</span><b>One trail</b></div>
        </figure>`
})}

<section class="mx-sec mx-sec--paper" id="build" aria-labelledby="focusH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">What we build</p>
        <h2 id="focusH" data-split>Capabilities for Australia teams.</h2>
      </div>
    </div>
    <div class="au-caps">
      <article class="au-cap" data-x><p class="k">01 · Operations</p><h3><a href="/solutions/trucking-logistics">Dispatch &amp; fleet operations</a></h3><p>Load boards, bulk reassignment, and exception workflows for Australian carriers and brokers running mixed TMS and spreadsheet ops.</p>${more('Trucking solutions')}</article>
      <article class="au-cap" data-x style="--d:.08s"><p class="k">02 · Finance</p><h3><a href="/solutions/accounting-integrations">Accounting sync</a></h3><p>QuickBooks and Xero connectors with reconciliation views - fewer month-end surprises for Australian finance teams.</p>${more('Finance integrations')}</article>
      <article class="au-cap" data-x style="--d:.16s"><p class="k">03 · Product</p><h3><a href="/solutions/saas">SaaS product delivery</a></h3><p>Onboarding, admin panels, and activation analytics for Australian B2B SaaS founders shipping their next milestone.</p>${more('SaaS solutions')}</article>
    </div>
  </div>
</section>

<section class="mx-sec mx-sec--night" id="conditions" aria-labelledby="condH" data-dark>
  <div class="wrap">
    <div class="au-cond">
      <div>
        <p class="mx-kicker eyebrow">Operating conditions</p>
        <h2 id="condH" data-split>What makes Australian builds different.</h2>
        <p class="mx-body" data-x>Australian transport operators carry legal obligations through the whole supply chain, and finance teams overwhelmingly run on Xero. Software that ignores either one becomes a second job for the people using it. We build the screens and data model that record these obligations; we do not give legal or tax advice, and your compliance owner signs off the rules.</p>
      </div>
      <ul class="au-cond-list">
        <li data-x>Heavy Vehicle National Law and Chain of Responsibility records</li>
        <li data-x style="--d:.05s">Fatigue management and work diary data beside dispatch</li>
        <li data-x style="--d:.1s">Xero-first invoicing, with GST coded for BAS reporting</li>
        <li data-x style="--d:.15s">Separate rules where WA and NT run their own heavy vehicle regimes</li>
        <li data-x style="--d:.2s">Privacy Act-conscious access control and audit trails</li>
      </ul>
    </div>
    <div class="au-jur" data-au-jur style="margin-top:clamp(64px,8vw,120px)">
      <div>
        <p class="mx-kicker eyebrow">National operators, state differences</p>
        <h3 class="mx-h3">A rule change is a setting, not a rebuild.</h3>
        <p class="mx-body" data-x>The national law applies in most states and territories, but Western Australia and the Northern Territory run their own heavy vehicle regimes. Operators running interstate need rules configurable by jurisdiction, not hard-coded once. We model them as data, so a rule change is a setting, not a rebuild.</p>
        <p style="margin-top:22px">${link('/services/automation-systems', 'Workflow automation')}</p>
      </div>
      <div>
        <div class="au-map" role="group" aria-label="Pick a state or territory to see which rule set applies">${AU_STATES.map(([c, n, r], i) => `<button type="button" class="au-st${r === 'OWN' ? ' is-own' : ''}" aria-pressed="${i === 0}" data-rule="ruleset: ${r === 'OWN' ? c.toLowerCase() + '-own' : 'hvnl'}" data-name="${n}" data-note="${r === 'OWN' ? 'Runs its own heavy vehicle regime, so the job uses its own rule set.' : 'Heavy Vehicle National Law applies, so the job uses the national rule set.'}"><b>${c}</b><span>${r === 'OWN' ? 'Own regime' : 'HVNL'}</span></button>`).join('')}</div>
        <p class="au-rule" data-au-rule aria-live="polite"><code>ruleset: hvnl</code><b>New South Wales</b><small>Heavy Vehicle National Law applies, so the job uses the national rule set.</small></p>
      </div>
    </div>
  </div>
</section>

<section class="mx-sec" id="chain" aria-labelledby="chainH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">In the workflow, not beside it</p>
        <h2 id="chainH" data-split>Records the desk keeps without a second job.</h2>
      </div>
    </div>
    <div class="au-feats">
      <article class="au-feat" data-x>
        <div class="au-feat-vis" aria-hidden="true">
          <ol class="au-cor">
            <li><time>05:58</time><b>Scheduler planned job #A-2207</b><span>Hours checked</span></li>
            <li><time>06:31</time><b>Loader confirmed mass</b><span>Within limit</span></li>
            <li><time>06:47</time><b>Driver departed</b><span>Logged</span></li>
          </ol>
          <span class="mx-sample" style="justify-self:start">Sample data</span>
        </div>
        <div>
          <p class="k">Chain of Responsibility</p>
          <h3>Chain of Responsibility evidence</h3>
          <p>Under the Heavy Vehicle National Law, schedulers, loaders, and consignors can share responsibility for a breach, not only the driver. The useful software response is a record: who planned the job, which hours and mass limits were checked, and when. We build that trail into the dispatch workflow instead of a separate form nobody completes.</p>
          ${link('/solutions/trucking-logistics', 'Trucking solutions')}
        </div>
      </article>
      <article class="au-feat" data-x>
        <div class="au-feat-vis" data-in aria-hidden="true">
          <div class="au-fat-row"><span>Work time</span><span class="bar"><i style="--w:82%"></i></span><em>Near limit</em></div>
          <div class="au-fat-row is-low"><span>Rest due</span><span class="bar"><i style="--w:18%"></i></span><em>Soon</em></div>
          <p class="au-fat-msg">Next job would breach the rest break. Shown at planning time.</p>
          <span class="mx-sample" style="justify-self:start">Sample data</span>
        </div>
        <div>
          <p class="k">Fatigue</p>
          <h3>Fatigue and work diary data</h3>
          <p>Fatigue rules decide whether a driver can take the next job. Where your electronic work diary or telematics provider offers an API, we show remaining work and rest time on the assignment view, so the desk respects the limit at planning time instead of discovering it at a roadside check.</p>
          ${link('/services/crm-development', 'Dispatch CRM')}
        </div>
      </article>
      <article class="au-feat" data-x>
        <div class="au-feat-vis" aria-hidden="true">
          <ul class="au-xr">
            <li><b>INV-3301</b><code>GST</code><span class="ok">Synced</span></li>
            <li><b>BILL-0918</b><code>GST</code><span class="ok">Synced</span></li>
            <li class="is-retry"><b>INV-3304</b><code>GST</code><span class="re">Retry</span></li>
          </ul>
          <span class="mx-sample" style="justify-self:start">Sample data</span>
        </div>
        <div>
          <p class="k">Finance</p>
          <h3>Xero and BAS-ready records</h3>
          <p>Xero is widely used by Australian small and mid-size businesses. We sync invoices, bills, and settlements through Xero’s official API with GST coded correctly at the source, so BAS preparation starts from clean records, and every synced or failed item is logged with a retry path.</p>
          ${link('/solutions/accounting-integrations', 'Accounting integrations')}
        </div>
      </article>
    </div>
  </div>
</section>

${deliver(['AEST/AEDT overlap for live demos and stand-ups', 'Privacy Act-conscious practices in delivery', 'Phased rollout without stopping operations', 'Full code and design ownership at close'])}

${who('The page is for Australian operators and SaaS teams whose current tools were built for another market. If a local off-the-shelf product already covers your case, we will tell you so on the first call.', [
  'Line-haul and regional carriers planning interstate work from spreadsheets and phone calls',
  'Car-carrying and vehicle-logistics operators quoting by route and vehicle (see <a href="/solutions/car-transportation">car transportation software</a>)',
  'Finance teams reconciling operations data against Xero before every BAS',
  'Australian B2B SaaS founders who need onboarding and admin built properly from v1'
])}

${sw('au')}

${inquiry(src, { trust: ['AEST/AEDT call windows.', 'Reply within one business day.'] })}

${cta({ ...CTA_MKT, mark: 'Australia' })}
</main>`;

/* ═════════════════════════ UAE ═════════════════════════ */
const UAE = (src) => {
  const faqs = [
    ['Do you have an office in the UAE?', 'No. KRIVA is remote-first from Ahmedabad, India, and we do not claim a local presence we do not have. Gulf Standard Time is one and a half hours behind us, so a normal UAE working day overlaps almost entirely with ours - in practice that means same-day replies and live sessions at ordinary hours for both sides.'],
    ['Can you build Arabic and English in the same product?', 'Yes, and it is much cheaper to plan for at the start. We structure layouts, components, and content for bidirectional text from the wireframe stage. Translation itself is usually handled by your team or a translation partner; what we own is making sure the interface does not break when the direction flips.'],
    ['Which accounting systems can you integrate with?', 'QuickBooks and Xero are the two we work with most, using their official APIs. For regional ERPs and bank feeds we work against whatever documented API exists, and we say plainly when a system has no viable integration path rather than building a fragile scraper. See <a href="/solutions/accounting-integrations">accounting integrations</a> for how the reconciliation workflow is built.'],
    ['Who owns the code and the designs?', 'You do. Repositories, Figma files, and documentation transfer to you at close or earlier if you prefer. There is no licensing arrangement and no lock-in to us for future work.'],
    ['Can you improve an existing system instead of rebuilding it?', 'Usually, and it is normally the better option. We assess what your current platform can actually support, then build beside it in phases behind feature flags so the desk keeps running while the work lands. A full rebuild only makes sense when the platform genuinely cannot carry the workload. Our <a href="/process">delivery process</a> sets out how the phasing works.']
  ];
  const tabs = [
    ['Multi-entity, multi-currency operations', 'Entities and currency', 'Free-zone and mainland entities usually have separate books, separate licences, and separate reporting - but one dispatch desk and one customer. We model the entity boundary in the data rather than in a spreadsheet, so a controller can see group-level exposure and still produce per-entity reporting. Settlement in AED beside USD or EUR is handled at the transaction level, not reconciled by hand at month end.', '/solutions/accounting-integrations', 'Accounting integrations'],
    ['Bilingual and right-to-left interfaces', 'Arabic and English', 'Arabic support is a layout problem before it is a translation problem. Retrofitting right-to-left into a product built left-to-right means reworking navigation, tables, form flow, icons, and every mixed-direction string where an Arabic label sits next to a Latin reference number. We structure the interface for bidirectional text from the first wireframe, which costs very little up front and a great deal later.', '/services/ui-ux-design', 'UI/UX design'],
    ['Regional finance and tax reporting', 'Finance and tax', 'Finance workflows have to survive audit. We build reconciliation views that show which records synced, which failed, and why - with a retry path an operator can run without engineering help. Where UAE VAT and e-invoicing obligations apply, the reporting surface is built to expose the underlying records rather than a summary figure nobody can trace back.', '/services/api-integrations', 'API integrations']
  ];
  return `<main id="main">
<div class="mx-progress" aria-hidden="true"></div>
${rail([['top', 'Overview'], ['build', 'What we build'], ['conditions', 'Conditions'], ['depth', 'In depth'], ['deliver', 'Delivery'], ['who', 'Who it is for'], ['faq', 'Questions'], ['markets', 'Markets'], ['inquire', 'Inquire']])}
${hero({
  here: 'United Arab Emirates',
  h1: 'Logistics and SaaS software for <em>UAE operators.</em>',
  lede: 'Fleet visibility, dispatch consoles, customer portals, and finance integrations for UAE logistics, transport, and B2B SaaS teams that need software matched to how the desk actually runs.',
  proof: [['Solution', 'Trucking &amp; logistics', '/solutions/trucking-logistics'], ['Solution', 'Car transportation', '/solutions/car-transportation'], ['Service', 'Fleet dashboards', '/services/dashboard-design'], ['', 'Browse by industry', '/industries']],
  bring: 'How dispatch, fleet, and finance work on your desk today.',
  hours: 'Gulf-time overlap.',
  vis: `        <figure class="mx-win ae-card" data-ae aria-label="Sample load record shown in English and in Arabic. The same record mirrors its layout from left-to-right to right-to-left.">
          <div class="mx-win-top"><span class="mx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mx-win-path">Loads · one record</span><span class="ae-toggle" role="group" aria-label="Interface language"><button type="button" aria-pressed="true">English</button><button type="button" aria-pressed="false" lang="ar">عربي</button></span></div>
          <div class="ae-body" dir="ltr" lang="en">
            <div class="ae-id"><p>Load <bdi>DXB-4471</bdi></p><span class="mx-sample">Sample data</span></div>
            <div class="ae-route"><b>Dubai</b><i></i><span class="bd">Border checkpoint</span><i></i><b>Riyadh</b></div>
            <dl class="ae-fields">
              <div class="ae-f"><dt>Entity</dt><dd>Free zone<small>Billing entity</small></dd></div>
              <div class="ae-f"><dt>Settlement</dt><dd><bdi>AED · USD</bdi><small>Per transaction</small></dd></div>
              <div class="ae-f"><dt>Status</dt><dd>Customs hold<small>Not a driver delay</small></dd></div>
            </dl>
            <div class="ae-acts"><span class="p">Chase customs paperwork</span><span class="w">Driver on schedule</span></div>
          </div>
          <div class="ae-body" dir="rtl" lang="ar" hidden>
            <div class="ae-id"><p>شحنة <bdi>DXB-4471</bdi></p><span class="mx-sample">Sample data</span></div>
            <div class="ae-route"><b>دبي</b><i></i><span class="bd">نقطة الحدود</span><i></i><b>الرياض</b></div>
            <dl class="ae-fields">
              <div class="ae-f"><dt>الكيان</dt><dd>منطقة حرة<small>كيان الفوترة</small></dd></div>
              <div class="ae-f"><dt>التسوية</dt><dd><bdi>AED · USD</bdi><small>لكل معاملة</small></dd></div>
              <div class="ae-f"><dt>الحالة</dt><dd>حجز جمركي<small>ليس تأخيرًا من السائق</small></dd></div>
            </dl>
            <div class="ae-acts"><span class="p">متابعة المستندات الجمركية</span><span class="w">السائق في الموعد</span></div>
          </div>
          <div class="ae-foot"><span>Same record · layout <b data-ae-dir>Left to right</b></span><span>Bidirectional from the first wireframe</span></div>
        </figure>`
})}

<section class="mx-sec" id="build" aria-labelledby="focusH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">What we build</p>
        <h2 id="focusH" data-split>Capabilities for United Arab Emirates teams.</h2>
      </div>
    </div>
    <div class="ae-caps">
      <article class="ae-cap" data-x><p class="k"><span>Fleet</span><span aria-hidden="true">01</span></p><h3><a href="/services/dashboard-design">Fleet &amp; logistics dashboards</a></h3><p>Exception handling, SLA visibility, and supervisor queues for high-volume transport ops - not generic admin templates.</p>${more('Fleet dashboards')}</article>
      <article class="ae-cap" data-x style="--d:.08s"><p class="k"><span>Auto transport</span><span aria-hidden="true">02</span></p><h3><a href="/solutions/car-transportation">Car transport &amp; broker ops</a></h3><p>Quote-to-POD flows, carrier dispatch, tracking, and customer portals for auto-transport and relocation operators.</p>${more('Car transportation software')}</article>
      <article class="ae-cap" data-x style="--d:.16s"><p class="k"><span>SaaS</span><span aria-hidden="true">03</span></p><h3><a href="/solutions/saas">B2B SaaS platforms</a></h3><p>Multi-tenant products with Arabic/English-ready UX architecture, permissions, and onboarding that converts trials.</p>${more('SaaS solutions')}</article>
    </div>
  </div>
</section>

<section class="mx-sec mx-sec--night" id="conditions" aria-labelledby="condH" data-dark>
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">Operating conditions</p>
        <h2 id="condH" data-split>What makes UAE builds different.</h2>
      </div>
      <p class="mx-body mx-head-aside" data-x>Most logistics and SaaS software assumes a single country, one currency, one language, and one tax regime. UAE operators rarely work that way, and the gap usually shows up as spreadsheets sitting beside the system rather than inside it.</p>
    </div>
    <ul class="ae-ledger">
      <li data-x><span>01</span>Mainland and free-zone entities under one operator view</li>
      <li data-x style="--d:.05s"><span>02</span>AED alongside USD and other settlement currencies</li>
      <li data-x style="--d:.1s"><span>03</span>Arabic and English interfaces, including right-to-left layout</li>
      <li data-x style="--d:.15s"><span>04</span>Cross-border GCC movements with customs documentation</li>
      <li data-x style="--d:.2s"><span>05</span>VAT treatment and e-invoicing requirements as they phase in</li>
    </ul>
    <div class="ae-road" style="margin-top:clamp(64px,8vw,120px)">
      <div>
        <p class="mx-kicker eyebrow">Cross-border</p>
        <h3 class="mx-h3">Cross-border and customs-aware dispatch</h3>
        <p class="mx-body" data-x>A load moving Dubai to Riyadh is not the same object as a load moving across one emirate. It carries border wait time, customs paperwork, and a driver who may be out of coverage for hours. Dispatch consoles that ignore this show a job as simply late. We model the checkpoint states explicitly so the desk can tell a customs hold apart from a driver problem and escalate the right one.</p>
        <p style="margin-top:22px">${link('/solutions/trucking-logistics', 'Trucking &amp; logistics')}</p>
      </div>
      <div class="ae-track" data-x>
        <ol class="ae-states" data-track aria-label="Sample checkpoint states for a Dubai to Riyadh load">
          <li class="ae-s"><i aria-hidden="true"></i><span><b>Departed Dubai</b><small>Tracked within coverage</small></span></li>
          <li class="ae-s"><i aria-hidden="true"></i><span><b>Out of coverage</b><small>Expected on this leg, not an alert</small></span></li>
          <li class="ae-s is-hold"><i aria-hidden="true"></i><span><b>At the border · customs hold</b><small>Paperwork owner notified, not the driver</small></span></li>
          <li class="ae-s"><i aria-hidden="true"></i><span><b>Cleared · arriving Riyadh</b><small>ETA recalculated from the real state</small></span></li>
        </ol>
        <div class="ae-vs"><div><b>Customs hold</b>Escalate to whoever owns the paperwork.</div><div><b>Driver problem</b>Escalate to the driver and the desk.</div></div>
      </div>
    </div>
  </div>
</section>

<section class="mx-sec mx-sec--paper" id="depth" aria-labelledby="depthH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">In depth</p>
        <h2 id="depthH" data-split>Entity, language, and audit in the same record.</h2>
      </div>
    </div>
    <div class="ae-tabs" data-ae-tabs>
      <div class="ae-tablist" role="tablist" aria-label="UAE build details" aria-orientation="vertical">${tabs.map((t, i) => `<button type="button" class="ae-tab" role="tab" id="ae-tab-${i}" aria-controls="ae-pan-${i}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}><span>0${i + 1}</span>${t[1]}</button>`).join('')}</div>
      <div>${tabs.map((t, i) => `
        <div class="ae-panel" role="tabpanel" id="ae-pan-${i}" aria-labelledby="ae-tab-${i}"${i ? ' hidden' : ''}>
          <p class="k">0${i + 1} · ${t[1]}</p>
          <h3>${t[0]}</h3>
          <p>${t[2]}</p>
          ${link(t[3], t[4])}
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

${deliver(['Gulf Standard Time overlap for working sessions', 'Bilingual-ready UX structure where needed', 'Integrations with regional payment and accounting tools', 'Security-conscious handoff and documentation'])}

${who('The page is for UAE operators whose current system cannot hold entity, language, and border state in the same record. If the work is a brochure site or a generic CRM install, we will say so on the first call.', [
  'Fleet and 3PL desks moving intra-emirate and Dubai–Riyadh loads on mixed TMS, sheets, and WhatsApp',
  'Auto-transport and relocation operators quoting in AED and settling in mixed currencies',
  'Free-zone SaaS teams that need Arabic and English admin from the first tenant',
  'Controllers who cannot close mainland and free-zone books until ops and accounting agree'
]).replace('mx-sec mx-sec--paper', 'mx-sec')}

<section class="mx-sec mx-sec--paper" id="faq" aria-labelledby="faqH">
  <div class="wrap ae-faq">
    <div class="ae-faq-side">
      <p class="mx-kicker eyebrow">Common questions</p>
      <h2 id="faqH" data-split>Before the first call.</h2>
      <p class="mx-body" data-x>Straight answers about working with a remote studio from the UAE. If something here does not match your situation, say so in the brief and we will tell you honestly whether we are a fit.</p>
    </div>
    <div class="ae-faq-list">${faqs.map(([q, a], i) => `
      <div class="ae-q">
        <h3><button type="button" aria-expanded="true" aria-controls="ae-a-${i}" id="ae-q-${i}"><span class="qn">0${i + 1}</span><span>${q}</span><span class="qi" aria-hidden="true"></span></button></h3>
        <div class="ae-a" id="ae-a-${i}" role="region" aria-labelledby="ae-q-${i}"><div><p>${a}</p></div></div>
      </div>`).join('')}
    </div>
  </div>
</section>

${sw('uae')}

${inquiry(src, { trust: ['Gulf Standard Time overlap.', 'Reply within one business day.'] })}

${cta({ ...CTA_MKT, mark: 'United Arab Emirates' })}
</main>`;
};

/* ═════════════════════════ CA ═════════════════════════ */
const CA = (src) => `<main id="main">
<div class="mx-progress" aria-hidden="true"></div>
${MARKET_RAIL([['border', 'Cross-border'], ['depth', 'In depth']])}
${hero({
  here: 'Canada',
  h1: 'Trucking and SaaS software for <em>Canadian teams.</em>',
  lede: 'Custom dispatch CRM, fleet dashboards, driver apps, and B2B SaaS for Canadian operators - built with North American timezone overlap and finance integrations your back office trusts.',
  proof: [['Case', 'FinanceSync reconciliation hub', '/work/finance-sync-hub'], ['Guide', 'CRM dashboard UX patterns', '/insights/crm-dashboard-ux-patterns'], ['', 'Browse by industry', '/industries']],
  bring: 'Your TMS or product, and the finance system your back office uses.',
  hours: 'North American time zone overlap.',
  vis: `        <figure class="mx-win ca-inv" data-ca-inv aria-label="Sample invoice whose sales tax lines change with the province: Ontario shows HST, Quebec shows GST and QST, Alberta shows GST, British Columbia shows GST and PST.">
          <div class="mx-win-top"><span class="mx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mx-win-path">Billing · Invoice INV-1048</span><span class="mx-sample">Sample data</span></div>
          <div class="ca-provs" role="group" aria-label="Province">
            <button type="button" class="ca-prov" aria-pressed="true" data-name="Ontario" data-tax="HST"><b>ON</b><small>Ontario</small></button>
            <button type="button" class="ca-prov" aria-pressed="false" data-name="Quebec" data-tax="GST + QST"><b>QC</b><small>Quebec</small></button>
            <button type="button" class="ca-prov" aria-pressed="false" data-name="Alberta" data-tax="GST"><b>AB</b><small>Alberta</small></button>
            <button type="button" class="ca-prov" aria-pressed="false" data-name="British Columbia" data-tax="GST + PST"><b>BC</b><small>British Columbia</small></button>
          </div>
          <div class="ca-inv-b">
            <div class="ca-inv-id"><p>INV-1048</p><small>Province: <b data-ca-ship>Ontario</b></small></div>
            <ul class="ca-lines"><li><span>Freight services</span><b>Line 1</b></li><li><span>Accessorials</span><b>Line 2</b></li></ul>
            <div class="ca-tax" data-ca-tax aria-live="polite"><span>Tax lines</span><span class="ca-chip">HST</span></div>
          </div>
          <div class="ca-inv-f"><span>Rule applied by province, not by hand</span><span class="ca-sync">QuickBooks or Xero</span></div>
        </figure>`
})}

<section class="mx-sec mx-sec--paper" id="build" aria-labelledby="focusH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">What we build</p>
        <h2 id="focusH" data-split>Capabilities for Canada teams.</h2>
      </div>
    </div>
    <div class="ca-caps">
      <article class="ca-cap" data-x><h3><a href="/solutions/trucking-logistics">Dispatch &amp; fleet operations</a></h3><p>Load boards, bulk reassignment, and exception workflows for Canadian carriers and brokers running mixed TMS and spreadsheet ops.</p>${more('Trucking solutions')}</article>
      <article class="ca-cap" data-x style="--d:.06s"><h3><a href="/solutions/accounting-integrations">Accounting sync</a></h3><p>QuickBooks and Xero connectors with reconciliation views - fewer month-end surprises for finance.</p>${more('Finance integrations')}</article>
      <article class="ca-cap" data-x style="--d:.12s"><h3><a href="/solutions/saas">SaaS product delivery</a></h3><p>Onboarding, admin panels, and activation analytics for Canadian B2B SaaS founders shipping their next milestone.</p>${more('SaaS solutions')}</article>
    </div>
  </div>
</section>

<section class="mx-sec" id="conditions" aria-labelledby="condH">
  <div class="wrap ca-cond">
    <div>
      <p class="mx-kicker eyebrow">Operating conditions</p>
      <h2 id="condH" data-split>What makes Canadian builds different.</h2>
      <p class="mx-body" data-x>Canadian operators deal with provincial variation and cross-border US traffic that a US-built product rarely handles well. The friction shows up in tax lines, language, and border paperwork. We build the screens and data model that record these obligations; we do not give legal or tax advice, and your compliance owner signs off the rules.</p>
    </div>
    <ul class="ca-cond-list">
      <li data-x>GST, HST, PST, and QST handled per province on invoices</li>
      <li data-x style="--d:.05s">Cross-border US loads with eManifest status on the record</li>
      <li data-x style="--d:.1s">Federal ELD data alongside dispatch for federally regulated carriers</li>
      <li data-x style="--d:.15s">French and English interfaces where Quebec users need them</li>
      <li data-x style="--d:.2s">PIPEDA-conscious access control and audit trails</li>
    </ul>
  </div>
</section>

<section class="mx-sec mx-sec--night" id="border" aria-labelledby="borderH" data-dark>
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">Cross-border dispatch</p>
        <h2 id="borderH" data-split>Toronto to Chicago, every status explicit.</h2>
      </div>
      <div class="mx-head-aside">
        <p class="mx-body" data-x>A Toronto–Chicago load needs an eManifest filed before the truck reaches the border, and a customs hold is not the same problem as a late driver. We track border and paperwork status as explicit states on the load, so the desk can tell what is actually blocking a delivery and chase the right party.</p>
        <p style="margin-top:20px">${link('/solutions/trucking-logistics', 'Trucking solutions')}</p>
      </div>
    </div>
    <ol class="ca-run" data-track aria-label="Sample states on a Toronto to Chicago load">
      <li><i aria-hidden="true">1</i><b>Booked · Toronto</b><small>Load created with its border paperwork attached</small></li>
      <li><i aria-hidden="true">2</i><b>eManifest filed</b><small>Before the truck reaches the border</small></li>
      <li class="is-hold"><i aria-hidden="true">3</i><b>At the border</b><small>A customs hold is its own state, not “late”</small></li>
      <li><i aria-hidden="true">4</i><b>Delivered · Chicago</b><small>The desk chased the right party</small></li>
    </ol>
  </div>
</section>

<section class="mx-sec mx-sec--paper" id="depth" aria-labelledby="depthH">
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">In depth</p>
        <h2 id="depthH" data-split>Built for more than one province and one language.</h2>
      </div>
    </div>
    <div class="ca-grid">
      <article class="ca-card" data-x>
        <p class="k">Sales tax</p>
        <h3>Provincial sales tax on every invoice</h3>
        <p>An Ontario invoice carries HST, a Quebec invoice carries GST and QST, and other provinces apply GST with or without a provincial tax depending on what is sold. When this is a manual line edit, invoices go out wrong. We model the tax rule by province and sync the result to QuickBooks or Xero, so finance reviews exceptions instead of every invoice.</p>
        ${link('/solutions/accounting-integrations', 'Accounting integrations')}
      </article>
      <article class="ca-card" data-x style="--d:.08s">
        <p class="k">Hours</p>
        <h3>ELD data where dispatch can use it</h3>
        <p>Federally regulated Canadian carriers must use certified ELDs. That data is far more useful on the dispatch screen than in a separate portal. Where your ELD provider offers an API, we show remaining hours on the assignment row, so planning respects the limit rather than discovering it mid-trip.</p>
        ${link('/services/crm-development', 'Dispatch CRM')}
      </article>
      <article class="ca-card ca-card--wide" data-x>
        <div>
          <p class="k">Language</p>
          <h3>Bilingual interfaces for Quebec</h3>
          <p>Supporting French is a layout and content-structure problem before it is a translation problem: French strings run longer, and labels, tables, and buttons need room for that. We build components and content keys for both languages from the first wireframe, and your team or a translation partner supplies the copy.</p>
          ${link('/services/ui-ux-design', 'UI/UX design')}
        </div>
        <div class="ca-lang" data-ca-lang lang="en">
          <div class="ca-lang-top"><span>Same buttons, two languages</span><span class="ca-lang-sw" role="group" aria-label="Interface language"><button type="button" aria-pressed="true">EN</button><button type="button" aria-pressed="false">FR</button></span></div>
          <div class="ca-lang-row"><span class="p" data-en="Send invoice" data-fr="Envoyer la facture">Send invoice</span><span data-en="Save draft" data-fr="Enregistrer le brouillon">Save draft</span><span data-en="Load status" data-fr="Statut du chargement">Load status</span></div>
          <p class="ca-lang-len"><b data-ca-len>32</b> characters across three labels. Components are sized for the longer one.</p>
        </div>
      </article>
    </div>
  </div>
</section>

${deliver(['Eastern and Central time overlap', 'PIPEDA-conscious privacy practices in delivery', 'Phased rollout without stopping operations', 'Full code and design ownership at close'])}

${who('The page is for Canadian operators and SaaS teams whose current tools were built for one country and one tax rule. If an existing product already covers your case, we will say so on the first call.', [
  'Carriers and brokers running Canada–US lanes on a TMS plus spreadsheets',
  'Finance teams correcting provincial tax lines by hand before month-end close',
  'B2B SaaS founders who need French and English admin from the first Quebec customer',
  'Fleet ops leads who want hours, location, and exceptions on one dashboard'
])}

${sw('ca')}

${inquiry(src, { trust: ['Eastern and Central call hours.', 'Reply within one business day.'] })}

${cta({ ...CTA_MKT, mark: 'Canada' })}
</main>`;

/* ═════════════════════════ Industries ═════════════════════════ */
const SCR = {
  truck: `<img class="in-scr" src="/media/solutions/trucking/fleet-dashboard.svg" alt="Fleet dashboard with route performance, exception queue, and on-time KPIs for a US carrier." width="1600" height="1000" decoding="async" loading="lazy">`,
  quote: `<div class="in-scr" role="img" aria-label="Auto-transport quote: VIN, Dallas to Phoenix, enclosed, Book move.">
          <div class="in-scr-top"><div><p>Quote</p><small>VIN · origin · delivery</small></div><span class="in-chip p">Open</span></div>
          <div class="in-q"><small>1C4HJXDG · 2022 Wrangler</small><p>Dallas → Phoenix</p></div>
          <ul class="in-rows"><li><b>Pickup</b><span>Gate 14 · 06:40</span><em>Enclosed</em></li><li class="on"><b>In transit</b><span>I-10 west</span><em>ETA 2d</em></li><li><b>Deliver</b><span>Scottsdale</span><em>Pending</em></li></ul>
          <div class="in-cta"><span>Book move</span></div>
        </div>`,
  saas: `<div class="in-scr" role="img" aria-label="First sitting after SSO: test cycle now, roles after first value.">
          <div class="in-scr-top"><div><p>First sitting</p><small>SaaS · after SSO</small></div><span class="in-chip w">Roles later</span></div>
          <ol class="in-steps"><li class="done"><i></i><span>SSO</span><em>Done</em></li><li class="done"><i></i><span>Link bank</span><em>Done</em></li><li class="now"><i></i><span>Run test cycle</span><em>Now</em></li><li class="later"><i></i><span>Invite roles</span><em>After value</em></li></ol>
        </div>`,
  close: `<div class="in-scr" role="img" aria-label="March close: unmatched invoice against QuickBooks and bank, Resolve.">
          <div class="in-scr-top"><div><p>March close</p><small>QuickBooks · Xero · bank</small></div><span class="in-chip w">4 unmatched</span></div>
          <ul class="in-rows"><li class="risk"><b>INV-2041</b><span>QB → Bank</span><em>−£420</em></li><li><b>INV-2048</b><span>Xero → Bank</span><em>Match</em></li><li><b>INV-2052</b><span>QB → Xero</span><em>Retry</em></li></ul>
          <div class="in-cta" style="padding-top:14px"><span>Resolve</span></div>
        </div>`,
  pipe: `<div class="in-scr" role="img" aria-label="Custom pipeline: Site visit, Proposal, Commit, with an at-risk deal.">
          <div class="in-scr-top"><div><p>Pipeline</p><small>Team stages</small></div><span class="in-chip">Commit £184k</span></div>
          <div class="in-pipe"><div><p>Site visit <b>3</b></p><ul><li class="risk"><strong>Northfleet</strong><em>At risk · £18k</em></li><li><strong>Vida</strong><em>£9k · field</em></li></ul></div><div><p>Proposal <b>2</b></p><ul><li><strong>Apex</strong><em>£61k · legal</em></li></ul></div><div><p>Commit <b>2</b></p><ul><li><strong>Meridian</strong><em>£42k · verbal</em></li></ul></div></div>
        </div>`
};
const IND_CHAPS = [
  { id: 'ind-trucking', scr: 'truck', k: '01 · Ops floor', href: '/solutions/trucking-logistics', h: 'Trucking &amp; Logistics', p: 'Carriers and brokers outgrowing spreadsheet dispatch. Custom TMS-style consoles, <a href="/services/crm-development">dispatch CRM</a>, fleet dashboards, and driver apps tied to how loads actually move.', caps: ['Custom TMS', 'Dispatch CRM', 'Driver apps'], go: 'View trucking solution', capLabel: 'Trucking capabilities', group: ['Logistics &amp; transport', 'When the load record and the workaround disagree.'] },
  { id: 'ind-car', scr: 'quote', k: '02 · Auto transport', href: '/solutions/car-transportation', h: 'Car Transportation', p: 'Brokers and carriers where quote, dispatch, and POD live in separate tools. One order record from booking to invoice, not five disconnected workflows.', caps: ['Quote portals', 'Carrier dispatch', 'Customer tracking'], go: 'View car transport', capLabel: 'Car transport capabilities' },
  { id: 'ind-saas', scr: 'saas', k: '03 · Product teams', href: '/solutions/saas', h: 'SaaS &amp; Startups', p: 'B2B teams where signup outpaces activation. We fix onboarding, permissions, and dashboards that turn trials into daily use for product teams in the <a href="/markets">US, UK, UAE, and Canada</a>.', caps: ['Onboarding UX', 'MVP build', 'Admin panels'], go: 'View SaaS solution', capLabel: 'SaaS capabilities', group: ['Product, finance &amp; ops', 'When activation, month-end, or pipeline stages stall the desk.'] },
  { id: 'ind-finance', scr: 'close', k: '04 · Finance ops', href: '/solutions/accounting-integrations', h: 'Accounting Integrations', p: 'Products with live books that need QuickBooks or Xero sync finance can trust. Reconciliation dashboards and exception handling so month-end close is not a fire drill.', caps: ['QuickBooks API', 'Xero sync', 'Exception triage'], go: 'View integrations', capLabel: 'Finance integration capabilities' },
  { id: 'ind-crm', scr: 'pipe', k: '05 · CRM desk', href: '/services/crm-development', h: 'CRM &amp; Automation', p: 'Ops teams whose pipeline stages do not match how deals move. Custom CRM consoles, <a href="/services/automation-systems">workflow automation</a>, and integration-heavy tooling built for the desk, not a boxed CRM template.', caps: ['Pipeline UX', 'Workflow automation', 'API consoles'], go: 'View CRM service', capLabel: 'CRM capabilities' }
];
const IND = (src) => {
  const more2 = grab(src, /<section class="k-newlinks"[\s\S]*?<\/section>/, 'k-newlinks');
  const ml = [...more2.matchAll(/<a href="([^"]+)"><strong>([^<]+)<\/strong><span>([^<]+)<\/span><\/a>/g)];
  must(ml.length === 2, 'newlinks count');
  const routes = [['01 · Ops floor', 'Trucking &amp; Logistics', 'Trucking solution', 'Dispatch &amp; fleet'], ['02 · Auto transport', 'Car Transportation', 'Car transport', 'Quote to POD'], ['03 · Product teams', 'SaaS &amp; Startups', 'SaaS solution', 'Onboarding &amp; MVPs'], ['04 · Finance ops', 'Accounting Integrations', 'Finance integrations', 'QuickBooks &amp; Xero'], ['05 · CRM desk', 'CRM &amp; Automation', 'CRM service', 'Pipelines &amp; automation']];
  return `<main id="main">
<div class="mx-progress" aria-hidden="true"></div>
${rail([['overview', 'Overview'], ['desks', 'Industries'], ['desk-story', 'The desk'], ['why', 'From industry to outcome'], ['inquire', 'Inquire']])}
<header class="mx-hero" id="overview" aria-labelledby="h1" data-dark>
  <div class="mx-hero-bg" aria-hidden="true"><div class="mx-grid"></div><div class="mx-glow"></div></div>
  <div class="wrap" style="padding-bottom:clamp(56px,6vw,96px)">
    <div class="in-hero-grid">
      <div class="mx-hero-copy">
        <ol class="crumbs">
          <li><a href="/">Home</a></li><li aria-hidden="true">/</li>
          <li aria-current="page">Industries</li>
        </ol>
        <p class="mx-kicker mx-pill eyebrow"><i aria-hidden="true"></i>Company · Industries</p>
        <h1 class="mx-h1" id="h1" data-split>Industries we serve: trucking, SaaS, <em>finance, and operations</em></h1>
        <p class="mx-lede lede">Trucking, moving, logistics, B2B SaaS, and finance. Start with a <a href="/solutions/trucking-company-websites">trucking website</a> or a <a href="/solutions/moving-company-websites">moving website</a> when the public site is the gap, or with the software the desk uses. <a href="/pricing">Starting prices</a>.</p>
        <p class="in-ia"><strong>Industries vs markets:</strong> this page is organized by desk and workflow. For US/UK/UAE/Canada timezone overlap and regional delivery, see <a href="/markets">Markets we serve</a>.</p>
        <div class="mx-actions">
          ${btn('#desks', 'Find your industry')}
          ${link('/contact#book', 'Book a free 20-minute fit call')}
        </div>
        <p class="in-trust"><span>Five industries</span><span>Product design &amp; UI/UX</span><span>Remote-first</span></p>
      </div>
      <div class="mx-hero-vis" data-tilt>
        <nav class="mx-win in-router" data-in-router aria-label="Industries and their solution paths">
          <div class="mx-win-top"><span class="mx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mx-win-path">Desk → solution path</span></div>
          <div class="in-router-h" aria-hidden="true"><span>Your desk</span><span></span><span>Path</span></div>
          <ul class="in-routes">${IND_CHAPS.map((c, i) => `
            <li><a class="in-route" href="#${c.id}"><span class="d"><small>${routes[i][0]}</small><b>${routes[i][1]}</b></span><span class="ln" aria-hidden="true"></span><span class="p">${routes[i][2]}<em>${routes[i][3]}</em></span></a></li>`).join('')}
          </ul>
          <div class="in-router-f"><span>Each industry maps to a solution path</span><b>5 desks</b></div>
        </nav>
      </div>
    </div>
  </div>
</header>

<section class="mx-sec mx-sec--night" id="desks" aria-labelledby="indH" data-dark>
  <div class="wrap">
    <div class="mx-head">
      <div class="mx-head-main">
        <p class="mx-kicker eyebrow">Industries we serve</p>
        <h2 id="indH" data-split>Built for the desk you actually sit at.</h2>
      </div>
      <p class="mx-lede lede mx-head-aside" data-x>Each industry maps to a solution path, the services behind it, and published work where we have it. CRM and automation enters through the capability, not a separate market page.</p>
    </div>
    <div class="in-chaps" data-in-chaps>
      <div class="in-chap-stage" aria-hidden="true">
        <span class="in-chap-count" data-in-count>01 / 05</span>
        ${IND_CHAPS.map((c) => SCR[c.scr].replace(/ role="img" aria-label="[^"]*"/, '').replace(/ alt="[^"]*"/, ' alt=""')).join('\n        ')}
      </div>
      <div>${IND_CHAPS.map((c) => `
        ${c.group ? `<p class="in-chap-group">${c.group[0]}</p><p>${c.group[1]}</p>` : ''}
        <article class="in-chap" id="${c.id}">
          <div class="in-chap-vis">${SCR[c.scr]}</div>
          <span class="k">${c.k}</span>
          <h3><a href="${c.href}">${c.h}</a></h3>
          <p>${c.p}</p>
          <ul class="in-caps" aria-label="${c.capLabel}">${c.caps.map((x) => `<li>${x}</li>`).join('')}</ul>
          <a class="mx-more" href="${c.href}">${c.go} <i aria-hidden="true"></i></a>
        </article>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="mx-sec" id="desk-story" aria-labelledby="storyH">
  <div class="wrap in-story">
    <figure data-x>
      <img src="/media/photos/freight-warehouse.webp" alt="Pallets and freight staged inside a logistics warehouse." width="1600" height="1067" loading="lazy" decoding="async" data-par>
    </figure>
    <div>
      <p class="mx-kicker eyebrow">The desk</p>
      <h2 id="storyH" data-split>Start from the desk, then the solution path.</h2>
      <p class="mx-body" data-x>Trucking ops, B2B SaaS, finance sync, auto transport, and CRM. Each industry maps to a solution path, the services behind it, and published work where we have it.</p>
      <ul class="in-story-pts" data-x><li>Five desks, not a generic catalog</li><li>A solution path for each</li><li>Published work where it exists</li></ul>
      <p class="in-credit">Photograph via <a href="https://unsplash.com/license" rel="noopener noreferrer">Unsplash License</a>. Not a KRIVA client or product.</p>
    </div>
  </div>
</section>

<section class="mx-sec mx-sec--paper" id="why" aria-labelledby="whyH">
  <div class="wrap in-why">
    <div>
      <p class="mx-kicker eyebrow">From industry to outcome</p>
      <h2 id="whyH" data-split>Your industry sets the vocabulary.</h2>
      <p class="mx-lede lede" data-x>Trucking dispatch, B2B SaaS activation, and finance reconciliation have different buyers, failure modes, and desk rituals. Start with your industry, follow the solution path, then check the services and <a href="/work">published work</a> that map to it.</p>
      <p class="mx-body" data-x>Not sure where you fit? Read <a href="/about">about KRIVA</a>, see <a href="/process">how we deliver</a>, browse <a href="/solutions">all solutions</a>, or check which <a href="/markets">markets we serve</a>.</p>
    </div>
    <nav class="in-next" aria-label="Next steps" data-x>
      <a href="/solutions/trucking-logistics"><b>Trucking solution</b><span>Dispatch &amp; fleet</span><i aria-hidden="true"></i></a>
      <a href="/solutions/saas"><b>SaaS solution</b><span>Onboarding &amp; MVPs</span><i aria-hidden="true"></i></a>
      <a href="/solutions/accounting-integrations"><b>Finance integrations</b><span>QuickBooks &amp; Xero</span><i aria-hidden="true"></i></a>
      <a href="/work/shiftrail-dispatch"><b>ShiftRail case</b><span>Trucking proof</span><i aria-hidden="true"></i></a>
      <a href="/work/payroll-pro-saas"><b>PayrollPro case</b><span>SaaS proof</span><i aria-hidden="true"></i></a>
      <a href="/about"><b>About KRIVA</b><span>Product studio</span><i aria-hidden="true"></i></a>
      <a href="/contact#book" class="is-cta"><b>Book a free 20-minute fit call</b><span>20 minutes</span><i aria-hidden="true"></i></a>
    </nav>
  </div>
</section>

<section class="in-more" aria-labelledby="moreH">
  <div class="wrap in-more-grid">
    <h2 id="moreH">More transportation solutions</h2>
    ${ml.map((m) => `<a href="${m[1]}"><strong>${m[2]}</strong><span>${m[3]}</span>${more('View solution')}</a>`).join('\n    ')}
  </div>
</section>

${inquiry(src, {})}

${cta({ mark: 'Industries', h2: 'Ready to talk?', lede: 'A short fit call or a written brief. You leave with a clear yes, no, or not-yet.', assur: ['Reply within one business day', 'Mutual NDA available on request before sharing confidential project information.', 'No commitment required'] })}
</main>`;
};

const BUILD = { us: US, uk: UK, au: AU, uae: UAE, ca: CA, ind: IND };

for (const key of pick) {
  const file = FILES[key];
  let src = fromHead(file);
  const main = BUILD[key](src);
  let out = src;
  must(out.includes(`<script>document.documentElement.classList.add('js')</script>`), key + ': js bootstrap');
  out = out.replace(`<script>document.documentElement.classList.add('js')</script>`, MOTION);
  out = out.replace(/\n<link rel="stylesheet" href="\/shared\/markets\.css\?v=brand1">/, '');
  if (key === 'ind') {
    out = out.replace(/<style>\n\/\* Page-scoped Industries: loaded last \*\/[\s\S]*?<\/style>\n?/, '');
    out = out.replace(/\n<link rel="stylesheet" href="\/shared\/slot-assets\.css\?v=brand1">/, '');
    must(!out.includes('Page-scoped Industries'), 'ind inline style removed');
  }
  must(out.includes('<link rel="stylesheet" href="/shared/kds.css?v=brand1">'), key + ': kds link');
  out = out.replace('<link rel="stylesheet" href="/shared/kds.css?v=brand1">', '<link rel="stylesheet" href="/shared/kds.css?v=brand1">\n<link rel="stylesheet" href="/shared/markets-x.css?v=mx1">');
  out = out.replace(/<body class="(page-market|page-industries)">/, (m, c) => `<body class="${c} mx mx-${key}">`);
  must(out.includes(`mx mx-${key}"`), key + ': body class');
  out = out.replace(/<main id="main">[\s\S]*?<\/main>/, () => main);
  must(out.includes('<script src="/shared/page-inquiry.js?v=kds7" defer></script>'), key + ': inquiry script');
  out = out.replace('<script src="/shared/page-inquiry.js?v=kds7" defer></script>', '<script src="/shared/markets-x.js?v=mx1" defer></script>\n<script src="/shared/page-inquiry.js?v=kds7" defer></script>');
  fs.writeFileSync(file, out.replace(/\n/g, '\r\n'));
  console.log('built', file, (out.length / 1024).toFixed(1) + 'KB');
}
