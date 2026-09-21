# Measurement Phase Checkpoint

**Created:** 2026-09-16 
**Phase:** Measurement-only (SEO/content changes intentionally paused) 
**Business funnel:** Google impressions → relevant clicks → qualified visitors → engagement → genuine leads

---

## Purpose

This checkpoint records the exact website state at the start of the **measurement phase**, so it can be identified in Git history and restored if needed.

**Do not make SEO, content, URL, title, H1, schema, canonical, hreflang, or internal-link changes until GSC/GA4 evidence is analyzed.**

---

## Git reference

| Item | Value |
|------|-------|
| **Checkpoint tag** | `measurement-phase-checkpoint` |
| **Parent commit (pre-measurement dedup)** | `4c85304139756e984b80509eac798f497f712914` |
| **Branch** | `main` |
| **Parent commit message** | Update QA results and enhance SEO across multiple HTML files (hreflang, Twitter meta) |

Find exact hash: `git rev-parse measurement-phase-checkpoint`

### Restore to this checkpoint

```bash
git checkout measurement-phase-checkpoint -- shared/analytics.js shared/page-inquiry.js kriva-contact.html MEASUREMENT_BASELINE.md MEASUREMENT_CHECKPOINT.md
```

Or reset branch to checkpoint (destructive, use only if intentional):

```bash
git reset --hard measurement-phase-checkpoint
```

---

## Files changed for measurement (this checkpoint)

| File | Role |
|------|------|
| `shared/analytics.js` | GA4 tracker; `generate_lead` deduplication; CTA/email/phone events |
| `shared/page-inquiry.js` | On-page inquiry forms; FormSubmit return (`?sent=1#inquire`) lead handling |
| `kriva-contact.html` | Fit call + project brief forms; FormSubmit return dedup (`?sent=fit` / `?sent=brief`) |
| `MEASUREMENT_BASELINE.md` | CEO-friendly baseline checklist and GSC/GA4 export instructions |
| `MEASUREMENT_CHECKPOINT.md` | This file, frozen state reference |

**Not changed in measurement phase:** `vercel.json`, `robots.txt`, sitemap URL list, page titles, meta descriptions, H1/H2, body content, schema in HTML, canonical URLs, hreflang (already set in parent commit).

---

## GA4 measurement ID

| Setting | Value |
|---------|-------|
| **Measurement ID** | `G-FHG12KTF8C` |
| **GA4 Property ID** | `552202890` (comment in `shared/analytics.js` only) |
| **Loader** | `gtag/js?id=G-FHG12KTF8C` + `/shared/analytics.js` on every page |
| **Key event (manual, GA4 Admin)** | `generate_lead`, must be marked by site owner |

### Events fired by website code

| Event | Fires on | Counts as lead? |
|-------|----------|-----------------|
| `generate_lead` | Successful form submission only | **Yes** (mark as Key event in Admin) |
| `contact_form_submit` | Same moment as `generate_lead` | No, diagnostic; do **not** mark as Key event |
| `form_start` | First focus in a form field | No |
| `cta_click` | Contact / fit call / brief / `#inquire` link click | No |
| `email_click` | `mailto:` click | No |
| `phone_click` | `tel:` click | No |
| `page_view` | Automatic (gtag config) | No |

---

## `generate_lead` deduplication behavior

**Goal:** One successful submission = exactly one `generate_lead` per form per page per browser session.

### Central guard (`shared/analytics.js`)

On `kriva:lead` custom event:

1. Build key: `kriva_ga_lead_{pathname}|{form_id}|{lead_type}`
2. If key exists in `sessionStorage` → **do not fire** again
3. Else set key in `sessionStorage` and fire `generate_lead` + `contact_form_submit`
4. Fallback if `sessionStorage` blocked: in-memory `window.__KRIVA_LEAD_KEYS__`

### FormSubmit browser-relay return paths

| Form | Return URL | Behavior |
|------|------------|----------|
| Page inquiry | `{page}?sent=1#inquire` | `page-inquiry.js` checks dedup key before dispatching `kriva:lead` |
| Fit call | `/contact?sent=fit#book` | `kriva-contact.html` skips lead if dedup key already set; still shows success UI |
| Project brief | `/contact?sent=brief#brief` | Same as fit call |

### Direct server success (Gmail/Resend/Web3Forms JSON)

- `kriva:lead` fires once after confirmed API success
- FormSubmit hop (`hop.submit()`) returns **before** lead event; lead fires on return URL only

### What does NOT fire `generate_lead`

- Opening a form (`form_start` only)
- Clicking CTA without submitting
- Page views, scroll, engagement events
- Failed validation or failed API response

---

## Technical SEO state (frozen, no further changes until GSC analysis)

| Item | State |
|------|-------|
| **Public indexable URLs** | 57 |
| **sitemap.xml** | `https://krivatechnologies.com/sitemap.xml`, 57 URLs, apex domain, lastmod 2026-09-15 |
| **robots.txt** | `Allow: /`; `Disallow: /api/`; sitemaps declared; AI crawlers allowed except `/api/` |
| **Canonical URLs** | Self-referential on all 57 public pages |
| **noindex** | Only `404.html` |
| **JSON-LD** | 57 blocks, 0 invalid (verified by `_verify_critical.cjs`) |
| **hreflang** | Market cluster (6 pages) + standalone `en` + `x-default` on other pages (parent commit) |
| **Redirects** | Unchanged in `vercel.json`, legacy `.html` → clean URLs, www → apex |

---

## Intentional pause (measurement phase rules)

Until owner provides GSC/GA4 exports and says **“Analyze my GSC/GA4 exports”**:

- [x] No new SEO, content, URL, title, H1, schema, canonical, or internal-link changes
- [x] No new analytics or tracking code changes unless a verified tracking bug is found
- [x] No invented keywords, search volume, rankings, or traffic causes
- [ ] Owner: mark `generate_lead` as Key event in GA4 Admin
- [ ] Owner: verify 1 `generate_lead` per test submission in Realtime
- [ ] Owner: export GSC CSVs to `seo/gsc/data/`
- [ ] Owner: fill baseline in `MEASUREMENT_BASELINE.md`

---

## Next step after baseline

When exports are ready, request:

**“Analyze my GSC/GA4 exports”**

Analysis will cover (evidence-based only):

1. Pages losing impressions 
2. Pages gaining impressions 
3. High-impression / low-CTR queries 
4. Queries in positions ~8–20 
5. Commercial-intent queries for existing services 
6. Irrelevant query/page matches 
7. Organic landing pages with poor engagement 
8. Organic landing pages with traffic but no leads 
9. Internal-linking opportunities 
10. Content gaps supported by actual search demand 

Recommendations will be tagged: 🟢 Safe fix | 🟡 Show me first | 🔴 Insufficient evidence

---

## Related docs

- `MEASUREMENT_BASELINE.md`, ongoing metrics checklist 
- `seo/gsc-baseline-workflow.txt`, GSC export workflow 
- `GA4_QUICK_REFERENCE.md`, GA4 setup reference 
