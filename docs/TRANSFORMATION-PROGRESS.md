# KRIVA site transformation — progress log

Canonical handoff for phased repositioning (trucking-first product studio). **Do not git-commit from agent runs unless the user asks.**

Last updated: Phase 3 (2026-10-28).

---

## Phase checklist

| Phase | Focus | Status |
|-------|--------|--------|
| **1** | Site audit, baseline IA/SEO review | Done (prior session) |
| **2** | Homepage workflow console, ShiftRail links, insights/services/work fixes, crawl map | Done (prior session) |
| **3** | Business positioning & IA, market hreflang cluster, homepage/trucking CRO, metrics copy hygiene | **Done (this session)** |
| **4+** | Case study depth, service consolidation, CSS performance, GA verification, hreflang Search Console validation, competitor research | Recommended next |

---

## Phase 1 — completed (do not redo)

- Full-site audit captured in project reference materials.
- Baseline issues logged for trucking positioning, metrics honesty, and agency-heavy nav.

---

## Phase 2 — completed (do not redo)

- Homepage `#workflow` interactive console + `shared/home.js` wiring (`kriva-redesign.html`).
- ShiftRail canonical URLs in `content/services-data.cjs`; Vercel redirect for fleetflow unchanged.
- Insights: trucking guide **10 min read**; ledger dedupe on insights index.
- Services index: Acme → Tenant workspace labeling.
- Client logos partial (webp from `media/work/web`; some PNGs still missing).
- `_crawl_links.js` markets `FILE_MAP`; `npm run qa:links` → **0 missing**.
- Work index: honest portfolio labeling.
- `KRIVA-REFERENCE-ADDENDUM.md`: 19 services + ShiftRail slug.

---

## Phase 3 — completed (this session)

### A. Business positioning & IA

- **Trucking-first Services mega menu** (`apply_chrome.cjs` → all chrome pages via `node apply_chrome.cjs`):
  - Primary links: CRM/dispatch, dashboards, product design, APIs, web dev.
  - Agency-fit services (graphic design, logo design, SEO/marketing) demoted to **secondary line** in mega footer + **footer-only** links (URLs unchanged).
- **Industries vs Markets** one-line cross-links:
  - `kriva-industries.html` → points to `/markets`.
  - `kriva-market-{us,uk,uae,ca}.html` → point to `/industries`.
  - `build_markets.cjs` template updated for future rebuilds.
  - Markets hub already had “Markets vs industries” block (unchanged).
- **Meta positioning**: `content/seo-meta.cjs` services index description trucking-first; applied via `node seo/apply_meta.cjs`.

### B. Market hreflang cluster (Phase 4 SEO item, delivered early)

- `shared/seo.js`:
  - Identical cluster on `/markets`, `/markets/us`, `/markets/uk`, `/markets/uae`, `/markets/ca`: `en-us`, `en-gb`, `en-ae`, `en-ca`, `x-default` → `/markets`.
  - Per-market `geo.region`, `geo.placename`, `target`, `coverage` on regional pages; global list elsewhere.
  - Non-market pages: self `hreflang="en"` only (no conflicting `x-default`).
- Regenerated heads: `node apply_seo.cjs` (57 public pages + `llms.txt` / `llms-full.txt`).

### C. Homepage + trucking CRO / copy

- **`kriva-redesign.html`**: US trucking-led hero H1/subhead; dispatch-desk CTAs; `hp-hero-trust` block (process, ShiftRail-only metrics policy, fit call) — no invented stats.
- **`kriva-solution-trucking.html`**: US ICP hero; ShiftRail + dispatch guide links; problem-section internal links; removed duplicate “In the field” proof block; stronger process CTA.
- **`kriva-insights-index.html`**: Removed “metrics from recent client projects” teaser; points to PayrollPro as worked example.
- **Analytics**: Contact CTAs remain `/contact#book` and `/contact#brief` (compatible with `shared/analytics.js` click tracking).

### D. Styles

- `shared/chrome.css`: `.mm-aside` for secondary service links.
- `shared/home-next.css`: `.hp-hero-trust`.

---

## Files touched — Phase 3

| Area | Files |
|------|--------|
| Chrome / nav | `apply_chrome.cjs`, `shared/chrome.css` (+ all pages via apply script) |
| SEO / hreflang | `shared/seo.js`, `apply_seo.cjs` output on 57 HTML files, `llms.txt`, `llms-full.txt` |
| Meta | `content/seo-meta.cjs`, `seo/apply_meta.cjs` run |
| Homepage | `kriva-redesign.html`, `shared/home-next.css` |
| Trucking solution | `kriva-solution-trucking.html` |
| IA copy | `kriva-industries.html`, `kriva-market-us.html`, `kriva-market-uk.html`, `kriva-market-uae.html`, `kriva-market-ca.html`, `build_markets.cjs` |
| Insights | `kriva-insights-index.html` |

---

## Verification (Phase 3)

| Check | Result |
|-------|--------|
| `npm run qa:links` | **0 missing** (57 HTML, 95 hrefs checked) |
| Market hreflang cluster | Present on all 5 market URLs (identical 5-link block) |
| Homepage x-default | Removed (avoids cluster conflict) |

---

## Pending / blocked

- **Client logos**: PNG assets still missing for some brands (webp partial set on homepage).
- **SMTP / form backend**: Not in scope; contact forms unchanged.
- **Hreflang validation**: Implement in HTML; **Search Console / live crawl validation** not run in this phase.
- **Competitor research**: Not started.
- **`kriva-market-us.html` meta**: Still 164 chars in source title/meta map — `apply_meta` skips >160 (pre-existing).

---

## Recommended Phase 4+

1. **Case studies**: Deepen non-ShiftRail work pages or label as illustrative where needed.
2. **Service consolidation**: Reduce duplicate service URLs in body copy / index groupings.
3. **Performance**: Audit critical CSS on homepage + trucking (hero images already webp).
4. **GA4**: Verify `G-FHG12KTF8C` events on staging/production (fit call / brief clicks).
5. **SEO**: Submit hreflang cluster in GSC; confirm canonicals on market pages after deploy.
6. **Competitive positioning**: Research pass for US dispatch CRM SERP.

---

## Commands (maintenance)

```bash
node apply_chrome.cjs
node apply_seo.cjs
node seo/apply_meta.cjs
npm run qa:links
```

Optional legacy geo patch (superseded by `shared/seo.js` for hreflang; geo now in SEO block):

```bash
node _seo_fix_05_geo.cjs
```

---

## Pre-deploy patch (2026-10-28)

**Goal:** Restore GA4 synchronous head init (consent + single `gtag('config')`) and Clarity environment guards after `apply_chrome.cjs` regression; trim US market meta; refresh sitemap `lastmod` for pages already changed in the working tree.

| Area | Change |
|------|--------|
| GA / chrome | `apply_chrome.cjs` `JS_TAG`: inline consent + config (matches git HEAD / `404.html` pattern); defers event wiring to `shared/analytics.js` (no second config there) |
| Clarity | Same file: GPC, `localhost`, `127.0.0.1`, `.vercel.app` guards restored in IIFE |
| Pages | `node apply_chrome.cjs` → 57 `kriva-*.html` refreshed |
| Meta | `content/seo-meta.cjs` + `kriva-market-us.html` description → 140 chars |
| 404 | `404.html` analytics script aligned (no cache-bust query; GA block unchanged) |
| Sitemap | `sitemap.xml` `lastmod` → `2026-10-28` for URLs mapped from modified `kriva-*.html` (+ `/` when shared CSS touched) |

**Verified (repo, not live GA):**

| Check | Result |
|-------|--------|
| `gtag('config'` per `kriva-*.html` | **1** each (57 files) |
| `gtag/js?id=G-FHG12KTF8C` | **1** per page |
| `/shared/analytics.js` | **1** per page |
| Clarity guards | Present on sample (`kriva-about.html`) |
| `npm run qa:links` | **0 missing** |
| `npm run qa:responsive` | **PASS** |
| `npm run seo:audit` | **HIGH: 2** (homepage image weight + render-blocking CSS); unchanged vs pre-patch CWV profile |

**Not done:** Production/staging GA4 Realtime validation; `#wfPlay` / homepage decorative `alt` (skipped as low-risk deferrals).

---

## CRO / copy summary (Phase 3)

- **Nav**: Product/ops services in primary mega; marketing services secondary/footer.
- **Hero (home)**: US carriers/brokers headline; dispatch-desk CTAs; trust strip with honest metrics rule.
- **Trucking solution**: Unique hero vs homepage tabs; ShiftRail proof retained; repetitive proof section removed.
- **IA**: Clear Markets ↔ Industries distinction on hub-adjacent pages.
