# KRIVA website: execution plan (v3)

**Source:** live-site audit, 18 Nov 2026 (`../research/site-audit-2026-11-18.md`). Issue IDs (C-02, QW-01…) match the audit.
**Status:** plan only. No website changes have been made. Work starts after the owner approves this plan.

**What changed in v3:** tasks are now in one sequence ordered by priority, risk, dependencies and effort (§3); SEO safeguards with a baseline before any change (§5); test and acceptance criteria for forms, email, consent, analytics and session recording (§6); a full Phase 0 QA checklist (§7); a rollback plan (§8); and Phase 0 exit criteria (§9). The scope is unchanged.

---

## 1. Ground rules

**Basis:** **Confirmed** = measured on the live site or in the source with evidence · **Recommendation** = judgement · **Verify** = a risk to check before it counts as an issue.
**Effort:** S = under a day · M = 1–3 days · L = a week or more.
**Risk** (what could break if the change goes wrong): **Low** = cosmetic or reversible text · **Med** = forms, tracking or search signals on a few pages · **High** = site-wide behaviour, indexing, redirects.

**Scope guardrails**
- Reuse the existing design system, components and layouts. No new visual style. Visual changes are limited to token values (colour, type size) and removing elements.
- Deferred as redesign: varied hero layouts (U-01), inner-page H1 scale (U-02).
- No URL changes, redirects, robots.txt or canonical changes before Phase 3.

**How releases work on this site** (from `DEPLOY.md` and project history)
- Static HTML on Vercel plus one function (`api/inquiry.js`). **Pushing to `main` deploys production automatically.** The owner commits through Cursor.
- Work on a fresh branch from `main` (the local branch `design/home-x-2026-11` is not the base). Other sessions may share the working tree, so stage files by name and **never `git add -A`**.
- **One commit per task ID**, so any single task can be reverted alone.
- Fix the source, not generated output: `/work` → `_build_work_x.cjs`; case pages → `_build_case_x.cjs`; `/contact` → `_build_contact_x.cjs`; `/markets/*` → `_build_markets_x.cjs`; homepage CSS → `shared/home-x.css`, then `npm run build:home-css`.
- `shared/` assets are cached for 24h, so bump the `?v=` value on any changed shared file.
- The local preview (`npm run preview`) ignores `vercel.json` redirects and rewrite order, so verify routing on a **Vercel preview deployment**.
- Regenerate `sitemap.xml` (`npm run generate:sitemap`) and `llms.txt` (`generate-llms.cjs`) whenever titles, descriptions or indexable pages change.

---

## 2. Strategic decisions (recommendation + why)

| # | Decision | Recommendation | Why | Trade-off |
|---|---|---|---|---|
| **D1** | The 8 "representative" case studies | Projects based on real engagements become anonymised client stories with only true facts; the rest move to a labelled **"Concepts"** section; drop HealthTrack and BrandLift with 301s to /work (Phase 3). Phase 0 applies only the safe interim fix (C-01a). | One true story beats eight composites, and honest labels remove the misleading-claims risk. It is consistent with the owner's 6 Nov decision recorded in `docs/CLAIMS-TO-CONFIRM.md`. | Fewer case studies. |
| **D2** | Positioning | Lead with **US trucking, moving and logistics** (already the homepage H1); SaaS, QuickBooks/Xero and design are supporting practices. | Homepage, pricing, llms.txt and all seven real client sites already point there. | SaaS leads feel less addressed; /solutions/saas stays live. |
| **D3** | 19 services + 8 solutions + industries | Consolidate to about 9 services and merge /industries, **only in Phase 3, after the Search Console baseline**. Pages with meaningful impressions keep their content. | Removes self-competition and maintenance. | Short-term ranking wobble; mitigated by §5.4. |
| **D4** | "Book a call" opens a form | Add a real scheduler (Cal.com, Calendly or HubSpot Meetings; check current prices) on /contact; header label "Book a call". | Matches the label; removes a business-day delay for hot leads. | Zero-cost alternative: rename the button "Request a call". |
| **D5** | Consent model | **One banner for all visitors**, equal Accept/Reject, **basic consent mode** (no Google Analytics or Clarity requests at all before Accept), and a footer "Cookie settings" link. | Geo-targeting on static Vercel needs middleware; one behaviour everywhere is simplest and covers UK/EEA/Canada. | GA4 counts only consented users (current data is already bot-inflated). |
| **D6** | Market pages | Keep; footer and About links only; no new investment except /markets/us. | Localised and low risk. | — |
| **D7** | Homepage length | Cut 13 sections to about 8 using existing components. | The pitch repeats about four times. | Content moves to inner pages only. |

---

## 3. Master sequence (do in this order)

Ordering logic: **(1)** safety nets and baselines first (zero site risk, required by everything else); **(2)** verify the conversion path; **(3)** high-value, low-risk fixes; **(4)** search-signal changes as a separate release so any search movement can be attributed; **(5)** site-wide behaviour changes (consent, hero rendering) each in their own release; **(6)** owner-asset-dependent content; **(7)** structural SEO changes last.

| # | ID | Task | Priority | Basis | Risk | Depends on | Effort | Release |
|---|---|---|---|---|---|---|---|---|
| 1 | P0-01 | Record the rollback point (tag + current production deployment) | Critical (safety) | — | None | — | S | Pre-work |
| 2 | P0-02 | Capture the SEO and analytics baseline | Critical (safety) | — | None | GSC/GA4 access | S–M | Pre-work |
| 3 | C-04 | Verify production form delivery end to end, and add a monitor | Critical | Verify | None | Owner inbox | S | Pre-work |
| 4 | C-02 | Remove/relink the dead `elite-one.us` client link | Critical | Confirmed | Low | Owner answer (default: unlink) | S | **0A** |
| 5 | C-01a | Rewrite the 8 case-study descriptions (no outcome claims) | Critical | Confirmed | Low–Med (snippets) | P0-02 | S | **0A** |
| 6 | QW-01 | Add "Trucking or moving company website" to the /contact fit form | High | Confirmed | Med (form) | C-04 passed | S | **0A** |
| 7 | QW-05 | Move the decorative label out of the product-design `<h1>` | Low | Confirmed | Low | — | S | **0A** |
| 8 | QW-03 | `nofollow` the 5 competitor links | Medium | Confirmed | Low | — | S | **0A** |
| 9 | QW-09 | Fix landmark and ARIA-role markup | Low | Confirmed | Low | — | S | **0A** |
| 10 | QW-07 | Add `favicon.ico` | Low | Confirmed | Low | — | S | **0A** |
| 11 | QW-10 | Remove 51 Pexels/Unsplash disclaimer lines (keep CC BY credits) | Medium | Recommendation | Low (large diff) | Licence check | S–M | **0A** |
| 12 | QW-02 | Add internal links to the two website-cost articles | Medium | Confirmed | Low (additive) | P0-02; 0A stable 48h | S | **0B** |
| 13 | QW-06 | Align the schema graph on freight-broker and fleet pages | Low | Confirmed | Low–Med | P0-02 | S | **0B** |
| 14 | QW-04 | Trim 6 descriptions and 2 titles; lengthen /terms description | Low | Confirmed | Med (snippets/titles) | P0-02 page-level data | S | **0B** |
| 15 | QW-08 | `noindex` /careers and remove it from the sitemap | Low | Recommendation | Med (indexing) | P0-02 shows negligible impressions | S | **0B** |
| 16 | C-03 | Consent banner; GA4 + Clarity only after Accept; privacy policy | Critical | Confirmed | **High** (tracking, site-wide) | D5; banner wording; legal review | M | **1A** (alone) |
| 17 | L-01 | Legal check of "PIPEDA-conscious" (/markets/ca) and "Privacy Act-conscious" (/markets/au) claims | High | Verify | Low | Lawyer (same review as C-03) | S | **1A** |
| 18 | P-01 | Hero content visible at first paint (fixes missing LCP) | High | Confirmed | Med (all heroes) | — | M | **1B** |
| 19 | A-01 | Raise contrast tokens to ≥ 4.5:1 | High | Confirmed | Med (visual, site-wide) | — | M | **1C** |
| 20 | T-04 + QW-11 | Scheduler on /contact; header CTA label | High | Confirmed | Med (conversion path) | D4 | S–M | **1D** |
| 21 | C-01b | Reframe case studies per D1 | Critical | Recommendation | Med | D1; owner facts | M–L | 2 |
| 22 | T-01 | Testimonials beside CTAs | High | Confirmed (0 today) | Low | Written client approval | M | 2 |
| 23 | T-02 + S-02 | Named founder and team; real article authors; `Person` schema | High | Confirmed (0 named) | Low | Names, photos, bios | M | 2 |
| 24 | T-03 | Lead /work and the homepage with real client sites | High | Recommendation | Low | **Client permission to be named** (unconfirmed per CLAIMS-TO-CONFIRM) | M | 2 |
| 25 | CN-01 | Align lead sentences with D2 | High | Recommendation | Low | D2 | M | 2 |
| 26 | CN-05 | Shorten the homepage per D7 | High | Recommendation | Med (home) | D7 | M | 2 |
| 27 | N-01 | Regroup the mega-menu by buyer (same component) | High | Confirmed | Med (site-wide links) | §5.3 | M | 2 |
| 28 | CN-02/S-01/N-02 | Consolidate services, merge /industries, 301 redirects | High | Recommendation | **High** (URLs) | D3; 12-month GSC export | L | 3 |
| 29 | P-02 | Responsive images (`srcset`) | Medium | Confirmed | Low | — | M | 4 |
| 30 | P-04, P-05 | Main-thread work; CLS on /faq and /work | Medium | Confirmed | Low–Med | — | M | 4 |
| 31 | A-02 | 12px text floor | Medium | Confirmed | Med (visual) | — | M | 4 |
| 32 | T-06 | Standardise to two forms | Medium | Confirmed | Med (forms) | §6.1 | M | 4 |
| 33 | T-08 | LinkedIn, Clutch, Google Business Profile + `sameAs` | Medium | Confirmed | Low | Owner accounts | S | 4 |
| 34 | S-05, U-03, CN-03, CN-04, CN-06 | Insights feature, article template reuse, remove boilerplate blocks, jargon, experience framing | Medium | Mixed | Low | — | M | 4 |
| 35 | Low items | www single hop, CSP (report-only), dot rail on touch, clocks, footer address, steady publishing | Low | Mixed | Low | — | S each | 4 |

**Why Phase 0 is split into 0A and 0B:** 0A fixes proof and forms (highest business value, low search risk). 0B changes search signals (titles, descriptions, links, schema, indexing) and ships at least 48h after 0A is stable, so any Search Console movement can be traced to one release.

**Why consent ships alone (1A):** it changes tracking on every page and is the most likely change to need a fast rollback.

---

## 4. Task cards: Phase 0 (in sequence order)

Every card has a **Done when** line, which is its acceptance test. Phases 1–4 follow in §10.

### Pre-work (no deployment)

- [ ] **#1 P0-01 · Rollback point**
  - Tag the commit currently on production: `git tag pre-phase0-<date> <sha>` and push the tag. Record the **current Production deployment URL** from Vercel → Deployments in `project-record.md`.
  - Confirm the owner can see the **Promote to Production / Instant Rollback** option for that deployment.
  - **Done when:** tag exists on the remote; deployment URL recorded; rollback access confirmed.

- [ ] **#2 P0-02 · SEO and analytics baseline** (see §5.1 for the full list)
  - ✅ Done 18 Nov: the crawl, Lighthouse, host files and checks are preserved read-only in `.website-project/baseline/2026-11-18/` (see its README). Still to do: re-crawl production the day before release 0A into a new dated folder.
  - Export Search Console and GA4 data per §5.1. If either is unavailable, write "not available" in the baseline README and treat **every** 0B change as Med risk.
  - **Done when:** baseline folder holds a crawl snapshot, GSC exports (or "not available") and a GA4 export; changed-page list cross-referenced with their clicks and impressions.

- [ ] **#3 C-04 · Verify production form delivery**
  - Follow `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md` §3 exactly (manual, production, three real submissions) and the criteria in §6.2.
  - Add an uptime monitor on `GET https://krivatechnologies.com/api/inquiry` **expecting HTTP 405** (proves the function runs without sending email), checking every 5 minutes with email alerts.
  - **Gate:** if any submission fails, **stop Phase 0**. Fix delivery first (Vercel env `GMAIL_APP_PASSWORD`, optional `WEB3FORMS_ACCESS_KEY`, then redeploy). Every page depends on this path.
  - **Done when:** all §6.2 criteria pass and the monitor is live.

### Release 0A: proof, form and low-risk fixes

- [ ] **#4 C-02 · Dead client link**
  - **Files:** `_build_work_x.cjs` (then regenerate `kriva-work-index.html`), `kriva-solution-trucking-websites.html`, `kriva-solution-car-transport.html`
  - **Change:** if the owner confirms a new domain, relink. Otherwise (the default) remove "Visit live site", label the card "Archived project (site no longer online)", and take its screenshots out of the /work hero reel and the "ShiftRail · EliteOne · Schwarz" proof lists.
  - **Done when:** `grep -r "elite-one" *.html _build_*.cjs` returns nothing; external link check has no unresolved domains; the /work hero renders without gaps at 1440 and 390.

- [ ] **#5 C-01a · Case-study descriptions**
  - **Files:** 8 × `kriva-case-*.html` and `_build_case_x.cjs` if it writes head tags: meta description, `og:description`, `twitter:description`, JSON-LD `CreativeWork.description`
  - **Change:** describe scope, not outcomes; prefix "Representative project". Specifically remove "modernized" (ShiftRail) and "reduces manual data entry" (CRMPulse), and change BrandLift's "consumer electronics" to match its page (apparel). Keep each page's primary topic words (for example "trucking dispatch CRM", "QuickBooks and Xero reconciliation") at the start, and keep them 140–158 characters.
  - **Done when:** no description asserts a delivered result; all four description fields match per page; lengths in range; titles unchanged.

- [ ] **#6 QW-01 · Contact form Website option**
  - **Files:** `_build_contact_x.cjs` and `kriva-contact.html` (`#fit-ptype`, line 387)
  - **Change:** add `<option>Trucking or moving company website</option>` as the first real option, using the same `value` text as the homepage form's website option so inbox filters and the email template stay consistent.
  - **Done when:** §6.1 passes for both /contact forms; one post-release production submission choosing this option arrives with the project type shown (§6.2).

- [ ] **#7 QW-05 · Product-design H1**
  - **File:** `kriva-service-product-design.html`: move `<b class="pdx-sel" aria-hidden="true">…</b>` out of the `<h1>`, positioned by existing CSS so the visual result is identical.
  - **Done when:** `document.querySelector('h1').textContent` equals "Product design for logistics software and SaaS, mapped before code"; screenshots at 1440/390 match the baseline.

- [ ] **#8 QW-03 · Competitor links**
  - **Files:** `kriva-insight-trucking-website-cost.html` (digitrucksolutions, gatorbyte, vaylostudios, codeifydigital), `kriva-pricing.html` (gilzor)
  - **Change:** `rel="nofollow noopener noreferrer"`; keep the citations.
  - **Done when:** all 5 links carry `nofollow`; copy unchanged.

- [ ] **#9 QW-09 · Landmark and ARIA markup**
  - **Pages:** `<aside>` nested in a landmark on 12 pages (incl. /contact, /process, /solutions, trucking, freight-broker, fleet); `role="listitem"` misuse on /contact, /solutions/accounting-integrations, /services/dashboard-design.
  - **Done when:** axe `landmark-complementary-is-top-level` = 0 and `aria-allowed-role` = 0 across all 68 pages; no visual change.

- [ ] **#10 QW-07 · favicon.ico**
  - Generate 16/32px `favicon.ico` from `favicon.svg` (sharp); add to the root; check `.vercelignore` doesn't exclude it.
  - **Done when:** `curl -I https://<preview>/favicon.ico` returns 200 `image/x-icon`.

- [ ] **#11 QW-10 · Stock-photo disclaimer lines**
  - **Scope:** 51 lines across 36 HTML files (scripted, reviewed diff).
  - **Licence check first:** for each line, confirm the image's source licence (`content/attribution-registry.cjs` and the photo sourcing records). Remove only Pexels- and Unsplash-licensed credits. **Keep** CC BY / CC BY-SA credits in `kriva-redesign.html`, `kriva-solution-car-transport.html`, `kriva-solution-fleet-management.html` and `kriva-solution-freight-broker.html`.
  - **Done when:** 0 Pexels/Unsplash credit lines remain; every CC-licensed image still shows its credit; no layout gaps where captions were (screenshot review of the 36 pages at 1440/390).

### Release 0B: search-signal changes (≥ 48h after 0A is stable)

- [ ] **#12 QW-02 · Internal links to the website-cost articles**
  - **Files:** `kriva-redesign.html` (websites row), `kriva-pricing.html` (website tier), `kriva-solution-trucking-websites.html`, `kriva-solution-moving-websites.html`
  - **Change:** one contextual link to /insights/trucking-company-website-cost and/or /insights/moving-company-website-features, with descriptive anchors (for example "what a trucking company website costs"). Additive only; remove nothing.
  - **Done when:** each target has ≥ 6 contextual inbound links (from 2); every new link returns 200 directly (no redirect).

- [ ] **#13 QW-06 · Schema graph consistency**
  - **Files:** `kriva-solution-freight-broker.html`, `kriva-solution-fleet-management.html`: use the same shared graph as the other solution pages.
  - **Done when:** Schema Markup Validator and Google Rich Results Test show 0 errors on both; graph types match `kriva-solution-trucking.html`; nothing describes content that isn't visible.

- [ ] **#14 QW-04 · Title and description lengths**
  - **Files and targets:** descriptions → 140–158 characters: `kriva-redesign.html` (163), `kriva-process.html` (181), `kriva-careers.html` (161), `kriva-service-web-development.html` (168), `kriva-pricing.html` (169), `kriva-solution-moving-websites.html` (169); `kriva-terms.html` 107 → 120–158; titles 63 → ≤ 60: `kriva-solution-freight-broker.html`, `kriva-solution-accounting.html`.
  - **Safeguard:** follow §5.2. For the two titles, remove only trailing words; the primary keyword stays first.
  - **Done when:** lengths in range; `og:` and `twitter:` fields match; llms.txt regenerated; every edit logged in the change log (§5.2).

- [ ] **#15 QW-08 · /careers noindex**
  - **Go/no-go:** only if the baseline shows < 10 impressions in 3 months for /careers; otherwise skip and record why.
  - **Change:** `<meta name="robots" content="noindex,follow">` on `kriva-careers.html`; exclude it in `generate-sitemap.cjs`; regenerate sitemap and llms.txt. Footer link stays.
  - **Done when:** /careers serves noindex; sitemap lists exactly 67 URLs; no other page's robots meta changed (crawl diff).

---

## 5. SEO safeguards

### 5.1 Baseline (before release 0A; refreshed before 0B and before Phase 3)

| Source | What to export | Where |
|---|---|---|
| Crawl (already have 18 Nov) | Per URL: status, title, description, canonical, robots, H1, schema types, inbound/outbound internal links, word count | `baseline/<date>/crawl.json` |
| Search Console → Indexing → Pages | Indexed vs not-indexed counts and every reason row (export) | `baseline/<date>/gsc-indexing.csv` |
| Search Console → Performance | Last 3 and 16 months: export by **Page** and by **Query**; for each page in the change list, its top queries | `baseline/<date>/gsc-pages.csv`, `gsc-queries.csv` |
| Search Console → Sitemaps | Status, discovered URLs | note in README |
| Search Console → URL Inspection | For each page in the change list: indexed? Google-chosen canonical = user canonical? Last crawl date | `baseline/<date>/url-inspection.md` |
| GA4 | Last 90 days: organic landing pages (sessions, `generate_lead`), excluding Ashburn, Council Bluffs and office traffic; referrals from chatgpt.com, perplexity.ai and other AI sources | `baseline/<date>/ga4-organic.csv` |
| Bing Webmaster Tools (if set up) | Indexed pages, top pages. This matters because ChatGPT search draws on Bing, and chatgpt.com is the best-engaged source | `baseline/<date>/bing.csv` |
| Lighthouse + axe | 12-template Lighthouse table; axe counts per rule | already in the audit; copy |

Any source that isn't available is written down as "not available", not skipped silently.

### 5.2 Rules for each change type

| Change | Rule |
|---|---|
| **Titles** | Change only to fix length or accuracy. Keep the primary keyword and its position. One title change per page per 30 days. Do not touch a title of a page with ≥ 20 clicks in the last 90 days without an explicit reason in the change log. |
| **Descriptions** | Keep the page's primary topic words; 140–158 characters; match `og:`/`twitter:` fields. |
| **H1s** | Visible keyword text stays identical; only non-content elements move out. |
| **Internal links** | Phase 0 adds links only and removes none. Descriptive anchors; link to final 200 URLs, never redirecting or noindexed URLs. |
| **Indexing** | `noindex` only on /careers in Phase 0, and only with the go/no-go check. Never list a noindexed URL in the sitemap. |
| **Schema** | Validate every changed page; describe only visible content; no review or rating markup without real reviews. |
| **Untouched in Phases 0–2** | URLs, canonicals, `robots.txt`, `vercel.json` redirects and rewrites. |
| **Change log** | `.website-project/seo-change-log.md`: date · release · URL · field · before · after · reason. Required for every title, description, H1, robots, schema or link change. |

### 5.3 After each release

- Day 0: URL Inspection → **Request indexing** for the 3–5 most important changed URLs; resubmit the sitemap if it changed.
- Weekly for 4 weeks: compare each changed page's clicks, impressions and average position with the baseline, against the site-wide trend for the same period.
- **Revert trigger (page level, not an emergency rollback):** a changed page loses > 30% of impressions over 14 days while the site-wide trend is flat, or drops off a query it ranked top-10 for. Restore that page's previous title/description from the change log. Low-traffic pages are noisy, so judge on 2+ weeks of data.
- **Immediate rollback triggers** (§8): any sitemap URL returns non-200; noindex appears on any page other than /careers; a canonical changes; Search Console reports a new indexing error type.

### 5.4 Extra safeguards for Phase 3 (consolidation)

Redirect map (old → new, every URL) reviewed by the owner; each source keeps its best content in the target; redirects validated on the **Vercel preview** with `vercel curl` (single hop, 301/308, correct target, no loops; rewrites before the `/solutions/:slug/:file*` wildcard); internal links updated to final URLs; sitemap and llms.txt regenerated; monitoring for 8 weeks.

---

## 6. Testing and acceptance criteria

**Safety rule for all form testing:** automated form scripts (`_qa_form.cjs`, `_qa_all_forms.cjs`) run **only against local or preview builds**, never production. Before each run, confirm the script aborts `formsubmit.co`, `api.web3forms.com`, Google Analytics and Clarity (`_qa_all_forms.cjs` lines 61–62 do), and stubs `/api/inquiry`. One run on 8 Nov sent real emails. Production is tested **manually** only.

### 6.1 Contact and inquiry forms (UI, local or preview, automated + manual)

| Check | Acceptance criterion |
|---|---|
| Coverage | `_qa_all_forms.cjs` passes on every form on all 68 pages (homepage, page inquiry, /contact fit, /contact brief) |
| Required fields | An empty submit is blocked; each required field shows its own error text, linked by `aria-describedby`; focus moves to the first error |
| Website option (QW-01) | Present as the first real option in `#fit-ptype`; the posted `ptype` value equals the homepage's website option value |
| Labels and keyboard | Every field has a label; the whole form works by keyboard (Tab order, Space/Enter on select and submit); focus is visible |
| Honeypot | `website_hp` is not visible, not focusable (`tabindex=-1`), `aria-hidden`; a filled honeypot returns success with no send |
| Duplicate submit | The button disables during the send; a double-click sends one request |
| Success (stub 200) | "Inquiry accepted" state shown; exactly one `generate_lead` queued (inspect `dataLayer`) |
| Failure (stub 502, no backup key) | Clear error with a working `mailto:` fallback including a subject; **no** `generate_lead` |
| Failure with backup (stub 502 + backup key) | Web3Forms path attempted (intercepted); success shown only if Web3Forms returns success |
| Mobile | At 390px and 320px: no sideways scroll; the field tapped is not hidden by the keyboard or the consent banner (after 1A); targets ≥ 24px |

### 6.2 Email delivery (production, manual; extends the docs checklist §3)

| Check | Acceptance criterion |
|---|---|
| Submissions | 3 before 0A (contact fit, contact brief, one solution page) + 1 after 0A (fit form with the new Website option). Name `TEST - ignore <date>` |
| UI | Each shows "Inquiry accepted" |
| Studio email | Arrives at `hello@krivatechnologies.com` within 5 minutes, containing name, email, company, project type, page URL and message |
| Auto-reply | Arrives at the tester's address within 5 minutes; lands in the inbox, not spam; Gmail "Show original" shows **SPF, DKIM and DMARC = PASS** |
| Server | `vercel logs --no-branch --environment production --since 1h --query inquiry --expand` shows a successful send per test and no 5xx |
| Analytics | GA4 Realtime/DebugView shows **exactly one** `generate_lead` per test (run outside the office IP, or while the internal filter is in Testing) |
| Monitor | `GET /api/inquiry` returns 405; monitor alerting tested once |
| Clean-up | Test emails labelled; nobody follows them up as leads |

### 6.3 Consent management (release 1A)

| Check | Acceptance criterion |
|---|---|
| Before any choice (fresh profile) | No cookies named `_ga`, `_ga_*`, `_clck`, `_clsk`, `CLID`, `MUID`; **no** requests to `googletagmanager.com/gtag`, `*.google-analytics.com`, `*.clarity.ms` (DevTools Network, filter by domain) |
| Banner | Shown on the first page view on every template; Accept and Reject have equal size, colour weight and position level; links to the privacy policy; built from existing button styles |
| Accept | GA4 loads and sends exactly one `page_view` for the current page; Clarity loads; the choice persists across pages and reloads; the banner does not reappear |
| Reject | Nothing loads; the choice persists across pages and reloads; the banner does not reappear |
| Change of mind | Footer "Cookie settings" reopens the banner; switching Accept → Reject stops further hits from the next page and clears `_ga`/`_clck` cookies on the domain |
| Global Privacy Control | With GPC on, treated as Reject unless the user explicitly accepts |
| Accessibility | Reachable by keyboard; visible focus; buttons have clear names; banner has an accessible name; Esc does not count as Accept |
| Layout | Doesn't cover form submit buttons at 390/320px; CLS stays < 0.1 (fixed position); Lighthouse performance on 12 templates within 5 points of baseline |
| Privacy policy | Describes the banner, the cookies, Clarity, and how to change the choice; **lawyer sign-off recorded** in `project-record.md` before release |

### 6.4 Analytics (GA4), after Accept

| Check | Acceptance criterion |
|---|---|
| Page views | Exactly one `page_view` per page load on all templates, including /insights filter changes (they must not fire a second `page_view`, a known risk with `history.replaceState`) |
| Leads | `generate_lead` once per confirmed acceptance (API ok or Web3Forms success); never on validation errors or failures; sessionStorage dedup works on reload |
| CTA tracking | `cta_click` fires for tagged CTAs; links to `/contact#book`, `#brief`, `/pricing` and `#inquire` are tracked once (no `data-kriva-cta` duplicates) |
| Tools | GA4 DebugView via `?ga_debug=1`; Realtime shows the events |
| Configuration | Key events: only `generate_lead`; Enhanced measurement "Form interactions" off (docs checklist §1) |
| Baseline note | Weekly users before 1A recorded, so the drop from consent-only counting isn't mistaken for a traffic loss |

### 6.5 Session recording (Microsoft Clarity), after Accept

| Check | Acceptance criterion |
|---|---|
| Gating | Clarity script requested only after Accept; never after Reject. Use Clarity's consent call as its current documentation requires (verify the exact API at implementation time) |
| Masking | Clarity project masking set to **Strict** or **Balanced**; a test recording shows form fields (name, email, details) masked |
| Recording | A consented test session appears in the Clarity dashboard (allow up to 2 hours); a rejected test session does not |
| Rollback switch | Owner knows how to pause recording in Clarity project settings (immediate kill switch without a deployment) |

---

## 7. Phase 0 QA checklist (run on the Vercel preview for each release, 0A and 0B)

### A. Build verification
- [ ] `git diff --stat main...<branch>` lists only the files named in the task cards (plus regenerated `sitemap.xml`, `llms.txt`, `llms-full.txt`, `home.bundle.css` if applicable)
- [ ] One commit per task ID; commit messages reference the ID
- [ ] `?v=` bumped on every changed file under `shared/`
- [ ] `vercel.json` unchanged (Phase 0); `robots.txt` unchanged; `sitemap.xml` changed only in 0B, and only to remove /careers
- [ ] Secret scan: `git diff main...<branch> | grep -iE "password|secret|api[_-]?key|token"` returns nothing new; no `.env*` files staged
- [ ] `node _seo_audit.cjs` passes with no new failures versus baseline
- [ ] Vercel preview deployment status **Ready**; on the preview `GET /api/inquiry` → 405 and empty `POST` → 400

### B. Mobile responsiveness
- [ ] `PORT=<port> node _qa_all_routes.cjs` (3 viewports) on all 68 routes: 0 horizontal overflow, Figtree loaded, no images without alt
- [ ] 320px and 390px manual check of every changed page: /, /contact (both forms), /work, /pricing, /solutions/trucking-company-websites, /solutions/car-transportation, /solutions/moving-company-websites, /services/product-design, /insights/trucking-company-website-cost
- [ ] One real iPhone (Safari) and one Android (Chrome) pass on /contact: select the new option, submit to the preview stub
- [ ] Review long pages with per-section screenshots (full-page captures over ~16,384px repeat and are not evidence)

### C. Accessibility
- [ ] axe on all 68 pages: **no rule has more violations than baseline** (baseline: color-contrast 241 elements on 32 pages; landmark nesting 12 pages; aria-allowed-role 3 pages)
- [ ] After 0A: `landmark-complementary-is-top-level` = 0, `aria-allowed-role` = 0
- [ ] Exactly one `<h1>` per page; the product-design H1 text is exact (#7)
- [ ] Keyboard-only walk-through of the /contact fit form, including the new option

### D. Broken links
- [ ] `npm run qa:links`: 0 broken internal links
- [ ] Crawl the preview: every internal link returns 200 directly (no 3xx, no 404); new 0B links included
- [ ] External links: all resolve; known bot-blocked domains (unsplash.com, pexels.com, cascadiacollection.com → 401/403 to scripts) checked in a browser; no `elite-one.us`

### E. Console errors
- [ ] All 68 pages, desktop and mobile: 0 JavaScript errors, 0 page errors, 0 failed requests ≥ 400 (the favicon 404 is gone after #10)

### F. SEO
- [ ] Crawl diff versus baseline: titles, descriptions, H1s, canonicals and robots differ **only** on pages and fields in the change log
- [ ] All titles unique and ≤ 60 characters on changed pages; descriptions 140–158 (/terms 120–158)
- [ ] Canonicals unchanged on all 68 pages
- [ ] Robots meta: `noindex` only on /careers (0B), and only if the go/no-go passed
- [ ] Sitemap: valid XML; 68 URLs after 0A; 67 after 0B (if #15 shipped); every listed URL returns 200
- [ ] Schema: Schema Markup Validator 0 errors on every changed page; Rich Results Test on freight-broker and fleet
- [ ] Lighthouse SEO = 100 on the 12 templates
- [ ] llms.txt reflects the new descriptions

### G. Regression
- [ ] `_qa_all_forms.cjs` (stubbed, interception confirmed) passes on all forms on all 68 pages
- [ ] `_qa_form.cjs` passes on /contact
- [ ] Desktop 1440 and mobile 390 fold screenshots of every changed page compared with the baseline: only intended differences
- [ ] Lighthouse mobile performance on the 12 templates: no template more than 5 points below baseline (re-run once to rule out noise before failing)
- [ ] Analytics tag present on all 68 pages; with `?ga_debug=1` on the preview, one `page_view` per page on 5 sampled templates
- [ ] `node _qa_journey.cjs` (conversion journeys against the local preview on port 5177; it intercepts `/api/inquiry` and analytics, so no email is sent) passes

### H. Content
- [ ] Changed copy spell-checked; no `[NEEDS:` markers
- [ ] No new claim without evidence (cross-check `docs/CLAIMS-TO-CONFIRM.md`)

### I. Production smoke test (within 1 hour of each release)
- [ ] Fetch changed pages with a cache-busting query (`?cb=<time>`): 200, correct titles and descriptions
- [ ] `X-Vercel-Id` shows the new deployment; `/api/inquiry` → 405
- [ ] One manual production form submission (after 0A: the Website option), per §6.2
- [ ] Uptime monitor green
- [ ] Release recorded in `project-record.md` (date, commit, deployment URL)

---

## 8. Rollback plan

### 8.1 Before every release
1. Tag the production commit: `pre-<release>-<date>`.
2. Record the current Production deployment URL (Vercel → Deployments).
3. Keep **one commit per task ID**, so a single task can be reverted without touching the rest.
4. Record any Vercel **environment variable** change separately (with old and new names; never values in git). Deployment rollbacks do **not** revert env vars.

### 8.2 How to roll back

| Level | When | How | Time |
|---|---|---|---|
| **1. Instant rollback** | Anything broken on production that affects forms, tracking, indexing or layout | Vercel → Deployments → previous Production deployment → **Promote to Production** (Instant Rollback). Then do level 2, otherwise the next push redeploys the broken change | ~1 minute |
| **2. Revert the code** | After level 1, or for a single bad task | `git revert <commit>` for that task ID, then push to `main` (auto-deploys) | ~10 minutes |
| **3. Page-level SEO revert** | Search drop per §5.3 (not an emergency) | Restore the previous title/description from the change log; normal release | Next release |
| **4. Kill switches** | Tracking misbehaves | Clarity: pause recording in project settings. GA4: release 1A's consent default denies everything, so reverting 1A restores the old tracking | Immediate |

Rolled-back HTML brings its old `?v=` asset URLs with it, so cached `shared/` files don't need manual purging.

### 8.3 Rollback triggers by area

| Area | Roll back immediately if… | Do **not** roll back if… |
|---|---|---|
| **Forms** | A production submission shows an error or no success state; the studio email or auto-reply doesn't arrive within 10 minutes; `/api/inquiry` returns 5xx in logs after the release | Delivery fails because of an env or credential problem (Gmail App Password): fix the env and redeploy |
| **Tracking (GA4)** | `page_view` missing or doubled on any template; `generate_lead` missing on success or firing on failure; the banner blocks clicks or forms | GA4 user count drops after 1A (expected with consent-only counting) |
| **Session recording** | Clarity loads before consent or records unmasked form text → pause Clarity first, then roll back 1A | — |
| **SEO** | Any sitemap URL returns non-200; `noindex` on any page other than /careers; canonical or robots changes not in the change log; a new indexing error type in Search Console | Normal ranking fluctuation; use §5.3 page-level reverts after 14 days of data |
| **Layout / function** | Any template visually broken, any JavaScript error, sideways scroll at 390px, CLS > 0.1 introduced | Pixel differences that were intended |

After any rollback: re-run §7 I (smoke test), log the incident in `project-record.md` Issues, and fix on the branch before re-releasing.

---

## 9. Phase 0 exit criteria (all must be true to call Phase 0 complete)

1. **Rollback ready:** pre-release tags exist for 0A and 0B; previous deployment URLs recorded; owner confirmed Instant Rollback access.
2. **Baseline saved:** crawl snapshot, GSC exports (or documented "not available"), GA4 organic export and URL Inspection notes in `.website-project/baseline/`.
3. **Form delivery proven:** all §6.2 criteria passed before 0A and again after 0A (Website option); uptime monitor live and alert tested.
4. **Every Phase 0 task card's "Done when" is met** on production (#4–#15); #15 either shipped or skipped with a recorded reason.
5. **QA checklist §7 A–I fully ticked** for both 0A and 0B, with no unexplained failures.
6. **No regressions:** no new axe violations; 0 console errors; 0 broken internal links; 0 sideways overflow; Lighthouse within 5 points of baseline; crawl diff shows only logged changes.
7. **Critical issues targeted by Phase 0 closed and verified on production:** C-02, C-01a, C-04. C-03 (consent) is **critical but scheduled for release 1A**; the owner acknowledges this in writing. A critical issue left open blocks calling the whole project complete, not Phase 0.
8. **Change log complete** for every SEO-relevant edit.
9. **Owner approval recorded** in `project-record.md` (date and exact words) for the 0A preview and the 0B preview **before** each is pushed to `main`.
10. **48-hour stability:** no rollback triggers fired in the 48 hours after 0B; the first weekly §5.3 check is scheduled.

---

## 10. Phases 1–4: task cards

### Phase 1 (each in its own release; entry: Phase 0 complete)

- [ ] **#16 C-03 · Consent (release 1A)**
  - **Files:** inline consent default and `KRIVA_CLARITY_START…END` block in all 69 HTML files (scripted, reviewed diff); `shared/analytics.js`; `kriva-privacy.html`; footer "Cookie settings" link
  - **Change:** per D5; banner from existing button styles; basic consent mode.
  - **Done when:** all of §6.3, §6.4 and §6.5 pass on preview and production; lawyer sign-off recorded.

- [ ] **#17 L-01 · Privacy wording on market pages (with the 1A legal review)**
  - **Files:** `_build_markets_x.cjs` → `kriva-market-ca.html` ("PIPEDA-conscious" ×2), `kriva-market-au.html` ("Privacy Act-conscious" ×2)
  - **Change:** keep only if the lawyer approves; otherwise reword to describe concrete practices ("role-based access control and audit logs").
  - **Done when:** the wording is approved or replaced; the lawyer's decision is recorded.

- [ ] **#18 P-01 · Hero visible at first paint (release 1B)**
  - **Files:** `kriva-solution-trucking.html` and the shared reveal CSS/JS (`html.js [data-r]`, `sx-fade`, `svx-fade`)
  - **Change:** exempt above-the-fold hero content (H1, intro, primary CTA, hero visual) from entrance animations site-wide; below-the-fold reveals unchanged; `prefers-reduced-motion` still respected.
  - **Done when:** mobile Lighthouse records LCP ≤ 2.5s on 3 consecutive runs on /solutions/trucking-logistics and /solutions/trucking-company-websites; on the other 10 templates the LCP element is hero content (not the logo) with no performance drop over 5 points; fold screenshots match apart from the absent fade.

- [ ] **#19 A-01 · Contrast (release 1C)**
  - **Files:** muted-label tokens in the shared and page CSS (worst: accounting-integrations 41 elements, car-transport 27, saas 21, trucking 18, insights 15, freight-broker 14, technologies 10, home 8 via `shared/home-x.css` → `npm run build:home-css`)
  - **Done when:** axe `color-contrast` = 0 on all 68 pages; fold screenshots reviewed on all templates.

- [ ] **#20 T-04 + QW-11 · Scheduler and CTA label (release 1D)**
  - **Files:** `_build_contact_x.cjs` → `kriva-contact.html` (`#book`); header CTA in all HTML files
  - **Done when:** the scheduler loads after consent if it sets cookies (check the tool's behaviour), shows US-hours slots, and a test booking creates a calendar event and confirmation email; the header label is changed on all 68 pages; the Brief form is unchanged and passes §6.1.

### Phase 2 (content; each item ships when its owner input arrives)

| # | Task | Done when |
|---|---|---|
| 21 | C-01b case studies per D1 | Every case page is either an anonymised client story with owner-confirmed facts or labelled "Concept"; descriptions match; no past-tense research claims on concepts |
| 22 | T-01 testimonials | ≥ 3 testimonials live, each with written client approval logged in `content/attribution-registry.cjs` (status `approved`) |
| 23 | T-02 + S-02 people | About names the founder and leads with photos and bios; all 12 articles have a named author and bio box; `Person` schema validates; `sameAs` includes LinkedIn |
| 24 | T-03 real work first | Written permission from each named client recorded; /work and homepage lead with the client sites |
| 25 | CN-01 positioning | Lead sentences of /services, /solutions, /about and the featured /insights slot match D2 |
| 26 | CN-05 homepage | 13 → about 8 sections using existing components; §7 QA passes on /; Lighthouse within 5 points |
| 27 | N-01 navigation | Same component, regrouped; every menu link returns 200 directly; crawl confirms no page lost its nav inbound links |

### Phase 3 (structural SEO; entry: Phase 2 stable and a fresh 16-month GSC export)

| # | Task | Done when |
|---|---|---|
| 28 | Consolidation per D3 and §5.4 | Owner-approved redirect map; every old URL returns a single-hop 301/308 to its target on preview and production; sitemap and llms.txt regenerated; internal links point to final URLs; 8-week monitoring scheduled |

### Phase 4 (Medium and Low backlog)

| # | Task | Done when |
|---|---|---|
| 29 | P-02 responsive images | Lighthouse "properly size images" passes on /services; image weight on /services ≤ 400 KB on mobile |
| 30 | P-04, P-05 | TBT ≤ 200ms on /, /about, /services/crm-development (mobile Lighthouse); CLS < 0.1 on /faq and /work; FAQ jump links land below the header |
| 31 | A-02 | No real text under 12px (axe-style scan); decorative mock text `aria-hidden` |
| 32 | T-06 forms | Two form variants site-wide; §6.1 passes on all pages; a production test per variant per §6.2 |
| 33 | T-08 profiles | Profiles live and linked; `sameAs` updated and validated |
| 34 | S-05, U-03, CN-03, CN-04, CN-06 | Trucking article featured; 11 articles on the existing newer layout; boilerplate blocks gone from /services, /solutions, /technologies; "fit call" not used in CTAs |
| 35 | Low items | Each verified individually (www: one hop; CSP report-only with 0 violations for a week; dot rail hidden on touch; footer address and socials present) |

---

## 11. Owner input checklist (in the order it's needed)

- [ ] Vercel access for Instant Rollback; GSC and GA4 access or exports (#1, #2)
- [ ] Inbox checks for the production form tests (#3)
- [ ] Is `elite-one.us` gone, or did the client move? Default if no answer: unlink (#4)
- [ ] Approve the 0A and 0B previews in writing (§9)
- [ ] Consent banner wording; lawyer for banner, privacy policy and market-page privacy wording (#16, #17)
- [ ] Scheduler choice; optional US phone number (#20)
- [ ] Which case studies are real (D1); positioning (D2); homepage sections (D7)
- [ ] Testimonials and **written permission to name client websites** (#22, #24)
- [ ] Founder and team names, photos, bios, LinkedIn (#23)
- [ ] Approve the Phase 3 redirect map (#28)
