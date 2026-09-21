# KRIVA Measurement Baseline

**Purpose:** Track your business funnel with real data, not guesses.

**Funnel you care about:**

Google impressions → clicks → visitors → engaged visitors → inquiries/leads

**Property:** GA4 `G-FHG12KTF8C` · Search Console: `https://krivatechnologies.com`

---

## Step 1, Fix measurement first (do once after deploy)

### A. Confirm leads are tracking (5 minutes)

1. Open [Google Analytics](https://analytics.google.com) → your KRIVA property.
2. Open **Reports → Realtime** in another tab.
3. On your live site, submit a **test inquiry** (or use `/contact#book` with test data).
4. Within ~30 seconds you should see **`generate_lead`** in Realtime events.
5. You should **NOT** see `generate_lead` when you only **open** a form or click a CTA without submitting.

### B. Mark the conversion in GA4 Admin (required, cannot be done in website code)

1. GA4 → **Admin** (gear icon, bottom left).
2. **Events** → find **`generate_lead`**.
3. Toggle **Mark as key event** → ON.
4. **Important:** Mark **only `generate_lead`** as a Key event for lead counting.
 - Do **not** also mark `contact_form_submit`, `form_start`, `cta_click`, or `scroll` as Key events, that would inflate conversions.

### C. What each event means

| Event | Counts as a lead? | When it fires |
|-------|-------------------|---------------|
| `generate_lead` | **Yes** (your main conversion) | After a form is successfully submitted |
| `contact_form_submit` | No (diagnostic duplicate name) | Same moment as `generate_lead`, ignore for Key events |
| `form_start` | No | User focuses first field in a form |
| `cta_click` | No | User clicks Contact, fit call, brief, or #inquire link |
| `email_click` | No | User clicks a mailto link |
| `phone_click` | No | User clicks a tel link (if phone links exist) |
| `page_view` | No | Page loads |

---

## Step 2, Record your baseline (same day each week)

**Date:** _______________

### Google Search Console (last 28 days)

Path: **Performance → Search results**

| Metric | Your number |
|--------|-------------|
| Impressions | |
| Clicks | |
| CTR | |
| Average position | |
| Indexed pages (Indexing → Pages) | |

**Top 5 queries** (Performance → Queries):

| Query | Clicks | Impressions | CTR | Position |
|-------|--------|-------------|-----|----------|
| 1. | | | | |
| 2. | | | | |
| 3. | | | | |
| 4. | | | | |
| 5. | | | | |

**Top 5 pages** (Performance → Pages):

| Page | Clicks | Impressions |
|------|--------|-------------|
| 1. | | |
| 2. | | |
| 3. | | |
| 4. | | |
| 5. | | |

### GA4 (last 28 days)

Path: **Reports → Acquisition → Traffic acquisition**

| Metric | Your number |
|--------|-------------|
| Organic Search sessions | |
| Organic Search users | |
| Organic % of total traffic | |

Path: **Reports → Engagement → Events**

| Event | Count |
|-------|-------|
| `generate_lead` (Key events) | |
| `cta_click` | |
| `email_click` | |

**Lead rate (your formula):**

```
Organic lead rate = generate_lead ÷ Organic Search sessions × 100
```

| | Value |
|---|-------|
| Organic sessions | |
| generate_lead events | |
| **Lead rate %** | |

---

## Step 3, Export data for deeper analysis

Save exports to `seo/gsc/data/` (or paste into chat for review).

### From Google Search Console

Same date range for all exports (recommend **Last 3 months**).

| File to save | How to export |
|--------------|---------------|
| `queries.csv` | Performance → Search results → **Queries** tab → Export |
| `pages.csv` | Performance → Search results → **Pages** tab → Export |
| `countries.csv` | Performance → Search results → **Countries** tab → Export |

For trend comparison, also export **Pages** twice:

- Last 28 days → `pages-current.csv`
- Previous 28 days → `pages-previous.csv`

### From GA4

| What you need | How to get it |
|---------------|---------------|
| Organic landing pages | Reports → Engagement → **Landing page** + filter Source = google / organic |
| Engagement by page | Reports → Engagement → **Pages and screens** + compare Organic vs Direct |
| Lead breakdown | Reports → Engagement → **Events** → `generate_lead` → view `lead_type` parameter |

### After exporting GSC files

Run (optional, for automated summary):

```
node seo/gsc_analyze.cjs
```

---

## Step 4, Weekly CEO check (5 minutes)

Answer these four questions:

1. **Visibility:** Did GSC impressions go up, down, or stay flat vs last week?
2. **Traffic:** Did organic sessions go up, down, or stay flat?
3. **Quality:** Is organic engagement rate higher than Direct? (It should be.)
4. **Leads:** Did `generate_lead` Key events increase?

If impressions are up but leads are flat → focus on engagement and conversion pages, not new keywords yet.

If impressions are flat → wait for 4+ weeks of GSC data before major SEO changes.

---

## What NOT to do yet

- Do not rewrite page titles or content based on hunches.
- Do not create new pages for keywords you have not seen in GSC.
- Do not claim rankings improved without GSC Performance data.
- Do not mark multiple events as Key events (inflates lead count).

---

## Quick reference, site is technically ready when

- [ ] `https://krivatechnologies.com/sitemap.xml` loads (~57 URLs)
- [ ] `https://krivatechnologies.com/robots.txt` allows crawling
- [ ] GSC sitemap status = Success
- [ ] GA4 Realtime shows visitors
- [ ] Test form submit fires **one** `generate_lead`
- [ ] `generate_lead` marked as Key event in GA4 Admin

*Last updated: post-deployment measurement setup.*
