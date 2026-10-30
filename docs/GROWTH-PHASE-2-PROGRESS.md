# Growth Phase 2 — Progress (KRIVA Technologies)

**Last updated:** 2026-10-30  
**Audience:** Non-technical owner (Dixit)  
**Goal:** Qualified visitors from US, UK, UAE, Canada, Australia → real inquiries (`generate_lead`)

---

## Phase A — Analytics safety ✅ Done (no change needed)

| Item | Status |
|------|--------|
| Internal filter **Exclude KRIVA team** | **Testing only** — will **not** activate until you confirm office IP `103.81.93.111` (and any VPN/home IPs) |
| Single conversion in GA4 | **`generate_lead` only** |

---

## Phase B — Google Search Console 🟡 Ready to verify (one deploy)

### Easiest method: HTML file (recommended)

We added this file to the website project:

- **URL after deploy:** `https://krivatechnologies.com/googlea62b91d40c65d7c7.html`

Google shows this when you add a **URL-prefix** property for `https://krivatechnologies.com/`.

### Your part (≈2 minutes after deploy)

1. Open [Google Search Console](https://search.google.com/search-console).
2. **Add property** → choose **URL prefix** → enter `https://krivatechnologies.com/`.
3. Pick **HTML file** verification → Google will ask for `googlea62b91d40c65d7c7.html` (already in the repo).
4. Click **Verify** (only works **after** the site is deployed to Vercel/production).
5. Tell me when verify succeeds — I will link Search Console to GA4 (**Admin → Product links → Search Console links**).

### Why verification failed before

- The HTML file was **not on the live site** (404).
- Google’s “Analytics tag” check often **misses** your tag because the ID is set via JavaScript (`var id='G-FHG12KTF8C'`), not plain text in HTML.

### After link (what you gain)

- Real **queries, impressions, clicks, CTR, position** (no guessing).
- Indexing and **Core Web Vitals** per URL.
- Organic landing-page performance tied to **Generate leads** in GA4.

---

## Phase C — SEO & organic growth audit (why qualified traffic is low)

**Data we have today (GA4, last 28 days — not Search Console):**

| Signal | Finding |
|--------|---------|
| Volume | ~62 users / 79 sessions — too small to optimize conversions alone |
| US | Largest country, **~1s engagement**, **0 leads** — likely low-intent or bot-heavy, not product-market proof |
| UK / UAE / AU | **0 users** in period (AU had **no `/markets/au` page** until this phase) |
| Organic | Google ~6 users, **0 organic leads** |
| Landing | **~89%** of sessions start on **homepage**; service/solution pages almost never land from search |

**Root causes (site + market, not “broken analytics”):**

1. **No Search Console** → you cannot see which queries you almost rank for or which pages Google shows.
2. **Young / low authority domain** on competitive terms (e.g. “custom software development”, “web agency”).
3. **Niche strength** (trucking dispatch CRM, TMS, Xero/QuickBooks integrations) is **under-linked** from homepage SEO to dedicated landing URLs.
4. **Australia gap:** hreflang referenced `en-AU` but there was **no Australian market URL** — confusing for Google.
5. **Homepage bounce ~57%** with short engagement — visitors who arrive often leave before **Book fit call** / **Brief**.

**Implemented in repo (pending your deploy approval):**

- New **`/markets/au`** page (matches US/UK/UAE/CA pattern).
- Homepage + markets hub link to Australia.
- **`hreflang` `en-au`** on all market pages.
- Sitemap updated (**58** public URLs, includes `/markets/au`).
- Web development service hero: **fit call + brief** buttons above the fold.

---

## Phase D — Landing pages & CTAs

| Area | Already strong | Improved this phase |
|------|----------------|---------------------|
| Homepage | Fit call + brief throughout, mobile sticky bar | Australia market tile |
| Solutions (e.g. trucking) | Multiple CTAs | — (audit: keep; add GSC after deploy) |
| Services | Nav CTAs | Web dev hero: primary **Book** / **Brief** |
| Industries | CTA band | — |
| Markets | Per-country CTAs | **Australia** page + hub row |

**Next (after deploy + GSC data):** tune titles/meta on top **money URLs** using actual queries (not before GSC).

---

## Phase E — Keywords & content gaps (strategy, not invented rankings)

Focus **commercial intent** aligned with KRIVA’s proof:

| Market | Priority themes | Best existing URLs |
|--------|-------------------|-------------------|
| **US** | dispatch CRM software, custom TMS development, fleet dashboard, trucking automation | `/solutions/trucking-logistics`, `/services/crm-development`, `/markets/us` |
| **UK** | B2B SaaS MVP, Xero integration, onboarding UX | `/solutions/saas`, `/solutions/accounting-integrations`, `/markets/uk`, insight guides |
| **UAE** | logistics ops software, fleet platforms | `/markets/uae`, `/solutions/trucking-logistics` |
| **Canada** | dispatch + QuickBooks/Xero | `/markets/ca`, `/solutions/accounting-integrations` |
| **Australia** | dispatch CRM, **Xero**-heavy finance sync | **`/markets/au`** (new), `/solutions/accounting-integrations` |

**Content gaps (future, approve before large builds):**

- More **insight articles** targeting long-tail (e.g. “dispatch CRM vs TMS”, “Xero freight reconciliation”).
- Optional US/UK **city or state** pages (listed in `SEO-AUDIT-REPORT.md`) — only after hub pages convert.

---

## Phase F — Mobile

| GA4 (28d) | Note |
|-----------|------|
| Mobile **12** users, **1** key event | Desktop drives almost all recorded leads |
| Homepage | Sticky **Book / Brief** bar exists (`hp-mob-bar`) |

**Checks after deploy:** run URL Inspection on homepage + `/contact` in GSC (mobile usability). Field CWV requires GSC + traffic volume.

---

## What you need to approve

1. **Deploy to production** (Vercel) so GSC HTML file and `/markets/au` go live.  
   Reply: **“Approve deploy”** and I can guide git push / Vercel, or you deploy from your usual workflow.

2. **Later:** confirm office IP(s) to activate internal traffic filter (optional).

---

## Files changed (this phase)

- `googlea62b91d40c65d7c7.html` — Search Console verification
- `kriva-market-au.html`, `vercel.json`, `sitemap.xml`
- `kriva-redesign.html`, `kriva-markets-index.html`
- Market pages: `en-au` hreflang + Australia in market switcher
- `kriva-service-web-development.html` — hero CTAs
- This document
