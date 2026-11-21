# Analytics and SEO review, 2026-11-19 (final)

**Status:** All changes are local and uncommitted on `design/home-x-2026-11`, waiting for the owner's review. Nothing has been deployed, no GA4 or Search Console setting has been changed, and no indexing has been requested.

**Source data:** 19 GA4 screenshots (28 days, Oct 22 to Nov 18 2026, plus 7-day Home cards and the Search Console reports linked into GA4). Search Console itself and keyword-volume tools were not available.

**Companion documents**
- Open issues found during testing: `.website-project/research/open-issues-2026-11-19.md`
- UK cookie-consent recommendation (awaiting approval): `.website-project/strategy/uk-consent-recommendation-2026-11-19.md`
- Team checklist (updated): `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md`

---

## 1. What the data says

### Most traffic is not real buyers yet
| Metric (28 days) | Value |
|---|---|
| Active users / new users | 71 / 65 |
| Sessions / engagement rate | 123 / 43.1% |
| Users from the office or data centres | **47 of 71 (66%)**: Ahmedabad 26, Ashburn 17, Council Bluffs 2, Groningen 2 |
| Key events / qualified leads | 9 / 0 |

- **United States, 28 users:** 17 from Ashburn and 2 from Council Bluffs (data centres). US engagement rate was 17.9% with a 4-second average, so real US visitors were about 7 to 9.
- **Other target markets:** Canada 3 (Toronto 2), Australia 1, UK 0, UAE 0. In total, roughly **10 to 13 genuine visitors from the five target markets** in 28 days.
- **India, 29 users and 84% of all events:** mostly the team plus the 18 Nov audit crawl. The Nov 18 spike (about 125 page views) matches the 68-page Puppeteer/Lighthouse audit run that day.
- **9 key events and 0 qualified leads:** each lead sent `generate_lead`, `form_submit` and `contact_form_submit`, so 9 fits 3 submissions counted 3 times each.
- **9 sessions landed on "(not set)"** and lasted 2 seconds, which is typical of bots.

### Channels
| Channel | Sessions | Engagement | Avg time |
|---|---|---|---|
| Direct | 76 | 27.6% | 16 s |
| AI assistant (chatgpt.com) | 22 | **72.7%** | 51 s |
| Organic search (Google 21, Bing 1) | 21 | n/a | n/a |

### Search Console (via GA4)
| | Impressions | Clicks | CTR | Avg position |
|---|---|---|---|---|
| Queries (130) | 745 | 1 | 0.13% | 53.8 |
| Landing pages (40) | 1,107 | 6 | 0.54% | 39.1 |

- Pages are visible but rank on pages 4 to 6 of Google. Click-through is low because of position, not because of titles or snippets.
- **/services/ui-ux-design is the only page-1 page:** position 6.4, 39 impressions, 3 clicks, 7.7% CTR. Keep it; do not merge it as audit S-01 proposed.
- **Title churn:** the homepage had 4 titles between Nov 5 and Nov 19 (confirmed in git and in GA4), and trucking-logistics had 2. **Titles are frozen for 6 to 8 weeks from deployment** (see §6).

---

## 2. Changes made (final)

| # | Issue | Fix | Files | URLs |
|---|---|---|---|---|
| 1 | **Australia missing from the market hreflang cluster.** /markets/au only had a self `hreflang="en"`. Root cause: no AU entry in `content/markets-data.cjs`. | All six market pages now carry the same six reciprocal tags: en-us, en-gb, en-ae, en-ca, en-au, x-default. The generator adds AU when the data lacks it. | `kriva-market-{us,uk,uae,ca,au}.html`, `kriva-markets-index.html`, `shared/seo.js` | /markets, /markets/us, /uk, /uae, /ca, /au |
| 2 | **No mobile LCP on all 9 solution-template pages.** Two causes: (a) the hero lede and CTAs faded in from `opacity:0`; (b) a smooth scroll of the section-chip strip on load stopped Chrome's LCP reporting. | (a) The hero copy now animates with transform only, so it is visible from the first frame; the H1 rise is unchanged. (b) On a top-of-page load the same 2px chip nudge happens instantly instead of smoothly. Deep links and later section changes behave exactly as before. | `shared/solutions-x.css`, `shared/solutions-x.js`; `?v=sx3` in 9 HTML files | /solutions and 8 solution pages (trucking-logistics, freight-broker-software, fleet-management-software, saas, accounting-integrations, car-transportation, trucking-company-websites, moving-company-websites) |
| 3 | **Bots and our own crawls counted in GA4 and Clarity** | Nothing is sent to GA4 or Clarity from automated browsers (`navigator.webdriver`, HeadlessChrome, Lighthouse/PageSpeed, WebPageTest, GTmetrix, Pingdom, Google/Bing crawlers). `?ga_debug=1` still overrides for QA. | `apply_chrome.cjs` (source of truth), the GA/Clarity block in all 69 pages, `shared/analytics.js` | All pages |
| 4 | **Office traffic** | `?kriva_internal=1` marks a browser as internal (nothing sent); `?kriva_internal=0` undoes it. The parameter is then removed from the address bar (other parameters and the #anchor are kept), so a copied link can't opt visitors out. | Same as row 3 | All pages |
| 5 | **Duplicate lead event** | Removed `contact_form_submit`. A lead now sends `generate_lead` + `form_submit`. | `shared/analytics.js` | All forms |
| 6 | **Stale duplicate generators** | Deleted `apply_clarity.cjs` (would have removed the live privacy guard if run) and `apply_ga.cjs` (duplicate GA block). `apply_chrome.cjs` is the only source. | 2 files deleted | n/a |
| 7 | **Decorative label inside the H1** (audit S-04) | Label text moved to `data-label` and drawn with CSS `content: attr()`. Looks identical. | `kriva-service-product-design.html`, `shared/services-x-pd.css` (`?v=pd2`) | /services/product-design |
| 8 | **Meta descriptions over 160 characters** (audit S-08) | Trimmed to 145–158 characters, with no facts changed. **No titles changed.** | 5 HTML files | /, /process, /services/web-development, /pricing, /solutions/moving-company-websites |
| 9 | Sitemap freshness | `lastmod` set to 2026-11-19 for the 12 URLs whose search-facing content changed | `sitemap.xml` | 12 URLs above |
| 10 | Team checklist | Lead events, the internal-browser link, bot filtering, data-centre segment, and a test note for marked browsers | `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md` | n/a |

### Code-review findings fixed in the second pass
The review of all 69 pages and the shared files found three side effects in the first pass's own code. All three are fixed:
1. Skipping the first-frame chip scroll entirely stopped mobile deep links (for example `#faq`) from bringing their chip into view. Deep links now run the original code unchanged.
2. Skipping that scroll also left the chip strip 2px from the page gutter. A top-of-page load now makes the same 2px nudge, instantly instead of smoothly; it is pixel-identical to HEAD.
3. A copied `?kriva_internal=1` URL could have opted other visitors out. The parameter is now removed from the address bar after it is read.

---

## 3. Test results (final run on the finished code)

| Check | Result |
|---|---|
| **Diff review**, all 69 HTML pages | Every changed line matches the intended set; **0 unexpected lines**. 49 pages: tracking block only. 6 market pages: plus hreflang. 5 pages: plus description. 9 solution pages: plus cache version. 1 page: plus H1 label. |
| Tracking block consistency | All 69 pages carry exactly the block in `apply_chrome.cjs`; the inline scripts parse |
| **Build**: `npm run build:home-css` | Bundle rebuilt byte-identical to HEAD (restored to the committed bytes afterwards, so it is not in the diff) |
| **SEO head**, 68 routes vs HEAD | **0 titles changed**; 5 descriptions changed as intended; canonical, robots, lang, schema graph, areaServed, og:locale and H1 count unchanged; only H1 text change is the product-design label |
| Hreflang | All 6 market pages carry an identical, reciprocal 6-tag set |
| **Mobile and desktop performance**: LCP on 68 routes × 2 viewports | **136 of 136** page loads record LCP (median 168 ms, max 288 ms locally). Before: 9 pages recorded none on mobile. |
| Solution pages, repeated runs | 27 of 27 mobile runs record LCP (9 pages × 3) |
| Deep links (#faq, 4 pages × 3 runs) | Active chip in view and LCP behavior identical to HEAD (see OI-3) |
| **Tracking** (local build served as https://krivatechnologies.com; requests captured, nothing sent to Google) | Automated browser: 0 GA4, 0 Clarity. Normal visitor: page_view + Clarity. Marked internal: nothing across pages, and the parameter is stripped. Unmarking restores tracking. Other parameters and #anchors are kept. `ga_debug=1` override works. Lead: `generate_lead` + `form_submit` (HEAD also sent `contact_form_submit`). |
| **Forms**: `_qa_all_forms.cjs` (stubbed, no email sent) | 66 forms on 68 routes, **0 failures** |
| Links: `_crawl_links.js` | 68 files, 119 hrefs, **0 missing** |
| HTTP: `_http_smoke.js` | 69 routes, **0 failures**; 404 status correct |
| Routes: `_qa_all_routes.cjs`, 68 routes × 3 viewports | No console errors, failed requests, overflow or missing alt text. 5 pre-existing tap-target notes (OI-1). |
| **Design**: pixel comparison against HEAD, 68 routes × mobile and desktop, settled state | **134 of 136 identical**; the other 2 also differ between two captures of HEAD itself (carousel and timer noise), and /technologies is identical on repeat |
| Visual, in motion | Product-design label unchanged; trucking hero at 350 ms shows the lede and CTAs (previously invisible), with the H1 rise unchanged |
| `_qa_journey.cjs` | Not runnable: stale selector from before the 17 Nov redesign (OI-2). Its GA coverage was replaced by the tracking tests above. |

---

## 4. After approval (owner; none of this has been done)

1. Commit and deploy.
2. Search Console: resubmit `sitemap.xml`; URL Inspection → Request indexing for /markets/au and /solutions/trucking-logistics.
3. GA4 Admin: keep only `generate_lead` as a key event, and turn off Enhanced measurement → Form interactions (checklist §1).
4. Open `https://krivatechnologies.com/?kriva_internal=1` on every team browser and phone (checklist §2c).
5. Read user counts with a comparison that excludes Ashburn, Council Bluffs and Groningen.
6. Optional: `node ping-indexnow.cjs` for Bing.
7. Note: running `generate-sitemap.cjs` after the commit would set every page's lastmod to the commit date, because the tracking block touched every page. The hand-set dates are already correct, so don't regenerate.

---

## 5. Remaining issues

| Priority | Issue | Status |
|---|---|---|
| **High (UK, EEA)** | No consent for GA4 and Clarity. Clarity session recording needs consent under the ICO guidance, and GA4 is unlikely to qualify for the new statistics exception. | **Recommendation written; waiting for approval.** See `uk-consent-recommendation-2026-11-19.md` (recommended: a lightweight first-party banner for UK, EEA and Switzerland only). |
| High | Full Search Console data: only the top rows of 130 queries and 40 pages were visible, and there is no country split | Needs an export: Performance → Search results → Queries, Pages and Countries, last 3 months |
| Low | OI-1: market-page "See the full process →" link is 21px tall on mobile | Documented; not changed |
| Low | OI-2: `_qa_journey.cjs` stale selector | Documented; not changed |
| Low | OI-3: deep-link LCP on mobile solution pages | Documented; same as HEAD |
| Medium | /careers is a top-5 landing page with no open roles (audit S-09 suggests noindex) | Check its traffic source first |
| Low | Schema graph differences on the freight-broker and fleet pages (S-07); competitor links without `nofollow` (S-06); responsive images (P-02) | Unchanged |
| Low | nodemailer 6.x advisories (from the 18 Nov cleanup) | Unchanged |

---

## 6. SEO strategy for the next 6 to 8 weeks (titles frozen)

**Rule:** no changes to titles, H1s or URLs on existing pages until 6 to 8 weeks after deployment. First review at week 6, using Search Console data per page and country. Changes only where a page has impressions but a click-through rate well below its position's norm.

Average position 39 to 54 is an **authority and depth** problem; the technical base is sound. Work in this order:

### a. Authority (all markets, start now)
1. Create or claim a LinkedIn company page, Clutch and GoodFirms profiles, and a Google Business Profile, then add them to the Organization `sameAs` (the copy is ready in `docs/BUSINESS-PROFILES-KIT.md`).
2. Ask the real US website clients whose sites are live for a 2–3 sentence testimonial and a "Website by KRIVA" footer credit link. These are relevant, real US logistics backlinks. Confirm each client's permission before naming them; elite-one.us is currently offline (audit C-02).
3. Apply for partner or app listings where KRIVA genuinely qualifies (Intuit/QuickBooks and Xero app partner directories) to earn links from authoritative, on-topic domains.
4. Publish named authors with short bios on the articles (audit S-02), which supports E-E-A-T and AI-assistant citations.

### b. Content quality on pages that already earn impressions
1. Protect /services/ui-ux-design (position 6.4): add contextual links to it from /services/product-design, /solutions/saas and /insights/saas-onboarding-patterns. Body links only; no title change.
2. Strengthen the money pages with proof and depth, not new titles: add the cost-range link to /insights/dispatch-software-cost on /solutions/trucking-logistics, and add testimonials when they arrive.

### c. Target-market relevance (one guide per market, linked to its /markets page)
| Market | Guide (working title) | Links to |
|---|---|---|
| USA | QuickBooks for trucking companies: what to sync and what to keep manual | /solutions/accounting-integrations, /markets/us |
| USA | IFTA mileage records: what dispatch software should capture | /markets/us, /solutions/trucking-logistics |
| UK | Making Tax Digital and your SaaS: what a Xero sync must do | /markets/uk, QuickBooks/Xero guide |
| Canada | GST/HST/QST in carrier invoicing, and cross-border eManifest basics | /markets/ca |
| Australia | Chain of Responsibility records in dispatch software | /markets/au |
| UAE | Fleet and last-mile software for UAE operators: Arabic/English UI and VAT invoicing | /markets/uae |

Check demand in Search Console or a keyword tool before writing; this review had no volume data. Each guide needs real, specific detail; avoid templated country swaps.

### d. AI assistants (best-engaged channel at 73%)
Keep `llms.txt` and `llms-full.txt` current with each new guide, and keep answer-style FAQ blocks on the money pages.

### e. Measurement (weeks 4 and 8 after deploy)
- GA4, with data-centre cities excluded: organic sessions by country, and `generate_lead`.
- Search Console: impressions and average position for /markets/* and /solutions/*, and for the new guides once indexed.

---

## 7. Exact files changed (uncommitted)

**Modified, 79 files (580 insertions, 307 deletions):**
- **69 HTML pages:** all `kriva-*.html` files plus `404.html` (tracking block). Of these, 20 also carry the hreflang, description, cache-version or H1-label changes in §2.
- **Shared code:** `shared/analytics.js`, `shared/seo.js`, `shared/solutions-x.css`, `shared/solutions-x.js`, `shared/services-x-pd.css`.
- **Generator:** `apply_chrome.cjs`.
- **Other:** `sitemap.xml`, `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md`.

**Deleted, 2 files:** `apply_clarity.cjs`, `apply_ga.cjs`.

**New, 3 files** (Markdown; `.vercelignore` excludes `*.md`, so they never deploy):
- `.website-project/research/analytics-seo-review-2026-11-19.md`
- `.website-project/research/open-issues-2026-11-19.md`
- `.website-project/strategy/uk-consent-recommendation-2026-11-19.md`
