# KRIVA: Traffic Growth Audit & Implementation, 2026-11-05

Branch: `seo/traffic-audit-2026-11` (not merged, not deployed).

---

## 0. What this audit could and could not see

| Source | Status | Notes |
|---|---|---|
| Website codebase | ✅ Full access | All 58 sitemap routes, generators, vercel.json, analytics code |
| Live production site | ✅ Crawled | Every sitemap URL, redirects, headers, schema, GA hits, mobile performance |
| **Google Analytics 4** | ❌ **Not accessed** | No Chrome browser connection was available to this session. **No GA4 numbers appear in this report.** |
| **Google Search Console** | ❌ **Not accessed** | Same reason. **No GSC clicks, impressions, queries, or index-coverage figures appear in this report.** |
| PageSpeed Insights API | ❌ Daily quota exhausted | Replaced with a local throttled-mobile Chrome measurement (method in §3.4) |
| Web search (competitors) | ✅ Partial | Non-Google engine; good for who ranks, **not** for search volume or keyword difficulty |

Sections 1 and 2 of the brief (GA4 and GSC deep dives, 3/6/12-month trends) **cannot be completed without account access**. §6 lists the exact exports to pull so the analysis can be finished.

**Note on history length:** the site's first commit is **2026-08-10**. There is at most about 12 weeks of data. A 6- or 12-month comparison is not possible, and any "trend" over that period is mostly Google's normal ramp-up for a new domain.

---

## A. Overall website health

**Short version: the site is technically clean. Traffic is not growing because the domain is about 12 weeks old, has no off-site authority, and has very little search-demand-led content. Code was not the bottleneck.**

Verified on production, 2026-11-05:

| Check | Result |
|---|---|
| Sitemap URLs returning 200 | 58 / 58 |
| Self-referencing canonical | 58 / 58 |
| `index, follow` and no X-Robots-Tag block | 58 / 58 |
| Exactly one H1 | 58 / 58 |
| Valid JSON-LD (parses) | 58 / 58 |
| Internal links resolving | 94 unique hrefs, 0 missing |
| Images without alt | 0 |
| og:image present | 58 / 58 |
| Trailing slash and legacy `.html` URLs | 308 to the clean URL ✅ |
| `http://` and `www.` | 308 to the apex domain ✅ (`http://www` takes 2 hops, see Pending) |
| Unknown URL | Real 404 status ✅ |
| robots.txt | Allows everything except `/api/`; sitemap declared ✅ |
| GA4 `page_view` on every page | ✅ Verified across a 4-page navigation, with cache on and off |
| Mobile CLS | 0.000 on all pages tested |

### Main reasons traffic is not growing (evidence-based, ranked)

1. **New domain with no off-site footprint.** A web search for `"KRIVA Technologies"` returns only *other* companies (Krivi, Kriverra, Kriv). No directory, review, social, or press profile of KRIVA surfaces. Google has almost no external signal that the business exists, so even well-built pages start at near-zero authority. This is the single largest factor, and it cannot be fixed in code.
2. **Competitive SERPs dominated by established vendors.** For core commercial terms such as "custom trucking dispatch CRM software development", "custom auto transport software", and "QuickBooks Xero integration services", the results are RexSoft, Mind Studios, SolGuruz, DreamzTech, Matellio, Idealogic, Attract Group, MetaDesign, Satva Solutions, Xero's own directory, and Upwork/Fiverr listings. These sites have years of content and links.
3. **Little search-demand-led content.** There are 7 articles, and only 1 targets a commercial-investigation query in the core niche (`/insights/trucking-dispatch-crm-guide`). Competitors win long-tail traffic with **cost**, **feature-list**, and **build-vs-buy** guides; KRIVA has none of these.
4. **Thin, templated regional pages** (fixed in this branch). `/markets/us`, `/uk`, `/ca`, and `/au` had 247–325 words, and CA vs AU was **91% identical** in main content: a doorway-page pattern Google tends to filter out.
5. **Case-study titles with no searchable terms** (fixed in this branch). Titles like "CRMPulse · sales dashboard · KRIVA" lead with a brand name nobody searches for.
6. **Broad service sprawl.** There are 19 service pages, several low-demand or off-niche (logo design, graphic design, and branding "for logistics") with 750–950 words each. They dilute topical focus without capturing meaningful demand. *Not changed. This is a positioning decision for you; see Pending.*

---

## B. Google Analytics findings

**Not available: GA4 was not accessed.** What *was* verified from the outside:

- **Tag:** a single GA4 property `G-FHG12KTF8C` on all 58 pages. There is no duplicate tag and no second property.
- **page_view:** fires once per page on direct load and on in-site navigation, with gtag.js served from cache and with cache disabled. I first suspected cached navigations were losing page views; a controlled CDP trace showed that was a measurement artifact of my first probe, not a site bug. **No change made.**
- **Internal traffic:** localhost and `*.vercel.app` previews are excluded in code. GPC opt-out is honoured.
- **Lead events:** `generate_lead` is deduplicated per page, form, and type per session. It fires only on successful submission, not on CTA click or form open (code review of `shared/analytics.js`).
- **Microsoft Clarity** is also installed (`yjj9g3gojt`). It is a good source for session recordings on high-exit pages once GA4 shows which those are.

Things to check inside GA4, since I couldn't see them:

1. Admin → Events: is **only** `generate_lead` marked as a key event? (`contact_form_submit` and `form_submit` fire at the same moment and would double-count.)
2. Admin → Data streams → Enhanced measurement: if **Form interactions** is ON, GA4's automatic `form_submit` will collide with the site's own `form_submit`. Turn the automatic one off.
3. Admin → Data filters: is an internal-traffic filter active for your office IP?
4. I did **not** submit a live test lead. It would send a real inquiry email and a real conversion to GA4. Do one controlled test via Realtime (steps in `MEASUREMENT_BASELINE.md`, Step 1A).

---

## C. Search Console findings

**Not available: GSC was not accessed.** Indexing *pre-conditions* are all green (see §A). Note that `googlea62b91d40c65d7c7.html` (a GSC verification file) was only added on **2026-10-30**. If that is when the property was verified, the Performance report holds about a week of data, and that alone explains thin numbers.

What to pull (see §6 for the checklist): Pages report (indexed vs "Crawled/Discovered – currently not indexed"), Sitemaps status, Performance by query and by page (last 3 months, all available), Core Web Vitals (likely "not enough data" at this volume).

My expectation, to be **confirmed in GSC rather than assumed**: a share of the 58 URLs, most likely the market pages, small case studies, and low-demand service pages, will sit in *Discovered/Crawled – currently not indexed*. On a new, low-authority domain that is a quality/priority signal, not a technical error. The fix is better content and links, not code.

---

## D. Website SEO improvements: issue list & status

| # | Priority | Issue | Status |
|---|---|---|---|
| 1 | High | CA and AU market pages 91% duplicate; US, UK, CA, AU only 247–325 words | ✅ Fixed: country-specific content added |
| 2 | High | 8 case-study titles had no searchable keyword | ✅ Fixed: titles, og:title, and twitter:title rewritten |
| 3 | Medium | About page omitted Australia and didn't link Canada (orphan-ish market pages) | ✅ Fixed |
| 4 | Medium | Sitemap `lastmod` not reflecting changed pages | ✅ Updated for 13 URLs |
| 5 | Medium | Generators (`build_markets.cjs`, `content/cases-data.cjs`, `build_priority*.cjs`) are **out of sync** with the live HTML (AU market and UAE extras missing from data; case titles differ). Re-running them would silently revert shipped work, including this branch. | ⚠️ Flagged, not changed. Treat the HTML as source of truth, or re-sync the data before running any generator |
| 6 | Medium | `/insights/choosing-a-digital-agency` is 348 words and off-niche | Pending: rewrite or fold into a buyer guide (roadmap) |
| 7 | Medium | Market-page card grid renders single-column at desktop (1238px-wide text lines) | Pre-existing design, also on live UAE. Left as is per the "no design changes" rule. Optional: 2 columns ≥1024px |
| 8 | Low | `http://www.` → `https://www.` → apex is 2 redirect hops | Vercel domain setting, not code (Pending) |
| 9 | Low | TBT about 730–770ms on `/work` and `/solutions/car-transportation` under 4× CPU throttle | Acceptable; revisit only if GSC CWV flags INP |
| 10 | Strategic | No off-site presence | Pending: requires you (roadmap) |
| 11 | Strategic | No cost or build-vs-buy content | Pending: roadmap |

Checked and **no issue found**: canonicals, robots, indexability directives, redirects, 404 handling, broken links, H1 count, schema validity, alt text, OG tags, font loading (1 preloaded Figtree woff2, CLS 0), mobile overflow, tap targets, image filenames.

---

## E. Modified files & URLs

| File | URL | Change | Why | Validation |
|---|---|---|---|---|
| `kriva-market-us.html` | /markets/us | +"Operating conditions" block: ELD/HOS dispatch, IFTA, broker/factoring flow, QBO sync; "Who this is for" | Thin page (325 words), templated | 779 words; similarity to other markets 0.23–0.36 |
| `kriva-market-uk.html` | /markets/uk | Same pattern: MTD for VAT and Xero, UK GDPR admin, activation metrics, O-licence and drivers' hours | Thin (267 words) | 712 words |
| `kriva-market-ca.html` | /markets/ca | Same pattern: provincial GST/HST/QST, cross-border eManifest, Canadian ELD, French/English UI | 91% duplicate of AU | 692 words; CA↔AU 0.91 → 0.53 |
| `kriva-market-au.html` | /markets/au | Same pattern: HVNL and Chain of Responsibility, fatigue/EWD, Xero and BAS, WA/NT regimes | 91% duplicate of CA | 685 words |
| `kriva-case-*.html` (8 files) | /work/* | `<title>`, og:title, and twitter:title now lead with the searchable topic, e.g. "Trucking Dispatch CRM Case Study: ShiftRail \| KRIVA" | Brand-name-first titles match no queries | All 50–57 characters; H1 and body unchanged |
| `kriva-about.html` | /about | Added `/markets/ca` and `/markets/au` links in two sentences | AU missing from About; CA unlinked | Link crawl: 0 missing |
| `sitemap.xml` | n/a | `lastmod` → 2026-11-05 for the 13 changed URLs | Accurate recrawl hint | 58 URLs, valid |
| `SEO-TRAFFIC-AUDIT-2026-11.md` | n/a | This report | n/a | n/a |

**Content safety:** the new market copy uses the exact markup and classes already live on `/markets/uae`, so no CSS changed. It makes no claims of local offices, clients, or metrics. Every block carries the line *"we do not give legal or tax advice"*. Regulatory references (FMCSA ELD, IFTA, MTD for VAT, UK O-licence, Canadian ELD mandate, ACE eManifest, provincial sales taxes, HVNL/CoR, WA/NT exclusion, BAS) were written to be accurate at a general level. **Please have someone with domain knowledge read the four blocks before merging.**

**QA run on this branch:** `_qa_all_routes.cjs` covered 58 routes × 3 viewports (1440, 820, 390): **0 pages with issues** (status, console errors, failed requests, Figtree loaded, horizontal overflow, tap targets, alt text). `_crawl_links.js`: 58 HTML files, 94 hrefs, **0 missing**. I visually checked the new CA section at desktop and mobile.

---

## F. Pending issues

**Need account access (me or you):**
- Every GA4 and GSC number (exports listed in §6).
- GSC: resubmit `sitemap.xml` after deploy; request indexing for the 4 market pages and 8 case studies.
- GA4: the key-event and enhanced-measurement checks in §B.

**Need your decision or approval:**
- **Merge and deploy** this branch (not done).
- **Service-page sprawl:** keep, consolidate, or `noindex` the low-demand design pages (logo, graphic, branding)? I recommend keeping them but reducing their nav and footer prominence, not deleting them. That needs GSC data first.
- **Positioning overlap:** Satva Solutions ranks for "QuickBooks Xero integration services". If that is a related business, decide which site owns accounting-integration queries so the two don't compete.
- Vercel: point `www` directly at the apex with a single redirect (domain settings).

**Requires off-site work (cannot be done in code):** see the 30-day plan.

---

## G. Keyword opportunities

> **Volumes and difficulty are not measured.** No keyword tool was available. Priority is a judgement from business fit, intent, and what currently ranks. Validate in GSC (queries with impressions) or a keyword tool before committing writing time.

| Target keyword | Intent | URL (existing / proposed) | Suggested title | Work needed | Priority | Why |
|---|---|---|---|---|---|---|
| trucking dispatch software development cost | Commercial investigation | **New:** /insights/trucking-dispatch-software-cost | How Much Does Custom Dispatch Software Cost? (2026) | Real cost bands from your own projects, phases, build vs buy | **P1** | Competitors rank with vendor cost pages; buyers search this right before contacting vendors |
| custom dispatch CRM for trucking | Commercial | /services/crm-development | (keep) | Add pricing and engagement-model section; link from cost guide | P1 | Core money page |
| auto transport broker CRM | Commercial | /solutions/car-transportation | Custom Auto Transport CRM & Quote-to-POD Software | Add "CRM vs Super Dispatch-type tools" section | P1 | Niche SERP with few specialists (Attract Group, Idealogic) |
| QuickBooks Online API integration for SaaS | Commercial | /solutions/accounting-integrations | (keep) | Add "what the integration covers" checklist and timeline | P2 | See positioning note in §F |
| build vs buy TMS | Informational → commercial | **New:** /insights/build-vs-buy-tms | Build vs Buy a TMS: When Custom Software Pays Off | Decision framework, honest "buy" cases | P2 | Captures earlier-stage buyers |
| IFTA reporting software / automate IFTA | Informational | **New article** linked to /markets/us | Automating IFTA Mileage Records: What to Build | Practical guide | P3 | Supports the US page topically |
| Chain of Responsibility software | Informational | **New article** linked to /markets/au | CoR Records in Dispatch Software: A Practical Guide | Practical guide | P3 | Only if AU is a real target market |
| SaaS onboarding examples | Informational | /insights/saas-onboarding-patterns | (keep) | Add annotated examples | P3 | Existing asset with 1,306 words |

**Cannibalization watch:** "trucking dispatch CRM" is targeted by `/services/crm-development`, `/solutions/trucking-logistics`, `/insights/trucking-dispatch-crm-guide`, `/work/shiftrail-dispatch`, and `/markets/us`. Titles are currently differentiated (service / solution / guide / case / region). Confirm in GSC → Performance → Query → Pages that Google isn't rotating URLs for the same query. If it is, make `/services/crm-development` the target and point the others at it.

---

## 30/60/90-day plan

**Baseline first:** record the §6 numbers on deploy day. All targets below are relative to that baseline. No traffic figure is promised.

**Days 1–30**
- Deploy this branch; resubmit sitemap; request indexing for the 12 changed URLs.
- Pull the §6 exports and finish sections B and C with real data.
- **Off-site footprint** (the biggest lever): Google Business Profile, Clutch, GoodFirms, LinkedIn company page, Crunchbase, Xero App Partner / Intuit directory listings if eligible. Every profile should use an identical name, address, and URL, and link to the site.
- Fix the GA4 admin items in §B; run one controlled test lead.
- KPI: share of the 58 URLs indexed (GSC Pages); branded query `kriva technologies` appearing in GSC.

**Days 31–60**
- Publish the P1 cost guide, built from your real project ranges. Do not use vendor averages from the web.
- Strengthen `/services/crm-development` and `/solutions/car-transportation` per the table.
- Rewrite or merge `choosing-a-digital-agency` into a buyer's guide.
- Re-sync generator data files with live HTML (issue D5) so future builds don't revert work.
- KPI: impressions on non-branded queries; queries in positions 5–20 (from GSC).

**Days 61–90**
- Publish 2 P2/P3 articles; add internal links from the market pages.
- Use GSC queries with impressions and CTR below 1% to rewrite titles and descriptions on those specific pages.
- Use Clarity recordings on the top-3 GA4 landing pages by exits.
- Decide on service-page consolidation using real data.
- KPI: non-branded clicks; `generate_lead` count; lead rate per organic landing page.

---

## 6. Exports needed to finish sections B and C

**GSC** (Search results, max date range, compare to previous period where it exists):
Queries tab (CSV), Pages tab (CSV), Pages → Indexing report (all "Why pages aren't indexed" reasons with example URLs), Sitemaps status, Core Web Vitals (mobile and desktop).

**GA4:**
Reports → Acquisition → Traffic acquisition (session default channel group, by week); Engagement → Landing page (sessions, engagement rate, avg engagement time, key events); Admin → Events list (and which are key events); Admin → Data streams → Enhanced measurement toggles.

With these, the remaining analysis (CTR opportunities, positions 5–20, declining pages, engagement problems, conversion paths) can be done against real numbers.
