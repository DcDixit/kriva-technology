# International SEO audit and fixes, 2026-11-23 (final review 2026-11-24)

**Question asked:** why is there no organic traffic from the US, UK and Germany, and why does GA4 show India as the top country? Then: a final, production-readiness review of everything changed.

**Branch:** `migrate/old-template` (local commits; the live site is `main` at e52f35f until this branch is merged and deployed). **Not pushed, not merged, not deployed.**

**Sources used:** the codebase, the live site over HTTP, the GA4 screenshots supplied (Home cards, last 7 days: 33 active users, India 24, US 5, Germany 1, UK 1), the 19 Nov GA4/Search Console review, the 18 Nov full-site audit. Search Console, GA4 and backlink tools were not accessible from this session; every GSC figure is from the 19 Nov review.

---

## 1. Why there is "no traffic" from the target markets

Ranked by how much each one explains the numbers.

| # | Cause | Evidence | Type |
|---|---|---|---|
| 1 | **The India number is not Indian search traffic; it is the team.** | 19 Nov review: 26 of 29 India users were Ahmedabad, the rest the 18 Nov audit crawl. Nothing on the site targets India. | Measurement |
| 2 | **Since 22 Nov, GA4 only counts visitors who click Accept.** | The global consent banner (e52f35f, live) loads GA4 and Clarity only after Accept. US, UK and German visitors who ignore or reject it are invisible. The "last 7 days" window straddles that change. | Measurement |
| 3 | **Domain age and authority, not technical SEO.** | First commit 2026-08-10. Search Console (28 days to 18 Nov): 1,107 impressions, 6 clicks, average position 39; queries: 130, 745 impressions, 1 click, position 54. No external links found for "KRIVA Technologies". Expect roughly 10–13 genuine target-market visitors a month at this stage. | Strategic |
| 4 | **Germany did not exist on the site.** | Zero mentions of Germany/DACH; no `/markets/de`; `target`/`coverage` meta, hreflang, footer, hub, About, `llms.txt`, Organization schema all listed five countries. | Targeting gap |
| 5 | **The only page-1 URL was merged on 22 Nov** and the receiving page did not say "UI/UX". | `/services/ui-ux-design` (position 6.4, 39 impressions, 3 clicks / 28 days) now 308s to `/services/product-design`, whose title, description and H1 did not contain "UI/UX", so the redirected queries had nothing to match. | Rankings |
| 6 | **Title churn.** Homepage title changed four times between 5 and 19 Nov. | Strategic |
| 7 | Organization schema carried only the Ahmedabad address, no `areaServed`. | Minor |
| 8 | Stale "four/five markets" copy; Australia missing from several country lists and from `llms.txt`. | Minor |

**Checked and clean (static audit script over all 68 routes, 0 problems / 0 warnings):** self-referencing canonicals, `og:url` = canonical, `index,follow` on every page, exactly one H1 per page, valid JSON-LD on every page, `<html lang="en">`, unique titles and descriptions (titles ≤ 65, descriptions 70–160), every internal link resolves to a route or a redirect, every sitemap URL has a rewrite and a file, identical reciprocal 7-tag hreflang cluster on all 7 market URLs with `x-default` → `/markets`, `robots.txt` (allow all except `/api/`, sitemap declared, AI crawlers allowed), 308 single-hop redirects for `www.`, legacy `.html` and the merged URL, security headers, GSC verification (meta + file), IndexNow key present, `llms.txt` linked from every page. Hosting is Vercel edge; the `bom1` edge you may see is because you browse from India and is not a geo signal to Google.

---

## 2. What changed (two commits on this branch)

### A. Germany as a sixth market
- **New `/markets/de`** (`kriva-market-de.html`, 1,650 words, FAQ included). Built on the UK template's layout, but with Germany-specific content: dispatch and fleet software for Speditionen, B2B SaaS for the Mittelstand, e-invoicing (XRechnung/ZUGFeRD, EN 16931, receiving mandatory since Jan 2025, issuing phased from 2027), GoBD records and DATEV-ready exports, DSGVO features in the admin panel with an EU hosting region, EU driving/rest times (Reg. 561/2006) and tachograph data, Lkw-Maut, CET overlap, and a six-question FAQ (English working language, DATEV, XRechnung, hosting, no German office, improving an existing TMS) emitted as `FAQPage` schema. Same legal disclaimer as the UK page. No invented clients, quotes or figures.
- **Search intent and keywords:** title "Logistics & SaaS Software Development for German Teams | KRIVA" (62 chars), description 155 chars. Body uses the phrases English-speaking German buyers actually search: "software development" ×11, "custom software" ×4, "dispatch software" ×5, "TMS" ×12, DATEV ×19, XRechnung ×12, ZUGFeRD ×10, Germany/German ×66, plus Spedition, Mittelstand, DSGVO, CET.
- **Not a copy of the UK page:** word-trigram overlap DE↔UK is 0.28, the same range as the existing UK↔CA (0.25) and US↔CA (0.24) pairs; the only shared copy is the site-wide "How a project starts", form and CTA blocks. (Before the final pass it was 0.40.)
- Own OG image, BreadcrumbList + FAQPage schema, `geo.region=DE`, `og:locale:alternate=de_DE`, inquiry form (`service: Market: Germany`).
- **hreflang cluster:** `en-us, en-gb, en-de, en-ae, en-ca, en-au, x-default` on all six market pages and the hub; identical on all seven URLs.
- **Everywhere else:** footer Markets list (70 pages), `target`/`coverage` meta (64 pages), six-market switcher on the five existing market pages (grid widened to 6 columns; `markets-x.css?v=mx2`), hub card (third, after UK) and "six markets" copy, About (6 sentences), Careers, FAQ, Industries, Insights, Solutions, Technologies country lists (Australia added where it was missing), `llms.txt` and `llms-full.txt` (Germany + the missing Australia entry), sitemap (68 URLs, `lastmod` bumped on changed URLs), `vercel.json` rewrite + legacy redirect, generator data (`content/markets-data.cjs`, `shared/site.js`, `shared/seo.js`, `shared/schema.js`, `_build_markets_x.cjs`) and QA route lists.

### B. Structured data
- `Organization.areaServed` (US, UK, Germany, UAE, Canada, Australia as `Country` nodes) on all 70 pages; the honest Ahmedabad address stays. Added to `shared/schema.js` so a regeneration keeps it.

### C. UI/UX ranking consolidation (final pass)
- `/services/product-design` now carries "Product & UI/UX Design for Logistics Software & SaaS | KRIVA" as title/og/twitter title (60 chars) and "Product and UI/UX design for logistics software and B2B SaaS: …" as description, so the redirected UI/UX queries and any inbound links have a matching target. The 308 redirect (and the legacy `.html` redirect) are single-hop, which preserves link equity. No page, sitemap, feed or llms file still references the old URL; the orphan HTML file canonicalises to product-design. Sitemap `lastmod` bumped.

### D. Hub title
- `/markets` title shortened from 68 to 57 chars: "Markets · US, UK, Germany, UAE, Canada & Australia | KRIVA".

### E. Analytics: reverted the time-zone exclusion (final pass)
- The first commit excluded browsers in the India time zone from GA4 and Clarity. On review that would drop legitimate visitors, so it is **removed from all 70 pages and from `apply_chrome.cjs`**. Raw data stays complete; the office is still removed by `?kriva_internal=1`, GPC and the bot filter. The team checklist §2d now describes GA4 **comparisons**, saved **segments** and **audiences** for the US, UK and Germany, and the Search Console country filter.

---

## 3. Verification (all on the final tree)

| Check | Result |
|---|---|
| Static international audit (canonicals, hreflang reciprocity, sitemap↔routes, metadata lengths, duplicates, dead links, JSON-LD, robots) | 68 pages, **0 problems, 0 warnings** |
| Diff classification vs the pre-change commit (every changed line matched against the intended edit set) | All lines outside the standard set are in the nine prose-edit files, the new page and the sitemap; **no unintended change on any other page** |
| `validate.py` (all pages) | 20 failures — **identical to the pre-change commit** (sample-data percentages, duplicate `mobChips` id, contact h1→h3, two article date mismatches); none introduced |
| `_qa_consent_chrome.cjs` | 70/70 pages, regeneration 70/70, 6/6 build scripts |
| `_crawl_links.js` | 69 pages, 119 hrefs, 0 missing |
| `_verify_critical.cjs` | all assets present, contact endpoint wired |
| `_seo_audit.cjs` | only the pre-existing LOW notes (stylesheet count, competitor links without `rel`, contact heading skip) |
| `_qa_all_routes.cjs` (68 routes × 3 viewports) | see §3a |
| Puppeteer check of `/markets/de`, `/markets`, `/markets/uk` at 1440 and 390 | HTTP 200, no console or page errors, no failed requests, no horizontal overflow, six-column switcher in one row at desktop, clocks render, FAQ accordion works; screenshots reviewed |
| Lighthouse mobile, `/markets/de` (local, simulated throttling) | Performance 86, Accessibility 96, Best practices 100, SEO 100; LCP 3.5 s, CLS 0, TBT 0 ms. The one a11y flag (`link-in-text-block`) is the shared market-template link style (see §3a for the UK baseline) |
| Live spot checks | `/services/ui-ux-design` → 308 → product-design (single hop); `/markets/de` 404 on live until deploy, as expected |

### 3a. Results that finished after the write-up
_See the end of this file._

---

## 4. Honest assessment

**Fixed:** Germany now exists as a properly targeted, non-duplicate, schema-marked market page wired into every signal Google and AI assistants read; the hreflang cluster is complete and reciprocal; `areaServed` tells Google where the business serves; the merged UI/UX page now has a title that can carry the redirected ranking; every stale "four/five markets" and country list is correct; analytics keep complete raw data with a documented way to read the three target markets.

**What this will and will not do:**
- **Weeks 1–2 after deploy:** `/markets/de` gets crawled and indexed (faster if you request indexing). Expect impressions, not clicks, for long-tail English queries with German intent ("dispatch software Germany", "XRechnung integration software", "software development partner Germany"). Realistically 0–20 German impressions/day at first.
- **Weeks 2–6:** `/services/product-design` should pick up the UI/UX queries that `/services/ui-ux-design` held (position ~6); if impressions have not transferred by ~20 Dec, restore the old page with a self canonical and remove the redirect.
- **What will not change from this work:** total organic traffic. Average position 39–54 is an authority problem. The pages are now correct for the three markets; they still need links and depth to rank. Realistic expectation without off-site work: a slow climb from ~10 to perhaps 30–50 genuine target-market visitors a month over the next quarter. With the authority work in §5, materially more.

**Not changed, and why:** consent banner scope (your legal decision; it still under-counts US/UK until it is geo-limited or you accept GA4 as a sample); homepage title/H1s/URLs (frozen until the 6–8-week review); no German-language page (needs a native reviewer); `/careers` still indexed with no roles.

---

## 5. What is still missing to attract US, UK and German organic traffic

1. **Authority (the ceiling).** LinkedIn company page, Clutch, GoodFirms, Google Business Profile (copy ready in `docs/BUSINESS-PROFILES-KIT.md`); "Website by KRIVA" footer credits from the real US website clients; QuickBooks and Xero partner directory listings. For Germany: a listing on a German-language directory (e.g. a DACH IT-Dienstleister directory) and one guest article in a German logistics trade publication would do more than any on-page change.
2. **German-language version of `/markets/de`** (`/de/markets/de` or `/markets/de-de`, `hreflang="de-de"`) once a native reviewer is available. The English page ranks only for English-language queries from Germany.
3. **One guide per market, linked from its market page** (19 Nov plan): US "QuickBooks for trucking companies", UK "Making Tax Digital and your SaaS", Germany "XRechnung and ZUGFeRD: what your invoicing module must export" and "DATEV exports from a custom product". Check Search Console for demand first.
4. **Search Console, after deploy (15 minutes):** resubmit `sitemap.xml`; URL Inspection → Request indexing for `/markets/de`, `/markets`, `/services/product-design`, `/about`; Pages report for "Crawled – currently not indexed"; Performance → Country filter for Germany/UK/US; export Queries and Pages to `seo/gsc/data/`. (The old "International targeting" report no longer exists; a `.com` with hreflang is the correct setup.)
5. **GA4:** create the three country comparisons/segments and audiences now (checklist §2d); activate an Internal Traffic data filter for the office IP; keep only `generate_lead` as a key event.
6. **Consent scope decision** for your legal reviewer: UK/EEA-only banner with auto-granted analytics elsewhere (19 Nov Option A) restores US measurement.
7. **Homepage positioning:** description and FAQ still say "US trucking"; fine for the US, but the UK and Germany get their relevance only from the market pages and footer. Revisit at the title review in January.
8. **Repo hygiene:** `node apply_chrome.cjs` would rewrite header labels and stylesheet order on every page (its `headerHtml` lags the 22 Nov HTML); sync it before any regeneration.

---

## 6. Files changed (vs a8295cb)

86 files: 70 HTML pages (one new), `sitemap.xml`, `vercel.json`, `llms.txt`, `llms-full.txt`, `shared/markets-x.css`, `shared/site.js`, `shared/seo.js`, `shared/schema.js`, `content/markets-data.cjs`, `apply_chrome.cjs`, `_build_markets_x.cjs`, `_crawl_links.js`, `_shots_mkt.cjs`, `brand/og/markets-de.png`, `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md`, this report.

**Merge-ready status:** see the final line of this file.
