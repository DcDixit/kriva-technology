# KRIVA Redesign — Project Handoff

**Purpose:** paste this into a new thread (and upload the HTML files) to resume without losing context.
**Live source of truth:** https://web-nine-virid-37.vercel.app/ (production domain: krivatechnologies.com)
**Last session:** 9 Aug 2026. Pages 1–7 complete.

---

## 0. READ THIS FIRST

**Upload the 8 HTML files with this document.** A new thread starts with an empty container and cannot
access files from a previous conversation. Without them, everything gets rebuilt from scratch.

Files to upload:

| File | Page |
|---|---|
| `kriva-redesign.html` | Homepage |
| `kriva-case-fleetflow.html` | Case study template (`/work/fleetflow-dispatch`) |
| `kriva-work-index.html` | Work index (`/work`) |
| `kriva-solution-trucking.html` | `/solutions/trucking-logistics` |
| `kriva-solution-saas.html` | `/solutions/saas` |
| `kriva-solution-accounting.html` | `/solutions/accounting-integrations` |
| `kriva-solution-car-transport.html` | `/solutions/car-transportation` |
| `kriva-services-index.html` | `/services` |
| `kriva-contact.html` | `/contact` |

---

## 1. WHO / WHAT

KRIVA Technologies — product design & engineering agency, Ahmedabad India, remote-first,
clients in US/UK. Two core verticals: **US trucking/logistics ops software** and **UK/US B2B SaaS**,
plus QuickBooks/Xero integrations and auto transport.

**Buyer:** VP Operations at a trucking company; SaaS founder/product lead; finance ops lead.
Not a design audience. Craft matters more than spectacle.

---

## 2. THE BRIEF AS IT EVOLVED

Started as "redesign my site, make it award-level, Awwwards-inspired, heavy animation."
Evolved through pushback into: **content-faithful rebuild of the real site, page by page,
using a shared design system, with zero invented content.**

**Standing rules agreed with the client:**
1. Pull the live page BEFORE building. Never build blind.
2. Never invent metrics, testimonials, client names, capabilities, or claims.
3. Preserve existing URLs, meta intent, internal links, SEO terminology.
4. Mark all placeholders clearly.
5. Don't collapse/redirect the 17 service URLs yet — evidence first (Search Console).
6. Keep the design system; vary the domain story per page.
7. Advisor tone: challenge assumptions, rate confidence, lead with the uncomfortable answer.

---

## 3. DESIGN SYSTEM (identical token block in all 8 files)

Concept: **the site looks like the operations software KRIVA sells.** Mono system labels,
hairline rules, tabular numerals, DOT-signage colour semantics. Not a generic agency site.

```css
:root{
  --paper:#EAEAE4; --paper-2:#F1F1EC; --white:#FFFFFF;
  --ink:#0E1216; --ink-2:#161C22; --ink-line:#232B33; --ink-dim:#8C98A4;
  --steel:#5C6670; --steel-2:#7A838D; --rule:#D2D2C9; --rule-soft:#DFDFD8;
  --blue:#1B44C8; --amber:#DB9B1F; --green:#1B7A54; --violet:#5B44C8;
  --lime:#5FD3A0; --sky:#5B8CFF; --lilac:#B7A9FF; --red:#A62A1F;
  --f-display:'Archivo'; --f-body:'Inter'; --f-mono:'IBM Plex Mono';
  --gutter:clamp(20px,5vw,80px); --maxw:1440px;
  --e:cubic-bezier(.16,.84,.44,1); --e-io:cubic-bezier(.62,.02,.28,1);
  --t-fast:.32s; --t-mid:.62s; --t-slow:1s;
}
```

**Type scale:** `.d1 .d2 .d3` (Archivo, wdth axis 90–94 for display, 112 wordmark, 118 footer mark),
`.lede .body .body-sm`, `.eyebrow` (mono), `.num` (tabular).

**Motion primitives (same everywhere):** `[data-r]` reveal, `[data-s]` stagger,
`.mask` line-by-line headline reveal. Two easings, three durations. No animation libraries —
IntersectionObserver + CSS transitions + one shared rAF scroll loop per page.

**Shared components:** `.nav` (shrinks 72→58px, hides on scroll-down), `.sheet` mobile menu
(clip-path, Escape to close, scroll lock), `footer`, `.btn` (+ `.ghost .sm .on-dark`),
`.cta-band`, `.rel` related work, `.svc` service list, `.faq`, `.slot` screenshot frames,
`.cap-row` alternating capability rows, `.proof` + `.scope`.

**Accessibility baseline on every page:** skip link, semantic landmarks, focus-visible
(amber/lilac on dark), `aria-expanded` accordions, `aria-live` for state machines,
full `prefers-reduced-motion` (kills delays too), 48px touch targets on forms.

---

## 4. THE SIGNATURE MACHINES (one per domain — the core idea)

Each solution page has a scroll-driven state machine. Same design system, different
operational story. **Do not reuse one for another domain.**

| Page | Machine | States | Language |
|---|---|---|---|
| Homepage | `.console` dispatch board | statuses advance on scroll | dispatch/SLA |
| Trucking | `.console` load lifecycle | 8: received → assigned → confirmed → transit → exception → supervisor → delivered | lane, driver, SLA, exception, audit |
| SaaS | `.app` product shell | 7: signup → account → workspace → permissions → first value → activated → retained | progress ring, checklist, roles, funnel |
| Accounting | `.ledger` reconciliation | 8: imported → sync → validated → matched → exception → retry → reconciled → audit | records, match states, audit log. **The amount on INV-2293 self-corrects at stage 7** |
| Car transport | `.order` transport order | 8: quote → vehicle → pickup → carrier → dispatch → transit → delivered → POD | large price figure, **Customer/Ops view toggle switches automatically**, POD strip |

Process presentation also differs per page (vertical rail / horizontal stepper / pipeline with
gates / connected-dot arc) — deliberately, so pages don't read as clones.

**Mobile rule for all machines:** the sticky panel pins to top:62px at reduced height rather than
going static, so state changes stay visible while reading. Tables become stacked records.

---

## 5. PAGES BUILT (7 of ~12)

### Homepage — `kriva-redesign.html`
Cut 17 live sections → 9. Hero dispatch console is the signature. **All metrics/testimonials
on this page are invented (by me, in round 1) and are flagged with a demo banner.** This is the
one file whose content is NOT live-faithful — it predates the content rules.

### Case study template — `kriva-case-fleetflow.html`
Content 100% from live `/work/fleetflow-dispatch`. Components: `.ph` project hero, `.mrail`
metric rail, `.shot` screenshot viewer (clip-path mask + 1.08→1 zoom + annotation pins),
`.story` sticky screenshot storytelling, `.ba` before/after slider (range-input driven → keyboard
works free), `.narr`, `.spec`, `.qblock`, `.rel`, `.nextp`, `.chapters` sticky chapter rail,
`.progress` scroll bar.

### Work index — `kriva-work-index.html`
All 8 real projects. Alternating editorial rows (alternation recomputed after filtering).
Sticky filter chips with live counts, arrow-key nav, `aria-live`, deep links (`/work?filter=logistics`).
Featured FleetFlow on dark band. Hover previews desktop-only; mobile inverts to always-visible.

### Four solution pages
All content-faithful. Structure: hero + machine → scroll story → domain-specific section(s) →
capabilities → proof → process → related work → related services → FAQ → CTA.
Domain-specific sections: Trucking (none extra) · SaaS (funnel + before/after flow) ·
Accounting (architecture diagram + exception handling) · Car transport (three-audiences + quote breakdown).

### Services index — `kriva-services-index.html`
4 capability families, expandable rows, **capability × solution matrix built only from real
internal links**, proof map, problem-first entry paths.

### Contact — `kriva-contact.html`
Both `#book` and `#brief` anchors. Form preserves all 10 live fields exactly; grouped into 3
fieldsets, 21-option service dropdown given optgroups. Full validation/error-summary/loading/
success states. Booking section states honestly that no calendar exists yet.

---

## 6. THE REAL CONTENT INVENTORY

**8 case studies (live):** FleetFlow (trucking dispatch CRM) · PayrollPro (SaaS onboarding) ·
FinanceSync (QuickBooks/Xero reconciliation) · HealthTrack (patient mobile) · BrandLift (D2C rebrand) ·
CRMPulse (sales dashboard) · SupportAI (ticket automation) · LocalServe (marketplace MVP).

**Only FleetFlow publishes metrics:** −32% manual handle time · 11 min avg exception response ·
99.4% console uptime. (I wrongly called 99.4% invented in an early round — it IS on the live site.
Correction stands.)

**4 solutions:** trucking-logistics, saas, accounting-integrations, car-transportation.

**17 services:** product-design, ui-ux-design, ux-research, wireframing-prototyping, design-systems,
mobile-applications, web-application-design, saas-platforms, dashboard-design, crm-development,
branding, logo-design, web-development, api-integrations, ai-assisted-development,
no-code-low-code, automation-systems.

**Contact facts:** krivatechnlogies@gmail.com · +91 97244 54455 · WhatsApp wa.me/919724454455 ·
511 - I The Address, Ahmedabad, Gujarat 380060, IN · "reply within one business day" ·
NDA on request · no commitment required · **no self-serve calendar exists**.

---

## 7. OPEN FINDINGS & DECISIONS

### Decided
- **Car Transportation: KEEP STANDALONE.** Audited; 3/6 capabilities overlap trucking BUT it has
  three audiences (customer/carrier/ops) vs trucking's one, distinct keywords, sitewide links.
- **CTA wording: standardise on "Book a 20-minute fit call."** It's already canonical on /contact
  and all inner pages; "discovery call" collides with the paid "Discovery sprint" and process phase 01;
  naming the duration lowers the ask. **Homepage and /services still say "discovery call" — change them.**

### Service URL audit (NO redirects applied — awaiting Search Console)
- **Keep (7):** crm-development, dashboard-design*, api-integrations, mobile-applications,
  saas-platforms, ai-assisted-development, automation-systems
- **Merge candidates (6):** product-design + ui-ux-design (identical template, same hero image;
  product-design's own FAQ asks "Is this different from UI/UX design?") · ux-research +
  wireframing-prototyping · web-application-design · logo-design
- **Deprioritise (2):** branding, no-code-low-code
- **Needs evidence (2):** design-systems, web-development
- *`crm-development` is titled "CRM & Dashboard Design" while `dashboard-design` also exists —
  naming collision to resolve.

### Structural problems flagged
1. **Two contradictory taxonomies.** `/services` groups Design(10)/Development(4)/AI(3);
   the header dropdown groups Product&UX(5)/Apps&Dashboards(5)/Brand&Web(4)/AI(3).
2. **Six services linked from no solution page:** ux-research, wireframing-prototyping,
   web-application-design, branding, logo-design, no-code-low-code.
3. **Template boilerplate duplicated across all 4 solution pages:** "What we deliver for [x]"
   + "End-to-end design and development from an in-house team - no freelance marketplace handoffs."
   + "Structured phases with clear milestones and transparent communication."
4. **Lowercase-slug bug in live H2s:** "What we deliver for saas product solutions",
   "Ready to discuss your quickbooks & xero integrations project?"
5. **Duplicate CTA blocks** at the bottom of the live trucking page.
6. **Conflicting response promises on /contact:** "one business day" vs "within 24 hours".
7. **Team size contradiction:** homepage says "15+ senior team" AND "small team, founder-led".
8. **Testimonial/case name mismatch:** quote attributed to "FleetRoute Logistics",
   case published as "FleetFlow".
9. **99.4% uptime ≈ 52h downtime/year** — reads as below-par to an ops buyer. Reconsider featuring it.

### Content the client must supply
- **Screenshots** — every page has labelled slots with exact dimensions and intended content.
  Highest value item on the whole project.
- **Verified metrics** for the 7 case studies that have none.
- **Attributed testimonials** with permission.
- **FAQ answers** — collapsed on live pages, not extractable; flagged "pending migration" on all
  solution pages. **FAQPage schema deliberately omitted until real answers exist.**
- **One auto-transport case study** (client logos suggest xmileauto-transport, dc-auto-transport exist).
- **Search Console data** for the 17 service URLs before any redirect.
- Self-hosted woff2 font subsets (currently Google Fonts CDN).
- Form endpoint + scheduling embed (Cal.com/Calendly) for /contact.

---

## 8. REMAINING PAGE ORDER

1. **About** ← next. Must resolve the 15+ vs founder-led contradiction.
2. Process
3. Insights index + article template
4. Solutions index (`/solutions`)
5. Legal (privacy, terms), FAQ page, technologies
6. Individual service page template (after the SEO evidence decision)

---

## 9. PASTE THIS TO START THE NEW THREAD

> I'm continuing a website redesign for KRIVA Technologies. Attached is a handoff document
> and 8 HTML files from previous sessions. Read the handoff first — it contains the design
> system, standing rules, findings, and what's built.
>
> Keep the same advisor tone: challenge my assumptions, tag confidence [Certain]/[Likely]/[Guessing],
> lead with the uncomfortable answer, never open with agreement.
>
> Standing rules: pull the live page from https://web-nine-virid-37.vercel.app/ BEFORE building;
> never invent metrics, testimonials, client names or claims; preserve URLs and internal links;
> mark all placeholders; reuse the token block and shared components exactly.
>
> Next page: **About** (`/about`). Audit it first, then build it.
