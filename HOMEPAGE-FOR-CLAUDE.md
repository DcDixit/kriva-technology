# KRIVA homepage — implementation brief

Paste this whole file into Claude. Implement only the homepage. Do not redesign the site, do not invent clients, metrics, quotes, or claims, and do not rewrite shared CSS from scratch.

## Goal

Finish the homepage in `kriva-redesign.html`.

The page already has header, hero, problems, builds, featured work, process, decide, more work, quotes, insights, FAQ, inquiry form, logo strip, footer, and schema. Keep all of that copy, links, images, and form fields.

The gap: the section `#workflow` says “From tender to invoice: eight desk failures we design for,” but the eight-step load console is not in the HTML. `shared/home-art.css` and `shared/home.js` already style and drive that console. Add the markup so those files work. Do not duplicate their CSS or JS.

## Files

| File | What to do |
|---|---|
| `kriva-redesign.html` | Add the workflow console inside `<section class="handoff" id="workflow">`, after `.wf-hero`. |
| `shared/home-art.css` | Already has `.wf-console`, `.wf-path`, `.wf-panel`, `.wf-fix`. Change only if a hook is missing. |
| `shared/home.js` | Already binds `#wfPath`, `#wfStage`, `#wfSub`, `#wfLive`, `#wfCount`, `#wfMeter`, `#loadFlow`. Do not rewrite it. |
| `shared/tokens.css`, `shared/home.css`, `shared/chrome.css`, `shared/page-inquiry.css` | Leave them. |

Stylesheets and scripts already on the page:

- `/shared/tokens.css`
- `/shared/home.css`
- `/shared/home-art.css`
- `/shared/product-ui.css`
- `/shared/page-inquiry.css`
- `/shared/slot-assets.css`
- `/shared/system.css`
- `/shared/responsive.css`
- `/shared/chrome.css`
- `/shared/home.js`
- `/shared/page-inquiry.js`

## Rules

1. Use the copy below word for word. Do not add new numbers, client names, or testimonials.
2. Illustrative UI only. Caption anything that looks like live ops data. The hero already says “Illustrative dispatch console · not live data”.
3. Keep existing URLs. Do not rename pages.
4. Primary CTA everywhere it already appears: **Book a free 20-min fit call** → `/contact#book`. Secondary: **Send a project brief** → `/contact#brief`.
5. One `<h1>`. Section headings stay `<h2>`.
6. FAQ buttons keep `aria-expanded`, `aria-controls`, and Escape-to-close (already in `home.js`).
7. Workflow tabs: `role="tab"`, `aria-selected`, `aria-controls`, arrow keys already handled by `home.js`. First panel visible; the other seven `hidden`.
8. Images: real paths below. `width`, `height`, `alt`, `decoding="async"`. Only the hero image gets `fetchpriority="high"`. Everything else `loading="lazy"`.
9. Respect `prefers-reduced-motion`. `home.js` already skips autoplay when reduced motion is on.
10. Do not add animation libraries.

## Brand

KRIVA Technologies. Product, UI/UX, and engineering studio in Ahmedabad. Remote-first. Clients in the US, UK, UAE, Canada, and Australia. Buyer is an operations lead, SaaS founder, or finance lead. The site should feel like the operations software KRIVA builds: mono labels, hairline rules, tabular numbers. Not a generic agency landing page.

Tokens live in `shared/tokens.css` (`--paper`, `--ink`, `--cta` `#4F46E5`, `--amber`, `--lime`, Bricolage Grotesque). Do not hardcode a second palette.

## Page order (do not reorder)

1. Skip link
2. Header nav + mobile sheet
3. Hero
4. Problems
5. Four builds
6. Trucking workflow (hero image **plus the missing console**)
7. Featured work — ShiftRail
8. Delivery process
9. Build or keep
10. Two more products — PayrollPro, FinanceSync
11. Testimonials
12. Insights
13. FAQ
14. Inquiry CTA
15. Client logo strip
16. Footer

---

## 1. Header

Logo: `/brand/logos/kriva-wordmark.svg`, links to `/`, alt “KRIVA Technologies”.

Desktop menus:

- **Trucking** — Trucking & logistics solutions `/solutions/trucking-logistics`; Dispatch CRM & TMS `/services/crm-development`; Fleet dashboards `/services/dashboard-design`; Driver mobile apps `/services/mobile-applications`; Car transportation `/solutions/car-transportation`. Foot: All trucking solutions.
- **SaaS** — SaaS product solutions `/solutions/saas`; SaaS product design `/services/saas-platforms`; Dashboards & admin panels `/services/dashboard-design`; Product design & UX `/services/product-design`. Foot: All SaaS solutions.
- **Integration** — QuickBooks & Xero `/solutions/accounting-integrations`; Integrations & APIs `/services/api-integrations`. Foot: Explore integrations.
- **Operations** — CRM & ops consoles `/services/crm-development`; Automation workflows `/services/automation-systems`; How we work `/process`. Foot: See the process.
- **Services** — Graphic Design `/services/graphic-design`; SEO & Digital Marketing `/services/seo-digital-marketing`; Product design & UX `/services/product-design`; Web Design & Development `/services/web-development`. Foot: All services.
- Links: Work `/work`, About `/about`.
- CTA: Book a free 20-min fit call → `/contact#book`.

Mobile sheet: Solutions (four solution links + All solutions `/solutions`), Services (UI/UX, web development, CRM, SaaS platforms, automation, all services), Work, Company (About, Process, Technologies, Industries, Insights, Careers, FAQ, Contact), both CTAs, email `hello@krivatechnologies.com`, line “Remote-first product studio”.

## 2. Hero `#h1`

Eyebrow: Custom software & product development partner

H1, three lines:

We design and build custom  
software for trucking, SaaS &  
operations teams.

Lede: KRIVA is an in-house team you hire to ship dispatch platforms, B2B SaaS, driver apps, and QuickBooks/Xero integrations, built around how your business runs, not an off-the-shelf TMS product.

Actions: Book a free 20-min fit call · Send a project brief

Aside, three lines:

- Built by our studio, not sold as a product
- Yes, no, or not-yet after your fit call or brief
- One-business-day reply (US & UK hours)

Image: `/media/home/hero-dispatch-desk.webp` 1024×682  
Alt: Dispatch operator on the phone at a dual-monitor KRIVA dispatch console with load tracking map; fleet trucks visible through the office window.  
Caption: Illustrative dispatch console · not live data  
Figure id: `heroBoard`

## 3. Problems `#problems`

Eyebrow: Where products break  
H2: When work lives outside the system, the product is failing.  
Lede: For trucking operators and B2B product teams: spreadsheets, chat, and silent syncs doing the job software was bought for.

Four cards:

| Label | Title | Copy | Image |
|---|---|---|---|
| Dispatch | Workarounds on the board | The real queue lives in a spreadsheet - one row at a time on the board. | `/media/home/problems/dispatch.webp` |
| Exceptions | Risk shows up late | SLA risk surfaces after the window slips, or when the customer calls. | `/media/home/problems/exceptions.webp` |
| Field | Drivers fall off the load | Status and POD fail when signal drops or the flow has too many steps. | `/media/home/problems/field.webp` |
| Integrations | Silent sync failures | QuickBooks and Xero drift until month-end - not where an operator can retry. | `/media/home/problems/integrations.webp` |

Alts already in `kriva-redesign.html`. Keep them.

## 4. Builds `#solutions`

Eyebrow: What KRIVA builds  
H2: Four surfaces. One rule: finish the job in the system.  
Lede: Trucking is our deepest practice, with the same standard for SaaS and integrations.

Rows alternate. Row 2 and row 4 use `build-row--flip`.

1. **Dispatch CRM & TMS** — Boards that match the shift.  
   Bullets: Dispatch boards & bulk actions · Exception queues & supervisor controls · SLA and ownership on the row.  
   Links: Dispatch CRM `/services/crm-development` · Trucking solutions `/solutions/trucking-logistics`.  
   Image: `/media/home/build-dispatch-board.webp`

2. **Fleet & driver products** — Truck and phone on the same load.  
   Bullets: Fleet dashboards & driver apps · Offline and weak-signal workflows · POD and document capture.  
   Links: Driver applications `/services/mobile-applications` · Fleet dashboards `/services/dashboard-design`.  
   Image: `/media/home/build-fleet-driver.webp`

3. **B2B SaaS products** — First-run that delivers real value.  
   Bullets: Onboarding & roles/permissions · Multi-tenant workflows & admin panels · Product modernization.  
   Links: B2B SaaS products `/solutions/saas` · PayrollPro case `/work/payroll-pro-saas`.  
   Image: `/media/home/build-saas-onboarding.webp`

4. **Integrations & automation** — Failures visible and recoverable.  
   Bullets: QuickBooks, Xero & ELD connections · Retry and reconciliation interfaces · Auditable automation.  
   Links: Integrations & APIs `/services/api-integrations` · QuickBooks & Xero `/solutions/accounting-integrations`.  
   Image: `/media/home/build-integrations-sync.webp`

## 5. Workflow `#workflow` — implement this

Keep the existing hero block:

- Image: `/media/home/handoff-system-integration.jpg` 1024×682  
  Alt: Operations lead mapping TMS, API, middleware, and ERP integration on a whiteboard during a system health review.
- Eyebrow: Trucking workflow
- H2: One load. Every handoff covered.
- Lede: From tender to invoice: eight desk failures we design for.

Then add this console **inside** `.wrap`, after `.wf-hero`. `home.js` auto-plays stages every ~2.4s when `#loadFlow` is in view, until the user clicks a tab. Progress fractions are 1/8 through 8/8.

```html
<div class="wf-console" id="loadFlow" data-r>
  <div class="browser">
    <div class="wf-ticket">
      <div>
        <p class="wf-k">Load</p>
        <p class="wf-id">LD-1842 <span>· ATL → CLT</span></p>
        <p class="wf-sub" id="wfSub">Tendered · no owner on the row</p>
      </div>
      <div class="wf-ticket-stat">
        <p class="wf-live"><span class="dot" aria-hidden="true"></span><span id="wfLive">Unassigned</span></p>
        <b id="wfCount">01 / 08</b>
      </div>
      <div class="wf-meter" id="wfMeter" style="--p:.125"><i></i></div>
    </div>

    <div class="wf-path-scroller">
      <div class="wf-path" id="wfPath" role="tablist" aria-label="Load handoffs">
        <button type="button" class="wf-node" role="tab" aria-selected="true" aria-controls="wf1" id="wft1" data-n="01 / 08" data-p=".125" data-sub="Tendered · no owner on the row" data-live="Unassigned" data-tone="risk"><span class="wf-node-n">01</span><span class="wf-node-l">Tender</span></button>
        <button type="button" class="wf-node" role="tab" aria-selected="false" tabindex="-1" aria-controls="wf2" id="wft2" data-n="02 / 08" data-p=".25" data-sub="Queue still lives in a side sheet" data-live="Workaround" data-tone="risk"><span class="wf-node-n">02</span><span class="wf-node-l">Assign</span></button>
        <button type="button" class="wf-node" role="tab" aria-selected="false" tabindex="-1" aria-controls="wf3" id="wft3" data-n="03 / 08" data-p=".375" data-sub="Acceptance is a phone call" data-live="Unconfirmed" data-tone="risk"><span class="wf-node-n">03</span><span class="wf-node-l">Confirm</span></button>
        <button type="button" class="wf-node" role="tab" aria-selected="false" tabindex="-1" aria-controls="wf4" id="wft4" data-n="04 / 08" data-p=".5" data-sub="Status chased off the board" data-live="In transit" data-tone=""><span class="wf-node-n">04</span><span class="wf-node-l">Transit</span></button>
        <button type="button" class="wf-node" role="tab" aria-selected="false" tabindex="-1" aria-controls="wf5" id="wft5" data-n="05 / 08" data-p=".625" data-sub="SLA risk shows up after the window" data-live="Exception" data-tone="risk"><span class="wf-node-n">05</span><span class="wf-node-l">Exception</span></button>
        <button type="button" class="wf-node" role="tab" aria-selected="false" tabindex="-1" aria-controls="wf6" id="wft6" data-n="06 / 08" data-p=".75" data-sub="POD fails when the yard signal drops" data-live="POD missing" data-tone="risk"><span class="wf-node-n">06</span><span class="wf-node-l">POD</span></button>
        <button type="button" class="wf-node" role="tab" aria-selected="false" tabindex="-1" aria-controls="wf7" id="wft7" data-n="07 / 08" data-p=".875" data-sub="Invoice waits on a missing document" data-live="Not billable" data-tone="risk"><span class="wf-node-n">07</span><span class="wf-node-l">Invoice</span></button>
        <button type="button" class="wf-node" role="tab" aria-selected="false" tabindex="-1" aria-controls="wf8" id="wft8" data-n="08 / 08" data-p="1" data-sub="Finance can see the sync, and retry it" data-live="On the record" data-tone="ok"><span class="wf-node-n">08</span><span class="wf-node-l">Sync</span></button>
      </div>
    </div>

    <div class="wf-stage" id="wfStage">
      <article class="wf-panel on" id="wf1" role="tabpanel" aria-labelledby="wft1">
        <div class="wf-copy">
          <p class="wf-stage-k">01 · Tender</p>
          <h3>The load arrives with no owner.</h3>
          <p>Customer, lane, and SLA get re-keyed into a side sheet. The board does not know who owns the row.</p>
          <p class="wf-fix"><span>Fix</span> Capture the order once, with an owner on the row.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-facts"><div><span>Lane</span><b>ATL → CLT</b></div><div><span>Owner</span><b>—</b></div><div><span>SLA</span><b>Open</b></div></div>
          <p class="wf-audit">LD-1842 tendered · no dispatcher</p>
        </div>
      </article>
      <article class="wf-panel" id="wf2" role="tabpanel" aria-labelledby="wft2" hidden>
        <div class="wf-copy">
          <p class="wf-stage-k">02 · Assign</p>
          <h3>Bulk assign still happens off the board.</h3>
          <p>The real queue is a spreadsheet. Dispatch moves one row at a time, with no audit of who changed it.</p>
          <p class="wf-fix"><span>Fix</span> Bulk assign on the board, with an audit trail.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-facts"><div><span>Queue</span><b>Side sheet</b></div><div><span>Action</span><b>One row</b></div><div><span>Audit</span><b>None</b></div></div>
          <p class="wf-audit">Assignment not on the load record</p>
        </div>
      </article>
      <article class="wf-panel" id="wf3" role="tabpanel" aria-labelledby="wft3" hidden>
        <div class="wf-copy">
          <p class="wf-stage-k">03 · Confirm</p>
          <h3>Acceptance is a phone call.</h3>
          <p>The driver or carrier never confirms on the load. Dispatch finds out when the truck does not move.</p>
          <p class="wf-fix"><span>Fix</span> Acceptance on the same load, including from the cab.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-facts"><div><span>Driver</span><b>Unconfirmed</b></div><div><span>Channel</span><b>Phone</b></div><div><span>Row</span><b>Stale</b></div></div>
          <p class="wf-audit">No acceptance event on LD-1842</p>
        </div>
      </article>
      <article class="wf-panel" id="wf4" role="tabpanel" aria-labelledby="wft4" hidden>
        <div class="wf-copy">
          <p class="wf-stage-k">04 · Transit</p>
          <h3>Status is chased, not shown.</h3>
          <p>In-transit updates live in chat. The board still says what it said at dispatch.</p>
          <p class="wf-fix"><span>Fix</span> Stop progression written back to the load row.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-facts"><div><span>Stop</span><b>2 of 4</b></div><div><span>Source</span><b>Chat</b></div><div><span>Board</span><b>Stale</b></div></div>
          <p class="wf-audit">Last board update · dispatch</p>
        </div>
      </article>
      <article class="wf-panel" id="wf5" role="tabpanel" aria-labelledby="wft5" hidden>
        <div class="wf-copy">
          <p class="wf-stage-k">05 · Exception</p>
          <h3>Risk shows up after the window.</h3>
          <p>SLA risk surfaces when the customer calls, not while a supervisor can still act.</p>
          <p class="wf-fix"><span>Fix</span> Exception queue sorted by time left, with an owner.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-facts"><div><span>Window</span><b>Slipped</b></div><div><span>Seen by</span><b>Customer</b></div><div><span>Owner</span><b>None</b></div></div>
          <p class="wf-audit">Exception not on the board</p>
        </div>
      </article>
      <article class="wf-panel" id="wf6" role="tabpanel" aria-labelledby="wft6" hidden>
        <div class="wf-copy">
          <p class="wf-stage-k">06 · POD</p>
          <h3>The document never makes the row.</h3>
          <p>POD and detention fail when the yard signal drops, or the capture flow has too many steps.</p>
          <p class="wf-fix"><span>Fix</span> POD capture with an offline queue, tied to the load.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-pod"><span>BOL</span><span>POD</span><span>Photo</span></div>
          <p class="wf-audit">POD missing · weak signal</p>
        </div>
      </article>
      <article class="wf-panel" id="wf7" role="tabpanel" aria-labelledby="wft7" hidden>
        <div class="wf-copy">
          <p class="wf-stage-k">07 · Invoice</p>
          <h3>Billing waits on the missing POD.</h3>
          <p>Settlement cannot start because delivery proof never landed on the load record.</p>
          <p class="wf-fix"><span>Fix</span> Invoice-ready data on the same record as delivery.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-facts"><div><span>POD</span><b>Missing</b></div><div><span>Invoice</span><b>Held</b></div><div><span>Books</span><b>Waiting</b></div></div>
          <p class="wf-audit">Not billable until POD is on the row</p>
        </div>
      </article>
      <article class="wf-panel" id="wf8" role="tabpanel" aria-labelledby="wft8" hidden>
        <div class="wf-copy">
          <p class="wf-stage-k">08 · Sync</p>
          <h3>Finance can see the failure, and retry it.</h3>
          <p>QuickBooks or Xero sync stays visible. A failed push is a card with history, not a silent month-end surprise.</p>
          <p class="wf-fix"><span>Fix</span> Retry and reconciliation where the operator works.</p>
        </div>
        <div class="wf-view" aria-hidden="true">
          <div class="wf-facts"><div><span>Books</span><b>QuickBooks</b></div><div><span>State</span><b>Synced</b></div><div><span>Retry</span><b>Visible</b></div></div>
          <p class="wf-audit">LD-1842 on the record · retry history kept</p>
        </div>
      </article>
    </div>
  </div>
</div>
```

`LD-1842` and `ATL → CLT` are sample UI, same pattern as other illustrative boards on the site. Do not present them as a client result. Do not add a percentage, dollar amount, or uptime figure in this block.

Without JavaScript, every `.wf-panel` must still be readable. `home-art.css` already shows hidden panels when `html` does not have class `js`.

## 6. Featured work `#work`

Kicker: US trucking · Dispatch CRM (US trucking links to `/markets/us`)  
H2: ShiftRail: dispatch without spreadsheets.  
Lede: Bulk assign, SLA on the row, audited overrides. 32% less handle time on 400+ daily routes.

Metrics, two only:

- 32% — Less handle time
- 400+ — Routes a day

Links: Read the case `/work/shiftrail-dispatch` · All work `/work`  
Image: `/media/home/featwork-shiftrail-dispatch.webp`

Do not add more ShiftRail metrics.

## 7. Process `#process`

Eyebrow: Delivery  
H2: Same team observes, designs, and ships.  
Link: Full process `/process`

| Step | Title | Copy |
|---|---|---|
| 01 | Observe | Map users, exceptions, handoffs, and workarounds. |
| 02 | Prototype | Review realistic interfaces before production starts. |
| 03 | Build | Ship working software on a live URL with weekly reviews. |
| 04 | Roll out | Feature flags, staged deployment, and parallel workflows. |

Facts: Weekly live URL · No subcontracting · Client-owned files

## 8. Decide `#decide`

Eyebrow: Build or keep  
H2: Custom software pays off when workflow is the advantage.  
Lede: When to extend what you have versus build around how your team actually works.

Keep the current system when: Standard workflows fit the operation · Integrations are stable · Workarounds are minor · Adoption is acceptable.

Build or customize when: Spreadsheets run core decisions · High-volume actions need manual work · Exceptions are discovered too late · Integrations or roles block growth.

CTA: Book a free 20-min fit call.

## 9. More work

Eyebrow: More work  
H2: Two more shipped products.  
Lede: SaaS onboarding and finance integrations from recent engagements.  
Link: All work `/work`

- **PayrollPro · SaaS** — SSO was live. Activation was not. Progressive onboarding and permission clarity: role paths in parallel, first-run tied to a real payroll cycle. Link `/work/payroll-pro-saas`. Image `/media/work/payrollpro/home-onboarding.webp`
- **FinanceSync · Integrations** — Silent drift, then finance lost trust. Reconciliation hub with idempotent workers, discrepancy cards, and retry history, with no raw JSON in the operator view. Link `/work/finance-sync-hub`. Image `/media/work/financesync/home-reconciliation.webp`

## 10. Testimonials `#testimonials`

Eyebrow: Testimonials  
H2: What clients say.  
Lede: Short notes from operators after we shipped together.

Keep the three existing cards. Roles only. Do not invent personal names.

1. Dispatch — “The desk stopped living in Slack. Exceptions sit on one board, and the shift can finish the job in the system.” — Dispatch lead, US trucking. Avatar `/media/home/testimonials/avatar-dispatch.svg`
2. SaaS — “First-run actually finished. New tenants hit a real payroll cycle instead of bouncing at permissions.” — Product owner, B2B SaaS. Avatar `/media/home/testimonials/avatar-saas.svg`
3. Web — “The quote form is the homepage. We stopped losing bookings to a buried contact page.” — Owner, Auto transport. Avatar `/media/home/testimonials/avatar-web.svg`

## 11. Insights

Eyebrow: Insights  
H2: Notes from the field.  
Lede: Guides on dispatch CRM, dashboard UX, and SaaS onboarding.  
Link: All insights `/insights`

- Trucking — Dispatch CRM for US trucking: what works — May 2026 · 10 min — `/insights/trucking-dispatch-crm-guide`
- Dispatch UX — CRM dashboard patterns teams actually use — Oct 2025 · 6 min — `/insights/crm-dashboard-ux-patterns`
- SaaS — SaaS onboarding that improves activation — Dec 2025 · 6 min — `/insights/saas-onboarding-patterns`

## 12. FAQ `#faq`

Eyebrow: FAQ  
H2: Common questions.  
Lede: Straight answers on how we deliver, roll out, and hand off.

1. Can you improve our TMS or SaaS without a full rebuild? — Yes. We embed with your team and roll out in phases. Feature flags and parallel workflows keep the desk running while we change it.
2. How do you roll out without interrupting operations? — Feature flags, staging tests, and weekly reviews on a live URL. Phased deployment until the new path is signed off.
3. How do you work with US teams from India? — Remote-first, in-house delivery from our Ahmedabad studio. US and UK call-hour overlap, async Slack updates, and weekly video.
4. Who owns the code and designs after launch? — You do. Figma files, repos, and documentation transfer at close, or earlier. No lock-in.

Footer line: More on the full FAQ `/faq` and how projects run `/process`.

If you touch FAQ answers, update the matching `FAQPage` JSON-LD at the bottom of the file to the same text.

## 13. Inquiry `#inquire`

Eyebrow: Start a conversation  
H2: Show us what your team works around.  
Lede: Share the workflow. We'll say fix, integrate, rebuild, or leave it.  
Trust: Reply within one business day · NDA available · In-house team  
Help: Prefer a call? Use the contact page → `/contact#book`

Form `#pageInquiry` posts to `/api/inquiry`, method post, `novalidate`.

Hidden fields: `inquiry_type=page_inquiry`, `page=/`, `service=Homepage`, honeypot `website_hp`.

Fields: Name (required), Work email (required), Company, Phone (optional), Project / requirement (required).  
Placeholder: Example: dispatch still runs in a spreadsheet; we need bulk assign and SLA on the board.  
Submit: Send inquiry. Note: Reply within one business day.  
Success heading: Inquiry received.  
Success body: We will reply within one business day. If you still need a scheduled call or a longer brief, use the contact page (`/contact#brief`).

Validation messages already in the markup. Leave `page-inquiry.js` to handle them.

## 14. Proof strip

H2: Teams we've worked with.

Logos, in order, under `/brand/logos/clients/`:

eliteone-transportation.png · keep-moving-movers.png · xmileauto-transport.png · xmile-transport-moving.png · dc-auto-transport.png · extra-mile-movers.png · schwarz-logistics.png · houzway.png · cascadia-collection.png · careermoon.png · script.webp

Each item has a visible `.logo-name` and `onerror="this.remove()"` on the image. Keep both.

## 15. Footer

Keep the current footer.

- Get in touch: brief, fit call, `hello@krivatechnologies.com`. Blurb: Product design, UI/UX, and engineering for operators and SaaS teams. Remote-first.
- Social: LinkedIn `https://www.linkedin.com/company/kriva-technologies` · Dribbble `https://dribbble.com/krivatechnologies` · Instagram `https://www.instagram.com/kriva_technology/` · X `https://x.com/krivatechnologies`
- Trucking & logistics, SaaS & integrations, and Company columns as already marked up.
- Wordmark: `/brand/logos/kriva-lockup-inverse.svg`
- Base: © 2026 Kriva Technologies · Privacy `/privacy` · Terms `/terms`

## SEO (already in the file — do not regress)

- Title: Custom Trucking Software, B2B SaaS & Integrations | KRIVA
- Description: Hire KRIVA’s in-house team to design and build custom dispatch CRM, fleet dashboards, driver apps, B2B SaaS, and QuickBooks/Xero integrations for operators in the US, UK, UAE, Canada, and Australia.
- Canonical: `https://krivatechnologies.com/`
- Keep GA, Clarity, and Tawk blocks (`KRIVA_GA_*`, `KRIVA_CLARITY_*`, `KRIVA_TAWK_*`) and the JSON-LD graph.

## Done when

- `#workflow` shows the photo hero and, under it, an 8-step console for load LD-1842.
- Clicking Tender through Sync changes the subtitle, live status, `01 / 08` counter, meter, and panel. Tone `risk` uses amber; `ok` on Sync uses green. That behavior comes from `home.js` if the ids and `data-*` attributes match.
- Arrow keys move between tabs. The path scrolls horizontally on a narrow screen.
- Autoplay advances until the user clicks a tab, and does not run when reduced motion is on.
- With JavaScript disabled, all eight panels are still in the page.
- No new metrics, names, or sections.
- Header, hero, problems, four builds, ShiftRail, process, decide, PayrollPro, FinanceSync, quotes, insights, FAQ, form, logos, and footer still match the copy above.
