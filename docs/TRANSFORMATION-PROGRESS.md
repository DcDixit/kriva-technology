# KRIVA site transformation — progress log

Canonical handoff for phased repositioning (trucking-first product studio). **Do not git-commit from agent runs unless the user asks.**

Last updated: **Remaining master-prompt pass** (2026-10-28). See `docs/EXECUTION-REPORT.md`. Baseline commit: `b6803f4`.

---

## Master prompt gap matrix (Phases 1–20)

| Phase | Focus | Status | Notes |
|-------|--------|--------|-------|
| **1** | Site audit, baseline IA/SEO | **Done** | Prior session; do not redo |
| **2** | IA, homepage console, crawl map, chrome | **Partial → improved** | `docs/COMPETITOR-INSIGHTS.md` — Motive, Samsara, Truckbase, Hashrocket, Railsware, Zoho patterns |
| **3** | Positioning, nav, hreflang, trucking CRO | **Done** | See Phase 3 section below |
| **4** | Homepage 11-section journey | **Partial → improved** | Proof credibility note; master hero CTAs; markets/workflow prior |
| **5–7** | Internal pages (beyond home + trucking) | **Partial → improved** | Solution + CRM/API/mobile heroes; `seo-meta.cjs` batch; 19 service URLs still de-template backlog |
| **8** | Design system consistency | **Partial → improved** | Token backgrounds trucking/saas/inner/home |
| **9** | Work / case studies | **Partial → improved** | Work index trucking-first; ShiftRail context block; rep-work disclaimers |
| **10** | Visual assets | **Partial** | Client PNG logos **blocked** |
| **11** | Interactions / reduced motion | **Verified** | `prefers-reduced-motion` + work card hover/reduce |
| **12** | CRO (contact, services, forms) | **Partial → improved** | Master CTAs on heroes; all solution `pageInquiry` forms |
| **13** | Technical SEO | **Partial → improved** | Heading skips cleared (wireframing, HealthTrack); meta extended |
| **14** | GEO (llms.txt, Organization, FAQ) | **Partial → improved** | `llms-full.txt` positioning; contact schema prior |
| **15** | GA4 / GSC | **Partial** | `docs/ANALYTICS-GSC-CHECKLIST.md`; no live validation |
| **16–19** | 30/60/90 roadmap | **Done (doc)** | `docs/GROWTH-ROADMAP-30-60-90.md` |
| **20** | Full page QA | **Partial** | `qa:links` 0 missing; `seo:audit` 2 HIGH (home perf) |

**Cross-cutting backlog**

| Item | Status |
|------|--------|
| Car transport published product case | **Blocked** — `[TBD]` per addendum; adjacent proof only |
| Service consolidation (19 pages) | **Not started** (index links improved) |
| SEO/marketing vs agency positioning | **Partial** — nav demoted + meta + page foot copy |
| Performance / CSS bundling (homepage) | **Not started** — seo:audit HIGH unchanged |
| `#wfPlay` + workflow panels | **Done** this pass |
| Decorative testimonial avatars | **Done** — `aria-hidden` on decorative SVGs |
| `apply_ga.cjs` vs `apply_chrome.cjs` | **Done** — synced GA block + warning header |
| Insights EEAT bylines | **Done** — fictional team names → Dixit Panchal |
| Hreflang GSC validation | **Blocked** — needs live Search Console |
| SMTP / form backend | **Out of scope** |

---

## Phase 1–3 — completed (preserve)

See git history / prior sections in this file. Highlights:

- Trucking-first mega menu; markets hreflang cluster in `shared/seo.js`
- Homepage + trucking solution CRO; GA4 single config via `apply_chrome.cjs`
- `npm run qa:links` → 0 missing (57 HTML)

---

## Remaining master-prompt pass — 2026-10-28

See `docs/EXECUTION-REPORT.md` and `docs/ANALYTICS-GSC-CHECKLIST.md`. Verification: `qa:links` → **0 missing** (57 HTML); `seo:audit` → **2 HIGH** (homepage image weight + render-blocking CSS), **0 heading-skip** on wireframing/HealthTrack.

---

## Gap-fix pass — 2026-10-28 (prior session)

### Implemented

| Area | Change |
|------|--------|
| **Homepage** | `#markets` section (4 regional links); `#wfPlay` control; `shared/home.js` panel selector `.wf-panel`; testimonial avatars `aria-hidden` |
| **Contact** | Pillar internal links; JSON-LD `ContactPage` + `FAQPage` |
| **ShiftRail case** | Hero metrics / illustrative UI disclaimer |
| **Services index** | Pillar link row + styles |
| **Accounting solution** | Related solutions nav + `acc-rel` CSS |
| **SEO meta** | `kriva-contact`, car-transport, accounting, seo-digital-marketing descriptions in `content/seo-meta.cjs` |
| **Insights (7)** | Byline → Dixit Panchal (EEAT) |
| **Analytics** | `apply_ga.cjs` aligned with `apply_chrome.cjs` GA IIFE (GPC, `.vercel.app`, opt-out) |
| **Docs** | `docs/COMPETITOR-INSIGHTS.md`, `docs/GROWTH-ROADMAP-30-60-90.md`, this matrix |

### Files touched (representative)

`kriva-redesign.html`, `shared/home.js`, `shared/home-art.css`, `shared/home-next.css`, `kriva-contact.html`, `kriva-case-fleetflow.html`, `kriva-services-index.html`, `kriva-solution-accounting.html`, `shared/accounting.css`, `content/seo-meta.cjs`, `apply_ga.cjs`, all `kriva-insight-*.html` (7), `docs/COMPETITOR-INSIGHTS.md`, `docs/GROWTH-ROADMAP-30-60-90.md`, `docs/TRANSFORMATION-PROGRESS.md`

### Verification (run after pull)

```bash
node seo/apply_meta.cjs
npm run qa:links
npm run seo:audit
```

---

## Recommended next sprints (priority)

1. **Production GA4 + GSC baselines** → fill roadmap KPI table; validate hreflang cluster.
2. **Service page batch (5–7 URLs/week)** — unique hero + one proof link each; avoid template duplication.
3. **Performance** — homepage CSS merge / critical path (seo:audit HIGH: image weight + render-blocking CSS).
4. **Phase 20 QA** — scripted responsive + manual CRO walkthrough on contact → trucking → ShiftRail.
5. **Competitor doc** — primary-source fetch for Hashrocket, Railsware, Motive, Truckbase.
6. **Car transport** — only publish case study when client approves; until then keep honest TBD block.

---

## Commands (maintenance)

```bash
node apply_chrome.cjs
node apply_seo.cjs
node seo/apply_meta.cjs
npm run qa:links
npm run seo:audit
```

**Note:** Prefer `node apply_chrome.cjs` over `node apply_ga.cjs` unless patching GA block only; see warning in `apply_ga.cjs`.
