# International SEO audit and fixes, 2026-11-23

**Question asked:** why is there no organic traffic from the US, UK and Germany, and why does GA4 show India as the top country?

**Branch:** `migrate/old-template` (local commit; the live site is `main` at e52f35f until this branch is merged and deployed).

**Sources used:** the codebase, the live site over HTTP, the two GA4 screenshots supplied (Home cards, last 7 days: 33 active users, India 24, US 5, Germany 1, UK 1), the 19 Nov GA4/Search Console review, and the 18 Nov full-site audit. Google Search Console and GA4 themselves were not accessible from this session, so every GSC figure below is from the 19 Nov review (the Search Console reports that GA4 links to).

---

## 1. Why there is "no traffic" from the target markets

Ranked by how much each one explains the numbers you are looking at.

| # | Cause | Evidence | Type |
|---|---|---|---|
| 1 | **The India number is not Indian search traffic; it is the team.** | The 19 Nov review traced India to Ahmedabad (26 of 29 India users) plus the 18 Nov audit crawl. Nothing on the site targets India: no India page, no INR, no `+91`; the only India mentions are the honest "studio is in Ahmedabad" lines. | Measurement |
| 2 | **Since 22 Nov, GA4 only counts visitors who click Accept.** | The global consent banner (e52f35f, live) loads GA4 and Clarity only after Accept. Visitors who ignore or reject the banner are invisible. US, UK and German visits are being under-counted from the moment it went live, and the "last 7 days" window straddles that change. | Measurement |
| 3 | **The domain is about 3.5 months old with almost no authority, so pages sit on Google pages 4–6.** | First commit 2026-08-10. Search Console (via GA4, 28 days to 18 Nov): 1,107 impressions, 6 clicks, average position 39. 130 queries, 745 impressions, 1 click, average position 54. A web search for "KRIVA Technologies" returned other companies. This is the structural reason there are only about 10–13 genuine target-market visitors a month, and no code change alters it quickly. | Strategic |
| 4 | **Germany did not exist on the site.** | Zero mentions of Germany or DACH anywhere; no `/markets/de`; `target`/`coverage` meta, hreflang cluster, footer, markets hub, About, `llms.txt` and the Organization schema all listed five countries (US, UK, UAE, CA, AU). Google had nothing to rank for any German-intent query. | Targeting gap |
| 5 | **The only page-1 URL was merged away on 22 Nov.** | `/services/ui-ux-design` was the single page ranking on page 1 (position 6.4, 39 impressions, 3 clicks in 28 days). Commit e52f35f 301/308-redirects it to `/services/product-design` and removed it from the sitemap; the page's own canonical now points at product-design. The content was moved, so the redirect should carry most of the ranking, but expect a dip for 2–6 weeks. | Watch item |
| 6 | **Title churn.** The homepage title changed four times between 5 and 19 Nov (GA4 shows both "Custom Trucking, Sa…" at 0 views and "Trucking, Moving an…" at 119). Each change resets how Google evaluates the page. | Strategic |
| 7 | No structured-data signal for where the business serves. The Organization node carried only the Ahmedabad address. | Minor |
| 8 | Site-wide copy still said "four/five markets" and several pages omitted Australia from their country lists (stale since the AU page was added). | Minor |

**What was checked and found clean:** canonicals (self-referencing on all 67 live URLs), `robots.txt` (allows everything except `/api/`, sitemap declared), `index,follow` on every page, sitemap (67 URLs, all 200), 308 redirects for `www.`/`.html`/trailing-slash variants, `<html lang="en">`, hreflang on the market cluster (reciprocal, `x-default` to `/markets`), one H1 per page, JSON-LD parses, no `X-Robots-Tag`, HSTS and security headers, hosting (Vercel edge, served from the nearest region to the visitor; the `bom1` edge you may see is because you are in India, not a geo signal to Google), GSC verification (meta tag on `/` plus the HTML file), IndexNow key file present, `llms.txt` linked from every page.

---

## 2. Fixes implemented (this commit)

### A. Measurement: make GA4 reflect the target markets
- **India time zone excluded from GA4 and Clarity.** Browsers whose clock is Asia/Kolkata send nothing. This removes the office and any Indian visitors from reports, in line with "do not target Indian traffic". `?ga_debug=1` overrides it for testing; `?kriva_internal=1` still works. Set in the head snippet (`apply_chrome.cjs` JS_TAG, applied to all 70 pages); documented in `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md` §2d. To reverse: delete the `Intl.DateTimeFormat` line from JS_TAG and re-apply.
- The consent banner itself was **not** changed (see Limitations).

### B. Germany added as a sixth market
- **New page `/markets/de`** (`kriva-market-de.html`, 1,000+ words, same template as the UK page): dispatch and fleet software, B2B SaaS, e-invoicing (XRechnung/ZUGFeRD, EN 16931, receiving mandatory since Jan 2025, issuing phased from 2027), GoBD records and DATEV-ready exports, DSGVO features in the admin panel, EU driving/rest times (Reg. 561/2006) and tachograph data, Lkw-Maut, CET overlap. Same legal disclaimer as the UK page ("we do not give legal or tax advice"). No invented clients, quotes or figures; proof links go to the existing PayrollPro (UK and EU payroll) case and the build-vs-buy TMS guide.
- Title "Custom Logistics & SaaS Software for German Teams | KRIVA" (57 chars), description 155 chars, canonical, `geo.region=DE`, `og:locale:alternate=de_DE`, own OG image (`brand/og/markets-de.png`), BreadcrumbList, page inquiry form (`service: Market: Germany`).
- **hreflang cluster** now 7 tags (`en-us, en-gb, en-de, en-ae, en-ca, en-au, x-default`) on all six market pages and the hub.
- **Markets hub** `/markets`: Germany card (third, after UK), "six markets" copy, title/description/OG updated.
- **Site-wide:** footer "Markets" list, `target`/`coverage` meta on 64 pages, six-market switcher on the five existing market pages (CSS grid widened to 6 columns, `markets-x.css?v=mx2`), About (6 sentences), Careers, FAQ, Industries, Insights, Solutions and Technologies country lists (Australia added where it was missing too), `llms.txt` and `llms-full.txt` (Germany and the missing Australia entry), `sitemap.xml` (68 URLs; `lastmod` bumped on the 8 changed URLs), `vercel.json` rewrite + legacy redirect, generator data (`content/markets-data.cjs`, `shared/site.js`, `shared/seo.js`, `shared/schema.js`, `_build_markets_x.cjs`) and QA route lists.

### C. Structured data
- `Organization.areaServed` (United States, United Kingdom, Germany, UAE, Canada, Australia as `Country` nodes) added to the JSON-LD on all 70 pages. The honest Ahmedabad address stays.

### D. Verification run
- `_qa_consent_chrome.cjs`: 70/70 pages, regeneration 70/70, 6/6 build scripts.
- `_crawl_links.js`: 69 pages, 119 hrefs, 0 missing.
- `validate.py` on the touched pages: pass, except two pre-existing items (sample-data percentages on the hub; duplicate `mobChips` id on Careers) that this work did not touch.
- Local preview (Puppeteer, 1440 and 390): `/markets/de`, `/markets`, `/markets/uk` — HTTP 200, no console errors, no horizontal overflow, six-column switcher in one row at desktop, clocks render, footer link and `en-de` present. Screenshots reviewed.
- Diff reviewed page by page: every page changed only by the GA line, the two geo metas, `areaServed` and the footer link, plus the specific content edits listed above.

---

## 3. Not changed, and why

| Item | Reason |
|---|---|
| `/services/ui-ux-design` redirect | Deliberate restructure in e52f35f with the content moved into product-design. Reverting it now would create duplicate content and a second URL change in a week. **Watch** `/services/product-design` in Search Console for the queries ui-ux-design held; if impressions have not transferred by ~20 Dec, restore the page (the HTML file is still in the repo) with a self canonical and remove the redirect. |
| Consent banner scope | You approved "keep the global banner" on 22 Nov. Changing who sees it is a legal decision for your reviewer; see Limitations. |
| Homepage title, H1s, URLs | Frozen until the 6–8 week review (titles changed four times in November). |
| A German-language version of `/markets/de` | Needs a native reviewer. An English page will rank for English-language queries from Germany; it will not rank for "Speditionssoftware entwickeln lassen". |

---

## 4. Remaining limitations and what only you can do

1. **The consent banner will keep under-counting US and UK visitors.** Options for your legal reviewer: (a) show the banner only to UK/EEA/CH visitors and auto-grant analytics elsewhere (the 19 Nov recommendation), or (b) keep it global and accept that GA4 is a sample. Until one is chosen, read trends, not totals, and treat Search Console as the source of truth for search visibility.
2. **Search Console (15 minutes, after deploy):** Sitemaps → resubmit `sitemap.xml`; URL Inspection → Request indexing for `/markets/de`, `/markets`, `/about`; Pages report → note anything "Crawled – currently not indexed"; Performance → filter Country = Germany / United Kingdom / United States and export Queries and Pages (save to `seo/gsc/data/` per `seo/gsc-baseline-workflow.txt`). Note: the old "International targeting" report no longer exists in GSC; a `.com` domain with hreflang is the correct setup and nothing else needs setting there.
3. **GA4 admin:** Admin → Data filters → activate an Internal Traffic filter for the office IP as a second guard; keep only `generate_lead` as a key event; in Reports, compare countries with a date range starting the day this deploys.
4. **Authority is the real ceiling.** Nothing in this commit changes the fact that the domain has no external links. The 19 Nov plan still stands: LinkedIn company page, Clutch and GoodFirms profiles, Google Business Profile (copy in `docs/BUSINESS-PROFILES-KIT.md`), "Website by KRIVA" credits from real US clients, QuickBooks and Xero partner listings. For Germany specifically: a German-language page and one guide per market (e.g. "XRechnung and ZUGFeRD: what your invoicing module must export") once Search Console shows which German queries bring impressions.
5. **Generator drift (for whoever maintains the repo):** running `node apply_chrome.cjs` now rewrites every page's header labels ("Product and UI/UX design" → "Product design") and moves two stylesheet links, because the generator was not updated with the 22 Nov HTML edits. This commit applied the footer and GA changes directly to the HTML instead. Sync `headerHtml` in `apply_chrome.cjs` with the committed HTML before using it again.
6. `/careers` remains indexed with no open roles and is a top-5 landing page (18 Nov S-09); decide whether to `noindex` it.

---

## 5. Files changed

85 files: 70 HTML pages (one new), `sitemap.xml`, `vercel.json`, `llms.txt`, `llms-full.txt`, `shared/markets-x.css`, `shared/site.js`, `shared/seo.js`, `shared/schema.js`, `content/markets-data.cjs`, `apply_chrome.cjs`, `_build_markets_x.cjs`, `_crawl_links.js`, `_shots_mkt.cjs`, `brand/og/markets-de.png`, `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md`, this report.
