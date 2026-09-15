# SEO + GEO Audit & Remediation — September 2026

Scope: all 57 indexable pages, `robots.txt`, `sitemap.xml`, `feed.xml`, `llms.txt`,
`vercel.json` routing/headers, static asset payload, and GA4 instrumentation.

Re-runnable tooling added:

```
npm run seo:audit       # 60+ checks across every page + crawl artefacts
npm run seo:linkgraph   # contextual (non-boilerplate) internal link graph
npm run seo:images      # re-encode oversized rasters to WebP + rewrite refs
```

Audit result: **181 issues (54 high-severity) → 34 issues (0 high-severity)**.

---

## 1. Issues found

### Blocking / high severity

| # | Issue | Scope | Why it mattered |
|---|---|---|---|
| 1 | `href="shared/slot-assets.css"` was **path-relative**, so on nested clean URLs it resolved to `/services/shared/slot-assets.css` and returned **404 in production** | 24 pages, incl. every service & solution page | That stylesheet hides the placeholder "slot" boxes once a real image is present. Without it the pages rendered placeholder chrome over real content, hurting layout stability and perceived quality on the site's main commercial pages. |
| 2 | Every static asset served `Cache-Control: public, max-age=0, must-revalidate` | Site-wide (no `headers` block in `vercel.json`) | Fonts, CSS and images were revalidated on **every** page view and every repeat visit. Direct LCP/FCP penalty, worst on mobile. |
| 3 | 1.8 MB PNG referenced on the homepage (`problems/exceptions.png`), plus 13 further oversized rasters; **zero** `srcset`/`<picture>` usage | Homepage + solution/work pages | 3.4 MB of referenced image payload. Primary mobile Core Web Vitals failure. |
| 4 | **hreflang cluster was non-reciprocal.** The four `/markets/*` pages declared `x-default → /`, but `/` declared a self-only cluster. | 5 market pages + 52 others | Google discards an entire hreflang cluster when members disagree, so **none** of the US/UK/UAE/CA geo-targeting was being counted. |
| 5 | `"@type": "CaseStudy"` — not a schema.org type | 8 case-study pages | An unrecognised type makes the whole node unparseable; those pages published no usable entity data. |
| 6 | `geo.region = IN-GJ` (Ahmedabad) on market pages targeting the US/UK/UAE/CA | 4 market pages | Page-level geo signal directly contradicted the page's own targeting. |
| 7 | Market pages had only **1–2 contextual inbound links** each (everything else was nav boilerplate) | `/markets/*` | The pages carrying geographic relevance received almost no internal authority. |
| 8 | ~9.6 MB of unreferenced binaries shipped in the deploy | `media/`, `brand/`, `shared/` | Deploy bloat; 9 unused font files and 7 dead JS files. |

### Medium / low severity

- Duplicate `og:image` / `twitter:card` / `twitter:image` block on the homepage (injector ran twice).
- Two titles over the SERP pixel budget (`/services/api-integrations` 64 chars, `/technologies` 64 chars).
- `foundingDate: "2025"` — not an ISO date; business node missing `priceRange`.
- `BlogPosting` nodes had no `wordCount`, `articleSection`, or `keywords`.
- `robots.txt` used a non-standard `LLMs:` directive (crawlers reject unknown keys) and had the RSS feed commented out.
- `sitemap.xml` `lastmod` values were stale and hand-maintained.

### Checked and found healthy (no change made)

Canonicals (57/57 self-referential), indexability (0 accidental `noindex`), 404 handling
(correct 404 status + `noindex`), www→apex 308 redirect, `.html`→clean-URL redirects with no
chains, broken internal links (0), orphan pages (0), duplicate titles/descriptions/H1s (0),
missing `alt` (0), missing `width`/`height` (0), GA4 coverage (58/58 pages, single
measurement ID, consent mode configured), Brotli compression (active), content depth
(median ~1,050 words; no thin pages), `llms.txt` / `llms-full.txt` (present and well-formed).

---

## 2. Fixes implemented

**Rendering / crawl**
1. Rewrote all path-relative asset references to root-relative across 24 pages — the production 404 is gone.
2. Added a `headers` block to `vercel.json`: fonts `max-age=31536000, immutable`; images 30 days + SWR; CSS/JS 1 day + 7-day SWR; crawl artefacts 1 hour. HTML intentionally left on `must-revalidate`. Added `X-Content-Type-Options` and `Referrer-Policy`.

**Core Web Vitals**
3. Re-encoded 14 referenced rasters to WebP: **3,478 KB → 675 KB (−81%)**. Homepage hero 147→61 KB; the 1,795 KB PNG → 52 KB. All references and the LCP `preload` hint updated.
4. Set `fetchpriority="high"` and removed any `loading="lazy"` on each page's LCP image; lazy-loaded everything below the second in-content image (56 pages).
5. Excluded 66 unreferenced files (~9.6 MB) from the deploy via a regenerated, auto-maintained `.vercelignore` block.

**GEO**
6. Rebuilt the hreflang cluster as five reciprocal members (`en-US`, `en-GB`, `en-AE`, `en-CA`, `x-default → /markets`), with every member emitting an identical block; removed the contradictory self-only `x-default` from the other 52 pages.
7. Set per-market `geo.region`, `geo.placename`, `target`, and `coverage` on the four market pages.
8. Added 11 contextual inbound links to `/markets/*` from existing body copy on high-authority pages (homepage, `/about`, `/process`, `/faq`, `/careers`, `/solutions/saas`, `/solutions/accounting-integrations`, and two insight posts). No new copy, no layout change.

**Structured data / on-page**
9. Retyped the 8 `CaseStudy` nodes to `CreativeWork` + `genre: "Case study"` (valid, and unlike `Article` needs no publish date the pages don't actually have).
10. `foundingDate` → ISO; added `priceRange` to the business node on all 57 pages.
11. Added `wordCount`, `articleSection`, and page-derived `keywords` to all 7 `BlogPosting` nodes.
12. Removed the duplicate OG/Twitter block; shortened the two over-long titles to 45 and 50 chars.

**Crawl artefacts**
13. `robots.txt`: removed the invalid `LLMs:` directive (kept as a comment), added `feed.xml` as a second `Sitemap:`.
14. Regenerated `sitemap.xml` (57 URLs, fresh `lastmod`) and `feed.xml` (7 items).

**Verification**
- All 57 JSON-LD blocks parse; no unknown schema types remain.
- HTML integrity check across all pages: balanced tags, no nested anchors.
- Browser check on 5 representative pages: all stylesheets load with rules, `slot-assets.css` resolves, no placeholder boxes, no layout breaks.

---

## 3. Remaining issues

| Priority | Issue | Note |
|---|---|---|
| Medium | **No telephone number anywhere on the site** (no `tel:` link, no `telephone` in schema) | Incomplete `ProfessionalService` node and a trust gap for US/UK B2B buyers. Needs a real number — not something to invent. |
| Medium | **Every article and case study shares one generic OG image** (`og-default.png`) | No distinct thumbnails in social/AI surfaces. Needs 15 per-page OG images. |
| Medium | **Case studies have no publish/modified dates** | Blocks upgrading them from `CreativeWork` to `Article`, and Google can't assess freshness. |
| Medium | **`/markets/uae` is the weakest page in the system** — ~605 words, 2 contextual inbound links, and UAE is mentioned in body copy on only one other page | Genuine content gap, not a markup problem. |
| Low | 6–9 stylesheets per page (19–32 KB Brotli) | Acceptable over HTTP/2 + Brotli; bundling needs a build step and risks cascade-order regressions. Left alone deliberately. |
| Low | Decorative product mockups use `<h4>` inside `role="img"` containers | Pollutes the heading outline on 2 pages. Retagging risks breaking CSS selectors for a minor gain. |
| Low | `BlogPosting.author` is the Organization, not a `Person` | Weaker E-E-A-T. Needs real author identities. |
| Unverifiable from code | **Search Console verification** — no verification meta tag in the HTML | May be verified by DNS or file; confirm in GSC. Also confirm both `https://krivatechnologies.com` and the Domain property are registered. |

---

## 4. Expected SEO/GEO impact

Ranked by confidence:

1. **Highest confidence — GEO targeting starts counting at all.** The hreflang cluster was invalid, so Google was discarding it. With a reciprocal cluster plus per-market geo meta and 11 new internal links, the `/markets/*` pages can finally accumulate and express geographic relevance. This is the most likely single cause of decline in US/UK/UAE/CA impressions and the highest-leverage fix.
2. **High confidence — mobile Core Web Vitals.** An 81% cut in image payload plus real caching addresses both LCP and repeat-visit performance. CWV is a ranking signal and a heavy influence on bounce/active-user metrics.
3. **High confidence — 24 commercial pages now render as designed.** The stylesheet 404 affected every service and solution page. Fixing it removes a page-experience drag on the highest-intent pages.
4. **Moderate — structured data.** 8 case-study pages go from publishing nothing parseable to valid entity data; richer article markup improves eligibility and AI-search extraction.
5. **Moderate — AI/GEO visibility.** `llms.txt` was already strong. Valid schema, reciprocal hreflang, and the RSS feed in `robots.txt` improve machine-readability for AI crawlers.

Realistic timing: technical/CWV fixes typically surface in 2–4 weeks after recrawl; hreflang and internal-linking effects in 4–10 weeks.

**Important caveat:** this audit is code-side only. I had no access to Search Console or GA4 data,
so I could not confirm *which* queries, pages, or countries actually declined, whether there was a
manual action or a core-update coincidence, or whether the decline predates these defects.
Pull the GSC export into `seo/gsc/data/` and run `node seo/gsc_analyze.cjs` to confirm the diagnosis
against real data before assuming these fixes address the whole drop.

---

## 5. Milestones to track (30 / 60 / 90 days)

Baseline these on the deploy date. Compare against the same-length prior period.

### 30 days — did the technical fixes land?
| Metric | Where | Target |
|---|---|---|
| Pages with "Good" CWV, mobile | GSC → Core Web Vitals | 0 → ≥90% of URLs |
| Mobile LCP, homepage + 3 top service pages | PageSpeed Insights (field data) | < 2.5 s |
| Crawl requests / avg. response time | GSC → Crawl stats | Response time down; no rise in 404s |
| Valid `hreflang` entries | GSC → International Targeting | 5 market URLs reported, 0 "no return tag" errors |
| Unparseable structured data | GSC → Enhancements + Rich Results Test | 0 errors on all 57 URLs |
| Indexed pages | GSC → Pages | ≥57, none "Crawled – currently not indexed" |

### 60 days — is visibility recovering?
| Metric | Where | Target |
|---|---|---|
| Total impressions | GSC | Back to pre-decline baseline |
| Impressions, US + UK + UAE + CA | GSC → Countries | +20–30% vs. 30-day mark |
| Impressions for the 4 `/markets/*` URLs | GSC → Pages | Measurably non-zero and trending up |
| Avg. position, top 20 commercial queries | GSC → Queries | +2–4 positions |
| Queries ranking 11–20 ("striking distance") | GSC | Growing — these convert to page-1 next |
| Mobile bounce / engagement rate | GA4 | Engagement rate up vs. pre-fix |

### 90 days — is it qualified traffic?
| Metric | Where | Target |
|---|---|---|
| Organic clicks | GSC | Back to baseline and trending up |
| Organic active users | GA4 | Recovering in line with clicks |
| `generate_lead` events from organic | GA4 (mark as Key event) | Up vs. baseline — the metric that actually matters |
| Non-brand organic clicks | GSC (filter out "kriva") | Growing share of total |
| Pages with ≥1 impression | GSC | Approaching 57 |
| AI-search referrals | GA4 referral sources (chatgpt.com, perplexity.ai, etc.) | Non-zero and trending |

### Recommended immediately after deploy
1. Submit `sitemap.xml` in GSC and use **URL Inspection → Request indexing** on the 4 market pages and the homepage.
2. Run `node ping-indexnow.cjs` to notify Bing/Yandex.
3. Confirm the GSC property is verified and that **both** the domain property and the `https://` prefix property exist.
4. In GA4 Admin, mark `generate_lead` as a **Key event** — otherwise conversions are not recorded.
5. Re-run `npm run seo:audit` before every deploy to prevent regressions.
