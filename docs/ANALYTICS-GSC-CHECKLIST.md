# GA4 + Google Search Console checklist (manual)

**Owner:** KRIVA marketing / site admin. **Agent note:** No live verification was run from the repo—complete these steps in your Google accounts.

---

## Prerequisites

- [ ] GA4 property `G-FHG12KTF8C` exists and you have **Editor** or **Admin** access.
- [ ] Google Search Console property for `https://krivatechnologies.com/` (Domain or URL-prefix) with verified ownership.
- [ ] Production site serves the GA block from `apply_chrome.cjs` / `KRIVA_GA_START` (not duplicated tags).

---

## GA4 baseline (day 0)

1. **Admin → Data streams → Web** — confirm stream URL matches production canonical host.
2. **Realtime** — open homepage in a private window (disable ad blockers); confirm 1 active user within 30s.
3. **Admin → Data settings → Data collection** — note whether Google signals are off (matches repo config: `allow_google_signals: false`).
4. **Explorations → Free form** — last 28 days: `Views`, `Sessions`, `Engaged sessions`, top `Landing page + query string`.
5. **Events** — verify `page_view` fires; if custom events exist in `shared/analytics.js`, trigger one form submit on staging and confirm in **DebugView** (`ga_debug=1` on `.vercel.app` or local with debug flag per `apply_chrome.cjs`).
6. Export CSV or screenshot key metrics → paste into `docs/GROWTH-ROADMAP-30-60-90.md` KPI table (replace `[TBD]`).

---

## GSC baseline (day 0)

1. **Performance → Search results** — last 3 months: total clicks, impressions, average CTR, average position.
2. **Pages** — top 20 URLs by clicks; note trucking/solution/service URLs vs blog/insights.
3. **Indexing → Pages** — count “Indexed” vs “Not indexed”; open sample “Crawled – currently not indexed” if any.
4. **Experience → Core Web Vitals** — mobile + desktop status for homepage and `/solutions/trucking-logistics`.
5. **Sitemaps** — submit `https://krivatechnologies.com/sitemap.xml` if not already; confirm “Success”.
6. **International targeting** — confirm no conflicting country override; validate **hreflang** cluster (`en`, `en-US`, `en-GB`, `en-AE`, `en-CA`, `en-AU`) via URL Inspection on:
   - `/`
   - `/markets/us`
   - `/markets/uk`
7. **Links** — export top external + internal links; compare to pillar URLs (trucking solution, CRM service, ShiftRail case, dispatch CRM insight).

---

## After major deploy (repeat)

- [ ] Realtime smoke test (GA4).
- [ ] URL Inspection on changed money pages (GSC → Request indexing if material copy change).
- [ ] `npm run qa:links` and `npm run seo:audit` in repo (no substitute for GSC, but catches broken canonicals/meta).
- [ ] Compare week-over-week Search Console queries for branded vs non-branded (`kriva`, `dispatch crm`, etc.).

---

## Blocked in repo (document only)

- SMTP / form delivery verification (`GMAIL_USER` typo requires user confirmation before change).
- Search Console API automation (not in project).
- Claiming specific ranking or traffic numbers in copy without exported proof.
