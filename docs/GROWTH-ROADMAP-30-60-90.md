# Growth roadmap — 30 / 60 / 90 days

**Baseline data:** Not invented here. Traffic, queries, and conversion rates must come from **GA4** (`G-FHG12KTF8C`) and **Google Search Console** after production/staging validation. Until baselines are exported, treat targets as **process goals**, not numeric guarantees.

**Last updated:** 2026-10-28 (gap-fix pass)

---

## Preconditions (week 0)

| Task | Owner | Done when |
|------|--------|-----------|
| GA4 Realtime + key events (`fit_call_click`, `brief_click`, form submits) on production | Marketing / dev | Events visible in GA4 DebugView / Realtime |
| GSC property verified; sitemap submitted | Marketing | Coverage report shows 57 URLs indexed trend |
| Hreflang cluster validated in GSC (markets) | SEO | No “return tags” errors on `/markets/*` |
| Export baseline: 28-day sessions, top landing pages, top queries, contact form completions | Marketing | CSV saved; dates noted in this doc |

---

## Days 1–30 — Measurement + money pages

**Goals**

- Confirm analytics and Search Console baselines (no strategy without numbers).
- Improve **qualified** inbound on trucking + contact paths (quality over volume).

**Work**

| Priority | Action | Success signal (non-numeric until baseline) |
|----------|--------|---------------------------------------------|
| P0 | Production GA4 + Clarity smoke test | Single `gtag('config')` per page; events fire once |
| P0 | GSC: submit sitemap; inspect `/`, `/solutions/trucking-logistics`, `/contact` | Indexing requested; no new crawl errors |
| P1 | Monitor contact `#book` vs `#brief` completion in GA4 | Funnel steps defined in exploration |
| P1 | Internal links: trucking pillar ↔ CRM service ↔ ShiftRail ↔ dispatch guide | Crawl depth ≤3 clicks from home (manual check) |
| P2 | Car transport proof section: honest TBD + adjacent cases only | No fabricated auto-transport metrics |

**Blocked without data:** ROAS, rank targets, “+X% leads” claims.

---

## Days 31–60 — Content authority + CRO

**Goals**

- Strengthen **topical authority** for US dispatch CRM and finance integrations.
- Reduce template feel on remaining service pages (batch by family).

**Work**

| Priority | Action | Success signal |
|----------|--------|----------------|
| P1 | Publish 1–2 insights updates OR expand trucking guide sections (only verified facts) | Time-on-page / scroll depth vs baseline |
| P1 | Service consolidation pass: index groupings + duplicate body links (19 URLs) | Lower duplicate title/meta warnings in audit |
| P2 | Case study depth: non-ShiftRail pages labeled illustrative where needed | Legal/brand review sign-off |
| P2 | Performance: homepage CSS bundling / LCP hero (seo:audit HIGH items) | CWV field data trend in GSC |
| P3 | Competitor doc refresh (primary sources for missing vendors) | `docs/COMPETITOR-INSIGHTS.md` complete |

---

## Days 61–90 — Scale what worked

**Goals**

- Double down on channels and pages that **already** convert in GA4 (not guessed).
- Expand market pages only where GSC shows impression growth.

**Work**

| Priority | Action | Success signal |
|----------|--------|----------------|
| P0 | Review 60-day GA4: top 5 landing pages by `generate_lead` or form event | Reallocate copy/CRO to winners |
| P1 | GSC query report: trucking + “dispatch CRM” + “QuickBooks integration” clusters | New supporting FAQs or internal links only where gaps are real |
| P1 | Optional: IndexNow on material URL changes | Faster recrawl of changed money pages |
| P2 | Full Phase 20 page QA checklist (57 pages) | `npm run qa:links` + responsive + manual spot checks logged |
| P3 | GEO: refresh `llms.txt` / Organization schema when IA changes | AI citation spot-check (manual) |

---

## KPIs to define after baseline export

Replace `[TBD]` once GA4/GSC CSVs exist:

| Metric | 30-day target | 60-day target | 90-day target |
|--------|---------------|---------------|---------------|
| Organic sessions (site) | [TBD] | [TBD] | [TBD] |
| Contact form + fit call events | [TBD] | [TBD] | [TBD] |
| US trucking landing engagement | [TBD] | [TBD] | [TBD] |
| Indexed pages (GSC) | [TBD] | [TBD] | [TBD] |
| Homepage LCP (field) | [TBD] | [TBD] | [TBD] |

---

## Commands (recurring)

```bash
npm run qa:links
npm run seo:audit
node seo/apply_meta.cjs
node apply_seo.cjs
```

Optional GSC API (not wired in repo): `seo/gsc_analyze.cjs` — requires credentials.
